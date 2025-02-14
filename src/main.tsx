
// <ai_context>
// TODO: Next rewriting plan: This main.tsx is replaced by Next’s app entry. Keep for reference, but no actual usage eventually.
//  Main entry point for the React app. Renders App component into #root.
//  Now uses MUI's ThemeProvider with a custom light/dark theme from new theme store.
// </ai_context>

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { lightThemeOptions, darkThemeOptions } from './muiTheme'
import { useThemeStore } from './store/themeStore'

function Root() {
  const { themeMode } = useThemeStore()

  const theme = React.useMemo(() => {
    return createTheme(themeMode === 'light' ? lightThemeOptions : darkThemeOptions)
  }, [themeMode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(<Root />)
