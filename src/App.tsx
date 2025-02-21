import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import DownloadIcon from '@mui/icons-material/Download'
import ClearIcon from '@mui/icons-material/Clear'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import { useState, useEffect, useRef } from 'react'
import { useFileStore } from './store/fileStore'
import DirectoryTree from './components/DirectoryTree'
import InstructionsField from './components/InstructionsField'
import IgnoreInput from './components/IgnoreInput'
import SelectedFilesList from './components/SelectedFilesList'
import CustomInstructionsBar from './components/CustomInstructionsBar'
import GlobalSnackbar from './components/GlobalSnackbar'
import ApplyChangesModal from './components/modals/ApplyChangesModal'
import PromptStoreModal from './components/modals/PromptStoreModal'
import { useInstructionsStore } from './store/instructionsStore'
import { useCustomInstructionsStore } from './store/customInstructionsStore'
import { useThemeStore } from './store/themeStore'

const Wrapper = styled(Container)(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}))

export default function App() {
  const {
    fileTree,
    selectedFiles,
    clearSelection,
    ignorePatterns,
    excludedPaths,
    loadSelectedFiles,
    fetchDirectoryFromServer,
    selectedPaths,
    includeTreeInPrompt,
    rootDirName,
  } = useFileStore()
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false)

  const { instructions, setStateFromConfig: setInstructionsConfig } =
    useInstructionsStore()
  const { customInstructions, setStateFromConfig: setCustomConfig } =
    useCustomInstructionsStore()
  const { themeMode, setStateFromConfig: setThemeConfig } = useThemeStore()

  const [changesModalOpen, setChangesModalOpen] = useState(false)
  const [promptStoreModalOpen, setPromptStoreModalOpen] = useState(false)

  const openChangesModal = () => setChangesModalOpen(true)
  const closeChangesModal = () => setChangesModalOpen(false)

  const closePromptStoreModal = () => setPromptStoreModalOpen(false)

  const handleClearSelection = () => {
    clearSelection()
  }

  const handleAttachFiles = () => {
    loadSelectedFiles()
  }

  // Load config on mount
  useEffect(() => {
    ;(async () => {
      try {
        const resp = await fetch('/api/pjp-config')
        console.log('data:', resp)
        if (resp.ok) {
          const data = await resp.json()
          setInstructionsConfig(data)
          setCustomConfig(data)

          useFileStore.getState().setStateFromConfig(data)
          setThemeConfig(data)

          fetchDirectoryFromServer()
        }
      } catch (e) {
        console.error('Failed to load pjp-config:', e)
      } finally {
        setHasLoadedConfig(true)
      }
    })()
  }, [
    setInstructionsConfig,
    setCustomConfig,
    setThemeConfig,
    fetchDirectoryFromServer,
  ])

  // Track all config changes and post them to server.
  const prevConfigRef = useRef<any>(null)
  useEffect(() => {
    if (!hasLoadedConfig) return

    const config = {
      instructions,
      customInstructions,
      selectedPaths,
      excludedPaths,
      ignorePatterns,
      includeTreeInPrompt,
      themeMode,
      hasLoadedConfig,
    }

    const prevConfig = prevConfigRef.current
    prevConfigRef.current = config

    if (JSON.stringify(prevConfig) !== JSON.stringify(config)) {
      ;(async () => {
        try {
          await fetch('/api/pjp-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
          })
        } catch (e) {
          console.error('Failed to save pjp-config:', e)
        }
      })()
    }
  }, [
    hasLoadedConfig,
    instructions,
    customInstructions,
    selectedPaths,
    ignorePatterns,
    includeTreeInPrompt,
    themeMode,
  ])

  return (
    <Wrapper maxWidth={false} disableGutters>
      <AppBar
        position="static"
        elevation={0}
        sx={{ borderBottom: 'none', p: 0 }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: 2,
            minHeight: '44px',
          }}
        >
          <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
            Project Prompt
          </Typography>

          <Box sx={{ flex: 1 }} />
          {/* <Button variant="text" onClick={openPromptStoreModal} color="inherit">
            Prompt Store
          </Button> */}
          <Tooltip title="Apply code changes">
            <span>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SystemUpdateAltIcon />}
                onClick={openChangesModal}
              >
                Apply Changes
              </Button>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          p: 2,
          gap: 2,
          height: 'calc(100% - 64px)',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              borderBottom: 1,
              borderColor: 'divider',
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {rootDirName}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Clear selection">
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={handleClearSelection}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ flex: 1, position: 'relative', overflowY: 'auto', p: 1 }}>
            {fileTree.length === 0 ? (
              <Typography variant="body2">
                No directory data loaded yet or fetch error.
              </Typography>
            ) : (
              <DirectoryTree />
            )}
          </Box>

          <Box
            sx={{
              borderTop: 1,
              borderColor: 'divider',
              p: 1,
              display: 'flex',
              gap: 1,
            }}
          >
            <IgnoreInput />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleAttachFiles}
              disabled={selectedFiles.length === 0}
            >
              Attach Files
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 2,
            display: 'flex',
            flexDirection: 'column',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            gap: 2,
            overflow: 'hidden',
          }}
        >
          <CustomInstructionsBar />
          <Box>
            <InstructionsField />
          </Box>
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 1,
              minHeight: 0,
            }}
          >
            <SelectedFilesList />
          </Box>
        </Box>
      </Box>

      <ApplyChangesModal open={changesModalOpen} onClose={closeChangesModal} />
      <PromptStoreModal
        open={promptStoreModalOpen}
        onClose={closePromptStoreModal}
      />
      <GlobalSnackbar />
    </Wrapper>
  )
}
