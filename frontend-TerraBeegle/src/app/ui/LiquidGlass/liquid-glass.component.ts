import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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

const FAR = 1e20;

const GLASS_VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const GLASS_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uBackdrop;
uniform sampler2D uMap;
uniform vec2 uCanvas;
uniform vec2 uSize;
uniform vec2 uOrigin;
uniform vec2 uStep;
uniform vec3 uScale;
uniform ivec2 uChannel;
uniform float uSpread;
uniform float uLod;
uniform float uSaturation;
out vec4 outColor;

vec4 bend(vec2 p) {
  vec4 map = texture(uMap, clamp(p / uSize, 0.0, 1.0));
  vec2 shift = vec2(map[uChannel.x], map[uChannel.y]) - 0.5;
  vec2 base = uOrigin + p * uStep;
  vec4 red = textureLod(uBackdrop, base + shift * uScale.r * uStep, uLod);
  vec4 green = textureLod(uBackdrop, base + shift * uScale.g * uStep, uLod);
  vec4 blue = textureLod(uBackdrop, base + shift * uScale.b * uStep, uLod);
  return vec4(red.r, green.g, blue.b, (red.a + green.a + blue.a) / 3.0);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y) / uCanvas * uSize;
  vec4 color = vec4(0.0);
  if (uSpread < 0.05) {
    color = bend(p);
  } else {
    float total = 0.0;
    for (int j = -2; j <= 2; j++) {
      for (int i = -2; i <= 2; i++) {
        vec2 offset = vec2(float(i), float(j)) * uSpread * 0.8;
        float weight = exp(-dot(offset, offset) / (2.0 * uSpread * uSpread));
        color += bend(p + offset) * weight;
        total += weight;
      }
    }
    color /= total;
  }
  vec3 rgb = color.a > 0.0 ? color.rgb / color.a : vec3(0.0);
  float s = uSaturation;
  mat3 tone = mat3(
    0.213 + 0.787 * s, 0.213 - 0.213 * s, 0.213 - 0.213 * s,
    0.715 - 0.715 * s, 0.715 + 0.285 * s, 0.715 - 0.715 * s,
    0.072 - 0.072 * s, 0.072 - 0.072 * s, 0.072 + 0.928 * s
  );
  rgb = clamp(tone * rgb, 0.0, 1.0);
  outColor = vec4(rgb * color.a, color.a);
}`;

const CHANNELS: Record<DisplacementChannel, number> = { R: 0, G: 1, B: 2, A: 3 };

function compileGlass(gl: WebGL2RenderingContext): WebGLProgram | null {
  const make = (type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    gl.deleteShader(shader);
    return null;
  };
  const vertex = make(gl.VERTEX_SHADER, GLASS_VERTEX);
  const fragment = make(gl.FRAGMENT_SHADER, GLASS_FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
}

function resolveBackdrop(backdrop: any): HTMLElement | null {
  if (typeof window === 'undefined' || !backdrop) return null;
  let node = backdrop;
  if (typeof backdrop === 'string') {
    node = document.querySelector(backdrop);
  } else if (backdrop && typeof backdrop === 'object' && 'nativeElement' in backdrop) {
    node = backdrop.nativeElement;
  } else if (backdrop && typeof backdrop === 'object' && 'current' in backdrop) {
    node = backdrop.current;
  }
  if (
    node instanceof HTMLImageElement ||
    node instanceof HTMLVideoElement ||
    node instanceof HTMLCanvasElement
  ) {
    return node;
  }
  return null;
}

function sourceSize(node: HTMLElement): [number, number] {
  if (node instanceof HTMLImageElement) return [node.naturalWidth, node.naturalHeight];
  if (node instanceof HTMLVideoElement) return [node.videoWidth, node.videoHeight];
  if (node instanceof HTMLCanvasElement) return [node.width, node.height];
  return [node.offsetWidth, node.offsetHeight];
}

function placeAxis(value: string | undefined, free: number): number {
  if (!value) return free / 2;
  if (value.endsWith('%')) return (parseFloat(value) / 100) * free;
  const px = parseFloat(value);
  return Number.isFinite(px) ? px : free / 2;
}

function contentBox(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const [naturalWidth, naturalHeight] = sourceSize(node);
  const style = getComputedStyle(node);
  const fit = style.objectFit || 'fill';
  if (!naturalWidth || !naturalHeight || fit === 'fill') {
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
  }
  const contain = Math.min(rect.width / naturalWidth, rect.height / naturalHeight);
  const cover = Math.max(rect.width / naturalWidth, rect.height / naturalHeight);
  const scale = fit === 'cover' ? cover : fit === 'contain' ? contain : fit === 'none' ? 1 : Math.min(1, contain);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const [px, py] = (style.objectPosition || '50% 50%').split(' ');
  return {
    x: rect.left + placeAxis(px, rect.width - width),
    y: rect.top + placeAxis(py ?? px, rect.height - height),
    width,
    height
  };
}

function distanceLine(f: Float64Array, d: Float64Array, v: Int32Array, z: Float64Array, n: number): void {
  let k = 0;
  v[0] = 0;
  z[0] = -FAR;
  z[1] = FAR;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = FAR;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

function distanceGrid(grid: Float32Array, w: number, h: number): void {
  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    distanceLine(f, d, v, z, h);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
    distanceLine(f, d, v, z, w);
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x];
  }
}

function blurLine(src: Float32Array, dst: Float32Array, offset: number, stride: number, n: number, r: number): void {
  const scale = 1 / (2 * r + 1);
  let sum = src[offset] * (r + 1);
  for (let i = 1; i <= r; i++) sum += src[offset + Math.min(i, n - 1) * stride];
  for (let i = 0; i < n; i++) {
    dst[offset + i * stride] = sum * scale;
    sum += src[offset + Math.min(i + r + 1, n - 1) * stride] - src[offset + Math.max(i - r, 0) * stride];
  }
}

function blurGrid(grid: Float32Array, w: number, h: number, r: number): void {
  const tmp = new Float32Array(w * h);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) blurLine(grid, tmp, y * w, 1, w, r);
    for (let x = 0; x < w; x++) blurLine(tmp, grid, x, w, h, r);
  }
}

function settle(x: number): number {
  return 1 / (1 + Math.exp(-1.702 * x));
}

function paint(w: number, h: number, fill: (data: Uint8ClampedArray) => void): string {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext('2d');
  if (!context) return '';
  const image = context.createImageData(w, h);
  fill(image.data);
  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

function shade(depth: Float32Array, w: number, h: number, falloff: (t: number) => number): string {
  return paint(w, h, data => {
    data.fill(255);
    for (let i = 0; i < w * h; i++) {
      data[i * 4 + 3] = 255 * (1 - falloff(depth[i]));
    }
  });
}

function traceShape(image: HTMLImageElement, width: number, height: number, ratio: number) {
  const naturalWidth = image.naturalWidth || width;
  const naturalHeight = image.naturalHeight || height;
  const fit = Math.min(width / naturalWidth, height / naturalHeight);
  const box = {
    x: (width - naturalWidth * fit) / 2,
    y: (height - naturalHeight * fit) / 2,
    width: naturalWidth * fit,
    height: naturalHeight * fit
  };
  const w = Math.max(2, Math.round(width * ratio));
  const h = Math.max(2, Math.round(height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return { box, depth: new Float32Array(w * h), w, h, ratio, line: '', glow: '' };
  }
  context.drawImage(image, box.x * ratio, box.y * ratio, box.width * ratio, box.height * ratio);
  const pixels = context.getImageData(0, 0, w, h).data;
  const outside = new Float32Array(w * h);
  const inside = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const edge = 0.5 - pixels[i * 4 + 3] / 255;
    outside[i] = edge >= 0.5 ? FAR : Math.max(edge, 0) ** 2;
    inside[i] = edge <= -0.5 ? FAR : Math.min(edge, 0) ** 2;
  }
  distanceGrid(outside, w, h);
  distanceGrid(inside, w, h);
  const depth = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    depth[i] = (Math.sqrt(inside[i]) - Math.sqrt(outside[i])) / ratio;
  }
  return {
    box,
    depth,
    w,
    h,
    ratio,
    line: shade(depth, w, h, t => settle(t - 1)),
    glow: shade(depth, w, h, t => settle((t - 4) / 5))
  };
}

function bendShape(trace: any, edge: number, softness: number, calm: number, level: number): string {
  const { depth, w, h, ratio } = trace;
  const reach = edge + softness * 2;
  const field = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) field[i] = Math.min(Math.max(depth[i], -6), reach);
  blurGrid(field, w, h, Math.max(1, Math.round(Math.max(1.5, softness * 0.35) * ratio)));
  return paint(w, h, data => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const dx = field[i + (x < w - 1 ? 1 : 0)] - field[i - (x > 0 ? 1 : 0)];
        const dy = field[i + (y < h - 1 ? w : 0)] - field[i - (y > 0 ? w : 0)];
        const still = calm * settle((depth[i] - edge) / softness);
        const bend = (1 - still) * ratio * 0.25;
        const shift = still * (level - 0.5);
        data[i * 4] = 255 * (0.5 + dx * bend + shift);
        data[i * 4 + 1] = 255 * (0.5 + dy * bend + shift);
        data[i * 4 + 2] = 255 * (0.5 + shift);
        data[i * 4 + 3] = 255;
      }
    }
  });
}

@Component({
  selector: 'app-liquid-glass, app-glass-surface, glass-surface',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './liquid-glass.component.html',
  styleUrls: ['./liquid-glass.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiquidGlassComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private static instanceCounter = 0;
  readonly uniqueId = `glass-${++LiquidGlassComponent.instanceCounter}-${Math.random().toString(36).substring(2, 7)}`;

  @Input() width?: number | string;
  @Input() height?: number | string;
  @Input() borderRadius: number = 20;
  @Input() borderWidth: number = 0.07;
  @Input() brightness: number = 500;
  @Input() opacity: number = 0.93;
  @Input() blur: number = 11;
  @Input() displace: number = 0;
  @Input() backgroundOpacity: number = 0;
  @Input() saturation: number = 1;
  @Input() distortionScale: number = -180;
  @Input() redOffset: number = 0;
  @Input() greenOffset: number = 10;
  @Input() blueOffset: number = 20;
  @Input() xChannel: DisplacementChannel = 'R';
  @Input() yChannel: DisplacementChannel = 'G';
  @Input() mixBlendMode: string = 'difference';
  @Input() refraction: boolean = true;
  @Input() renderer: GlassRendererMode = 'auto';
  @Input() backdrop: any = null;
  @Input() shape: string | null = null;
  @Input() customClass: string = '';
  @Input() customStyle: Record<string, any> = {};

  @ViewChild('container') containerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('feImage') feImageRef?: ElementRef<SVGElement>;
  @ViewChild('redChannel') redChannelRef?: ElementRef<SVGElement>;
  @ViewChild('greenChannel') greenChannelRef?: ElementRef<SVGElement>;
  @ViewChild('blueChannel') blueChannelRef?: ElementRef<SVGElement>;
  @ViewChild('gaussianBlur') gaussianBlurRef?: ElementRef<SVGElement>;
  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly filterId = `glass-filter-${this.uniqueId}`;
  readonly redGradId = `red-grad-${this.uniqueId}`;
  readonly blueGradId = `blue-grad-${this.uniqueId}`;
  readonly softId = `soft-${this.uniqueId}`;

  svgSupported: boolean = false;
  checked: boolean = false;
  webglFailed: boolean = false;
  boxSize: string = '';
  loadedShape: { src: string; image: HTMLImageElement | null } = { src: '', image: null };
  art: ShapeArt | null = null;

  private traceRef: any = null;
  private shapeMapUrl: string = '';
  mapUrl: string = '';
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private isBrowser: boolean;

  // WebGL context resources
  private gl: WebGL2RenderingContext | null = null;
  private glProgram: WebGLProgram | null = null;
  private glVAO: WebGLVertexArrayObject | null = null;
  private glBuffer: WebGLBuffer | null = null;
  private backdropTexture: WebGLTexture | null = null;
  private mapTexture: WebGLTexture | null = null;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private animFrameId: number = 0;
  private isIntersecting: boolean = true;
  private drawnSignature: string = '';
  private webglCleanups: (() => void)[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get isWebGLActive(): boolean {
    return (
      this.checked &&
      this.refraction &&
      Boolean(this.backdrop) &&
      !this.webglFailed &&
      (this.renderer === 'webgl' || (this.renderer === 'auto' && !this.svgSupported))
    );
  }

  get isSvgActive(): boolean {
    return !this.isWebGLActive && this.svgSupported && this.refraction;
  }

  get isFallbackActive(): boolean {
    return !this.isWebGLActive && !this.isSvgActive;
  }

  get isFrosted(): boolean {
    return !this.isWebGLActive && !this.isSvgActive;
  }

  get outline(): ShapeArt | null {
    if (this.shape && this.art?.src === this.shape && !this.art.failed) {
      return this.art;
    }
    return null;
  }

  get containerStyle(): Record<string, any> {
    const outline = this.outline;
    const maskUrl = outline ? `url("${outline.src.replace(/"/g, '%22').replace(/[\n\r]+/g, ' ')}")` : '';
    const maskPlace = outline && outline.box
      ? `${outline.box.x}px ${outline.box.y}px / ${outline.box.width}px ${outline.box.height}px no-repeat`
      : '';

    const shapeStyle = outline
      ? {
          borderRadius: 0,
          boxShadow: 'none',
          WebkitMask: `${maskUrl} ${maskPlace}`,
          mask: `${maskUrl} ${maskPlace}`
        }
      : this.shape && this.art?.src !== this.shape
      ? { opacity: 0, transition: 'none' }
      : {};

    return {
      ...this.customStyle,
      width:
        this.width !== undefined && this.width !== null
          ? typeof this.width === 'number'
            ? `${this.width}px`
            : this.width
          : '100%',
      height:
        this.height !== undefined && this.height !== null
          ? typeof this.height === 'number'
            ? `${this.height}px`
            : this.height
          : 'auto',
      borderRadius: `${this.borderRadius}px`,
      '--glass-frost': this.backgroundOpacity,
      '--glass-saturation': this.saturation,
      '--filter-id': `url(#${this.filterId})`,
      ...shapeStyle
    };
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.svgSupported = this.checkSupportsSVGFilters();
      this.checked = true;
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.initResizeObserver();
    if (this.shape) {
      this.loadShapeImage(this.shape);
    }
    this.updateDisplacementMap();
    this.updateSVGAttributes();

    if (this.isWebGLActive) {
      this.initWebGL();
    }
    this.cdr.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isBrowser) return;

    if (changes['shape']) {
      if (this.shape) {
        this.loadShapeImage(this.shape);
      } else {
        this.loadedShape = { src: '', image: null };
        this.art = null;
        this.shapeMapUrl = '';
        this.updateDisplacementMap();
      }
    }

    if (
      changes['width'] ||
      changes['height'] ||
      changes['borderRadius'] ||
      changes['borderWidth'] ||
      changes['brightness'] ||
      changes['opacity'] ||
      changes['blur'] ||
      changes['displace'] ||
      changes['distortionScale'] ||
      changes['redOffset'] ||
      changes['greenOffset'] ||
      changes['blueOffset'] ||
      changes['xChannel'] ||
      changes['yChannel'] ||
      changes['mixBlendMode']
    ) {
      this.processShape();
      this.updateDisplacementMap();
      this.updateSVGAttributes();
    }

    if (changes['backdrop'] || changes['renderer'] || changes['refraction']) {
      if (this.isWebGLActive && !this.glProgram) {
        setTimeout(() => this.initWebGL(), 0);
      } else if (!this.isWebGLActive && this.glProgram) {
        this.destroyWebGL();
      }
    }

    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.destroyWebGL();
  }

  private checkSupportsSVGFilters(): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    if (isWebkit || isFirefox) return false;

    const div = document.createElement('div');
    div.style.backdropFilter = `url(#${this.filterId})`;
    return div.style.backdropFilter !== '';
  }

  private initResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined' || !this.containerRef?.nativeElement) return;
    this.resizeObserver = new ResizeObserver(() => {
      const el = this.containerRef?.nativeElement;
      if (el) {
        this.boxSize = `${el.offsetWidth}x${el.offsetHeight}`;
        this.processShape();
        this.updateDisplacementMap();
        this.cdr.markForCheck();
      }
    });
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  private loadShapeImage(url: string): void {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => {
      if (this.shape === url) {
        this.loadedShape = { src: url, image };
        this.processShape();
        this.updateDisplacementMap();
        this.cdr.markForCheck();
      }
    };
    image.onerror = () => {
      if (this.shape === url) {
        this.loadedShape = { src: url, image: null };
        this.art = { src: url, failed: true };
        this.updateDisplacementMap();
        this.cdr.markForCheck();
      }
    };
    image.src = url;
  }

  private processShape(): void {
    const el = this.containerRef?.nativeElement;
    const w = el?.offsetWidth || 0;
    const h = el?.offsetHeight || 0;
    const shapeImg = this.shape && this.loadedShape.src === this.shape ? this.loadedShape.image : null;

    let map = '';
    let trace: any = null;

    if (shapeImg && w && h) {
      const ratio = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(400000 / (w * h)));
      trace = this.traceRef;
      try {
        if (!trace || trace.image !== shapeImg || trace.width !== w || trace.height !== h || trace.ratio !== ratio) {
          trace = { image: shapeImg, width: w, height: h, ...traceShape(shapeImg, w, h, ratio) };
          this.traceRef = trace;
        }
        const rawBorder =
          typeof this.borderWidth === 'number'
            ? this.borderWidth
            : parseFloat(this.borderWidth as any) || 0.07;
        const edge =
          rawBorder > 1
            ? Math.min(rawBorder, Math.min(w, h) * 0.45)
            : Math.min(w, h) * rawBorder * 0.5;

        map = bendShape(
          trace,
          edge,
          Math.max(this.blur, 0.5),
          this.opacity,
          this.brightness / 100
        );
      } catch {
        trace = null;
        this.traceRef = null;
      }
    }

    this.shapeMapUrl = map;
    if (this.shape && trace) {
      this.art = { src: this.shape, box: trace.box, line: trace.line, glow: trace.glow };
    } else if (this.shape && this.loadedShape.src === this.shape && !shapeImg) {
      this.art = { src: this.shape, failed: true };
    } else {
      this.art = null;
    }
  }

  private generateDisplacementMap(): string {
    const rect = this.containerRef?.nativeElement?.getBoundingClientRect();
    const actualWidth = rect?.width || (typeof this.width === 'number' ? this.width : 400);
    const actualHeight = rect?.height || (typeof this.height === 'number' ? this.height : 200);
    const rawBorder =
      typeof this.borderWidth === 'number'
        ? this.borderWidth
        : parseFloat(this.borderWidth as any) || 0.07;
    const minDim = Math.min(actualWidth, actualHeight);
    const edgeSize =
      rawBorder > 1
        ? Math.min(rawBorder, minDim * 0.45)
        : Math.min(minDim * 0.45, minDim * (rawBorder * 0.5));

    const svgContent = `
      <svg width="${actualWidth}" height="${actualHeight}" viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${this.redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${this.blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
          <filter id="${this.softId}" filterUnits="userSpaceOnUse" x="0" y="0" width="${actualWidth}" height="${actualHeight}" color-interpolation-filters="sRGB">
            <feGaussianBlur stdDeviation="${this.blur}" />
          </filter>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${this.borderRadius}" fill="url(#${this.redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${this.borderRadius}" fill="url(#${this.blueGradId})" style="mix-blend-mode: ${this.mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${this.borderRadius}" fill="hsl(0 0% ${this.brightness}% / ${this.opacity})" filter="url(#${this.softId})" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }

  private updateDisplacementMap(): void {
    this.mapUrl = this.shapeMapUrl || this.generateDisplacementMap();
    if (this.feImageRef?.nativeElement) {
      this.feImageRef.nativeElement.setAttribute('href', this.mapUrl);
    }
  }

  private updateSVGAttributes(): void {
    const channels = [
      { ref: this.redChannelRef, offset: this.redOffset },
      { ref: this.greenChannelRef, offset: this.greenOffset },
      { ref: this.blueChannelRef, offset: this.blueOffset }
    ];

    channels.forEach(({ ref, offset }) => {
      if (ref?.nativeElement) {
        ref.nativeElement.setAttribute('scale', (this.distortionScale + offset).toString());
        ref.nativeElement.setAttribute('xChannelSelector', this.xChannel);
        ref.nativeElement.setAttribute('yChannelSelector', this.yChannel);
      }
    });

    if (this.gaussianBlurRef?.nativeElement) {
      this.gaussianBlurRef.nativeElement.setAttribute('stdDeviation', this.displace.toString());
    }
  }

  private initWebGL(): void {
    if (!this.canvasRef?.nativeElement || !this.containerRef?.nativeElement) return;
    this.destroyWebGL();

    const canvas = this.canvasRef.nativeElement;
    const element = this.containerRef.nativeElement;
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false
    });

    if (!gl) {
      this.webglFailed = true;
      this.cdr.markForCheck();
      return;
    }

    const program = compileGlass(gl);
    if (!program) {
      this.webglFailed = true;
      this.cdr.markForCheck();
      return;
    }

    this.gl = gl;
    this.glProgram = program;

    const uniformNames = [
      'uBackdrop',
      'uMap',
      'uCanvas',
      'uSize',
      'uOrigin',
      'uStep',
      'uScale',
      'uChannel',
      'uSpread',
      'uLod',
      'uSaturation'
    ];
    this.uniforms = {};
    uniformNames.forEach(name => {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    });

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    this.glVAO = vao;
    this.glBuffer = buffer;

    const makeTexture = () => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return texture;
    };

    this.backdropTexture = makeTexture();
    this.mapTexture = makeTexture();

    const mapCanvas = document.createElement('canvas');
    const mapContext = mapCanvas.getContext('2d');
    const picture = { node: null as any, key: '', width: 0, height: 0, mipmapped: false, ready: false };
    const mapState = { url: '', ready: false };

    const loadMap = (url: string) => {
      mapState.url = url;
      const img = new Image();
      img.onload = () => {
        if (mapState.url !== url || !mapContext || !this.gl || !this.mapTexture) return;
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        mapCanvas.width = Math.max(1, Math.round(element.offsetWidth * ratio));
        mapCanvas.height = Math.max(1, Math.round(element.offsetHeight * ratio));
        mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        mapContext.drawImage(img, 0, 0, mapCanvas.width, mapCanvas.height);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.mapTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, mapCanvas);
        mapState.ready = true;
        this.drawnSignature = '';
      };
      img.src = url;
    };

    const uploadBackdrop = (node: HTMLElement) => {
      if (!this.gl || !this.backdropTexture) return;
      const still = node instanceof HTMLImageElement;
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.backdropTexture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, node as any);
      if (still) this.gl.generateMipmap(this.gl.TEXTURE_2D);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, still ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.LINEAR);
      [picture.width, picture.height] = sourceSize(node);
      picture.mipmapped = still;
      picture.ready = true;
    };

    const tick = () => {
      this.animFrameId = 0;
      if (!this.isIntersecting || document.hidden || !this.gl || !this.glProgram) return;
      this.animFrameId = requestAnimationFrame(tick);

      if (this.mapUrl && this.mapUrl !== mapState.url) {
        loadMap(this.mapUrl);
      }

      const node = resolveBackdrop(this.backdrop);
      if (!node) return;

      let key = '';
      if (node instanceof HTMLImageElement) {
        key = node.complete && node.naturalWidth ? node.currentSrc || node.src : '';
      } else if (node instanceof HTMLVideoElement) {
        key = node.readyState >= 2 ? `${node.currentSrc}|${node.currentTime}` : '';
      } else if (node instanceof HTMLCanvasElement) {
        key = `${node.width}x${node.height}|${performance.now()}`;
      }

      if (key && (node !== picture.node || key !== picture.key)) {
        try {
          uploadBackdrop(node);
        } catch {
          this.webglFailed = true;
          this.cdr.markForCheck();
          return;
        }
        picture.node = node;
        picture.key = key;
        this.drawnSignature = '';
      }

      if (!picture.ready || !mapState.ready) return;

      const layoutWidth = element.offsetWidth;
      const layoutHeight = element.offsetHeight;
      if (!layoutWidth || !layoutHeight) return;

      const box = element.getBoundingClientRect();
      const content = contentBox(node);
      if (!content.width || !content.height) return;

      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.round(layoutWidth * ratio));
      const height = Math.max(1, Math.round(layoutHeight * ratio));

      const signature = [
        box.left,
        box.top,
        box.width,
        box.height,
        content.x,
        content.y,
        content.width,
        content.height,
        width,
        height,
        picture.key,
        mapState.url,
        this.displace,
        this.saturation,
        this.distortionScale,
        this.redOffset,
        this.greenOffset,
        this.blueOffset,
        this.xChannel,
        this.yChannel
      ].join('|');

      if (signature === this.drawnSignature) return;
      this.drawnSignature = signature;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const scaleX = box.width / layoutWidth;
      const scaleY = box.height / layoutHeight;
      const texelsPerPixel = (picture.width / content.width) * (scaleX / ratio);
      const spreadTexels = (picture.width / content.width) * scaleX * Math.max(0, this.displace);
      const lod = picture.mipmapped
        ? Math.max(0, Math.log2(Math.max(texelsPerPixel, spreadTexels * 0.5, 0.000001)))
        : 0;

      gl.viewport(0, 0, width, height);
      gl.useProgram(this.glProgram);
      gl.bindVertexArray(this.glVAO!);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.backdropTexture);
      gl.uniform1i(this.uniforms['uBackdrop'], 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.mapTexture);
      gl.uniform1i(this.uniforms['uMap'], 1);

      gl.uniform2f(this.uniforms['uCanvas'], width, height);
      gl.uniform2f(this.uniforms['uSize'], layoutWidth, layoutHeight);
      gl.uniform2f(
        this.uniforms['uOrigin'],
        (box.left - content.x) / content.width,
        (box.top - content.y) / content.height
      );
      gl.uniform2f(this.uniforms['uStep'], scaleX / content.width, scaleY / content.height);
      gl.uniform3f(
        this.uniforms['uScale'],
        this.distortionScale + this.redOffset,
        this.distortionScale + this.greenOffset,
        this.distortionScale + this.blueOffset
      );
      gl.uniform2i(
        this.uniforms['uChannel'],
        CHANNELS[this.xChannel] ?? 0,
        CHANNELS[this.yChannel] ?? 1
      );
      gl.uniform1f(this.uniforms['uSpread'], Math.max(0, this.displace));
      gl.uniform1f(this.uniforms['uLod'], lod);
      gl.uniform1f(this.uniforms['uSaturation'], this.saturation);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const wake = () => {
      if (!this.animFrameId && this.isIntersecting && !document.hidden) {
        this.animFrameId = requestAnimationFrame(tick);
      }
    };

    const onLost = (event: Event) => {
      event.preventDefault();
      this.webglFailed = true;
      this.cdr.markForCheck();
    };

    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(entries => {
        this.isIntersecting = entries.some(entry => entry.isIntersecting);
        wake();
      });
      this.intersectionObserver.observe(element);
    } else {
      this.isIntersecting = true;
      wake();
    }

    const onVisibilityChange = () => wake();
    document.addEventListener('visibilitychange', onVisibilityChange);
    canvas.addEventListener('webglcontextlost', onLost);

    wake();

    this.webglCleanups.push(() => {
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.intersectionObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('webglcontextlost', onLost);
      if (this.gl) {
        if (this.backdropTexture) this.gl.deleteTexture(this.backdropTexture);
        if (this.mapTexture) this.gl.deleteTexture(this.mapTexture);
        if (this.glBuffer) this.gl.deleteBuffer(this.glBuffer);
        if (this.glVAO) this.gl.deleteVertexArray(this.glVAO);
        if (this.glProgram) this.gl.deleteProgram(this.glProgram);
      }
    });
  }

  private destroyWebGL(): void {
    while (this.webglCleanups.length > 0) {
      const cleanup = this.webglCleanups.pop();
      cleanup?.();
    }
    this.gl = null;
    this.glProgram = null;
    this.glVAO = null;
    this.glBuffer = null;
    this.backdropTexture = null;
    this.mapTexture = null;
  }
}


export { LiquidGlassComponent as GlassSurfaceComponent };
