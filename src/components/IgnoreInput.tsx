"use client"
// <ai_context>
//  A text area for ignore patterns (like .gitignore). Each line is a substring to exclude files/folders.
// </ai_context>

import React from 'react'
// TODO: Next rewriting plan: Possibly integrate server-based ignore patterns. Keep old client logic for reference.
import { TextField } from '@mui/material'
import { useFileStore } from '../store/fileStore'

export default function IgnoreInput() {
  const { ignorePatterns, setIgnorePatterns } = useFileStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIgnorePatterns(e.target.value)
  }

  return (
    <TextField
      label="Ignore Patterns"
      fullWidth
      multiline
      rows={4}
      value={ignorePatterns}
      onChange={handleChange}
      placeholder={`Uses glob patterns
      
dist/**
yarn.lock
`}
      variant="outlined"
    />
  )
}
