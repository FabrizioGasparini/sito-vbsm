// Disegno del post 1080×1350 — misure ricavate dalle grafiche Canva originali

export const W = 1080;
export const H = 1350;

export const LAYOUT = {
  photo: { w: 1080, h: 800 },                 // zona della foto (sotto il bordo strappato)
  title: { x: 540, baseline: 875, capHeight: 50, size: 65.6, scaleX: 0.829, maxW: 860 },
  digits: { left: 314, right: 764.5, top: 902, h: 201, color: "#EEE8E8" },
  sets: { x: 539, firstBaseline: 973, step: 43, size: 32 },
  logos: { left: 150, right: 932, y: 1004, w: 150, h: 102 },
  names: { left: 314, right: 764.5, baselines: [1143, 1178], size: 25, maxW: 250 },
  sponsor: { x: 540, y: 1236, maxW: 300, maxH: 140 },
};

// Cifre del punteggio: stesse forme "college" della grafica originale (0-3), disegnate come vettori
// Coordinate in pixel del template, box 106×201 (l'1 è largo 63)
const GLYPHS = {
  0: { w: 106, paths: [
    [[20,0],[86,0],[106,20],[106,181],[86,201],[20,201],[0,181],[0,20]],
    [[32,33],[74,33],[74,169],[32,169]],
  ] },
  1: { w: 63, paths: [
    [[28,0],[48,0],[48,169],[63,169],[63,201],[0,201],[0,169],[15,169],[15,54],[0,54],[0,34]],
  ] },
  2: { w: 106, paths: [
    [[20,0],[86,0],[106,20],[106,100],[88,118],[32,118],[32,169],[106,169],[106,201],[0,201],[0,102],[18,84],[74,84],[74,33],[32,33],[32,60],[0,60],[0,20]],
  ] },
  3: { w: 106, paths: [
    [[20,0],[86,0],[106,20],[106,86],[94,96],[94,100],[106,110],[106,181],[86,201],[20,201],[0,181],[0,144],[32,144],[32,169],[74,169],[74,118],[32,118],[32,84],[74,84],[74,33],[32,33],[32,60],[0,60],[0,20]],
  ] },
};

/** Font originali, se disponibili sul PC (impostato da app.js): { digits: "Yearbook Solid", title: "Paalalabas Condensed" } */
export const fonts = { digits: null, title: null };
const metricsCache = new Map();

/** Dimensione del font perché `sample` sia alto esattamente `height` px */
function fitFontSize(ctx, family, sample, height) {
  const key = `${family}|${sample}|${height}`;
  if (!metricsCache.has(key)) {
    ctx.save();
    ctx.font = `100px "${family}"`;
    const m = ctx.measureText(sample);
    ctx.restore();
    const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    metricsCache.set(key, { size: h > 0 ? (100 * height) / h : 100, descent: m.actualBoundingBoxDescent / 100 });
  }
  return metricsCache.get(key);
}

function drawDigit(ctx, ch, cx, top, color) {
  const g = GLYPHS[ch];
  ctx.fillStyle = color;
  if (fonts.digits) {
    const { size, descent } = fitFontSize(ctx, fonts.digits, "0123", LAYOUT.digits.h);
    ctx.save();
    ctx.font = `${size}px "${fonts.digits}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(String(ch), cx, top + LAYOUT.digits.h - descent * size);
    ctx.restore();
    return;
  }
  if (!g) {
    // cifre che nella pallavolo non servono: ripiego sul font del titolo
    ctx.save();
    ctx.font = `${LAYOUT.digits.h * 1.3}px "League Gothic"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(String(ch), cx, top + LAYOUT.digits.h);
    ctx.restore();
    return;
  }
  const x0 = cx - g.w / 2;
  ctx.beginPath();
  for (const poly of g.paths) {
    poly.forEach(([x, y], i) => (i ? ctx.lineTo(x0 + x, top + y) : ctx.moveTo(x0 + x, top + y)));
    ctx.closePath();
  }
  ctx.fill("evenodd");
}

function drawScore(ctx, value, cx) {
  const text = String(value ?? "");
  const { top, color } = LAYOUT.digits;
  if (text.length <= 1) return drawDigit(ctx, text, cx, top, color);
  // due cifre (non succede nella pallavolo, ma meglio non rompersi)
  const widths = [...text].map((c) => (GLYPHS[c]?.w ?? 106));
  const gap = 14;
  let x = cx - (widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1)) / 2;
  [...text].forEach((c, i) => {
    drawDigit(ctx, c, x + widths[i] / 2, top, color);
    x += widths[i] + gap;
  });
}

/** Testo centrato con larghezza massima: se non ci sta si stringe in orizzontale */
function fillFitted(ctx, text, x, y, maxW, scaleX = 1) {
  const natural = ctx.measureText(text).width * scaleX;
  const sx = natural > maxW ? (scaleX * maxW) / natural : scaleX;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, 1);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawContained(ctx, img, cx, cy, maxW, maxH, scale = 1) {
  if (!img) return;
  const r = Math.min(maxW / img.width, maxH / img.height) * scale;
  const w = img.width * r;
  const h = img.height * r;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

/** Copertura minima della zona foto */
export function coverScale(img) {
  return Math.max(LAYOUT.photo.w / img.width, LAYOUT.photo.h / img.height);
}

/** Tiene la foto sempre a coprire tutta la zona (niente bordi vuoti) */
export function clampPhoto(p) {
  if (!p?.img) return p;
  const min = coverScale(p.img);
  p.scale = Math.max(p.scale, min);
  const w = p.img.width * p.scale;
  const h = p.img.height * p.scale;
  p.x = Math.min(0, Math.max(LAYOUT.photo.w - w, p.x));
  p.y = Math.min(0, Math.max(LAYOUT.photo.h - h, p.y));
  return p;
}

let tintCanvas = null;
function tinted(mask, color) {
  if (!tintCanvas) tintCanvas = document.createElement("canvas");
  tintCanvas.width = mask.width;
  tintCanvas.height = mask.height;
  const t = tintCanvas.getContext("2d");
  t.clearRect(0, 0, mask.width, mask.height);
  t.drawImage(mask, 0, 0);
  t.globalCompositeOperation = "source-in";
  t.fillStyle = color;
  t.fillRect(0, 0, mask.width, mask.height);
  t.globalCompositeOperation = "source-over";
  return tintCanvas;
}

/**
 * state = {
 *   accent, categoria, photo: {img,x,y,scale},
 *   home: {score, lines:[..], logo: Image, logoScale}, away: {...},
 *   sets: [[25,20], ...], sponsor: {img, larghezza, scale}
 * }
 * assets = { template, strisce }
 */
export function render(ctx, state, assets) {
  const L = LAYOUT;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // 1. foto
  const p = state.photo;
  if (p?.img) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, L.photo.w, L.photo.h);
    ctx.clip();
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(p.img, p.x, p.y, p.img.width * p.scale, p.img.height * p.scale);
    ctx.restore();
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, L.photo.h);
    grad.addColorStop(0, "#2a2a2e");
    grad.addColorStop(1, "#141416");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, L.photo.w, L.photo.h);
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.font = '500 34px "Roboto"';
    ctx.textAlign = "center";
    ctx.fillText("Trascina qui la foto della squadra", 540, 380);
  }

  // 2. bordo strappato + sfondo a puntini, strisce laterali nel colore della squadra
  //    (se esiste uno sfondo esportato da Canva per questo colore, si usa quello)
  const custom = assets.sfondi?.[state.genere];
  if (custom) {
    ctx.drawImage(custom, 0, 0, W, H);
  } else {
    if (assets.template) ctx.drawImage(assets.template, 0, 0, W, H);
    if (assets.strisce) ctx.drawImage(tinted(assets.strisce, state.accent), 0, 0, W, H);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // 3. categoria
  ctx.fillStyle = state.accent;
  if (fonts.title) {
    const { size } = fitFontSize(ctx, fonts.title, "E", L.title.capHeight);
    ctx.font = `${size}px "${fonts.title}"`;
    fillFitted(ctx, (state.categoria || "").toUpperCase(), L.title.x, L.title.baseline, L.title.maxW, 1);
  } else {
    ctx.font = `${L.title.size}px "League Gothic"`;
    fillFitted(ctx, (state.categoria || "").toUpperCase(), L.title.x, L.title.baseline, L.title.maxW, L.title.scaleX);
  }

  // 4. punteggio
  drawScore(ctx, state.home.score, L.digits.left);
  drawScore(ctx, state.away.score, L.digits.right);

  // 5. parziali
  ctx.fillStyle = state.accent;
  ctx.font = `700 ${L.sets.size}px "Roboto Mono"`;
  const pad = (n) => String(n ?? "").padStart(2, "0");
  (state.sets || []).forEach(([a, b], i) => {
    ctx.fillText(`${pad(a)} - ${pad(b)}`, L.sets.x, L.sets.firstBaseline + i * L.sets.step);
  });

  // 6. loghi
  drawContained(ctx, state.home.logo, L.logos.left, L.logos.y, L.logos.w, L.logos.h, state.home.logoScale ?? 1);
  drawContained(ctx, state.away.logo, L.logos.right, L.logos.y, L.logos.w, L.logos.h, state.away.logoScale ?? 1);

  // 7. nomi squadre
  ctx.fillStyle = state.accent;
  ctx.font = `700 ${L.names.size}px "Roboto"`;
  for (const [side, x] of [["home", L.names.left], ["away", L.names.right]]) {
    const lines = (state[side].lines || []).filter(Boolean).slice(0, 2);
    lines.forEach((line, i) => fillFitted(ctx, line.toUpperCase(), x, L.names.baselines[i], L.names.maxW));
  }

  // 8. sponsor
  const s = state.sponsor;
  if (s?.img) {
    const target = (s.larghezza || 240) * (s.scale ?? 1);
    const r = Math.min(target / s.img.width, (L.sponsor.maxH * (s.scale ?? 1)) / s.img.height);
    const w = s.img.width * r;
    const h = s.img.height * r;
    ctx.drawImage(s.img, L.sponsor.x - w / 2, L.sponsor.y - h / 2, w, h);
  }

  ctx.restore();
}
