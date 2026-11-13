import { decodeFileToCanvas, encodeCanvasToFormat } from '@/src/lib/image/codecs';
import { stripExtension } from '@/src/lib/utils';
import { FORMAT_CATALOG, type ImageFormat, type WorkspaceImage } from '@/src/types/image';

export interface TransformOptions {
  rotationDeg: number; // e.g. 0, 90, 180, 270 or arbitrary
  flipHorizontal: boolean;
  flipVertical: boolean;
  outputFormat?: ImageFormat;
  quality?: number;
}

export async function transformWorkspaceImage(
  item: WorkspaceImage,
  options: TransformOptions
): Promise<{
  blob: Blob;
  width: number;
  height: number;
  format: ImageFormat;
  durationMs: number;
  filename: string;
}> {
  const start = performance.now();
  const { canvas: src } = await decodeFileToCanvas(item.file, item.detectedFormat);

  const radians = (options.rotationDeg * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  const outW = Math.max(1, Math.round(src.width * cos + src.height * sin));
  const outH = Math.max(1, Math.round(src.width * sin + src.height * cos));

  const dest = document.createElement('canvas');
  dest.width = outW;
  dest.height = outH;
  const ctx = dest.getContext('2d');
  if (!ctx) throw new Error('Unable to acquire 2D canvas context.');

  ctx.translate(outW / 2, outH / 2);
  ctx.rotate(radians);
  ctx.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
  ctx.drawImage(src, -src.width / 2, -src.height / 2);

  const outputFormat = options.outputFormat ?? item.detectedFormat ?? 'png';
  const blob = await encodeCanvasToFormat(dest, outputFormat, {
    quality: (options.quality ?? 92) / 100,
    matteColor: '#ffffff',
  });

  return {
    blob,
    width: outW,
    height: outH,
    format: outputFormat,
    durationMs: Math.round(performance.now() - start),
    filename: `${stripExtension(item.name)}-edited.${FORMAT_CATALOG[outputFormat].extension}`,
  };
}
