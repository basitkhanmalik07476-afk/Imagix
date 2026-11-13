import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Crop,
  ImagePlus,
  Loader2,
  Search,
} from 'lucide-react';
import { ToolIcon } from '@/src/components/icons/ToolIcon';
import { Button } from '@/src/components/ui/button';
import { Slider } from '@/src/components/ui/slider';
import { BeforeAfterSlider } from '@/src/components/workspace/BeforeAfterSlider';
import { ImageDropzone } from '@/src/components/workspace/ImageDropzone';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { decodeFileToCanvas, encodeCanvasToFormat } from '@/src/lib/image/codecs';
import { compressWorkspaceImage } from '@/src/lib/image/compressor';
import { resizeWorkspaceImage } from '@/src/lib/image/resizer';
import { fetchStudioSampleFile } from '@/src/lib/sampleLoader';
import { cn, computeSavings, formatBytes, stripExtension, triggerBlobDownload } from '@/src/lib/utils';
import { ALL_FORMATS, FORMAT_CATALOG, type ImageFormat } from '@/src/types/image';

type StudioFilter = 'popular' | 'optimize' | 'convert' | 'edit';

interface StudioToolOption {
  id: string;
  slug: string;
  label: string;
  category: Exclude<StudioFilter, 'popular'>;
  isPopular: boolean;
  fullPath: string;
  mode: 'compress' | 'convert' | 'resize' | 'link-crop';
  defaultTarget?: ImageFormat;
  subtitle: string;
}

const STUDIO_TOOLS: StudioToolOption[] = [
  {
    id: 'compress',
    slug: 'image-compressor',
    label: 'Image Compressor',
    category: 'optimize',
    isPopular: true,
    fullPath: '/tools/image-compressor',
    mode: 'compress',
    subtitle: 'Reduce size 1–100%',
  },
  {
    id: 'jpg-to-webp',
    slug: 'jpg-to-webp',
    label: 'JPG to WebP',
    category: 'convert',
    isPopular: true,
    fullPath: '/tools/jpg-to-webp',
    mode: 'convert',
    defaultTarget: 'webp',
    subtitle: 'Modern web format',
  },
  {
    id: 'png-to-jpg',
    slug: 'png-to-jpg',
    label: 'PNG to JPG',
    category: 'convert',
    isPopular: true,
    fullPath: '/tools/png-to-jpg',
    mode: 'convert',
    defaultTarget: 'jpg',
    subtitle: 'Flatten transparency',
  },
  {
    id: 'webp-to-png',
    slug: 'webp-to-png',
    label: 'WebP to PNG',
    category: 'convert',
    isPopular: true,
    fullPath: '/tools/webp-to-png',
    mode: 'convert',
    defaultTarget: 'png',
    subtitle: 'Lossless alpha PNG',
  },
  {
    id: 'convert',
    slug: 'image-converter',
    label: 'Image Converter',
    category: 'convert',
    isPopular: true,
    fullPath: '/tools/image-converter',
    mode: 'convert',
    defaultTarget: 'webp',
    subtitle: '8 supported formats',
  },
  {
    id: 'resize',
    slug: 'image-resizer',
    label: 'Image Resizer',
    category: 'edit',
    isPopular: true,
    fullPath: '/tools/image-resizer',
    mode: 'resize',
    subtitle: 'Lanczos3 pixel scale',
  },
  {
    id: 'crop',
    slug: 'image-cropper',
    label: 'Image Cropper',
    category: 'edit',
    isPopular: true,
    fullPath: '/tools/image-cropper',
    mode: 'link-crop',
    subtitle: 'Ratios, rotate & flip',
  },
  {
    id: 'bulk-compress',
    slug: 'bulk-image-compressor',
    label: 'Bulk Compressor',
    category: 'optimize',
    isPopular: true,
    fullPath: '/tools/bulk-image-compressor',
    mode: 'compress',
    subtitle: 'Multi-file ZIP export',
  },
];

export function HomepageStudio() {
  const { items, selectedItem, addFiles, updateItem } = useWorkspace();
  const [filter, setFilter] = useState<StudioFilter>('popular');
  const [search, setSearch] = useState('');
  const [selectedToolId, setSelectedToolId] = useState<string>('compress');
  const [quality, setQuality] = useState(75);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('webp');
  const [resizeScale, setResizeScale] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  const activeTool =
    STUDIO_TOOLS.find((t) => t.id === selectedToolId) ?? STUDIO_TOOLS[0];

  const visibleTools = useMemo(() => {
    const q = search.trim().toLowerCase();
    return STUDIO_TOOLS.filter((t) => {
      if (filter === 'popular' && !t.isPopular) return false;
      if (filter !== 'popular' && t.category !== filter) return false;
      if (!q) return true;
      return t.label.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q);
    });
  }, [filter, search]);

  const handleSelectTool = (tool: StudioToolOption) => {
    setSelectedToolId(tool.id);
    if (tool.defaultTarget) {
      setTargetFormat(tool.defaultTarget);
    }
  };

  const handleLoadStudioSample = async () => {
    if (loadingSample) return;
    setLoadingSample(true);
    try {
      const file = await fetchStudioSampleFile();
      await addFiles([file]);
    } finally {
      setLoadingSample(false);
    }
  };

  const runStudioAction = async () => {
    if (!selectedItem || isProcessing) return;
    setIsProcessing(true);
    updateItem(selectedItem.id, (curr) => ({
      ...curr,
      status: 'processing',
      progress: 25,
      errorMessage: undefined,
    }));

    try {
      let output: {
        blob: Blob;
        width: number;
        height: number;
        format: ImageFormat;
        durationMs: number;
        filename: string;
      };

      if (activeTool.mode === 'compress') {
        output = await compressWorkspaceImage(selectedItem, { quality });
      } else if (activeTool.mode === 'convert') {
        const start = performance.now();
        const { canvas } = await decodeFileToCanvas(
          selectedItem.file,
          selectedItem.detectedFormat
        );
        const blob = await encodeCanvasToFormat(canvas, targetFormat, {
          quality: quality / 100,
          matteColor: '#ffffff',
        });
        output = {
          blob,
          width: canvas.width,
          height: canvas.height,
          format: targetFormat,
          durationMs: Math.round(performance.now() - start),
          filename: `${stripExtension(selectedItem.name)}.${FORMAT_CATALOG[targetFormat].extension}`,
        };
      } else {
        const targetW = Math.max(1, Math.round((selectedItem.width * resizeScale) / 100));
        const targetH = Math.max(1, Math.round((selectedItem.height * resizeScale) / 100));
        output = await resizeWorkspaceImage(selectedItem, {
          width: targetW,
          height: targetH,
          outputFormat: selectedItem.detectedFormat ?? 'png',
          quality,
        });
      }

      const url = URL.createObjectURL(output.blob);
      updateItem(selectedItem.id, (curr) => ({
        ...curr,
        status: 'done',
        progress: 100,
        result: { ...output, size: output.blob.size, url },
      }));
    } catch (err) {
      updateItem(selectedItem.id, (curr) => ({
        ...curr,
        status: 'error',
        progress: 0,
        errorMessage: err instanceof Error ? err.message : 'Processing failed.',
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const savings =
    selectedItem && selectedItem.result
      ? computeSavings(selectedItem.originalSize, selectedItem.result.size)
      : null;

  return (
    <section id="studio" className="border-b border-[#ebe6db] bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-wider text-[#0e7c5b]">
            Live Browser Workbench
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#181a18] sm:text-4xl [text-wrap:balance]">
            Test Any Workflow <span className="text-[#0e7c5b]">Right Here</span>
          </h2>
          <p className="mt-3 text-sm text-[#555955] sm:text-base">
            Pick a preset, drop or load a sample image, and compare output quality before downloading.
          </p>
        </div>

        {/* Single Unified Workbench Frame */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-[#e6e1d6] bg-white shadow-[0_20px_50px_-28px_rgba(20,35,28,0.1)]">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Controls Column */}
            <div className="lg:col-span-7 divide-y divide-[#ebe6db] lg:border-r lg:border-[#ebe6db]">
              {/* Workflow Picker Area */}
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#181a18]">
                      1. Choose a workflow
                    </h3>
                    <p className="text-xs text-[#646862]">
                      Switch compression, conversion, or resizing presets instantly.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#787b75]" />
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Find tool..."
                      aria-label="Search studio workflows"
                      className="h-9 w-full rounded-xl border border-[#e2ddd1] bg-[#faf8f3] pl-8 pr-2.5 text-xs text-[#181a18] placeholder:text-[#868982] focus:border-[#0e7c5b] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Segmented Filter Control */}
                <div className="mt-4 inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#e6e1d6] bg-[#f4f1ea] p-1">
                  {(
                    [
                      { id: 'popular', label: 'Popular' },
                      { id: 'optimize', label: 'Optimize' },
                      { id: 'convert', label: 'Convert' },
                      { id: 'edit', label: 'Resize & Crop' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilter(tab.id)}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                        filter === tab.id
                          ? 'bg-white text-[#0e7c5b] font-semibold shadow-2xs'
                          : 'text-[#555955] hover:text-[#181a18]'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tool Tiles Grid with bespoke ToolIcon */}
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {visibleTools.map((tool) => {
                    const active = tool.id === selectedToolId;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => handleSelectTool(tool)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]',
                          active
                            ? 'border-[#0e7c5b] bg-[#ebf5f0]/65'
                            : 'border-[#e6e1d6] bg-[#faf8f3]/50 hover:border-[#c9c2b2] hover:bg-white'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                            active
                              ? 'bg-[#0e7c5b] text-white'
                              : 'bg-white border border-[#e6e1d6] text-[#0e7c5b]'
                          )}
                        >
                          <ToolIcon slug={tool.slug} size="xs" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-[#181a18]">
                            {tool.label}
                          </p>
                          <p className="truncate text-[11px] text-[#646862]">
                            {tool.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Parameters & Dropzone Area */}
              <div className="bg-[#faf8f3]/55 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#181a18]">
                      2. {activeTool.label} Parameters
                    </h3>
                    <p className="text-xs text-[#646862]">
                      Load your image below or launch the dedicated multi-file workspace.
                    </p>
                  </div>
                  <Link
                    to={activeTool.fullPath}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0e7c5b] hover:text-[#095e44] hover:underline whitespace-nowrap shrink-0"
                  >
                    <span>Full workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <ImageDropzone variant="compact" />

                {activeTool.mode === 'convert' && (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                    {ALL_FORMATS.map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setTargetFormat(fmt)}
                        className={cn(
                          'rounded-lg border py-1.5 font-mono text-xs font-semibold uppercase cursor-pointer transition-colors',
                          targetFormat === fmt
                            ? 'border-[#0e7c5b] bg-[#ebf5f0] text-[#095e44]'
                            : 'border-[#e6e1d6] bg-white text-[#484c48] hover:border-[#c9c2b2]'
                        )}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                )}

                {activeTool.mode === 'resize' && (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#3f4440]">
                        Resize Scale
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-[#0e7c5b]">
                        {resizeScale}%
                      </span>
                    </div>
                    <Slider
                      value={resizeScale}
                      min={10}
                      max={200}
                      onChange={setResizeScale}
                      ariaLabel="Studio resize percentage"
                    />
                  </div>
                )}

                {(activeTool.mode === 'compress' ||
                  activeTool.mode === 'convert' ||
                  activeTool.mode === 'resize') && (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#3f4440]">
                        Output Quality
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-[#0e7c5b]">
                        {quality}%
                      </span>
                    </div>
                    <Slider
                      value={quality}
                      min={5}
                      max={100}
                      onChange={setQuality}
                      ariaLabel="Studio output quality"
                    />
                  </div>
                )}

                {activeTool.mode === 'link-crop' ? (
                  <Link
                    to="/tools/image-cropper"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0e7c5b] px-4 text-sm font-semibold text-white shadow-[0_3px_12px_rgba(14,124,91,0.2)] hover:bg-[#095e44] transition-colors"
                  >
                    <Crop className="h-4 w-4" />
                    <span>Open Interactive Cropper Canvas</span>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!selectedItem || isProcessing}
                    onClick={runStudioAction}
                  >
                    {isProcessing ? 'Processing locally...' : `Run ${activeTool.label}`}
                  </Button>
                )}
              </div>
            </div>

            {/* Right Panel: Real-Time Output Stage */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-6 bg-[#fbf9f5]/70 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-[#ebe6db] pb-3.5">
                <div>
                  <h3 className="font-display text-sm font-bold text-[#181a18]">
                    3. Real-Time Output
                  </h3>
                  <p className="text-xs text-[#646862]">
                    {selectedItem
                      ? `${selectedItem.name} · ${selectedItem.width}×${selectedItem.height} px`
                      : 'Waiting for image input'}
                  </p>
                </div>
                {items.length > 1 && (
                  <Link
                    to={activeTool.fullPath}
                    className="text-xs font-semibold text-[#0e7c5b] hover:underline whitespace-nowrap"
                  >
                    Batch ({items.length}) →
                  </Link>
                )}
              </div>

              {selectedItem && selectedItem.result && selectedItem.result.format !== 'tiff' ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <BeforeAfterSlider
                    originalUrl={selectedItem.previewUrl}
                    processedUrl={selectedItem.result.url}
                    originalSize={selectedItem.originalSize}
                    processedSize={selectedItem.result.size}
                    processedLabel={selectedItem.result.format.toUpperCase()}
                    alt={selectedItem.name}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e1d6] pt-3.5">
                    <div className="font-mono text-xs tabular-nums text-[#555955]">
                      {savings && savings.isSmaller ? (
                        <span className="font-semibold text-[#0e7c5b]">
                          -{savings.percent.toFixed(1)}% ({formatBytes(savings.savedBytes)} saved)
                        </span>
                      ) : (
                        <span>Output: {formatBytes(selectedItem.result.size)}</span>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        triggerBlobDownload(selectedItem.result!.blob, selectedItem.result!.filename)
                      }
                    >
                      <span>Download {selectedItem.result.format.toUpperCase()}</span>
                    </Button>
                  </div>
                </div>
              ) : selectedItem ? (
                <div className="space-y-3 flex-1">
                  <div className="checkerboard-bg flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-[#e6e1d6]">
                    <img
                      src={selectedItem.previewUrl}
                      alt={selectedItem.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-[#555955]">
                    Original size:{' '}
                    <span className="font-mono tabular-nums font-semibold">
                      {formatBytes(selectedItem.originalSize)}
                    </span>
                    . Click <strong>Run {activeTool.label}</strong> to inspect output.
                  </p>
                </div>
              ) : (
                <div className="flex flex-1 min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9d3c5] bg-white p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d5ebe0] bg-[#ebf5f0] text-[#0e7c5b]">
                    <ToolIcon slug={activeTool.slug} size="md" />
                  </div>
                  <p className="mt-4 font-display text-sm font-bold text-[#181a18]">
                    No image loaded in studio
                  </p>
                  <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#646862]">
                    Drop, browse, or paste an image on the left—or load our studio specimen to test {activeTool.label} live.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadStudioSample}
                      disabled={loadingSample}
                    >
                      {loadingSample ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0e7c5b]" />
                      ) : (
                        <ImagePlus className="h-3.5 w-3.5 text-[#0e7c5b]" />
                      )}
                      <span>{loadingSample ? 'Loading...' : 'Load Studio Sample'}</span>
                    </Button>
                    <Link
                      to={activeTool.fullPath}
                      className="inline-flex h-8.5 items-center gap-1 px-2 text-xs font-semibold text-[#0e7c5b] hover:underline"
                    >
                      <span>Open full workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
