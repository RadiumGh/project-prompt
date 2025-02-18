import fs from 'fs'

let isWatching = false

export function watchProjectDir(
  baseDir: string,
  onDirectoryChange?: () => void,
) {
  if (isWatching) return
  isWatching = true

  const ignoredPatterns = [
    '.git',
    'node_modules',
    '.next',
    '.idea',
    'target',
    'dist',
    'build',
    '**/*.log',
    '**/tmp/*',
  ]

  let debounceTimer: NodeJS.Timeout

  fs.watch(baseDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return

    // Check if file matches any ignored pattern
    const isIgnored = ignoredPatterns.some(pattern => {
      if (pattern.includes('*')) {
        return filename.includes(pattern.replace(/\*/g, ''))
      }
      return filename.includes(pattern)
    })

    if (!isIgnored) {
      console.log('File changed:', eventType, filename)

      // Debounce the callback to avoid multiple rapid calls
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        onDirectoryChange?.()
      }, 500) // Wait 300ms after last change before calling callback
    }
  })
}
