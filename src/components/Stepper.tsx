import type { ReactNode } from 'react'
import type { StepId } from '../types'
import { STEPS } from '../types'

interface StepperProps {
  currentStep: StepId
}

function StepIcon({ stepId, active }: { stepId: StepId; active: boolean }) {
  const stroke = active ? '#c45612' : '#736b65'
  const fill = 'transparent'

  const icons: Record<StepId, ReactNode> = {
    documentation: (
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15h6"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    simulation: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" stroke={stroke} strokeWidth="1.8" fill="none" />
        <path d="M8 7h8M8 11h8M8 15h4" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    identification: (
      <>
        <circle cx="12" cy="8" r="3.5" stroke={stroke} strokeWidth="1.8" fill="none" />
        <path
          d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
    confirmation: (
      <path
        d="M5 12.5l5 5L19 7"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={{ background: fill, borderRadius: '50%' }}>
      {icons[stepId]}
    </svg>
  )
}

export function Stepper({ currentStep }: StepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
  const progress = ((currentIndex + 1) / STEPS.length) * 100

  return (
    <nav className="stepper" aria-label="Étapes de la demande">
      <div className="stepper__progress-track">
        <div className="stepper__progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="stepper__steps">
        {STEPS.map((step, index) => {
          const active = step.id === currentStep
          const done = index < currentIndex
          return (
            <div
              key={step.id}
              className={`stepper__step ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}
              aria-current={active ? 'step' : undefined}
            >
              <div className="stepper__icon">
                {done ? <span aria-hidden="true">✓</span> : <StepIcon stepId={step.id} active={active} />}
              </div>
              <span className="stepper__copy"><span className="stepper__label">{step.label}</span><span className="stepper__description">{['Les pièces de votre dossier', 'Votre projet et votre budget', 'Vos coordonnées', 'La vérification finale'][index]}</span></span>
              {active && <span className="stepper__active-dot" aria-hidden="true" />}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
