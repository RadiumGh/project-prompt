import { useState } from 'react'
import { Typography, Box, Paper, IconButton } from '@mui/material'
import { LoadedFile, useFileStore } from '../store/fileStore'
import { formatTokenCount } from '../utils/tokenHelpers'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import Modal from './modals/Modal'

export default function SelectedFilesList() {
  const { loadedFiles, removeAttachmentFile } = useFileStore()
  const [viewingFile, setViewingFile] = useState<LoadedFile>()

  const handleViewFile = (file: LoadedFile) => {
    setViewingFile(file)
  }

  const handleDeleteFile = (filePath: string) => {
    removeAttachmentFile(filePath)
  }

  const handleCloseModal = () => {
    setViewingFile(undefined)
  }

  if (loadedFiles.length === 0) {
    return <Typography variant="body2">No files loaded yet.</Typography>
  }

  const totalTokens = loadedFiles.reduce(
    (acc, file) => acc + file.tokenCount,
    0,
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1">Attachments</Typography>
        <Typography variant="body2">
          Total: {formatTokenCount(totalTokens)} tokens
        </Typography>
      </Box>

      {loadedFiles.map(file => (
        <Paper
          key={file.path}
          variant="outlined"
          sx={{
            p: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '&:hover .actionIcons': { visibility: 'visible', opacity: 1 },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {file.path}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              className="actionIcons"
              sx={{
                display: 'flex',
                gap: 1,
                visibility: 'hidden',
                opacity: 0,
                transition: 'opacity 0.3s',
                alignItems: 'center',
              }}
            >
              <IconButton size="small" onClick={() => handleViewFile(file)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => handleDeleteFile(file.path)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {formatTokenCount(file.tokenCount)} tokens
            </Typography>
          </Box>
        </Paper>
      ))}

      {viewingFile && (
        <Modal show={true} onClose={handleCloseModal}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {viewingFile.path}
          </Typography>

          <Box
            sx={{
              maxHeight: '600px',
              overflowY: 'auto',
              backgroundColor: '#2f2f2f',
              padding: 1.5,
              borderRadius: 0.5,
            }}
          >
            <Typography
              variant="body2"
              component="pre"
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {viewingFile.content}
            </Typography>
          </Box>
        </Modal>
      )}
    </Box>
  )
}
