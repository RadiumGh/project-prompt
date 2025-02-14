// <ai_context>
//  A sortable item component for a single custom instruction row in the CustomInstructionsModal.
//  Uses useSortable to track drag state, and includes a drag handle icon.
// </ai_context>

import React from 'react'
// TODO: Next rewriting plan: We'll see if DnD can remain purely client side in Next or we handle server updates for order.
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconButton, ListItem, Box } from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import type { CustomInstruction } from '../../store/customInstructionsStore'

interface Props {
  ci: CustomInstruction
  children: React.ReactNode
}

export default function SortableCustomInstructionItem({ ci, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ci.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    backgroundColor: isDragging ? 'action.hover' : 'inherit',
    cursor: 'grab',
  }

  return (
    <ListItem ref={setNodeRef} sx={style} disableGutters secondaryAction={null}>
      {/* Drag handle */}
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          color="inherit"
          sx={{ cursor: 'grab' }}
        >
          <DragIndicatorIcon />
        </IconButton>
      </Box>

      {/* The rest of the item (children, e.g. name + edit icons) */}
      {children}
    </ListItem>
  )
}
