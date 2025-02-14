// <ai_context>
//  Displays the final combined prompt: instructions + loaded files + active custom instructions
//  plus a copy button. We retrieve instructions and custom instructions from their stores,
//  and the loaded files from the file store.
// </ai_context>

import { useState } from 'react'
// TODO: Next rewriting plan: Possibly generate final prompt on server side (for token counting) or keep client approach.
import { TextField, Typography, Box, Button } from '@mui/material'
import { useInstructionsStore } from '../store/instructionsStore'
import { useFileStore } from '../store/fileStore'
import { useCustomInstructionsStore } from '../store/customInstructionsStore'
import { formatTokenCount } from '../utils/tokenHelpers'

export default function PromptGenerator() {
  const { getFinalPrompt, getFinalPromptTokens } = useInstructionsStore()
  const { loadedFiles, includeTreeInPrompt } = useFileStore()
  const { customInstructions } = useCustomInstructionsStore()

  const activeCustoms = customInstructions.filter(ci => ci.isActive)

  const promptValue = getFinalPrompt(
    loadedFiles,
    activeCustoms,
    includeTreeInPrompt,
  )
  const totalTokens = getFinalPromptTokens(
    loadedFiles,
    activeCustoms,
    includeTreeInPrompt,
  )

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy prompt:', error)
    }
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Total tokens: {formatTokenCount(totalTokens)}
        </Typography>
        <Button variant="contained" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </Box>

      <TextField
        multiline
        rows={13}
        fullWidth
        variant="outlined"
        value={promptValue}
        InputProps={{
          readOnly: true,
        }}
      />
    </Box>
  )
}
