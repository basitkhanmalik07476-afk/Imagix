import { useEffect, useState } from 'react';
import { AlertCircle, Download, ImagePlus } from 'lucide-react';
import { ToolIcon } from '@/src/components/icons/ToolIcon';
import { Button } from '@/src/components/ui/button';
import { detectSignatureFromBytes } from '@/src/lib/image/signatures';
import { formatBytes, triggerBlobDownload } from '@/src/lib/utils';

// Small crisp 16x16 emerald PNG Data URI sample for one-click testing
const SAMPLE_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAQElEQVR4nGP4z8DAwMDAxMDAwMDIBKYYGBgYGJhQ+f///2dkhMn///9nYGBgQBf4//8/AyO6ACMQ4QsgA6oAAAwQDA05V0J3AAAAAElFTkSuQmCC';

export function Base64ToImageWorkspace() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<{
    url: string;
    blob: Blob;
    ext: string;
    mime: string;
    width: number;
    height: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (decoded?.url) URL.revokeObjectURL(decoded.url);
    };
  }, [decoded]);

  const decodeString = async (rawInput: string) => {
    setError(null);
    const trimmed = rawInput.trim();
    if (!trimmed) {
      setDecoded((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return null;
      });
      return;
    }

    try {
      let base64Body = trimmed;
      let declaredMime = '';
      if (trimmed.startsWith('data:')) {
        const commaIdx = trimmed.indexOf(',');
        if (commaIdx === -1) throw new Error('Invalid Data URI format.');
        const header = trimmed.slice(5, commaIdx);
        declaredMime = header.split(';')[0] || '';
        base64Body = trimmed.slice(commaIdx + 1);
      }

      const cleaned = base64Body.replace(/\s+/g, '');
      const binaryStr = atob(cleaned);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const sig = detectSignatureFromBytes(bytes.buffer);
      const mime = sig.format ? sig.detectedMime : declaredMime || 'image/png';
      const ext = sig.format ?? 'png';

      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);

      const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error('Decoded bytes do not form a renderable image.'));
        img.src = url;
      });

      setDecoded((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return {
          url,
          blob,
          ext,
          mime,
          width: dims.width,
          height: dims.height,
        };
      });
    } catch (err) {
      setDecoded((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return null;
      });
      setError(err instanceof Error ? err.message : 'Invalid Base64 image string.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-6 rounded-2xl border border-[#e6e1d6] bg-white p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-bold text-[#181a18]">
            Base64 or Data URI Input
          </h2>
          <div className="flex items-center gap-2">
            {!input && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(SAMPLE_DATA_URI);
                  decodeString(SAMPLE_DATA_URI);
                }}
              >
                <ImagePlus className="h-3.5 w-3.5 text-[#0e7c5b]" />
                <span>Load Sample</span>
              </Button>
            )}
            {input && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInput('');
                  decodeString('');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            decodeString(e.target.value);
          }}
          rows={11}
          placeholder="Paste data:image/png;base64,... or raw Base64 image bytes here"
          aria-label="Paste Base64 or Data URI string"
          className="w-full rounded-xl border border-[#e6e1d6] bg-[#faf8f3] p-3.5 font-mono text-xs text-[#181a18] placeholder:text-[#868982] focus:border-[#0e7c5b] focus:bg-white focus:outline-none"
        />

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="lg:col-span-6 rounded-2xl border border-[#e6e1d6] bg-white p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-bold text-[#181a18]">
            Decoded Image Preview
          </h2>
          {decoded && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => triggerBlobDownload(decoded.blob, `imagix-decoded.${decoded.ext}`)}
            >
              <Download className="h-4 w-4" />
              <span>Download {decoded.ext.toUpperCase()}</span>
            </Button>
          )}
        </div>

        {decoded ? (
          <>
            <div className="checkerboard-bg flex h-72 items-center justify-center overflow-hidden rounded-xl border border-[#e6e1d6] p-4">
              <img
                src={decoded.url}
                alt="Decoded Base64 output"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs tabular-nums text-[#555955]">
              <span className="font-semibold text-[#0e7c5b]">Format: {decoded.ext.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span>MIME: {decoded.mime}</span>
              <span aria-hidden="true">·</span>
              <span>
                {decoded.width} × {decoded.height} px
              </span>
              <span aria-hidden="true">·</span>
              <span>{formatBytes(decoded.blob.size)}</span>
            </div>
          </>
        ) : (
          <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#d9d3c5] bg-[#faf8f3] p-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d5ebe0] bg-[#ebf5f0] text-[#0e7c5b]">
              <ToolIcon slug="base64-to-image" size="sm" />
            </div>
            <p className="mt-3 font-display text-sm font-semibold text-[#181a18]">
              Waiting for Base64 payload
            </p>
            <p className="mt-1 max-w-xs text-xs text-[#646862]">
              Paste a Data URI or click Load Sample on the left to decode and download.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
