# Step 6: Unify MUI Theming & Global State in Next Layout

## Overview
- We introduce a new client component `ThemeProviderClient.tsx` to wrap MUI’s ThemeProvider and CssBaseline, reading the theme mode from `themeStore.ts`.
- We embed this component in Next’s `app/layout.tsx` so the entire Next app uses our unified MUI theme.

## Implementation Details
1. **ThemeProviderClient**:
   - `'use client'` file in `app/`.
   - Imports `themeMode` from `useThemeStore`.
   - Dynamically creates the MUI theme from `lightThemeOptions` or `darkThemeOptions` in `src/muiTheme.ts`.
2. **layout.tsx**:
   - Imports `ThemeProviderClient`.
   - Wraps the `<body>` children to ensure the entire Next app is themed consistently.
   - Leaves a TODO for SSR with MUI in a future step.

## Future Steps
- Subtask 7 or beyond: Full SSR with Emotion (or styled-components) to avoid flicker and incorporate user’s OS/theme preference from first render.

## Implementation Log
- Created `ThemeProviderClient.tsx`.
- Updated `app/layout.tsx` to wrap the Next app content in our new theme provider.
- Tested locally to confirm the dark/light toggle from `themeStore.ts` continues to function in Next environment.