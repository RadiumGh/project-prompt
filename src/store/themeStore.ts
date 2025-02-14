
// <ai_context>
//  Handles the user's chosen light/dark theme mode.
// </ai_context>

import { create } from 'zustand'
// TODO: Next rewriting plan: Possibly incorporate Next dynamic theming or continue using this Zustand approach for client theme toggles.
import { persist } from 'zustand/middleware'

interface ThemeStoreState {
  themeMode: 'light' | 'dark'
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set, get) => ({
      themeMode: 'dark',

      toggleTheme: () => {
        const current = get().themeMode
        const newTheme = current === 'light' ? 'dark' : 'light'
        set({ themeMode: newTheme })
      }
    }),
    {
      name: 'theme-store'
    }
  )
)
