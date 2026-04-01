import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const assetsDir = join(__dirname, '..', 'assets')

const BRAND_GREEN = '#00c896'
const BG_DARK = '#07090f'
const BG_DARK2 = '#0f1319'

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
  ctx.beginPath()
  // Leaf shape using bezier curves
  ctx.moveTo(0, -size * 0.5)
  ctx.bezierCurveTo(size * 0.6, -size * 0.4, size * 0.6, size * 0.3, 0, size * 0.5)
  ctx.bezierCurveTo(-size * 0.6, size * 0.3, -size * 0.6, -size * 0.4, 0, -size * 0.5)
  ctx.fillStyle = color
  ctx.fill()
  // Leaf vein
  ctx.beginPath()
  ctx.moveTo(0, -size * 0.35)
  ctx.lineTo(0, size * 0.35)
  ctx.strokeStyle = BG_DARK
  ctx.lineWidth = size * 0.06
  ctx.stroke()
  // Side veins
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue
    const y = i * size * 0.12
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo((i > 0 ? 1 : -1) * size * 0.2, y - size * 0.08)
    ctx.strokeStyle = BG_DARK
    ctx.lineWidth = size * 0.03
    ctx.stroke()
  }
  ctx.restore()
}

function generateIcon(size, filename, isAdaptive = false) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const center = size / 2
  const scale = size / 1024

  // Background
  if (isAdaptive) {
    // Transparent background for adaptive icon (Android adds its own bg)
    ctx.clearRect(0, 0, size, size)
  } else {
    // Rounded rect background
    ctx.fillStyle = BG_DARK
    ctx.fillRect(0, 0, size, size)

    // Subtle radial gradient overlay
    const grad = ctx.createRadialGradient(center, center, 0, center, center, center)
    grad.addColorStop(0, 'rgba(0, 200, 150, 0.08)')
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
  }

  // Draw chain links (two interlocking)
  const chainScale = isAdaptive ? 0.55 : 0.65
  const linkW = 160 * scale * chainScale
  const linkH = 100 * scale * chainScale
  const lineW = 28 * scale * chainScale
  const offset = 70 * scale * chainScale

  // Left chain link
  drawChainLink(ctx, center - offset, center + 20 * scale, linkW, linkH, -0.3, lineW, BRAND_GREEN)
  // Right chain link
  drawChainLink(ctx, center + offset, center + 20 * scale, linkW, linkH, 0.3, lineW, BRAND_GREEN)

  // Draw leaf on top
  const leafSize = 200 * scale * chainScale
  drawLeaf(ctx, center, center - 120 * scale * chainScale, leafSize, BRAND_GREEN)

  // "CT" text below chain
  const fontSize = Math.round(120 * scale * chainScale)
  ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.fillText('CT', center, center + 180 * scale * chainScale)

  const buffer = canvas.toBuffer('image/png')
  const path = join(assetsDir, filename)
  writeFileSync(path, buffer)
  console.log(`Generated: ${filename} (${size}x${size})`)
}

function generateFavicon(size, filename) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const center = size / 2

  // Dark background
  ctx.fillStyle = BG_DARK
  ctx.beginPath()
  ctx.arc(center, center, center, 0, Math.PI * 2)
  ctx.fill()

  // Simple "CT" text
  const fontSize = Math.round(size * 0.45)
  ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = BRAND_GREEN
  ctx.fillText('CT', center, center + 1)

  const buffer = canvas.toBuffer('image/png')
  const path = join(assetsDir, filename)
  writeFileSync(path, buffer)
  console.log(`Generated: ${filename} (${size}x${size})`)
}

function generateSplash(size, filename) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const center = size / 2
  const scale = size / 512

  // Transparent background (splash bg color is set in app.json)
  ctx.clearRect(0, 0, size, size)

  // Draw leaf
  const leafSize = 120 * scale
  drawLeaf(ctx, center, center - 60 * scale, leafSize, BRAND_GREEN)

  // Chain links below leaf
  const linkW = 90 * scale
  const linkH = 55 * scale
  const lineW = 16 * scale
  const offset = 40 * scale
  drawChainLink(ctx, center - offset, center + 30 * scale, linkW, linkH, -0.3, lineW, BRAND_GREEN)
  drawChainLink(ctx, center + offset, center + 30 * scale, linkW, linkH, 0.3, lineW, BRAND_GREEN)

  // "ChainTrace" text
  const fontSize = Math.round(36 * scale)
  ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = BRAND_GREEN
  ctx.fillText('ChainTrace', center, center + 110 * scale)

  // "Farmer" subtitle
  const subFontSize = Math.round(18 * scale)
  ctx.font = `${subFontSize}px Arial, Helvetica, sans-serif`
  ctx.fillStyle = 'rgba(0, 200, 150, 0.6)'
  ctx.fillText('Farmer', center, center + 145 * scale)

  const buffer = canvas.toBuffer('image/png')
  const path = join(assetsDir, filename)
  writeFileSync(path, buffer)
  console.log(`Generated: ${filename} (${size}x${size})`)
}

// Generate all icons
generateIcon(1024, 'icon.png', false)
generateIcon(1024, 'adaptive-icon.png', true)
generateSplash(512, 'splash-icon.png')
generateFavicon(48, 'favicon.png')

console.log('\nAll icons generated successfully!')
