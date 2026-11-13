import imageCompression from 'browser-image-compression';
import {
  compressAnimatedGif,
  decodeFileToCanvas,
  encodeCanvasToFormat,
  canvasToBlobAsync,
} from '@/src/lib/image/codecs';
import { stripExtension } from '@/src/lib/utils';
import { FORMAT_CATALOG, type ImageFormat, type WorkspaceImage } from '@/src/types/image';

export interface CompressOptions {
  quality: number; // 1 - 100
  targetFormat?: ImageFormat; // optional override; defaults to source format
  maxWidthOrHeight?: number;
  onProgress?: (percent: number) => void;
}

function quantizeCanvasForPng(source: HTMLCanvasElement, qualityPercent: number): HTMLCanvasElement {
  if (qualityPercent >= 96) return source;
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext('2d');
  if (!ctx) return source;
  ctx.drawImage(source, 0, 0);
  const imgData = ctx.getImageData(0, 0, out.width, out.height);
  const data = imgData.data;

  // Map quality 1..95 to quantization step so zlib inside PNG compresses substantially better
  const factor = Math.max(2, Math.round(((100 - qualityPercent) / 100) * 40) + 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.round(data[i] / factor) * factor);
    data[i + 1] = Math.min(255, Math.round(data[i + 1] / factor) * factor);
    data[i + 2] = Math.min(255, Math.round(data[i + 2] / factor) * factor);
    if (qualityPercent < 60 && data[i + 3] > 0 && data[i + 3] < 255) {
      data[i + 3] = Math.min(255, Math.round(data[i + 3] / 16) * 16);
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return out;
}

export async function compressWorkspaceImage(
  item: WorkspaceImage,
  options: CompressOptions
): Promise<{
  blob: Blob;
  width: number;
  height: number;
  format: ImageFormat;
  durationMs: number;
  filename: string;
}> {
  const start = performance.now();
  const quality01 = Math.max(0.01, Math.min(1, options.quality / 100));
  const sourceFormat = item.detectedFormat ?? 'png';
  const outputFormat: ImageFormat = options.targetFormat ?? sourceFormat;

  options.onProgress?.(10);

  // GIF animated-safe compression path
  if (outputFormat === 'gif' && sourceFormat === 'gif') {
    const maxColors = Math.max(16, Math.round((options.quality / 100) * 256));
    options.onProgress?.(45);
    const blob = await compressAnimatedGif(item.file, maxColors);
    options.onProgress?.(100);
    return {
      blob,
      width: item.width,
      height: item.height,
      format: 'gif',
      durationMs: Math.round(performance.now() - start),
      filename: `${stripExtension(item.name)}-compressed.gif`,
    };
  }

  // Browser-image-compression Web Worker path for JPG & WebP (when native file is directly readable)
  if (
    (outputFormat === 'jpg' || outputFormat === 'webp') &&
    (sourceFormat === 'jpg' || sourceFormat === 'png' || sourceFormat === 'webp')
  ) {
    try {
      const targetMime = FORMAT_CATALOG[outputFormat].mime;
      const compressedFile = await imageCompression(item.file, {
        useWebWorker: true,
        initialQuality: quality01,
        fileType: targetMime,
        alwaysKeepResolution: !options.maxWidthOrHeight,
        maxWidthOrHeight: options.maxWidthOrHeight,
        onProgress: (p) => options.onProgress?.(Math.min(95, Math.max(15, p))),
      });

      // Verify browser actually encoded to requested mime (e.g. WebP)
      if (compressedFile.type === targetMime) {
        options.onProgress?.(100);
        return {
          blob: compressedFile,
          width: item.width,
          height: item.height,
          format: outputFormat,
          durationMs: Math.round(performance.now() - start),
          filename: `${stripExtension(item.name)}-compressed.${FORMAT_CATALOG[outputFormat].extension}`,
        };
      }
    } catch {
      // Fall through to canvas encoder below if worker path throws on unusual file
    }
  }

  // Decode to canvas and apply format-specific compression
  const { canvas } = await decodeFileToCanvas(item.file, item.detectedFormat);
  options.onProgress?.(55);

  let blob: Blob;
  if (outputFormat === 'png') {
    const quantized = quantizeCanvasForPng(canvas, options.quality);
    blob = await canvasToBlobAsync(quantized, 'image/png', 1);
  } else {
    blob = await encodeCanvasToFormat(canvas, outputFormat, {
      quality: quality01,
      matteColor: '#ffffff',
    });
  }

  options.onProgress?.(100);
  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    format: outputFormat,
    durationMs: Math.round(performance.now() - start),
    filename: `${stripExtension(item.name)}-compressed.${FORMAT_CATALOG[outputFormat].extension}`,
  };
}
