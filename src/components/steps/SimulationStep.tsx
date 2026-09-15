import type { FormData } from '../../types'
import type { ObjetFinancement } from '../../data/simulation'
import {
  APPORT_PCT_MAX,
  APPORT_PCT_MIN,
  MESSAGE_MAX_LENGTH,
  MONTANT_MIN,
  OBJET_FINANCEMENT_OPTIONS,
  calcMontantApport,
  clampApportPct,
  formatAmount,
  formatDh,
  getDefaultDuree,
  getDureeOptions,
  parseAmount,
} from '../../data/simulation'

interface Props {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

export function SimulationStep({ data, onChange, onNext, onBack }: Props) {
  const isImmobilier = data.objetFinancement === 'immobilier'
  const minMontant = MONTANT_MIN[data.objetFinancement]
  const montantNum = parseAmount(data.montant)
  const apportPctNum = Number(data.apportPct) || 0
  const montantApport = calcMontantApport(data.montant, data.apportPct)
  const dureeOptions = getDureeOptions(data.objetFinancement)

  const montantError =
    data.montant !== '' && montantNum < minMontant
      ? `Le montant minimum est de ${formatDh(minMontant)}`
      : null

  const apportError =
    data.apportPct !== '' &&
    (apportPctNum < APPORT_PCT_MIN || apportPctNum > APPORT_PCT_MAX)
      ? `L'apport doit être entre ${APPORT_PCT_MIN} et ${APPORT_PCT_MAX} %`
      : null

  const canProceed =
    montantNum >= minMontant &&
    data.duree !== '' &&
    apportPctNum >= APPORT_PCT_MIN &&
    apportPctNum <= APPORT_PCT_MAX &&
    data.objetDuFinancement.trim() !== ''

  const setObjet = (objetFinancement: ObjetFinancement) => {
    onChange({
      objetFinancement,
      duree: getDefaultDuree(objetFinancement),
    })
  }

  return (
    <div className="step-panel">
      <header className="step-header">
        <h2>Parlons de votre projet</h2>
        <p>Précisez le montant, la durée et le bien que vous souhaitez financer.</p>
      </header>

      <fieldset className="field-group">
        <legend className="field-label">Objet de financement</legend>
        <div className="objet-cards">
          {OBJET_FINANCEMENT_OPTIONS.map((opt) => {
            const selected = data.objetFinancement === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                className={`objet-card ${selected ? 'is-selected' : ''}`}
                onClick={() => setObjet(opt.value)}
                aria-pressed={selected}
              >
                <span className={`radio-dot ${selected ? 'is-on' : ''}`} />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="form-grid">
        <div className="field">
          <label className="field-label" htmlFor="montant">
            Montant du financement souhaité (HT) <span className="req">*</span>
          </label>
          <input
            id="montant"
            className={`input ${montantError ? 'is-invalid' : ''}`}
            inputMode="numeric"
            placeholder={`Minimum ${formatDh(minMontant)}`}
            value={data.montant}
            onChange={(e) => onChange({ montant: formatAmount(e.target.value) })}
          />
          {montantError ? (
            <span className="field-error">{montantError}</span>
          ) : null}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="duree">
            Durée souhaitée <span className="req">*</span>
          </label>
          <select
            id="duree"
            className="input"
            value={data.duree}
            disabled={isImmobilier}
            onChange={(e) => onChange({ duree: e.target.value })}
          >
            {!isImmobilier && data.duree === '' ? (
              <option value="">Choisir...</option>
            ) : null}
            {dureeOptions.map((d) => (
              <option key={d} value={d}>
                {d} mois
              </option>
            ))}
          </select>
          {isImmobilier ? (
            <span className="field-hint">
              Durée fixe de 120 mois pour l&apos;immobilier
            </span>
          ) : null}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="apportPct">
            Apport initial optionnel (en HT en %)
          </label>
          <input
            id="apportPct"
            className={`input ${apportError ? 'is-invalid' : ''}`}
            inputMode="decimal"
            min={APPORT_PCT_MIN}
            max={APPORT_PCT_MAX}
            value={data.apportPct}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d.,]/g, '')
              onChange({ apportPct: raw })
            }}
            onBlur={() =>
              onChange({ apportPct: clampApportPct(data.apportPct || '0') })
            }
          />
          {apportError ? (
            <span className="field-error">{apportError}</span>
          ) : (
            <span className="field-hint">Entre 0 et 30 %</span>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="activite">
            Activité
          </label>
          <input
            id="activite"
            className="input"
            value={data.activite}
            onChange={(e) => onChange({ activite: e.target.value })}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="montantApport">
            Montant d&apos;apport (HT)
          </label>
          <input
            id="montantApport"
            className="input"
            value={
              apportPctNum > 0 && montantNum > 0
                ? formatAmount(String(montantApport))
                : ''
            }
            placeholder="-"
            readOnly
            tabIndex={-1}
          />
        </div>
      </div>

      <div className="form-stack">
        <div className="field field--full">
          <label className="field-label" htmlFor="objetDuFinancement">
            Objet du financement <span className="req">*</span>
          </label>
          <input
            id="objetDuFinancement"
            className="input"
            value={data.objetDuFinancement}
            onChange={(e) => onChange({ objetDuFinancement: e.target.value })}
          />
        </div>

        <div className="field field--full">
          <label className="field-label" htmlFor="message">
            Message complémentaire
          </label>
          <div className="textarea-wrap">
            <textarea
              id="message"
              className="input textarea"
              rows={5}
              maxLength={MESSAGE_MAX_LENGTH}
              value={data.messageComplementaire}
              onChange={(e) =>
                onChange({ messageComplementaire: e.target.value })
              }
            />
            <span className="textarea-count">
              {data.messageComplementaire.length}/{MESSAGE_MAX_LENGTH}
            </span>
          </div>
        </div>
      </div>

      {montantNum > 0 && <div className="sim-result" aria-live="polite"><div><span className="sim-result__label">Montant souhaité (HT)</span><strong>{formatDh(montantNum)}</strong></div><div><span className="sim-result__label">Votre apport initial</span><strong className="sim-result__accent">{formatDh(montantApport)}</strong></div></div>}

      <div className="nav-row">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <span aria-hidden="true">←</span>
          Précédent
        </button>
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
