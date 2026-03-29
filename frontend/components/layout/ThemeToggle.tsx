'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const t = useTranslations('theme')

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-lg bg-surface-tertiary animate-pulse-soft" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center justify-center h-8 w-8 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors duration-200"
      aria-label={isDark ? t('switchToLight') : t('switchToDark')}
      title={isDark ? t('switchToLight') : t('switchToDark')}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}
