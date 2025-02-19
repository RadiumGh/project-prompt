import { create } from 'zustand'
import { approximateTokens } from '../utils/tokenHelpers'
import { isIgnored } from '../utils/ignoreHelpers'

interface FileNode {
  name: string
  path: string
  handle?: any
  isDirectory: boolean
  selected: boolean
  children?: FileNode[]
}

export interface LoadedFile {
  path: string
  content: string
  tokenCount: number
}

interface FileStoreState {
  fileTree: FileNode[]
  selectedFiles: FileNode[]
  loadedFiles: LoadedFile[]
  ignorePatterns: string
  includeTreeInPrompt: boolean
  selectedPaths: string[]
  excludedPaths: string[]
  // NEW: store the rootDirName dynamically
  rootDirName: string

  setIgnorePatterns: (value: string) => void
  setIncludeTreeInPrompt: (val: boolean) => void
  setStateFromConfig: (config: any) => void

  fetchDirectoryFromServer: () => Promise<void>
  toggleSelection: (path: string, handle: any, isDirectory: boolean) => void
  clearSelection: () => void
  loadSelectedFiles: () => Promise<void>
  addAttachmentFile: (path: string, content: string) => void
  removeAttachmentFile: (filePath: string) => void
}

function parseNodes(nodes: any[]): FileNode[] {
  return nodes.map(n => ({
    name: n.name,
    path: n.path,
    isDirectory: n.isDirectory,
    selected: false,
    children: n.isDirectory && n.children ? parseNodes(n.children) : [],
  }))
}

function gatherSelected(nodes: FileNode[]): FileNode[] {
  let result: FileNode[] = []
  for (const nd of nodes) {
    if (nd.selected) result.push(nd)
    if (nd.children && nd.children.length > 0) {
      result = result.concat(gatherSelected(nd.children))
    }
  }
  return result
}

export const useFileStore = create<FileStoreState>((set, get) => ({
  fileTree: [],
  selectedFiles: [],
  loadedFiles: [],
  ignorePatterns: '',
  includeTreeInPrompt: true,
  selectedPaths: [],
  excludedPaths: [],
  // Initialize rootDirName to an empty string
  rootDirName: '',

  setIgnorePatterns(value) {
    set({ ignorePatterns: value })
  },

  setIncludeTreeInPrompt(val) {
    set({ includeTreeInPrompt: val })
  },

  setStateFromConfig(config) {
    if (typeof config.ignorePatterns === 'string') {
      set({ ignorePatterns: config.ignorePatterns })
    }
    if (typeof config.includeTreeInPrompt === 'boolean') {
      set({ includeTreeInPrompt: config.includeTreeInPrompt })
    }
    if (Array.isArray(config.selectedPaths)) {
      set({ selectedPaths: config.selectedPaths })
    }
    if (Array.isArray(config.excludedPaths)) {
      set({ excludedPaths: config.excludedPaths })
    }
  },

  async fetchDirectoryFromServer() {
    const fallbackFetch = async () => {
      try {
        const response = await fetch('/api/list-directory')
        const data = await response.json()
        const { tree, rootDirName } = data
        const parsedTree = parseNodes(tree)
        const { selectedPaths, excludedPaths } = get()
        const finalTree = applyPersistedSelection(
          parsedTree,
          selectedPaths,
          excludedPaths,
        )
        set({
          fileTree: finalTree,
          selectedFiles: gatherSelected(finalTree),
          rootDirName: rootDirName || '',
        })
      } catch (error) {
        console.error('Error in fallback fetch:', error)
      }
    }

    try {
      const eventSource = new EventSource('/api/list-directory')
      eventSource.onmessage = event => {
        const data = JSON.parse(event.data)
        const { tree, rootDirName } = data
        const parsedTree = parseNodes(tree)
        const { selectedPaths, excludedPaths } = get()
        const finalTree = applyPersistedSelection(
          parsedTree,
          selectedPaths,
          excludedPaths,
        )
        set({
          fileTree: finalTree,
          selectedFiles: gatherSelected(finalTree),
          rootDirName: rootDirName || '',
        })
      }
      eventSource.onerror = () => {
        console.error('SSE connection error')
        eventSource.close()
        fallbackFetch()
      }
    } catch (error) {
      console.error('Error fetching directory:', error)
      fallbackFetch()
    }
  },

  toggleSelection(path, handle, isDirectory) {
    const { selectedPaths, excludedPaths, fileTree } = get()

    const newSelectedPaths = [...selectedPaths]
    const newExcludedPaths = [...excludedPaths]

    const currentlySelected = isEffectivelySelected(
      path,
      newSelectedPaths,
      newExcludedPaths,
    )

    if (currentlySelected) {
      // Unselecting
      if (newSelectedPaths.includes(path)) {
        // If this path was explicitly fully selected, remove it
        removePathAndDescendants(path, newSelectedPaths, newExcludedPaths)
      } else {
        // It's selected via an ancestor, so exclude it
        if (!newExcludedPaths.includes(path)) {
          newExcludedPaths.push(path)
        }
      }
    } else {
      // Selecting
      if (isDirectory) {
        // Mark this directory as fully selected, remove children from selectedPaths/excludedPaths
        if (!newSelectedPaths.includes(path)) {
          newSelectedPaths.push(path)
        }
        removeAllDescendants(path, newSelectedPaths, newExcludedPaths)
      } else {
        // It's a file, just add to selectedPaths if not present, remove from excludedPaths if present
        if (!newSelectedPaths.includes(path)) {
          newSelectedPaths.push(path)
        }
        const idxEx = newExcludedPaths.indexOf(path)
        if (idxEx >= 0) {
          newExcludedPaths.splice(idxEx, 1)
        }
      }
    }

    const updatedTree = applyPersistedSelection(
      fileTree,
      newSelectedPaths,
      newExcludedPaths,
    )
    set({
      fileTree: updatedTree,
      selectedFiles: gatherSelected(updatedTree),
      selectedPaths: newSelectedPaths,
      excludedPaths: newExcludedPaths,
    })
  },

  clearSelection() {
    const { fileTree } = get()
    const newTree = clearAll(fileTree)
    set({
      fileTree: newTree,
      selectedFiles: [],
      loadedFiles: [],
      selectedPaths: [],
      excludedPaths: [],
    })
  },

  async loadSelectedFiles() {
    const { selectedFiles, ignorePatterns } = get()
    const ignoreLines = ignorePatterns.split('\n')
    const validPaths = selectedFiles
      .filter(f => !isIgnored(f.path, ignoreLines) && !f.isDirectory)
      .map(f => f.path)
    if (!validPaths.length) {
      set({ loadedFiles: [] })
      return
    }
    try {
      const resp = await fetch('/api/get-file-contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: validPaths }),
      })
      if (!resp.ok) {
        console.error('Failed to load file contents from server.')
        return
      }
      const data = await resp.json()
      const serverFiles = data.files || []
      const loadedFiles = serverFiles.map((f: any) => ({
        path: f.path,
        content: f.content,
        tokenCount: approximateTokens(f.content),
      }))
      set({ loadedFiles })
    } catch (err) {
      console.error('Error loading file contents from server:', err)
      set({ loadedFiles: [] })
    }
  },

  addAttachmentFile(path, content) {
    const tokenCount = approximateTokens(content)
    const newFile: LoadedFile = { path, content, tokenCount }
    const { loadedFiles } = get()
    set({ loadedFiles: [newFile, ...loadedFiles] })
  },

  removeAttachmentFile(filePath) {
    const { loadedFiles } = get()
    set({ loadedFiles: loadedFiles.filter(file => file.path !== filePath) })
  },
}))

function applyPersistedSelection(
  nodes: FileNode[],
  selectedPaths: string[],
  excludedPaths: string[],
): FileNode[] {
  return nodes.map(node => {
    const childNodes = node.children
      ? applyPersistedSelection(node.children, selectedPaths, excludedPaths)
      : []
    const sel = isEffectivelySelected(node.path, selectedPaths, excludedPaths)
    return { ...node, selected: sel, children: childNodes }
  })
}

function isEffectivelySelected(
  path: string,
  selectedPaths: string[],
  excludedPaths: string[],
): boolean {
  if (excludedPaths.includes(path)) return false
  if (selectedPaths.includes(path)) return true
  const parent = findSelectedAncestor(path, selectedPaths, excludedPaths)
  return !!parent
}

function findSelectedAncestor(
  path: string,
  selectedPaths: string[],
  excludedPaths: string[],
): string | null {
  const parts = path.split('/')
  parts.pop() // remove last segment
  while (parts.length > 0) {
    const ancestor = parts.join('/')
    if (excludedPaths.includes(ancestor)) return null
    if (selectedPaths.includes(ancestor)) {
      return ancestor
    }
    parts.pop()
  }
  return null
}

function removePathAndDescendants(
  path: string,
  selectedPaths: string[],
  excludedPaths: string[],
): void {
  // Remove this path from selectedPaths
  const idx = selectedPaths.indexOf(path)
  if (idx >= 0) {
    selectedPaths.splice(idx, 1)
  }
  // Also remove it from excludedPaths if present
  const idxEx = excludedPaths.indexOf(path)
  if (idxEx >= 0) {
    excludedPaths.splice(idxEx, 1)
  }
  // Remove all children from selectedPaths and excludedPaths if they start with path + '/'
  const prefix = path + '/'
  for (let i = selectedPaths.length - 1; i >= 0; i--) {
    if (selectedPaths[i].startsWith(prefix)) {
      selectedPaths.splice(i, 1)
    }
  }
  for (let i = excludedPaths.length - 1; i >= 0; i--) {
    if (excludedPaths[i].startsWith(prefix)) {
      excludedPaths.splice(i, 1)
    }
  }
}

function removeAllDescendants(
  path: string,
  selectedPaths: string[],
  excludedPaths: string[],
): void {
  const prefix = path + '/'
  for (let i = selectedPaths.length - 1; i >= 0; i--) {
    if (selectedPaths[i] !== path && selectedPaths[i].startsWith(prefix)) {
      selectedPaths.splice(i, 1)
    }
  }
  for (let i = excludedPaths.length - 1; i >= 0; i--) {
    if (excludedPaths[i].startsWith(prefix)) {
      excludedPaths.splice(i, 1)
    }
  }
}

function clearAll(nodes: FileNode[]): FileNode[] {
  return nodes.map(node => {
    const children = node.children ? clearAll(node.children) : []
    return { ...node, selected: false, children }
  })
}
