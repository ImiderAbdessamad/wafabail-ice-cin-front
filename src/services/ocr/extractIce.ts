import {
  extractPdfText,
  fileToOcrCanvas,
  iceBandFromCanvas,
  iceBoxFromCanvas,
  isPdf,
} from './fileToCanvas'
import { recognizeText } from './recognize'
import {
  type IceExtractionResult,
  findBestIceNumber,
  parseIceCertificate,
  toIceJson,
} from './iceTypes'

type OcrPassResult = {
  text: string
  bandDigits: string
  boxDigits: string
  confidence: number | null
}

async function runOcrPasses(file: File): Promise<OcrPassResult> {
  const full = await fileToOcrCanvas(file)
  const band = iceBandFromCanvas(full)
  const box = iceBoxFromCanvas(full)

  const [fullText, bandDigits, boxDigits] = await Promise.all([
    recognizeText(full),
    recognizeText(band, { digitsOnly: true }),
    recognizeText(box, { digitsOnly: true }),
  ])

  const merged = [fullText.text, bandDigits.text, boxDigits.text]
    .filter(Boolean)
    .join('\n')

  const confidence = Math.max(
    fullText.confidence ?? 0,
    bandDigits.confidence ?? 0,
    boxDigits.confidence ?? 0
  )

  return {
    text: merged,
    bandDigits: bandDigits.text,
    boxDigits: boxDigits.text,
    confidence: confidence > 0 ? Number(confidence.toFixed(3)) : null,
  }
}

function buildResult(
  file: File,
  rawText: string,
  method: IceExtractionResult['method'],
  confidence: number | null,
  clientType: IceExtractionResult['clientType'],
  digitHints: string[] = []
): IceExtractionResult {
  const parsed = parseIceCertificate(rawText)
  const iceFromDigits = findBestIceNumber(...digitHints, rawText)
  const ice = iceFromDigits ?? parsed.ice
  const extractedAt = new Date().toISOString()
  const data = { ...parsed, ice }

  if (ice) {
    return {
      source: 'attestation_ice',
      clientType,
      fileName: file.name,
      fileType: file.type || 'unknown',
      extractedAt,
      rawText,
      confidence,
      method,
      status: 'success',
      message: 'ICE extrait avec succes',
      ...data,
    }
  }

  return {
    source: 'attestation_ice',
    clientType,
    fileName: file.name,
    fileType: file.type || 'unknown',
    extractedAt,
    rawText,
    confidence,
    method,
    status: 'partial',
    message:
      'Document lu, mais aucun ICE detecte. Vous pourrez le saisir manuellement.',
    ...data,
  }
}

export async function extractIceFromFile(
  file: File,
  clientType: IceExtractionResult['clientType'] = 'pme_ge'
): Promise<IceExtractionResult> {
  try {
    if (isPdf(file)) {
      const pdfText = await extractPdfText(file)
      if (pdfText.length > 40) {
        const fromText = buildResult(file, pdfText, 'pdf-text', 1, clientType)
        if (fromText.ice) return fromText
      }
    }

    const ocr = await runOcrPasses(file)
    return buildResult(
      file,
      ocr.text,
      'ocr',
      ocr.confidence,
      clientType,
      [ocr.bandDigits, ocr.boxDigits]
    )
  } catch (error) {
    return {
      source: 'attestation_ice',
      clientType,
      fileName: file.name,
      fileType: file.type || 'unknown',
      extractedAt: new Date().toISOString(),
      rawText: '',
      confidence: null,
      method: 'ocr',
      status: 'failed',
      message:
        error instanceof Error
          ? error.message
          : 'Echec du traitement ICE',
      ice: null,
      denomination: null,
      identifiantFiscal: null,
      numeroRc: null,
      villeRc: null,
      numeroCnss: null,
    }
  }
}

export { toIceJson }
