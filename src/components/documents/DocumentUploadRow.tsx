import { useRef, useState } from 'react'
import type { DocumentItem } from '../../types'
import { DocumentFileIcon } from '../icons'

interface Props {
  document: DocumentItem
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

export function DocumentUploadRow({ document, onFileChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const automatic = ['cin_sejour_passeport', 'cin_associes_gerants', 'attestation_ice'].includes(document.id)
  const selectFile = (file?: File) => {
    if (!file || disabled) return
    if (!/\.(pdf|jpe?g|png)$/i.test(file.name) || (file.type && !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type))) {
      setError('Choisissez un fichier PDF, JPG ou PNG.')
      return
    }
    if (!file.size || file.size > 50 * 1024 * 1024) {
      setError(!file.size ? 'Ce fichier est vide.' : 'Ce fichier dépasse 50 Mo. Choisissez une version plus légère.')
      return
    }
    setError(null)
    onFileChange(file)
  }

  return (
    <div className={`upload-row ${dragging ? 'is-dragging' : ''} ${document.file ? 'has-file' : ''}`} onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true) }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false) }} onDrop={(event) => {
      event.preventDefault()
      setDragging(false)
      if (disabled) return
      if (event.dataTransfer.files.length > 1) { setError('Joignez un seul fichier pour cette pièce.'); return }
      selectFile(event.dataTransfer.files[0])
    }}>
      <span className="upload-row__symbol" aria-hidden="true">{document.file ? '✓' : <DocumentFileIcon />}</span>
      <div className="upload-row__info">
        <span className="upload-row__name">
          {document.label}
          {document.required ? <span className="req"> *</span> : null}
        </span>
        <span className="upload-row__hint">{automatic ? 'Préremplissage automatique · ' : ''}PDF, JPG ou PNG · 50 Mo max.</span>
        {document.file && <span className="upload-row__filename" title={document.file.name}>{document.file.name} <span>· {(document.file.size / 1024 / 1024).toFixed(1)} Mo</span></span>}
        {error && <span className="field-error" id={`upload-error-${document.id}`} role="alert">{error}</span>}
      </div>

      <div className="upload-row__actions">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          hidden
          disabled={disabled}
          aria-label={`Joindre ${document.label}`}
          onChange={(e) => {
            selectFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        {document.file ? (
          <div className="upload-file">
            <button
              type="button"
              className="upload-file__badge"
              title={document.file.name}
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              aria-label={`Remplacer ${document.file.name}`}
            >
              <span className="upload-file__check" aria-hidden="true">
                ✓
              </span>
              <span className="upload-file__name">Remplacer</span>
            </button>
            <button
              type="button"
              className="upload-file__remove"
              aria-label={`Retirer ${document.file.name}`}
              disabled={disabled}
              onClick={() => { setError(null); onFileChange(null) }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path
                  d="M2 2l8 8M10 2L2 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-joindre"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            aria-label={`Joindre ${document.label}`}
            aria-describedby={error ? `upload-error-${document.id}` : undefined}
          >
            <span aria-hidden="true">↥</span> Joindre
          </button>
        )}
      </div>
    </div>
  )
}
