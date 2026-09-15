import { lazy, Suspense } from 'react'

// Independent portals: each loads only its own screens and styles.
const ClientPortal = lazy(() => import('./client/ClientApp'))
const ManagerPortal = lazy(() => import('./backoffice/BackOffice').then(module => ({ default: module.BackOffice })))

export default function App() {
  const isManagerPortal = window.location.pathname.replace(/\/$/, '') === '/backoffice'
  return (
    <Suspense fallback={<div role="status" style={{ padding: '32px', textAlign: 'center' }}>Chargement de l’espace…</div>}>
      {isManagerPortal ? <ManagerPortal /> : <ClientPortal />}
    </Suspense>
  )
}
