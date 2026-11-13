import {
  FORMAT_CATALOG,
  type CapabilityMap,
  type ImageFormat,
} from '@/src/types/image';

let cachedCapabilities: CapabilityMap | null = null;

async function testCanvasBlobEncode(mime: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(false);
        return;
      }
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(0, 0, 2, 2);
      canvas.toBlob(
        (blob) => {
          resolve(Boolean(blob && blob.type === mime));
        },
        mime,
        0.8
      );
    } catch {
      resolve(false);
    }
  });
}

async function testAvifDecode(): Promise<boolean> {
  // Minimal valid 1x1 AVIF data URL probe
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), 300);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img.width > 0);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

export async function probeCodecCapabilities(): Promise<CapabilityMap> {
  if (cachedCapabilities) return cachedCapabilities;

  const [webpEncode, avifEncode, avifDecode] = await Promise.all([
    testCanvasBlobEncode('image/webp'),
    testCanvasBlobEncode('image/avif'),
    testAvifDecode(),
  ]);

  cachedCapabilities = {
    jpg: {
      decode: true,
      encode: true,
      engine: 'native',
      note: 'Native browser Canvas JPEG codec',
    },
    png: {
      decode: true,
      encode: true,
      engine: 'native',
      note: 'Native browser Canvas PNG codec + palette quantization',
    },
    webp: {
      decode: true,
      encode: webpEncode,
      engine: webpEncode ? 'native' : 'unavailable',
      note: webpEncode
        ? 'Native browser WebP encoder & decoder'
        : 'This browser does not support WebP Canvas encoding.',
    },
    avif: {
      decode: avifDecode,
      encode: avifEncode,
      engine: avifEncode ? 'native' : avifDecode ? 'hybrid' : 'unavailable',
      note: avifEncode
        ? 'Native browser AVIF encoder & decoder'
        : avifDecode
          ? 'Browser decodes AVIF natively, but AVIF Canvas encoding is unavailable in this browser.'
          : 'AVIF encoding and decoding are unavailable in this browser.',
    },
    gif: {
      decode: true,
      encode: true,
      engine: 'wasm-js',
      note: 'Client-side omggif decoder & gifenc median-cut encoder',
    },
    bmp: {
      decode: true,
      encode: true,
      engine: 'wasm-js',
      note: 'Native BMP decode + pure TypeScript 24/32-bit DIB encoder',
    },
    tiff: {
      decode: true,
      encode: true,
      engine: 'wasm-js',
      note: 'Client-side UTIF.js TIFF decoder & encoder',
    },
    ico: {
      decode: true,
      encode: true,
      engine: 'wasm-js',
      note: 'Binary ICO directory parser & PNG-in-ICO container encoder',
    },
  };

  return cachedCapabilities;
}

export function detectCanvasHasAlpha(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;
  const { width, height } = canvas;
  // Sample efficiently on huge images while inspecting all pixels on normal ones
  const step = width * height > 2_000_000 ? 4 : 1;
  const data = ctx.getImageData(0, 0, width, height).data;
  for (let i = 3; i < data.length; i += 4 * step) {
    if (data[i] < 255) return true;
  }
  return false;
}

function loadImageElementFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Browser failed to decode image data. The file may be corrupted or unsupported.'));
    };
    img.src = url;
  });
}

function drawImageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to acquire 2D canvas context.');
  ctx.drawImage(img, 0, 0);
  return canvas;
}

async function decodeTiffBufferToCanvas(buffer: ArrayBuffer): Promise<HTMLCanvasElement> {
  const UTIF = await import('utif');
  const ifds = UTIF.decode(buffer);
  if (!ifds || ifds.length === 0) {
    throw new Error('Invalid TIFF file: no image frames found.');
  }
  const firstIfd = ifds[0];
  UTIF.decodeImage(buffer, firstIfd);
  const rgba = UTIF.toRGBA8(firstIfd);
  const width = Number(firstIfd.width || firstIfd.t256?.[0] || 0);
  const height = Number(firstIfd.height || firstIfd.t257?.[0] || 0);
  if (!width || !height) {
    throw new Error('Unable to read TIFF pixel dimensions.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to acquire 2D canvas context.');
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(rgba);
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

async function decodeIcoBufferToCanvas(buffer: ArrayBuffer): Promise<HTMLCanvasElement> {
  const view = new DataView(buffer);
  if (buffer.byteLength < 6) {
    throw new Error('Corrupted ICO file header.');
  }
  const count = view.getUint16(4, true);
  if (count === 0) {
    throw new Error('ICO archive contains zero icon entries.');
  }

  let bestEntry: { width: number; height: number; size: number; offset: number } | null = null;
  for (let i = 0; i < count; i++) {
    const base = 6 + i * 16;
    if (base + 16 > buffer.byteLength) break;
    const rawW = view.getUint8(base);
    const rawH = view.getUint8(base + 1);
    const w = rawW === 0 ? 256 : rawW;
    const h = rawH === 0 ? 256 : rawH;
    const size = view.getUint32(base + 8, true);
    const offset = view.getUint32(base + 12, true);
    if (!bestEntry || w * h > bestEntry.width * bestEntry.height) {
      bestEntry = { width: w, height: h, size, offset };
    }
  }

  if (!bestEntry || bestEntry.offset + bestEntry.size > buffer.byteLength) {
    // Fallback to browser native ICO decode
    const img = await loadImageElementFromBlob(new Blob([buffer], { type: 'image/x-icon' }));
    return drawImageToCanvas(img);
  }

  const slice = new Uint8Array(buffer, bestEntry.offset, bestEntry.size);
  // Check if entry is embedded PNG (89 50 4E 47)
  if (slice[0] === 0x89 && slice[1] === 0x50 && slice[2] === 0x4e && slice[3] === 0x47) {
    const img = await loadImageElementFromBlob(new Blob([slice], { type: 'image/png' }));
    return drawImageToCanvas(img);
  }

  // Otherwise let browser decode the whole ICO
  const img = await loadImageElementFromBlob(new Blob([buffer], { type: 'image/x-icon' }));
  return drawImageToCanvas(img);
}

export async function decodeFileToCanvas(
  file: File,
  format: ImageFormat | null
): Promise<{ canvas: HTMLCanvasElement; hasAlpha: boolean; previewUrl: string }> {
  let canvas: HTMLCanvasElement;

  if (format === 'tiff') {
    const buffer = await file.arrayBuffer();
    canvas = await decodeTiffBufferToCanvas(buffer);
  } else if (format === 'ico') {
    const buffer = await file.arrayBuffer();
    canvas = await decodeIcoBufferToCanvas(buffer);
  } else {
    const img = await loadImageElementFromBlob(file);
    canvas = drawImageToCanvas(img);
  }

  const hasAlpha = detectCanvasHasAlpha(canvas);

  // Use native file object URL when browser renders it directly; otherwise generate PNG preview URL
  let previewUrl: string;
  if (format === 'tiff') {
    const pngBlob = await canvasToBlobAsync(canvas, 'image/png', 1);
    previewUrl = URL.createObjectURL(pngBlob);
  } else {
    previewUrl = URL.createObjectURL(file);
  }

  return { canvas, hasAlpha, previewUrl };
}

export function canvasToBlobAsync(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Browser failed to encode ${mime}.`));
          return;
        }
        resolve(blob);
      },
      mime,
      quality
    );
  });
}

function flattenCanvasWithMatte(
  source: HTMLCanvasElement,
  matteColor: string
): HTMLCanvasElement {
  const flat = document.createElement('canvas');
  flat.width = source.width;
  flat.height = source.height;
  const ctx = flat.getContext('2d');
  if (!ctx) throw new Error('Unable to acquire 2D canvas context.');
  ctx.fillStyle = matteColor;
  ctx.fillRect(0, 0, flat.width, flat.height);
  ctx.drawImage(source, 0, 0);
  return flat;
}

function encodeBmpBlob(canvas: HTMLCanvasElement, matteColor = '#ffffff'): Blob {
  const flat = flattenCanvasWithMatte(canvas, matteColor);
  const ctx = flat.getContext('2d');
  if (!ctx) throw new Error('Unable to acquire 2D canvas context.');
  const { width, height } = flat;
  const pixels = ctx.getImageData(0, 0, width, height).data;

  // 24-bit DIB BMP with 4-byte row padding
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BITMAPFILEHEADER (14 bytes)
  view.setUint8(0, 0x42); // B
  view.setUint8(1, 0x4d); // M
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, 54, true);

  // BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // positive = bottom-up
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true); // BI_RGB
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  const bytes = new Uint8Array(buffer);
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y;
    const dstOffset = 54 + y * rowSize;
    for (let x = 0; x < width; x++) {
      const si = (srcRow * width + x) * 4;
      const di = dstOffset + x * 3;
      bytes[di] = pixels[si + 2]; // B
      bytes[di + 1] = pixels[si + 1]; // G
      bytes[di + 2] = pixels[si]; // R
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

async function encodeTiffBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const UTIF = await import('utif');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to acquire 2D canvas context.');
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  const tiffBuffer = UTIF.encodeImage(data, width, height);
  return new Blob([tiffBuffer], { type: 'image/tiff' });
}

async function encodeGifBlob(canvas: HTMLCanvasElement, maxColors = 256): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to acquire 2D canvas context.');
  const { width, height } = canvas;
  const rgba = ctx.getImageData(0, 0, width, height).data;

  const clampedColors = Math.max(16, Math.min(256, maxColors));
  const palette = quantize(rgba, clampedColors, {
    format: 'rgba4444',
    oneBitAlpha: true,
    clearAlpha: true,
    clearAlphaThreshold: 127,
  });
  const index = applyPalette(rgba, palette, 'rgba4444');
  const transparentIndex = palette.findIndex((c) => c[3] === 0);

  const gif = GIFEncoder();
  gif.writeFrame(index, width, height, {
    palette,
    transparent: transparentIndex !== -1,
    transparentIndex: transparentIndex !== -1 ? transparentIndex : 0,
  });
  gif.finish();

  const output = new Uint8Array(gif.bytes());
  return new Blob([output], { type: 'image/gif' });
}

async function encodeIcoBlob(sourceCanvas: HTMLCanvasElement): Promise<Blob> {
  // Resize cleanly to max 256x256 square or aspect-preserved icon PNG embedded in ICO
  const maxDim = Math.min(256, Math.max(sourceCanvas.width, sourceCanvas.height));
  const targetSize = maxDim >= 128 ? 256 : maxDim >= 64 ? 128 : 64;

  const iconCanvas = document.createElement('canvas');
  iconCanvas.width = targetSize;
  iconCanvas.height = targetSize;
  const ctx = iconCanvas.getContext('2d');
  if (!ctx) throw new Error('Unable to acquire 2D canvas context.');

  const scale = Math.min(
    targetSize / sourceCanvas.width,
    targetSize / sourceCanvas.height
  );
  const drawW = Math.round(sourceCanvas.width * scale);
  const drawH = Math.round(sourceCanvas.height * scale);
  const offsetX = Math.floor((targetSize - drawW) / 2);
  const offsetY = Math.floor((targetSize - drawH) / 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, offsetX, offsetY, drawW, drawH);

  const pngBlob = await canvasToBlobAsync(iconCanvas, 'image/png', 1);
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());

  const headerSize = 6 + 16;
  const buffer = new ArrayBuffer(headerSize + pngBytes.length);
  const view = new DataView(buffer);

  // ICONDIR
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type = 1 (ICO)
  view.setUint16(4, 1, true); // count = 1

  // ICONDIRENTRY
  const dimByte = targetSize >= 256 ? 0 : targetSize;
  view.setUint8(6, dimByte);
  view.setUint8(7, dimByte);
  view.setUint8(8, 0); // palette
  view.setUint8(9, 0); // reserved
  view.setUint16(10, 1, true); // planes
  view.setUint16(12, 32, true); // bpp
  view.setUint32(14, pngBytes.length, true); // size
  view.setUint32(18, headerSize, true); // offset

  new Uint8Array(buffer, headerSize).set(pngBytes);
  return new Blob([buffer], { type: 'image/x-icon' });
}

export interface EncodeOptions {
  quality?: number; // 0.01 - 1.0
  matteColor?: string;
}

export async function encodeCanvasToFormat(
  canvas: HTMLCanvasElement,
  targetFormat: ImageFormat,
  options: EncodeOptions = {}
): Promise<Blob> {
  const quality = Math.max(0.01, Math.min(1, options.quality ?? 0.85));
  const matteColor = options.matteColor ?? '#ffffff';
  const capabilities = await probeCodecCapabilities();

  if (!capabilities[targetFormat].encode) {
    throw new Error(
      `${FORMAT_CATALOG[targetFormat].label} encoding is not supported by your current browser. ${capabilities[targetFormat].note}`
    );
  }

  switch (targetFormat) {
    case 'jpg': {
      const flattened = flattenCanvasWithMatte(canvas, matteColor);
      return canvasToBlobAsync(flattened, 'image/jpeg', quality);
    }
    case 'png': {
      return canvasToBlobAsync(canvas, 'image/png', 1);
    }
    case 'webp': {
      const blob = await canvasToBlobAsync(canvas, 'image/webp', quality);
      if (blob.type !== 'image/webp') {
        throw new Error('This browser fell back to PNG because WebP encoding is unavailable.');
      }
      return blob;
    }
    case 'avif': {
      const blob = await canvasToBlobAsync(canvas, 'image/avif', quality);
      if (blob.type !== 'image/avif') {
        throw new Error('AVIF encoding is not supported in this browser version.');
      }
      return blob;
    }
    case 'bmp': {
      return encodeBmpBlob(canvas, matteColor);
    }
    case 'tiff': {
      return encodeTiffBlob(canvas);
    }
    case 'gif': {
      const colorCount = Math.max(16, Math.round(quality * 256));
      return encodeGifBlob(canvas, colorCount);
    }
    case 'ico': {
      return encodeIcoBlob(canvas);
    }
  }
}

export async function compressAnimatedGif(
  file: File,
  maxColors: number
): Promise<Blob> {
  const [{ GIFEncoder, quantize, applyPalette }, { GifReader }] = await Promise.all([
    import('gifenc'),
    import('omggif'),
  ]);
  const buf = new Uint8Array(await file.arrayBuffer());
  const reader = new GifReader(buf);
  const width = reader.width;
  const height = reader.height;
  const frameCount = reader.numFrames();
  const clampedColors = Math.max(16, Math.min(256, maxColors));

  const encoder = GIFEncoder();
  const composite = new Uint8ClampedArray(width * height * 4);
  const frameBuffer = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < frameCount; i++) {
    const info = reader.frameInfo(i);
    frameBuffer.fill(0);
    reader.decodeAndBlitFrameRGBA(i, frameBuffer);

    // Composite frame onto canvas buffer respecting transparency
    for (let p = 0; p < width * height; p++) {
      const idx = p * 4;
      if (frameBuffer[idx + 3] > 0) {
        composite[idx] = frameBuffer[idx];
        composite[idx + 1] = frameBuffer[idx + 1];
        composite[idx + 2] = frameBuffer[idx + 2];
        composite[idx + 3] = frameBuffer[idx + 3];
      }
    }

    const palette = quantize(composite, clampedColors, {
      format: 'rgba4444',
      oneBitAlpha: true,
      clearAlpha: true,
      clearAlphaThreshold: 127,
    });
    const indexed = applyPalette(composite, palette, 'rgba4444');
    const transparentIndex = palette.findIndex((c) => c[3] === 0);

    encoder.writeFrame(indexed, width, height, {
      palette,
      delay: Math.max(20, (info.delay || 10) * 10),
      repeat: i === 0 ? reader.loopCount() : undefined,
      transparent: transparentIndex !== -1,
      transparentIndex: transparentIndex !== -1 ? transparentIndex : 0,
    });

    if (info.disposal === 2) {
      for (let y = info.y; y < info.y + info.height; y++) {
        for (let x = info.x; x < info.x + info.width; x++) {
          const idx = (y * width + x) * 4;
          composite[idx] = 0;
          composite[idx + 1] = 0;
          composite[idx + 2] = 0;
          composite[idx + 3] = 0;
        }
      }
    }
  }

  encoder.finish();
  return new Blob([new Uint8Array(encoder.bytes())], { type: 'image/gif' });
}
