"use client"
import React from 'react'
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
}));

const CloseButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: 8,
  top: 8
}));

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
  );
}