import { useRef } from 'react'
import type { DocumentItem } from '../../types'

interface Props {
  document: DocumentItem
  onFileChange: (file: File | null) => void
}

export function DocumentUploadRow({ document, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="upload-row">
      <div className="upload-row__info">
        <span className="upload-row__name">
          {document.label}
          {document.required ? <span className="req"> *</span> : null}
        </span>
        <span className="upload-row__hint">{document.hint}</span>
      </div>

      <div className="upload-row__actions">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          hidden
          onChange={(e) => {
            onFileChange(e.target.files?.[0] ?? null)
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
            >
              <span className="upload-file__check" aria-hidden="true">
                ✓
              </span>
              <span className="upload-file__name">{document.file.name}</span>
            </button>
            <button
              type="button"
              className="upload-file__remove"
              aria-label={`Retirer ${document.file.name}`}
              onClick={() => onFileChange(null)}
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
          >
            + Joindre
          </button>
        )}
      </div>
    </div>
  )
}
