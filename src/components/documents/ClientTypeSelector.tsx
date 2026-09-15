import type { ClientType } from '../../types'
import { CLIENT_TYPE_OPTIONS } from '../../types'
import { BuildingIcon } from '../icons'

interface Props {
  value: ClientType | ''
  onChange: (value: ClientType) => void
  disabled?: boolean
}

const profileCopy = {
  profession_liberale_pp: ['Indépendant', 'Profession libérale & TPE'],
  tpe_pm: ['Petite entreprise', 'TPE personne morale'],
  pme_ge: ['Entreprise', 'PME & grande entreprise'],
} as const

export function ClientTypeSelector({ value, onChange, disabled }: Props) {
  return (
    <fieldset className="field-group">
      <legend className="section-label"><span>01</span> Quel est votre profil ?</legend>
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
              aria-label={opt.label}
              disabled={disabled}
            >
              <span className={`radio-dot ${selected ? 'is-on' : ''}`} />
              <span className="type-card__label">{profileCopy[opt.value][0]}<small>{profileCopy[opt.value][1]}</small></span>
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
