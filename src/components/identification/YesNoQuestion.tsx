interface Props {
  name: string
  label: string
  value: 'oui' | 'non' | ''
  onChange: (value: 'oui' | 'non') => void
}

export function YesNoQuestion({ name, label, value, onChange }: Props) {
  return (
    <fieldset className="yesno">
      <legend>{label}</legend>
      <div className="yesno__options">
        {(['oui', 'non'] as const).map((option) => (
          <label key={option} className="yesno__option">
            <input
              type="radio"
              name={name}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span className={`radio-dot ${value === option ? 'is-on' : ''}`} />
            {option === 'oui' ? 'Oui' : 'Non'}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
