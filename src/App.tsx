import { useState } from 'react'
import { Stepper } from './components/Stepper'
import { DocumentationStep } from './components/steps/DocumentationStep'
import { SimulationStep } from './components/steps/SimulationStep'
import { IdentificationStep } from './components/steps/IdentificationStep'
import { ConfirmationStep } from './components/steps/ConfirmationStep'
import {
  createInitialFormData,
  type FormData,
  type StepId,
} from './types'
import { iceWorkspaceService } from './services/iceWorkspace'
import './App.css'

const STEP_ORDER: StepId[] = [
  'documentation',
  'simulation',
  'identification',
  'confirmation',
]

function App() {
  const [step, setStep] = useState<StepId>('documentation')
  const [data, setData] = useState<FormData>(() => createInitialFormData())
  const [submitted, setSubmitted] = useState(false)

  const patch = (partial: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }

  const go = (target: StepId) => {
    setStep(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => {
    const i = STEP_ORDER.indexOf(step)
    if (i < STEP_ORDER.length - 1) go(STEP_ORDER[i + 1])
  }

  const back = () => {
    const i = STEP_ORDER.indexOf(step)
    if (i > 0) go(STEP_ORDER[i - 1])
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="form-shell success-shell">
          <div className="success">
            <div className="success__icon" aria-hidden="true">
              ✓
            </div>
            <h1>Demande envoyée</h1>
            <p>
              Merci {data.prenom}. Votre demande de financement a bien été
              enregistrée. Un conseiller Wafabail vous contactera sous peu.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setData(createInitialFormData())
                setStep('documentation')
                setSubmitted(false)
              }}
            >
              Nouvelle demande
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="form-shell">
        <Stepper currentStep={step} />

        {step === 'documentation' && (
          <DocumentationStep data={data} onChange={patch} onNext={next} />
        )}
        {step === 'simulation' && (
          <SimulationStep
            data={data}
            onChange={patch}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 'identification' && (
          <IdentificationStep
            data={data}
            onChange={patch}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 'confirmation' && (
          <ConfirmationStep
            data={data}
            onBack={back}
            onSubmit={() => {
              void (async () => {
                const workspaceId = data.iceWorkspaceId
                try {
                  await iceWorkspaceService.delete(workspaceId)
                } catch {
                } finally {
                  setData((prev) => ({ ...prev, iceWorkspaceId: null }))
                  setSubmitted(true)
                }
              })()
            }}
          />
        )}
      </div>
    </div>
  )
}

export default App
