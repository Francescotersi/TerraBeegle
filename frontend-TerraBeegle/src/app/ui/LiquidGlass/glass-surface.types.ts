export type DisplacementChannel = 'R' | 'G' | 'B' | 'A';

export type GlassRendererMode = 'auto' | 'webgl' | 'svg';

export interface ShapeBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ShapeTrace {
  image: HTMLImageElement;
  width: number;
  height: number;
  ratio: number;
  box: ShapeBox;
  depth: Float32Array;
  w: number;
  h: number;
  line: string;
  glow: string;
}

export interface ShapeArt {
  src: string;
  box?: ShapeBox;
  line?: string;
  glow?: string;
  failed?: boolean;
}

export interface WebGLSettings {
  backdrop: any;
  displace: number;
  saturation: number;
  distortionScale: number;
  redOffset: number;
  greenOffset: number;
  blueOffset: number;
  xChannel: DisplacementChannel;
  yChannel: DisplacementChannel;
}
