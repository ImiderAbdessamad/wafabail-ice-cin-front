export interface RcCertificateData {
  numeroRc: string | null
  villeRc: string | null
}

export interface RcExtractionResult extends RcCertificateData {
  source: 'registre_commerce'
  documentId: string
  fileName: string
  fileType: string
  extractedAt: string
  rawText: string
  confidence: number | null
  method: 'pdf-text' | 'ocr'
  status: 'success' | 'partial' | 'failed'
  message: string
}

export const RC_DOC_IDS = ['rc_modele_7'] as const

export function isRcDocument(docId: string): boolean {
  return (RC_DOC_IDS as readonly string[]).includes(docId)
}

function normalizeDigitToken(token: string): string {
  return token
    .toUpperCase()
    .replace(/O/g, '0')
    .replace(/[Il|]/g, '1')
    .replace(/S/g, '5')
    .replace(/B/g, '8')
    .replace(/Z/g, '2')
    .replace(/\D/g, '')
}

function captureAfterLabel(text: string, labels: string[]): string | null {
  const upper = text.toUpperCase()
  for (const label of labels) {
    const idx = upper.indexOf(label.toUpperCase())
    if (idx < 0) continue
    const slice = text.slice(idx + label.length, idx + label.length + 140)
    const cleaned = slice
      .replace(/^[\s:.\-–—]+/, '')
      .split(/\n| {2,}|\t/)[0]
      ?.trim()
    if (cleaned && cleaned.length > 0) return cleaned
  }
  return null
}

function cleanVilleRc(value: string | null | undefined): string | null {
  if (!value) return null
  const cleaned = value
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, '')
    .replace(/[^A-Za-zÀ-ÿ\-\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.length > 1 ? cleaned : null
}

function parseNumeroVille(raw: string): RcCertificateData {
  const cleaned = raw.replace(/\u00A0/g, ' ').trim()

  const withCity = cleaned.match(
    /^([0-9OIlSBZ\s]{1,12})\s*[\/|\-–—]\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\-\s']{1,40})/i
  )
  if (withCity) {
    const numeroRc = normalizeDigitToken(withCity[1]) || null
    const villeRc = cleanVilleRc(withCity[2])
    return { numeroRc, villeRc }
  }

  const digits = normalizeDigitToken(cleaned)
  return {
    numeroRc: digits.length > 0 ? digits : null,
    villeRc: null,
  }
}

export function parseRcDocument(rawText: string): RcCertificateData {
  const normalized = rawText.replace(/\u00A0/g, ' ')

  const labeled = captureAfterLabel(normalized, [
    'Numero Analytique',
    'Numéro Analytique',
    'NUMERO ANALYTIQUE',
    'Numero RC',
    'Numéro RC',
    'NUMERO RC',
    'N° RC',
    'N°R.C',
    'N° R.C',
    'N RC',
    'R.C.',
    'RC',
    'Registre de commerce',
    'REGISTRE DE COMMERCE',
    'REGISTRE DU COMMERCE',
    'Numéro du registre',
    'Numero du registre',
  ])

  if (labeled) {
    const parsed = parseNumeroVille(labeled)
    if (parsed.numeroRc) return parsed
  }

  const patterns = [
    /NUM(?:E|É)RO\s+ANALYTIQUE\s*[:\-.]?\s*([0-9OIlSBZ]{1,12})/i,
    /R\.?\s*C\.?\s*[:\-.]?\s*([0-9OIlSBZ]{1,12}(?:\s*[\/|\-]\s*[A-Za-zÀ-ÿ\-]+)?)/i,
    /REGISTRE\s+D[UE]\s+COMMERCE[^\dOIl]{0,40}([0-9OIlSBZ]{1,12}(?:\s*[\/|\-]\s*[A-Za-zÀ-ÿ\-]+)?)/i,
  ]

  for (const pattern of patterns) {
    const match = normalized.match(pattern)
    if (!match?.[1]) continue
    const parsed = parseNumeroVille(match[1])
    if (parsed.numeroRc) return parsed
  }

  return { numeroRc: null, villeRc: null }
}

export function toRcJson(result: RcExtractionResult): Record<string, unknown> {
  return {
    source: result.source,
    documentId: result.documentId,
    fileName: result.fileName,
    extractedAt: result.extractedAt,
    method: result.method,
    status: result.status,
    data: {
      numeroRc: result.numeroRc,
      villeRc: result.villeRc,
    },
  }
}
