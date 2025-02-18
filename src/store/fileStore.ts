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
  },

  async fetchDirectoryFromServer() {
    const fallbackFetch = async () => {
      try {
        const response = await fetch('/api/list-directory')
        const data = await response.json()
        const { tree } = data
        const parsedTree = parseNodes(tree)
        const { selectedPaths } = get()
        const finalTree = applyPersistedSelection(parsedTree, selectedPaths)
        set({ fileTree: finalTree, selectedFiles: gatherSelected(finalTree) })
      } catch (error) {
        console.error('Error in fallback fetch:', error)
      }
    }

    try {
      const eventSource = new EventSource('/api/list-directory')
      eventSource.onmessage = event => {
        const data = JSON.parse(event.data)
        const { tree } = data
        const parsedTree = parseNodes(tree)
        const { selectedPaths } = get()
        const finalTree = applyPersistedSelection(parsedTree, selectedPaths)
        set({ fileTree: finalTree, selectedFiles: gatherSelected(finalTree) })
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
    const { fileTree, selectedPaths } = get()
    const updateSelection = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === path) {
          const newVal = !node.selected
          let newSelectedPaths = [...selectedPaths]
          if (newVal && !newSelectedPaths.includes(node.path)) {
            newSelectedPaths.push(node.path)
          } else if (!newVal) {
            newSelectedPaths = newSelectedPaths.filter(p => p !== node.path)
          }
          if (node.isDirectory && node.children) {
            node.children = toggleChildren(
              node.children,
              newVal,
              newSelectedPaths,
            )
          }
          set({ selectedPaths: newSelectedPaths })
          return { ...node, selected: newVal }
        }
        if (node.children && node.children.length > 0) {
          return { ...node, children: updateSelection(node.children) }
        }
        return node
      })
    }

    const toggleChildren = (
      children: FileNode[],
      newVal: boolean,
      newSelected: string[],
    ): FileNode[] => {
      return children.map(child => {
        if (newVal && !newSelected.includes(child.path)) {
          newSelected.push(child.path)
        } else if (!newVal) {
          newSelected = newSelected.filter(p => p !== child.path)
        }
        if (child.isDirectory && child.children) {
          child.children = toggleChildren(child.children, newVal, newSelected)
        }
        return { ...child, selected: newVal }
      })
    }

    const newTree = updateSelection(fileTree)
    set({ fileTree: newTree, selectedFiles: gatherSelected(newTree) })
  },

  clearSelection() {
    const { fileTree } = get()
    const clearAll = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.children && node.children.length > 0) {
          node.children = clearAll(node.children)
        }
        return { ...node, selected: false }
      })
    }
    const newTree = clearAll(fileTree)
    set({
      fileTree: newTree,
      selectedFiles: [],
      loadedFiles: [],
      selectedPaths: [],
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
): FileNode[] {
  return nodes.map(node => {
    const isNodeSelected = selectedPaths.includes(node.path)
    let newChildren = node.children || []
    if (node.isDirectory && node.children && node.children.length > 0) {
      newChildren = applyPersistedSelection(node.children, selectedPaths)
    }
    return { ...node, selected: isNodeSelected, children: newChildren }
  })
}
