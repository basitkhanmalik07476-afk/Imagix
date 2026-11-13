import { Link } from 'react-router-dom';

const FOOTER_COLUMNS = [
  {
    heading: 'Quick Links',
    links: [
      { label: 'Home', to: '/' },
      { label: 'All 23 Tools', to: '/tools' },
      { label: 'See How It Works', to: '/how-to-use' },
      { label: 'JPG to WebP', to: '/tools/jpg-to-webp' },
    ],
  },
  {
    heading: 'Core Tools',
    links: [
      { label: 'Image Compressor', to: '/tools/image-compressor' },
      { label: 'Image Converter', to: '/tools/image-converter' },
      { label: 'Image Resizer', to: '/tools/image-resizer' },
      { label: 'Image Cropper', to: '/tools/image-cropper' },
    ],
  },
  {
    heading: 'Utilities',
    links: [
      { label: 'Image Rotator', to: '/tools/image-rotator' },
      { label: 'Metadata Viewer', to: '/tools/image-metadata-viewer' },
      { label: 'Image to Base64', to: '/tools/image-to-base64' },
      { label: 'Format Detector', to: '/tools/image-format-detector' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#ebe6db] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]"
            >
              <img
                src="/imagix-logo.jpg"
                alt="Imagix"
                width={700}
                height={191}
                referrerPolicy="no-referrer"
                className="h-auto w-[140px] object-contain mix-blend-multiply"
              />
            </Link>
            <p className="mt-3.5 max-w-sm text-sm leading-relaxed text-[#555955]">
              Fast, browser-native tools to compress, convert, resize, and inspect your images with zero server uploads and exact output quality.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="font-display text-sm font-semibold text-[#181a18]">
                  {col.heading}
                </h3>
                <ul className="mt-3.5 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onClick={() => {
                          if (link.to === '/') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="text-sm text-[#555955] hover:text-[#0e7c5b] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#ebe6db] pt-6 text-xs text-[#646862] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Imagix. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link to="/tools" className="hover:text-[#181a18] transition-colors">
              All Tools
            </Link>
            <span aria-hidden="true">·</span>
            <span>100% On-Device Processing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
