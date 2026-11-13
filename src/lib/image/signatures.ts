import { FORMAT_CATALOG, type ImageFormat, type SignatureInspection } from '@/src/types/image';

function toHex(bytes: Uint8Array, length = 16): string {
  return Array.from(bytes.slice(0, length))
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

function asciiAt(bytes: Uint8Array, start: number, len: number): string {
  if (bytes.length < start + len) return '';
  let s = '';
  for (let i = start; i < start + len; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return s;
}

export function detectSignatureFromBytes(buffer: ArrayBuffer): SignatureInspection {
  const bytes = new Uint8Array(buffer);
  const hexHeader = toHex(bytes, 16);

  if (bytes.length < 4) {
    return {
      format: null,
      confidence: 'unknown',
      detectedMime: 'application/octet-stream',
      hexHeader,
      description: 'File too small to contain a valid image header.',
    };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return {
      format: 'png',
      confidence: 'exact',
      detectedMime: FORMAT_CATALOG.png.mime,
      hexHeader,
      description: 'PNG magic signature (89 50 4E 47 0D 0A 1A 0A)',
    };
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return {
      format: 'jpg',
      confidence: 'exact',
      detectedMime: FORMAT_CATALOG.jpg.mime,
      hexHeader,
      description: 'JPEG SOI + marker signature (FF D8 FF)',
    };
  }

  // WebP: RIFF....WEBP
  if (
    bytes.length >= 12 &&
    asciiAt(bytes, 0, 4) === 'RIFF' &&
    asciiAt(bytes, 8, 4) === 'WEBP'
  ) {
    return {
      format: 'webp',
      confidence: 'exact',
      detectedMime: FORMAT_CATALOG.webp.mime,
      hexHeader,
      description: 'RIFF WEBP container signature',
    };
  }

  // GIF: GIF87a or GIF89a
  if (bytes.length >= 6) {
    const gifSig = asciiAt(bytes, 0, 6);
    if (gifSig === 'GIF87a' || gifSig === 'GIF89a') {
      return {
        format: 'gif',
        confidence: 'exact',
        detectedMime: FORMAT_CATALOG.gif.mime,
        hexHeader,
        description: `Graphics Interchange Format (${gifSig})`,
      };
    }
  }

  // BMP: 42 4D ("BM")
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return {
      format: 'bmp',
      confidence: 'exact',
      detectedMime: FORMAT_CATALOG.bmp.mime,
      hexHeader,
      description: 'Windows Bitmap header (42 4D / BM)',
    };
  }

  // TIFF: II*\0 (49 49 2A 00) or MM\0* (4D 4D 00 2A)
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
    (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a)
  ) {
    return {
      format: 'tiff',
      confidence: 'exact',
      detectedMime: FORMAT_CATALOG.tiff.mime,
      hexHeader,
      description:
        bytes[0] === 0x49
          ? 'TIFF Little-Endian header (49 49 2A 00)'
          : 'TIFF Big-Endian header (4D 4D 00 2A)',
    };
  }

  // ICO: 00 00 01 00
  if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) {
    return {
      format: 'ico',
      confidence: 'exact',
      detectedMime: FORMAT_CATALOG.ico.mime,
      hexHeader,
      description: 'Windows Icon directory header (00 00 01 00)',
    };
  }

  // AVIF: ISO Base Media File Format ftyp box containing avif / avis / mif1
  if (bytes.length >= 12 && asciiAt(bytes, 4, 4) === 'ftyp') {
    const brandSlice = asciiAt(bytes, 8, Math.min(24, bytes.length - 8));
    if (brandSlice.includes('avif') || brandSlice.includes('avis')) {
      return {
        format: 'avif',
        confidence: 'exact',
        detectedMime: FORMAT_CATALOG.avif.mime,
        hexHeader,
        description: 'ISO BMFF AV1 Image File Format (ftyp avif/avis)',
      };
    }
  }

  return {
    format: null,
    confidence: 'unknown',
    detectedMime: 'application/octet-stream',
    hexHeader,
    description: 'Unrecognized or unsupported binary file header.',
  };
}

export async function inspectFileSignature(file: File): Promise<SignatureInspection> {
  const headerSlice = file.slice(0, 64);
  const buffer = await headerSlice.arrayBuffer();
  return detectSignatureFromBytes(buffer);
}

export function normalizeDeclaredMime(mime: string): ImageFormat | null {
  const lower = mime.toLowerCase().trim();
  if (lower === 'image/jpeg' || lower === 'image/jpg') return 'jpg';
  if (lower === 'image/png') return 'png';
  if (lower === 'image/webp') return 'webp';
  if (lower === 'image/avif') return 'avif';
  if (lower === 'image/gif') return 'gif';
  if (lower === 'image/bmp' || lower === 'image/x-ms-bmp') return 'bmp';
  if (lower === 'image/tiff' || lower === 'image/x-tiff') return 'tiff';
  if (lower === 'image/x-icon' || lower === 'image/vnd.microsoft.icon') return 'ico';
  return null;
}

export function formatFromFilename(name: string): ImageFormat | null {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'jpe') return 'jpg';
  if (ext === 'png') return 'png';
  if (ext === 'webp') return 'webp';
  if (ext === 'avif') return 'avif';
  if (ext === 'gif') return 'gif';
  if (ext === 'bmp' || ext === 'dib') return 'bmp';
  if (ext === 'tif' || ext === 'tiff') return 'tiff';
  if (ext === 'ico') return 'ico';
  return null;
}
