import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ScenarioItem {
  id: string;
  tabLabel: string;
  category: string;
  title: string;
  description: string;
  bullets: string[];
  toolPath: string;
  ctaLabel: string;
  presetConfig: Record<string, string | number | boolean>;
}

const SCENARIOS: ScenarioItem[] = [
  {
    id: 'ecommerce',
    tabLabel: 'E-Commerce',
    category: 'Product Catalogs & Storefronts',
    title: 'Fast Product Galleries Without Soft Textures',
    description:
      'Convert oversized supplier JPGs and transparent studio PNGs into uniform WebP assets that keep fabric grain and product edges crisp while cutting page weight.',
    bullets: [
      'Batch compress entire SKU folders in one ZIP',
      'Preserve PNG alpha channels or flatten to crisp white',
      'Inspect compression artifacts with split preview',
    ],
    toolPath: '/tools/jpg-to-webp',
    ctaLabel: 'Open JPG to WebP',
    presetConfig: {
      workflow: 'jpg-to-webp',
      quality: 80,
      alphaSupport: true,
      batchExport: 'zip',
    },
  },
  {
    id: 'web-perf',
    tabLabel: 'Web Performance',
    category: 'Core Web Vitals & LCP',
    title: 'Smaller Hero Payloads for Faster Page Loads',
    description:
      'Shrink heavy hero banners and editorial photography to optimal WebP or AVIF sizes before deploying to production.',
    bullets: [
      'Real Web Worker compression with zero server latency',
      'Exact byte and percentage reduction readouts',
      'Browser AVIF and WebP encoder verification',
    ],
    toolPath: '/tools/image-compressor',
    ctaLabel: 'Open Image Compressor',
    presetConfig: {
      workflow: 'image-compressor',
      quality: 75,
      workerOffload: true,
      outputReadout: 'exact-bytes',
    },
  },
  {
    id: 'social',
    tabLabel: 'Social Media',
    category: 'Marketing & Creators',
    title: 'Platform-Exact Dimensions in Seconds',
    description:
      'Resize and crop campaign visuals to exact Instagram, YouTube, LinkedIn, and Open Graph dimensions using Pica Lanczos3 resampling.',
    bullets: [
      'Built-in 1:1, 4:5, 16:9, and 9:16 crop presets',
      'Instagram, LinkedIn, YouTube, and OG presets',
      'Rotate, straighten, and mirror before export',
    ],
    toolPath: '/tools/image-resizer',
    ctaLabel: 'Open Image Resizer',
    presetConfig: {
      workflow: 'image-resizer',
      filter: 'Lanczos3',
      preset: '1200x630',
      aspectLock: true,
    },
  },
  {
    id: 'design-dev',
    tabLabel: 'Design & Dev',
    category: 'UI Engineering & Assets',
    title: 'Clean Favicons, Data URIs & Header Checks',
    description:
      'Generate Windows ICO favicons, inline small icons as Base64 CSS snippets, or inspect file magic bytes to catch misnamed MIME assets.',
    bullets: [
      'Encode images to Data URI, CSS url(), or HTML img',
      'Generate multi-compatible ICO icon containers',
      'Detect spoofed extensions via binary headers',
    ],
    toolPath: '/tools/image-format-detector',
    ctaLabel: 'Open Format Detector',
    presetConfig: {
      workflow: 'image-format-detector',
      check: 'magic-bytes',
      base64Export: 'data-uri',
    },
  },
  {
    id: 'privacy',
    tabLabel: 'Photography',
    category: 'EXIF Inspection & Privacy',
    title: 'Inspect Camera Settings & Strip GPS Data',
    description:
      'Read camera make, aperture, shutter speed, ISO, and embedded GPS coordinates—then export clean metadata-free copies before publishing online.',
    bullets: [
      'Parses EXIF, IPTC, XMP, ICC, and GPS tags',
      'One-click clean export removing location metadata',
      'Zero cloud uploads keep raw photos private',
    ],
    toolPath: '/tools/image-metadata-viewer',
    ctaLabel: 'Open Metadata Viewer',
    presetConfig: {
      workflow: 'image-metadata-viewer',
      parseTags: 'EXIF+GPS+ICC',
      stripExport: true,
    },
  },
];

export function ScenarioShowcase() {
  const [activeId, setActiveId] = useState(SCENARIOS[0].id);
  const current = SCENARIOS.find((s) => s.id === activeId) ?? SCENARIOS[0];

  return (
    <section className="border-b border-[#e8e3d9] bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#181a18] sm:text-3xl">
            Designed for Real-World Scenarios
          </h2>
          <p className="mt-2 text-sm text-[#555955] sm:text-base">
            Discover how teams, creators, and developers use Imagix across production workflows.
          </p>
        </div>

        {/* Scenario Pill Tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {SCENARIOS.map((item) => {
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                  active
                    ? 'border-[#0e7c5b] bg-[#0e7c5b] text-white'
                    : 'border-[#e2ddd1] bg-white text-[#484c48] hover:border-[#c9c2b2] hover:bg-[#faf8f3]'
                )}
              >
                {item.tabLabel}
              </button>
            );
          })}
        </div>

        {/* Active Scenario Panel */}
        <div className="mt-8 grid grid-cols-1 items-center gap-8 rounded-3xl border border-[#e6e1d6] bg-[#faf8f3] p-6 sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#0e7c5b]">
              {current.category}
            </p>
            <h3 className="font-display text-xl font-bold text-[#181a18] sm:text-2xl">
              {current.title}
            </h3>
            <p className="text-sm leading-relaxed text-[#555955]">
              {current.description}
            </p>
            <ul className="space-y-2 pt-1">
              {current.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2.5 text-sm text-[#2d302d]"
                >
                  <Check className="h-4 w-4 shrink-0 text-[#0e7c5b]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <Link
                to={current.toolPath}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0e7c5b] px-4.5 text-sm font-semibold text-white hover:bg-[#095e44] transition-colors shadow-[0_3px_10px_rgba(14,124,91,0.18)]"
              >
                <span>{current.ctaLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5">
              <p className="font-display text-xs font-semibold text-[#181a18]">
                Ready-to-use workflow
              </p>
              <p className="mt-0.5 text-xs text-[#646862]">
                Preset parameters for this scenario
              </p>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-[#ebe6db] bg-[#faf8f3] p-3.5 font-mono text-xs leading-relaxed text-[#242724]">
                {JSON.stringify(current.presetConfig, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
