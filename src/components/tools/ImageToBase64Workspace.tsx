import { useEffect, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ImageDropzone } from '@/src/components/workspace/ImageDropzone';
import { QueueItemStrip } from '@/src/components/workspace/QueueItemStrip';
import { WorkspaceEmptyState } from '@/src/components/workspace/WorkspaceEmptyState';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { formatBytes, stripExtension, triggerBlobDownload } from '@/src/lib/utils';

type OutputTab = 'datauri' | 'raw' | 'css' | 'html';

export function ImageToBase64Workspace() {
  const { selectedItem } = useWorkspace();
  const [dataUri, setDataUri] = useState<string>('');
  const [activeTab, setActiveTab] = useState<OutputTab>('datauri');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selectedItem) {
      setDataUri('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDataUri(reader.result);
      }
    };
    reader.readAsDataURL(selectedItem.file);
  }, [selectedItem?.id]);

  const rawBase64 = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;

  const activeOutput = (() => {
    if (!dataUri) return '';
    switch (activeTab) {
      case 'datauri':
        return dataUri;
      case 'raw':
        return rawBase64;
      case 'css':
        return `background-image: url("${dataUri}");`;
      case 'html':
        return `<img src="${dataUri}" alt="${selectedItem?.name ?? 'image'}" width="${selectedItem?.width ?? ''}" height="${selectedItem?.height ?? ''}" />`;
    }
  })();

  const handleCopy = async () => {
    if (!activeOutput) return;
    await navigator.clipboard.writeText(activeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadTxt = () => {
    if (!activeOutput || !selectedItem) return;
    const blob = new Blob([activeOutput], { type: 'text/plain;charset=utf-8' });
    triggerBlobDownload(blob, `${stripExtension(selectedItem.name)}-${activeTab}.txt`);
  };

  const overheadPct =
    selectedItem && selectedItem.originalSize > 0
      ? ((activeOutput.length - selectedItem.originalSize) / selectedItem.originalSize) * 100
      : 0;

  return (
    <div className="space-y-6">
      <ImageDropzone
        variant={!selectedItem ? 'hero' : 'compact'}
        label={
          !selectedItem
            ? 'Drag & drop images, or click to select'
            : 'Drag & drop another image to encode'
        }
      />
      <QueueItemStrip />

      {!selectedItem ? (
        <WorkspaceEmptyState
          toolSlug="image-to-base64"
          title="Load an image to generate Base64 & Data URI snippets"
          description="Encode local images into copy-ready Data URIs, raw Base64 strings, CSS background rules, or inline HTML image tags."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-2xl border border-[#e6e1d6] bg-white p-4 space-y-4">
            <div className="checkerboard-bg flex h-52 items-center justify-center overflow-hidden rounded-xl border border-[#e6e1d6]">
              <img
                src={selectedItem.previewUrl}
                alt={selectedItem.name}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <dl className="space-y-1.5 text-xs font-mono tabular-nums">
              <div className="flex justify-between">
                <dt className="text-[#646862]">Binary Size</dt>
                <dd className="text-[#181a18] font-semibold">{formatBytes(selectedItem.originalSize)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#646862]">Encoded String</dt>
                <dd className="text-[#181a18] font-semibold">{formatBytes(activeOutput.length)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#646862]">Base64 Overhead</dt>
                <dd className="text-[#0e7c5b] font-semibold">+{overheadPct.toFixed(1)}%</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-8 rounded-2xl border border-[#e6e1d6] bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#e6e1d6] bg-[#f4f1ea] p-1">
                {(
                  [
                    { id: 'datauri', label: 'Data URI' },
                    { id: 'raw', label: 'Raw Base64' },
                    { id: 'css', label: 'CSS url()' },
                    { id: 'html', label: 'HTML <img>' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-[#0e7c5b] font-semibold shadow-xs'
                        : 'text-[#555955] hover:text-[#181a18]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadTxt}>
                  <Download className="h-4 w-4" />
                  <span>.TXT</span>
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied' : 'Copy Output'}</span>
                </Button>
              </div>
            </div>

            <textarea
              readOnly
              value={activeOutput}
              rows={11}
              aria-label="Encoded Base64 output"
              className="w-full rounded-xl border border-[#e6e1d6] bg-[#faf8f3] p-3.5 font-mono text-xs leading-relaxed text-[#181a18] focus:border-[#0e7c5b] focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
