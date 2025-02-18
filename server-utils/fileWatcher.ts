import fs from 'fs';
import path from 'path';

let isWatching = false;

export function watchProjectDir(baseDir: string) {
  if (isWatching) return;
  isWatching = true;

  fs.watch(baseDir, { recursive: true }, (eventType, filename) => {
    console.log('Project dir changed:', eventType, filename);
    // Further logic could broadcast changes via SSE or websockets if desired.
  });
}