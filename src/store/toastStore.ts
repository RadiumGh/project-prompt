
// <ai_context>
//  Manages global snackbars / toasts for success or error messages.
// </ai_context>

import { create } from 'zustand'
// TODO: Next rewriting plan: We can keep client snackbars or incorporate a universal solution for server error messages. Keep old logic for now.
import { persist } from 'zustand/middleware'
import { AlertColor } from '@mui/material'

interface ToastStoreState {
  toastOpen: boolean
  toastMessage: string
  toastSeverity: AlertColor
  showSuccessToast: (message: string) => void
  showErrorToast: (message: string) => void
  clearToast: () => void
}

export const useToastStore = create<ToastStoreState>()(
  persist(
    (set) => ({
      toastOpen: false,
      toastMessage: '',
      toastSeverity: 'success',

      showSuccessToast(message) {
        set({
          toastOpen: true,
          toastMessage: message,
          toastSeverity: 'success'
        })
      },
      showErrorToast(message) {
        set({
          toastOpen: true,
          toastMessage: message,
          toastSeverity: 'error'
        })
      },
      clearToast() {
        set({ toastOpen: false, toastMessage: '' })
      }
    }),
    {
      name: 'toast-store'
    }
  )
)
