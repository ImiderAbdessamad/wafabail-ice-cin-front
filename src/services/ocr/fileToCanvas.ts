import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorker

export function isPdf(file: File): boolean {
  return (
    file.type.toLowerCase() === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')
  )
}

export function isImage(file: File): boolean {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return (
    type === 'image/jpeg' ||
    type === 'image/jpg' ||
    type === 'image/png' ||
    type.startsWith('image/') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png')
  )
}

export async function extractPdfText(file: File): Promise<string> {
  const data = await file.arrayBuffer()
  const pdf = await getDocument({ data }).promise
  const parts: string[] = []

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const line = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    parts.push(line)
  }

  return parts.join('\n').trim()
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Impossible de lire limage'))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

function preprocessCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non disponible')

  ctx.drawImage(source, 0, 0)
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = image.data
  const contrast = 1.45
  const intercept = 128 * (1 - contrast)

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const value = Math.max(0, Math.min(255, gray * contrast + intercept))
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
  }

  ctx.putImageData(image, 0, 0)
  return canvas
}

function cropCanvas(
  source: HTMLCanvasElement,
  xRatio: number,
  yRatio: number,
  wRatio: number,
  hRatio: number
): HTMLCanvasElement {
  const sx = Math.floor(source.width * xRatio)
  const sy = Math.floor(source.height * yRatio)
  const sw = Math.floor(source.width * wRatio)
  const sh = Math.floor(source.height * hRatio)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, sw)
  canvas.height = Math.max(1, sh)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non disponible')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  return canvas
}

function canvasFromImage(image: HTMLImageElement): HTMLCanvasElement {
  const targetMinSide = 2200
  const scale = Math.max(
    2,
    targetMinSide / Math.max(image.width, image.height)
  )
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non disponible')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  return preprocessCanvas(canvas)
}

async function canvasFromPdf(file: File): Promise<HTMLCanvasElement> {
  const data = await file.arrayBuffer()
  const pdf = await getDocument({ data }).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 3 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non disponible')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvas, canvasContext: ctx, viewport }).promise
  return preprocessCanvas(canvas)
}

export async function fileToOcrCanvas(file: File): Promise<HTMLCanvasElement> {
  if (isPdf(file)) return canvasFromPdf(file)
  if (isImage(file)) {
    const image = await loadImageElement(file)
    return canvasFromImage(image)
  }
  throw new Error('Format non supporté. Utilisez PDF, JPG ou PNG.')
}

export function iceBandFromCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  return cropCanvas(source, 0, 0.12, 1, 0.28)
}

export function iceBoxFromCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  return cropCanvas(source, 0.18, 0.18, 0.64, 0.14)
}
