import axios from 'axios'
import { useState } from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  TextField,
  Tooltip,
  Button,
  IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'
import { useFileStore } from '../../store/fileStore'
import { useToastStore } from '../../store/toastStore'
import { useMergeRequestStore } from '../../store/mergeRequestStore'

interface AttachMergeRequestModalProps {
  open: boolean
  onClose: () => void
}

const StyledDialogTitle = styled(DialogTitle)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}))

export default function AttachMergeRequestModal({
  open,
  onClose,
}: AttachMergeRequestModalProps) {
  const {
    mergeRequestLink,
    apiToken,
    apiUrl,
    ignorePatterns,
    setMergeRequestLink,
    setApiToken,
    setApiUrl,
    setIgnorePatterns,
  } = useMergeRequestStore()

  const { showErrorToast } = useToastStore()

  const [isFetching, setIsFetching] = useState(false)
  const addAttachmentFile = useFileStore(state => state.addAttachmentFile)

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = async () => {
    if (!mergeRequestLink || !apiToken) return
    setIsFetching(true)

    try {
      const payload = {
        mrUrl: mergeRequestLink,
        accessToken: apiToken,
        ignorePatterns: ignorePatterns?.split('\n') ?? [],
      }

      const response = await axios.post(mergeRequestLink, payload)
      const data = response.data

      if (data && data.context)
        addAttachmentFile('merge-request-context', data.context)
    } catch (err) {
      console.error('Failed to fetch merge request context:', err)
      showErrorToast('Fetching merge-request Context Failed!')
    } finally {
      setIsFetching(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        Attach Merge Request Context
        <Tooltip title="Close">
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </StyledDialogTitle>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Merge Request Link"
          value={mergeRequestLink}
          onChange={e => setMergeRequestLink(e.target.value)}
          fullWidth
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="But-Wait Api URL"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            fullWidth
          />

          <TextField
            label="GitLab Access Token"
            value={apiToken}
            onChange={e => setApiToken(e.target.value)}
            fullWidth
          />
        </Box>

        <TextField
          label="Ignore Patterns"
          value={ignorePatterns}
          onChange={e => setIgnorePatterns(e.target.value)}
          fullWidth
          multiline
          rows={4}
          placeholder={`Uses glob patterns
              
dist/**
yarn.lock
`}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isFetching || !mergeRequestLink || !apiToken || !apiUrl}
          >
            {isFetching ? 'Fetching' : 'Add'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}
