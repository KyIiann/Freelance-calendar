import { useEffect } from 'react'
import type { RefObject } from 'react'

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return []
  const nodes = container.querySelectorAll<HTMLElement>(
    'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]'
  )
  return Array.from(nodes).filter(el => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1')
}

export default function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean, onClose?: () => void) {
  useEffect(() => {
    if (!active) return
    const container = ref.current
    if (!container) return
    const prevFocused = document.activeElement as HTMLElement | null
    const focusables = getFocusableElements(container)
    if (focusables.length > 0) {
      focusables[0].focus()
    } else {
      container.focus()
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      } else if (e.key === 'Tab') {
        const focusables = getFocusableElements(container)
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      try { prevFocused?.focus() } catch { /* ignore */ }
    }
  }, [ref, active, onClose])
}
