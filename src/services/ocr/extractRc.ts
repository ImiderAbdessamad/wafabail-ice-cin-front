import {
  extractPdfText,
  fileToOcrCanvas,
  isPdf,
} from './fileToCanvas'
import { recognizeText } from './recognize'
import {
  type RcExtractionResult,
  parseRcDocument,
  toRcJson,
} from './rcTypes'

async function runRcOcr(
  file: File
): Promise<{ text: string; confidence: number | null }> {
  const full = await fileToOcrCanvas(file)
  return recognizeText(full)
}

function buildResult(
  file: File,
  documentId: string,
  rawText: string,
  method: RcExtractionResult['method'],
  confidence: number | null
): RcExtractionResult {
  const parsed = parseRcDocument(rawText)
  const extractedAt = new Date().toISOString()

  if (parsed.numeroRc) {
    return {
      source: 'registre_commerce',
      documentId,
      fileName: file.name,
      fileType: file.type || 'unknown',
      extractedAt,
      rawText,
      confidence,
      method,
      status: 'success',
      message: 'Numero RC extrait avec succes',
      ...parsed,
    }
  }

  return {
    source: 'registre_commerce',
    documentId,
    fileName: file.name,
    fileType: file.type || 'unknown',
    extractedAt,
    rawText,
    confidence,
    method,
    status: 'partial',
    message:
      'Document lu, mais aucun numero RC detecte. Vous pourrez le saisir manuellement.',
    ...parsed,
  }
}

export async function extractRcFromFile(
  file: File,
  documentId: string
): Promise<RcExtractionResult> {
  try {
    if (isPdf(file)) {
      const pdfText = await extractPdfText(file)
      if (pdfText.length > 20) {
        const fromText = buildResult(file, documentId, pdfText, 'pdf-text', 1)
        if (fromText.numeroRc) return fromText
      }
    }

    const ocr = await runRcOcr(file)
    return buildResult(file, documentId, ocr.text, 'ocr', ocr.confidence)
  } catch (error) {
    return {
      source: 'registre_commerce',
      documentId,
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
          : 'Echec du traitement RC',
      numeroRc: null,
      villeRc: null,
    }
  }
}

export { toRcJson }
