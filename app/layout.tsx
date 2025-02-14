export const metadata = {
  title: 'Project Prompt Next Migration',
  description: 'Next.js 13+ layout for the rewriting process'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* TODO: unify styling and theming with MUI in future subtasks */}
        {children}
      </body>
    </html>
  )
}