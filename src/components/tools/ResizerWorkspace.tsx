import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Archive,
  ArrowRight,
  CheckCircle2,
  Download,
  Link2,
  Loader2,
  Maximize2,
  Play,
  Trash2,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Slider } from '@/src/components/ui/slider';
import { Switch } from '@/src/components/ui/switch';
import { BeforeAfterSlider } from '@/src/components/workspace/BeforeAfterSlider';
import { ImageDropzone } from '@/src/components/workspace/ImageDropzone';
import { QueueItemStrip } from '@/src/components/workspace/QueueItemStrip';
import { WorkspaceEmptyState } from '@/src/components/workspace/WorkspaceEmptyState';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { resizeWorkspaceImage } from '@/src/lib/image/resizer';
import { buildZipArchive } from '@/src/lib/image/zip';
import { cn, formatBytes, triggerBlobDownload } from '@/src/lib/utils';
import { type ImageFormat } from '@/src/types/image';

type ResizeMode = 'dimensions' | 'percentage' | 'presets';

interface DimensionPreset {
  group: 'Social Media' | 'Website Thumbnails';
  label: string;
  width: number;
  height: number;
}

const DIMENSION_PRESETS: DimensionPreset[] = [
  { group: 'Social Media', label: 'Instagram Square', width: 1080, height: 1080 },
  { group: 'Social Media', label: 'Instagram Portrait', width: 1080, height: 1350 },
  { group: 'Social Media', label: 'Story / Reels', width: 1080, height: 1920 },
  { group: 'Social Media', label: 'X / Twitter Header', width: 1500, height: 500 },
  { group: 'Social Media', label: 'LinkedIn Banner', width: 1584, height: 396 },
  { group: 'Social Media', label: 'YouTube Thumbnail', width: 1280, height: 720 },
  { group: 'Website Thumbnails', label: 'Open Graph / Share', width: 1200, height: 630 },
  { group: 'Website Thumbnails', label: 'Blog Card (16:9)', width: 800, height: 450 },
  { group: 'Website Thumbnails', label: 'Product Thumbnail', width: 600, height: 600 },
  { group: 'Website Thumbnails', label: 'Avatar / Favicon', width: 256, height: 256 },
];

const PERCENT_STEPS = [25, 50, 75, 125, 150, 200];

export function ResizerWorkspace() {
  const { items, selectedItem, updateItem, removeItem } = useWorkspace();

  const [mode, setMode] = useState<ResizeMode>('dimensions');
  const [widthInput, setWidthInput] = useState<number>(1200);
  const [heightInput, setHeightInput] = useState<number>(800);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [percentage, setPercentage] = useState<number>(50);
  const [outputFormat, setOutputFormat] = useState<'original' | ImageFormat>('original');
  const [quality, setQuality] = useState<number>(88);
  const [isResizing, setIsResizing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setWidthInput(selectedItem.width);
      setHeightInput(selectedItem.height);
    }
  }, [selectedItem?.id]);

  const aspectRatio = selectedItem
    ? selectedItem.width / Math.max(1, selectedItem.height)
    : 1.5;

  const handleWidthChange = (nextW: number) => {
    const cleanW = Math.max(1, Math.min(16384, nextW || 1));
    setWidthInput(cleanW);
    if (lockAspect) {
      setHeightInput(Math.max(1, Math.round(cleanW / aspectRatio)));
    }
  };

  const handleHeightChange = (nextH: number) => {
    const cleanH = Math.max(1, Math.min(16384, nextH || 1));
    setHeightInput(cleanH);
    if (lockAspect) {
      setWidthInput(Math.max(1, Math.round(cleanH * aspectRatio)));
    }
  };

  const applyPreset = (preset: DimensionPreset) => {
    setLockAspect(false);
    setWidthInput(preset.width);
    setHeightInput(preset.height);
  };

  const computeTargetDimensions = (srcW: number, srcH: number) => {
    if (mode === 'percentage') {
      const scale = Math.max(1, percentage) / 100;
      return {
        width: Math.max(1, Math.round(srcW * scale)),
        height: Math.max(1, Math.round(srcH * scale)),
      };
    }
    if (lockAspect && items.length > 1) {
      const ratio = srcW / Math.max(1, srcH);
      return {
        width: widthInput,
        height: Math.max(1, Math.round(widthInput / ratio)),
      };
    }
    return { width: widthInput, height: heightInput };
  };

  const selectedPreviewTarget = selectedItem
    ? computeTargetDimensions(selectedItem.width, selectedItem.height)
    : null;

  const resizeSingle = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const dims = computeTargetDimensions(item.width, item.height);
    const fmt: ImageFormat =
      outputFormat === 'original' ? item.detectedFormat ?? 'png' : outputFormat;

    updateItem(itemId, (curr) => ({
      ...curr,
      status: 'processing',
      progress: 25,
      errorMessage: undefined,
    }));

    try {
      const res = await resizeWorkspaceImage(item, {
        width: dims.width,
        height: dims.height,
        outputFormat: fmt,
        quality,
      });
      const url = URL.createObjectURL(res.blob);
      updateItem(itemId, (curr) => ({
        ...curr,
        status: 'done',
        progress: 100,
        result: { ...res, size: res.blob.size, url },
      }));
    } catch (err) {
      updateItem(itemId, (curr) => ({
        ...curr,
        status: 'error',
        progress: 0,
        errorMessage: err instanceof Error ? err.message : 'Resize failed.',
      }));
    }
  };

  const resizeAll = async () => {
    if (items.length === 0 || isResizing) return;
    setIsResizing(true);
    for (const item of items) {
      await resizeSingle(item.id);
    }
    setIsResizing(false);
  };

  const completedItems = useMemo(
    () => items.filter((i) => i.status === 'done' && i.result),
    [items]
  );

  const handleDownloadZip = async () => {
    if (completedItems.length === 0) return;
    setIsZipping(true);
    try {
      const zip = await buildZipArchive(
        completedItems.map((i) => ({ filename: i.result!.filename, blob: i.result!.blob }))
      );
      triggerBlobDownload(zip, `imagix-resized-${completedItems.length}-images.zip`);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImageDropzone
        variant={items.length === 0 ? 'hero' : 'compact'}
        label={
          items.length === 0
            ? 'Drag & drop images, or click to select'
            : 'Drag & drop more images, or click to add'
        }
      />
      <QueueItemStrip />

      {items.length === 0 ? (
        <WorkspaceEmptyState
          toolSlug="image-resizer"
          title="Load an image to start resizing"
          description="Uses Pica Lanczos3 high-precision resampling for sharp downscaled web graphics, e-commerce thumbnails, and social banners."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5 space-y-5">
              {/* Mode Tabs */}
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#e6e1d6] bg-[#f4f1ea] p-1">
                {(
                  [
                    { id: 'dimensions', label: 'Pixels' },
                    { id: 'percentage', label: 'Percentage' },
                    { id: 'presets', label: 'Presets' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMode(tab.id)}
                    className={cn(
                      'rounded-lg py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                      mode === tab.id
                        ? 'bg-white text-[#0e7c5b] font-semibold shadow-xs'
                        : 'text-[#555955] hover:text-[#181a18]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {mode === 'dimensions' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#3f4440]">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={16384}
                        value={widthInput}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="h-10 w-full rounded-xl border border-[#d9d3c5] bg-white px-3 font-mono text-sm tabular-nums text-[#181a18] focus:border-[#0e7c5b] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#3f4440]">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={16384}
                        value={heightInput}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="h-10 w-full rounded-xl border border-[#d9d3c5] bg-white px-3 font-mono text-sm tabular-nums text-[#181a18] focus:border-[#0e7c5b] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#e6e1d6] bg-[#faf8f3] px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#3f4440]">
                      <Link2 className="h-4 w-4 text-[#0e7c5b]" />
                      <span>Maintain Aspect Ratio</span>
                    </div>
                    <Switch
                      checked={lockAspect}
                      onCheckedChange={setLockAspect}
                      label="Maintain aspect ratio"
                    />
                  </div>
                </div>
              )}

              {mode === 'percentage' && (
                <div className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-[#3f4440]">
                        Scale Factor
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-[#0e7c5b]">
                        {percentage}%
                      </span>
                    </div>
                    <Slider
                      value={percentage}
                      min={5}
                      max={300}
                      onChange={setPercentage}
                      ariaLabel="Resize percentage scale"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {PERCENT_STEPS.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setPercentage(pct)}
                        className={cn(
                          'rounded-xl border py-2 font-mono text-xs tabular-nums font-medium transition-colors cursor-pointer',
                          percentage === pct
                            ? 'border-[#0e7c5b] bg-[#ebf5f0] text-[#095e44] font-semibold'
                            : 'border-[#e6e1d6] bg-[#faf8f3] text-[#484c48] hover:border-[#c9c2b2]'
                        )}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'presets' && (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {(['Social Media', 'Website Thumbnails'] as const).map((group) => (
                    <div key={group} className="space-y-2">
                      <p className="text-xs font-semibold text-[#646862]">
                        {group}
                      </p>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {DIMENSION_PRESETS.filter((p) => p.group === group).map((preset) => {
                          const active =
                            widthInput === preset.width && heightInput === preset.height;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => applyPreset(preset)}
                              className={cn(
                                'rounded-xl border p-2.5 text-left transition-colors cursor-pointer',
                                active
                                  ? 'border-[#0e7c5b] bg-[#ebf5f0]/75'
                                  : 'border-[#e6e1d6] bg-[#faf8f3] hover:border-[#c9c2b2]'
                              )}
                            >
                              <p className="text-xs font-semibold text-[#181a18]">
                                {preset.label}
                              </p>
                              <p className="mt-0.5 font-mono text-[11px] tabular-nums text-[#646862]">
                                {preset.width} × {preset.height} px
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Live Target Summary */}
              {selectedItem && selectedPreviewTarget && (
                <div className="flex items-center justify-between rounded-xl border border-[#d5ebe0] bg-[#ebf5f0]/55 px-3.5 py-2.5 font-mono text-xs tabular-nums">
                  <span className="text-[#555955]">
                    {selectedItem.width}×{selectedItem.height} px
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#0e7c5b]" />
                  <span className="font-bold text-[#0e7c5b]">
                    {selectedPreviewTarget.width}×{selectedPreviewTarget.height} px
                  </span>
                </div>
              )}

              {/* Output Format + Quality */}
              <div className="border-t border-[#ebe6db] pt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#3f4440]">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as 'original' | ImageFormat)}
                    className="h-10 w-full rounded-xl border border-[#d9d3c5] bg-white px-3 text-sm text-[#181a18] focus:border-[#0e7c5b] focus:outline-none"
                  >
                    <option value="original">Keep Original Format</option>
                    <option value="jpg">JPG / JPEG</option>
                    <option value="png">PNG (Lossless)</option>
                    <option value="webp">WebP</option>
                    <option value="avif">AVIF</option>
                  </select>
                </div>

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
                    min={10}
                    max={100}
                    onChange={setQuality}
                    ariaLabel="Resized image output quality"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isResizing}
                  onClick={resizeAll}
                >
                  {isResizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Resizing with Pica...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Resize All ({items.length})</span>
                    </>
                  )}
                </Button>

                {completedItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={isZipping}
                    onClick={handleDownloadZip}
                  >
                    <Archive className="h-4 w-4" />
                    <span>{isZipping ? 'Creating ZIP...' : `Download ZIP (${completedItems.length})`}</span>
                  </Button>
                )}
              </div>
            </div>
          </aside>

          {/* Right Preview & Results */}
          <div className="lg:col-span-7 space-y-6">
            {selectedItem && selectedItem.result ? (
              <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#181a18]">
                      Resized Output · {selectedItem.result.filename}
                    </h3>
                    <p className="mt-0.5 font-mono text-xs tabular-nums text-[#646862]">
                      {selectedItem.width}×{selectedItem.height} → {selectedItem.result.width}×
                      {selectedItem.result.height} px · {selectedItem.result.durationMs} ms
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      triggerBlobDownload(selectedItem.result!.blob, selectedItem.result!.filename)
                    }
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                </div>

                <BeforeAfterSlider
                  originalUrl={selectedItem.previewUrl}
                  processedUrl={selectedItem.result.url}
                  originalSize={selectedItem.originalSize}
                  processedSize={selectedItem.result.size}
                  originalLabel={`Original (${selectedItem.width}×${selectedItem.height})`}
                  processedLabel={`Resized (${selectedItem.result.width}×${selectedItem.result.height})`}
                  alt={selectedItem.name}
                />
              </div>
            ) : (
              selectedItem && (
                <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#181a18]">
                      <Maximize2 className="h-4 w-4 text-[#0e7c5b]" />
                      <span>Source Preview · {selectedItem.name}</span>
                    </div>
                    <span className="font-mono text-xs tabular-nums text-[#646862]">
                      {selectedItem.width} × {selectedItem.height} px
                    </span>
                  </div>
                  <div className="checkerboard-bg flex h-72 items-center justify-center overflow-hidden rounded-xl border border-[#e6e1d6]">
                    <img
                      src={selectedItem.previewUrl}
                      alt={selectedItem.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )
            )}

            <div className="rounded-2xl border border-[#e6e1d6] bg-white overflow-hidden">
              <div className="border-b border-[#ebe6db] bg-[#faf8f3] px-5 py-3">
                <h3 className="font-display text-sm font-bold text-[#181a18]">
                  Resize Results
                </h3>
              </div>
              <div className="divide-y divide-[#ebe6db]">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#181a18]">
                        {item.name}
                      </p>
                      <p className="font-mono text-xs tabular-nums text-[#646862]">
                        Source: {item.width}×{item.height} · {formatBytes(item.originalSize)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'processing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-[#0e7c5b]" />
                      )}
                      {item.status === 'error' && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {item.errorMessage}
                        </span>
                      )}
                      {item.status === 'done' && item.result && (
                        <>
                          <span className="inline-flex items-center gap-1 font-mono text-xs tabular-nums font-semibold text-[#0e7c5b]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {item.result.width}×{item.result.height} · {formatBytes(item.result.size)}
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              triggerBlobDownload(item.result!.blob, item.result!.filename)
                            }
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Save</span>
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={() => resizeSingle(item.id)}>
                        Resize
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-[#646862] hover:text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
