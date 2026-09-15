import type { DocumentCategory } from '../../types'
import { countUploaded } from '../../data/documents'
import { ChevronIcon, DocumentFileIcon } from '../icons'
import { DocumentUploadRow } from './DocumentUploadRow'

interface Props {
  category: DocumentCategory
  open: boolean
  onToggle: () => void
  onFileChange: (docId: string, file: File | null) => void
  disabled?: boolean
}

export function DocumentAccordion({
  category,
  open,
  onToggle,
  onFileChange,
  disabled,
}: Props) {
  const done = countUploaded(category)
  const total = category.documents.length

  return (
    <div className={`doc-cat ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="doc-cat__header"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`category-${category.id}`}
      >
        <span
          className="doc-cat__badge"
          style={{
            background: category.iconBg,
            color: category.iconColor,
          }}
        >
          <DocumentFileIcon />
        </span>

        <div className="doc-cat__meta">
          <strong>{category.title}</strong>
          <span>
            {done === total ? 'Toutes les pièces sont jointes' : `${total - done} pièce${total - done > 1 ? 's' : ''} à joindre`}
          </span>
        </div>

        <span
          className="doc-cat__count"
          style={{ background: category.badgeBg }}
        >
          {done}/{total}
        </span>

        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div className="doc-cat__body" id={`category-${category.id}`}>
          {category.documents.map((doc) => (
            <DocumentUploadRow
              key={doc.id}
              document={doc}
              onFileChange={(file) => onFileChange(doc.id, file)}
              disabled={disabled}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
