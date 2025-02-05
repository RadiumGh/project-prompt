import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MergeRequestStoreState {
  apiUrl: string
  mergeRequestLink: string
  apiToken: string
  ignorePatterns: string
  setApiUrl: (val: string) => void
  setMergeRequestLink: (val: string) => void
  setApiToken: (val: string) => void
  setIgnorePatterns: (val: string) => void
}

export const useMergeRequestStore = create<MergeRequestStoreState>()(
  persist(
    set => ({
      apiUrl: '',
      mergeRequestLink: '',
      apiToken: '',
      ignorePatterns: '',

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
    }),
    {
      name: 'merge-request-store',
    },
  ),
)
