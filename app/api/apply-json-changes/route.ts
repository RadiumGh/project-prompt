import { NextRequest, NextResponse } from 'next/server'
import { applyJsonChangesNode } from '../../../server-utils/applyJsonChangesNode'

/**
 * POST /api/apply-json-changes
 * Accepts a JSON body containing the structure defined in ChangesJson, and applies those changes
 * in the local filesystem using Node fs/promises, with strict path sanitization.
 * Demonstration-only minimal credential check included for advanced usage.
 */
export async function POST(req: NextRequest) {
  // Minimal (example) user credential check - replace with real logic in production:
  const authorizationHeader = req.headers.get('Authorization')
  if (!authorizationHeader || authorizationHeader !== 'Bearer FAKE-TOKEN') {
    return NextResponse.json({ error: 'Unauthorized request' }, { status: 401 })
  }

  try {
    // Attempt to parse JSON body
    const data = await req.json()

    // Basic validation: 'changes' must be an array
    if (!data || !Array.isArray(data.changes)) {
      return NextResponse.json(
        { error: "Invalid changes JSON format. 'changes' array is required." },
        { status: 400 },
      )
    }

    // In addition to the path checks in applyJsonChangesNode, we can do a quick scan for suspicious patterns:
    for (const change of data.changes) {
      const possiblePaths = []
      if (change.path) possiblePaths.push(change.path)
      if (change.old_path) possiblePaths.push(change.old_path)
      if (change.new_path) possiblePaths.push(change.new_path)

      for (const p of possiblePaths) {
        if (
          p.includes('..') ||
          p.includes(':') ||
          p.includes('\r') ||
          p.includes('\n')
        ) {
          return NextResponse.json(
            {
              error: `Suspicious path: ${p}`,
            },
            { status: 400 },
          )
        }
      }
    }

    // We use process.env.PJP_PROJECT_ROOT if provided, otherwise process.cwd() as a base directory.
    const baseDir = process.env.PJP_PROJECT_ROOT || process.cwd()
    await applyJsonChangesNode(data, baseDir)

    // Return success
    return NextResponse.json({ status: 'ok' })
  } catch (err: any) {
    console.error('Failed to apply JSON changes:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
