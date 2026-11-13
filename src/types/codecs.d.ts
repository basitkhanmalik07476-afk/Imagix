declare module 'utif' {
  export interface IFD {
    width?: number;
    height?: number;
    t256?: number[];
    t257?: number[];
    t258?: number[];
    t259?: number[];
    [key: string]: unknown;
  }
  export function decode(buffer: ArrayBuffer): IFD[];
  export function decodeImage(buffer: ArrayBuffer, ifd: IFD): void;
  export function toRGBA8(ifd: IFD): Uint8Array;
  export function encodeImage(
    rgba: Uint8Array | Uint8ClampedArray,
    w: number,
    h: number,
    metadata?: Record<string, unknown>
  ): ArrayBuffer;
}

declare module 'gifenc' {
  export interface QuantizeOptions {
    format?: 'rgb565' | 'rgb444' | 'rgba4444';
    clearAlpha?: boolean;
    clearAlphaThreshold?: number;
    clearAlphaColor?: number;
    oneBitAlpha?: boolean | number;
  }
  export interface FrameOptions {
    palette?: number[][];
    delay?: number;
    transparent?: boolean;
    transparentIndex?: number;
    dispose?: number;
    repeat?: number;
    first?: boolean;
  }
  export function GIFEncoder(): {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: FrameOptions): void;
    finish(): void;
    bytes(): Uint8Array;
  };
  export function quantize(rgba: Uint8ClampedArray | Uint8Array, maxColors: number, opts?: QuantizeOptions): number[][];
  export function applyPalette(rgba: Uint8ClampedArray | Uint8Array, palette: number[][], format?: 'rgb565' | 'rgb444' | 'rgba4444'): Uint8Array;
}

declare module 'omggif' {
  export class GifReader {
    width: number;
    height: number;
    constructor(buf: Uint8Array);
    numFrames(): number;
    loopCount(): number;
    frameInfo(frame_num: number): {
      x: number;
      y: number;
      width: number;
      height: number;
      has_local_palette: boolean;
      palette_offset: number | null;
      palette_size: number | null;
      data_offset: number;
      data_length: number;
      transparent_index: number | null;
      interlaced: boolean;
      delay: number;
      disposal: number;
    };
    decodeAndBlitFrameRGBA(frame_num: number, pixels: Uint8Array | Uint8ClampedArray): void;
  }
}

declare module 'pica' {
  export interface PicaResizeOptions {
    quality?: 0 | 1 | 2 | 3;
    alpha?: boolean;
    unsharpAmount?: number;
    unsharpRadius?: number;
    unsharpThreshold?: number;
  }
  export interface PicaInstance {
    resize(from: HTMLCanvasElement | HTMLImageElement | ImageBitmap, to: HTMLCanvasElement, options?: PicaResizeOptions): Promise<HTMLCanvasElement>;
    toBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob>;
  }
  export default function Pica(options?: { features?: string[]; idle?: number }): PicaInstance;
}
