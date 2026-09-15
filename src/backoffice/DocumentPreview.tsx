import type { DemoDocument, Dossier } from './demoData'

export function DocumentPreview({ dossier, document: doc }: { dossier: Dossier; document: DemoDocument }) {
  const isCin = doc.kind.startsWith('CIN')
  return <svg className="bo-document-art" viewBox="0 0 650 440" role="img" aria-label={`${doc.kind} : exemple fictif, non valable`}>
    <rect width="650" height="440" fill="#f4f1ed" />
    <rect x="40" y="35" width="570" height="370" rx={isCin ? 20 : 4} fill="#fff" stroke="#ded5cc" />
    <rect x="40" y="35" width="570" height="65" rx="4" fill="#fff0e3" />
    <text x="67" y="64" fontSize="12" fill="#97501c" fontFamily="Arial" letterSpacing="2">WAFABAIL · DOCUMENT DE DÉMONSTRATION</text>
    <text x="67" y="86" fontSize="16" fill="#322820" fontFamily="Arial" fontWeight="bold">{doc.kind.toUpperCase()}</text>
    {isCin && <><rect x="67" y="126" width="118" height="146" rx="7" fill="#eee7df" /><circle cx="126" cy="172" r="25" fill="#c8bbb0"/><path d="M87 247c0-48 78-48 78 0" fill="#c8bbb0"/></>}
    <text x={isCin ? 210 : 67} y="147" fontSize="11" fill="#82746a" fontFamily="Arial">{isCin ? 'IDENTITÉ FICTIVE' : 'ENTREPRISE FICTIVE'}</text>
    <text x={isCin ? 210 : 67} y="172" fontSize="18" fill="#322820" fontFamily="Arial">{isCin ? dossier.contact : dossier.company}</text>
    <text x={isCin ? 210 : 67} y="205" fontSize="11" fill="#82746a" fontFamily="Arial">RÉFÉRENCE DE DÉMONSTRATION · NON OFFICIELLE</text>
    <text x={isCin ? 210 : 67} y="230" fontSize="16" fill="#322820" fontFamily="Arial">{isCin ? 'CIN-DEMO-0000' : doc.kind === 'Attestation ICE' ? 'ICE-DEMO-0000000' : dossier.id}</text>
    <text x={isCin ? 210 : 67} y="264" fontSize="14" fill="#66584c" fontFamily="Arial">{dossier.city} · Données entièrement fictives</text>
    <path d="M67 304h510m-510 16h400" stroke="#e8e0d8" strokeWidth="6" />
    <text x="325" y="369" textAnchor="middle" fontSize="15" fill="#bc5c22" fontFamily="Arial" fontWeight="bold" letterSpacing="2">EXEMPLE FICTIF — NON VALABLE</text>
  </svg>
}
