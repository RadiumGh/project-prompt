import fs from 'fs'
import path from 'path'

/**
 * Recursively list the directory structure, ignoring certain folders.
 * This example forcibly reads from a baseDir, ignoring .git / node_modules.
 */
export interface DirNode {
  name: string
  path: string
  isDirectory: boolean
  children?: DirNode[]
}

export function listDirectory(baseDir: string, currentPath = ''): DirNode[] {
  const absPath = path.join(baseDir, currentPath)
  let dirNodes: DirNode[] = []

  const entries = fs.readdirSync(absPath, { withFileTypes: true })
  for (const entry of entries) {
    // skip .git, node_modules, etc.
    if (
      [
        '.git',
        'node_modules',
        '.next',
        '.idea',
        'target',
        'dist',
        'build',
      ].includes(entry.name)
    ) {
      continue
    }
    const entryPath = path.join(currentPath, entry.name)
    const fullPath = path.join(absPath, entry.name)
    const isDir = entry.isDirectory()

    if (isDir) {
      const children = listDirectory(baseDir, entryPath)
      dirNodes.push({
        name: entry.name,
        path: entryPath.replace(/\\/g, '/'),
        isDirectory: true,
        children,
      })
    } else {
      dirNodes.push({
        name: entry.name,
        path: entryPath.replace(/\\/g, '/'),
        isDirectory: false,
      })
    }
  }

  // Sort: directories first, then alphabetical by name
  dirNodes.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1
    if (!a.isDirectory && b.isDirectory) return 1
    return a.name.localeCompare(b.name)
  })

  return dirNodes
}
