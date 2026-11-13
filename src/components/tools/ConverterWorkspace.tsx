import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowRight,
  CheckCircle2,
  Download,
  Loader2,
  Play,
  Trash2,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Slider } from '@/src/components/ui/slider';
import { BeforeAfterSlider } from '@/src/components/workspace/BeforeAfterSlider';
import { ImageDropzone } from '@/src/components/workspace/ImageDropzone';
import { WorkspaceEmptyState } from '@/src/components/workspace/WorkspaceEmptyState';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { decodeFileToCanvas, encodeCanvasToFormat } from '@/src/lib/image/codecs';
import { buildZipArchive } from '@/src/lib/image/zip';
import { cn, formatBytes, stripExtension, triggerBlobDownload } from '@/src/lib/utils';
import { ALL_FORMATS, FORMAT_CATALOG, type ImageFormat } from '@/src/types/image';

interface ConverterWorkspaceProps {
  toolSlug?: string;
  defaultSourceFormat?: ImageFormat;
  defaultTargetFormat?: ImageFormat;
}

const MATTE_SWATCHES = ['#ffffff', '#000000', '#f4f1ea', '#181a18'];

export function ConverterWorkspace({
  toolSlug = 'image-converter',
  defaultSourceFormat,
  defaultTargetFormat = 'webp',
}: ConverterWorkspaceProps) {
  const {
    items,
    selectedItem,
    capabilities,
    setSelectedId,
    updateItem,
    removeItem,
    clearAll,
  } = useWorkspace();

  const [targetFormat, setTargetFormat] = useState<ImageFormat>(defaultTargetFormat);
  const [quality, setQuality] = useState(85);
  const [matteColor, setMatteColor] = useState('#ffffff');
  const [isConverting, setIsConverting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    setTargetFormat(defaultTargetFormat);
  }, [defaultTargetFormat]);

  const targetMeta = FORMAT_CATALOG[targetFormat];
  const targetCap = capabilities?.[targetFormat];
  const anyItemHasAlpha = items.some((i) => i.hasAlpha);
  const needsAlphaMatte = anyItemHasAlpha && !targetMeta.supportsTransparency;

  const convertItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    updateItem(itemId, (curr) => ({
      ...curr,
      status: 'processing',
      progress: 15,
      errorMessage: undefined,
    }));

    try {
      const start = performance.now();
      const { canvas } = await decodeFileToCanvas(item.file, item.detectedFormat);
      updateItem(itemId, (curr) => ({ ...curr, progress: 60 }));

      const blob = await encodeCanvasToFormat(canvas, targetFormat, {
        quality: quality / 100,
        matteColor,
      });

      const url = URL.createObjectURL(blob);
      const filename = `${stripExtension(item.name)}.${targetMeta.extension}`;

      updateItem(itemId, (curr) => ({
        ...curr,
        status: 'done',
        progress: 100,
        errorMessage: undefined,
        result: {
          blob,
          url,
          size: blob.size,
          width: canvas.width,
          height: canvas.height,
          format: targetFormat,
          durationMs: Math.round(performance.now() - start),
          filename,
        },
      }));
    } catch (err) {
      updateItem(itemId, (curr) => ({
        ...curr,
        status: 'error',
        progress: 0,
        errorMessage: err instanceof Error ? err.message : 'Conversion failed.',
      }));
    }
  };

  const convertAll = async () => {
    if (items.length === 0 || isConverting) return;
    setIsConverting(true);
    for (const item of items) {
      await convertItem(item.id);
    }
    setIsConverting(false);
  };

  const completedItems = useMemo(
    () => items.filter((i) => i.status === 'done' && i.result),
    [items]
  );

  const handleZipDownload = async () => {
    if (completedItems.length === 0) return;
    setIsZipping(true);
    try {
      const zip = await buildZipArchive(
        completedItems.map((i) => ({ filename: i.result!.filename, blob: i.result!.blob }))
      );
      triggerBlobDownload(zip, `imagix-converted-${targetFormat}.zip`);
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
            : 'Drag & drop more images, or click to add to conversion batch'
        }
      />

      {items.length === 0 ? (
        <WorkspaceEmptyState
          toolSlug={toolSlug}
          title={
            defaultSourceFormat
              ? `Ready to convert ${FORMAT_CATALOG[defaultSourceFormat].label} to ${targetMeta.label}`
              : 'Ready to convert image formats'
          }
          description="Drop or browse JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, or ICO files above—or load our studio specimen photo to preview instant format conversion."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Format & Encoding Settings */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-sm font-bold text-[#181a18]">
                  Target Format
                </h2>
                {defaultSourceFormat && (
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#0e7c5b]">
                    {defaultSourceFormat.toUpperCase()}
                    <ArrowRight className="h-3 w-3" />
                    {targetFormat.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ALL_FORMATS.map((fmt) => {
                  const meta = FORMAT_CATALOG[fmt];
                  const cap = capabilities?.[fmt];
                  const unsupported = cap ? !cap.encode : false;
                  const active = targetFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetFormat(fmt)}
                      className={cn(
                        'flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]',
                        active
                          ? 'border-[#0e7c5b] bg-[#ebf5f0]/75'
                          : 'border-[#e6e1d6] bg-[#faf8f3] hover:border-[#c9c2b2]',
                        unsupported && 'opacity-70'
                      )}
                    >
                      <div className="flex w-full items-center justify-between gap-1">
                        <span className="font-mono text-xs font-bold uppercase text-[#181a18]">
                          {meta.extension}
                        </span>
                        <span className="text-[10px] font-medium text-[#646862]">
                          {unsupported ? 'Unavailable' : meta.supportsTransparency ? 'Alpha' : 'Opaque'}
                        </span>
                      </div>
                      <span className="mt-0.5 text-[11px] text-[#555955] truncate w-full">
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {targetCap && !targetCap.encode && (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <div>
                      <p className="font-semibold">Browser Encoder Unavailable</p>
                      <p className="mt-0.5">{targetCap.note}</p>
                    </div>
                  </div>
                </div>
              )}

              {targetMeta.supportsLossy && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#3f4440]">
                      Encoding Quality
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-[#0e7c5b]">
                      {quality}%
                    </span>
                  </div>
                  <Slider
                    value={quality}
                    min={1}
                    max={100}
                    onChange={setQuality}
                    ariaLabel="Target format encoding quality"
                  />
                </div>
              )}

              {needsAlphaMatte && (
                <div className="rounded-xl border border-[#e6e1d6] bg-[#faf8f3] p-3.5 space-y-2.5">
                  <div className="text-xs">
                    <p className="font-semibold text-[#181a18]">
                      Transparency Matte Fill
                    </p>
                    <p className="mt-0.5 text-[#555955]">
                      {targetMeta.label} does not support alpha transparency. Transparent pixels will be filled with:
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {MATTE_SWATCHES.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setMatteColor(hex)}
                        aria-label={`Select matte background ${hex}`}
                        className={cn(
                          'h-7 w-7 rounded-md border cursor-pointer',
                          matteColor.toLowerCase() === hex
                            ? 'ring-2 ring-[#0e7c5b] border-[#0e7c5b]'
                            : 'border-[#d9d3c5]'
                        )}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                    <input
                      type="color"
                      value={matteColor}
                      onChange={(e) => setMatteColor(e.target.value)}
                      aria-label="Custom matte background color"
                      className="h-7 w-9 cursor-pointer rounded border border-[#d9d3c5] bg-transparent p-0.5"
                    />
                    <span className="font-mono text-xs text-[#555955] uppercase">
                      {matteColor}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isConverting || Boolean(targetCap && !targetCap.encode)}
                  onClick={convertAll}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Converting Batch...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Convert All to {targetMeta.extension.toUpperCase()}</span>
                    </>
                  )}
                </Button>

                {completedItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={isZipping}
                    onClick={handleZipDownload}
                  >
                    <Archive className="h-4 w-4" />
                    <span>{isZipping ? 'Creating ZIP...' : `Download ZIP (${completedItems.length})`}</span>
                  </Button>
                )}
              </div>
            </div>
          </aside>

          {/* Preview + Queue */}
          <div className="lg:col-span-8 space-y-6">
            {selectedItem && selectedItem.result && selectedItem.result.format !== 'tiff' && (
              <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#181a18]">
                      Conversion Preview · {selectedItem.result.filename}
                    </h3>
                    <p className="mt-0.5 text-xs font-mono tabular-nums text-[#646862]">
                      {(selectedItem.detectedFormat ?? 'SOURCE').toUpperCase()} → {selectedItem.result.format.toUpperCase()} · {selectedItem.result.durationMs} ms
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
                    <span>Download {selectedItem.result.format.toUpperCase()}</span>
                  </Button>
                </div>

                <BeforeAfterSlider
                  originalUrl={selectedItem.previewUrl}
                  processedUrl={selectedItem.result.url}
                  originalSize={selectedItem.originalSize}
                  processedSize={selectedItem.result.size}
                  originalLabel={(selectedItem.detectedFormat ?? 'Original').toUpperCase()}
                  processedLabel={selectedItem.result.format.toUpperCase()}
                  alt={selectedItem.name}
                />
              </div>
            )}

            <div className="rounded-2xl border border-[#e6e1d6] bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#ebe6db] bg-[#faf8f3] px-5 py-3.5">
                <h3 className="font-display text-sm font-bold text-[#181a18]">
                  Conversion Queue ({items.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear Queue
                </Button>
              </div>
              <div className="divide-y divide-[#ebe6db]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer',
                      selectedItem?.id === item.id ? 'bg-[#ebf5f0]/45' : 'hover:bg-[#faf8f3]'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="checkerboard-bg h-11 w-11 shrink-0 rounded-lg object-cover border border-[#e6e1d6]"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#181a18]">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs font-mono tabular-nums text-[#646862]">
                          Detected: {(item.detectedFormat ?? 'Unknown').toUpperCase()} · {formatBytes(item.originalSize)}
                          {item.hasAlpha ? ' · Alpha' : ''}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex flex-wrap items-center gap-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.status === 'processing' && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#0e7c5b]">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Converting...
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-red-600">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {item.errorMessage}
                        </span>
                      )}
                      {item.status === 'done' && item.result && (
                        <>
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums font-semibold text-[#0e7c5b]">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            {item.result.format.toUpperCase()} · {formatBytes(item.result.size)}
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              triggerBlobDownload(item.result!.blob, item.result!.filename)
                            }
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={Boolean(targetCap && !targetCap.encode)}
                        onClick={() => convertItem(item.id)}
                      >
                        Convert
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
