import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Basic path-sanitization, similar to applyJsonChangesNode.ts
function resolveAndCheck(baseDir: string, relPath: string): string {
  const abs = path.resolve(baseDir, relPath);
  const relative = path.relative(baseDir, abs);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path escapes baseDir! Attempted path: ${relPath}`);
  }
  return abs;
}

export async function POST(req: NextRequest) {
  try {
  const baseDir = process.env.PJP_PROJECT_ROOT || process.cwd();
    const body = await req.json();

    if (!body || !Array.isArray(body.paths)) {
      return NextResponse.json({
        error: "'paths' array is required."
      }, { status: 400 });
    }

    const results: { path: string; content: string }[] = [];
    for (const relPath of body.paths) {
      try {
        const safePath = resolveAndCheck(baseDir, relPath);
        const fileBuffer = await fs.readFile(safePath);
        const fileContent = fileBuffer.toString('utf-8');
        results.push({ path: relPath, content: fileContent });
      } catch (err) {
        console.error('Failed to read file:', relPath, err);
        // We skip the file or return partial? For now, skip adding to results if error.
      }
    }

    return NextResponse.json({ files: results });
  } catch (err: any) {
    console.error('Error in get-file-contents route:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}