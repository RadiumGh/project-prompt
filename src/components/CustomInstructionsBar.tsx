"use client"
import { useState } from 'react'
import { Box, Tooltip, Typography, IconButton, Paper, Stack } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { useCustomInstructionsStore } from '../store/customInstructionsStore'
import CustomInstructionsModal from './modals/CustomInstructionsModal'
import { approximateTokens, formatTokenCount } from '../utils/tokenHelpers'

export default function CustomInstructionsBar() {
  const { customInstructions, toggleCustomInstruction } = useCustomInstructionsStore();
  const [modalOpen, setModalOpen] = useState(false);

  const handleToggle = (id: string) => {
    toggleCustomInstruction(id);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ mb: 1 }}
    >
      {/* Scrollable instructions (flexGrow:1) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          gap: 1,
          flexGrow: 1
        }}
      >
        {customInstructions.map(ci => {
          const truncated =
            ci.content.length > 60 ? ci.content.slice(0, 60) + '...' : ci.content;
          const tokenCount = approximateTokens(ci.content);
          const label = `${ci.name} (${formatTokenCount(tokenCount)} T)`;

          return (
            <Tooltip key={ci.id} title={truncated}>
              <Paper
                variant="outlined"
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  backgroundColor: ci.isActive ? 'primary.light' : 'inherit',
                  minWidth: 'max-content'
                }}
                onClick={() => handleToggle(ci.id)}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 400,
                    color: ci.isActive ? '#000' : 'inherit',
                    fontSize: 12
                  }}
                >
                  {label}
                </Typography>
              </Paper>
            </Tooltip>
          );
        })}
      </Box>

      {/* Manage instructions (Settings) */}
      <Tooltip title="Manage Custom Instructions">
        <IconButton
          onClick={handleOpenModal}
          size="small"
          color="inherit"
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <CustomInstructionsModal open={modalOpen} onClose={handleCloseModal} />
    </Stack>
  );
}