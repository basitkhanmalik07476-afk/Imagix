import { useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { ToolIcon } from '@/src/components/icons/ToolIcon';
import { Button } from '@/src/components/ui/button';
import { useWorkspace } from '@/src/context/WorkspaceContext';
import { fetchStudioSampleFile } from '@/src/lib/sampleLoader';

interface WorkspaceEmptyStateProps {
  toolSlug: string;
  title: string;
  description: string;
}

export function WorkspaceEmptyState({
  toolSlug,
  title,
  description,
}: WorkspaceEmptyStateProps) {
  const { addFiles } = useWorkspace();
  const [loadingSample, setLoadingSample] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);

  const handleLoadSample = async () => {
    if (loadingSample) return;
    setLoadingSample(true);
    setSampleError(null);
    try {
      const file = await fetchStudioSampleFile();
      await addFiles([file]);
    } catch (error) {
      setSampleError(
        error instanceof Error ? error.message : 'The sample image could not be loaded.'
      );
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e6e1d6] bg-white px-5 py-4 text-center sm:flex-row sm:flex-wrap sm:text-left">
      <div className="flex items-center gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d5ebe0] bg-[#ebf5f0] text-[#0e7c5b]">
          <ToolIcon slug={toolSlug} size="sm" />
        </span>
        <div>
          <p className="font-display text-sm font-bold text-[#181a18]">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[#555955]">{description}</p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLoadSample}
        disabled={loadingSample}
        className="shrink-0"
      >
        {loadingSample ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0e7c5b]" />
        ) : (
          <ImagePlus className="h-3.5 w-3.5 text-[#0e7c5b]" />
        )}
        <span>{loadingSample ? 'Loading Sample...' : 'Try Studio Sample'}</span>
      </Button>
      {sampleError && (
        <p role="alert" className="w-full text-left text-xs text-red-700 sm:basis-full">
          Sample could not be loaded: {sampleError}
        </p>
      )}
    </div>
  );
}
