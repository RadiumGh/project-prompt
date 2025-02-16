"use client"
import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useThemeStore } from '@/src/store/themeStore';
import { lightThemeOptions, darkThemeOptions } from '@/src/muiTheme';

/**
 * Client-side ThemeProvider for Next.js 13, used from app/layout.tsx.
 * We now treat it as an SSR-friendly approach, providing an initial guess for theme mode,
 * and then rehydrating client state. In practice, you'd do advanced SSR logic if needed.
 */
export default function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  const { themeMode } = useThemeStore();
  const theme = React.useMemo(() => {
    return createTheme(themeMode === 'light' ? lightThemeOptions : darkThemeOptions);
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}