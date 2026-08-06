import { createWorker, PSM } from 'tesseract.js'

type TesseractWorker = Awaited<ReturnType<typeof createWorker>>

let workerPromise: Promise<TesseractWorker> | null = null

export async function getOcrWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = createWorker('fra+eng')
  }
  return workerPromise
}

export async function recognizeText(
  canvas: HTMLCanvasElement,
  options?: { digitsOnly?: boolean }
): Promise<{ text: string; confidence: number | null }> {
  const worker = await getOcrWorker()

  if (options?.digitsOnly) {
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789',
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    })
  } else {
    await worker.setParameters({
      tessedit_char_whitelist: '',
      tessedit_pageseg_mode: PSM.AUTO,
    })
  }

  const result = await worker.recognize(canvas)
  return {
    text: result.data.text ?? '',
    confidence:
      typeof result.data.confidence === 'number'
        ? Number((result.data.confidence / 100).toFixed(3))
        : null,
  }
}
