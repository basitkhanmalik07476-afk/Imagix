import { useEffect, useState } from 'react';
import { Check, Copy, Download, Loader2, MapPin, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ImageDropzone } from '@/src/components/workspace/ImageDropzone';
import { QueueItemStrip } from '@/src/components/workspace/QueueItemStrip';
import { WorkspaceEmptyState } from '@/src/components/workspace/WorkspaceEmptyState';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import {
  extractImageMetadata,
  stripImageMetadata,
  type ParsedImageMetadata,
} from '@/src/lib/image/metadata';
import { triggerBlobDownload } from '@/src/lib/utils';

export function MetadataWorkspace() {
  const { selectedItem } = useWorkspace();
  const [metadata, setMetadata] = useState<ParsedImageMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [stripping, setStripping] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  useEffect(() => {
    if (!selectedItem) {
      setMetadata(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    extractImageMetadata(selectedItem)
      .then((res) => {
        if (!cancelled) setMetadata(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedItem?.id]);

  const handleStripAndDownload = async () => {
    if (!selectedItem) return;
    setStripping(true);
    try {
      const { blob, filename } = await stripImageMetadata(selectedItem);
      triggerBlobDownload(blob, filename);
    } finally {
      setStripping(false);
    }
  };

  const handleCopyGps = async () => {
    if (!metadata?.gps) return;
    await navigator.clipboard.writeText(
      `${metadata.gps.latitude.toFixed(6)}, ${metadata.gps.longitude.toFixed(6)}`
    );
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 1800);
  };

  return (
    <div className="space-y-6">
      <ImageDropzone
        variant={!selectedItem ? 'hero' : 'compact'}
        label={
          !selectedItem
            ? 'Drag & drop images, or click to select'
            : 'Drag & drop another image to inspect metadata'
        }
      />
      <QueueItemStrip />

      {!selectedItem ? (
        <WorkspaceEmptyState
          toolSlug="image-metadata-viewer"
          title="Load an image to inspect embedded metadata"
          description="Reads EXIF camera settings, shutter speed, ISO, GPS coordinates, and ICC profiles—and strips private metadata cleanly in one click."
        />
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#e6e1d6] bg-white p-12 text-sm text-[#555955]">
          <Loader2 className="h-4 w-4 animate-spin text-[#0e7c5b]" />
          <span>Parsing binary metadata segments...</span>
        </div>
      ) : metadata ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-[#e6e1d6] bg-white p-4 space-y-4">
              <div className="checkerboard-bg flex h-56 items-center justify-center overflow-hidden rounded-xl border border-[#e6e1d6]">
                <img
                  src={selectedItem.previewUrl}
                  alt={selectedItem.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={stripping}
                onClick={handleStripAndDownload}
              >
                {stripping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Stripping Metadata...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Strip Metadata &amp; Download Clean</span>
                  </>
                )}
              </Button>
              <p className="text-xs text-[#646862]">
                Re-encodes pixel data without EXIF, GPS, or XMP tags for private sharing.
              </p>
            </div>

            {metadata.gps && (
              <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#181a18]">
                    <MapPin className="h-4 w-4 text-[#0e7c5b]" />
                    <span>Embedded GPS</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCopyGps}>
                    {copiedCoords ? <Check className="h-3.5 w-3.5 text-[#0e7c5b]" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCoords ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
                <dl className="mt-3 space-y-1.5 font-mono text-xs tabular-nums">
                  <div className="flex justify-between">
                    <dt className="text-[#646862]">Latitude</dt>
                    <dd className="text-[#181a18]">{metadata.gps.latitude.toFixed(6)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#646862]">Longitude</dt>
                    <dd className="text-[#181a18]">{metadata.gps.longitude.toFixed(6)}</dd>
                  </div>
                  {metadata.gps.altitude !== undefined && (
                    <div className="flex justify-between">
                      <dt className="text-[#646862]">Altitude</dt>
                      <dd className="text-[#181a18]">{metadata.gps.altitude.toFixed(1)} m</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-5">
            {/* Privacy Check Banner */}
            <div
              className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 text-xs ${
                metadata.gps
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-[#d5ebe0] bg-[#ebf5f0]/70 text-[#095e44]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {metadata.gps ? (
                  <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700" />
                ) : (
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#0e7c5b]" />
                )}
                <span className="font-medium">
                  {metadata.gps
                    ? 'GPS location coordinates are embedded in this file.'
                    : 'No GPS coordinates detected in this image.'}
                </span>
              </div>
              <span className="font-mono tabular-nums font-semibold">
                {Object.keys(metadata.raw).length} tags parsed
              </span>
            </div>

            {(
              [
                { title: 'File & Pixel Properties', data: metadata.fileDetails },
                { title: 'Camera & Device', data: metadata.camera },
                { title: 'Exposure & Optics', data: metadata.exposure },
              ] as const
            ).map((section) => {
              const entries = Object.entries(section.data);
              if (entries.length === 0) return null;
              return (
                <div
                  key={section.title}
                  className="rounded-2xl border border-[#e6e1d6] bg-white overflow-hidden"
                >
                  <div className="border-b border-[#ebe6db] bg-[#faf8f3] px-5 py-3">
                    <h3 className="font-display text-sm font-bold text-[#181a18]">
                      {section.title}
                    </h3>
                  </div>
                  <dl className="divide-y divide-[#ebe6db]">
                    {entries.map(([key, val]) => (
                      <div key={key} className="grid grid-cols-1 gap-1 px-5 py-2.5 sm:grid-cols-3">
                        <dt className="text-xs font-medium text-[#646862]">
                          {key}
                        </dt>
                        <dd className="sm:col-span-2 font-mono text-xs text-[#181a18] break-all">
                          {val}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}

            {!metadata.hasMetadata && (
              <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5 text-sm text-[#555955]">
                No EXIF, IPTC, XMP, or GPS tags were found in this file.
              </div>
            )}

            {metadata.hasMetadata && (
              <div className="rounded-2xl border border-[#e6e1d6] bg-white overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#ebe6db] bg-[#faf8f3] px-5 py-3">
                  <h3 className="font-display text-sm font-bold text-[#181a18]">
                    All Extracted Tags ({Object.keys(metadata.raw).length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const jsonBlob = new Blob([JSON.stringify(metadata.raw, null, 2)], {
                        type: 'application/json',
                      });
                      triggerBlobDownload(jsonBlob, `${selectedItem.name}-metadata.json`);
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export JSON</span>
                  </Button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#ebe6db]">
                  {Object.entries(metadata.raw).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-1 gap-1 px-5 py-2 sm:grid-cols-3">
                      <span className="font-mono text-xs text-[#646862] truncate">
                        {k}
                      </span>
                      <span className="sm:col-span-2 font-mono text-xs text-[#181a18] break-all">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
