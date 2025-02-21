#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

if (process.argv[2] !== 'run' || !process.argv[3]) {
  console.error('Usage: pjp run <project-root>')
  process.exit(1)
}

const projectRoot = path.resolve(process.argv[3])

// Set the base directory for file operations (used in API routes)
process.env.PJP_PROJECT_ROOT = projectRoot

console.log(`Starting Project Prompt with project root: ${projectRoot}`)

// Determine the project-prompt project root (directory of this cli.js)
const projectPromptRoot = path.dirname(__filename)

// Check if a production build exists (.next directory exists)
const nextBuildDir = path.join(projectPromptRoot, '.next')
const nextCmd = fs.existsSync(nextBuildDir) ? 'start' : 'dev'

const child = spawn('npx', ['next', nextCmd], {
  cwd: projectPromptRoot,
  env: process.env,
  stdio: 'inherit',
})

child.on('close', code => process.exit(code))
