// React default import is not needed with the JSX runtime
import './Header.css'
import './header-modal.css'
import ThemeToggle from './ThemeToggle'
import LoginRegister from './LoginRegister'
import type { AuthPayload } from '../../src/services/auth'
import { useState, useRef, useEffect } from 'react'
import useFocusTrap from '../../src/hooks/useFocusTrap'
// removed local dropdown-based login in favor of dedicated Login page
// no local state required in header
// header doesn't take onLogin prop; login is handled at page level

type HeaderProps = {
  theme: 'light' | 'dark'
  onToggle: (t: 'light' | 'dark') => void
  userAuth: { id?: string; name?: string; email?: string } | null
  onLogin?: (u: AuthPayload) => void
  // onLogin is handled via App at page-level; header only triggers onOpenLogin
  onLogout?: () => void
  onOpenAdmin?: (v: string | null) => void
  onOpenLogin?: (next?: string | null) => void
  openModal?: boolean
  modalNextFromApp?: string | null
  onModalClose?: () => void
  title?: string
}

export default function Header({ theme, onToggle, userAuth, onLogin, onLogout, onOpenAdmin, onOpenLogin, openModal, modalNextFromApp, onModalClose, title }: HeaderProps) {
  const [localShowModal, setLocalShowModal] = useState(false)
  const [localModalNext, setLocalModalNext] = useState<string | null>(null)
  const [localClosing, setLocalClosing] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)
  useFocusTrap(modalRef as unknown as React.RefObject<HTMLElement>, !!(localShowModal || openModal), () => { setLocalShowModal(false); onModalClose?.() })

  // prevent background scroll when modal is visible (local or app-level)
  useEffect(() => {
    if (localShowModal || openModal) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [localShowModal, openModal])
  // react to external modal open via props
    // derive effective modal visibility and next param from local or parent props
    const effectiveShowModal = localShowModal || !!openModal
    const effectiveModalNext = localModalNext ?? modalNextFromApp ?? null
  // If the header or Home invoke onOpenLogin(next), we'll set the modalNext and open modal.
  function handleOpenLogin(next?: string | null) {
    setLocalModalNext(next ?? null)
    setLocalShowModal(true)
    if (next) {
      // if next is a id or route, we might want to pre-fill / redirect after login,
      // for now we simply set the state so App can read via onOpenLogin
      onOpenLogin?.(next)
    }
  }
  function closeModal() {
    setLocalClosing(true)
    setTimeout(() => {
      setLocalClosing(false)
      setLocalShowModal(false)
      onModalClose?.()
    }, 220)
  }
  return (
    <header className="app-header">
      <div className="left-wrap">
        <button className="btn-back" onClick={() => onOpenAdmin && onOpenAdmin(null)}>← Retour</button>
        <h2 className="logo-title">{title ?? 'Mini profil'}</h2>
      </div>
      <div className="right-wrap">
          <ThemeToggle theme={theme} onToggle={onToggle} />
        {userAuth ? (
          <>
            <div className="user-name">{userAuth?.name || userAuth?.email}</div>
            <button className="btn-back" onClick={() => onLogout && onLogout()}>Logout</button>
          </>
        ) : (
          <button className="btn-back" onClick={() => { handleOpenLogin(null); /* do not call app openLogin with null */ }}>Connexion</button>
        )}
        {effectiveShowModal && (
          <div className={`header-modal-overlay ${localClosing ? 'header-modal-exit' : 'header-modal-enter'}`} onClick={() => { closeModal() }}>
            <div className={`header-modal ${localClosing ? 'header-modal-exit' : 'header-modal-enter'}`} ref={modalRef} role="dialog" aria-modal="true" onClick={(e)=>e.stopPropagation()}>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button aria-label="Close" className="btn-back" onClick={() => { closeModal() }}>✕</button>
              </div>
              <LoginRegister trapFocus onClose={() => { closeModal() }} onLogin={(u) => { if (onLogin) onLogin(u); closeModal() }} />
              {effectiveModalNext && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>Après connexion, tu seras redirigé vers: <strong>{effectiveModalNext}</strong></div>}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
