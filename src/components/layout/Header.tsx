import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { ToolIcon } from '@/src/components/icons/ToolIcon';
import { TOOLS_REGISTRY } from '@/src/config/tools';
import { cn } from '@/src/lib/utils';

const PRIMARY_LINKS = [
  { label: 'Compressor', to: '/tools/image-compressor' },
  { label: 'Converter', to: '/tools/image-converter' },
  { label: 'Resizer', to: '/tools/image-resizer' },
  { label: 'Cropper', to: '/tools/image-cropper' },
];

const DROPDOWN_GROUPS = [
  {
    title: 'Optimize',
    items: TOOLS_REGISTRY.filter((t) => t.category === 'optimize'),
  },
  {
    title: 'Convert',
    items: TOOLS_REGISTRY.filter((t) => t.category === 'convert').slice(0, 6),
  },
  {
    title: 'Edit & Inspect',
    items: [
      ...TOOLS_REGISTRY.filter((t) => t.category === 'edit'),
      ...TOOLS_REGISTRY.filter((t) => t.category === 'inspect'),
    ],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setToolsMenuOpen(false);
        setMobileOpen(false);
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setToolsMenuOpen(false);
      }
      if (
        mobileOpen &&
        !mobileMenuButtonRef.current?.contains(target) &&
        !mobileNavigationRef.current?.contains(target)
      ) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ebe6db] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Imagix Brand Logo */}
        <Link
          to="/"
          onClick={() => {
            setMobileOpen(false);
            setToolsMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]"
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

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
          <NavLink
            to="/"
            end
            onClick={() => {
              setToolsMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={({ isActive }) =>
              cn(
                'relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b] rounded-sm',
                isActive
                  ? 'text-[#0e7c5b] font-semibold'
                  : 'text-[#3f4440] hover:text-[#181a18]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span>Home</span>
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#0e7c5b]" />
                )}
              </>
            )}
          </NavLink>

          {PRIMARY_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b] rounded-sm',
                  isActive
                    ? 'text-[#0e7c5b] font-semibold'
                    : 'text-[#3f4440] hover:text-[#181a18]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#0e7c5b]" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Accessible All Tools Dropdown with per-tool icons */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              aria-expanded={toolsMenuOpen}
              aria-haspopup="true"
              onClick={() => setToolsMenuOpen((o) => !o)}
              className={cn(
                'inline-flex items-center gap-1 py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b] rounded-sm',
                toolsMenuOpen
                  ? 'text-[#0e7c5b] font-semibold'
                  : 'text-[#3f4440] hover:text-[#181a18]'
              )}
            >
              <span>All Tools</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-150',
                  toolsMenuOpen && 'rotate-180'
                )}
              />
            </button>

            {toolsMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-3 w-[690px] rounded-2xl border border-[#e6e1d6] bg-white p-5 shadow-[0_24px_54px_-15px_rgba(20,30,25,0.16)]"
              >
                <div className="grid grid-cols-3 gap-6">
                  {DROPDOWN_GROUPS.map((group) => (
                    <div key={group.title}>
                      <p className="mb-2.5 px-2 text-xs font-semibold text-[#787b75]">
                        {group.title}
                      </p>
                      <ul className="space-y-1">
                        {group.items.map((tool) => (
                          <li key={tool.slug}>
                            <Link
                              to={tool.path}
                              role="menuitem"
                              onClick={() => setToolsMenuOpen(false)}
                              className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs font-medium text-[#343834] hover:bg-[#ebf5f0] hover:text-[#0e7c5b] transition-colors"
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#f4f1ea] text-[#555955] group-hover:bg-white group-hover:text-[#0e7c5b] transition-colors">
                                <ToolIcon slug={tool.slug} size="xs" className="h-3.5 w-3.5" />
                              </span>
                              <span className="truncate">{tool.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#ebe6db] pt-3">
                  <span className="text-xs text-[#646862]">
                    23 browser-native optimization &amp; conversion tools
                  </span>
                  <Link
                    to="/tools"
                    onClick={() => setToolsMenuOpen(false)}
                    className="text-xs font-semibold text-[#0e7c5b] hover:underline"
                  >
                    View full directory →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: Single Primary Action Button (NO toggle button) */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/tools"
            className="hidden sm:inline-flex h-9.5 items-center justify-center gap-1.5 rounded-xl bg-[#0e7c5b] px-4 text-sm font-semibold text-white shadow-[0_3px_12px_rgba(14,124,91,0.2)] hover:bg-[#095e44] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b] focus-visible:ring-offset-2"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2ddd1] bg-white text-[#181a18] hover:bg-[#f4f1ea] lg:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          ref={mobileNavigationRef}
          aria-label="Mobile navigation"
          className="border-t border-[#ebe6db] bg-[#fbf9f5] px-4 py-3 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {[{ label: 'Home', to: '/' }, ...PRIMARY_LINKS, { label: 'All Tools', to: '/tools' }].map(
              (item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/' || item.to === '/tools'}
                  onClick={() => {
                    setMobileOpen(false);
                    if (item.to === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[44px] items-center rounded-xl px-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#ebf5f0] text-[#0e7c5b] font-semibold'
                        : 'text-[#3f4440] hover:bg-[#f1ede3]'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
            <Link
              to="/tools"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#0e7c5b] px-4 text-sm font-semibold text-white hover:bg-[#095e44] transition-colors sm:hidden"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
