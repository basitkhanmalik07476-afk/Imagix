import { useMemo, useState } from 'react';
import {
  Archive,
  Download,
  FlipHorizontal,
  FlipVertical,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Slider } from '@/src/components/ui/slider';
import { ImageDropzone } from '@/src/components/workspace/ImageDropzone';
import { QueueItemStrip } from '@/src/components/workspace/QueueItemStrip';
import { WorkspaceEmptyState } from '@/src/components/workspace/WorkspaceEmptyState';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { transformWorkspaceImage } from '@/src/lib/image/transform';
import { buildZipArchive } from '@/src/lib/image/zip';
import { formatBytes, triggerBlobDownload } from '@/src/lib/utils';

interface TransformWorkspaceProps {
  mode: 'rotate' | 'flip';
}

export function TransformWorkspace({ mode }: TransformWorkspaceProps) {
  const { items, selectedItem, updateItem } = useWorkspace();

  const [rotation, setRotation] = useState<number>(mode === 'rotate' ? 90 : 0);
  const [flipH, setFlipH] = useState<boolean>(mode === 'flip');
  const [flipV, setFlipV] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const runTransform = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    updateItem(itemId, (curr) => ({ ...curr, status: 'processing', progress: 30 }));
    try {
      const res = await transformWorkspaceImage(item, {
        rotationDeg: rotation,
        flipHorizontal: flipH,
        flipVertical: flipV,
      });
      const url = URL.createObjectURL(res.blob);
      updateItem(itemId, (curr) => ({
        ...curr,
        status: 'done',
        progress: 100,
        result: { ...res, size: res.blob.size, url },
      }));
    } catch (err) {
      updateItem(itemId, (curr) => ({
        ...curr,
        status: 'error',
        progress: 0,
        errorMessage: err instanceof Error ? err.message : 'Transform failed.',
      }));
    }
  };

  const applyToAll = async () => {
    if (items.length === 0 || isProcessing) return;
    setIsProcessing(true);
    for (const item of items) {
      await runTransform(item.id);
    }
    setIsProcessing(false);
  };

  const resetTransforms = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const completed = useMemo(() => items.filter((i) => i.status === 'done' && i.result), [items]);

  const downloadZip = async () => {
    if (completed.length === 0) return;
    setIsZipping(true);
    try {
      const zip = await buildZipArchive(
        completed.map((i) => ({ filename: i.result!.filename, blob: i.result!.blob }))
      );
      triggerBlobDownload(zip, `imagix-${mode}-${completed.length}-images.zip`);
    } finally {
      setIsZipping(false);
    }
  };

  const isQuarterTurn = rotation === 90 || rotation === 270;

  return (
    <div className="space-y-6">
      <ImageDropzone
        variant={!selectedItem ? 'hero' : 'compact'}
        label={
          !selectedItem
            ? 'Drag & drop images, or click to select'
            : mode === 'rotate'
              ? 'Drag & drop more images to rotate'
              : 'Drag & drop more images to flip'
        }
      />
      <QueueItemStrip />

      {!selectedItem ? (
        <WorkspaceEmptyState
          toolSlug={mode === 'rotate' ? 'image-rotator' : 'image-flipper'}
          title={`Load an image to ${mode === 'rotate' ? 'rotate' : 'flip'}`}
          description={
            mode === 'rotate'
              ? 'Rotate images cleanly in 90-degree increments or any custom angle with live canvas preview and batch ZIP download.'
              : 'Mirror images horizontally or vertically without quality loss and export single files or ZIP batches.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5 space-y-5">
              {mode === 'rotate' ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-sm font-bold text-[#181a18]">
                      Rotation Angle
                    </h2>
                    <button
                      type="button"
                      onClick={resetTransforms}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#646862] hover:text-[#0e7c5b] cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[90, 180, 270, 0].map((deg) => (
                      <Button
                        key={deg}
                        variant={rotation === deg ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setRotation(deg)}
                      >
                        {deg}°
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>-90°</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                    >
                      <RotateCw className="h-4 w-4" />
                      <span>+90°</span>
                    </Button>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-[#555955]">Custom Angle</span>
                      <span className="font-mono font-semibold tabular-nums text-[#0e7c5b]">
                        {rotation}°
                      </span>
                    </div>
                    <Slider
                      value={rotation}
                      min={0}
                      max={359}
                      onChange={setRotation}
                      ariaLabel="Custom rotation angle in degrees"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-sm font-bold text-[#181a18]">
                      Mirror Direction
                    </h2>
                    <button
                      type="button"
                      onClick={resetTransforms}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#646862] hover:text-[#0e7c5b] cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    <Button
                      variant={flipH ? 'primary' : 'outline'}
                      size="lg"
                      onClick={() => setFlipH((v) => !v)}
                    >
                      <FlipHorizontal className="h-4 w-4" />
                      <span>Flip Horizontal {flipH ? '(Active)' : ''}</span>
                    </Button>
                    <Button
                      variant={flipV ? 'primary' : 'outline'}
                      size="lg"
                      onClick={() => setFlipV((v) => !v)}
                    >
                      <FlipVertical className="h-4 w-4" />
                      <span>Flip Vertical {flipV ? '(Active)' : ''}</span>
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-[#e6e1d6] bg-[#faf8f3] px-3.5 py-2.5 text-xs font-mono tabular-nums text-[#555955] flex items-center justify-between">
                <span>Output Frame:</span>
                <span className="font-semibold text-[#181a18]">
                  {isQuarterTurn ? selectedItem.height : selectedItem.width} ×{' '}
                  {isQuarterTurn ? selectedItem.width : selectedItem.height} px
                </span>
              </div>

              <div className="border-t border-[#ebe6db] pt-4 space-y-2.5">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isProcessing}
                  onClick={applyToAll}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Rendering...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Apply &amp; Export ({items.length})</span>
                    </>
                  )}
                </Button>

                {completed.length > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={isZipping}
                    onClick={downloadZip}
                  >
                    <Archive className="h-4 w-4" />
                    <span>{isZipping ? 'Creating ZIP...' : `Download ZIP (${completed.length})`}</span>
                  </Button>
                )}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-2xl border border-[#e6e1d6] bg-white p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#181a18]">
                  Live Preview · {selectedItem.name}
                </p>
                {selectedItem.result && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      triggerBlobDownload(selectedItem.result!.blob, selectedItem.result!.filename)
                    }
                  >
                    <Download className="h-4 w-4" />
                    <span>Download ({formatBytes(selectedItem.result.size)})</span>
                  </Button>
                )}
              </div>
              <div className="checkerboard-bg flex h-80 items-center justify-center overflow-hidden rounded-xl border border-[#e6e1d6] p-6">
                <img
                  src={selectedItem.previewUrl}
                  alt={selectedItem.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain transition-transform duration-150"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
