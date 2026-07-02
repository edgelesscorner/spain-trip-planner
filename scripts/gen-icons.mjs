// Generates the PWA PNG icons (no external deps) as a terracotta tile with an
// off-white sun + sea curve, matching favicon.svg. Run: npm run gen:icons
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(here, '..', 'public')
mkdirSync(PUBLIC, { recursive: true })

// ── colors (RGBA) — vertical gradients for smooth grading ────────────────────
const TERRA_TOP = [207, 111, 68, 255]
const TERRA_BOT = [176, 82, 46, 255]
const CREAM = [250, 247, 242, 255]
const SEA_TOP = [76, 150, 168, 255]
const SEA_BOT = [38, 102, 120, 255]

function lerp(a, b, t) {
  const c = Math.max(0, Math.min(1, t))
  return [
    Math.round(a[0] + (b[0] - a[0]) * c),
    Math.round(a[1] + (b[1] - a[1]) * c),
    Math.round(a[2] + (b[2] - a[2]) * c),
    255,
  ]
}

function px(buf, w, x, y, [r, g, b, a]) {
  const i = (y * w + x) * 4
  buf[i] = r
  buf[i + 1] = g
  buf[i + 2] = b
  buf[i + 3] = a
}

function renderRaw(size) {
  const buf = Buffer.alloc(size * size * 4)
  const cx = size * 0.5
  const sunY = size * 0.4
  const sunR = size * 0.18
  const seaY = size * 0.66
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color = lerp(TERRA_TOP, TERRA_BOT, y / size)
      // sun
      const ds = Math.hypot(x - cx, y - sunY)
      if (ds <= sunR) color = CREAM
      // graded sea band with gentle waves
      const wave = Math.sin((x / size) * Math.PI * 3) * size * 0.03
      if (y > seaY + wave) {
        color = lerp(SEA_TOP, SEA_BOT, (y - seaY) / (size - seaY))
      }
      px(buf, size, x, y, color)
    }
  }
  return buf
}

/** Box-average a supersampled buffer down to `size` for anti-aliased edges. */
function downsample(src, srcSize, ss) {
  const dst = Math.floor(srcSize / ss)
  const out = Buffer.alloc(dst * dst * 4)
  const n = ss * ss
  for (let y = 0; y < dst; y++) {
    for (let x = 0; x < dst; x++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let j = 0; j < ss; j++) {
        for (let i = 0; i < ss; i++) {
          const si = ((y * ss + j) * srcSize + (x * ss + i)) * 4
          r += src[si]
          g += src[si + 1]
          b += src[si + 2]
          a += src[si + 3]
        }
      }
      const di = (y * dst + x) * 4
      out[di] = Math.round(r / n)
      out[di + 1] = Math.round(g / n)
      out[di + 2] = Math.round(b / n)
      out[di + 3] = Math.round(a / n)
    }
  }
  return out
}

/** Render at 4× then downsample → smooth, non-pixelated edges. */
function render(size) {
  const ss = 4
  return downsample(renderRaw(size * ss), size * ss, ss)
}

// ── PNG encode (color type 6, 8-bit RGBA) ────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  // 10,11,12 = compression, filter, interlace = 0
  // add filter byte (0) per scanline
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw)
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const [name, size] of [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  const png = encodePNG(size, render(size))
  writeFileSync(join(PUBLIC, name), png)
  console.log(`wrote public/${name} (${png.length} bytes)`)
}
