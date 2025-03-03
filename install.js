#!/usr/bin/env node

/**
 * This script runs during npm install/postinstall to ensure proper setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Project Prompt CLI...');

// Check if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';

try {
  // Make sure the .next directory exists (or if not, that we build it)
  const nextBuildDir = path.join(__dirname, '.next');
  
  if (!fs.existsSync(nextBuildDir)) {
    console.log('📦 Building Next.js application...');
    execSync('npx next build', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('✅ Next.js build completed successfully');
  } else {
    console.log('✅ Next.js build already exists');
  }
  
  // Make the CLI executable
  try {
    fs.chmodSync(path.join(__dirname, 'cli.js'), '755');
    console.log('✅ CLI permissions set');
  } catch (err) {
    console.warn('⚠️ Could not set CLI permissions:', err.message);
  }
  
  console.log('\n🎉 Project Prompt CLI is ready to use!');
  console.log('📚 Run "pjp help" to see available commands');
  
} catch (error) {
  console.error('❌ Error during setup:', error.message);
  process.exit(1);
} 