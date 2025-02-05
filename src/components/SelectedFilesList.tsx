// <ai_context>
//  Displays the loaded files and their token counts in a scrollable list.
// </ai_context>

import { Typography, Box, Paper } from '@mui/material'
import { useFileStore } from '../store/fileStore'
import { formatTokenCount } from '../utils/tokenHelpers'

export default function SelectedFilesList() {
  const { loadedFiles } = useFileStore()

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
          sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {file.path}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {formatTokenCount(file.tokenCount)} tokens
          </Typography>
        </Paper>
      ))}
    </Box>
  )
}
