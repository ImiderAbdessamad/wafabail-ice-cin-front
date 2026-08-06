import type { FormData } from '../types'
import { countAllUploaded } from './documents'
import { isPersonnePhysique } from './identification'

export interface SummaryRow {
  label: string
  value: string
}

export interface ConfirmationSummary {
  personalRows: SummaryRow[]
  projectRows: SummaryRow[]
}

export function buildConfirmationSummary(data: FormData): ConfirmationSummary {
  const { uploaded } = countAllUploaded(data.documents)

  const personalRows: SummaryRow[] = isPersonnePhysique(data.clientType)
    ? [
        { label: 'Nom', value: data.nom || '—' },
        { label: 'Prénom', value: data.prenom || '—' },
        { label: 'Email', value: data.email || '—' },
        { label: 'GSM', value: data.gsm || '—' },
      ]
    : [
        { label: 'Raison sociale', value: data.raisonSociale || '—' },
        { label: 'ICE', value: data.ice || '—' },
        { label: 'Email', value: data.email || '—' },
        { label: 'GSM', value: data.gsm || '—' },
      ]

  const projectRows: SummaryRow[] = [
    {
      label: 'Type',
      value:
        data.objetFinancement === 'immobilier' ? 'Immobilier' : 'Mobilier',
    },
    {
      label: 'Montant',
      value: data.montant ? `${data.montant} DH` : '—',
    },
    {
      label: 'Durée',
      value: data.duree ? `${data.duree} mois` : '—',
    },
    {
      label: 'Documents',
      value: String(uploaded),
    },
  ]

  return { personalRows, projectRows }
}
