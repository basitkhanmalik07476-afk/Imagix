import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { ToolIcon } from '@/src/components/icons/ToolIcon';
import { SeoHead } from '@/src/components/seo/SeoHead';
import { PAGE_SEO } from '@/src/config/seo';
import { TOOLS_REGISTRY, type ToolCategory } from '@/src/config/tools';
import { cn } from '@/src/lib/utils';

const CATEGORIES: { id: 'all' | ToolCategory; label: string }[] = [
  { id: 'all', label: 'All Tools' },
  { id: 'optimize', label: 'Compress' },
  { id: 'convert', label: 'Convert' },
  { id: 'edit', label: 'Resize & Edit' },
  { id: 'inspect', label: 'Inspect & Base64' },
];

const CATEGORY_TITLES: Record<ToolCategory, string> = {
  optimize: 'Compression & Batch Optimization',
  convert: 'Format Conversion Workflows',
  edit: 'Resizing, Cropping & Geometry',
  inspect: 'Inspection, Metadata & Base64',
};

export function AllToolsPage() {
  const [category, setCategory] = useState<'all' | ToolCategory>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS_REGISTRY.filter((tool) => {
      if (category !== 'all' && tool.category !== category) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  const grouped = useMemo(() => {
    const groups: ToolCategory[] = ['optimize', 'convert', 'edit', 'inspect'];
    return groups
      .map((cat) => ({
        category: cat,
        title: CATEGORY_TITLES[cat],
        tools: filtered.filter((t) => t.category === cat),
      }))
      .filter((g) => g.tools.length > 0);
  }, [filtered]);

  return (
    <>
      <SeoHead {...PAGE_SEO.tools} />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-[#0e7c5b]">
            Complete Browser Image Suite
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-[#181a18] sm:text-4xl">
            All 23 Image Tools
          </h1>
          <p className="mt-2 text-base text-[#555955]">
            Specialized utilities for compression, format conversion, pixel-accurate resizing, and metadata inspection—all running locally in your browser.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-b border-[#e6e1d6] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#e6e1d6] bg-[#f4f1ea] p-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                  category === cat.id
                    ? 'bg-white text-[#0e7c5b] font-semibold shadow-xs'
                    : 'text-[#555955] hover:text-[#181a18]'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#787b75]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              aria-label="Search image tools"
              className="h-10 w-full rounded-xl border border-[#e2ddd1] bg-white pl-9 pr-3 text-sm text-[#181a18] placeholder:text-[#868982] focus:border-[#0e7c5b] focus:outline-none"
            />
          </div>
        </div>

        {grouped.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#646862]">
            No tools matched "{query}". Try clearing your search filter.
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {grouped.map((group) => (
              <section key={group.category}>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-[#181a18]">
                    {group.title}
                  </h2>
                  <span className="font-mono text-xs tabular-nums text-[#646862]">
                    {group.tools.length} {group.tools.length === 1 ? 'tool' : 'tools'}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      to={tool.path}
                      className="group flex items-start gap-4 rounded-2xl border border-[#e6e1d6] bg-white p-5 transition-all hover:border-[#0e7c5b]/50 hover:shadow-[0_14px_34px_-22px_rgba(14,124,91,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d5ebe0] bg-[#ebf5f0] text-[#0e7c5b] transition-colors group-hover:bg-[#0e7c5b] group-hover:text-white group-hover:border-[#0e7c5b]">
                        <ToolIcon slug={tool.slug} size="sm" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display text-sm font-bold text-[#181a18] group-hover:text-[#0e7c5b] transition-colors truncate">
                            {tool.name}
                          </h3>
                          <ArrowRight className="h-4 w-4 shrink-0 text-[#9aa096] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0e7c5b]" />
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#555955] line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
