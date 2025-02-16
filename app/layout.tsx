import { ReactNode } from 'react'

export const metadata = {
  title: 'Project Prompt Next Migration',
  description: 'Next.js 13+ layout for the rewriting process',
}

import ThemeProviderClient from './ThemeProviderClient'

// We unify styling and theming with MUI from the server root layout.
// The client-based theme toggling will be wrapped here to ensure SSR + hydration work properly.

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProviderClient>{children}</ThemeProviderClient>
      </body>
    </html>
  )
}
