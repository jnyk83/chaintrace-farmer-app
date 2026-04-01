import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const assetsDir = join(__dirname, '..', 'assets')

const BRAND_GREEN = '#00c896'
const BRAND_BLUE = '#2196F3'
const BG_DARK = '#07090f'

function drawChainLink(ctx, cx, cy, rx, ry, angle, lineWidth, color) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.restore()
}

function drawLeaf(ctx, cx, cy, size, color) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-0.15) // slight tilt
  ctx.beginPath()
  ctx.moveTo(0, -size * 0.5)
  ctx.bezierCurveTo(size * 0.55, -size * 0.4, size * 0.55, size * 0.3, 0, size * 0.5)
  ctx.bezierCurveTo(-size * 0.55, size * 0.3, -size * 0.55, -size * 0.4, 0, -size * 0.5)
  ctx.fillStyle = color
  ctx.fill()
  // Leaf vein
  ctx.beginPath()
  ctx.moveTo(0, -size * 0.32)
  ctx.lineTo(0, size * 0.32)
  ctx.strokeStyle = BG_DARK
  ctx.lineWidth = size * 0.05
  ctx.globalAlpha = 0.4
  ctx.stroke()
  ctx.globalAlpha = 1
  // Side veins
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue
    const y = i * size * 0.11
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo((i > 0 ? 1 : -1) * size * 0.18, y - size * 0.07)
    ctx.strokeStyle = BG_DARK
    ctx.lineWidth = size * 0.025
    ctx.globalAlpha = 0.3
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  ctx.restore()
}

function drawWave(ctx, cx, cy, width, amplitude, color, lineWidth) {
  ctx.save()
  ctx.beginPath()
  const startX = cx - width / 2
  ctx.moveTo(startX, cy)
  for (let x = 0; x <= width; x += 2) {
    const y = cy + Math.sin((x / width) * Math.PI * 3) * amplitude
    ctx.lineTo(startX + x, y)
  }
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.restore()
}

function generateIcon(size, filename, isAdaptive = false) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const center = size / 2
  const s = size / 1024

  // Background
  if (isAdaptive) {
    ctx.clearRect(0, 0, size, size)
  } else {
    ctx.fillStyle = BG_DARK
    ctx.fillRect(0, 0, size, size)
    // Subtle gradient: green top-left, blue bottom-right
    const grad = ctx.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, 'rgba(0, 200, 150, 0.07)')
    grad.addColorStop(1, 'rgba(33, 150, 243, 0.07)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
  }

  const cs = isAdaptive ? 0.5 : 0.6

  // Left chain link (GREEN — agriculture)
  const linkW = 150 * s * cs
  const linkH = 95 * s * cs
  const lineW = 26 * s * cs
  const offset = 65 * s * cs
  drawChainLink(ctx, center - offset, center + 10 * s, linkW, linkH, -0.25, lineW, BRAND_GREEN)

  // Right chain link (BLUE — aquatic)
  drawChainLink(ctx, center + offset, center + 10 * s, linkW, linkH, 0.25, lineW, BRAND_BLUE)

  // Leaf on top-left (green = crops)
  const leafSize = 150 * s * cs
  drawLeaf(ctx, center - 40 * s * cs, center - 130 * s * cs, leafSize, BRAND_GREEN)

  // Water waves on top-right (blue = aquatic)
  const waveY = center - 130 * s * cs
  const waveW = 120 * s * cs
  ctx.globalAlpha = 0.9
  drawWave(ctx, center + 50 * s * cs, waveY - 12 * s * cs, waveW, 12 * s * cs, BRAND_BLUE, 10 * s * cs)
  drawWave(ctx, center + 50 * s * cs, waveY + 12 * s * cs, waveW, 10 * s * cs, BRAND_BLUE, 8 * s * cs)
  ctx.globalAlpha = 1

  // "CT" text below
  const fontSize = Math.round(110 * s * cs)
  ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // Gradient text: green C, blue T
  const textY = center + 170 * s * cs
  ctx.fillStyle = BRAND_GREEN
  ctx.textAlign = 'right'
  ctx.fillText('C', center + 5 * s, textY)
  ctx.fillStyle = BRAND_BLUE
  ctx.textAlign = 'left'
  ctx.fillText('T', center + 5 * s, textY)

  const buffer = canvas.toBuffer('image/png')
  writeFileSync(join(assetsDir, filename), buffer)
  console.log(`Generated: ${filename} (${size}x${size})`)
}

function generateFavicon(size, filename) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const center = size / 2

  // Dark background circle
  ctx.fillStyle = BG_DARK
  ctx.beginPath()
  ctx.arc(center, center, center, 0, Math.PI * 2)
  ctx.fill()

  // "C" green, "T" blue
  const fontSize = Math.round(size * 0.4)
  ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillStyle = BRAND_GREEN
  ctx.textAlign = 'right'
  ctx.fillText('C', center + 1, center + 1)
  ctx.fillStyle = BRAND_BLUE
  ctx.textAlign = 'left'
  ctx.fillText('T', center + 1, center + 1)

  const buffer = canvas.toBuffer('image/png')
  writeFileSync(join(assetsDir, filename), buffer)
  console.log(`Generated: ${filename} (${size}x${size})`)
}

function generateSplash(size, filename) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const center = size / 2
  const s = size / 512

  ctx.clearRect(0, 0, size, size)

  // Leaf (green)
  const leafSize = 100 * s
  drawLeaf(ctx, center - 30 * s, center - 65 * s, leafSize, BRAND_GREEN)

  // Waves (blue)
  drawWave(ctx, center + 40 * s, center - 75 * s, 80 * s, 8 * s, BRAND_BLUE, 7 * s)
  drawWave(ctx, center + 40 * s, center - 55 * s, 70 * s, 7 * s, BRAND_BLUE, 5 * s)

  // Chain links
  const linkW = 80 * s
  const linkH = 50 * s
  const lineW = 14 * s
  const offset = 36 * s
  drawChainLink(ctx, center - offset, center + 25 * s, linkW, linkH, -0.25, lineW, BRAND_GREEN)
  drawChainLink(ctx, center + offset, center + 25 * s, linkW, linkH, 0.25, lineW, BRAND_BLUE)

  // "ChainTrace" — gradient text
  const fontSize = Math.round(34 * s)
  ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // Use green-blue gradient for text
  const textGrad = ctx.createLinearGradient(center - 80 * s, 0, center + 80 * s, 0)
  textGrad.addColorStop(0, BRAND_GREEN)
  textGrad.addColorStop(1, BRAND_BLUE)
  ctx.fillStyle = textGrad
  ctx.fillText('ChainTrace', center, center + 100 * s)

  // "Farmer" subtitle
  const subFontSize = Math.round(16 * s)
  ctx.font = `${subFontSize}px Arial, Helvetica, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.fillText('Farmer', center, center + 132 * s)

  const buffer = canvas.toBuffer('image/png')
  writeFileSync(join(assetsDir, filename), buffer)
  console.log(`Generated: ${filename} (${size}x${size})`)
}

// Generate all icons
generateIcon(1024, 'icon.png', false)
generateIcon(1024, 'adaptive-icon.png', true)
generateSplash(512, 'splash-icon.png')
generateFavicon(48, 'favicon.png')

console.log('\nAll icons generated successfully!')
