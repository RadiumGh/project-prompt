// <ai_context>
// Primary store for file/directory handling, fully Node-based now.
// </ai_context>

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { approximateTokens } from '../utils/tokenHelpers'
import { isIgnored } from '../utils/ignoreHelpers'

interface FileNode {
  name: string
  path: string
  handle?: any // We no longer use this, leaving optional for typed compliance
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
  lastOpenedDirectoryPath: string | null // Optional leftover reference, but not used for logic now
  persistedSelectedFilePaths: string[]
  includeTreeInPrompt: boolean

  setIgnorePatterns: (value: string) => void
  setIncludeTreeInPrompt: (val: boolean) => void

  // Directory fetching from server
  fetchDirectoryFromServer: () => Promise<void>

  // Selections and loading
  toggleSelection: (path: string, handle: any, isDirectory: boolean) => void
  clearSelection: () => void
  loadSelectedFiles: () => Promise<void>
  addAttachmentFile: (path: string, content: string) => void
  removeAttachmentFile: (filePath: string) => void
}

export const useFileStore = create<FileStoreState>()(
  persist(
    (set, get) => {
      // Helper functions
      function parseNodes(nodes: any[]): FileNode[] {
        return nodes.map(n => ({
          name: n.name,
          path: n.path,
          isDirectory: n.isDirectory,
          selected: false,
          children: n.isDirectory && n.children ? parseNodes(n.children) : [],
        }))
      }

      function applyPersistedSelection(
        nodes: FileNode[],
        selectedPaths: string[],
        parentSelected = false,
      ): FileNode[] {
        return nodes.map(node => {
          const isNodeSelected =
            parentSelected || selectedPaths.includes(node.path)
          let newChildren = node.children || []
          if (node.isDirectory && node.children && node.children.length > 0) {
            newChildren = applyPersistedSelection(
              node.children,
              selectedPaths,
              isNodeSelected,
            )
          }
          return { ...node, selected: isNodeSelected, children: newChildren }
        })
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

      // Helper function for fallback fetch
      async function fallbackFetch() {
        try {
          const response = await fetch('/api/list-directory')
          const data = await response.json()
          const { tree } = data

          // Parse and update the tree with current selections
          const parsedTree = parseNodes(tree)
          const treeWithSelection = applyPersistedSelection(
            parsedTree,
            get().persistedSelectedFilePaths,
          )

          set({
            fileTree: treeWithSelection,
            selectedFiles: gatherSelected(treeWithSelection),
          })
        } catch (error) {
          console.error('Error in fallback fetch:', error)
        }
      }

      return {
        fileTree: [],
        selectedFiles: [],
        loadedFiles: [],
        ignorePatterns: '',
        lastOpenedDirectoryPath: null,
        persistedSelectedFilePaths: [],
        includeTreeInPrompt: true,

        setIgnorePatterns(value) {
          set({ ignorePatterns: value })
        },

        setIncludeTreeInPrompt(val) {
          set({ includeTreeInPrompt: val })
        },

        async fetchDirectoryFromServer() {
          try {
            // Set up SSE connection for real-time updates
            const eventSource = new EventSource('/api/list-directory')

            eventSource.onmessage = event => {
              const data = JSON.parse(event.data)
              const { tree } = data

              // Parse and update the tree with current selections
              const parsedTree = parseNodes(tree)
              const treeWithSelection = applyPersistedSelection(
                parsedTree,
                get().persistedSelectedFilePaths,
              )

              set({
                fileTree: treeWithSelection,
                selectedFiles: gatherSelected(treeWithSelection),
              })
            }

            eventSource.onerror = () => {
              console.error('SSE connection error')
              eventSource.close()
              // Fallback to regular fetch on error
              fallbackFetch()
            }
          } catch (error) {
            console.error('Error fetching directory:', error)
            // Fallback to regular fetch
            fallbackFetch()
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

            const loadedFiles: LoadedFile[] = serverFiles.map((f: any) => ({
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

        addAttachmentFile(path: string, content: string) {
          const tokenCount = approximateTokens(content)
          const newFile: LoadedFile = { path, content, tokenCount }
          const { loadedFiles } = get()
          set({ loadedFiles: [newFile, ...loadedFiles] })
        },

        removeAttachmentFile(filePath: string) {
          const { loadedFiles } = get()
          set({
            loadedFiles: loadedFiles.filter(file => file.path !== filePath),
          })
        },
      }
    },
    {
      name: 'file-store',
      partialize: state => ({
        persistedSelectedFilePaths: state.persistedSelectedFilePaths,
        ignorePatterns: state.ignorePatterns,
        includeTreeInPrompt: state.includeTreeInPrompt,
      }),
    },
  ),
)
