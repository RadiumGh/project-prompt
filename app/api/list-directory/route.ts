import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { listDirectory } from '@/server-utils/listDirectory';

export async function GET(req: NextRequest) {
  // For now, always read from process.cwd() as the base.
  try {
    const baseDir = process.cwd();
    const tree = listDirectory(baseDir);
    return NextResponse.json({ tree });
  } catch (error: any) {
    console.error('Error listing directory:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}