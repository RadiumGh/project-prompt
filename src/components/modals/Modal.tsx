
"use client"
// <ai_context>
//  A simple modal component that renders its children when "show" is true.
// </ai_context>

import React from 'react'
// TODO: Next rewriting plan: We can keep MUI <Dialog> or unify with Next's built-in features, though it’s typically client side.
import { Dialog, IconButton, Tooltip, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'

interface ModalProps {
  show: boolean
  onClose: () => void
  children?: React.ReactNode
}

const ModalContainer = styled(Box)(() => ({
  position: 'relative',
  padding: 16,
  minHeight: '400px'
}))

const CloseButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: 8,
  top: 8
}))

export default function Modal({ show, onClose, children }: ModalProps) {
  return (
    <Dialog open={show} onClose={onClose} maxWidth="md" fullWidth>
      <ModalContainer>
        <Tooltip title="Close">
          <CloseButton aria-label="close" onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </Tooltip>
        {children}
      </ModalContainer>
    </Dialog>
  )
}
