/**
 * Example of calling Project Prompt APIs programmatically
 * 
 * This example assumes Project Prompt is already running via `pjp run <project-dir>`
 * on the default port (3000) or another available port if 3000 was in use.
 * 
 * If you started Project Prompt on a different port, adjust the BASE_URL below.
 */

const axios = require('axios');

// Base URL for the Project Prompt server
// Change the port if you started Project Prompt with a different port
const BASE_URL = 'http://localhost:3000/api';

/**
 * List the directory structure of the project
 */
async function listDirectory() {
  try {
    const response = await axios.get(`${BASE_URL}/list-directory`);
    return response.data;
  } catch (error) {
    console.error('Error listing directory:', error.message);
    throw error;
  }
}

/**
 * Get the contents of a specific file
 * @param {string} filePath - Relative path to the file within the project directory
 */
async function getFileContents(filePath) {
  try {
    const response = await axios.post(`${BASE_URL}/get-file-contents`, { path: filePath });
    return response.data;
  } catch (error) {
    console.error(`Error getting contents of ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Apply JSON changes to the files in the project
 * @param {Array} changes - Array of change objects
 */
async function applyJsonChanges(changes) {
  try {
    const response = await axios.post(`${BASE_URL}/apply-json-changes`, { changes });
    return response.data;
  } catch (error) {
    console.error('Error applying changes:', error.message);
    throw error;
  }
}

// Example usage
async function runExample() {
  try {
    // List directory structure
    const dirStructure = await listDirectory();
    console.log('Project structure:', JSON.stringify(dirStructure.tree, null, 2));
    
    // Get contents of a file (adjust the path to match your project)
    const fileContent = await getFileContents('package.json');
    console.log('File content:', fileContent);
    
    // Example of applying changes
    const changes = [
      {
        type: 'create',
        path: 'example-file.txt',
        content: 'This file was created by the API example.'
      },
      {
        type: 'partial_update',
        path: 'example-file.txt',
        content: 'This line was appended.',
        append: true
      }
    ];
    
    const changeResult = await applyJsonChanges(changes);
    console.log('Change result:', changeResult);
    
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Uncomment to run the example
// runExample();

module.exports = {
  listDirectory,
  getFileContents,
  applyJsonChanges
}; 