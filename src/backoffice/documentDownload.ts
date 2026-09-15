import type { DemoDocument, Dossier } from './demoData'

function escapeXml(value: string) { return value.replace(/[<>&"']/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!) }
export function downloadDemoDocument(dossier: Dossier, doc: DemoDocument) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520"><rect width="800" height="520" fill="#fff8f1"/><text x="40" y="70" font-family="Arial" font-size="22">${escapeXml(doc.kind)} · EXEMPLE FICTIF</text><text x="40" y="130" font-family="Arial" font-size="20">${escapeXml(dossier.company)}</text><text x="40" y="180" font-family="Arial" font-size="18">${escapeXml(dossier.id)}</text><text x="40" y="250" font-family="Arial" font-size="16">CIN-DEMO-0000 / ICE-DEMO-0000000</text><text x="40" y="400" font-family="Arial" font-size="22" fill="#ad460c">DOCUMENT DE DÉMONSTRATION — NON VALABLE</text></svg>`
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  const link = window.document.createElement('a'); link.href = url; link.download = doc.name; window.document.body.appendChild(link); link.click(); link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
