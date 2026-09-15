import type { ReactNode } from 'react'
export type BoIconName = 'grid' | 'folder' | 'file' | 'users' | 'clock' | 'search' | 'arrow' | 'download' | 'close' | 'check' | 'refresh' | 'send' | 'archive' | 'star' | 'filter' | 'external'
export function BoIcon({ name, size = 20 }: { name: BoIconName; size?: number }) {
  const icons: Record<BoIconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    folder: <path d="M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z"/>,
    file: <><path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 13h8m-8 4h5"/></>,
    users: <><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-18a3 3 0 0 1 0 6m1 5a5 5 0 0 1 3 4v3"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>, download: <path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>, check: <path d="m5 12 4 4L19 6"/>,
    refresh: <><path d="M20 7a9 9 0 1 0 1 7M20 3v5h-5"/></>, send: <path d="m3 11 18-8-8 18-2-8-8-2Zm8 2L21 3"/>,
    archive: <><path d="M4 8v13h16V8M3 3h18v5H3zM9 12h6"/></>,
    star: <path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1 3-6Z"/>,
    filter: <path d="M3 5h18M6 12h12m-9 7h6"/>, external: <path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
}
