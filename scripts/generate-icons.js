#!/usr/bin/env node
// Run: node scripts/generate-icons.js
// Generates PWA icons using Canvas API (install: npm install canvas)

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT_DIR = path.join(__dirname, "../public/icons");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function drawIcon(size) {
  const canvas  = createCanvas(size, size);
  const ctx     = canvas.getContext("2d");
  const padding = size * 0.1;
  const r       = size * 0.22;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#16162a");
  bg.addColorStop(1, "#0d0d1a");
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, size, size, size * 0.2);
  ctx.fill();

  // Gold ring
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2);
  ctx.strokeStyle = "#C8A96E";
  ctx.lineWidth   = size * 0.04;
  ctx.stroke();

  // "W" text
  ctx.fillStyle   = "#C8A96E";
  ctx.font        = `bold ${size * 0.38}px serif`;
  ctx.textAlign   = "center";
  ctx.textBaseline= "middle";
  ctx.fillText("W", size / 2, size / 2 + size * 0.03);

  return canvas.toBuffer("image/png");
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

SIZES.forEach(size => {
  try {
    const buf  = drawIcon(size);
    const file = path.join(OUT_DIR, `icon-${size}x${size}.png`);
    fs.writeFileSync(file, buf);
    console.log(`✅ Generated ${size}x${size}`);
  } catch (e) {
    console.warn(`⚠️  Skipped ${size}x${size} (canvas not available) — use a real PNG file`);
  }
});
