/*
// <ai_context>
//  Main application component, fully using MUI for layout.
//  1) Full height usage
//  2) "CustomInstructionsBar" is placed above "InstructionsField"
//  3) The top bar just has "Project Prompt" and "Apply Changes"
//  4) "Open" but remove "Refresh" from Directory Structure panel
//  5) If we have lastOpenedDirectoryPath, show "Reopen last folder" at top
// */

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  IconButton,
  Tooltip
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
    loadSelectedFiles,
    fileTree,
    selectedFiles,
    openDirectory,
    clearSelection,
    lastDirHandle,
    refreshDirectory,
    lastOpenedDirectoryPath,
  } = useFileStore()

// We no longer refresh directory from the client side.

// The old handleOpenDirectory no longer exists.

  const handleClearSelection = () => {
    clearSelection()
  }

  const [changesModalOpen, setChangesModalOpen] = useState(false)
  const openChangesModal = () => setChangesModalOpen(true)
  const closeChangesModal = () => setChangesModalOpen(false)

  const [promptStoreModalOpen, setPromptStoreModalOpen] = useState(false)
  const openPromptStoreModal = () => setPromptStoreModalOpen(true)
  const closePromptStoreModal = () => setPromptStoreModalOpen(false)

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

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          <Button variant="text" onClick={openPromptStoreModal} color="inherit">
            Prompt Store
          </Button>

          {/* "Apply Changes" button in the AppBar */}
          <Tooltip title="Apply code changes (XML)">
            <span>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SystemUpdateAltIcon />}
                onClick={openChangesModal}
                disabled={!lastDirHandle}
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
          {/* Directory Structure header (Open + Clear) */}
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
              {lastDirHandle ? lastDirHandle.name : 'Directory Structure'}
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

          {/* If we don't have a directory handle, but do have lastOpenedDirectoryPath, show "Reopen last folder" */}
          {!lastDirHandle && lastOpenedDirectoryPath && (
            <Box sx={{ p: 1 }}>
{/* <!-- Removed old Reopen last folder approach. Node-based flow will come in Subtask 2. --> */}
              {/* <Button variant="outlined" onClick={handleOpenDirectory}>
              </Button> */}
            </Box>
          )}

          {/* Tree content (fills remaining space) */}
          <Box sx={{ flex: 1, position: 'relative', overflowY: 'auto', p: 1 }}>
            {fileTree.length === 0 ? (
              <Typography variant="body2">No directory opened yet.</Typography>
            ) : (
              <DirectoryTree />
            )}
            {/* Dark overlay if no directory handle */}
            {!lastDirHandle && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  zIndex: 10,
                }}
              />
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
              onClick={loadSelectedFiles}
              disabled={!lastDirHandle || selectedFiles.length === 0}
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
