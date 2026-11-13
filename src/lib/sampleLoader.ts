import sampleCameraUrl from '@/src/assets/images/hero_studio_camera_optimized.jpg';

/**
 * Fetches the bundled studio rangefinder photograph and wraps it as a File object
 * so users can test any tool workspace with one click without hunting for a file on disk.
 */
export async function fetchStudioSampleFile(): Promise<File> {
  const res = await fetch(sampleCameraUrl);
  if (!res.ok) {
    throw new Error(`Sample image request failed (${res.status}).`);
  }

  const blob = await res.blob();
  if (!blob.type.startsWith('image/')) {
    throw new Error('The sample image response was not a valid image.');
  }

  return new File([blob], 'imagix-studio-sample.jpg', {
    type: blob.type || 'image/jpeg',
  });
}
