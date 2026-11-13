import React, { useRef } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { cn, formatBytes } from '@/src/lib/utils';

export function QueueItemStrip() {
  const { items, selectedItem, setSelectedId, replaceItem, removeItem, clearAll } =
    useWorkspace();
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetIdRef = useRef<string | null>(null);

  if (items.length === 0) return null;

  const triggerReplace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    replaceTargetIdRef.current = id;
    replaceInputRef.current?.click();
  };

  return (
    <div className="rounded-2xl border border-[#e6e1d6] bg-white p-3.5">
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && replaceTargetIdRef.current) {
            await replaceItem(replaceTargetIdRef.current, file);
          }
          e.target.value = '';
        }}
      />

      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#646862]">
          <span className="font-semibold text-[#181a18]">
            Active Queue ({items.length} {items.length === 1 ? 'image' : 'images'})
          </span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Click any image to inspect or edit</span>
        </div>
        <Button variant="ghost" size="sm" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-0.5">
        {items.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedId(item.id);
                }
              }}
              className={cn(
                'group flex w-56 shrink-0 items-center gap-2.5 rounded-xl border p-2 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b]',
                isSelected
                  ? 'border-[#0e7c5b] bg-[#ebf5f0]/70'
                  : 'border-[#e6e1d6] bg-[#faf8f3] hover:border-[#cfc8b9]'
              )}
            >
              <img
                src={item.previewUrl}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="checkerboard-bg h-11 w-11 shrink-0 rounded-lg object-cover border border-[#e6e1d6]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#181a18]">
                  {item.name}
                </p>
                <p className="mt-0.5 text-[11px] font-mono tabular-nums text-[#646862]">
                  {item.width}×{item.height} · {formatBytes(item.originalSize)}
                </p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  title="Replace image"
                  aria-label={`Replace ${item.name}`}
                  onClick={(e) => triggerReplace(item.id, e)}
                  className="rounded p-1 text-[#787b75] hover:bg-[#e6e1d6]/70 hover:text-[#181a18] cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Remove image"
                  aria-label={`Remove ${item.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="rounded p-1 text-[#787b75] hover:bg-red-100 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
