import JSZip from 'jszip';

export interface ZipEntryInput {
  filename: string;
  blob: Blob;
}

export async function buildZipArchive(
  entries: ZipEntryInput[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const usedNames = new Map<string, number>();

  for (const entry of entries) {
    const cleanName = entry.filename || 'image';
    const count = usedNames.get(cleanName) ?? 0;
    usedNames.set(cleanName, count + 1);

    let finalName = cleanName;
    if (count > 0) {
      const dot = cleanName.lastIndexOf('.');
      finalName =
        dot > 0
          ? `${cleanName.slice(0, dot)}-${count}${cleanName.slice(dot)}`
          : `${cleanName}-${count}`;
    }
    zip.file(finalName, entry.blob);
  }

  return zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (meta) => {
      onProgress?.(Math.round(meta.percent));
    }
  );
}
