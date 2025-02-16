"use client"
import React from 'react';
import { Box, Typography } from '@mui/material';
import DirectoryTree from '@/src/components/DirectoryTree';
import CustomInstructionsBar from '@/src/components/CustomInstructionsBar';
import InstructionsField from '@/src/components/InstructionsField';
import SelectedFilesList from '@/src/components/SelectedFilesList';
import GlobalSnackbar from '@/src/components/GlobalSnackbar';
import ApplyChangesModal from '@/src/components/modals/ApplyChangesModal';

// Minimal prompt page example. We rely on the theming from the root layout.
// Web FS usage from fileStore is optional here, but typically used in the main page. 
// If needed, we can adapt or remove the top bar from App.tsx in a future PR if duplication arises.

export default function PromptPage() {
  const [showApplyChanges, setShowApplyChanges] = React.useState(false);

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        Next.js Prompt Page
      </Typography>

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
        <Typography variant="body2">Apply Changes Modal Demo:</Typography>
        <button onClick={() => setShowApplyChanges(true)}>Open Modal</button>
      </Box>

      <ApplyChangesModal
        open={showApplyChanges}
        onClose={() => setShowApplyChanges(false)}
      />

      <GlobalSnackbar />
    </Box>
  );
}