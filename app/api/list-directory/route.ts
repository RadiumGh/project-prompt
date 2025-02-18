import { NextRequest, NextResponse } from 'next/server';
import { listDirectory } from '@/server-utils/listDirectory';
import { watchProjectDir } from '@/server-utils/fileWatcher';

export async function GET(req: NextRequest) {
  try {
    const baseDir = process.cwd();
    watchProjectDir(baseDir);
    const tree = listDirectory(baseDir);
    return NextResponse.json({ tree });
  } catch (error: any) {
    console.error('Error listing directory:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}