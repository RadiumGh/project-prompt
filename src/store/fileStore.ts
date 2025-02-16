// <ai_context>
// Primary store for file/directory handling.
// We have removed all browser-based FS references in this subtask.
// </ai_context>

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { approximateTokens } from '../utils/tokenHelpers';
import { isIgnored } from '../utils/ignoreHelpers';

interface FileNode {
  name: string;
  path: string;
  handle: any; // No longer used for browser FS
  isDirectory: boolean;
  selected: boolean;
  children?: FileNode[];
}

export interface LoadedFile {
  path: string;
  content: string;
  tokenCount: number;
}

interface FileStoreState {
  // Kept from the old structure, but some fields are effectively no-ops now.
  fileTree: FileNode[];
  selectedFiles: FileNode[];
  loadedFiles: LoadedFile[];
  ignorePatterns: string;
  lastOpenedDirectoryPath: string | null;
  persistedSelectedFilePaths: string[];
  includeTreeInPrompt: boolean,

  // No more direct directory handle usage
  // lastDirHandle: FileSystemDirectoryHandle | null,
  lastDirHandle: null,

  // Actions
  setIgnorePatterns: (value: string) => void;
  setIncludeTreeInPrompt: (val: boolean) => void;

  // We remove the openDirectory/refreshDirectory methods that used browser FS.

  toggleSelection: (path: string, handle: any, isDirectory: boolean) => void;
  clearSelection: () => void;
  loadSelectedFiles: () => Promise<void>;
  addAttachmentFile: (path: string, content: string) => void;
  removeAttachmentFile: (filePath: string) => void;
}

export const useFileStore = create<FileStoreState>()(
  persist(
    (set, get) => ({
      fileTree: [],
      selectedFiles: [],
      loadedFiles: [],
      ignorePatterns: '',
      lastOpenedDirectoryPath: null,
      persistedSelectedFilePaths: [],
      includeTreeInPrompt: false,
      lastDirHandle: null,

      setIgnorePatterns(value) {
        set({ ignorePatterns: value });
      },

      setIncludeTreeInPrompt(val) {
        set({ includeTreeInPrompt: val });
      },

      // toggleSelection is now a local operation, with no actual FS handle usage.
      toggleSelection(path, handle, isDirectory) {
        const { fileTree, persistedSelectedFilePaths } = get();

        const updateSelection = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.path === path) {
              const newVal = !node.selected;
              let newPersisted = [...persistedSelectedFilePaths];
              if (newVal) {
                if (!newPersisted.includes(node.path)) {
                  newPersisted.push(node.path);
                }
              } else {
                newPersisted = newPersisted.filter(p => p !== node.path);
              }
              set({ persistedSelectedFilePaths: newPersisted });

              if (node.isDirectory && node.children?.length) {
                node.children = toggleChildren(node.children, newVal, newPersisted);
              }
              return { ...node, selected: newVal };
            }
            if (node.children?.length) {
              return { ...node, children: updateSelection(node.children) };
            }
            return node;
          });
        };

        const toggleChildren = (
          nodes: FileNode[],
          newVal: boolean,
          newPersisted: string[]
        ): FileNode[] => {
          return nodes.map(n => {
            if (newVal) {
              if (!newPersisted.includes(n.path)) {
                newPersisted.push(n.path);
              }
            } else {
              const idx = newPersisted.indexOf(n.path);
              if (idx !== -1) {
                newPersisted.splice(idx, 1);
              }
            }

            if (n.isDirectory && n.children?.length) {
              n.children = toggleChildren(n.children, newVal, newPersisted);
            }
            return { ...n, selected: newVal };
          });
        };

        const newTree = updateSelection(fileTree);
        const allSelected: FileNode[] = [];

        const gatherSelected = (nodes: FileNode[]) => {
          nodes.forEach(node => {
            if (node.selected) {
              allSelected.push(node);
            }
            if (node.isDirectory && node.children?.length) {
              gatherSelected(node.children);
            }
          });
        };
        gatherSelected(newTree);

        set({ fileTree: newTree, selectedFiles: allSelected });
      },

      clearSelection() {
        const { fileTree } = get();

        const clearAll = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.children?.length) {
              node.children = clearAll(node.children);
            }
            return { ...node, selected: false };
          });
        };
        const newTree = clearAll(fileTree);

        set({
          fileTree: newTree,
          selectedFiles: [],
          loadedFiles: [],
          persistedSelectedFilePaths: [],
        });
      },

      async loadSelectedFiles() {
        // This is now a no-op or pseudo-op for now, since we removed direct FS usage.
        // In future subtasks, we will fetch file contents from a Node-based route.

        const { selectedFiles, ignorePatterns } = get();
        const ignoreLines = ignorePatterns.split('\n');
        const loadedFiles: LoadedFile[] = [];

        // Nothing to do here yet, but we keep this function so the UI doesn’t break.

        set({ loadedFiles });
      },

      addAttachmentFile(path: string, content: string) {
        const tokenCount = approximateTokens(content);
        const newFile: LoadedFile = { path, content, tokenCount };
        const { loadedFiles } = get();
        set({ loadedFiles: [newFile, ...loadedFiles] });
      },

      removeAttachmentFile(filePath: string) {
        const { loadedFiles } = get();
        set({ loadedFiles: loadedFiles.filter(file => file.path !== filePath) });
      },
    }),
    {
      name: 'file-store',
      partialize: state => ({
        // We still store the fileTree, but handles are no longer relevant.
        fileTree: state.fileTree.map(n => ({ ...n, handle: null })),
        selectedFiles: state.selectedFiles.map(n => ({ ...n, handle: null })),
        loadedFiles: state.loadedFiles,
        ignorePatterns: state.ignorePatterns,
        lastOpenedDirectoryPath: state.lastOpenedDirectoryPath,
        persistedSelectedFilePaths: state.persistedSelectedFilePaths,
        includeTreeInPrompt: state.includeTreeInPrompt,
      }),
    }
  ),
);