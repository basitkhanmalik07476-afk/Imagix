import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { ToolIcon } from '@/src/components/icons/ToolIcon';
import { findToolBySlug } from '@/src/config/tools';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { cn } from '@/src/lib/utils';

const SWITCHER_ITEMS = [
  { label: 'Compressor', slug: 'image-compressor', to: '/tools/image-compressor' },
  { label: 'Converter', slug: 'image-converter', to: '/tools/image-converter' },
  { label: 'Resizer', slug: 'image-resizer', to: '/tools/image-resizer' },
  { label: 'Cropper', slug: 'image-cropper', to: '/tools/image-cropper' },
  { label: 'Rotator', slug: 'image-rotator', to: '/tools/image-rotator' },
  { label: 'Flipper', slug: 'image-flipper', to: '/tools/image-flipper' },
  { label: 'Metadata', slug: 'image-metadata-viewer', to: '/tools/image-metadata-viewer' },
  { label: 'Base64', slug: 'image-to-base64', to: '/tools/image-to-base64' },
  { label: 'Detector', slug: 'image-format-detector', to: '/tools/image-format-detector' },
];

export function ToolSwitcherBar() {
  const { items } = useWorkspace();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const currentSlug = pathname.replace('/tools/', '').split('/')[0];
  const currentTool = findToolBySlug(currentSlug);
  const activeSwitcher =
    SWITCHER_ITEMS.find((i) => i.slug === currentSlug) ??
    (currentTool?.kind === 'compressor'
      ? SWITCHER_ITEMS[0]
      : currentTool?.kind === 'converter'
        ? SWITCHER_ITEMS[1]
        : currentTool?.kind === 'base64-to-image'
          ? SWITCHER_ITEMS[7]
          : undefined) ??
    SWITCHER_ITEMS[0];

  return (
    <div className="border-b border-[#e6e1d6] bg-[#f4f1ea]">
      <div className="mx-auto max-w-6xl px-4 py-2 max-[375px]:pr-5 sm:px-6 lg:px-8">
        {/* Mobile Responsive Switcher (Zero Horizontal Scrollbar / Zero Clipped Tabs) */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-label="Switch workbench tool"
              onClick={() => setMobileOpen((o) => !o)}
              className="flex min-h-[42px] flex-1 items-center justify-between gap-2.5 rounded-xl border border-[#dcd6c8] bg-white px-3.5 py-2 text-left text-xs font-semibold text-[#181a18] shadow-2xs transition-colors hover:border-[#0e7c5b]/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#ebf5f0] text-[#0e7c5b]">
                  <ToolIcon slug={activeSwitcher.slug} size="xs" className="h-3.5 w-3.5" />
                </span>
                <span className="text-[#646862] font-medium shrink-0">Workbench:</span>
                <span className="truncate font-display text-sm font-bold text-[#0e7c5b]">
                  {currentTool?.shortName ?? activeSwitcher.label}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#646862] shrink-0">
                <span>Switch</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-150',
                    mobileOpen && 'rotate-180 text-[#0e7c5b]'
                  )}
                />
              </span>
            </button>

            {items.length > 0 && (
              <span className="shrink-0 rounded-lg border border-[#d5ebe0] bg-[#ebf5f0] px-2.5 py-2 font-mono text-[11px] font-semibold tabular-nums text-[#0e7c5b] whitespace-nowrap">
                {items.length} queued
              </span>
            )}
          </div>

          {mobileOpen && (
            <nav
              aria-label="Mobile workbench tools"
              className="mt-2.5 grid grid-cols-2 gap-2 pb-1 sm:grid-cols-3"
            >
              {SWITCHER_ITEMS.map((item) => {
                const isActive = item.slug === activeSwitcher.slug;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
                      isActive
                        ? 'border-[#0e7c5b] bg-white text-[#0e7c5b] font-semibold shadow-2xs'
                        : 'border-[#e6e1d6] bg-white/75 text-[#3f4440] hover:bg-white hover:text-[#181a18]'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                        isActive ? 'bg-[#ebf5f0] text-[#0e7c5b]' : 'bg-[#f4f1ea] text-[#555955]'
                      )}
                    >
                      <ToolIcon slug={item.slug} size="xs" className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          )}
        </div>

        {/* Desktop Single-Row Clean Workbench Bar */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
            <span className="mr-1 text-xs font-medium text-[#646862] whitespace-nowrap shrink-0">
              Workbench:
            </span>
            {SWITCHER_ITEMS.map((item) => {
              const isPresetMatch = item.slug === activeSwitcher.slug;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150',
                      isActive || isPresetMatch
                        ? 'bg-white text-[#0e7c5b] font-semibold ring-1 ring-[#d8d2c5] shadow-2xs'
                        : 'text-[#555955] hover:bg-white/80 hover:text-[#181a18]'
                    )
                  }
                >
                  <ToolIcon slug={item.slug} size="xs" className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {items.length > 0 && (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-[#0e7c5b] font-semibold whitespace-nowrap shrink-0">
              {items.length} {items.length === 1 ? 'asset' : 'assets'} in queue
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
