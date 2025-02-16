"use client"
import { Dialog, DialogTitle, Typography, Box, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'

interface Props {
  open: boolean
  onClose: () => void
}

const StyledDialogTitle = styled(DialogTitle)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

export default function PromptStoreModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <StyledDialogTitle>
        Prompt Store
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <Box
        sx={{
          padding: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 500,
        }}
      >
        <Typography variant="h6" component="div">
          Coming Soon...
        </Typography>
      </Box>
    </Dialog>
  );
}