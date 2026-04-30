/**
 * Theme Store — Zustand
 *
 * Maneja el tema claro/oscuro de la app.
 * Persiste en localStorage para recordar la preferencia del usuario.
 * El Layout se encarga de sincronizar con el atributo data-theme en <html>.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
      },
    }),
    {
      name: 'javi-control-theme',
    }
  )
)
