import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileCheck2,
  Layers,
  Monitor,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { ToolIcon } from '@/src/components/icons/ToolIcon';
import { SeoHead } from '@/src/components/seo/SeoHead';
import { ImageDropzone } from '@/src/components/workspace/ImageDropzone';
import { PAGE_SEO } from '@/src/config/seo';
import { POPULAR_TOOLS } from '@/src/config/tools';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { ALL_FORMATS, FORMAT_CATALOG } from '@/src/types/image';

const VALUE_PILLARS = [
  {
    icon: Zap,
    title: 'Fast & Lightweight',
    description:
      'Compression runs inside non-blocking Web Workers and Lanczos3 Canvas pipelines with zero upload queue.',
  },
  {
    icon: Monitor,
    title: '100% Browser-Based',
    description:
      'Every codec executes directly inside your browser tab. No accounts, no waiting rooms, no server bottlenecks.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    description:
      'Your images never leave your device. Inspect EXIF tags and export stripped, GPS-free files locally.',
  },
  {
    icon: Layers,
    title: 'Built for Production',
    description:
      'Batch compress dozens of assets into a single ZIP, handle PNG alpha mattes cleanly, and verify byte savings.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Clean & Focused UI',
    description:
      'Distraction-free workspaces with real-time before/after split sliders and exact Blob output readouts.',
  },
  {
    icon: FileCheck2,
    title: '8 Format Codecs',
    description:
      'Verified magic-byte header checks across JPG, PNG, WebP, AVIF, animated GIF, BMP, TIFF, and ICO.',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { capabilities, capabilityError } = useWorkspace();

  return (
    <>
      <SeoHead {...PAGE_SEO.home} />

      {/* Centered Clear-Mode Hero */}
      <section className="relative overflow-hidden border-b border-[#ebe6db] bg-gradient-to-b from-white via-[#fbf9f5] to-[#fbf9f5] pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 max-w-4xl bg-[radial-gradient(ellipse_at_top,rgba(14,124,91,0.08),transparent_70%)]"
        />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-wider text-[#0e7c5b]">
            Browser Image Studio · 100% Client-Side
          </p>

          <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-extrabold tracking-[-0.03em] text-[#181a18] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08] [text-wrap:balance]">
            Everything Your Images Need.{' '}
            <span className="text-[#0e7c5b]">
              All in One Place.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#555955] sm:text-[17px]">
            From compression and conversion to resizing and optimization, discover everything you need to manage, enhance, and perfect your images — all with fast, easy, and privacy-focused tools.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#tools-grid"
              className="inline-flex h-11.5 items-center justify-center gap-2 rounded-xl bg-[#0e7c5b] px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(14,124,91,0.2)] hover:bg-[#095e44] transition-colors whitespace-nowrap"
            >
              <span>Explore Tools</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/how-to-use"
              className="inline-flex h-11.5 items-center justify-center gap-2 rounded-xl border border-[#d9d3c5] bg-white px-6 text-sm font-semibold text-[#181a18] hover:border-[#0e7c5b]/45 hover:bg-[#faf8f3] transition-colors whitespace-nowrap"
            >
              <span>See How It Works</span>
            </Link>
          </div>

          <p className="mt-5 text-xs text-[#646862]">
            No signup required · Runs fully in your browser · Up to 50 MB per image
          </p>

          {/* Clean Centered Dashed Upload Dropzone */}
          <div className="mx-auto mt-10 max-w-3xl">
            <ImageDropzone
              variant="hero"
              onFilesAdded={() => navigate('/tools/image-compressor')}
            />
          </div>
        </div>
      </section>

      {/* Popular Tools — Clean 3x3 Airy White Card Grid */}
      <section id="tools-grid" className="border-b border-[#ebe6db] bg-[#fbf9f5] py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#181a18] sm:text-4xl [text-wrap:balance]">
              Tools We <span className="text-[#0e7c5b]">Built for You</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#555955] sm:text-base">
              Each tool is fast, reliable, and easy to use—no signups, no tracking, just clean results.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {POPULAR_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                to={tool.path}
                className="group flex flex-col justify-between rounded-2xl border border-[#e6e1d6] bg-white p-7 transition-all duration-150 hover:border-[#0e7c5b]/45 hover:shadow-[0_18px_42px_-24px_rgba(14,124,91,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]"
              >
                <div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d5ebe0] bg-[#ebf5f0] text-[#0e7c5b] transition-colors group-hover:border-[#0e7c5b] group-hover:bg-[#0e7c5b] group-hover:text-white">
                    <ToolIcon slug={tool.slug} size="sm" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-[#181a18] group-hover:text-[#0e7c5b] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#555955]">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2ddd1] bg-white px-3.5 py-2 text-xs font-semibold text-[#181a18] transition-colors group-hover:border-[#0e7c5b] group-hover:bg-[#0e7c5b] group-hover:text-white">
                    <span>Use Tool</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/tools"
              className="inline-flex h-10.5 items-center gap-2 rounded-xl border border-[#d9d3c5] bg-white px-5 text-xs font-semibold text-[#181a18] hover:border-[#0e7c5b] hover:text-[#0e7c5b] transition-colors"
            >
              <span>Browse all 23 image tools</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Teams Choose Imagix — Clean 3x2 Grid */}
      <section className="border-b border-[#ebe6db] bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#181a18] sm:text-4xl [text-wrap:balance]">
              Why Creators &amp; Teams{' '}
              <span className="text-[#0e7c5b]">Choose Imagix</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#555955] sm:text-base">
              We focus on building tools that respect your time, privacy, and image fidelity—so every export ships ready for production.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {VALUE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-[#e6e1d6] bg-[#fbf9f5]/70 p-7"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d5ebe0] bg-[#ebf5f0] text-[#0e7c5b]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-[#181a18]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#555955]">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Formats & Live Browser Capabilities */}
      <section className="bg-[#fbf9f5] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#181a18] sm:text-3xl">
                Supported Image Formats
              </h2>
              <p className="mt-2 text-sm text-[#555955]">
                Live codec support detected directly inside your current browser environment.
              </p>
            </div>
            <Link
              to="/tools/image-format-detector"
              className="text-sm font-semibold text-[#0e7c5b] hover:text-[#095e44] hover:underline whitespace-nowrap"
            >
              Inspect file magic bytes →
            </Link>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-[#e6e1d6] bg-white">
            {capabilityError && (
              <p role="alert" className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">
                Codec support could not be checked: {capabilityError}
              </p>
            )}
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#ebe6db] bg-[#fbf9f5] text-xs font-semibold text-[#555955]">
                <tr>
                  <th className="px-5 py-3.5">Format</th>
                  <th className="px-5 py-3.5">Alpha Channel</th>
                  <th className="px-5 py-3.5">Compression</th>
                  <th className="px-5 py-3.5">Browser Encode</th>
                  <th className="px-5 py-3.5">Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebe6db]">
                {ALL_FORMATS.map((fmt) => {
                  const info = FORMAT_CATALOG[fmt];
                  const cap = capabilities?.[fmt];
                  return (
                    <tr key={fmt} className="hover:bg-[#fbf9f5]/70">
                      <td className="px-5 py-3.5 font-semibold text-[#181a18] whitespace-nowrap">
                        {info.label}
                      </td>
                      <td className="px-5 py-3.5 text-[#555955] whitespace-nowrap">
                        {info.supportsTransparency ? 'Supported' : 'Opaque only'}
                      </td>
                      <td className="px-5 py-3.5 text-[#555955] whitespace-nowrap">
                        {info.supportsLossy ? 'Configurable quality' : 'Lossless / Raw'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs">
                        {cap ? (
                          cap.encode ? (
                            <span className="font-semibold text-[#0e7c5b]">
                              Ready ({cap.engine})
                            </span>
                          ) : (
                            <span className="font-semibold text-amber-700">
                              Decode only
                            </span>
                          )
                        ) : (
                          <span className="text-[#787b75]">
                            {capabilityError ? 'Unavailable' : 'Checking...'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#555955]">
                        {cap?.note ?? info.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
