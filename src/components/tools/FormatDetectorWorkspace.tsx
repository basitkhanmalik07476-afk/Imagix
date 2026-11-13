import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ImageDropzone } from '@/src/components/workspace/ImageDropzone';
import { QueueItemStrip } from '@/src/components/workspace/QueueItemStrip';
import { WorkspaceEmptyState } from '@/src/components/workspace/WorkspaceEmptyState';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { formatBytes } from '@/src/lib/utils';
import { FORMAT_CATALOG } from '@/src/types/image';

function hexToAsciiPreview(hexHeader: string): string {
  return hexHeader
    .trim()
    .split(/\s+/)
    .map((byteHex) => {
      const code = Number.parseInt(byteHex, 16);
      if (Number.isNaN(code)) return '.';
      return code >= 32 && code <= 126 ? String.fromCharCode(code) : '.';
    })
    .join('');
}

export function FormatDetectorWorkspace() {
  const { items, selectedItem } = useWorkspace();

  return (
    <div className="space-y-6">
      <ImageDropzone
        variant={!selectedItem ? 'hero' : 'compact'}
        label={
          !selectedItem
            ? 'Drag & drop images, or click to select'
            : 'Drag & drop another image to inspect magic bytes'
        }
      />
      <QueueItemStrip />

      {!selectedItem ? (
        <WorkspaceEmptyState
          toolSlug="image-format-detector"
          title="Load an image to verify its binary signature"
          description="Inspects raw file header bytes to detect renamed extensions, MIME mismatches, pixel dimensions, and alpha transparency."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4 rounded-2xl border border-[#e6e1d6] bg-white p-4">
              <div className="checkerboard-bg flex h-56 items-center justify-center overflow-hidden rounded-xl border border-[#e6e1d6]">
                <img
                  src={selectedItem.previewUrl}
                  alt={selectedItem.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            <div className="lg:col-span-8 rounded-2xl border border-[#e6e1d6] bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#ebe6db] bg-[#faf8f3] px-5 py-3.5">
                <h2 className="font-display text-sm font-bold text-[#181a18]">
                  Binary Header Inspection · {selectedItem.name}
                </h2>
                {selectedItem.mimeMismatch ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    Extension / MIME Mismatch
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0e7c5b]">
                    <CheckCircle2 className="h-4 w-4" />
                    Signature Verified
                  </span>
                )}
              </div>

              <dl className="divide-y divide-[#ebe6db]">
                <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-3">
                  <dt className="text-xs font-medium text-[#646862]">
                    True Binary Format
                  </dt>
                  <dd className="sm:col-span-2 text-sm font-semibold text-[#181a18]">
                    {selectedItem.detectedFormat
                      ? FORMAT_CATALOG[selectedItem.detectedFormat].label
                      : 'Unknown'}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-3">
                  <dt className="text-xs font-medium text-[#646862]">
                    Detected MIME Type
                  </dt>
                  <dd className="sm:col-span-2 font-mono text-xs text-[#181a18]">
                    {selectedItem.detectedMime}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-3">
                  <dt className="text-xs font-medium text-[#646862]">
                    Browser Declared MIME
                  </dt>
                  <dd className="sm:col-span-2 font-mono text-xs text-[#181a18]">
                    {selectedItem.declaredMime}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-3">
                  <dt className="text-xs font-medium text-[#646862]">
                    Leading Magic Bytes (Hex)
                  </dt>
                  <dd className="sm:col-span-2 font-mono text-xs font-semibold text-[#0e7c5b] break-all">
                    {selectedItem.hexHeader}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-3">
                  <dt className="text-xs font-medium text-[#646862]">
                    ASCII Header Signature
                  </dt>
                  <dd className="sm:col-span-2 font-mono text-xs text-[#181a18]">
                    {hexToAsciiPreview(selectedItem.hexHeader)}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-3">
                  <dt className="text-xs font-medium text-[#646862]">
                    Pixel Dimensions &amp; Size
                  </dt>
                  <dd className="sm:col-span-2 font-mono text-xs tabular-nums text-[#181a18]">
                    {selectedItem.width} × {selectedItem.height} px · {formatBytes(selectedItem.originalSize)}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-3">
                  <dt className="text-xs font-medium text-[#646862]">
                    Alpha Channel Transparency
                  </dt>
                  <dd className="sm:col-span-2 text-xs font-medium text-[#181a18]">
                    {selectedItem.hasAlpha ? 'Transparent pixels detected' : 'Fully opaque'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {items.length > 1 && (
            <div className="rounded-2xl border border-[#e6e1d6] bg-white overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#ebe6db] bg-[#faf8f3] text-[#555955]">
                  <tr>
                    <th className="px-4 py-3 font-medium">File</th>
                    <th className="px-4 py-3 font-medium">True Format</th>
                    <th className="px-4 py-3 font-medium">Declared MIME</th>
                    <th className="px-4 py-3 font-medium">Dimensions</th>
                    <th className="px-4 py-3 font-medium text-right">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebe6db]">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#faf8f3]/70">
                      <td className="px-4 py-2.5 font-medium text-[#181a18]">
                        {item.name}
                      </td>
                      <td className="px-4 py-2.5 font-mono uppercase font-semibold text-[#0e7c5b]">
                        {item.detectedFormat ?? 'Unknown'}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[#555955]">
                        {item.declaredMime}
                      </td>
                      <td className="px-4 py-2.5 font-mono tabular-nums text-[#555955]">
                        {item.width}×{item.height}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#181a18]">
                        {formatBytes(item.originalSize)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
