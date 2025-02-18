import os from 'os';
import path from 'path';
import fs from 'fs/promises';

const CONFIG_FILE = path.join(os.homedir(), 'pjp-config.json');

export async function loadPjpConfig(): Promise<any> {
  try {
    const contents = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(contents);
  } catch (err) {
    return {
      instructions: '',
      customInstructions: []
    };
  }
}

export async function savePjpConfig(data: any) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
}