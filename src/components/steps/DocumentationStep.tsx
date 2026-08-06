import { useRef, useState } from 'react'
import type { ClientType, FormData } from '../../types'
import { getDocumentsForClientType } from '../../data/documents'
import { ClientTypeSelector } from '../documents/ClientTypeSelector'
import { DocumentAccordion } from '../documents/DocumentAccordion'
import {
  ICE_DOC_ID,
  isIceExtractionClient,
  type IceExtractionResult,
} from '../../services/ocr/iceTypes'
import {
  isRcDocument,
  type RcExtractionResult,
} from '../../services/ocr/rcTypes'
import { iceWorkspaceService } from '../../services/iceWorkspace'

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

function applyIceResult(
  result: IceExtractionResult,
  workspaceId: string
): Partial<FormData> {
  return {
    iceOcr: result,
    iceWorkspaceId: workspaceId,
    ...(result.ice ? { ice: result.ice } : {}),
    ...(result.numeroRc ? { registreCommerce: result.numeroRc } : {}),
    ...(result.villeRc ? { villeRc: result.villeRc } : {}),
  }
}

function applyRcResult(
  result: RcExtractionResult,
  workspaceId: string
): Partial<FormData> {
  return {
    rcOcr: result,
    iceWorkspaceId: workspaceId,
    ...(result.numeroRc ? { registreCommerce: result.numeroRc } : {}),
    ...(result.villeRc ? { villeRc: result.villeRc } : {}),
  }
}

async function clearWorkspace(workspaceId: string | null): Promise<void> {
  if (!workspaceId) return
  try {
    await iceWorkspaceService.delete(workspaceId)
  } catch {
  }
}

export function DocumentationStep({ data, onChange, onNext }: Props) {
  const [openId, setOpenId] = useState<string | null>('identite')
  const iceJobIdRef = useRef(0)
  const rcJobIdRef = useRef(0)
  const workspaceIdRef = useRef(data.iceWorkspaceId)

  workspaceIdRef.current = data.iceWorkspaceId

  const handleClientType = (clientType: ClientType) => {
    iceJobIdRef.current += 1
    rcJobIdRef.current += 1
    const previousWorkspaceId = workspaceIdRef.current
    workspaceIdRef.current = null

    void clearWorkspace(previousWorkspaceId)

    onChange({
      clientType,
      documents: getDocumentsForClientType(clientType),
      iceOcr: null,
      iceWorkspaceId: null,
      rcOcr: null,
    })
    setOpenId('identite')
  }

  const startIceExtractionAsync = (
    file: File,
    clientType: IceExtractionResult['clientType']
  ) => {
    const jobId = ++iceJobIdRef.current

    void (async () => {
      try {
        const { extractIceFromFile } = await import('../../services/ocr')
        const result = await extractIceFromFile(file, clientType)

        if (jobId !== iceJobIdRef.current) return

        await clearWorkspace(workspaceIdRef.current)

        const workspace = await iceWorkspaceService.createFromExtraction(
          file,
          result
        )

        if (jobId !== iceJobIdRef.current) {
          await clearWorkspace(workspace.meta.workspaceId)
          return
        }

        workspaceIdRef.current = workspace.meta.workspaceId

        const rcDoc = data.documents
          .flatMap((cat) => cat.documents)
          .find((doc) => isRcDocument(doc.id) && doc.file)

        if (rcDoc?.file && data.rcOcr) {
          await iceWorkspaceService.writeRcExtraction(
            workspace.meta.workspaceId,
            rcDoc.file,
            data.rcOcr
          )
        }

        onChange(applyIceResult(result, workspace.meta.workspaceId))
      } catch {
        if (jobId !== iceJobIdRef.current) return
      }
    })()
  }

  const startRcExtractionAsync = (file: File, documentId: string) => {
    const jobId = ++rcJobIdRef.current

    void (async () => {
      try {
        const { extractRcFromFile } = await import('../../services/ocr')
        const result = await extractRcFromFile(file, documentId)

        if (jobId !== rcJobIdRef.current) return

        const workspaceId = await iceWorkspaceService.writeRcExtraction(
          workspaceIdRef.current,
          file,
          result
        )

        if (jobId !== rcJobIdRef.current) return

        workspaceIdRef.current = workspaceId
        onChange(applyRcResult(result, workspaceId))
      } catch {
        if (jobId !== rcJobIdRef.current) return
      }
    })()
  }

  const handleFileChange = (
    categoryId: string,
    docId: string,
    file: File | null
  ) => {
    const shouldRunIceOcr =
      isIceExtractionClient(data.clientType) && docId === ICE_DOC_ID
    const shouldRunRcOcr = isRcDocument(docId)

    if (!file) {
      if (shouldRunIceOcr) {
        iceJobIdRef.current += 1
        const previousWorkspaceId = workspaceIdRef.current
        workspaceIdRef.current = null
        void clearWorkspace(previousWorkspaceId)
      }
      if (shouldRunRcOcr) {
        rcJobIdRef.current += 1
      }

      onChange({
        documents: setDocumentFile(data.documents, categoryId, docId, null),
        ...(shouldRunIceOcr
          ? { iceOcr: null, iceWorkspaceId: null }
          : {}),
        ...(shouldRunRcOcr ? { rcOcr: null } : {}),
      })
      return
    }

    onChange({
      documents: setDocumentFile(data.documents, categoryId, docId, file),
    })

    if (shouldRunIceOcr && isIceExtractionClient(data.clientType)) {
      startIceExtractionAsync(file, data.clientType)
    }

    if (shouldRunRcOcr) {
      startRcExtractionAsync(file, docId)
    }
  }

  const canProceed =
    data.clientType !== '' && data.acceptCgu && data.acceptData

  return (
    <div className="step-panel">
      <header className="step-header">
        <h1>Documents Requis</h1>
        <p>
          Choisissez votre profil puis joignez les documents nécessaires à
          l&apos;étude de votre dossier
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
        />
        <span>
          J&apos;autorise Wafabail à traiter mes données personnelles *
        </span>
      </label>

      <div className="nav-row nav-row--end">
        <button
          type="button"
          className="btn-primary"
          disabled={!canProceed}
          onClick={onNext}
        >
          Suivant
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
