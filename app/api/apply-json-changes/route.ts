import { NextRequest, NextResponse } from 'next/server';
import { applyJsonChangesNode } from '../../../../server-utils/applyJsonChangesNode';

/**
 * POST /api/apply-json-changes
 * Accepts a JSON body containing the structure defined in ChangesJson, and applies those changes
 * in the local filesystem using Node fs/promises.
 */
export async function POST(req: NextRequest) {
  try {
    // Attempt to parse JSON body
    const data = await req.json();

    // Basic validation: 'changes' must be an array
    if (!data || !Array.isArray(data.changes)) {
      return NextResponse.json(
        { error: "Invalid changes JSON format. 'changes' array is required." },
        { status: 400 }
      );
    }

    // We use process.cwd() as a base directory, but we keep a TODO for path sanitization checks.
    // In a future subtask, we might validate user credentials, etc.
    await applyJsonChangesNode(data, process.cwd());

    // Return success
    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    // If this was a parse error or something else, we can differentiate if needed
    console.error('Failed to apply JSON changes:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}