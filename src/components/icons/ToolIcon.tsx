import { cn } from '@/src/lib/utils';

interface ToolIconProps {
  slug: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<ToolIconProps['size']>, string> = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
};

/**
 * Renders a distinct, precision vector icon tailored to each of the 23 Imagix tools.
 * Uses currentColor with subtle layered opacity for clean monochrome or emerald-tinted contrast.
 */
export function ToolIcon({ slug, className, size = 'sm' }: ToolIconProps) {
  const cls = cn(SIZE_CLASSES[size], 'shrink-0', className);

  // Conversion pair badges: crisp directional format mini-emblems
  const pairMap: Record<string, [string, string]> = {
    'jpg-to-webp': ['JPG', 'WBP'],
    'png-to-jpg': ['PNG', 'JPG'],
    'webp-to-png': ['WBP', 'PNG'],
    'png-to-webp': ['PNG', 'WBP'],
    'jpg-to-png': ['JPG', 'PNG'],
    'webp-to-jpg': ['WBP', 'JPG'],
    'png-to-avif': ['PNG', 'AVF'],
    'jpg-to-avif': ['JPG', 'AVF'],
  };

  if (pairMap[slug]) {
    const [from, to] = pairMap[slug];
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
        <rect
          x="2"
          y="3"
          width="11.5"
          height="8"
          rx="2"
          fill="currentColor"
          fillOpacity="0.14"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="7.75"
          y="8.4"
          textAnchor="middle"
          fill="currentColor"
          fontSize="4.1"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {from}
        </text>
        <path
          d="M15.5 6.5h3.5a2 2 0 0 1 2 2v1.5m0 0-1.6-1.6M21 10l1.6-1.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="10.5"
          y="13"
          width="11.5"
          height="8"
          rx="2"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="16.25"
          y="18.4"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="4.1"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {to}
        </text>
      </svg>
    );
  }

  switch (slug) {
    case 'image-compressor':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.7" fill="currentColor" fillOpacity="0.08" />
          <path d="M8 8l3 3m0 0H8.5m2.5 0V8.5M16 16l-3-3m0 0h2.5m-2.5 0v2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 8l-3 3M8 16l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.55" />
        </svg>
      );

    case 'bulk-image-compressor':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <rect x="6" y="3" width="14" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
          <rect x="4" y="6.5" width="14" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
          <path d="M11 10v5.5m0 0-2.2-2.2M11 15.5l2.2-2.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 20.5h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );

    case 'jpg-compressor':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.2-1.8a1.5 1.5 0 0 1 1.25-.7h2.1a1.5 1.5 0 0 1 1.25.7L15.5 6h2A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-9Z" stroke="currentColor" strokeWidth="1.7" fill="currentColor" fillOpacity="0.08" />
          <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="13" r="1.2" fill="currentColor" />
        </svg>
      );

    case 'png-compressor':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" stroke="currentColor" strokeWidth="1.7" />
          <rect x="7" y="7" width="5" height="5" fill="currentColor" fillOpacity="0.22" />
          <rect x="12" y="12" width="5" height="5" fill="currentColor" fillOpacity="0.22" />
          <path d="M12 6.5v11M6.5 12h11" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.4" />
        </svg>
      );

    case 'webp-compressor':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" fill="currentColor" fillOpacity="0.08" />
          <path d="M7.5 13.5c1.5-3 3.2-3 4.5 0s3 3 4.5 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M12 6v2.5M12 15.5V18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 'gif-compressor':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" fill="currentColor" fillOpacity="0.08" />
          <path d="M7 5v14M17 5v14M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10.5 9.8v4.4l3.6-2.2-3.6-2.2Z" fill="currentColor" />
        </svg>
      );

    case 'image-converter':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <rect x="3" y="4" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" fill="currentColor" fillOpacity="0.1" />
          <rect x="12" y="11" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" fill="currentColor" fillOpacity="0.22" />
          <path d="M15 4h3.5A2.5 2.5 0 0 1 21 6.5V8m0 0-1.6-1.6M21 8l1.6-1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 20H5.5A2.5 2.5 0 0 1 3 17.5V16m0 0 1.6 1.6M3 16l-1.6 1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'image-resizer':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 2.2" />
          <rect x="5" y="10.5" width="8.5" height="8.5" rx="1.8" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.6" />
          <path d="M15 9l3.5-3.5m0 0H15.5m3 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'image-cropper':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M6.5 3v12.5A2 2 0 0 0 8.5 17.5H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3 6.5h12.5A2 2 0 0 1 17.5 8.5V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'image-rotator':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M19.5 11.5A7.5 7.5 0 1 0 17.3 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M19.5 6.5v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );

    case 'image-flipper':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M12 3.5v17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2.5 2.5" />
          <path d="M9 6.5 4 17.5h5V6.5Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="m15 6.5 5 11h-5V6.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );

    case 'image-metadata-viewer':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M12 3 4.5 6.2v5.4c0 4.6 3.2 8.7 7.5 9.9 4.3-1.2 7.5-5.3 7.5-9.9V6.2L12 3Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="12" cy="11.5" r="2.8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 7.2v1M12 14.8v1M7.7 11.5h1M15.3 11.5h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'image-to-base64':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <rect x="3" y="4.5" width="9" height="15" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 14l2.2-2.5 1.8 1.8 1.2-1.2 1.8 1.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16.5 7.5c-1.2 0-1.5.8-1.5 1.8v1.2c0 .8-.5 1.5-1.2 1.5.7 0 1.2.7 1.2 1.5v1.2c0 1 .3 1.8 1.5 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 7.5c1.2 0 1.5.8 1.5 1.8v1.2c0 .8.5 1.5 1.2 1.5-.7 0-1.2.7-1.2 1.5v1.2c0 1-.3 1.8-1.5 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'base64-to-image':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M5.5 7.5C4.3 7.5 4 8.3 4 9.3v1.2c0 .8-.5 1.5-1.2 1.5.7 0 1.2.7 1.2 1.5v1.2c0 1 .3 1.8 1.5 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 7.5c1.2 0 1.5.8 1.5 1.8v1.2c0 .8.5 1.5 1.2 1.5-.7 0-1.2.7-1.2 1.5v1.2c0 1-.3 1.8-1.5 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="12" y="4.5" width="9" height="15" rx="2" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="15" cy="9" r="1" fill="currentColor" />
          <path d="M13.5 15.5l2.2-2.7 1.8 1.8 1.2-1.4 1.3 2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'image-format-detector':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.7" />
          <path d="M15.5 15.5 20.5 20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 9.5h5M8 12h3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.7" fill="currentColor" fillOpacity="0.1" />
          <path d="M8 15l3-3.5 2.5 2.5 2-2.2 2.5 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
