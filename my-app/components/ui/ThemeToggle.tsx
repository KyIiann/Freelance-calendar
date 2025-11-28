import React from 'react'

interface Props { theme: 'light' | 'dark'; onToggle: (theme: 'light' | 'dark') => void }

export default function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button aria-label="Toggle theme" title="Toggle theme" role="switch" aria-checked={theme === 'dark'} className="theme-toggle" onClick={() => onToggle(theme === 'dark' ? 'light' : 'dark')}>
      <span style={{ pointerEvents: 'none' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
    </button>
  )
}
