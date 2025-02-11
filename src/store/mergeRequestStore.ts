import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MergeRequestStoreState {
  apiUrl: string
  mergeRequestLink: string
  apiToken: string
  ignorePatterns: string
  projectId: string
  setApiUrl: (val: string) => void
  setMergeRequestLink: (val: string) => void
  setApiToken: (val: string) => void
  setIgnorePatterns: (val: string) => void
  setProjectId: (val: string) => void
}

export const useMergeRequestStore = create<MergeRequestStoreState>()(
  persist(
    set => ({
      apiUrl: '',
      mergeRequestLink: '',
      apiToken: '',
      ignorePatterns: '',
      projectId: '',

      setApiUrl: val => {
        set({ apiUrl: val })
      },
      setMergeRequestLink: val => {
        set({ mergeRequestLink: val })
      },
      setApiToken: val => {
        set({ apiToken: val })
      },
      setIgnorePatterns: val => {
        set({ ignorePatterns: val })
      },
      setProjectId: val => {
        set({ projectId: val })
      },
    }),
    {
      name: 'merge-request-store',
    },
  ),
)
