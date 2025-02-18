import { create } from 'zustand'

interface ThemeStoreState {
  themeMode: 'light' | 'dark'
  toggleTheme: () => void
  setStateFromConfig: (config: any) => void
}

export const useThemeStore = create<ThemeStoreState>()((set, get) => ({
  themeMode: 'dark',

  toggleTheme: () => {
    const current = get().themeMode
    const newTheme = current === 'light' ? 'dark' : 'light'
    set({ themeMode: newTheme })
  },

  setStateFromConfig(config) {
    if (config.themeMode === 'light' || config.themeMode === 'dark') {
      set({ themeMode: config.themeMode })
    }
  },
}))
