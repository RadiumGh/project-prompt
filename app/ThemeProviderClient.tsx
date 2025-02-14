"use client"

import React from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { useThemeStore } from '@/src/store/themeStore'
import { lightThemeOptions, darkThemeOptions } from '@/src/muiTheme'

/**
 * Client-side ThemeProvider for Next.js 13.
 * Wraps children in MUI ThemeProvider + CssBaseline, using our Zustand themeMode.
 * TODO: SSR integration in future subtask.
 */
export default function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  const { themeMode } = useThemeStore()
  const theme = React.useMemo(() => {
    return createTheme(themeMode === 'light' ? lightThemeOptions : darkThemeOptions)
  }, [themeMode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}