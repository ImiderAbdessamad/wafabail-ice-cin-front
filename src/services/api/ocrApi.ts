/** Client HTTP vers ocr-cin-ice (CIN + ICE).
 *
 * En local : laisser VITE_API_BASE_URL vide → requêtes `/api/...`
 * passent par le proxy Vite (même origine, pas de CORS).
 */

const API_BASE = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
).trim().replace(/\/$/, '')

export interface CinExtractData {
  nom: string
  prenom: string
  cin: string
  date_naissance: string
  lieu_naissance: string
  date_expiration: string
  adresse: string
}

export interface CinExtractResponse {
  success: boolean
  data: CinExtractData
  model: string
  processing_time_ms: number
  warning?: string | null
}

export interface IceExtractData {
  ICE: string
  Denomination: string
  Identifiant_Fiscal: string
  RC_Numero: string
  RC_Ville: string
  CNSS: string
}

export interface IceExtractResponse {
  success: boolean
  data: IceExtractData
  model: string
  ocr_method: string
  processing_time_ms: number
  warning?: string | null
}

export class OcrApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = 'OcrApiError'
    this.status = status
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: unknown; error?: string }
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((d) => (typeof d === 'object' && d && 'msg' in d ? String(d.msg) : String(d)))
        .join(' · ')
    }
    if (body.error) return body.error
  } catch {
    /* ignore */
  }
  return `Erreur HTTP ${res.status}`
}

/** POST /api/cin/extract — champ multipart `recto` (+ `verso` optionnel). */
export async function extractCin(
  recto: File,
  verso?: File | null
): Promise<CinExtractResponse> {
  const form = new FormData()
  form.append('recto', recto, recto.name)
  if (verso) form.append('verso', verso, verso.name)

  const res = await fetch(`${API_BASE}/api/cin/extract`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new OcrApiError(await parseError(res), res.status)
  return (await res.json()) as CinExtractResponse
}

/** POST /api/v1/extract-ice — champ multipart `file`. */
export async function extractIce(file: File): Promise<IceExtractResponse> {
  const form = new FormData()
  form.append('file', file, file.name)

  const res = await fetch(`${API_BASE}/api/v1/extract-ice`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new OcrApiError(await parseError(res), res.status)
  return (await res.json()) as IceExtractResponse
}

export const CIN_DOC_IDS = ['cin_sejour_passeport', 'cin_associes_gerants'] as const
export const ICE_DOC_ID_API = 'attestation_ice'
