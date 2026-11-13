import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { decodeFileToCanvas, probeCodecCapabilities } from '@/src/lib/image/codecs';
import {
  formatFromFilename,
  inspectFileSignature,
  normalizeDeclaredMime,
} from '@/src/lib/image/signatures';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
  type CapabilityMap,
  type WorkspaceImage,
} from '@/src/types/image';

export interface IngestionError {
  id: string;
  filename: string;
  reason: string;
}

interface WorkspaceContextValue {
  items: WorkspaceImage[];
  selectedId: string | null;
  selectedItem: WorkspaceImage | null;
  capabilities: CapabilityMap | null;
  capabilityError: string | null;
  ingestionErrors: IngestionError[];
  isIngesting: boolean;
  setSelectedId: (id: string | null) => void;
  addFiles: (files: FileList | File[]) => Promise<WorkspaceImage[]>;
  replaceItem: (id: string, file: File) => Promise<void>;
  removeItem: (id: string) => void;
  clearAll: () => void;
  dismissErrors: () => void;
  updateItem: (id: string, updater: (item: WorkspaceImage) => WorkspaceImage) => void;
  resetResults: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function makeId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function ingestSingleFile(file: File): Promise<WorkspaceImage> {
  if (file.size === 0) {
    throw new Error('File is empty (0 bytes).');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Exceeds the ${MAX_FILE_SIZE_LABEL} per-image browser memory limit.`);
  }

  const signature = await inspectFileSignature(file);
  const declaredFormat = normalizeDeclaredMime(file.type);
  const extFormat = formatFromFilename(file.name);
  const detectedFormat = signature.format ?? declaredFormat ?? extFormat;

  if (!detectedFormat) {
    throw new Error(
      'Unsupported or unrecognized image format. Supported: JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, ICO.'
    );
  }

  if (signature.format === null) {
    throw new Error(
      `File header bytes (${signature.hexHeader || 'empty'}) do not match a valid image signature. The file may be corrupted.`
    );
  }

  const mimeMismatch = Boolean(declaredFormat && declaredFormat !== signature.format);

  const { canvas, hasAlpha, previewUrl } = await decodeFileToCanvas(file, detectedFormat);

  return {
    id: makeId(),
    file,
    name: file.name || `pasted-image.${detectedFormat}`,
    detectedFormat,
    declaredMime: file.type || 'unknown',
    detectedMime: signature.detectedMime,
    mimeMismatch,
    hexHeader: signature.hexHeader,
    originalSize: file.size,
    width: canvas.width,
    height: canvas.height,
    hasAlpha,
    previewUrl,
    status: 'idle',
    progress: 0,
  };
}

function revokeItemUrls(item: WorkspaceImage) {
  if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  if (item.result?.url) URL.revokeObjectURL(item.result.url);
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WorkspaceImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<CapabilityMap | null>(null);
  const [capabilityError, setCapabilityError] = useState<string | null>(null);
  const [ingestionErrors, setIngestionErrors] = useState<IngestionError[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);

  const itemsRef = useRef<WorkspaceImage[]>([]);
  itemsRef.current = items;

  useEffect(() => {
    probeCodecCapabilities()
      .then(setCapabilities)
      .catch((error: unknown) => {
        setCapabilityError(
          error instanceof Error ? error.message : 'Browser codec capabilities could not be checked.'
        );
      });
    return () => {
      itemsRef.current.forEach(revokeItemUrls);
    };
  }, []);

  const addFiles = useCallback(async (fileInput: FileList | File[]): Promise<WorkspaceImage[]> => {
    const fileArray = Array.from(fileInput);
    if (fileArray.length === 0) return [];

    setIsIngesting(true);
    const created: WorkspaceImage[] = [];
    const errors: IngestionError[] = [];

    for (const file of fileArray) {
      try {
        const asset = await ingestSingleFile(file);
        created.push(asset);
      } catch (err) {
        errors.push({
          id: makeId(),
          filename: file.name || 'Unnamed file',
          reason: err instanceof Error ? err.message : 'Unable to read image file.',
        });
      }
    }

    if (created.length > 0) {
      setItems((prev) => [...prev, ...created]);
      setSelectedId((prev) => prev ?? created[0].id);
    }
    if (errors.length > 0) {
      setIngestionErrors((prev) => [...prev, ...errors]);
    }
    setIsIngesting(false);
    return created;
  }, []);

  const replaceItem = useCallback(async (id: string, file: File) => {
    setIsIngesting(true);
    try {
      const replacement = await ingestSingleFile(file);
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          revokeItemUrls(item);
          return { ...replacement, id: item.id };
        })
      );
    } catch (err) {
      setIngestionErrors((prev) => [
        ...prev,
        {
          id: makeId(),
          filename: file.name || 'Replacement file',
          reason: err instanceof Error ? err.message : 'Failed to replace image.',
        },
      ]);
    } finally {
      setIsIngesting(false);
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) revokeItemUrls(target);
      const next = prev.filter((i) => i.id !== id);
      setSelectedId((currentSelected) => {
        if (currentSelected !== id) return currentSelected;
        return next.length > 0 ? next[0].id : null;
      });
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach(revokeItemUrls);
      return [];
    });
    setSelectedId(null);
    setIngestionErrors([]);
  }, []);

  const dismissErrors = useCallback(() => {
    setIngestionErrors([]);
  }, []);

  const updateItem = useCallback(
    (id: string, updater: (item: WorkspaceImage) => WorkspaceImage) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const next = updater(item);
          if (item.result?.url && item.result.url !== next.result?.url) {
            URL.revokeObjectURL(item.result.url);
          }
          return next;
        })
      );
    },
    []
  );

  const resetResults = useCallback(() => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.result?.url) URL.revokeObjectURL(item.result.url);
        return {
          ...item,
          status: 'idle',
          progress: 0,
          errorMessage: undefined,
          result: undefined,
        };
      })
    );
  }, []);

  const selectedItem = items.find((i) => i.id === selectedId) ?? items[0] ?? null;

  return (
    <WorkspaceContext.Provider
      value={{
        items,
        selectedId,
        selectedItem,
        capabilities,
        capabilityError,
        ingestionErrors,
        isIngesting,
        setSelectedId,
        addFiles,
        replaceItem,
        removeItem,
        clearAll,
        dismissErrors,
        updateItem,
        resetResults,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
