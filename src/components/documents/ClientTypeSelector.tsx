import type { ClientType } from '../../types'
import { CLIENT_TYPE_OPTIONS } from '../../types'
import { BuildingIcon } from '../icons'

interface Props {
  value: ClientType | ''
  onChange: (value: ClientType) => void
}

export function ClientTypeSelector({ value, onChange }: Props) {
  return (
    <fieldset className="field-group">
      <legend className="field-label">Vous êtes</legend>
      <div className="type-cards">
        {CLIENT_TYPE_OPTIONS.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              className={`type-card ${selected ? 'is-selected' : ''}`}
              onClick={() => onChange(opt.value)}
              aria-pressed={selected}
            >
              <span className={`radio-dot ${selected ? 'is-on' : ''}`} />
              <span className="type-card__label">{opt.label}</span>
              <span className="type-card__icon">
                <BuildingIcon />
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
