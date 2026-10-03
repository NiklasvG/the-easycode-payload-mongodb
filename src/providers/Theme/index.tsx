'use client'
import React, { createContext, use, useCallback, useSyncExternalStore } from 'react'
import type { Theme, ThemeContextType } from './types'
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'

export const getThemePreference = (): Theme | 'auto' => {
  try {
    const value = window.localStorage.getItem(themeLocalStorageKey)
    return themeIsValid(value) ? value : 'auto'
  } catch {
    return 'auto'
  }
}
const applyPreference = () => {
  const preference = getThemePreference()
  document.documentElement.setAttribute(
    'data-theme',
    preference === 'auto' ? getImplicitPreference() || defaultTheme : preference,
  )
}
export const subscribeTheme = (notify: () => void) => {
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  const refresh = () => {
    applyPreference()
    notify()
  }
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  window.addEventListener('storage', refresh)
  window.addEventListener('theme-preference-changed', refresh)
  media.addEventListener('change', refresh)
  return () => {
    observer.disconnect()
    window.removeEventListener('storage', refresh)
    window.removeEventListener('theme-preference-changed', refresh)
    media.removeEventListener('change', refresh)
  }
}
const themeSnapshot = () => {
  const value = document.documentElement.getAttribute('data-theme')
  return themeIsValid(value) ? value : defaultTheme
}
const ThemeContext = createContext<ThemeContextType>({ setTheme: () => null, theme: undefined })
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useSyncExternalStore(subscribeTheme, themeSnapshot, () => undefined)
  const setTheme = useCallback((value: Theme | null) => {
    try {
      if (value === null) window.localStorage.removeItem(themeLocalStorageKey)
      else window.localStorage.setItem(themeLocalStorageKey, value)
    } catch {
      /* Theme still works for this page when storage is unavailable. */
    }
    document.documentElement.setAttribute(
      'data-theme',
      value || getImplicitPreference() || defaultTheme,
    )
    window.dispatchEvent(new Event('theme-preference-changed'))
  }, [])
  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}
export const useTheme = (): ThemeContextType => use(ThemeContext)
