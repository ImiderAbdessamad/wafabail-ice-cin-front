import { useState } from 'react'
import type { ClientType, FormData } from '../../types'
import { countAllUploaded, getDocumentsForClientType } from '../../data/documents'
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
  const { uploaded, total } = countAllUploaded(data.documents)

  const handleClientType = (clientType: ClientType) => {
    if (extracting || clientType === data.clientType) return
    if (uploaded > 0 && !window.confirm('Changer de profil retirera les pièces déjà jointes. Continuer ?')) return
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
    <div className="step-panel" aria-busy={extracting}>
      <header className="step-header">
        <h2>Commençons par vos documents</h2>
        <p>
          Choisissez votre profil et joignez les pièces de votre dossier.
          Nous lirons votre CIN et votre ICE pour vous éviter de tout ressaisir.
        </p>
      </header>

      <ClientTypeSelector
        value={data.clientType}
        onChange={handleClientType}
        disabled={extracting}
      />

      {data.clientType ? (
        <div className="document-section">
          <div className="document-section__heading"><h3 className="section-label"><span>02</span> Les pièces à préparer</h3><span className="document-total" aria-live="polite">{uploaded} / {total} jointes</span></div>
          <div className="document-progress" role="progressbar" aria-label="Pièces jointes" aria-valuenow={uploaded} aria-valuemin={0} aria-valuemax={total}><span style={{ width: `${total ? uploaded / total * 100 : 0}%` }} /></div>
          <p className="document-instructions">Glissez un fichier sur sa ligne ou cliquez sur « Joindre ». <span>* Pièce requise pour l’étude du dossier.</span></p>
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
              disabled={extracting}
            />
          ))}
        </div>
        </div>
      ) : (
        <p className="doc-list-empty">
          <span className="empty-document-icon" aria-hidden="true">↥</span>
          <strong>Un dossier adapté à votre profil</strong>
          Sélectionnez votre profil ci-dessus pour découvrir les pièces à préparer.
        </p>
      )}

      <div className="notice-box">
        <span aria-hidden="true">ⓘ </span> Une pièce vous manque ? Vous pouvez préparer la suite,
        mais les documents requis devront être complétés avant l’étude du dossier.
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
        <p className="navigation-hint">{!data.clientType ? 'Choisissez votre profil pour continuer.' : !data.acceptCgu || !data.acceptData ? 'Acceptez les deux autorisations pour continuer.' : `${uploaded} pièce${uploaded > 1 ? 's' : ''} jointe${uploaded > 1 ? 's' : ''} · Prochaine étape : votre projet`}</p>
        <button
          type="button"
          className="btn-primary"
          disabled={!canProceed}
          onClick={() => void handleNext()}
        >
          {extracting ? 'Analyse en cours…' : extractError ? 'Réessayer l’analyse' : 'Continuer'}
          {!extracting ? <span aria-hidden="true">→</span> : null}
        </button>
      </div>
    </div>
  )
}
