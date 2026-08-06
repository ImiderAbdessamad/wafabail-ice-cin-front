import type { ClientType } from '../types'

export type IdentificationFieldId =
  | 'nom'
  | 'prenom'
  | 'cin'
  | 'raisonSociale'
  | 'ice'
  | 'gsm'
  | 'email'
  | 'registreCommerce'
  | 'villeRc'

export type FieldValidation =
  | 'email'
  | 'phone'
  | 'digits'
  | 'no_digits'

export interface IdentificationFieldConfig {
  id: IdentificationFieldId
  label: string
  required: boolean
  width: 'full' | 'half'
  type?: 'text' | 'email' | 'tel'
  inputMode?: 'text' | 'email' | 'tel' | 'numeric'
  validation?: FieldValidation
}

const FIELDS_PERSONNE_PHYSIQUE: IdentificationFieldConfig[] = [
  {
    id: 'nom',
    label: 'Nom',
    required: true,
    width: 'half',
    validation: 'no_digits',
  },
  {
    id: 'prenom',
    label: 'Prenom',
    required: true,
    width: 'half',
    validation: 'no_digits',
  },
  {
    id: 'cin',
    label: 'CIN / N carte de sejour / N carte auto-entrepreneur',
    required: true,
    width: 'full',
  },
  {
    id: 'gsm',
    label: 'GSM',
    required: true,
    width: 'half',
    type: 'tel',
    inputMode: 'tel',
    validation: 'phone',
  },
  {
    id: 'email',
    label: 'Email',
    required: true,
    width: 'full',
    type: 'email',
    inputMode: 'email',
    validation: 'email',
  },
  {
    id: 'registreCommerce',
    label: 'Registre de commerce',
    required: false,
    width: 'half',
    inputMode: 'numeric',
    validation: 'digits',
  },
  {
    id: 'villeRc',
    label: 'Ville RC',
    required: false,
    width: 'half',
    validation: 'no_digits',
  },
]

const FIELDS_PERSONNE_MORALE: IdentificationFieldConfig[] = [
  {
    id: 'raisonSociale',
    label: 'Raison sociale',
    required: true,
    width: 'half',
  },
  { id: 'ice', label: 'ICE', required: true, width: 'half' },
  {
    id: 'gsm',
    label: 'GSM',
    required: true,
    width: 'half',
    type: 'tel',
    inputMode: 'tel',
    validation: 'phone',
  },
  {
    id: 'email',
    label: 'Email',
    required: true,
    width: 'full',
    type: 'email',
    inputMode: 'email',
    validation: 'email',
  },
  {
    id: 'registreCommerce',
    label: 'Registre de commerce',
    required: false,
    width: 'half',
    inputMode: 'numeric',
    validation: 'digits',
  },
  {
    id: 'villeRc',
    label: 'Ville RC',
    required: false,
    width: 'half',
    validation: 'no_digits',
  },
]

const FIELDS_BY_CLIENT_TYPE: Record<ClientType, IdentificationFieldConfig[]> = {
  profession_liberale_pp: FIELDS_PERSONNE_PHYSIQUE,
  tpe_pm: FIELDS_PERSONNE_MORALE,
  pme_ge: FIELDS_PERSONNE_MORALE,
}

export function getIdentificationFields(
  clientType: ClientType | ''
): IdentificationFieldConfig[] {
  if (!clientType) return []
  return FIELDS_BY_CLIENT_TYPE[clientType]
}

export function isPersonnePhysique(clientType: ClientType | ''): boolean {
  return clientType === 'profession_liberale_pp'
}
