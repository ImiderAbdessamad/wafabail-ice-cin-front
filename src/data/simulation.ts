export type ObjetFinancement = 'mobilier' | 'immobilier'

export const OBJET_FINANCEMENT_OPTIONS: {
  value: ObjetFinancement
  label: string
}[] = [
  { value: 'mobilier', label: 'Mobilier' },
  { value: 'immobilier', label: 'Immobilier' },
]

export const DUREE_MOBILIER = ['36', '48', '60'] as const
export const DUREE_IMMOBILIER = '120'

export const MONTANT_MIN: Record<ObjetFinancement, number> = {
  mobilier: 50_000,
  immobilier: 200_000,
}

export const APPORT_PCT_MIN = 0
export const APPORT_PCT_MAX = 30
export const MESSAGE_MAX_LENGTH = 500

export function getDureeOptions(objet: ObjetFinancement): string[] {
  return objet === 'immobilier' ? [DUREE_IMMOBILIER] : [...DUREE_MOBILIER]
}

export function getDefaultDuree(objet: ObjetFinancement): string {
  return objet === 'immobilier' ? DUREE_IMMOBILIER : '36'
}

export function parseAmount(value: string): number {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 0
  const n = Number(digits)
  return Number.isFinite(n) ? n : 0
}

export function formatAmount(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function clampApportPct(raw: string): string {
  if (raw === '') return ''
  const n = Number(raw.replace(',', '.'))
  if (!Number.isFinite(n)) return '0'
  return String(Math.min(APPORT_PCT_MAX, Math.max(APPORT_PCT_MIN, n)))
}

export function calcMontantApport(
  montantHt: string,
  apportPct: string
): number {
  const montant = parseAmount(montantHt)
  const pct = Number(apportPct) || 0
  return Math.round((montant * pct) / 100)
}

export function formatDh(amount: number): string {
  return `${amount.toLocaleString('fr-MA').replace(/\s/g, '.')} DH`
}
