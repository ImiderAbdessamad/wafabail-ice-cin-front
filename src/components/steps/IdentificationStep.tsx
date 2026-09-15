import { useMemo, useState } from 'react'
import type { FormData } from '../../types'
import {
  getIdentificationFields,
  type IdentificationFieldId,
} from '../../data/identification'
import {
  IdentificationFields,
  getFieldError,
} from '../identification/IdentificationFields'
import { YesNoQuestion } from '../identification/YesNoQuestion'

interface Props {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

export function IdentificationStep({ data, onChange, onNext, onBack }: Props) {
  const fields = getIdentificationFields(data.clientType)
  const [touched, setTouched] = useState<
    Partial<Record<IdentificationFieldId, boolean>>
  >({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const errors = useMemo(() => {
    const next: Partial<Record<IdentificationFieldId, string>> = {}
    for (const field of fields) {
      const message = getFieldError(field, data[field.id])
      if (message) next[field.id] = message
    }
    return next
  }, [fields, data])

  const visibleTouched = useMemo(() => {
    if (!submitAttempted) return touched
    const all: Partial<Record<IdentificationFieldId, boolean>> = { ...touched }
    for (const field of fields) all[field.id] = true
    return all
  }, [submitAttempted, touched, fields])

  const canProceed =
    fields.length > 0 &&
    Object.keys(errors).length === 0 &&
    data.clientAttijari !== '' &&
    data.clientWafabail !== ''

  const handleNext = () => {
    setSubmitAttempted(true)
    if (!canProceed) {
      requestAnimationFrame(() => document.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus())
      return
    }
    onNext()
  }

  return (
    <div className="step-panel">
      <header className="step-header">
        <h2>Faisons connaissance</h2>
        <p>
          Vérifiez les informations préremplies et complétez vos coordonnées.
        </p>
      </header>

      <IdentificationFields
        fields={fields}
        data={data}
        errors={errors}
        touched={visibleTouched}
        onChange={onChange}
        onBlur={(fieldId) =>
          setTouched((prev) => ({ ...prev, [fieldId]: true }))
        }
      />

      <div className="yesno-grid">
        <YesNoQuestion
          name="clientAttijari"
          label="Êtes-vous client Attijariwafa bank ?"
          value={data.clientAttijari}
          onChange={(clientAttijari) => onChange({ clientAttijari })}
        />
        <YesNoQuestion
          name="clientWafabail"
          label="Êtes-vous client Wafabail ?"
          value={data.clientWafabail}
          onChange={(clientWafabail) => onChange({ clientWafabail })}
        />
      </div>

      <div className="nav-row">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <span aria-hidden="true">←</span>
          Précédent
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleNext}
        >
          Suivant
          <span aria-hidden="true">→</span>
        </button>
      </div>
      {submitAttempted && !canProceed && <p className="field-error" role="alert">Vérifiez les champs signalés pour continuer.</p>}

      <p className="required-legend">* Champs obligatoires</p>
    </div>
  )
}
