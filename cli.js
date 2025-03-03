#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')
const net = require('net')

// Parse arguments
const args = process.argv.slice(2)
const command = args[0]

// Add a process exit handler to ensure cleanup
let childProcess = null
process.on('exit', () => {
  if (childProcess) {
    try {
      childProcess.kill('SIGTERM')
    } catch (e) {
      // Ignore errors during cleanup
    }
  }
})

// Parse options - Extract port option if provided
let port = 3000 // Default port
let projectRootArg = 1 // Default position of project root argument
let userSpecifiedPort = false // Track if user manually specified a port

// Check for port option (--port or -p)
for (let i = 1; i < args.length; i++) {
  if ((args[i] === '--port' || args[i] === '-p') && args[i+1] && !isNaN(parseInt(args[i+1]))) {
    port = parseInt(args[i+1])
    userSpecifiedPort = true
    // Adjust project root position if port option appears before it
    if (i === 1) {
      projectRootArg = 3
    }
    break
  }
}

// Get project-prompt package directory
const projectPromptRoot = path.dirname(__filename)

// Function to print usage instructions
function printUsage() {
  console.log(`
Project Prompt CLI (pjp)
------------------------
A tool for generating prompts from your project files and applying code changes.

Usage:
  pjp run <project-root> [options]    Start Project Prompt with your project directory
  pjp help                            Show this help message
  pjp version                         Show version information

Options:
  --port, -p <port>                   Specify the port to run on (default: 3000)
                                      If the specified port is in use, the next available port will be used.

Examples:
  pjp run .                           Start with current directory as project root
  pjp run /path/to/project            Start with specific project directory
  pjp run . --port 3001               Start on port 3001
  `)
}

// Function to print version info
function printVersion() {
  const packageJson = require(path.join(projectPromptRoot, 'package.json'))
  console.log(`Project Prompt CLI v${packageJson.version}`)
}

// Check if Next.js is installed in production mode
function isNextJsProduction() {
  const nextBuildDir = path.join(projectPromptRoot, '.next')
  return fs.existsSync(nextBuildDir)
}

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false)
      } else {
        // For other errors, assume port is available
        resolve(true)
      }
    })
    
    server.once('listening', () => {
      // Close the server and resolve with true (port is available)
      server.close(() => {
        resolve(true)
      })
    })
    
    server.listen(port, '127.0.0.1')
  })
}

// Function to find an available port starting from the given port
async function findAvailablePort(startPort, maxAttempts = 100) {
  let currentPort = startPort
  let attempts = 0
  
  while (attempts < maxAttempts) {
    const isAvailable = await isPortAvailable(currentPort)
    if (isAvailable) {
      return currentPort
    }
    currentPort++
    attempts++
  }
  
  throw new Error(`Could not find an available port after ${maxAttempts} attempts.`)
}

// Function to start the Next.js server with port discovery
async function startServer(initialPort, projectRoot, userSpecified) {
  // Determine if we should use production or development mode
  const nextCmd = isNextJsProduction() ? 'start' : 'dev'
  
  try {
    // Try to find an available port
    const availablePort = await findAvailablePort(initialPort)
    
    // If port changed and user specified a port, show warning
    if (availablePort !== initialPort) {
      if (userSpecified) {
        console.log(`\nWARNING: Port ${initialPort} is already in use.`)
      }
      console.log(`Using port ${availablePort} instead.`)
    }
    
    // Set port environment variable for Next.js
    process.env.PORT = availablePort
    
    // Start Next.js server with the available port
    const child = spawn('npx', ['next', nextCmd, '-p', availablePort], {
      cwd: projectPromptRoot,
      env: process.env,
      stdio: 'inherit',
    })

    child.on('close', code => process.exit(code))
    
    // Log helpful information
    setTimeout(() => {
      console.log(`\nProject Prompt is running at: http://localhost:${availablePort}`)
      console.log('Press Ctrl+C to stop the server')
    }, 2000)
    
    // Handle interruption gracefully
    process.on('SIGINT', () => {
      console.log('\nShutting down Project Prompt...')
      console.log('Sending SIGINT to child process...')
      child.kill('SIGINT')
      
      // Add a timeout to ensure we exit if the child doesn't terminate cleanly
      setTimeout(() => {
        console.log('Force exiting parent process...')
        process.exit(0)
      }, 2000)
    })
    
    // Handle other termination signals
    process.on('SIGTERM', () => {
      console.log('\nReceived SIGTERM. Shutting down Project Prompt...')
      child.kill('SIGTERM')
      setTimeout(() => process.exit(0), 2000)
    })
    
    process.on('SIGHUP', () => {
      console.log('\nReceived SIGHUP. Shutting down Project Prompt...')
      child.kill('SIGHUP')
      setTimeout(() => process.exit(0), 2000)
    })
    
    childProcess = child
    return child
  } catch (error) {
    console.error('Failed to start Project Prompt:', error.message)
    process.exit(1)
  }
}

// Handle commands
if (!command || command === 'help') {
  printUsage()
  process.exit(0)
} else if (command === 'version') {
  printVersion()
  process.exit(0)
} else if (command === 'run') {
  // Get project root
  const projectRoot = args[projectRootArg] ? path.resolve(args[projectRootArg]) : process.cwd()
  
  // Validate project directory
  if (!fs.existsSync(projectRoot)) {
    console.error(`Error: Directory does not exist: ${projectRoot}`)
    process.exit(1)
  }

  // Set environment variables
  process.env.PJP_PROJECT_ROOT = projectRoot
  
  console.log(`Starting Project Prompt with project root: ${projectRoot}`)
  console.log(`Attempting to use port: ${port}`)
  console.log('Loading files and generating interface...')
  
  // Start server with port discovery
  startServer(port, projectRoot, userSpecifiedPort)
    .catch(err => {
      console.error('Server startup failed:', err.message)
      process.exit(1)
    })
} else {
  console.error(`Unknown command: ${command}`)
  printUsage()
  process.exit(1)
}
