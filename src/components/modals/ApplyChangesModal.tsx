// <ai_context>
//  A modal for applying XML-based code changes to the opened directory.
//  Contains a text area with example XML structure and a button to apply changes.
// </ai_context>

import { useState } from 'react'
// TODO: Next rewriting plan: This will shift from client-side FS API to our new Next.js route (server-side applyJsonChanges).
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
import { useFileStore } from '../../store/fileStore'
import { useToastStore } from '../../store/toastStore'
import { applyJsonChanges } from '../../utils/apply-json-changes.ts'
import { runApplyJsonChangesBDDTests } from '../../utils/apply-json-changes-tests.ts'

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
  const { lastDirHandle } = useFileStore()
  const { showSuccessToast, showErrorToast } = useToastStore()

  const [jsonText, setJsonText] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [isRunningTests, setIsRunningTests] = useState(false)

  const handleClose = () => {
    onClose()
  }

  const handleApply = async () => {
    if (!lastDirHandle) {
      showErrorToast('No directory open.')
      return
    }
    setIsApplying(true)

    try {
      await applyJsonChanges(JSON.parse(jsonText), lastDirHandle)
      showSuccessToast('All changes applied successfully!')
      onClose()
    } catch (error) {
      console.error('Error applying changes:', error)
      showErrorToast('Error applying changes!')
    } finally {
      setIsApplying(false)
    }
  }

  const handleRunTests = async () => {
    if (!lastDirHandle) {
      showErrorToast('No directory open.')
      return
    }

    setIsRunningTests(true)
    try {
      await runApplyJsonChangesBDDTests(lastDirHandle)
      showSuccessToast(
        'All tests run successfully!, Check console for more information',
      )

      onClose()
    } catch (error) {
      console.error('Error running tests:', error)
      showErrorToast('Error running tests!')
    } finally {
      setIsRunningTests(false)
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
          <Tooltip title="Run test cases relevant to code changes JSON format; All Changes will be applied into 'test' directory!">
            <span>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleRunTests}
                disabled={isRunningTests || !lastDirHandle}
              >
                {isRunningTests ? 'Running...' : 'Run Tests'}
              </Button>
            </span>
          </Tooltip>

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
