export interface WaveRenderParams {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  time: number;
  isDark: boolean;
  isMobile: boolean;
  amplitude: number;
  opacity: number;
  loopIntensity: number;
}

function createWaveGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  isDark: boolean,
  alphaMultiplier = 1
): CanvasGradient {
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  if (isDark) {
    grad.addColorStop(0.0, `rgba(46, 217, 231, ${0.75 * alphaMultiplier})`);
    grad.addColorStop(0.35, `rgba(243, 73, 164, ${0.65 * alphaMultiplier})`);
    grad.addColorStop(0.7, `rgba(103, 16, 134, ${0.55 * alphaMultiplier})`);
    grad.addColorStop(1.0, `rgba(255, 230, 41, ${0.7 * alphaMultiplier})`);
  } else {
    grad.addColorStop(0.0, `rgba(251, 120, 120, ${0.72 * alphaMultiplier})`);
    grad.addColorStop(0.25, `rgba(253, 164, 130, ${0.65 * alphaMultiplier})`);
    grad.addColorStop(0.5, `rgba(251, 175, 90, ${0.58 * alphaMultiplier})`);
    grad.addColorStop(0.75, `rgba(251, 191, 36, ${0.68 * alphaMultiplier})`);
    grad.addColorStop(1.0, `rgba(245, 158, 11, ${0.7 * alphaMultiplier})`);
  }
  return grad;
}

function createSecondaryGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  isDark: boolean,
  alphaMultiplier = 1
): CanvasGradient {
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  if (isDark) {
    grad.addColorStop(0.0, `rgba(243, 73, 164, ${0.7 * alphaMultiplier})`);
    grad.addColorStop(0.4, `rgba(46, 217, 231, ${0.55 * alphaMultiplier})`);
    grad.addColorStop(0.75, `rgba(99, 102, 241, ${0.6 * alphaMultiplier})`);
    grad.addColorStop(1.0, `rgba(255, 230, 41, ${0.65 * alphaMultiplier})`);
  } else {
    grad.addColorStop(0.0, `rgba(249, 130, 100, ${0.68 * alphaMultiplier})`);
    grad.addColorStop(0.35, `rgba(253, 186, 116, ${0.58 * alphaMultiplier})`);
    grad.addColorStop(0.7, `rgba(254, 215, 140, ${0.62 * alphaMultiplier})`);
    grad.addColorStop(1.0, `rgba(251, 191, 36, ${0.65 * alphaMultiplier})`);
  }
  return grad;
}

function getWavePoint(
  u: number,
  t: number,
  isTop: boolean,
  strandIndex: number,
  params: WaveRenderParams
): { x: number; y: number } {
  const { w, h, isDark, amplitude, loopIntensity } = params;
  const centerY = h * 0.5;
  const direction = isTop ? -1 : 1;
  const ampBase = h * (isDark ? 0.22 : 0.26) * amplitude;
  const phase = t * 0.8 + strandIndex * 1.5 + (isTop ? 0 : Math.PI * 0.5);

  const yOffset =
    Math.sin(u * 2.4 * Math.PI * 2 + phase) * 0.65 +
    Math.sin(u * 5.2 * Math.PI * 2 - phase * 0.7) * 0.35 +
    Math.cos(u * 8.6 * Math.PI * 2 + phase * 0.5) * 0.15;

  const loopPhase = phase * 0.6 + u * 3.8 * Math.PI * 2;
  const loopX = Math.cos(loopPhase) * (w * 0.025) * loopIntensity;
  const loopY = Math.sin(loopPhase * 1.2) * (ampBase * 0.35) * loopIntensity;

  return {
    x: u * w + loopX,
    y: centerY + direction * (Math.abs(yOffset) * ampBase + loopY),
  };
}

function drawRibbonWithStroke(
  params: WaveRenderParams,
  t: number,
  isTop: boolean,
  strandIndex: number,
  fillGrad: CanvasGradient,
  strokeGrad: CanvasGradient,
  steps: number
): void {
  const { ctx, w, h, isMobile, isDark } = params;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    points.push(getWavePoint(i / steps, t, isTop, strandIndex, params));
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, h * 0.5);
  for (let i = 0; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) * 0.5;
    const yc = (points[i].y + points[i + 1].y) * 0.5;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.lineTo(w, h * 0.5);
  ctx.closePath();

  ctx.fillStyle = fillGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = strokeGrad;
  ctx.lineWidth = isMobile ? 1.5 : isDark ? 2.5 : 3.5;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawCenterHorizon(params: WaveRenderParams): void {
  const { ctx, w, h, time, isMobile, isDark } = params;
  const centerY = h * 0.5;
  const steps = isMobile ? 20 : 40;

  ctx.beginPath();
  ctx.moveTo(0, centerY);
  for (let i = 1; i <= steps; i++) {
    const u = i / steps;
    const yWobble = centerY + Math.sin(u * Math.PI * 4 + time * 0.5) * (isMobile ? 2 : 3);
    ctx.lineTo(u * w, yWobble);
  }

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  if (isDark) {
    grad.addColorStop(0.0, 'rgba(46, 217, 231, 0.35)');
    grad.addColorStop(0.5, 'rgba(243, 73, 164, 0.25)');
    grad.addColorStop(1.0, 'rgba(255, 230, 41, 0.35)');
  } else {
    grad.addColorStop(0.0, 'rgba(251, 120, 120, 0.35)');
    grad.addColorStop(0.5, 'rgba(251, 175, 90, 0.25)');
    grad.addColorStop(1.0, 'rgba(251, 191, 36, 0.35)');
  }

  ctx.strokeStyle = grad;
  ctx.lineWidth = isMobile ? 1 : 1.5;
  ctx.stroke();
}

/** Draws a single animated wave frame (halos, ribbons, and horizon line) onto the 2D canvas. */
export function renderWaveFrame(params: WaveRenderParams): void {
  const { ctx, w, h, time, isDark, isMobile, opacity } = params;

  ctx.clearRect(0, 0, w, h);

  const leftCol = isDark ? '46, 217, 231' : '254, 165, 130';
  const leftGlow = ctx.createRadialGradient(w * 0.1, h * 0.45, 0, w * 0.1, h * 0.45, w * 0.35);
  leftGlow.addColorStop(0, `rgba(${leftCol}, ${0.45 * opacity})`);
  leftGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = leftGlow;
  ctx.fillRect(0, 0, w, h);

  const rightCol = isDark ? '243, 73, 164' : '254, 215, 140';
  const rightGlow = ctx.createRadialGradient(w * 0.9, h * 0.35, 0, w * 0.9, h * 0.35, w * 0.38);
  rightGlow.addColorStop(0, `rgba(${rightCol}, ${0.55 * opacity})`);
  rightGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = rightGlow;
  ctx.fillRect(0, 0, w, h);

  const fill1 = createWaveGradient(ctx, w, isDark, 0.55 * opacity);
  const fill2 = createSecondaryGradient(ctx, w, isDark, 0.45 * opacity);
  const stroke1 = createWaveGradient(ctx, w, isDark, 0.7 * opacity);
  const stroke2 = createSecondaryGradient(ctx, w, isDark, 0.6 * opacity);

  const steps = isMobile ? 60 : 160;
  const waves = [
    { isTop: true, strand: 0, t: time, fill: fill1, stroke: stroke1 },
    { isTop: true, strand: 1, t: time * 1.15 + 1.2, fill: fill2, stroke: stroke2 },
    { isTop: false, strand: 0, t: time * 0.9 + 2.0, fill: fill2, stroke: stroke2 },
    { isTop: false, strand: 1, t: time * 1.1 + 3.2, fill: fill1, stroke: stroke1 },
  ];

  for (const wave of waves) {
    drawRibbonWithStroke(params, wave.t, wave.isTop, wave.strand, wave.fill, wave.stroke, steps);
  }

  drawCenterHorizon(params);
}
