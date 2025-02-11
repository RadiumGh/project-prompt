// <ai_context>
//  Primary store for file/directory handling.
//  Using zustand's persist middleware to store relevant data in localStorage,
//  but omitting FileSystemDirectoryHandle (cannot be serialized).
// </ai_context>

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { approximateTokens } from '../utils/tokenHelpers'
import { isIgnored } from '../utils/ignoreHelpers'

interface FileNode {
  name: string
  path: string
  handle: FileSystemFileHandle | FileSystemDirectoryHandle | null
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
  // Stored fields
  fileTree: FileNode[]
  selectedFiles: FileNode[]
  loadedFiles: LoadedFile[]
  ignorePatterns: string
  lastOpenedDirectoryPath: string | null
  persistedSelectedFilePaths: string[]
  includeTreeInPrompt: boolean

  // In-memory only (not persisted)
  lastDirHandle: FileSystemDirectoryHandle | null

  // Actions
  setIgnorePatterns: (value: string) => void
  setIncludeTreeInPrompt: (val: boolean) => void
  openDirectory: () => Promise<void>
  refreshDirectory: () => Promise<void>
  toggleSelection: (path: string, handle: any, isDirectory: boolean) => void
  clearSelection: () => void
  loadSelectedFiles: () => Promise<void>
  addAttachmentFile: (path: string, content: string) => void
  removeAttachmentFile: (filePath: string) => void
}

async function buildFileTree(
  directoryHandle: FileSystemDirectoryHandle,
  currentPath = '',
): Promise<FileNode[]> {
  const items: FileNode[] = []

  for await (const entry of directoryHandle.values()) {
    const path = currentPath ? `${currentPath}/${entry.name}` : entry.name
    if (entry.kind === 'directory') {
      if (entry.name === '.git' || entry.name === 'node_modules') {
        continue
      }
      const children = await buildFileTree(entry, path)
      items.push({
        name: entry.name,
        path,
        handle: entry,
        isDirectory: true,
        selected: false,
        children,
      })
    } else {
      items.push({
        name: entry.name,
        path,
        handle: entry,
        isDirectory: false,
        selected: false,
        children: [],
      })
    }
  }

  items.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1
    if (!a.isDirectory && b.isDirectory) return 1
    return a.name.localeCompare(b.name)
  })

  return items
}

export const useFileStore = create<FileStoreState>()(
  persist(
    (set, get) => ({
      // ============================
      // Persisted State
      // ============================
      fileTree: [],
      selectedFiles: [],
      loadedFiles: [],
      ignorePatterns: '',
      lastOpenedDirectoryPath: null,
      persistedSelectedFilePaths: [],
      includeTreeInPrompt: false,

      // ============================
      // In-memory only
      // ============================
      lastDirHandle: null,

      // ============================
      // Actions
      // ============================
      setIgnorePatterns(value) {
        set({ ignorePatterns: value })
      },

      setIncludeTreeInPrompt(val) {
        set({ includeTreeInPrompt: val })
      },

      async openDirectory() {
        if (!window.showDirectoryPicker) {
          alert('File System Access API is not supported in this browser.')
          return
        }
        try {
          const dirHandle = await window.showDirectoryPicker()
          const tree = await buildFileTree(dirHandle)

          const pPaths = get().persistedSelectedFilePaths
          const reselectTree = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
              const newNode = { ...node }
              if (pPaths.includes(node.path)) {
                newNode.selected = true
              }
              if (node.isDirectory && node.children?.length) {
                newNode.children = reselectTree(node.children)
              }
              return newNode
            })
          }
          const updatedTree = reselectTree(tree)

          const newSelected: FileNode[] = []
          const gatherSelected = (nodes: FileNode[]) => {
            nodes.forEach(n => {
              if (n.selected) {
                newSelected.push(n)
              }
              if (n.isDirectory && n.children?.length) {
                gatherSelected(n.children)
              }
            })
          }
          gatherSelected(updatedTree)

          set({
            fileTree: updatedTree,
            selectedFiles: newSelected,
            loadedFiles: [],
            lastDirHandle: dirHandle,
            lastOpenedDirectoryPath: dirHandle.name || null,
          })
        } catch (err) {
          console.error('Error opening directory:', err)
        }
      },

      async refreshDirectory() {
        const { lastDirHandle } = get()
        if (lastDirHandle) {
          try {
            const tree = await buildFileTree(lastDirHandle)
            const pPaths = get().persistedSelectedFilePaths
            const reselectTree = (nodes: FileNode[]): FileNode[] => {
              return nodes.map(node => {
                const newNode = { ...node }
                if (pPaths.includes(node.path)) {
                  newNode.selected = true
                }
                if (node.isDirectory && node.children?.length) {
                  newNode.children = reselectTree(node.children)
                }
                return newNode
              })
            }
            const updatedTree = reselectTree(tree)
            const newSelected: FileNode[] = []
            const gatherSelected = (nodes: FileNode[]) => {
              nodes.forEach(n => {
                if (n.selected) {
                  newSelected.push(n)
                }
                if (n.isDirectory && n.children?.length) {
                  gatherSelected(n.children)
                }
              })
            }
            gatherSelected(updatedTree)

            set({
              fileTree: updatedTree,
              selectedFiles: newSelected,
              loadedFiles: [],
            })
          } catch (err) {
            console.error('Error refreshing directory:', err)
          }
        }
      },

      toggleSelection(path, handle, isDirectory) {
        const { fileTree, persistedSelectedFilePaths } = get()

        const updateSelection = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.path === path) {
              const newVal = !node.selected
              let newPersisted = [...persistedSelectedFilePaths]
              if (newVal) {
                if (!newPersisted.includes(node.path)) {
                  newPersisted.push(node.path)
                }
              } else {
                newPersisted = newPersisted.filter(p => p !== node.path)
              }
              set({ persistedSelectedFilePaths: newPersisted })

              if (node.isDirectory && node.children?.length) {
                node.children = toggleChildren(
                  node.children,
                  newVal,
                  newPersisted,
                )
              }
              return { ...node, selected: newVal }
            }
            if (node.children?.length) {
              return { ...node, children: updateSelection(node.children) }
            }
            return node
          })
        }

        const toggleChildren = (
          nodes: FileNode[],
          newVal: boolean,
          newPersisted: string[],
        ): FileNode[] => {
          return nodes.map(n => {
            if (newVal) {
              if (!newPersisted.includes(n.path)) {
                newPersisted.push(n.path)
              }
            } else {
              const idx = newPersisted.indexOf(n.path)
              if (idx !== -1) {
                newPersisted.splice(idx, 1)
              }
            }

            if (n.isDirectory && n.children?.length) {
              n.children = toggleChildren(n.children, newVal, newPersisted)
            }
            return { ...n, selected: newVal }
          })
        }

        const newTree = updateSelection(fileTree)
        const allSelected: FileNode[] = []
        const gatherSelected = (nodes: FileNode[]) => {
          nodes.forEach(node => {
            if (node.selected) {
              allSelected.push(node)
            }
            if (node.isDirectory && node.children?.length) {
              gatherSelected(node.children)
            }
          })
        }
        gatherSelected(newTree)

        set({ fileTree: newTree, selectedFiles: allSelected })
      },

      clearSelection() {
        const { fileTree } = get()

        const clearAll = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.children?.length) {
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
          persistedSelectedFilePaths: [],
        })
      },

      async loadSelectedFiles() {
        const { selectedFiles, ignorePatterns } = get()
        const ignoreLines = ignorePatterns.split('\n')
        const loadedFiles: LoadedFile[] = []

        for (const fileNode of selectedFiles) {
          if (fileNode.isDirectory) continue
          const ignored = isIgnored(fileNode.path, ignoreLines)

          if (ignored) continue
          if (!fileNode.handle) continue

          try {
            const fileData = await fileNode.handle.getFile()
            const content = await fileData.text()
            const tokenCount = approximateTokens(content)
            loadedFiles.push({
              path: fileNode.path,
              content,
              tokenCount,
            })
          } catch (err) {
            console.error('Error reading file:', err)
          }
        }

        set({ loadedFiles })
      },
      addAttachmentFile: (path: string, content: string) => {
        const tokenCount = approximateTokens(content)
        const newFile: LoadedFile = {
          path,
          content,
          tokenCount,
        }
        const { loadedFiles } = get()
        set({ loadedFiles: [newFile, ...loadedFiles] })
      },
      removeAttachmentFile: (filePath: string) => {
        const { loadedFiles } = get()
        set({ loadedFiles: loadedFiles.filter(file => file.path !== filePath) })
      },
    }),
    {
      name: 'file-store',
      partialize: state => ({
        fileTree: state.fileTree.map(n => ({
          ...n,
          handle: null,
        })),
        selectedFiles: state.selectedFiles.map(n => ({
          ...n,
          handle: null,
        })),
        loadedFiles: state.loadedFiles,
        ignorePatterns: state.ignorePatterns,
        lastOpenedDirectoryPath: state.lastOpenedDirectoryPath,
        persistedSelectedFilePaths: state.persistedSelectedFilePaths,
        includeTreeInPrompt: state.includeTreeInPrompt,
      }),
    },
  ),
)
