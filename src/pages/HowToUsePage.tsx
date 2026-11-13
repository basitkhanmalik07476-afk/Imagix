import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Download,
  LayoutGrid,
  Monitor,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
  UserCheck,
  Zap,
} from 'lucide-react';
import { ToolIcon } from '@/src/components/icons/ToolIcon';
import { SeoHead } from '@/src/components/seo/SeoHead';
import { PAGE_SEO } from '@/src/config/seo';

const CORE_STEPS = [
  {
    step: 'Step 01',
    icon: UploadCloud,
    title: 'Load Your Images',
    description:
      'Drag and drop one or multiple images into the dashed upload area, click anywhere inside to browse files, or paste directly with Ctrl+V / Cmd+V.',
    detail: 'Supports JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, and ICO up to 50 MB each.',
  },
  {
    step: 'Step 02',
    icon: SlidersHorizontal,
    title: 'Adjust Settings or Switch Tools',
    description:
      'Set compression quality from 1–100%, choose an output format, resize by pixels or presets, or crop aspect ratios—all using the same shared queue.',
    detail: 'Switch between Workbench tabs at the top without re-uploading your files.',
  },
  {
    step: 'Step 03',
    icon: Download,
    title: 'Verify & Export Clean Output',
    description:
      'Inspect image clarity using the interactive Before/After slider and exact byte savings measured directly from the output Blob, then download single files or a ZIP.',
    detail: 'Everything runs in local browser memory with zero server uploads.',
  },
];

const FEATURE_CARDS = [
  {
    index: '01',
    icon: Zap,
    title: 'Fast & Lightweight',
    description:
      'All tools are optimized for speed and run instantly without unnecessary scripts or bloat.',
  },
  {
    index: '02',
    icon: Monitor,
    title: '100% Browser-Based',
    description:
      'Everything runs directly in your browser. No servers, no uploads, no waiting.',
  },
  {
    index: '03',
    icon: ShieldCheck,
    title: 'Privacy First',
    description:
      'Your code and files never leave your device. No tracking, no data storage.',
  },
  {
    index: '04',
    icon: Code2,
    title: 'Built for Developers',
    description:
      'Designed by a developer who understands real-world workflows and pain points.',
  },
  {
    index: '05',
    icon: LayoutGrid,
    title: 'Clean & Modern UI',
    description:
      'Focused, distraction-free interfaces that help you get things done faster.',
  },
  {
    index: '06',
    icon: UserCheck,
    title: 'No Signup Required',
    description:
      'Use tools instantly without creating accounts or sharing personal information.',
  },
];

const TASK_GUIDES = [
  {
    slug: 'image-compressor',
    path: '/tools/image-compressor',
    title: 'Compressing Photos & Batch Assets',
    points: [
      'Start at 75–85% quality for sharp web photographs with significant size savings.',
      'Use Bulk Image Compressor to optimize dozens of mixed JPG, PNG, WebP, or GIF files at once.',
      'Click "Download All (ZIP)" when processing multiple assets in a single batch.',
    ],
  },
  {
    slug: 'image-converter',
    path: '/tools/image-converter',
    title: 'Converting Formats & Transparency',
    points: [
      'Convert JPG photos to WebP or AVIF for lighter web pages and faster load times.',
      'When converting transparent PNG or WebP images to JPG or BMP, choose a matte background color to avoid black edges.',
      'Browser encoder availability is checked automatically before export.',
    ],
  },
  {
    slug: 'image-resizer',
    path: '/tools/image-resizer',
    title: 'Resizing & Cropping for Exact Dimensions',
    points: [
      'Use Pixel, Percentage, or Social/Web presets in the Image Resizer powered by Lanczos3 filtering.',
      'In the Image Cropper, frame 1:1, 16:9, 4:3, or custom ratios, then click "Apply Crop to Queue" to pass the cropped image straight into compression.',
      'Rotate 90°/custom angles or flip horizontally/vertically in dedicated transform workspaces.',
    ],
  },
  {
    slug: 'image-metadata-viewer',
    path: '/tools/image-metadata-viewer',
    title: 'Inspecting Metadata, Magic Bytes & Base64',
    points: [
      'Open Metadata Viewer to check embedded camera EXIF settings and GPS coordinates, then export a clean metadata-free copy.',
      'Use Image Format Detector to verify true binary file signatures and catch renamed extensions.',
      'Encode assets to Base64 Data URIs, CSS rules, or HTML snippets in Image to Base64.',
    ],
  },
];

export function HowToUsePage() {
  return (
    <>
      <SeoHead {...PAGE_SEO.howToUse} />

      {/* Page Header */}
      <section className="border-b border-[#ebe6db] bg-gradient-to-b from-white via-[#fbf9f5] to-[#fbf9f5] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-wider text-[#0e7c5b]">
            How It Works · Browser Image Studio
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-[#181a18] sm:text-5xl [text-wrap:balance]">
            How <span className="text-[#0e7c5b]">Imagix</span> Works
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#555955]">
            Built for speed, complete privacy, and clean workflows—run every optimization directly in your browser without uploads or accounts.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/tools/image-compressor"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0e7c5b] px-5.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(14,124,91,0.2)] hover:bg-[#095e44] transition-colors"
            >
              <span>Open Image Compressor</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/tools"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d9d3c5] bg-white px-5.5 text-sm font-semibold text-[#181a18] hover:border-[#0e7c5b]/45 hover:bg-[#faf8f3] transition-colors"
            >
              <span>Browse All 23 Tools</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6 Core Platform Cards */}
      <section className="border-b border-[#ebe6db] bg-[#fbf9f5] py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#181a18] sm:text-3xl [text-wrap:balance]">
              Built for Speed, Privacy, and <span className="text-[#0e7c5b]">Real Workflows</span>
            </h2>
            <p className="mt-2.5 text-sm text-[#555955] sm:text-base">
              Everything is engineered to stay lightweight, private, and ready the moment you open a tool.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group flex flex-col justify-between rounded-2xl border border-[#e6e1d6] bg-white p-7 transition-all duration-150 hover:border-[#0e7c5b]/45 hover:shadow-[0_18px_42px_-24px_rgba(14,124,91,0.22)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d5ebe0] bg-[#ebf5f0] text-[#0e7c5b] transition-colors group-hover:border-[#0e7c5b] group-hover:bg-[#0e7c5b] group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs font-semibold tabular-nums text-[#8d928b]">
                        {card.index}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-lg font-bold text-[#181a18]">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#555955]">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3 Core Steps */}
      <section className="border-b border-[#ebe6db] bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#181a18] sm:text-3xl">
              Three Steps to Clean Output
            </h2>
            <p className="mt-2 text-sm text-[#555955] sm:text-base">
              Every Imagix workspace follows the same predictable, fast workflow.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {CORE_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="flex flex-col justify-between rounded-2xl border border-[#e6e1d6] bg-[#fbf9f5]/70 p-7"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d5ebe0] bg-[#ebf5f0] text-[#0e7c5b]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#0e7c5b]">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold text-[#181a18]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#555955]">
                      {item.description}
                    </p>
                  </div>
                  <p className="mt-5 border-t border-[#ebe6db] pt-4 text-xs leading-relaxed text-[#646862]">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Task-by-Task Practical Guides */}
      <section className="bg-[#fbf9f5] py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#181a18] sm:text-3xl">
              Workflow Guides by Task
            </h2>
            <p className="mt-2 text-sm text-[#555955] sm:text-base">
              Recommended settings and practical shortcuts for common image tasks.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {TASK_GUIDES.map((guide) => (
              <div
                key={guide.slug}
                className="flex flex-col justify-between rounded-2xl border border-[#e6e1d6] bg-white p-7"
              >
                <div>
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d5ebe0] bg-[#ebf5f0] text-[#0e7c5b]">
                      <ToolIcon slug={guide.slug} size="sm" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-[#181a18]">
                      {guide.title}
                    </h3>
                  </div>

                  <ul className="mt-5 space-y-2.5">
                    {guide.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#484c48]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0e7c5b]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Link
                    to={guide.path}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2ddd1] bg-white px-3.5 py-2 text-xs font-semibold text-[#181a18] hover:border-[#0e7c5b] hover:bg-[#0e7c5b] hover:text-white transition-colors"
                  >
                    <span>Launch Tool</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
