import { useEffect, useRef, useState } from 'react'
import { Stepper } from '../components/Stepper'
import { DocumentationStep } from '../components/steps/DocumentationStep'
import { SimulationStep } from '../components/steps/SimulationStep'
import { IdentificationStep } from '../components/steps/IdentificationStep'
import { ConfirmationStep } from '../components/steps/ConfirmationStep'
import {
  createInitialFormData,
  type FormData,
  type StepId,
} from '../types'
import { iceWorkspaceService } from '../services/iceWorkspace'
import '../App.css'
import '../interface.css'
import { countAllUploaded } from '../data/documents'
import { DocumentFileIcon } from '../components/icons'

const STEP_ORDER: StepId[] = [
  'documentation',
  'simulation',
  'identification',
  'confirmation',
]

export default function ClientApp() {
  const [step, setStep] = useState<StepId>('documentation')
  const [data, setData] = useState<FormData>(() => createInitialFormData())
  const [submitted, setSubmitted] = useState(false)
  const contentRef = useRef<HTMLElement>(null)
  const previousStep = useRef(step)
  const currentIndex = STEP_ORDER.indexOf(step)
  const { uploaded, total } = countAllUploaded(data.documents)

  useEffect(() => {
    if (step !== previousStep.current) contentRef.current?.focus()
    previousStep.current = step
  }, [step])

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
            <h1>Votre dossier est prêt</h1>
            <p>
              Merci {data.prenom}. Vous avez terminé ce parcours de démonstration.
              Aucune demande n’a été envoyée ou enregistrée sur un serveur.
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
      <a className="skip-link" href="#form-content">Aller au formulaire</a>
      <header className="site-header">
        <div className="site-header__inner">
          <a className="brand" href="https://www.wafabail.ma" target="_blank" rel="noreferrer" aria-label="Wafabail — site officiel (nouvel onglet)">
            <span className="brand__mark" aria-hidden="true">w<span>.</span></span>
            <span className="brand__name">wafabail<small>LE FINANCEMENT QUI VOUS FAIT AVANCER</small></span>
          </a>
          <a className="header-help" href="https://www.wafabail.ma" target="_blank" rel="noreferrer"><span aria-hidden="true">?</span> Besoin d’aide ? <span aria-hidden="true">↗</span></a>
        </div>
      </header>
      <div className="workspace">
        <div className="page-intro">
          <p className="breadcrumb">Espace financement <span>/</span> Nouvelle demande</p>
          <h1>Votre projet commence ici<span>.</span></h1>
          <p>Préparez votre dossier de financement, simplement et à votre rythme.</p>
        </div>
        <div className="workspace-grid">
          <aside className="journey-sidebar">
            <p className="eyebrow">VOTRE PARCOURS</p>
            <Stepper currentStep={step} />
            <div className="sidebar-tip">
              <span className="sidebar-tip__icon" aria-hidden="true">✦</span>
              <h2>Moins de saisie.<br />Plus de simplicité.</h2>
              <p>Joignez votre CIN et votre attestation ICE : vos informations seront préremplies, puis vérifiées par vous.</p>
              <span className="sidebar-tip__tag">Lecture automatique CIN & ICE</span>
            </div>
            <p className="session-note">ⓘ Votre progression reste dans cette session. Un rechargement efface le dossier.</p>
          </aside>
          <main className="form-shell" id="form-content" ref={contentRef} tabIndex={-1}>
            <div className="form-topline"><span>ÉTAPE {String(currentIndex + 1).padStart(2, '0')} <span className="form-topline__of">/ 04</span></span><span className="draft-tag"><span />Brouillon · démo</span></div>

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
          </main>
        </div>
        <footer className="page-footer"><span>© {new Date().getFullYear()} Wafabail · Parcours de démonstration</span><span className="footer-documents"><DocumentFileIcon />{total > 0 ? `${uploaded} / ${total} pièces jointes` : 'Un projet. Un dossier. Quatre étapes.'}</span></footer>
      </div>
    </div>
  )
}
