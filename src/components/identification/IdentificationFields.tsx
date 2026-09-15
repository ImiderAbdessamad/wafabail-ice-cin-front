import type { FormData } from '../../types'
import type { IdentificationFieldConfig } from '../../data/identification'
import {
  digitsOnly,
  getEmailError,
  getPhoneError,
  sanitizePhoneInput,
  withoutDigits,
} from '../../utils/validation'

type FieldValueKey = IdentificationFieldConfig['id']

interface Props {
  fields: IdentificationFieldConfig[]
  data: FormData
  errors: Partial<Record<FieldValueKey, string>>
  touched: Partial<Record<FieldValueKey, boolean>>
  onChange: (patch: Partial<FormData>) => void
  onBlur: (fieldId: FieldValueKey) => void
}

function sanitizeValue(
  field: IdentificationFieldConfig,
  raw: string
): string {
  if (field.validation === 'digits') return digitsOnly(raw)
  if (field.validation === 'no_digits') return withoutDigits(raw)
  if (field.validation === 'phone') return sanitizePhoneInput(raw)
  return raw
}

export function getFieldError(
  field: IdentificationFieldConfig,
  value: string
): string | null {
  const trimmed = value.trim()

  if (field.required && !trimmed) {
    return `${field.label} est obligatoire`
  }

  if (!trimmed) return null

  if (field.validation === 'email') return getEmailError(value)
  if (field.validation === 'phone') return getPhoneError(value)

  return null
}

export function IdentificationFields({
  fields,
  data,
  errors,
  touched,
  onChange,
  onBlur,
}: Props) {
  return (
    <div className="form-grid">
      {fields.map((field) => {
        const error = touched[field.id] ? errors[field.id] : undefined
        const invalid = Boolean(error)

        return (
          <div
            key={field.id}
            className={`field ${field.width === 'full' ? 'field--full' : ''}`}
          >
            <label className="field-label" htmlFor={field.id}>
              {field.label}
              {field.required ? <span className="req"> *</span> : null}
            </label>
            <input
              id={field.id}
              className={`input ${invalid ? 'is-invalid' : ''}`}
              type={field.type ?? 'text'}
              inputMode={field.inputMode}
              required={field.required}
              autoComplete={field.id === 'nom' ? 'family-name' : field.id === 'prenom' ? 'given-name' : field.id === 'email' ? 'email' : field.id === 'gsm' ? 'tel' : field.id === 'raisonSociale' ? 'organization' : 'off'}
              value={data[field.id as FieldValueKey]}
              aria-invalid={invalid}
              aria-describedby={invalid ? `${field.id}-error` : undefined}
              onChange={(e) => {
                const value = sanitizeValue(field, e.target.value)
                onChange({ [field.id]: value } as Partial<FormData>)
              }}
              onBlur={() => onBlur(field.id)}
            />
            {error ? (
              <span id={`${field.id}-error`} className="field-error">
                {error}
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
