/*
// <ai_context>
//  Main application component, using MUI for layout.
//  Node-based directory listing integration complete.
//  We fetch the directory from the server on mount.
//  We removed references to lastDirHandle, openDirectory, refreshDirectory, etc.
// */

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
import { useState, useEffect } from 'react'
import { useFileStore } from './store/fileStore'
import DirectoryTree from './components/DirectoryTree'
import InstructionsField from './components/InstructionsField'
import IgnoreInput from './components/IgnoreInput'
import SelectedFilesList from './components/SelectedFilesList'
import CustomInstructionsBar from './components/CustomInstructionsBar'
import GlobalSnackbar from './components/GlobalSnackbar'
import ApplyChangesModal from './components/modals/ApplyChangesModal'
import PromptStoreModal from './components/modals/PromptStoreModal'

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
    loadSelectedFiles,
    fetchDirectoryFromServer,
  } = useFileStore()

  useEffect(() => {
    // On mount, fetch the directory structure from server
    fetchDirectoryFromServer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClearSelection = () => {
    clearSelection()
  }

  const [changesModalOpen, setChangesModalOpen] = useState(false)
  const openChangesModal = () => setChangesModalOpen(true)
  const closeChangesModal = () => setChangesModalOpen(false)

  const [promptStoreModalOpen, setPromptStoreModalOpen] = useState(false)
  const openPromptStoreModal = () => setPromptStoreModalOpen(true)
  const closePromptStoreModal = () => setPromptStoreModalOpen(false)

  const handleAttachFiles = () => {
    loadSelectedFiles()
  }

  return (
    <Wrapper maxWidth={false} disableGutters>
      {/* Top AppBar */}
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
          <Button variant="text" onClick={openPromptStoreModal} color="inherit">
            Prompt Store
          </Button>
          <Tooltip title="Apply code changes (XML)">
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

      {/* Main content area */}
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
        {/* Left Pane (Directory Tree) */}
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
          {/* Directory Structure header (Clear) */}
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
              Project Directory
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

          {/* Tree content */}
          <Box sx={{ flex: 1, position: 'relative', overflowY: 'auto', p: 1 }}>
            {fileTree.length === 0 ? (
              <Typography variant="body2">
                No directory data loaded yet or fetch error.
              </Typography>
            ) : (
              <DirectoryTree />
            )}
          </Box>

          {/* Bottom: Ignore Patterns + Load Button */}
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

        {/* Right Pane */}
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
          {/* Custom Instructions Bar */}
          <CustomInstructionsBar />

          {/* Instructions */}
          <Box>
            <InstructionsField />
          </Box>

          {/* Loaded Files (scrollable) */}
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

      {/* Modal for applying XML changes */}
      <ApplyChangesModal open={changesModalOpen} onClose={closeChangesModal} />

      {/* Modal for Prompt Store */}
      <PromptStoreModal
        open={promptStoreModalOpen}
        onClose={closePromptStoreModal}
      />

      {/* Global Snackbar for success/error messages */}
      <GlobalSnackbar />
    </Wrapper>
  )
}
