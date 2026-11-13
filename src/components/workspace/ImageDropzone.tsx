import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, UploadCloud, X } from 'lucide-react';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { cn } from '@/src/lib/utils';
import { MAX_FILE_SIZE_LABEL } from '@/src/types/image';

interface ImageDropzoneProps {
  variant?: 'hero' | 'compact';
  onFilesAdded?: () => void;
  acceptMultiple?: boolean;
  label?: string;
}

export function ImageDropzone({
  variant = 'hero',
  onFilesAdded,
  acceptMultiple = true,
  label,
}: ImageDropzoneProps) {
  const { addFiles, isIngesting, ingestionErrors, dismissErrors } = useWorkspace();
  const [isDragging, setIsDragging] = useState(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const added = await addFiles(files);
      if (added.length > 0) {
        onFilesAdded?.();
      }
    },
    [addFiles, onFilesAdded]
  );

  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        await handleFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleFiles]);

  const handleClipboardButton = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPasteNotice(null);
    if (!navigator.clipboard || !navigator.clipboard.read) {
      setPasteNotice('Press Ctrl+V (Windows/Linux) or Cmd+V (Mac) anywhere on this page to paste an image.');
      return;
    }
    try {
      const clipboardItems = await navigator.clipboard.read();
      const files: File[] = [];
      for (const clipItem of clipboardItems) {
        const imageType = clipItem.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await clipItem.getType(imageType);
          const ext = imageType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
          files.push(new File([blob], `clipboard-${Date.now()}.${ext}`, { type: imageType }));
        }
      }
      if (files.length === 0) {
        setPasteNotice('No image found in clipboard. Copy an image first or press Ctrl+V / Cmd+V.');
        return;
      }
      await handleFiles(files);
    } catch {
      setPasteNotice('Clipboard access requires pressing Ctrl+V / Cmd+V directly on this page.');
    }
  };

  const openFilePicker = () => {
    if (!isIngesting) {
      inputRef.current?.click();
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const isHero = variant === 'hero';

  return (
    <div className="w-full">
      <div
        role="group"
        aria-label={label ?? 'Drag and drop images, or click to select'}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'group relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors duration-150',
          isHero ? 'px-6 py-11 sm:py-12' : 'px-6 py-6',
          isDragging
            ? 'border-[#0e7c5b] bg-[#ebf5f0]/75'
            : 'border-[#0e7c5b]/35 bg-white hover:border-[#0e7c5b] hover:bg-[#ebf5f0]/25'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={acceptMultiple}
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/bmp,image/tiff,image/x-icon,.jpg,.jpeg,.png,.webp,.avif,.gif,.bmp,.tif,.tiff,.ico"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          onChange={async (e) => {
            if (e.target.files && e.target.files.length > 0) {
              await handleFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />

        <button
          type="button"
          onClick={openFilePicker}
          disabled={isIngesting}
          className="flex w-full flex-col items-center justify-center rounded-xl bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b] focus-visible:ring-offset-2 disabled:cursor-wait"
        >
          {isIngesting ? (
            <Loader2
              className={cn(
                'animate-spin text-[#0e7c5b]',
                isHero ? 'h-10 w-10' : 'h-7 w-7'
              )}
            />
          ) : (
            <UploadCloud
              strokeWidth={1.65}
              className={cn(
                'transition-colors duration-150',
                isDragging
                  ? 'text-[#0e7c5b]'
                  : 'text-[#87928c] group-hover:text-[#0e7c5b]',
                isHero ? 'h-10 w-10' : 'h-7 w-7'
              )}
            />
          )}

          <span
            className={cn(
              'mt-3 block font-display font-semibold text-[#181a18]',
              isHero ? 'text-base sm:text-[17px]' : 'text-sm sm:text-base'
            )}
          >
            {isDragging
              ? 'Release to add images'
              : label ?? 'Drag & drop images, or click to select'}
          </span>

          <span className="mt-1 block text-xs text-[#646862] sm:text-[13px]">
            Supports JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, ICO · Max {MAX_FILE_SIZE_LABEL}
          </span>
        </button>

        <button
          type="button"
          onClick={handleClipboardButton}
          disabled={isIngesting}
          className="mt-2.5 text-xs font-medium text-[#787b75] hover:text-[#0e7c5b] hover:underline cursor-pointer transition-colors disabled:opacity-50"
        >
          or paste image from clipboard (Ctrl+V)
        </button>
      </div>

      {pasteNotice && (
        <div className="mt-2.5 flex items-center justify-between gap-3 rounded-xl border border-[#e6e1d6] bg-white px-3.5 py-2 text-xs text-[#3f4440]">
          <span>{pasteNotice}</span>
          <button
            type="button"
            onClick={() => setPasteNotice(null)}
            className="text-[#787b75] hover:text-[#181a18] cursor-pointer"
            aria-label="Dismiss clipboard notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {ingestionErrors.length > 0 && (
        <div
          role="alert"
          className="mt-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div className="space-y-1">
                <p className="font-semibold">File validation failed:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {ingestionErrors.map((err) => (
                    <li key={err.id}>
                      <span className="font-medium">{err.filename}:</span> {err.reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissErrors}
              aria-label="Dismiss file errors"
              className="text-red-600 hover:text-red-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
