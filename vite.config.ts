import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { TOOLS_REGISTRY } from './src/config/tools.ts';
import { PAGE_SEO } from './src/config/seo.ts';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

interface SeoRoute {
  path: string;
  title: string;
  description: string;
  faqs?: Array<{ q: string; a: string }>;
  toolName?: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function setMetaTag(html: string, attribute: 'name' | 'property', key: string, value: string) {
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  const existingTag = new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}=["']${key}["'])[^>]*>`,
    'i'
  );
  return existingTag.test(html)
    ? html.replace(existingTag, tag)
    : html.replace('</head>', `  ${tag}\n  </head>`);
}

function setCanonicalLink(html: string, href: string) {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  const existingLink = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i;
  return existingLink.test(html)
    ? html.replace(existingLink, tag)
    : html.replace('</head>', `  ${tag}\n  </head>`);
}

function appendJsonLd(html: string, data: unknown, marker: string) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const tag = `<script type="application/ld+json" data-static-route-ld="${marker}">${json}</script>`;
  return html.replace('</head>', `  ${tag}\n  </head>`);
}

function renderSeoHtml(html: string, route: SeoRoute, siteOrigin: string | null) {
  let output = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(route.title)}</title>`
  );
  output = setMetaTag(output, 'name', 'description', route.description);
  output = setMetaTag(output, 'property', 'og:title', route.title);
  output = setMetaTag(output, 'property', 'og:description', route.description);
  output = setMetaTag(output, 'name', 'twitter:title', route.title);
  output = setMetaTag(output, 'name', 'twitter:description', route.description);

  if (siteOrigin) {
    const canonicalUrl = new URL(route.path, `${siteOrigin}/`).href;
    output = setCanonicalLink(output, canonicalUrl);
    output = setMetaTag(output, 'property', 'og:url', canonicalUrl);
    output = setMetaTag(output, 'property', 'og:image', `${siteOrigin}/og-image.svg`);
    output = setMetaTag(output, 'name', 'twitter:image', `${siteOrigin}/og-image.svg`);
  }

  if (route.faqs?.length) {
    output = appendJsonLd(
      output,
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: route.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
      'faq'
    );
  }

  if (siteOrigin && route.toolName) {
    output = appendJsonLd(
      output,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteOrigin}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'All Tools',
            item: `${siteOrigin}/tools`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: route.toolName,
            item: new URL(route.path, `${siteOrigin}/`).href,
          },
        ],
      },
      'breadcrumbs'
    );
  }

  const noScriptContent = `<noscript><main><h1>${escapeHtml(route.toolName ?? route.title)}</h1><p>${escapeHtml(route.description)}</p><p><a href="/tools">Browse all image tools</a></p></main></noscript>`;
  return output.replace('</body>', `  ${noScriptContent}\n  </body>`);
}

function getSiteOrigin(rawUrl?: string) {
  if (!rawUrl) return null;

  const url = new URL(rawUrl);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error('VITE_SITE_URL must use HTTPS outside localhost.');
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must be an origin without a path, query, or hash.');
  }

  return url.origin;
}

function staticSeoPlugin(siteOrigin: string | null): Plugin {
  const routes: SeoRoute[] = [
    PAGE_SEO.home,
    PAGE_SEO.tools,
    PAGE_SEO.howToUse,
    ...TOOLS_REGISTRY.map((tool) => ({
      path: tool.path,
      title: tool.seoTitle,
      description: tool.seoDescription,
      faqs: tool.faqs,
      toolName: tool.name,
    })),
  ];

  return {
    name: 'imagix-static-seo',
    apply: 'build',
    writeBundle(outputOptions) {
      const outputDir = outputOptions.dir ?? path.resolve(projectRoot, 'dist');
      const indexPath = path.join(outputDir, 'index.html');
      if (!fs.existsSync(indexPath)) {
        throw new Error('Could not generate route SEO pages because index.html was not emitted.');
      }

      const baseHtml = fs.readFileSync(indexPath, 'utf8');
      const homeRoute = routes.find((route) => route.path === '/');
      if (!homeRoute) {
        throw new Error('Homepage SEO metadata is missing.');
      }
      fs.writeFileSync(indexPath, renderSeoHtml(baseHtml, homeRoute, siteOrigin), 'utf8');

      for (const route of routes) {
        if (route.path === '/') continue;

        const routeIndexPath = path.join(
          outputDir,
          route.path.replace(/^\//, ''),
          'index.html'
        );
        fs.mkdirSync(path.dirname(routeIndexPath), { recursive: true });
        fs.writeFileSync(routeIndexPath, renderSeoHtml(baseHtml, route, siteOrigin), 'utf8');
      }

      const sitemapLine = siteOrigin ? `Sitemap: ${siteOrigin}/sitemap.xml\n` : '';
      fs.writeFileSync(
        path.join(outputDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n${sitemapLine}`,
        'utf8'
      );

      if (!siteOrigin) {
        console.warn(
          '[SEO] VITE_SITE_URL is unset; production sitemap and canonical URLs will be omitted.'
        );
        return;
      }

      const urls = routes
        .map((route) => {
          const location = escapeXml(new URL(route.path, `${siteOrigin}/`).href);
          return `  <url><loc>${location}</loc></url>`;
        })
        .join('\n');
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urls,
        '</urlset>',
        '',
      ].join('\n');
      fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap, 'utf8');
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, 'VITE_');
  const siteOrigin = getSiteOrigin(env.VITE_SITE_URL);

  return {
    plugins: [react(), tailwindcss(), staticSeoPlugin(siteOrigin)],
    resolve: {
      alias: {
        '@': projectRoot,
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
