import exifr from 'exifr';
import { decodeFileToCanvas, encodeCanvasToFormat } from '@/src/lib/image/codecs';
import { stripExtension } from '@/src/lib/utils';
import { FORMAT_CATALOG, type ImageFormat, type WorkspaceImage } from '@/src/types/image';

export interface ParsedImageMetadata {
  raw: Record<string, unknown>;
  camera: Record<string, string>;
  exposure: Record<string, string>;
  gps: { latitude: number; longitude: number; altitude?: number } | null;
  fileDetails: Record<string, string>;
  hasMetadata: boolean;
}

function formatExifValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (val instanceof Date) return val.toISOString().replace('T', ' ').slice(0, 19);
  if (Array.isArray(val)) return val.map(formatExifValue).join(', ');
  if (typeof val === 'number') return Number.isInteger(val) ? String(val) : val.toFixed(4);
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

export async function extractImageMetadata(item: WorkspaceImage): Promise<ParsedImageMetadata> {
  let raw: Record<string, unknown> = {};
  try {
    const parsed = await exifr.parse(item.file, {
      tiff: true,
      exif: true,
      gps: true,
      xmp: true,
      icc: true,
      iptc: true,
      jfif: true,
      ihdr: true,
    });
    if (parsed && typeof parsed === 'object') {
      raw = parsed as Record<string, unknown>;
    }
  } catch {
    raw = {};
  }

  const camera: Record<string, string> = {};
  const exposure: Record<string, string> = {};
  const fileDetails: Record<string, string> = {
    'File Name': item.name,
    'Detected Format': item.detectedFormat ? FORMAT_CATALOG[item.detectedFormat].label : 'Unknown',
    'Declared MIME': item.declaredMime || 'None',
    'Magic Header': item.hexHeader,
    'Dimensions': `${item.width} × ${item.height} px`,
    'Aspect Ratio': `${(item.width / Math.max(1, item.height)).toFixed(3)}:1`,
    'Transparency (Alpha)': item.hasAlpha ? 'Present' : 'Opaque',
  };

  const assignIfPresent = (target: Record<string, string>, label: string, key: string, suffix = '') => {
    const v = raw[key];
    if (v !== undefined && v !== null && v !== '') {
      target[label] = `${formatExifValue(v)}${suffix}`;
    }
  };

  assignIfPresent(camera, 'Camera Make', 'Make');
  assignIfPresent(camera, 'Camera Model', 'Model');
  assignIfPresent(camera, 'Lens Model', 'LensModel');
  assignIfPresent(camera, 'Software', 'Software');
  assignIfPresent(camera, 'Date Taken', 'DateTimeOriginal');
  assignIfPresent(camera, 'Color Space', 'ColorSpace');
  assignIfPresent(camera, 'ICC Profile', 'ProfileDescription');

  if (typeof raw.ExposureTime === 'number') {
    const exp = raw.ExposureTime;
    exposure['Shutter Speed'] = exp < 1 ? `1/${Math.round(1 / exp)} s` : `${exp} s`;
  }
  if (typeof raw.FNumber === 'number') {
    exposure['Aperture'] = `f/${raw.FNumber}`;
  }
  assignIfPresent(exposure, 'ISO', 'ISO');
  assignIfPresent(exposure, 'Focal Length', 'FocalLength', ' mm');
  assignIfPresent(exposure, 'Flash', 'Flash');
  assignIfPresent(exposure, 'White Balance', 'WhiteBalance');

  let gps: ParsedImageMetadata['gps'] = null;
  if (typeof raw.latitude === 'number' && typeof raw.longitude === 'number') {
    gps = {
      latitude: raw.latitude,
      longitude: raw.longitude,
      altitude: typeof raw.GPSAltitude === 'number' ? raw.GPSAltitude : undefined,
    };
  }

  return {
    raw,
    camera,
    exposure,
    gps,
    fileDetails,
    hasMetadata: Object.keys(raw).length > 0,
  };
}

export async function stripImageMetadata(item: WorkspaceImage): Promise<{
  blob: Blob;
  filename: string;
}> {
  const { canvas } = await decodeFileToCanvas(item.file, item.detectedFormat);
  const fmt: ImageFormat = item.detectedFormat && item.detectedFormat !== 'tiff' ? item.detectedFormat : 'png';
  const blob = await encodeCanvasToFormat(canvas, fmt, {
    quality: 0.95,
    matteColor: '#ffffff',
  });
  return {
    blob,
    filename: `${stripExtension(item.name)}-clean.${FORMAT_CATALOG[fmt].extension}`,
  };
}
