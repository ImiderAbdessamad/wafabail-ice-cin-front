export type DossierStatus = 'new' | 'analysis' | 'revision' | 'approved' | 'rejected' | 'archived'
export type DocumentStatus = 'review' | 'validated' | 'replace' | 'missing'
export interface DemoDocument { id: string; name: string; kind: string; size: string; status: DocumentStatus }
export interface DemoEvent { id: string; date: string; title: string; detail: string; actor: string }
export interface RevisionRequest { message: string; simulation: boolean; documents: string[] }
export interface Dossier {
  id: string; company: string; contact: string; initials: string; profile: string; city: string;
  email: string; phone: string; amount: number; duration: number; deposit: number;
  project: string; financing: string; date: string; status: DossierStatus; priority: boolean;
  analyst: string | null; documents: DemoDocument[]; events: DemoEvent[]; notes: DemoEvent[];
  revision: RevisionRequest | null;
}
export const STATUS: Record<DossierStatus, { label: string; tone: string }> = {
  new: { label: 'À traiter', tone: 'orange' },
  analysis: { label: 'En analyse', tone: 'blue' },
  revision: { label: 'Retour client', tone: 'amber' },
  approved: { label: 'Validé', tone: 'green' },
  rejected: { label: 'Rejeté', tone: 'red' },
  archived: { label: 'Archivé', tone: 'gray' },
}
export const DOC_STATUS: Record<DocumentStatus, { label: string; tone: string }> = {
  review: { label: 'À vérifier', tone: 'gray' }, validated: { label: 'Vérifié', tone: 'green' },
  replace: { label: 'À remplacer', tone: 'red' }, missing: { label: 'Manquant', tone: 'amber' },
}
export const ANALYSTS = [
  { id: 'salma', name: 'Salma Bennani', initials: 'SB', specialty: 'PME & équipements', capacity: 6 },
  { id: 'youssef', name: 'Youssef Amrani', initials: 'YA', specialty: 'Immobilier professionnel', capacity: 5 },
  { id: 'noura', name: 'Noura El Fassi', initials: 'NE', specialty: 'TPE & professions libérales', capacity: 6 },
]
export const analystName = (id: string | null) => ANALYSTS.find(a => a.id === id)?.name ?? 'Non affecté'
export const money = (amount: number) => new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(amount) + ' DH'
export const dateLabel = (date: string) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(date))

const exampleRows: [string, string, string, string, number, DossierStatus, string | null, boolean][] = [
  ['Atlas Équipements', 'Karim El Mansouri', 'Casablanca', 'Équipements de production', 780000, 'new', null, true],
  ['Cabinet Nadia Santé', 'Nadia Berrada', 'Rabat', 'Matériel de diagnostic', 320000, 'new', null, false],
  ['Marrakech Logistique', 'Omar Idrissi', 'Marrakech', 'Flotte de véhicules utilitaires', 1250000, 'analysis', 'salma', true],
  ['Studio Architecture 04', 'Lina Alaoui', 'Tanger', 'Aménagement du cabinet', 180000, 'revision', 'noura', false],
  ['Rif Agro Industrie', 'Mehdi Chraïbi', 'Fès', 'Ligne de conditionnement', 960000, 'analysis', 'salma', false],
  ['Casa Espaces Pro', 'Sofia Tazi', 'Casablanca', 'Acquisition de locaux professionnels', 2400000, 'analysis', 'youssef', false],
  ['TPE Horizon Digital', 'Anas Benjelloun', 'Rabat', 'Équipement informatique', 145000, 'approved', 'noura', false],
  ['Oriental Services', 'Hicham Ziani', 'Oujda', 'Véhicule professionnel', 210000, 'rejected', 'noura', false],
  ['Agadir Hospitality', 'Meryem Lahlou', 'Agadir', 'Équipement de cuisine', 540000, 'revision', 'salma', true],
  ['Nord Distribution', 'Rachid Kabbaj', 'Tétouan', 'Rayonnage et manutention', 430000, 'new', null, false],
  ['Safir Conseil', 'Imane Moutawakkil', 'Rabat', 'Mobilier de bureau', 95000, 'archived', 'noura', false],
  ['Coopérative Al Amal', 'Amine Sefrioui', 'Meknès', 'Matériel agricole', 675000, 'approved', 'salma', false],
]

export function createDemoDossiers(): Dossier[] {
  return exampleRows.map(([company, contact, city, project, amount, status, analyst, priority], index) => {
    const id = `WFB-26-${String(1048 - index).padStart(4, '0')}`
    const date = `2026-09-${String(15 - Math.floor(index / 2)).padStart(2, '0')}T${index % 2 ? '09:20' : '11:45'}:00+01:00`
    const kinds = ['CIN · recto', 'CIN · verso', 'Attestation ICE', 'Registre de commerce', 'RIB', 'Facture pro forma', 'Bilan financier']
    const documents = kinds.map((kind, i): DemoDocument => ({
      id: `${id}-doc-${i}`, kind, name: `${kind.replaceAll(' · ', '_').replaceAll(' ', '_')}_DEMO.svg`,
      size: 'Exemple SVG', status: status === 'approved' || status === 'archived' ? 'validated' : status === 'revision' && i === 1 ? 'replace' : (index === 1 || index === 9) && i === 6 ? 'missing' : i < 3 && status === 'analysis' ? 'validated' : 'review',
    }))
    const event = (title: string, detail: string, actor: string, n: number): DemoEvent => ({ id: `${id}-event-${n}`, date, title, detail, actor })
    const events = [event('Dossier reçu', 'Simulation et pièces jointes reçues dans le parcours de démonstration.', 'Client · démo', 0)]
    if (analyst) events.unshift(event('Affectation à un analyste', analystName(analyst), 'Gestionnaire · démo', 1))
    const revision = status === 'revision' ? { message: 'Merci de joindre une copie nette du verso de votre CIN et de vérifier le montant de votre simulation.', simulation: true, documents: [documents[1].id] } : null
    if (revision) events.unshift(event('Compléments demandés', revision.message, 'Gestionnaire · démo', 2))
    if (status === 'approved') events.unshift(event('Dossier validé', 'Validation simulée du dossier. Aucun engagement de financement.', analystName(analyst), 2))
    if (status === 'rejected') events.unshift(event('Dossier rejeté', 'Pièces justificatives insuffisantes après demande de complément.', 'Gestionnaire · démo', 2))
    return { id, company, contact, initials: company.split(' ').slice(0, 2).map(s => s[0]).join(''), profile: index % 3 === 1 ? 'Profession libérale' : index % 3 === 0 ? 'PME' : 'TPE', city,
      email: `client${index + 1}@example.com`, phone: 'Non renseigné · démo', amount, duration: index === 5 ? 120 : index % 2 ? 36 : 48,
      deposit: index % 2 ? 10 : 20, project, financing: index === 5 ? 'Immobilier' : 'Mobilier', date, status, priority, analyst, documents, events, notes: [], revision }
  })
}
