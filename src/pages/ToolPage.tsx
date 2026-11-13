import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ToolIcon } from '@/src/components/icons/ToolIcon';
import { SeoHead } from '@/src/components/seo/SeoHead';
import { ToolSwitcherBar } from '@/src/components/workspace/ToolSwitcherBar';
import { findToolBySlug, TOOLS_REGISTRY } from '@/src/config/tools';

const Base64ToImageWorkspace = lazy(() =>
  import('@/src/components/tools/Base64ToImageWorkspace').then((module) => ({
    default: module.Base64ToImageWorkspace,
  }))
);
const CompressorWorkspace = lazy(() =>
  import('@/src/components/tools/CompressorWorkspace').then((module) => ({
    default: module.CompressorWorkspace,
  }))
);
const ConverterWorkspace = lazy(() =>
  import('@/src/components/tools/ConverterWorkspace').then((module) => ({
    default: module.ConverterWorkspace,
  }))
);
const CropperWorkspace = lazy(() =>
  import('@/src/components/tools/CropperWorkspace').then((module) => ({
    default: module.CropperWorkspace,
  }))
);
const FormatDetectorWorkspace = lazy(() =>
  import('@/src/components/tools/FormatDetectorWorkspace').then((module) => ({
    default: module.FormatDetectorWorkspace,
  }))
);
const ImageToBase64Workspace = lazy(() =>
  import('@/src/components/tools/ImageToBase64Workspace').then((module) => ({
    default: module.ImageToBase64Workspace,
  }))
);
const MetadataWorkspace = lazy(() =>
  import('@/src/components/tools/MetadataWorkspace').then((module) => ({
    default: module.MetadataWorkspace,
  }))
);
const ResizerWorkspace = lazy(() =>
  import('@/src/components/tools/ResizerWorkspace').then((module) => ({
    default: module.ResizerWorkspace,
  }))
);
const TransformWorkspace = lazy(() =>
  import('@/src/components/tools/TransformWorkspace').then((module) => ({
    default: module.TransformWorkspace,
  }))
);

export function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? findToolBySlug(slug) : undefined;

  if (!tool) {
    return (
      <>
        <SeoHead
          title="Tool Not Found | Imagix"
          description="The Imagix tool page you requested could not be found."
          path={`/tools/${slug ?? ''}`}
          robots="noindex, follow"
        />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-[#181a18]">
            Tool Not Found
          </h1>
          <p className="mt-2 text-sm text-[#555955]">
            The requested tool route does not exist.
          </p>
          <Link
            to="/tools"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0e7c5b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#095e44]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Browse All Tools</span>
          </Link>
        </div>
      </>
    );
  }

  const relatedTools = TOOLS_REGISTRY.filter(
    (t) => t.category === tool.category && t.slug !== tool.slug
  ).slice(0, 4);

  const renderWorkspace = () => {
    switch (tool.kind) {
      case 'compressor':
        return (
          <CompressorWorkspace
            key={tool.slug}
            toolSlug={tool.slug}
            defaultTargetFormat={tool.defaultTargetFormat}
            lockedTargetFormat={tool.lockedTargetFormat}
          />
        );
      case 'converter':
        return (
          <ConverterWorkspace
            key={tool.slug}
            toolSlug={tool.slug}
            defaultSourceFormat={tool.defaultSourceFormat}
            defaultTargetFormat={tool.defaultTargetFormat ?? 'webp'}
          />
        );
      case 'resizer':
        return <ResizerWorkspace key={tool.slug} />;
      case 'cropper':
        return <CropperWorkspace key={tool.slug} />;
      case 'rotator':
        return <TransformWorkspace key={tool.slug} mode="rotate" />;
      case 'flipper':
        return <TransformWorkspace key={tool.slug} mode="flip" />;
      case 'metadata':
        return <MetadataWorkspace key={tool.slug} />;
      case 'image-to-base64':
        return <ImageToBase64Workspace key={tool.slug} />;
      case 'base64-to-image':
        return <Base64ToImageWorkspace key={tool.slug} />;
      case 'format-detector':
        return <FormatDetectorWorkspace key={tool.slug} />;
    }
  };

  return (
    <>
      <SeoHead
        title={tool.seoTitle}
        description={tool.seoDescription}
        path={tool.path}
        faqs={tool.faqs}
      />

      <ToolSwitcherBar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 border-b border-[#e6e1d6] pb-6">
          <div className="flex items-center gap-2 text-xs text-[#646862]">
            <Link to="/" className="hover:text-[#0e7c5b]">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/tools" className="hover:text-[#0e7c5b]">
              Tools
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-[#181a18]">{tool.name}</span>
          </div>

          <div className="mt-3 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d5ebe0] bg-[#ebf5f0] text-[#0e7c5b]">
              <ToolIcon slug={tool.slug} size="md" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#181a18] sm:text-3xl">
                {tool.name}
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#555955]">
                {tool.description}
              </p>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <div role="status" className="rounded-2xl border border-[#e6e1d6] bg-white p-8 text-center text-sm text-[#555955]">
              Loading image tool...
            </div>
          }
        >
          {renderWorkspace()}
        </Suspense>

        {tool.faqs.length > 0 && (
          <section className="mt-14 border-t border-[#e6e1d6] pt-10">
            <h2 className="font-display text-lg font-bold text-[#181a18]">
              {tool.name} Technical Notes
            </h2>
            <dl className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
              {tool.faqs.map((faq) => (
                <div key={faq.q}>
                  <dt className="text-sm font-semibold text-[#181a18]">
                    {faq.q}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[#555955]">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {relatedTools.length > 0 && (
          <section className="mt-12 border-t border-[#e6e1d6] pt-8">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold text-[#181a18]">
                Related Tools
              </h2>
              <Link
                to="/tools"
                className="text-xs font-semibold text-[#0e7c5b] hover:underline"
              >
                All 23 tools →
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map((rel) => (
                <Link
                  key={rel.slug}
                  to={rel.path}
                  className="group flex items-center gap-3 rounded-2xl border border-[#e6e1d6] bg-white p-4 transition-colors hover:border-[#0e7c5b]/50 hover:bg-[#faf8f3]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ebf5f0] text-[#0e7c5b] group-hover:bg-[#0e7c5b] group-hover:text-white transition-colors">
                    <ToolIcon slug={rel.slug} size="xs" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold text-[#181a18] group-hover:text-[#0e7c5b] truncate">
                      {rel.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[#646862]">
                      {rel.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#9aa096] group-hover:text-[#0e7c5b]" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
