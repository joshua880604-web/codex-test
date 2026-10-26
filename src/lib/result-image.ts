import { siteName } from './site';
import type { Metric } from './types';
import { formatMetric } from './sharing';
import { resultCardAddress } from './result-card-copy';
import { trendBounds } from './result-trend';
import type { ImageDetails } from './result-image-data';

// A local canvas report: no screenshots, remote images or rendering libraries.
// Keep 1200px resolution; grow vertically instead of clipping financial values.
export async function resultImage(title: string, mode: string, metrics: Metric[], notes: string[], toolURL: string,
  copy: { interpretation: string | null; tagline: string } = { interpretation: null, tagline: 'A clearer plan starts with clearer numbers.' },
  details: ImageDetails = { inputs: [], includeInputs: false, formula: '', trend: null }) {
  if (document.fonts) await Promise.all([400, 600, 700, 900].map(weight => document.fonts.load(`${weight} 32px Inter`))).catch(() => undefined);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image export is unavailable in this browser. Copy the summary instead.');
  const left = 64, width = 1072, ink = '#101828', muted = '#4b5d75', border = '#e0e7f1';
  type Text = { text: string; x: number; y: number; font: string; color: string };
  type Box = { x: number; y: number; w: number; h: number; fill: string; radius: number };
  const texts: Text[] = [], boxes: Box[] = [], decorations: (() => void)[] = [];
  const font = (size: number, weight = 400) => `${weight} ${size}px Inter, Arial, sans-serif`;
  const lineHeight = (size: number) => Math.ceil(size * 1.35);
  function lines(text: string, maxWidth: number, size: number, weight = 400) {
    ctx!.font = font(size, weight);
    const output: string[] = []; let line = '';
    const flush = () => { if (line) { output.push(line); line = ''; } };
    for (const word of text.trim().split(/\s+/)) {
      if (ctx!.measureText(line ? line + ' ' + word : word).width <= maxWidth) { line = line ? line + ' ' + word : word; continue; }
      flush();
      for (const char of word) { if (ctx!.measureText(line + char).width > maxWidth) flush(); line += char; }
    }
    flush(); return output;
  }
  function write(text: string, x: number, y: number, maxWidth: number, size = 30, color = ink, weight = 400) {
    for (const line of lines(text, maxWidth, size, weight)) { texts.push({ text: line, x, y, font: font(size, weight), color }); y += lineHeight(size); }
    return y;
  }
  function value(metric: Metric, x: number, y: number, maxWidth: number, size: number, color = ink) {
    const text = formatMetric(metric);
    // Never abbreviate, ellipsize or round a displayed result to make it fit.
    while (size > 40 && lines(text, maxWidth, size, 700).length > 1) size -= 2;
    return write(text, x, y, maxWidth, size, color, 700);
  }
  function box(x: number, y: number, w: number, h: number, fill = '#fff', radius = 24) { boxes.push({ x, y, w, h, fill, radius }); }
  function heading(text: string, y: number) { return write(text, left, y, width, 34, ink, 700) + 14; }
  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    ctx!.beginPath(); ctx!.moveTo(x + r, y); ctx!.arcTo(x + w, y, x + w, y + h, r); ctx!.arcTo(x + w, y + h, x, y + h, r); ctx!.arcTo(x, y + h, x, y, r); ctx!.arcTo(x, y, x + w, y, r); ctx!.closePath();
  }
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  // Two-color wordmark matches the current site, including the muted suffix.
  let brandX = 150;
  for (const [text, color, size] of [['Calculator', '#7562c7', 44], ['Free', '#b45309', 44], ['.io', '#64748b', 32]] as const) {
    texts.push({ text, x: brandX, y: 63 + (44 - size), font: font(size, 700), color }); ctx.font = font(size, 700); brandX += ctx.measureText(text).width;
  }
  write(date, 840, 74, 296, 30, muted);
  const badgeText = 'Free Forever - No Credit Card Required';
  ctx.font = font(30, 700);
  box(left, 146, ctx.measureText(badgeText).width + 84, 58, 'badge', 29);
  write(badgeText, left + 60, 155, width - 84, 30, '#5967cf', 700);
  decorations.push(() => {
    ctx!.fillStyle = '#5967cf'; ctx!.beginPath(); ctx!.arc(left + 29, 175, 11, 0, Math.PI * 2); ctx!.fill();
    ctx!.strokeStyle = '#fff'; ctx!.lineWidth = 2.8; ctx!.lineCap = 'round'; ctx!.lineJoin = 'round'; ctx!.beginPath(); ctx!.moveTo(left + 24, 175); ctx!.lineTo(left + 28, 179); ctx!.lineTo(left + 35, 171); ctx!.stroke();
  });
  let y = write(title, left, 232, width, 54, ink, 900) + 8;
  if (mode.trim().toLowerCase() !== title.trim().toLowerCase()) y = write(mode, left, y, width, 32, muted) + 8;
  y += 22;
  if (metrics[0]) {
    const top = y;
    y = write(metrics[0].label, left + 28, y + 28, width - 56, 34, '#fff', 600) + 12;
    y = value(metrics[0], left + 28, y, width - 56, 82, '#fff') + 28;
    box(left, top, width, y - top, 'summary', 28); y += 24;
  }
  if (metrics.length > 1) {
    y = heading('Result details', y);
    for (let i = 1; i < metrics.length; i += 2) {
      const top = y; let bottom = y;
      for (let j = i; j < Math.min(i + 2, metrics.length); j++) {
        const x = left + (j - i) * 548;
        const end = write(metrics[j].label, x + 24, top + 22, 476, 30, muted, 600) + 10;
        bottom = Math.max(bottom, value(metrics[j], x + 24, end, 476, 44) + 22);
      }
      for (let j = i; j < Math.min(i + 2, metrics.length); j++) box(left + (j - i) * 548, top, 524, bottom - top, '#f7f9fc', 20);
      y = bottom + 16;
    }
    y += 12;
  }
  if (copy.interpretation) {
    const top = y; y = write('Reading your result', left + 26, y + 24, width - 52, 34, ink, 700) + 12;
    y = write(copy.interpretation, left + 26, y, width - 52, 30, muted) + 24;
    box(left, top, width, y - top, '#f7f9fc'); y += 28;
  }
  const trend = details.trend;
  if (trend && trend.points.length > 1) {
    const top = y, first = trend.points[0], last = trend.points.at(-1)!, bounds = trendBounds(trend.points);
    y = write(trend.title, left + 26, y + 24, width - 52, 34, ink, 700) + 18;
    const plot = { left: left + 142, right: left + width - 40, top: y + 24, bottom: y + 270 };
    const px = (x: number) => plot.left + (x - first.x) / (last.x - first.x) * (plot.right - plot.left);
    const py = (n: number) => plot.bottom - (n - bounds.min) / (bounds.max - bounds.min) * (plot.bottom - plot.top);
    const compact = (n: number) => new Intl.NumberFormat('en-US', { notation: Math.abs(n) >= 1e12 || (n !== 0 && Math.abs(n) < .01) ? 'scientific' : 'compact', maximumFractionDigits: 1 }).format(n);
    for (const f of [0, .5, 1]) {
      const n = bounds.min + (bounds.max - bounds.min) * f, axisY = py(n);
      write(compact(n), left + 24, axisY - 18, 112, 30, muted);
      decorations.push(() => { ctx!.strokeStyle = '#e5ebf4'; ctx!.lineWidth = 1; ctx!.beginPath(); ctx!.moveTo(plot.left, axisY); ctx!.lineTo(plot.right, axisY); ctx!.stroke(); });
    }
    for (const f of [0, .5, 1]) {
      const time = first.x + (last.x - first.x) * f, label = compact(time);
      ctx.font = font(30); const length = ctx.measureText(label).width;
      write(label, px(time) - (f === 0 ? 0 : f === 1 ? length : length / 2), plot.bottom + 12, 220, 30, muted);
    }
    const line = (key: 'balance' | 'contributions' | 'comparison', color: string) => decorations.push(() => {
      ctx!.strokeStyle = color; ctx!.lineWidth = 4; ctx!.lineJoin = 'round'; ctx!.beginPath();
      trend.points.forEach((p, i) => { if (i) ctx!.lineTo(px(p.x), py(p[key]!)); else ctx!.moveTo(px(p.x), py(p[key]!)); }); ctx!.stroke();
    });
    if (trend.secondaryKey) line(trend.secondaryKey, '#f59e0b'); line('balance', '#367dff');
    write('USD', plot.left, plot.top - 35, 180, 30, muted);
    y = write(trend.xLabel, left + 400, plot.bottom + 56, 620, 30, muted) + 20;
    y = write(trend.balanceLabel + ': ' + formatMetric({ label: '', value: last.balance, format: 'money' }), left + 26, y, width - 52, 30, '#285fc4', 600) + 10;
    if (trend.secondaryKey) y = write(trend.secondaryLabel + ': ' + formatMetric({ label: '', value: last[trend.secondaryKey]!, format: 'money' }), left + 26, y, width - 52, 30, '#975600', 600) + 10;
    y = write((trend.sampled ? 'Simplified curve. ' : '') + trend.help + ' Full schedule available in the calculator and CSV.', left + 26, y, width - 52, 30, muted) + 24;
    box(left, top, width, y - top); y += 28;
  }
  if (details.includeInputs && details.inputs.length) {
    y = heading('Inputs & assumptions', y);
    for (let i = 0; i < details.inputs.length; i += 2) {
      const top = y; let bottom = y;
      for (let j = i; j < Math.min(i + 2, details.inputs.length); j++) {
        const x = left + (j - i) * 548, input = details.inputs[j];
        const end = write(input.label, x + 24, top + 22, 476, 30, muted, 600) + 8;
        bottom = Math.max(bottom, write(input.value, x + 24, end, 476, 32, ink, 600) + 22);
      }
      for (let j = i; j < Math.min(i + 2, details.inputs.length); j++) box(left + (j - i) * 548, top, 524, bottom - top, '#f7f9fc', 20);
      y = bottom + 14;
    }
    y += 14;
  }
  if (details.formula) {
    y = heading('Calculation method', y);
    y = write(details.formula, left, y, width, 30, muted) + 26;
  }
  const modelNotes = [...new Set([details.scope, ...notes].filter((n): n is string => Boolean(n?.trim())))];
  if (modelNotes.length) {
    y = heading('Assumptions & model notes', y);
    for (const note of modelNotes) y = write(note, left, y, width, 30, muted) + 12;
    y += 14;
  }
  const address = resultCardAddress(toolURL), footerURL = address.label.startsWith('LOCAL PREVIEW') ? 'LOCAL PREVIEW • ' + address.url : address.url;
  const disclaimer = (details.includeInputs ? 'Input details included. ' : 'Input details not included. ') + 'Calculation snapshot, not a quote or guarantee. Review the tool for full details and current rules.';
  const footerHeight = lines(copy.tagline, width, 30, 600).length * lineHeight(30) + 12 + lineHeight(36) + 12 + lines(footerURL, width, 30).length * lineHeight(30) + 16 + lines(disclaimer, width, 30).length * lineHeight(30);
  const height = Math.max(1680, Math.ceil(y + footerHeight + 116));
  // Stay below a 16M-pixel canvas for mobile memory. Never silently drop results.
  if (height > 12000) throw new Error('This report is too long for one PNG. Exclude input details or use the result summary and CSV.');
  const footerTop = height - footerHeight - 64;
  y = write(copy.tagline, left, footerTop, width, 30, muted, 600) + 12;
  y = write(siteName, left, y, width, 36, '#7562c7', 700) + 12;
  y = write(footerURL, left, y, width, 30, '#5143de') + 16;
  write(disclaimer, left, y, width, 30, muted);
  canvas.width = 1200; canvas.height = height;
  ctx.fillStyle = '#f7f9fc'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.shadowColor = 'rgba(15,23,42,.06)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 4;
  roundRect(32, 24, 1136, height - 48, 32); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.stroke();
  for (const b of boxes) {
    roundRect(b.x, b.y, b.w, b.h, b.radius);
    if (b.fill === 'summary') { const gradient = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h); gradient.addColorStop(0, '#596dcc'); gradient.addColorStop(1, '#764ba2'); ctx.fillStyle = gradient; }
    else ctx.fillStyle = b.fill === 'badge' ? '#fff' : b.fill;
    if (b.fill === 'badge') { ctx.shadowColor = 'rgba(15,23,42,.14)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4; }
    ctx.fill(); ctx.shadowColor = 'transparent'; if (b.fill !== 'summary') { ctx.strokeStyle = border; ctx.stroke(); }
  }
  // Original calculator mark, recolored to the current violet brand.
  roundRect(left, 54, 64, 70, 14); ctx.fillStyle = '#7365d6'; ctx.fill();
  roundRect(left + 12, 66, 40, 11, 3); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(left + 14, 93); ctx.lineTo(left + 28, 93); ctx.moveTo(left + 21, 86); ctx.lineTo(left + 21, 100); ctx.moveTo(left + 14, 111); ctx.lineTo(left + 28, 111); ctx.moveTo(left + 40, 94); ctx.lineTo(left + 52, 94); ctx.moveTo(left + 40, 105); ctx.lineTo(left + 52, 105); ctx.stroke();
  for (const draw of decorations) draw();
  ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(left, footerTop - 24); ctx.lineTo(left + width, footerTop - 24); ctx.stroke();
  ctx.textBaseline = 'top';
  for (const text of texts) { ctx.font = text.font; ctx.fillStyle = text.color; ctx.fillText(text.text, text.x, text.y); }
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Unable to create an image. Copy the summary instead.')), 'image/png'));
}
