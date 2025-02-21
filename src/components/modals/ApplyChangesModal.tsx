'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  IconButton,
  TextField,
  Button,
  Tooltip,
  Typography,
  Box,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'
import { useToastStore } from '../../store/toastStore'
import axios from 'axios'

interface Props {
  open: boolean
  onClose: () => void
}

const exampleJson = `{
  "version": 1,
  "changes": [
    {
      "type": "create",
      "path": "docs/intro.md",
      "content": [
        "# Introduction",
        "This is a short intro file."
      ]
    },
    {
      "type": "delete",
      "path": "src/unused-module.js"
    }
  ]
}`

const StyledDialogTitle = styled(DialogTitle)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}))

const ModalContent = styled(Box)(() => ({
  paddingLeft: 24,
  paddingRight: 24,
  paddingBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  minHeight: 400,
}))

export default function ApplyChangesModal({ open, onClose }: Props) {
  const { showSuccessToast, showErrorToast } = useToastStore()

  const [jsonText, setJsonText] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  const handleClose = () => {
    onClose()
  }

  const handleApply = async () => {
    setIsApplying(true)
    try {
      // All changes are handled by the Next.js server route /api/apply-json-changes
      const response = await axios.post(
        '/api/apply-json-changes',
        JSON.parse(jsonText),
        {
          headers: {
            // Minimal example of sending a Bearer token for our new credential check:
            Authorization: 'Bearer FAKE-TOKEN',
          },
        },
      )

      if (response.status === 200 && response.data?.status === 'ok') {
        showSuccessToast('All changes applied successfully!')
        onClose()
      } else {
        console.error('Error applying changes:', response.data)
        showErrorToast('Error applying changes!')
      }
    } catch (error) {
      console.error('Error applying changes:', error)
      showErrorToast('Error applying changes!')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <StyledDialogTitle>
        Apply Code Changes in JSON Format
        <Tooltip title="Close">
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </StyledDialogTitle>

      <ModalContent>
        <Typography variant="body2">Paste or edit your JSON below:</Typography>

        <TextField
          label="JSON Code Changes"
          multiline
          rows={12}
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          placeholder={exampleJson}
          variant="outlined"
          fullWidth
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 1,
            gap: 1.5,
          }}
        >
          <Tooltip title="Apply the changes to your open directory">
            <span>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApply}
                disabled={isApplying}
              >
                {isApplying ? 'Applying...' : 'Apply Changes'}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </ModalContent>
    </Dialog>
  )
}
