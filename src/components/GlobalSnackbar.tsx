
"use client"
// <ai_context>
//  A global snackbar that listens to the file store's toast state and displays a success/error message.
// </ai_context>

import React from 'react'
// TODO: Next rewriting plan: We'll keep MUI-based snackbars or create a new pattern in Next. SSR might not need it, but we can keep client usage.
import { Snackbar, Alert } from '@mui/material'
import { useToastStore } from '../store/toastStore'

export default function GlobalSnackbar() {
  const { toastOpen, toastMessage, toastSeverity, clearToast } = useToastStore()

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    clearToast()
  }

  return (
    <Snackbar
      open={toastOpen}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={toastSeverity} sx={{ width: '100%' }}>
        {toastMessage}
      </Alert>
    </Snackbar>
  )
}
