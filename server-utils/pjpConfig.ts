import os from 'os';
import path from 'path';
import fs from 'fs/promises';

/**
 * Represents the shape of our pjp-config.json data.
 */
interface PjpConfig {
  instructions: string;
  customInstructions: Array<{
    id: string;
    name: string;
    content: string;
    isActive: boolean;
  }>;
  selectedPaths: string[];
  ignorePatterns: string;
  includeTreeInPrompt: boolean;
  themeMode: 'light' | 'dark';
}

const CONFIG_FILE = path.join(os.homedir(), 'pjp-config.json');

/**
 * Load the pjp-config.json from the user's home directory if it exists, otherwise returns a default config.
 * @returns PjpConfig object loaded from disk or default.
 */
export async function loadPjpConfig(): Promise<PjpConfig> {
  try {
    const contents = await fs.readFile(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(contents);
    return {
      instructions: parsed.instructions ?? '',
      customInstructions: Array.isArray(parsed.customInstructions) ? parsed.customInstructions : [],
      selectedPaths: Array.isArray(parsed.selectedPaths) ? parsed.selectedPaths : [],
      ignorePatterns: typeof parsed.ignorePatterns === 'string' ? parsed.ignorePatterns : '',
      includeTreeInPrompt: typeof parsed.includeTreeInPrompt === 'boolean' ? parsed.includeTreeInPrompt : true,
      themeMode: parsed.themeMode === 'light' ? 'light' : 'dark'
    };
  } catch (err) {
    return {
      instructions: '',
      customInstructions: [],
      selectedPaths: [],
      ignorePatterns: '',
      includeTreeInPrompt: true,
      themeMode: 'dark'
    };
  }
}

/**
 * Write the entire pjp-config.json file to disk.
 * @param data PjpConfig object to save.
 */
export async function savePjpConfig(data: PjpConfig) {
  const jsonString = JSON.stringify(data, null, 2);
  await fs.writeFile(CONFIG_FILE, jsonString, 'utf-8');
}