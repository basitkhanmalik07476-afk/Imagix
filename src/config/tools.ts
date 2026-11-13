import type { ImageFormat } from '@/src/types/image';

export type ToolCategory = 'optimize' | 'convert' | 'edit' | 'inspect';

export type ToolWorkspaceKind =
  | 'compressor'
  | 'converter'
  | 'resizer'
  | 'cropper'
  | 'rotator'
  | 'flipper'
  | 'metadata'
  | 'image-to-base64'
  | 'base64-to-image'
  | 'format-detector';

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolDefinition {
  slug: string;
  path: string;
  name: string;
  shortName: string;
  category: ToolCategory;
  kind: ToolWorkspaceKind;
  description: string;
  seoTitle: string;
  seoDescription: string;
  defaultSourceFormat?: ImageFormat;
  defaultTargetFormat?: ImageFormat;
  lockedTargetFormat?: boolean;
  isPopular?: boolean;
  faqs: ToolFaq[];
}

export const TOOLS_REGISTRY: ToolDefinition[] = [
  {
    slug: 'image-compressor',
    path: '/tools/image-compressor',
    name: 'Image Compressor',
    shortName: 'Compressor',
    category: 'optimize',
    kind: 'compressor',
    description: 'Reduce JPG, PNG, WebP, AVIF, and GIF file sizes with real-time before/after comparison and batch ZIP download.',
    seoTitle: 'Image Compressor – Reduce Image Size Without Losing Quality | Imagix',
    seoDescription: 'Compress JPG, PNG, WebP, AVIF, and GIF images locally in your browser. Inspect before/after quality, exact byte savings, and export as ZIP.',
    isPopular: true,
    faqs: [
      {
        q: 'How does Imagix compress images without uploading them?',
        a: 'Imagix runs compression inside Web Workers using browser-image-compression, palette quantization for PNG, and frame-aware quantization for GIF directly in browser memory.',
      },
      {
        q: 'Why can a PNG or already-optimized JPG show smaller savings?',
        a: 'Imagix reports exact byte differences from real encoder output. If an image was already heavily compressed, further aggressive reduction is optional via the quality slider.',
      },
    ],
  },
  {
    slug: 'image-converter',
    path: '/tools/image-converter',
    name: 'Image Converter',
    shortName: 'Converter',
    category: 'convert',
    kind: 'converter',
    description: 'Convert between JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, and ICO with automatic transparency handling and batch export.',
    seoTitle: 'Image Converter – Convert JPG, PNG, WebP, AVIF, TIFF & ICO | Imagix',
    seoDescription: 'Convert images locally between JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, and ICO with magic-byte format detection and alpha matte control.',
    isPopular: true,
    faqs: [
      {
        q: 'What happens to transparency when converting PNG or WebP to JPG?',
        a: 'Since JPG and BMP do not support alpha transparency, Imagix lets you pick a matte background color before flattening and encoding.',
      },
      {
        q: 'Are all formats supported in every browser?',
        a: 'Imagix probes native Canvas codecs (such as AVIF and WebP) at startup and combines them with bundled JS/WASM encoders for TIFF, GIF, BMP, and ICO. Any unsupported path displays a clear capability notice.',
      },
    ],
  },
  {
    slug: 'image-resizer',
    path: '/tools/image-resizer',
    name: 'Image Resizer',
    shortName: 'Resizer',
    category: 'edit',
    kind: 'resizer',
    description: 'Resize images to exact pixel dimensions, percentages, or social media presets using high-precision Lanczos3 resampling.',
    seoTitle: 'Image Resizer – High-Quality Pixel & Preset Resizing | Imagix',
    seoDescription: 'Resize images by custom dimensions, percentage scale, or social media and website thumbnail presets using Pica Lanczos3 resampling.',
    isPopular: true,
    faqs: [
      {
        q: 'What resampling engine powers the Image Resizer?',
        a: 'Imagix uses Pica with Lanczos3 filtering and subtle sharpening to avoid blurry downscaled edges and preserve fine text or product details.',
      },
    ],
  },
  {
    slug: 'image-cropper',
    path: '/tools/image-cropper',
    name: 'Image Cropper',
    shortName: 'Cropper',
    category: 'edit',
    kind: 'cropper',
    description: 'Interactive cropping with freeform, square, landscape, portrait, and custom aspect ratios plus rotation and flipping.',
    seoTitle: 'Image Cropper – Crop, Rotate & Flip Images Online | Imagix',
    seoDescription: 'Crop images interactively with square, 16:9, 4:3, portrait, or custom aspect ratios, plus 90-degree rotation and horizontal/vertical flips.',
    isPopular: true,
    faqs: [
      {
        q: 'Can I enter a custom aspect ratio in the cropper?',
        a: 'Yes. Select Custom Ratio and input any width-to-height ratio (such as 21:9 or 5:4) alongside freeform, 1:1, 16:9, 4:3, and 9:16 presets.',
      },
    ],
  },
  {
    slug: 'jpg-to-webp',
    path: '/tools/jpg-to-webp',
    name: 'JPG to WebP',
    shortName: 'JPG to WebP',
    category: 'convert',
    kind: 'converter',
    description: 'Convert JPEG photographs into compact WebP assets for faster Core Web Vitals and modern browser delivery.',
    seoTitle: 'JPG to WebP Converter – Fast Client-Side WebP Encoding | Imagix',
    seoDescription: 'Convert JPG and JPEG images to WebP locally in your browser with adjustable quality and batch ZIP download.',
    defaultSourceFormat: 'jpg',
    defaultTargetFormat: 'webp',
    isPopular: true,
    faqs: [
      {
        q: 'How much smaller is WebP compared to JPG?',
        a: 'At comparable visual quality (75–85%), WebP typically reduces photographic payload sizes while maintaining sharp edges.',
      },
    ],
  },
  {
    slug: 'png-to-jpg',
    path: '/tools/png-to-jpg',
    name: 'PNG to JPG',
    shortName: 'PNG to JPG',
    category: 'convert',
    kind: 'converter',
    description: 'Convert heavy PNG screenshots and graphics into lightweight JPG files with customizable background matte fill.',
    seoTitle: 'PNG to JPG Converter – Flatten Alpha & Reduce File Size | Imagix',
    seoDescription: 'Convert PNG images to JPG locally with custom background fill for transparent pixels, quality slider, and batch ZIP export.',
    defaultSourceFormat: 'png',
    defaultTargetFormat: 'jpg',
    isPopular: true,
    faqs: [
      {
        q: 'How are transparent PNG areas handled when converting to JPG?',
        a: 'You can pick white, black, or any custom hex color to composite behind transparent pixels prior to JPEG encoding.',
      },
    ],
  },
  {
    slug: 'webp-to-png',
    path: '/tools/webp-to-png',
    name: 'WebP to PNG',
    shortName: 'WebP to PNG',
    category: 'convert',
    kind: 'converter',
    description: 'Convert WebP graphics back into universal lossless PNG files while preserving full alpha transparency.',
    seoTitle: 'WebP to PNG Converter – Lossless & Alpha-Safe | Imagix',
    seoDescription: 'Convert WebP images to lossless PNG in your browser while preserving transparent backgrounds and crisp edges.',
    defaultSourceFormat: 'webp',
    defaultTargetFormat: 'png',
    isPopular: true,
    faqs: [
      {
        q: 'Does WebP to PNG preserve transparent backgrounds?',
        a: 'Yes. Imagix decodes the full RGBA pixel buffer so alpha channels remain completely intact in the output PNG.',
      },
    ],
  },
  {
    slug: 'bulk-image-compressor',
    path: '/tools/bulk-image-compressor',
    name: 'Bulk Image Compressor',
    shortName: 'Bulk Compressor',
    category: 'optimize',
    kind: 'compressor',
    description: 'Batch compress dozens of mixed JPG, PNG, WebP, and GIF assets simultaneously and download everything in one ZIP archive.',
    seoTitle: 'Bulk Image Compressor – Batch Optimize & Export ZIP | Imagix',
    seoDescription: 'Compress multiple images at once in browser Web Workers, inspect individual byte savings, and download all results in a single ZIP file.',
    isPopular: true,
    faqs: [
      {
        q: 'Is there a batch limit for bulk compression?',
        a: 'Each file is capped at 50 MB to keep browser memory stable, and images are processed sequentially/in workers so the interface stays responsive.',
      },
    ],
  },
  {
    slug: 'png-to-webp',
    path: '/tools/png-to-webp',
    name: 'PNG to WebP',
    shortName: 'PNG to WebP',
    category: 'convert',
    kind: 'converter',
    description: 'Convert transparent PNG UI assets and illustrations to WebP while preserving alpha channels.',
    seoTitle: 'PNG to WebP Converter – Transparent WebP Export | Imagix',
    seoDescription: 'Convert PNG files to WebP in your browser while preserving alpha transparency and adjusting compression quality.',
    defaultSourceFormat: 'png',
    defaultTargetFormat: 'webp',
    faqs: [],
  },
  {
    slug: 'jpg-to-png',
    path: '/tools/jpg-to-png',
    name: 'JPG to PNG',
    shortName: 'JPG to PNG',
    category: 'convert',
    kind: 'converter',
    description: 'Convert JPEG images into lossless PNG containers ready for editing or lossless archiving.',
    seoTitle: 'JPG to PNG Converter – Client-Side Lossless PNG | Imagix',
    seoDescription: 'Convert JPG files to lossless PNG directly in your browser with batch ZIP export.',
    defaultSourceFormat: 'jpg',
    defaultTargetFormat: 'png',
    faqs: [],
  },
  {
    slug: 'webp-to-jpg',
    path: '/tools/webp-to-jpg',
    name: 'WebP to JPG',
    shortName: 'WebP to JPG',
    category: 'convert',
    kind: 'converter',
    description: 'Convert WebP photos to universally compatible JPG files with custom matte color for alpha regions.',
    seoTitle: 'WebP to JPG Converter – Universal JPEG Output | Imagix',
    seoDescription: 'Convert WebP images to standard JPG files in your browser with quality control and alpha matte filling.',
    defaultSourceFormat: 'webp',
    defaultTargetFormat: 'jpg',
    faqs: [],
  },
  {
    slug: 'png-to-avif',
    path: '/tools/png-to-avif',
    name: 'PNG to AVIF',
    shortName: 'PNG to AVIF',
    category: 'convert',
    kind: 'converter',
    description: 'Encode transparent PNG images into next-generation AVIF when supported by your browser encoder.',
    seoTitle: 'PNG to AVIF Converter – Next-Gen AV1 Image Encoding | Imagix',
    seoDescription: 'Convert PNG images to AVIF locally in supported browsers with alpha transparency preservation.',
    defaultSourceFormat: 'png',
    defaultTargetFormat: 'avif',
    faqs: [],
  },
  {
    slug: 'jpg-to-avif',
    path: '/tools/jpg-to-avif',
    name: 'JPG to AVIF',
    shortName: 'JPG to AVIF',
    category: 'convert',
    kind: 'converter',
    description: 'Convert JPEG photographs into high-efficiency AVIF images directly inside supported browsers.',
    seoTitle: 'JPG to AVIF Converter – High-Efficiency AVIF Export | Imagix',
    seoDescription: 'Convert JPG photos to AVIF locally in your browser with adjustable encoding quality.',
    defaultSourceFormat: 'jpg',
    defaultTargetFormat: 'avif',
    faqs: [],
  },
  {
    slug: 'jpg-compressor',
    path: '/tools/jpg-compressor',
    name: 'JPG Compressor',
    shortName: 'JPG Compressor',
    category: 'optimize',
    kind: 'compressor',
    description: 'Targeted JPEG quality optimization with side-by-side visual inspection and byte-savings metrics.',
    seoTitle: 'JPG Compressor – Optimize JPEG Photos Locally | Imagix',
    seoDescription: 'Compress JPG and JPEG photos from 1% to 100% quality with live before/after comparison and batch ZIP download.',
    defaultTargetFormat: 'jpg',
    lockedTargetFormat: true,
    faqs: [],
  },
  {
    slug: 'png-compressor',
    path: '/tools/png-compressor',
    name: 'PNG Compressor',
    shortName: 'PNG Compressor',
    category: 'optimize',
    kind: 'compressor',
    description: 'Optimize PNG graphics using adaptive color quantization while keeping alpha transparency intact.',
    seoTitle: 'PNG Compressor – Alpha-Safe PNG Optimization | Imagix',
    seoDescription: 'Compress PNG graphics locally in your browser while preserving transparent backgrounds.',
    defaultTargetFormat: 'png',
    lockedTargetFormat: true,
    faqs: [],
  },
  {
    slug: 'webp-compressor',
    path: '/tools/webp-compressor',
    name: 'WebP Compressor',
    shortName: 'WebP Compressor',
    category: 'optimize',
    kind: 'compressor',
    description: 'Fine-tune WebP lossy quality to minimize web payload size while inspecting artifact thresholds.',
    seoTitle: 'WebP Compressor – Optimize WebP File Sizes | Imagix',
    seoDescription: 'Compress WebP images locally in your browser with real-time quality control and ZIP download.',
    defaultTargetFormat: 'webp',
    lockedTargetFormat: true,
    faqs: [],
  },
  {
    slug: 'gif-compressor',
    path: '/tools/gif-compressor',
    name: 'GIF Compressor',
    shortName: 'GIF Compressor',
    category: 'optimize',
    kind: 'compressor',
    description: 'Reduce animated and static GIF sizes by optimizing per-frame color palettes in browser memory.',
    seoTitle: 'GIF Compressor – Frame-Preserving GIF Palette Optimizer | Imagix',
    seoDescription: 'Compress static and animated GIF files locally by reducing palette colors while preserving frame timings.',
    defaultTargetFormat: 'gif',
    lockedTargetFormat: true,
    faqs: [],
  },
  {
    slug: 'image-rotator',
    path: '/tools/image-rotator',
    name: 'Image Rotator',
    shortName: 'Rotator',
    category: 'edit',
    kind: 'rotator',
    description: 'Rotate images by 90°, 180°, 270°, or any custom angle with live canvas preview and format export.',
    seoTitle: 'Image Rotator – Rotate Images 90°, 180° or Custom Angle | Imagix',
    seoDescription: 'Rotate photos and graphics cleanly in your browser by fixed 90-degree steps or fine custom angles.',
    faqs: [],
  },
  {
    slug: 'image-flipper',
    path: '/tools/image-flipper',
    name: 'Image Flipper',
    shortName: 'Flipper',
    category: 'edit',
    kind: 'flipper',
    description: 'Mirror images horizontally or vertically with instant pixel-accurate canvas preview and batch export.',
    seoTitle: 'Image Flipper – Mirror Images Horizontally & Vertically | Imagix',
    seoDescription: 'Flip images horizontally or vertically locally in your browser without quality degradation.',
    faqs: [],
  },
  {
    slug: 'image-metadata-viewer',
    path: '/tools/image-metadata-viewer',
    name: 'Image Metadata Viewer',
    shortName: 'Metadata Viewer',
    category: 'inspect',
    kind: 'metadata',
    description: 'Inspect EXIF camera data, exposure settings, ICC profiles, GPS coordinates, and strip metadata cleanly.',
    seoTitle: 'Image Metadata Viewer & EXIF Stripper | Imagix',
    seoDescription: 'Read EXIF, IPTC, XMP, ICC, and GPS metadata from local images and export privacy-safe stripped copies.',
    isPopular: true,
    faqs: [],
  },
  {
    slug: 'image-to-base64',
    path: '/tools/image-to-base64',
    name: 'Image to Base64',
    shortName: 'Image to Base64',
    category: 'inspect',
    kind: 'image-to-base64',
    description: 'Encode local images into Data URIs, raw Base64 strings, CSS background snippets, and HTML img tags.',
    seoTitle: 'Image to Base64 Converter – Data URI, CSS & HTML Snippets | Imagix',
    seoDescription: 'Convert any image into Base64 Data URIs, CSS url() blocks, or HTML snippets locally with one-click copy.',
    faqs: [],
  },
  {
    slug: 'base64-to-image',
    path: '/tools/base64-to-image',
    name: 'Base64 to Image',
    shortName: 'Base64 to Image',
    category: 'inspect',
    kind: 'base64-to-image',
    description: 'Decode Data URIs or raw Base64 image payloads, inspect format & pixel dimensions, and download as a file.',
    seoTitle: 'Base64 to Image Decoder – Preview & Download Images | Imagix',
    seoDescription: 'Decode Base64 strings or Data URIs back into downloadable PNG, JPG, WebP, or GIF image files.',
    faqs: [],
  },
  {
    slug: 'image-format-detector',
    path: '/tools/image-format-detector',
    name: 'Image Format Detector',
    shortName: 'Format Detector',
    category: 'inspect',
    kind: 'format-detector',
    description: 'Inspect binary magic-byte headers, detect spoofed extensions or MIME mismatches, and verify alpha channels.',
    seoTitle: 'Image Format Detector – Binary Magic-Byte Signature Inspector | Imagix',
    seoDescription: 'Verify true image formats by inspecting binary magic-byte file headers, declared MIME mismatches, and alpha channels.',
    faqs: [],
  },
];

export const POPULAR_TOOLS = TOOLS_REGISTRY.filter((t) => t.isPopular);

export function findToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS_REGISTRY.find((t) => t.slug === slug);
}
