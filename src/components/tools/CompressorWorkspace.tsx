import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Download,
  Loader2,
  Play,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Slider } from '@/src/components/ui/slider';
import { BeforeAfterSlider } from '@/src/components/workspace/BeforeAfterSlider';
import { ImageDropzone } from '@/src/components/workspace/ImageDropzone';
import { WorkspaceEmptyState } from '@/src/components/workspace/WorkspaceEmptyState';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { compressWorkspaceImage } from '@/src/lib/image/compressor';
import { buildZipArchive } from '@/src/lib/image/zip';
import { cn, computeSavings, formatBytes, triggerBlobDownload } from '@/src/lib/utils';
import { FORMAT_CATALOG, type ImageFormat } from '@/src/types/image';

interface CompressorWorkspaceProps {
  toolSlug?: string;
  defaultTargetFormat?: ImageFormat;
  lockedTargetFormat?: boolean;
}

const QUALITY_PRESETS = [
  { label: 'High Quality', quality: 88, note: 'Minimal visual change' },
  { label: 'Balanced', quality: 75, note: 'Recommended web default' },
  { label: 'Compact', quality: 55, note: 'Strong size reduction' },
  { label: 'Max Savings', quality: 35, note: 'Smallest payload' },
];

export function CompressorWorkspace({
  toolSlug = 'image-compressor',
  defaultTargetFormat,
  lockedTargetFormat = false,
}: CompressorWorkspaceProps) {
  const {
    items,
    selectedItem,
    setSelectedId,
    updateItem,
    removeItem,
    replaceItem,
    clearAll,
  } = useWorkspace();

  const [globalQuality, setGlobalQuality] = useState(75);
  const [outputFormat, setOutputFormat] = useState<'original' | ImageFormat>(
    lockedTargetFormat && defaultTargetFormat ? defaultTargetFormat : 'original'
  );
  const [perFileQuality, setPerFileQuality] = useState<Record<string, number>>({});
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<string | null>(null);
  const autoCompressedIdsRef = useRef<Set<string>>(new Set());

  const resolvedTargetFormat = lockedTargetFormat
    ? defaultTargetFormat
    : outputFormat === 'original'
      ? undefined
      : outputFormat;
  const idleItemIds = items
    .filter((item) => item.status === 'idle' && !autoCompressedIdsRef.current.has(item.id))
    .map((item) => item.id)
    .join(',');

  const runSingleCompression = async (
    itemId: string,
    qualityOverride?: number,
    formatOverride?: ImageFormat
  ) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    const quality = qualityOverride ?? perFileQuality[itemId] ?? globalQuality;
    const fmt = formatOverride ?? resolvedTargetFormat;

    updateItem(itemId, (curr) => ({
      ...curr,
      status: 'processing',
      progress: 5,
      errorMessage: undefined,
    }));

    try {
      const output = await compressWorkspaceImage(target, {
        quality,
        targetFormat: fmt,
        onProgress: (p) => {
          updateItem(itemId, (curr) => ({ ...curr, progress: p }));
        },
      });

      const url = URL.createObjectURL(output.blob);
      updateItem(itemId, (curr) => ({
        ...curr,
        status: 'done',
        progress: 100,
        errorMessage: undefined,
        result: {
          ...output,
          size: output.blob.size,
          url,
        },
      }));
    } catch (err) {
      updateItem(itemId, (curr) => ({
        ...curr,
        status: 'error',
        progress: 0,
        errorMessage: err instanceof Error ? err.message : 'Compression failed.',
      }));
    }
  };

  const runBatchCompression = async (qualityToUse = globalQuality) => {
    if (items.length === 0 || isBatchRunning) return;
    setIsBatchRunning(true);
    for (const item of items) {
      const q = perFileQuality[item.id] ?? qualityToUse;
      await runSingleCompression(item.id, q, resolvedTargetFormat);
    }
    setIsBatchRunning(false);
  };

  useEffect(() => {
    const idleItems = items.filter(
      (i) => i.status === 'idle' && !autoCompressedIdsRef.current.has(i.id)
    );
    if (idleItems.length === 0) return;

    idleItems.forEach((i) => autoCompressedIdsRef.current.add(i.id));
    (async () => {
      for (const item of idleItems) {
        await runSingleCompression(
          item.id,
          perFileQuality[item.id] ?? globalQuality,
          resolvedTargetFormat
        );
      }
    })();
    // Replacement keeps the item count stable, so watch unprocessed idle IDs instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idleItemIds]);

  const completedItems = useMemo(
    () => items.filter((i) => i.status === 'done' && i.result),
    [items]
  );

  const totals = useMemo(() => {
    const original = completedItems.reduce((acc, i) => acc + i.originalSize, 0);
    const compressed = completedItems.reduce((acc, i) => acc + (i.result?.size ?? 0), 0);
    return {
      original,
      compressed,
      ...computeSavings(original, compressed),
    };
  }, [completedItems]);

  const handleDownloadAllZip = async () => {
    if (completedItems.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);
    try {
      const zipBlob = await buildZipArchive(
        completedItems.map((i) => ({
          filename: i.result!.filename,
          blob: i.result!.blob,
        })),
        setZipProgress
      );
      triggerBlobDownload(zipBlob, `imagix-compressed-${completedItems.length}-images.zip`);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          const id = replaceTargetRef.current;
          if (file && id) {
            autoCompressedIdsRef.current.delete(id);
            await replaceItem(id, file);
          }
          e.target.value = '';
        }}
      />

      <ImageDropzone
        variant={items.length === 0 ? 'hero' : 'compact'}
        label={
          items.length === 0
            ? 'Drag & drop images, or click to select'
            : 'Drag & drop more images, or click to add to batch'
        }
      />

      {items.length === 0 ? (
        <WorkspaceEmptyState
          toolSlug={toolSlug}
          title="No images loaded yet"
          description="Drop, browse, or paste one or more images above—or load our studio rangefinder photo to test real Web Worker compression."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Controls Panel */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#0e7c5b]" />
                  <h2 className="font-display text-sm font-bold text-[#181a18]">
                    Compression Settings
                  </h2>
                </div>
                {lockedTargetFormat && defaultTargetFormat && (
                  <span className="text-xs font-mono font-semibold text-[#0e7c5b]">
                    {FORMAT_CATALOG[defaultTargetFormat].extension.toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#3f4440]">
                    Quality Level
                  </span>
                  <span className="font-mono font-semibold tabular-nums text-[#0e7c5b]">
                    {globalQuality}%
                  </span>
                </div>
                <Slider
                  value={globalQuality}
                  min={1}
                  max={100}
                  onChange={setGlobalQuality}
                  ariaLabel="Global compression quality percentage"
                />
                <div className="mt-1 flex justify-between text-[11px] text-[#646862]">
                  <span>1% (Smallest)</span>
                  <span>100% (Highest)</span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-[#555955]">
                  Presets
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUALITY_PRESETS.map((preset) => {
                    const active = globalQuality === preset.quality;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setGlobalQuality(preset.quality)}
                        className={cn(
                          'rounded-xl border p-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]',
                          active
                            ? 'border-[#0e7c5b] bg-[#ebf5f0]/75'
                            : 'border-[#e6e1d6] bg-[#faf8f3] hover:border-[#c9c2b2]'
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-[#181a18]">
                            {preset.label}
                          </span>
                          <span className="font-mono text-xs tabular-nums font-semibold text-[#0e7c5b]">
                            {preset.quality}%
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-[#646862]">
                          {preset.note}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!lockedTargetFormat && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#3f4440]">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) =>
                      setOutputFormat(e.target.value as 'original' | ImageFormat)
                    }
                    className="h-10 w-full rounded-xl border border-[#d9d3c5] bg-white px-3 text-sm text-[#181a18] focus:border-[#0e7c5b] focus:outline-none"
                  >
                    <option value="original">Keep Original Format</option>
                    <option value="webp">WebP (Smallest Web Payload)</option>
                    <option value="jpg">JPG / JPEG</option>
                    <option value="png">PNG (Alpha-Safe)</option>
                    <option value="avif">AVIF (Next-Gen)</option>
                  </select>
                </div>
              )}

              <div className="pt-1 flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isBatchRunning}
                  onClick={() => runBatchCompression(globalQuality)}
                >
                  {isBatchRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Compressing Batch...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Compress All ({items.length})</span>
                    </>
                  )}
                </Button>

                {completedItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={isZipping}
                    onClick={handleDownloadAllZip}
                  >
                    {isZipping ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Bundling ZIP ({zipProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4" />
                        <span>Download All as ZIP ({completedItems.length})</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Real Batch Summary */}
            {completedItems.length > 0 && (
              <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5">
                <h3 className="font-display text-sm font-bold text-[#181a18]">
                  Actual Batch Savings
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-[#555955]">Original Total</dt>
                    <dd className="font-mono tabular-nums text-[#181a18]">
                      {formatBytes(totals.original)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#555955]">Compressed Total</dt>
                    <dd className="font-mono tabular-nums text-[#181a18]">
                      {formatBytes(totals.compressed)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#ebe6db] pt-2">
                    <dt className="font-medium text-[#181a18]">Net Saved</dt>
                    <dd
                      className={cn(
                        'font-mono font-semibold tabular-nums',
                        totals.isSmaller ? 'text-[#0e7c5b]' : 'text-amber-700'
                      )}
                    >
                      {totals.isSmaller
                        ? `-${formatBytes(totals.savedBytes)} (${totals.percent.toFixed(1)}%)`
                        : `+${formatBytes(Math.abs(totals.savedBytes))} (${Math.abs(totals.percent).toFixed(1)}% larger)`}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </aside>

          {/* Right Comparison & Batch Queue Table */}
          <div className="lg:col-span-8 space-y-6">
            {completedItems.length > 0 && (
              <div className="grid grid-cols-2 divide-x divide-[#ebe6db] rounded-2xl border border-[#e6e1d6] bg-white sm:grid-cols-4">
                <div className="p-4">
                  <p className="text-xs text-[#646862]">Processed</p>
                  <p className="mt-1 font-mono text-base font-bold tabular-nums text-[#181a18]">
                    {completedItems.length} / {items.length}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#646862]">Original Size</p>
                  <p className="mt-1 font-mono text-base font-bold tabular-nums text-[#181a18]">
                    {formatBytes(totals.original)}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#646862]">Optimized Size</p>
                  <p className="mt-1 font-mono text-base font-bold tabular-nums text-[#181a18]">
                    {formatBytes(totals.compressed)}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#646862]">Total Reduction</p>
                  <p
                    className={cn(
                      'mt-1 font-mono text-base font-bold tabular-nums',
                      totals.isSmaller ? 'text-[#0e7c5b]' : 'text-amber-700'
                    )}
                  >
                    {totals.isSmaller
                      ? `-${totals.percent.toFixed(1)}%`
                      : `+${Math.abs(totals.percent).toFixed(1)}%`}
                  </p>
                </div>
              </div>
            )}

            {selectedItem && selectedItem.result && (
              <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#181a18]">
                      Before &amp; After Comparison · {selectedItem.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-mono tabular-nums text-[#646862]">
                      {selectedItem.width}×{selectedItem.height} px · {selectedItem.result.durationMs} ms
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
                  processedLabel={`Compressed (${selectedItem.result.format.toUpperCase()})`}
                  alt={selectedItem.name}
                />
              </div>
            )}

            {/* Batch Queue List */}
            <div className="rounded-2xl border border-[#e6e1d6] bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#ebe6db] bg-[#faf8f3] px-5 py-3.5">
                <h3 className="font-display text-sm font-bold text-[#181a18]">
                  Queued Images ({items.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear Queue
                </Button>
              </div>

              <div className="divide-y divide-[#ebe6db]">
                {items.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const itemQuality = perFileQuality[item.id] ?? globalQuality;
                  const savings = item.result
                    ? computeSavings(item.originalSize, item.result.size)
                    : null;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        'p-4 transition-colors cursor-pointer',
                        isSelected ? 'bg-[#ebf5f0]/45' : 'hover:bg-[#faf8f3]'
                      )}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.previewUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="checkerboard-bg h-12 w-12 shrink-0 rounded-lg object-cover border border-[#e6e1d6]"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#181a18]">
                              {item.name}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#646862]">
                              <span className="font-mono uppercase">
                                {item.detectedFormat ?? 'IMG'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">
                                {item.width}×{item.height}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">
                                {formatBytes(item.originalSize)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Result Metrics + Status */}
                        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                          {item.status === 'processing' && (
                            <div className="flex items-center gap-2 text-xs font-medium text-[#0e7c5b]">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="font-mono tabular-nums">{item.progress}%</span>
                            </div>
                          )}

                          {item.status === 'error' && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span>{item.errorMessage || 'Error'}</span>
                            </div>
                          )}

                          {item.status === 'done' && item.result && savings && (
                            <div className="text-right">
                              <div className="flex items-center gap-1.5 justify-end text-xs font-mono tabular-nums">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#0e7c5b] shrink-0" />
                                <span className="font-semibold text-[#181a18]">
                                  {formatBytes(item.result.size)}
                                </span>
                                <span
                                  className={cn(
                                    'font-semibold',
                                    savings.isSmaller ? 'text-[#0e7c5b]' : 'text-amber-700'
                                  )}
                                >
                                  {savings.isSmaller
                                    ? `(-${savings.percent.toFixed(1)}%)`
                                    : `(+${Math.abs(savings.percent).toFixed(1)}%)`}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono tabular-nums text-[#646862]">
                                {savings.isSmaller
                                  ? `Saved ${formatBytes(savings.savedBytes)}`
                                  : 'Already optimized — try lower quality'}
                              </p>
                            </div>
                          )}

                          {/* Per-file Quality Input */}
                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <label className="text-[11px] text-[#646862]">
                              Q:
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={itemQuality}
                              onChange={(e) => {
                                const val = Math.max(1, Math.min(100, Number(e.target.value) || 75));
                                setPerFileQuality((prev) => ({ ...prev, [item.id]: val }));
                              }}
                              aria-label={`Quality for ${item.name}`}
                              className="h-8 w-14 rounded-lg border border-[#d9d3c5] bg-white px-2 text-center font-mono text-xs tabular-nums text-[#181a18] focus:border-[#0e7c5b] focus:outline-none"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => runSingleCompression(item.id, itemQuality, resolvedTargetFormat)}
                              title="Re-compress this image"
                            >
                              Apply
                            </Button>
                          </div>

                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.result && (
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
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Replace file"
                              aria-label={`Replace ${item.name}`}
                              onClick={() => {
                                replaceTargetRef.current = item.id;
                                replaceInputRef.current?.click();
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Remove file"
                              aria-label={`Remove ${item.name}`}
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-[#646862] hover:text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
