import type { IceExtractionResult, RcExtractionResult } from './services/ocr'

export type ClientType =
  | 'profession_liberale_pp'
  | 'tpe_pm'
  | 'pme_ge'

export type StepId =
  | 'documentation'
  | 'simulation'
  | 'identification'
  | 'confirmation'

export interface DocumentItem {
  id: string
  label: string
  hint: string
  required: boolean
  file: File | null
}

export interface DocumentCategory {
  id: string
  title: string
  iconBg: string
  iconColor: string
  badgeBg: string
  documents: DocumentItem[]
}

export interface FormData {
  clientType: ClientType | ''
  documents: DocumentCategory[]
  acceptCgu: boolean
  acceptData: boolean
  objetFinancement: 'mobilier' | 'immobilier'
  montant: string
  duree: string
  apportPct: string
  activite: string
  objetDuFinancement: string
  messageComplementaire: string
  nom: string
  prenom: string
  cin: string
  raisonSociale: string
  ice: string
  gsm: string
  email: string
  registreCommerce: string
  villeRc: string
  clientAttijari: 'oui' | 'non' | ''
  clientWafabail: 'oui' | 'non' | ''
  iceOcr: IceExtractionResult | null
  iceWorkspaceId: string | null
  rcOcr: RcExtractionResult | null
}

export const CLIENT_TYPE_OPTIONS: { value: ClientType; label: string }[] = [
  {
    value: 'profession_liberale_pp',
    label: 'Profession libérale / TPE personne physique',
  },
  {
    value: 'tpe_pm',
    label: 'TPE personne morale',
  },
  {
    value: 'pme_ge',
    label: 'PME & Grande Entreprise',
  },
]

export const STEPS: { id: StepId; label: string }[] = [
  { id: 'documentation', label: 'Documentation' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'identification', label: 'Identification' },
  { id: 'confirmation', label: 'Confirmation' },
]

export function createInitialFormData(): FormData {
  return {
    clientType: '',
    documents: [],
    acceptCgu: false,
    acceptData: false,
    objetFinancement: 'mobilier',
    montant: '',
    duree: '36',
    apportPct: '0',
    activite: '',
    objetDuFinancement: '',
    messageComplementaire: '',
    nom: '',
    prenom: '',
    cin: '',
    raisonSociale: '',
    ice: '',
    gsm: '',
    email: '',
    registreCommerce: '',
    villeRc: '',
    clientAttijari: 'non',
    clientWafabail: 'non',
    iceOcr: null,
    iceWorkspaceId: null,
    rcOcr: null,
  }
}
