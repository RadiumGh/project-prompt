"use client"
import { useState } from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItemText,
  TextField,
  Button,
  Stack,
  Typography,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { styled } from '@mui/material/styles'
import { useCustomInstructionsStore } from '../../store/customInstructionsStore'
import { approximateTokens, formatTokenCount } from '../../utils/tokenHelpers'

// DnD Kit
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

// We create a small SortableItem to handle individual list items
import SortableCustomInstructionItem from './SortableCustomInstructionItem'

interface Props {
  open: boolean
  onClose: () => void
}

const StyledDialogTitle = styled(DialogTitle)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const ModalContent = styled(Box)(() => ({
  paddingLeft: 24,
  paddingRight: 24,
  paddingBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  minHeight: '400px',
  maxHeight: '70vh',
}));

export default function CustomInstructionsModal({ open, onClose }: Props) {
  const {
    customInstructions,
    addCustomInstruction,
    updateCustomInstruction,
    removeCustomInstruction,
    toggleCustomInstruction,
    reorderCustomInstructions,
  } = useCustomInstructionsStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState('');
  const [contentValue, setContentValue] = useState('');

  // We can store the item being dragged
  const [_, setActiveDragId] = useState<string | null>(null);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setNameValue('');
    setContentValue('');
  };

  const handleSubmit = () => {
    if (!nameValue.trim() || !contentValue.trim()) return;

    if (isEditing && editId) {
      updateCustomInstruction(editId, nameValue, contentValue);
    } else {
      addCustomInstruction(nameValue, contentValue);
    }
    resetForm();
  };

  const handleEdit = (id: string, name: string, content: string) => {
    setIsEditing(true);
    setEditId(id);
    setNameValue(name);
    setContentValue(content);
  };

  const handleDelete = (id: string) => {
    removeCustomInstruction(id);
  };

  // DnD Kit sensors
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    // Find oldIndex, newIndex
    const oldIndex = customInstructions.findIndex(ci => ci.id === active.id);
    const newIndex = customInstructions.findIndex(ci => ci.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderCustomInstructions(oldIndex, newIndex);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <StyledDialogTitle>
        Manage Custom Instructions
        <Tooltip title="Close">
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </StyledDialogTitle>

      <ModalContent>
        {/* Existing Instructions with DnD */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 0,
          }}
        >
          {customInstructions.length === 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              No custom instructions yet.
            </Typography>
          )}
          {customInstructions.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={customInstructions.map(ci => ci.id)}
                strategy={verticalListSortingStrategy}
              >
                <List dense sx={{ px: 2 }}>
                  {customInstructions.map(ci => {
                    const tokenCount = approximateTokens(ci.content);
                    const displayName = `${ci.name} (${formatTokenCount(tokenCount)} T)`;

                    return (
                      <SortableCustomInstructionItem key={ci.id} ci={ci}>
                        <ListItemText
                          primary={displayName}
                          secondary={
                            ci.content.length > 50
                              ? ci.content.slice(0, 50) + '...'
                              : ci.content
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Edit instruction">
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() =>
                                handleEdit(ci.id, ci.name, ci.content)
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete instruction">
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDelete(ci.id)}
                              color="error"
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </SortableCustomInstructionItem>
                    );
                  })}
                </List>
              </SortableContext>
            </DndContext>
          )}
        </Box>

        {/* Create/Edit Form */}
        <Stack direction="column" gap={1}>
          <TextField
            label="Instruction Name"
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            variant="outlined"
            size="small"
          />
          <TextField
            label="Instruction Content"
            value={contentValue}
            onChange={e => setContentValue(e.target.value)}
            variant="outlined"
            multiline
            rows={8}
          />
          <Button variant="contained" onClick={handleSubmit}>
            {isEditing ? 'Update Instruction' : 'Add Instruction'}
          </Button>
        </Stack>
      </ModalContent>
    </Dialog>
  );
}