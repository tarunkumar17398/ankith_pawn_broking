import { useEffect, useState } from 'react'

const THEME_KEY = 'pv_theme'

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    return (localStorage.getItem(THEME_KEY) ?? 'light') === 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}
