import { useEffect, useRef, useState } from 'react'
import { ANALYSTS, DOC_STATUS, STATUS, analystName, dateLabel, money, type Dossier, type DossierStatus } from './demoData'
import { BoIcon } from './BoIcon'
import { DocumentPreview } from './DocumentPreview'
import { downloadDemoDocument } from './documentDownload'

export interface ActionPayload { type: 'assign' | 'reject' | 'revision' | 'approve' | 'archive' | 'restore' | 'priority' | 'note' | 'validate' | 'resubmit'; message?: string; analyst?: string; documents?: string[]; simulation?: boolean; amount?: number }
const editable: DossierStatus[] = ['new', 'analysis', 'revision']

export function DossierDrawer({ dossier, onClose, onAction, initialDocumentId, feedback }: { dossier: Dossier; onClose: () => void; onAction: (id: string, payload: ActionPayload) => void; initialDocumentId?: string | null; feedback: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [tab, setTab] = useState('documents')
  const [previewId, setPreviewId] = useState(initialDocumentId ?? dossier.documents.find(d => d.status !== 'missing')?.id ?? '')
  const [action, setAction] = useState<'assign' | 'reject' | 'revision' | null>(null)
  const [analyst, setAnalyst] = useState(dossier.analyst ?? ANALYSTS[0].id)
  const [message, setMessage] = useState('')
  const [requested, setRequested] = useState<string[]>([])
  const [simulation, setSimulation] = useState(false)
  const [note, setNote] = useState('')
  const [clientView, setClientView] = useState(false)
  const [revisedAmount, setRevisedAmount] = useState(String(dossier.amount))
  useEffect(() => { const origin = window.document.activeElement as HTMLElement | null; dialog.current?.showModal(); const previous = window.document.body.style.overflow; window.document.body.style.overflow = 'hidden'; return () => { window.document.body.style.overflow = previous; if (origin?.isConnected) origin.focus(); else window.document.getElementById('bo-main')?.focus() } }, [])
  useEffect(() => { if (action) dialog.current?.querySelector<HTMLElement>('#analyst-choice, #action-message')?.focus() }, [action])
  const preview = dossier.documents.find(d => d.id === previewId)
  const canEdit = editable.includes(dossier.status)
  const complete = dossier.documents.every(d => d.status === 'validated')
  const openAction = (next: typeof action) => { setAction(next); setMessage(''); setRequested(dossier.documents.filter(d => ['replace', 'missing'].includes(d.status)).map(d => d.id)); setSimulation(false) }
  const submitAction = () => {
    if (!action || (action !== 'assign' && message.trim().length < 10) || (action === 'revision' && !simulation && requested.length === 0)) return
    onAction(dossier.id, { type: action, analyst, message: message.trim(), documents: requested, simulation }); setAction(null)
  }
  return <dialog className="bo-drawer" ref={dialog} onCancel={onClose} aria-labelledby="dossier-title">
    <header className="bo-drawer-head"><div><span className="bo-kicker">DOSSIER · {dossier.id}</span><h2 id="dossier-title">{dossier.company}</h2><p>{dossier.contact} <span>·</span> {dossier.city} <span>·</span> {dossier.profile}</p></div><button className="bo-icon-button" onClick={onClose} aria-label="Fermer le dossier"><BoIcon name="close" /></button></header>
    <div className="bo-drawer-summary"><span className={`bo-badge bo-${STATUS[dossier.status].tone}`}>{STATUS[dossier.status].label}</span>{dossier.priority && <span className="bo-priority"><BoIcon name="star" size={13}/>Prioritaire</span>}<span className="bo-summary-amount">{money(dossier.amount)} <small>sur {dossier.duration} mois</small></span></div>
    {feedback && <div className="bo-drawer-feedback" role="status"><BoIcon name="check" size={16}/>{feedback}</div>}
    <div className="bo-owner-line"><span className="bo-avatar bo-small"><BoIcon name="users" size={16}/></span><span>Analyste <strong>{analystName(dossier.analyst)}</strong></span><span>Reçu le {dateLabel(dossier.date)}</span></div>
    <div className="bo-drawer-layout">
      <section className="bo-drawer-content">
        <div className="bo-detail-tabs" role="tablist" aria-label="Détail du dossier">{[['documents', `Documents (${dossier.documents.filter(d => d.status !== 'missing').length}/${dossier.documents.length})`], ['simulation', 'Simulation'], ['history', 'Historique']].map(([id, label]) => <button key={id} role="tab" id={`detail-tab-${id}`} aria-selected={tab === id} aria-controls={`panel-${id}`} onClick={() => setTab(id)}>{label}</button>)}</div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`detail-tab-${tab}`}>
          {tab === 'documents' && <><div className="bo-doc-list">{dossier.documents.map(doc => <button key={doc.id} className={`bo-doc-item ${previewId === doc.id ? 'is-selected' : ''}`} onClick={() => setPreviewId(doc.id)} aria-pressed={previewId === doc.id}><span className="bo-file-icon"><BoIcon name="file" size={18}/></span><span className="bo-doc-item-copy"><strong>{doc.kind}</strong><small>{doc.status === 'missing' ? 'Aucun fichier joint' : doc.name}</small></span><span className={`bo-badge bo-${DOC_STATUS[doc.status].tone}`}>{DOC_STATUS[doc.status].label}</span></button>)}</div>
            {preview && <div className="bo-preview"><div className="bo-preview-heading"><h3>{preview.kind}</h3><span>Exemple fictif · SVG</span></div>{preview.status === 'missing' ? <div className="bo-empty"><BoIcon name="file" size={32}/><h3>Cette pièce est manquante</h3><p>Demandez au client de la joindre dans un retour documentaire.</p></div> : <><DocumentPreview dossier={dossier} document={preview}/><div className="bo-preview-actions"><button className="bo-button" onClick={() => downloadDemoDocument(dossier, preview)}><BoIcon name="download" size={16}/>Télécharger l’exemple</button><button className="bo-button" disabled={!canEdit || preview.status === 'validated' || preview.status === 'replace'} onClick={() => onAction(dossier.id, { type: 'validate', documents: [preview.id] })}><BoIcon name="check" size={16}/>{preview.status === 'validated' ? 'Pièce vérifiée' : preview.status === 'replace' ? 'Remplacement demandé' : 'Marquer vérifié'}</button></div><p className="bo-fine-print">Maquette de document, pas une CIN ni une attestation officielle. Aucun OCR exécuté ici.</p></>}</div>}
          </>}
          {tab === 'simulation' && <div className="bo-simulation"><h3>Le projet de financement</h3><p>{dossier.project}</p><dl><div><dt>Montant souhaité (HT)</dt><dd>{money(dossier.amount)}</dd></div><div><dt>Type de financement</dt><dd>{dossier.financing}</dd></div><div><dt>Durée</dt><dd>{dossier.duration} mois</dd></div><div><dt>Apport initial</dt><dd>{dossier.deposit}% · {money(dossier.amount * dossier.deposit / 100)}</dd></div><div><dt>Contact client</dt><dd>{dossier.email}</dd></div><div><dt>Téléphone</dt><dd>{dossier.phone}</dd></div></dl><div className="bo-demo-note">Données fictives. Les montants illustrent le parcours, sans scoring ni décision réelle de crédit.</div></div>}
          {tab === 'history' && <div className="bo-timeline">{dossier.events.map(event => <article key={event.id}><span className="bo-timeline-dot"/><div><strong>{event.title}</strong><p>{event.detail}</p><small>{event.actor} · {dateLabel(event.date)}</small></div></article>)}</div>}
        </div>
        <section className="bo-notes"><h3>Notes internes <span>{dossier.notes.length}</span></h3>{dossier.notes.map(item => <article key={item.id}><p>{item.detail}</p><small>{item.actor} · {dateLabel(item.date)}</small></article>)}<form onSubmit={event => { event.preventDefault(); if (note.trim()) { onAction(dossier.id, { type: 'note', message: note.trim() }); setNote('') } }}><label className="bo-sr-only" htmlFor="internal-note">Nouvelle note interne</label><textarea id="internal-note" placeholder="Un point à partager avec l’analyste…" value={note} maxLength={1000} onChange={e => setNote(e.target.value)} rows={3}/><button className="bo-button" disabled={!note.trim()}><BoIcon name="send" size={16}/>Ajouter la note</button></form></section>
      </section>
      <aside className="bo-action-panel"><h3>Traiter ce dossier</h3><p>Chaque action est tracée dans l’historique.</p><div className="bo-action-buttons">
        <button className="bo-button bo-button-primary" disabled={!['new', 'analysis'].includes(dossier.status)} onClick={() => openAction('assign')}><BoIcon name="users" size={17}/>{dossier.analyst ? 'Réaffecter à un analyste' : 'Transférer à un analyste'}</button>
        <button className="bo-button" disabled={!canEdit} onClick={() => openAction('revision')}><BoIcon name="refresh" size={17}/>Demander un retour client</button>
        <button className="bo-button" disabled={dossier.status !== 'analysis' || !complete} onClick={() => onAction(dossier.id, { type: 'approve' })}><BoIcon name="check" size={17}/>Valider le dossier</button>
        {!complete && canEdit && <small className="bo-action-hint">Validation : affectez un analyste et vérifiez toutes les pièces.</small>}
        <button className="bo-button bo-button-danger" disabled={!canEdit} onClick={() => openAction('reject')}><BoIcon name="close" size={17}/>Rejeter avec motif</button>
        <button className="bo-button" disabled={!canEdit} onClick={() => onAction(dossier.id, { type: 'priority' })}><BoIcon name="star" size={17}/>{dossier.priority ? 'Retirer la priorité' : 'Marquer prioritaire'}</button>
        <button className="bo-button" disabled={!['approved', 'rejected', 'archived'].includes(dossier.status)} onClick={() => onAction(dossier.id, { type: dossier.status === 'archived' ? 'restore' : 'archive' })}><BoIcon name="archive" size={17}/>{dossier.status === 'archived' ? 'Rouvrir le dossier' : 'Archiver le dossier'}</button>
      </div>
      {action && <form className="bo-action-form" onSubmit={event => { event.preventDefault(); submitAction() }}><div className="bo-action-form-title"><h4>{action === 'assign' ? 'Affectation' : action === 'reject' ? 'Motif du rejet' : 'Demande de correction'}</h4><button type="button" className="bo-icon-button" onClick={() => setAction(null)} aria-label="Annuler l’action"><BoIcon name="close" size={16}/></button></div>
        {action === 'assign' ? <><label htmlFor="analyst-choice">Analyste destinataire</label><select id="analyst-choice" value={analyst} onChange={e => setAnalyst(e.target.value)}>{ANALYSTS.map(a => <option key={a.id} value={a.id}>{a.name} · {a.specialty}</option>)}</select><p className="bo-fine-print">Affectation simulée. Aucun analyste n’est notifié.</p></> : <><label htmlFor="action-message">{action === 'reject' ? 'Motif obligatoire' : 'Message destiné au client'}</label><textarea id="action-message" value={message} onChange={e => setMessage(e.target.value)} minLength={10} maxLength={1500} required rows={4} placeholder={action === 'reject' ? 'Expliquez le motif du rejet…' : 'Précisez les informations à corriger…'}/><small>10 caractères minimum · aucun message envoyé</small></>}
        {action === 'revision' && <fieldset><legend>Ce que le client doit refaire</legend><label className="bo-checkbox"><input type="checkbox" checked={simulation} onChange={e => setSimulation(e.target.checked)}/>Revoir la simulation</label>{dossier.documents.map(doc => <label key={doc.id} className="bo-checkbox"><input type="checkbox" checked={requested.includes(doc.id)} onChange={e => setRequested(prev => e.target.checked ? [...prev, doc.id] : prev.filter(id => id !== doc.id))}/>{doc.kind}</label>)}</fieldset>}
        <button className="bo-button bo-button-primary" disabled={action !== 'assign' && (message.trim().length < 10 || (action === 'revision' && !simulation && requested.length === 0))}>{action === 'assign' ? 'Confirmer le transfert' : action === 'reject' ? 'Confirmer le rejet' : 'Créer la demande de correction'}</button>
      </form>}
      {dossier.status === 'revision' && dossier.revision && <section className="bo-client-request"><span className="bo-kicker">RETOUR CLIENT EN ATTENTE</span><p>{dossier.revision.message}</p><button className="bo-button" onClick={() => setClientView(!clientView)}><BoIcon name="external" size={16}/>{clientView ? 'Masquer l’aperçu client' : 'Voir l’aperçu côté client'}</button>
        {clientView && <div className="bo-client-preview"><h4>Votre dossier a besoin d’un complément</h4><p>Bonjour {dossier.contact.split(' ')[0]}, voici les éléments à revoir.</p>{dossier.revision.simulation && <><label htmlFor="revised-amount">Nouveau montant souhaité (DH)</label><input id="revised-amount" type="number" min={1} max={100000000} value={revisedAmount} onChange={e => setRevisedAmount(e.target.value)}/></>}<ul>{dossier.revision.documents.map(id => <li key={id}>{dossier.documents.find(d => d.id === id)?.kind} · Nouvelle version fictive</li>)}</ul><p className="bo-fine-print">Ce bouton simule de nouvelles pièces et un renvoi. Aucun fichier client n’est téléversé.</p><button className="bo-button bo-button-primary" disabled={dossier.revision.simulation && (!Number.isFinite(Number(revisedAmount)) || Number(revisedAmount) <= 0 || Number(revisedAmount) > 100000000)} onClick={() => { onAction(dossier.id, { type: 'resubmit', amount: dossier.revision?.simulation ? Number(revisedAmount) : dossier.amount }); setClientView(false) }}>Simuler le renvoi du client</button></div>}
      </section>}
      <div className="bo-demo-note"><strong>Environnement de démo</strong>Actions locales uniquement. Aucun e-mail, transfert réel ou décision de financement.</div>
      </aside>
    </div>
  </dialog>
}
