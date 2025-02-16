"use client"
import React from 'react'
import { Snackbar, Alert } from '@mui/material'
import { useToastStore } from '../store/toastStore'

export default function GlobalSnackbar() {
  const { toastOpen, toastMessage, toastSeverity, clearToast } = useToastStore();

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    clearToast();
  };

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
  );
}