import { useEffect } from 'react';
import type { ToolFaq } from '@/src/config/tools';

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  faqs?: ToolFaq[];
  robots?: string;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function SeoHead({
  title,
  description,
  path,
  faqs,
  robots = 'index, follow, max-image-preview:large',
}: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    const configuredSiteUrl = import.meta.env.VITE_SITE_URL;
    const siteOrigin = configuredSiteUrl
      ? new URL(configuredSiteUrl).origin
      : window.location.origin;
    const canonicalUrl = new URL(path, `${siteOrigin}/`).href;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', `${siteOrigin}/og-image.svg`);
    upsertMeta('property', 'og:image:alt', 'Imagix browser-based image tools');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', `${siteOrigin}/og-image.svg`);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const existingLd = document.head.querySelector('script[data-route-ld="true"]');
    if (existingLd) existingLd.remove();

    if (faqs && faqs.length > 0) {
      const ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.setAttribute('data-route-ld', 'true');
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      });
      document.head.appendChild(ld);
    }
  }, [title, description, path, faqs, robots]);

  return null;
}
