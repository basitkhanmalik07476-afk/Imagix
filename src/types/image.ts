export type ImageFormat =
  | 'jpg'
  | 'png'
  | 'webp'
  | 'avif'
  | 'gif'
  | 'bmp'
  | 'tiff'
  | 'ico';

export interface FormatInfo {
  id: ImageFormat;
  label: string;
  extension: string;
  mime: string;
  aliases: string[];
  supportsLossy: boolean;
  supportsTransparency: boolean;
  description: string;
}

export interface CodecCapability {
  decode: boolean;
  encode: boolean;
  engine: 'native' | 'wasm-js' | 'hybrid' | 'unavailable';
  note: string;
}

export type CapabilityMap = Record<ImageFormat, CodecCapability>;

export interface SignatureInspection {
  format: ImageFormat | null;
  confidence: 'exact' | 'heuristic' | 'unknown';
  detectedMime: string;
  hexHeader: string;
  description: string;
}

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';

export interface ProcessedResult {
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  format: ImageFormat;
  durationMs: number;
  filename: string;
}

export interface WorkspaceImage {
  id: string;
  file: File;
  name: string;
  detectedFormat: ImageFormat | null;
  declaredMime: string;
  detectedMime: string;
  mimeMismatch: boolean;
  hexHeader: string;
  originalSize: number;
  width: number;
  height: number;
  hasAlpha: boolean;
  previewUrl: string;
  status: ProcessingStatus;
  progress: number;
  errorMessage?: string;
  result?: ProcessedResult;
}

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB per image
export const MAX_FILE_SIZE_LABEL = '50 MB';

export const FORMAT_CATALOG: Record<ImageFormat, FormatInfo> = {
  jpg: {
    id: 'jpg',
    label: 'JPG / JPEG',
    extension: 'jpg',
    mime: 'image/jpeg',
    aliases: ['jpeg', 'jpe'],
    supportsLossy: true,
    supportsTransparency: false,
    description: 'Standard lossy photographic format with wide compatibility.',
  },
  png: {
    id: 'png',
    label: 'PNG',
    extension: 'png',
    mime: 'image/png',
    aliases: [],
    supportsLossy: true,
    supportsTransparency: true,
    description: 'Lossless raster format with full alpha channel transparency.',
  },
  webp: {
    id: 'webp',
    label: 'WebP',
    extension: 'webp',
    mime: 'image/webp',
    aliases: [],
    supportsLossy: true,
    supportsTransparency: true,
    description: 'Modern web image format supporting both lossy and lossless compression with alpha.',
  },
  avif: {
    id: 'avif',
    label: 'AVIF',
    extension: 'avif',
    mime: 'image/avif',
    aliases: [],
    supportsLossy: true,
    supportsTransparency: true,
    description: 'Next-generation AV1-based image format offering high compression efficiency.',
  },
  gif: {
    id: 'gif',
    label: 'GIF',
    extension: 'gif',
    mime: 'image/gif',
    aliases: [],
    supportsLossy: true,
    supportsTransparency: true,
    description: 'Indexed 256-color raster format supporting single-bit transparency and animation.',
  },
  bmp: {
    id: 'bmp',
    label: 'BMP',
    extension: 'bmp',
    mime: 'image/bmp',
    aliases: ['dib'],
    supportsLossy: false,
    supportsTransparency: false,
    description: 'Uncompressed device-independent bitmap image format.',
  },
  tiff: {
    id: 'tiff',
    label: 'TIFF',
    extension: 'tiff',
    mime: 'image/tiff',
    aliases: ['tif'],
    supportsLossy: false,
    supportsTransparency: true,
    description: 'High-fidelity archival raster format used in print and photography.',
  },
  ico: {
    id: 'ico',
    label: 'ICO',
    extension: 'ico',
    mime: 'image/x-icon',
    aliases: ['cur'],
    supportsLossy: false,
    supportsTransparency: true,
    description: 'Windows & web favicon container supporting alpha transparency.',
  },
};

export const ALL_FORMATS: ImageFormat[] = [
  'jpg',
  'png',
  'webp',
  'avif',
  'gif',
  'bmp',
  'tiff',
  'ico',
];
