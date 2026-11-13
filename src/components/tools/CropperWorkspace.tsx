import { useEffect, useRef, useState } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import {
  Check,
  Crop,
  Download,
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Slider } from '@/src/components/ui/slider';
import { ImageDropzone } from '@/src/components/workspace/ImageDropzone';
import { QueueItemStrip } from '@/src/components/workspace/QueueItemStrip';
import { WorkspaceEmptyState } from '@/src/components/workspace/WorkspaceEmptyState';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { encodeCanvasToFormat } from '@/src/lib/image/codecs';
import { cn, formatBytes, stripExtension, triggerBlobDownload } from '@/src/lib/utils';
import { FORMAT_CATALOG, type ImageFormat } from '@/src/types/image';

interface AspectPreset {
  id: string;
  label: string;
  ratio: number; // NaN = free
}

const ASPECT_PRESETS: AspectPreset[] = [
  { id: 'free', label: 'Free', ratio: Number.NaN },
  { id: '1:1', label: 'Square 1:1', ratio: 1 },
  { id: '16:9', label: 'Landscape 16:9', ratio: 16 / 9 },
  { id: '4:3', label: 'Landscape 4:3', ratio: 4 / 3 },
  { id: '3:2', label: 'Photo 3:2', ratio: 3 / 2 },
  { id: '4:5', label: 'Portrait 4:5', ratio: 4 / 5 },
  { id: '9:16', label: 'Story 9:16', ratio: 9 / 16 },
  { id: 'custom', label: 'Custom', ratio: 21 / 9 },
];

export function CropperWorkspace() {
  const { selectedItem, replaceItem } = useWorkspace();
  const imgRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);

  const [activeAspectId, setActiveAspectId] = useState<string>('free');
  const [customW, setCustomW] = useState<number>(21);
  const [customH, setCustomH] = useState<number>(9);
  const [fineAngle, setFineAngle] = useState<number>(0);
  const [baseRotation, setBaseRotation] = useState<number>(0);
  const [scaleX, setScaleX] = useState<1 | -1>(1);
  const [scaleY, setScaleY] = useState<1 | -1>(1);
  const [cropBoxInfo, setCropBoxInfo] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [outputFormat, setOutputFormat] = useState<'original' | ImageFormat>('original');
  const [quality, setQuality] = useState<number>(90);
  const [appliedToQueue, setAppliedToQueue] = useState(false);
  const [croppedPreview, setCroppedPreview] = useState<{
    url: string;
    blob: Blob;
    width: number;
    height: number;
    filename: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (!imgEl || !selectedItem) return;

    setCroppedPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
    setBaseRotation(0);
    setFineAngle(0);
    setScaleX(1);
    setScaleY(1);
    setErrorMsg(null);

    if (cropperRef.current) {
      cropperRef.current.destroy();
      cropperRef.current = null;
    }

    const cropper = new Cropper(imgEl, {
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.85,
      responsive: true,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      background: false,
      crop(event) {
        setCropBoxInfo({
          w: Math.max(0, Math.round(event.detail.width)),
          h: Math.max(0, Math.round(event.detail.height)),
        });
      },
    });
    cropperRef.current = cropper;

    return () => {
      cropper.destroy();
      cropperRef.current = null;
    };
  }, [selectedItem?.id, selectedItem?.previewUrl]);

  useEffect(() => {
    return () => {
      if (croppedPreview?.url) URL.revokeObjectURL(croppedPreview.url);
    };
  }, [croppedPreview]);

  const applyAspectPreset = (preset: AspectPreset) => {
    setActiveAspectId(preset.id);
    if (!cropperRef.current) return;
    if (preset.id === 'custom') {
      cropperRef.current.setAspectRatio(customW / Math.max(1, customH));
    } else {
      cropperRef.current.setAspectRatio(preset.ratio);
    }
  };

  useEffect(() => {
    if (activeAspectId === 'custom' && cropperRef.current) {
      cropperRef.current.setAspectRatio(customW / Math.max(1, customH));
    }
  }, [activeAspectId, customW, customH]);

  const rotateBy = (delta: number) => {
    const nextBase = baseRotation + delta;
    setBaseRotation(nextBase);
    cropperRef.current?.rotateTo(nextBase + fineAngle);
  };

  const handleFineAngle = (deg: number) => {
    setFineAngle(deg);
    cropperRef.current?.rotateTo(baseRotation + deg);
  };

  const toggleFlipX = () => {
    const next: 1 | -1 = scaleX === 1 ? -1 : 1;
    setScaleX(next);
    cropperRef.current?.scaleX(next);
  };

  const toggleFlipY = () => {
    const next: 1 | -1 = scaleY === 1 ? -1 : 1;
    setScaleY(next);
    cropperRef.current?.scaleY(next);
  };

  const resetCanvas = () => {
    cropperRef.current?.reset();
    setBaseRotation(0);
    setFineAngle(0);
    setScaleX(1);
    setScaleY(1);
    setActiveAspectId('free');
    cropperRef.current?.setAspectRatio(Number.NaN);
  };

  const generateCrop = async (mode: 'download' | 'preview' | 'queue') => {
    if (!cropperRef.current || !selectedItem) return;
    setErrorMsg(null);
    try {
      const croppedCanvas = cropperRef.current.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      if (!croppedCanvas) {
        throw new Error('Could not extract cropped region.');
      }

      const fmt: ImageFormat =
        outputFormat === 'original' ? selectedItem.detectedFormat ?? 'png' : outputFormat;
      const blob = await encodeCanvasToFormat(croppedCanvas, fmt, {
        quality: quality / 100,
        matteColor: '#ffffff',
      });
      const filename = `${stripExtension(selectedItem.name)}-cropped.${FORMAT_CATALOG[fmt].extension}`;

      if (mode === 'download') {
        triggerBlobDownload(blob, filename);
      } else if (mode === 'queue') {
        const croppedFile = new File([blob], filename, { type: blob.type || FORMAT_CATALOG[fmt].mime });
        await replaceItem(selectedItem.id, croppedFile);
        setAppliedToQueue(true);
        setTimeout(() => setAppliedToQueue(false), 2000);
        return;
      }

      const url = URL.createObjectURL(blob);
      setCroppedPreview((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return {
          url,
          blob,
          width: croppedCanvas.width,
          height: croppedCanvas.height,
          filename,
        };
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Cropping failed.');
    }
  };

  return (
    <div className="space-y-6">
      <ImageDropzone
        variant={!selectedItem ? 'hero' : 'compact'}
        label={
          !selectedItem
            ? 'Drag & drop images, or click to select'
            : 'Drag & drop more images, or click to add'
        }
      />
      <QueueItemStrip />

      {!selectedItem ? (
        <WorkspaceEmptyState
          toolSlug="image-cropper"
          title="Load an image to open the interactive cropper"
          description="Supports freeform, 1:1 square, 16:9, 4:3, portrait, custom aspect ratios, zoom, straighten rotation, and horizontal/vertical flipping."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Interactive Cropper Canvas */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-[#e6e1d6] bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#646862]">
                <span className="font-semibold text-[#181a18]">
                  {selectedItem.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums text-[#0e7c5b] font-semibold">
                    Selection: {cropBoxInfo.w} × {cropBoxInfo.h} px
                  </span>
                  <div className="flex items-center gap-1 border-l border-[#e6e1d6] pl-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Zoom in"
                      onClick={() => cropperRef.current?.zoom(0.1)}
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Zoom out"
                      onClick={() => cropperRef.current?.zoom(-0.1)}
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Reset crop frame"
                      onClick={resetCanvas}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="checkerboard-bg h-[420px] sm:h-[480px] w-full overflow-hidden rounded-xl border border-[#e6e1d6]">
                <img
                  ref={imgRef}
                  src={selectedItem.previewUrl}
                  alt={selectedItem.name}
                  referrerPolicy="no-referrer"
                  className="block max-w-full"
                />
              </div>
            </div>

            {croppedPreview && (
              <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#181a18]">
                      Cropped Preview · {croppedPreview.filename}
                    </h3>
                    <p className="font-mono text-xs tabular-nums text-[#646862]">
                      {croppedPreview.width} × {croppedPreview.height} px · {formatBytes(croppedPreview.blob.size)}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      triggerBlobDownload(croppedPreview.blob, croppedPreview.filename)
                    }
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Cropped</span>
                  </Button>
                </div>
                <div className="checkerboard-bg flex max-h-72 items-center justify-center overflow-hidden rounded-xl border border-[#e6e1d6] p-3">
                  <img
                    src={croppedPreview.url}
                    alt="Cropped result preview"
                    referrerPolicy="no-referrer"
                    className="max-h-64 max-w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cropper Controls Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5 space-y-5">
              <div>
                <h2 className="font-display text-sm font-bold text-[#181a18]">
                  Aspect Ratio
                </h2>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {ASPECT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyAspectPreset(preset)}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-xs font-medium transition-colors cursor-pointer',
                        activeAspectId === preset.id
                          ? 'border-[#0e7c5b] bg-[#ebf5f0] text-[#095e44] font-semibold'
                          : 'border-[#e6e1d6] bg-[#faf8f3] text-[#484c48] hover:border-[#c9c2b2]'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {activeAspectId === 'custom' && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={customW}
                      onChange={(e) => setCustomW(Math.max(1, Number(e.target.value) || 1))}
                      aria-label="Custom aspect ratio width"
                      className="h-9 w-full rounded-xl border border-[#d9d3c5] bg-white px-2.5 text-center font-mono text-xs tabular-nums text-[#181a18] focus:border-[#0e7c5b] focus:outline-none"
                    />
                    <span className="font-mono text-xs text-[#646862]">:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={customH}
                      onChange={(e) => setCustomH(Math.max(1, Number(e.target.value) || 1))}
                      aria-label="Custom aspect ratio height"
                      className="h-9 w-full rounded-xl border border-[#d9d3c5] bg-white px-2.5 text-center font-mono text-xs tabular-nums text-[#181a18] focus:border-[#0e7c5b] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-[#ebe6db] pt-4 space-y-3">
                <h3 className="font-display text-sm font-bold text-[#181a18]">
                  Rotate &amp; Flip
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" size="sm" onClick={() => rotateBy(-90)} title="Rotate 90° left">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => rotateBy(90)} title="Rotate 90° right">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={scaleX === -1 ? 'primary' : 'outline'}
                    size="sm"
                    onClick={toggleFlipX}
                    title="Flip horizontal"
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={scaleY === -1 ? 'primary' : 'outline'}
                    size="sm"
                    onClick={toggleFlipY}
                    title="Flip vertical"
                  >
                    <FlipVertical className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[#555955]">Straighten Angle</span>
                    <span className="font-mono font-semibold tabular-nums text-[#0e7c5b]">
                      {fineAngle}°
                    </span>
                  </div>
                  <Slider
                    value={fineAngle}
                    min={-45}
                    max={45}
                    onChange={handleFineAngle}
                    ariaLabel="Straighten rotation angle"
                  />
                </div>
              </div>

              <div className="border-t border-[#ebe6db] pt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3f4440]">
                    Export Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as 'original' | ImageFormat)}
                    className="h-10 w-full rounded-xl border border-[#d9d3c5] bg-white px-3 text-sm text-[#181a18] focus:border-[#0e7c5b] focus:outline-none"
                  >
                    <option value="original">Keep Original</option>
                    <option value="png">PNG (Lossless)</option>
                    <option value="jpg">JPG / JPEG</option>
                    <option value="webp">WebP</option>
                    <option value="avif">AVIF</option>
                  </select>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[#555955]">Export Quality</span>
                    <span className="font-mono font-semibold tabular-nums text-[#0e7c5b]">
                      {quality}%
                    </span>
                  </div>
                  <Slider
                    value={quality}
                    min={10}
                    max={100}
                    onChange={setQuality}
                    ariaLabel="Crop export quality"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600">{errorMsg}</p>
              )}

              <div className="flex flex-col gap-2.5">
                <Button variant="primary" size="lg" className="w-full" onClick={() => generateCrop('download')}>
                  <Download className="h-4 w-4" />
                  <span>Crop &amp; Download</span>
                </Button>
                <Button variant="outline" size="md" className="w-full" onClick={() => generateCrop('preview')}>
                  <Crop className="h-4 w-4" />
                  <span>Generate Preview</span>
                </Button>
                <Button variant="secondary" size="md" className="w-full" onClick={() => generateCrop('queue')}>
                  {appliedToQueue ? (
                    <>
                      <Check className="h-4 w-4 text-[#0e7c5b]" />
                      <span>Updated in Queue</span>
                    </>
                  ) : (
                    <span>Apply Crop to Queue</span>
                  )}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
