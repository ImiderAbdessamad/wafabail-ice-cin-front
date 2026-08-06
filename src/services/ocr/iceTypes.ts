export interface IceCertificateData {
  ice: string | null
  denomination: string | null
  identifiantFiscal: string | null
  numeroRc: string | null
  villeRc: string | null
  numeroCnss: string | null
}

export interface IceExtractionResult extends IceCertificateData {
  source: 'attestation_ice'
  clientType: 'tpe_pm' | 'pme_ge'
  fileName: string
  fileType: string
  extractedAt: string
  rawText: string
  confidence: number | null
  method: 'pdf-text' | 'ocr'
  status: 'success' | 'partial' | 'failed'
  message: string
}

export const ICE_DOC_ID = 'attestation_ice'

export function isIceExtractionClient(
  clientType: string
): clientType is IceExtractionResult['clientType'] {
  return clientType === 'tpe_pm' || clientType === 'pme_ge'
}

export function normalizeDigitToken(token: string): string {
  return token
    .toUpperCase()
    .replace(/O/g, '0')
    .replace(/[Il|]/g, '1')
    .replace(/S/g, '5')
    .replace(/B/g, '8')
    .replace(/Z/g, '2')
    .replace(/\D/g, '')
}

export function findBestIceNumber(...texts: Array<string | null | undefined>): string | null {
  const scores = new Map<string, number>()

  const add = (ice: string, score: number) => {
    if (!/^00[1-9]\d{12}$/.test(ice)) return
    scores.set(ice, (scores.get(ice) ?? 0) + score)
  }

  for (const text of texts) {
    if (!text) continue
    const upper = text.toUpperCase()

    for (const token of upper.match(/[0-9OIlSBZ]{15,18}/g) ?? []) {
      const digits = normalizeDigitToken(token)
      if (digits.length >= 15) add(digits.slice(0, 15), 5)
    }

    const labeledPatterns = [
      /IDENTIFIANT\s+COMMUN[\s\S]{0,120}?([0-9OIlSBZ][0-9OIlSBZ\s]{12,30})/i,
      /(?:N(?:UM[EÉ]RO|°|º)?\s*)?I\.?\s*C\.?\s*E\.?\s*[:\-.]?\s*([0-9OIlSBZ][0-9OIlSBZ\s]{12,30})/i,
      /L['’]?\s*ENTREPRISE\s*([0-9OIlSBZ][0-9OIlSBZ\s]{12,30})/i,
    ]
    for (const pattern of labeledPatterns) {
      const match = upper.match(pattern)
      if (!match?.[1]) continue
      const digits = normalizeDigitToken(match[1])
      if (digits.length >= 15) add(digits.slice(0, 15), 8)
    }

    const allDigits = normalizeDigitToken(upper)
    for (let i = 0; i <= allDigits.length - 15; i += 1) {
      add(allDigits.slice(i, i + 15), 1)
    }
  }

  let best: string | null = null
  let bestScore = -1
  for (const [ice, score] of scores) {
    if (score > bestScore) {
      best = ice
      bestScore = score
    }
  }
  return best
}

function isIceCertificateDocument(text: string): boolean {
  const upper = text.toUpperCase()
  return (
    upper.includes('IDENTIFIANT COMMUN') ||
    upper.includes('CERTIFICAT') && upper.includes('IDENTIFIANT') ||
    upper.includes('CERTIFICAT') && upper.includes('ENTREPRISE') ||
    /L['’]?\s*ENTREPRISE/.test(upper)
  )
}

function isRegistreCommerceOnly(text: string): boolean {
  const upper = text.toUpperCase()
  const looksRc =
    upper.includes('REGISTRE DU COMMERCE') ||
    upper.includes("CERTIFICAT D'IMMATRICULATION") ||
    upper.includes('CERTIFICAT D IMMATRICULATION') ||
    upper.includes('CERTIFICAT D’IMMATRICULATION') ||
    upper.includes('NUMERO ANALYTIQUE') ||
    upper.includes('NUMÉRO ANALYTIQUE')
  return looksRc && !isIceCertificateDocument(upper)
}

function cleanVilleRc(value: string | null): string | null {
  if (!value) return null
  const cleaned = value
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, '')
    .replace(/[^A-Za-zÀ-ÿ\-\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.length > 1 ? cleaned : null
}

function captureAfterLabel(text: string, labels: string[]): string | null {
  const upper = text.toUpperCase()
  for (const label of labels) {
    const idx = upper.indexOf(label.toUpperCase())
    if (idx < 0) continue
    const slice = text.slice(idx + label.length, idx + label.length + 120)
    const cleaned = slice
      .replace(/^[\s:.\-–—]+/, '')
      .split(/\n| {2,}|\t/)[0]
      ?.trim()
    if (cleaned && cleaned.length > 1) return cleaned
  }
  return null
}

export function parseIceCertificate(rawText: string): IceCertificateData {
  const normalized = rawText.replace(/\u00A0/g, ' ')
  const empty: IceCertificateData = {
    ice: null,
    denomination: null,
    identifiantFiscal: null,
    numeroRc: null,
    villeRc: null,
    numeroCnss: null,
  }

  if (isRegistreCommerceOnly(normalized)) {
    return empty
  }

  const ice = findBestIceNumber(normalized)

  let denomination = captureAfterLabel(normalized, [
    'Denomination',
    'Dénomination',
    'DENOMINATION',
  ])
  if (denomination) {
    denomination = denomination
      .replace(/\s{2,}/g, ' ')
      .replace(/[\u0600-\u06FF].*/g, '')
      .trim()
  }

  const identifiantFiscal =
    captureAfterLabel(normalized, [
      'Identifiant Fiscal',
      'IDENTIFIANT FISCAL',
    ])?.replace(/\D/g, '') ?? null

  const rcRaw = captureAfterLabel(normalized, [
    'Numero RC',
    'Numéro RC',
    'NUMERO RC',
    'N° RC',
  ])
  let numeroRc: string | null = null
  let villeRc: string | null = null
  if (rcRaw) {
    const parts = rcRaw.split(/[\/|]/).map((p) => p.trim())
    numeroRc = parts[0]?.replace(/[^\d]/g, '') || null
    villeRc = cleanVilleRc(parts[1] ?? null)
  }

  const numeroCnss =
    captureAfterLabel(normalized, [
      'Numero CNSS',
      'Numéro CNSS',
      'CNSS',
    ])?.replace(/\D/g, '') ?? null

  return {
    ice,
    denomination,
    identifiantFiscal,
    numeroRc,
    villeRc,
    numeroCnss,
  }
}

export function toIceJson(result: IceExtractionResult): Record<string, unknown> {
  return {
    source: result.source,
    clientType: result.clientType,
    fileName: result.fileName,
    extractedAt: result.extractedAt,
    method: result.method,
    status: result.status,
    data: {
      ice: result.ice,
      denomination: result.denomination,
      identifiantFiscal: result.identifiantFiscal,
      numeroRc: result.numeroRc,
      villeRc: result.villeRc,
      numeroCnss: result.numeroCnss,
    },
  }
}
