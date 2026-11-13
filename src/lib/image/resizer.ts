import Pica from 'pica';
import { decodeFileToCanvas, encodeCanvasToFormat } from '@/src/lib/image/codecs';
import { stripExtension } from '@/src/lib/utils';
import { FORMAT_CATALOG, type ImageFormat, type WorkspaceImage } from '@/src/types/image';

const picaInstance = Pica({
  features: ['js', 'wasm', 'ww'],
});

export interface ResizeOptions {
  width: number;
  height: number;
  outputFormat: ImageFormat;
  quality: number; // 1 - 100
  matteColor?: string;
}

export async function resizeWorkspaceImage(
  item: WorkspaceImage,
  options: ResizeOptions
): Promise<{
  blob: Blob;
  width: number;
  height: number;
  format: ImageFormat;
  durationMs: number;
  filename: string;
}> {
  const start = performance.now();
  const targetWidth = Math.max(1, Math.min(16384, Math.round(options.width)));
  const targetHeight = Math.max(1, Math.min(16384, Math.round(options.height)));

  const { canvas: srcCanvas } = await decodeFileToCanvas(item.file, item.detectedFormat);

  const destCanvas = document.createElement('canvas');
  destCanvas.width = targetWidth;
  destCanvas.height = targetHeight;

  await picaInstance.resize(srcCanvas, destCanvas, {
    quality: 3, // Lanczos3
    alpha: true,
    unsharpAmount: targetWidth < srcCanvas.width ? 45 : 0,
    unsharpRadius: 0.6,
    unsharpThreshold: 2,
  });

  const blob = await encodeCanvasToFormat(destCanvas, options.outputFormat, {
    quality: options.quality / 100,
    matteColor: options.matteColor ?? '#ffffff',
  });

  return {
    blob,
    width: targetWidth,
    height: targetHeight,
    format: options.outputFormat,
    durationMs: Math.round(performance.now() - start),
    filename: `${stripExtension(item.name)}-${targetWidth}x${targetHeight}.${FORMAT_CATALOG[options.outputFormat].extension}`,
  };
}
