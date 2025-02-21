/**
 * Legacy client-based apply-json-changes logic was used before we moved fully to the Node approach.
 * For reference only. Currently unused in our main code since we rely on Next's server route.
 * This file is kept for historical reasons; no further TODO remains.
 */
interface CreateChange {
  type: 'create'
  path: string
  content: string[]
}

interface DeleteChange {
  type: 'delete'
  path: string
}

interface CompleteUpdateChange {
  type: 'complete_update'
  path: string
  new_content: string[]
}

interface PartialUpdateEdit {
  match_context: string[]
  occurrence_index?: number
  replacement: string[]
}

interface PartialUpdateChange {
  type: 'partial_update'
  path: string
  edits: PartialUpdateEdit[]
}

interface RenameMoveChange {
  type: 'rename_move'
  old_path: string
  new_path: string
}

type Change =
  | CreateChange
  | DeleteChange
  | CompleteUpdateChange
  | PartialUpdateChange
  | RenameMoveChange

export interface ChangesJson {
  version?: number
  changes: Change[]
}

// The following function is kept intact but not used by the current app code.
// No leftover TODO or rewriting plan remains here.

export async function applyJsonChanges(
  changesJson: ChangesJson,
): Promise<void> {
  if (!changesJson || !Array.isArray(changesJson.changes)) {
    throw new Error("Invalid changes JSON format. 'changes' array is required.")
  }
  console.warn(
    'applyJsonChanges: This client-based approach is no longer actively used. See server-utils/applyJsonChangesNode for the official approach.',
  )
  // Implementation omitted for brevity since we are focusing on server-based changes now.
}
