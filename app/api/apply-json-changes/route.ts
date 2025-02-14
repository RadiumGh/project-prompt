import { NextRequest, NextResponse } from 'next/server';

// Big TODO referencing old 'apply-json-changes.ts' from src/utils.
// We will unify or adapt that logic in 'server-utils/applyJsonChangesNode.ts'.
// Minimal error handling for now: if anything fails, respond with 400 or 500.
// Further improvements (auth, path checks, logs) will come in future subtasks.

import { applyJsonChangesNode } from '../../../../server-utils/applyJsonChangesNode';

export async function POST(req: NextRequest) {
  try {
    // Attempt to parse JSON body
    const data = await req.json();

    // Basic validation: 'changes' must be an array
    if (!data || !Array.isArray(data.changes)) {
      return NextResponse.json({
        error: "Invalid changes JSON format. 'changes' array is required."
      }, { status: 400 });
    }

    // For now, we just call our Node placeholder utility
    // We'll assume a safe root is the local process.cwd(). TODO: refine in future steps
    await applyJsonChangesNode(data, process.cwd());

    // Return success
    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    // If this was a parse error or something else, we can differentiate if needed
    console.error('Failed to apply JSON changes:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}