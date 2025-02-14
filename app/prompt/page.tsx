"use client"

import React from 'react'
import { Box, Typography } from '@mui/material'
// We import a few existing components to show partial functionality:
import DirectoryTree from '@/src/components/DirectoryTree'
import CustomInstructionsBar from '@/src/components/CustomInstructionsBar'
import InstructionsField from '@/src/components/InstructionsField'
import SelectedFilesList from '@/src/components/SelectedFilesList'
import GlobalSnackbar from '@/src/components/GlobalSnackbar'
import ApplyChangesModal from '@/src/components/modals/ApplyChangesModal'

// TODO: We'll unify MUI theming in the Next layout or a custom provider in a future step.
// TODO: For now, we ignore the Web FS usage from fileStore in this minimal page.
// TODO: Possibly add routing or adapt the top bar from App.tsx if needed.

export default function PromptPage() {
  const [showApplyChanges, setShowApplyChanges] = React.useState(false)

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        Next.js Prompt Page
      </Typography>

      {/* Minimal usage of existing components */}
      <CustomInstructionsBar />
      <InstructionsField />

      <Box sx={{ border: 1, borderColor: 'divider', p: 1 }}>
        <Typography variant="subtitle1">Directory Tree (demo)</Typography>
        <DirectoryTree />
      </Box>

      <Box sx={{ border: 1, borderColor: 'divider', p: 1 }}>
        <Typography variant="subtitle1">Loaded Files (demo)</Typography>
        <SelectedFilesList />
      </Box>

      <Box>
        <Typography variant="body2">
          Apply Changes Modal Demo:
        </Typography>
        <button onClick={() => setShowApplyChanges(true)}>Open Modal</button>
      </Box>

      <ApplyChangesModal
        open={showApplyChanges}
        onClose={() => setShowApplyChanges(false)}
      />

      {/* Keep the global snackbar for toast messages */}
      <GlobalSnackbar />
    </Box>
  )
}