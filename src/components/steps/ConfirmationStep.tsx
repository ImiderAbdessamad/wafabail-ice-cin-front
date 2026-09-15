import type { FormData } from '../../types'
import { buildConfirmationSummary } from '../../data/confirmation'
import { SummaryColumn } from '../confirmation/SummaryColumn'

interface Props {
  data: FormData
  onBack: () => void
  onSubmit: () => void
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5l5 5L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ConfirmationStep({ data, onBack, onSubmit }: Props) {
  const { personalRows, projectRows } = buildConfirmationSummary(data)

  return (
    <div className="step-panel">
      <header className="step-header">
        <h2>Un dernier coup d’œil</h2>
        <p>Vérifiez les informations avant de soumettre</p>
      </header>

      <div className="recap">
        <div className="recap__icon">
          <CheckIcon />
        </div>

        <div className="recap__heading">
          <h2>Récapitulatif de votre demande</h2>
          <p>Vérifiez les informations avant de soumettre</p>
        </div>

        <div className="recap__grid">
          <SummaryColumn
            title="Informations personnelles"
            rows={personalRows}
          />
          <SummaryColumn title="Projet de financement" rows={projectRows} />
        </div>

        <div className="recap__notice">
          Parcours de démonstration : terminer affiche une confirmation locale.
          Aucun dossier ni e-mail ne sera envoyé.
        </div>
      </div>

      <div className="nav-row">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <span aria-hidden="true">←</span>
          Précédent
        </button>
        <button type="button" className="btn-primary" onClick={onSubmit}>
          Terminer la démonstration
          <span aria-hidden="true">✓</span>
        </button>
      </div>
    </div>
  )
}
