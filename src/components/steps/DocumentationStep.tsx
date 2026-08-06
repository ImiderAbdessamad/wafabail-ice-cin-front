import { useState } from 'react'
import type { ClientType, FormData } from '../../types'
import { getDocumentsForClientType } from '../../data/documents'
import { ClientTypeSelector } from '../documents/ClientTypeSelector'
import { DocumentAccordion } from '../documents/DocumentAccordion'
import {
  CIN_DOC_IDS,
  ICE_DOC_ID_API,
  extractCin,
  extractIce,
  OcrApiError,
} from '../../services/api/ocrApi'

interface Props {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
  onNext: () => void
}

function setDocumentFile(
  documents: FormData['documents'],
  categoryId: string,
  docId: string,
  file: File | null
): FormData['documents'] {
  return documents.map((cat) =>
    cat.id !== categoryId
      ? cat
      : {
          ...cat,
          documents: cat.documents.map((doc) =>
            doc.id === docId ? { ...doc, file } : doc
          ),
        }
  )
}

function findDocFile(
  documents: FormData['documents'],
  docIds: readonly string[]
): File | null {
  for (const cat of documents) {
    for (const doc of cat.documents) {
      if (docIds.includes(doc.id) && doc.file) return doc.file
    }
  }
  return null
}

function nonEmpty(value: string | null | undefined): string | undefined {
  const v = (value ?? '').trim()
  return v ? v : undefined
}

export function DocumentationStep({ data, onChange, onNext }: Props) {
  const [openId, setOpenId] = useState<string | null>('identite')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)

  const handleClientType = (clientType: ClientType) => {
    setExtractError(null)
    onChange({
      clientType,
      documents: getDocumentsForClientType(clientType),
      iceOcr: null,
      iceWorkspaceId: null,
      rcOcr: null,
    })
    setOpenId('identite')
  }

  const handleFileChange = (
    categoryId: string,
    docId: string,
    file: File | null
  ) => {
    setExtractError(null)
    onChange({
      documents: setDocumentFile(data.documents, categoryId, docId, file),
    })
  }

  const handleNext = async () => {
    if (extracting) return
    setExtractError(null)

    const cinFile = findDocFile(data.documents, CIN_DOC_IDS)
    const iceFile = findDocFile(data.documents, [ICE_DOC_ID_API])

    // Pas de document identité/ICE → navigation classique
    if (!cinFile && !iceFile) {
      onNext()
      return
    }

    setExtracting(true)
    try {
      const patch: Partial<FormData> = {}
      const errors: string[] = []

      const tasks: Promise<void>[] = []

      if (cinFile) {
        tasks.push(
          (async () => {
            try {
              const res = await extractCin(cinFile)
              const d = res.data
              if (nonEmpty(d.nom)) patch.nom = d.nom.trim()
              if (nonEmpty(d.prenom)) patch.prenom = d.prenom.trim()
              if (nonEmpty(d.cin)) patch.cin = d.cin.trim()
            } catch (err) {
              const msg =
                err instanceof OcrApiError
                  ? err.message
                  : 'Échec de l’extraction CIN (vérifiez que le backend tourne).'
              errors.push(`CIN : ${msg}`)
            }
          })()
        )
      }

      if (iceFile) {
        tasks.push(
          (async () => {
            try {
              const res = await extractIce(iceFile)
              const d = res.data
              if (nonEmpty(d.RC_Numero)) patch.registreCommerce = d.RC_Numero.trim()
              if (nonEmpty(d.RC_Ville)) patch.villeRc = d.RC_Ville.trim()
              if (nonEmpty(d.ICE)) patch.ice = d.ICE.trim()
              if (nonEmpty(d.Denomination)) {
                patch.raisonSociale = d.Denomination.trim()
              }
            } catch (err) {
              const msg =
                err instanceof OcrApiError
                  ? err.message
                  : 'Échec de l’extraction ICE (vérifiez que le backend tourne).'
              errors.push(`ICE : ${msg}`)
            }
          })()
        )
      }

      await Promise.all(tasks)

      if (Object.keys(patch).length > 0) {
        onChange(patch)
      }

      if (errors.length > 0) {
        setExtractError(errors.join(' '))
        return
      }

      onNext()
    } finally {
      setExtracting(false)
    }
  }

  const canProceed =
    data.clientType !== '' && data.acceptCgu && data.acceptData && !extracting

  return (
    <div className="step-panel">
      <header className="step-header">
        <h1>Documents Requis</h1>
        <p>
          Choisissez votre profil puis joignez les documents nécessaires à
          l&apos;étude de votre dossier. Au clic sur Suivant, la CIN et
          l&apos;ICE sont analysées automatiquement pour préremplir
          l&apos;identification.
        </p>
      </header>

      <ClientTypeSelector
        value={data.clientType}
        onChange={handleClientType}
      />

      {data.clientType ? (
        <div className="doc-list">
          {data.documents.map((cat) => (
            <DocumentAccordion
              key={cat.id}
              category={cat}
              open={openId === cat.id}
              onToggle={() =>
                setOpenId((prev) => (prev === cat.id ? null : cat.id))
              }
              onFileChange={(docId, file) =>
                handleFileChange(cat.id, docId, file)
              }
            />
          ))}
        </div>
      ) : (
        <p className="doc-list-empty">
          Sélectionnez votre profil pour afficher les documents à joindre.
        </p>
      )}

      <div className="notice-box">
        Cette liste de documents n&apos;est pas exhaustive. Des compléments de
        documents pourraient vous être demandés.
      </div>

      <p className="legal-note">
        En cochant les cases ci-dessous, vous confirmez avoir pris connaissance
        des informations relatives au traitement de vos données.
      </p>

      <label className="check-row">
        <input
          type="checkbox"
          checked={data.acceptCgu}
          onChange={(e) => onChange({ acceptCgu: e.target.checked })}
          disabled={extracting}
        />
        <span>
          J&apos;accepte les{' '}
          <a href="https://www.wafabail.ma" target="_blank" rel="noreferrer">
            conditions générales
          </a>{' '}
          d&apos;utilisation *
        </span>
      </label>

      <label className="check-row">
        <input
          type="checkbox"
          checked={data.acceptData}
          onChange={(e) => onChange({ acceptData: e.target.checked })}
          disabled={extracting}
        />
        <span>
          J&apos;autorise Wafabail à traiter mes données personnelles *
        </span>
      </label>

      {extractError ? (
        <p className="extract-error" role="alert">
          {extractError}
        </p>
      ) : null}

      {extracting ? (
        <p className="extract-status" aria-live="polite">
          Analyse CIN / ICE en cours via le serveur… cela peut prendre quelques
          secondes.
        </p>
      ) : null}

      <div className="nav-row nav-row--end">
        <button
          type="button"
          className="btn-primary"
          disabled={!canProceed}
          onClick={() => void handleNext()}
        >
          {extracting ? 'Extraction…' : 'Suivant'}
          {!extracting ? <span aria-hidden="true">→</span> : null}
        </button>
      </div>
    </div>
  )
}
