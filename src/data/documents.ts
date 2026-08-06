import type { ClientType, DocumentCategory, DocumentItem } from '../types'

const FILE_HINT = 'Identifiant commun de l\'entreprise · PDF, JPG, PNG'

type DocDef = Omit<DocumentItem, 'file'>
type CategoryDef = Omit<DocumentCategory, 'documents'> & { documents: DocDef[] }

const CATEGORY_STYLES = {
  identite: {
    iconBg: 'rgba(249, 115, 22, 0.18)',
    iconColor: '#f97316',
    badgeBg: 'rgba(251, 191, 146, 0.35)',
  },
  financier: {
    iconBg: 'rgba(96, 165, 250, 0.2)',
    iconColor: '#60a5fa',
    badgeBg: 'rgba(251, 191, 146, 0.35)',
  },
  juridique: {
    iconBg: 'rgba(74, 222, 128, 0.18)',
    iconColor: '#4ade80',
    badgeBg: 'rgba(251, 191, 146, 0.35)',
  },
  bien: {
    iconBg: 'rgba(250, 204, 21, 0.2)',
    iconColor: '#facc15',
    badgeBg: 'rgba(250, 204, 21, 0.28)',
  },
} as const

const PROFESSION_LIBERALE_PP: CategoryDef[] = [
  {
    id: 'identite',
    title: 'Identité & Légalité',
    ...CATEGORY_STYLES.identite,
    documents: [
      {
        id: 'cin_sejour_passeport',
        label:
          'CIN (Marocain) ou Carte de séjour ou Passeport (non-Marocain résident)',
        hint: FILE_HINT,
        required: true,
      },
      {
        id: 'attestation_ice',
        label: 'Attestation ICE',
        hint: FILE_HINT,
        required: true,
      },
    ],
  },
  {
    id: 'financier',
    title: 'Financier & Bancaire',
    ...CATEGORY_STYLES.financier,
    documents: [
      {
        id: 'rib_cheque',
        label: 'RIB ou Spécimen chèque',
        hint: FILE_HINT,
        required: true,
      },
      {
        id: 'bilan_ca',
        label:
          "Bilan des trois derniers exercices ou Attestation de chiffre d'affaires",
        hint: FILE_HINT,
        required: true,
      },
      {
        id: 'releves_6_mois',
        label: 'Relevés bancaires des 6 derniers mois',
        hint: FILE_HINT,
        required: true,
      },
      {
        id: 'attestation_lignes',
        label: 'Attestation des lignes',
        hint: FILE_HINT,
        required: true,
      },
    ],
  },
  {
    id: 'juridique',
    title: 'Juridique & Statut',
    ...CATEGORY_STYLES.juridique,
    documents: [
      {
        id: 'carte_pro',
        label:
          'Carte professionnelle / Carte Auto-entrepreneur / Attestation agricole / RC modèle 7',
        hint: FILE_HINT,
        required: true,
      },
    ],
  },
  {
    id: 'bien',
    title: 'Bien à financer',
    ...CATEGORY_STYLES.bien,
    documents: [
      {
        id: 'facture_proforma',
        label: 'Facture pro-forma',
        hint: FILE_HINT,
        required: true,
      },
    ],
  },
]

const TPE_PERSONNE_MORALE: CategoryDef[] = [
  {
    id: 'identite',
    title: 'Identité & Légalité',
    ...CATEGORY_STYLES.identite,
    documents: [
      {
        id: 'cin_associes_gerants',
        label: 'CIN ou Carte de séjour ou Passeport (associés et gérants)',
        hint: FILE_HINT,
        required: true,
      },
      {
        id: 'attestation_ice',
        label: 'Attestation ICE',
        hint: FILE_HINT,
        required: true,
      },
    ],
  },
  {
    id: 'financier',
    title: 'Financier & Bancaire',
    ...CATEGORY_STYLES.financier,
    documents: [
      {
        id: 'rib_cheque',
        label: 'RIB ou Spécimen chèque',
        hint: FILE_HINT,
        required: true,
      },
      {
        id: 'bilan_3_exercices',
        label: 'Bilan des trois derniers exercices',
        hint: FILE_HINT,
        required: true,
      },
      {
        id: 'releves_6_mois',
        label: 'Relevés bancaires des 6 derniers mois',
        hint: FILE_HINT,
        required: true,
      },
      {
        id: 'attestation_lignes',
        label: 'Attestation des lignes',
        hint: FILE_HINT,
        required: true,
      },
    ],
  },
  {
    id: 'juridique',
    title: 'Juridique & Statut',
    ...CATEGORY_STYLES.juridique,
    documents: [
      {
        id: 'rc_modele_7',
        label: 'Registre de commerce (modèle 7)',
        hint: FILE_HINT,
        required: true,
      },
      {
        id: 'statuts',
        label: 'Statuts',
        hint: FILE_HINT,
        required: true,
      },
      {
        id: 'pv_rc_modificatif',
        label: 'PV modificatif des derniers statuts + RC modificatif',
        hint: FILE_HINT,
        required: false,
      },
      {
        id: 'rapport_cac',
        label: 'Rapport des commissaires aux comptes',
        hint: FILE_HINT,
        required: false,
      },
    ],
  },
  {
    id: 'bien',
    title: 'Bien à financer',
    ...CATEGORY_STYLES.bien,
    documents: [
      {
        id: 'facture_proforma',
        label: 'Facture pro-forma',
        hint: FILE_HINT,
        required: true,
      },
    ],
  },
]

const PME_GRANDE_ENTREPRISE: CategoryDef[] = PROFESSION_LIBERALE_PP

const DOCUMENTS_BY_CLIENT_TYPE: Record<ClientType, CategoryDef[]> = {
  profession_liberale_pp: PROFESSION_LIBERALE_PP,
  tpe_pm: TPE_PERSONNE_MORALE,
  pme_ge: PME_GRANDE_ENTREPRISE,
}

function hydrateCategory(def: CategoryDef): DocumentCategory {
  return {
    ...def,
    documents: def.documents.map((doc) => ({ ...doc, file: null })),
  }
}

export function getDocumentsForClientType(
  clientType: ClientType
): DocumentCategory[] {
  return DOCUMENTS_BY_CLIENT_TYPE[clientType].map(hydrateCategory)
}

export function countUploaded(category: DocumentCategory): number {
  return category.documents.filter((d) => d.file !== null).length
}

export function countAllUploaded(categories: DocumentCategory[]): {
  uploaded: number
  total: number
} {
  return categories.reduce(
    (acc, cat) => ({
      uploaded: acc.uploaded + countUploaded(cat),
      total: acc.total + cat.documents.length,
    }),
    { uploaded: 0, total: 0 }
  )
}
