import { createContext, useContext, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { colors as lightColors, darkColors, tints as lightTints, tintsDark } from './index'

const ThemeContext = createContext({ colors: lightColors, isDark: false })

export function ThemeProvider({ children }) {
  const temaEscuro = useAppStore(s => s.temaEscuro)
  const value = useMemo(
    () => ({ colors: temaEscuro ? darkColors : lightColors, isDark: temaEscuro }),
    [temaEscuro]
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() { return useContext(ThemeContext) }
export function useThemeColors() { return useContext(ThemeContext).colors }

// Theme-aware tint tiles. useTint() returns a `tint(key)` function bound to the
// current theme, mirroring the static `tint` helper but dark-aware.
export function useTints() { return useContext(ThemeContext).isDark ? tintsDark : lightTints }
export function useTint() {
  const t = useTints()
  return (key) => t[key] || t.teal
}
