# Step 5: Begin Migrating Frontend Pages Into the Next.js `app/` Directory

## Overview
- We created a new `app/prompt/page.tsx` that replicates part of `App.tsx` so we can load our existing components under the Next 13+ framework.
- We mark each component using React hooks or stores with `'use client'`, allowing them to function as client components in Next.
- We keep MUI theming in a future subtask (`layout.tsx` or a custom provider). We also skip advanced SSR or code splitting for now.

## Implementation Details
1. **New Next.js Page**: A minimal page at `/prompt`, referencing some of our existing components. We add big TODO notes for theming and ignoring the Web FileSystem usage for now.
2. **'use client' Additions**: Each `.tsx` file in `src/components` or `src/components/modals` that uses hooks or Zustand must be labeled a client component. This ensures they render properly under Next.
3. **Incremental Approach**: We do not remove or modify `App.tsx`. We keep the old Vite-based setup as is, focusing on partial duplication in Next for now.

## Next Steps
- Potentially unify MUI theming with Next's server components or layout in a future subtask.
- Explore code splitting or dynamic imports to reduce bundle size.
- Eventually remove or refactor the old Vite approach once we confirm everything in Next is stable.

## Implementation Log
- Created `app/prompt/page.tsx` as a minimal, client-rendered page that reuses existing components for demonstration.
- Added `'use client'` in each relevant component file so Next can load them without SSR issues.