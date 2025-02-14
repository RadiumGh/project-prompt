import fs from 'fs/promises';
import path from 'path';

/**
 * Defines the shape of the JSON containing the version and an array of changes.
 */
export interface ChangesJson {
  version?: number;
  changes: Change[];
}

/**
 * Union of all possible change types.
 */
type Change =
  | CreateChange
  | DeleteChange
  | CompleteUpdateChange
  | PartialUpdateChange
  | RenameMoveChange;

/**
 * Describes a single change of type "create".
 */
interface CreateChange {
  type: 'create';
  path: string;
  content: string[];
}

/**
 * Describes a single change of type "delete".
 */
interface DeleteChange {
  type: 'delete';
  path: string;
}

/**
 * Describes a single change of type "complete_update".
 */
interface CompleteUpdateChange {
  type: 'complete_update';
  path: string;
  new_content: string[];
}

/**
 * Describes the shape of an individual edit for "partial_update".
 */
interface PartialUpdateEdit {
  match_context: string[];
  occurrence_index?: number;
  replacement: string[];
}

/**
 * Describes a single change of type "partial_update".
 */
interface PartialUpdateChange {
  type: 'partial_update';
  path: string;
  edits: PartialUpdateEdit[];
}

/**
 * Describes a single change of type "rename_move".
 */
interface RenameMoveChange {
  type: 'rename_move';
  old_path: string;
  new_path: string;
}

/**
 * Applies JSON-based changes to a directory using Node fs/promises.
 * @param changesJson - The JSON object containing an optional "version" and an array of "changes".
 * @param baseDir - The absolute path to the directory where changes apply.
 */
export async function applyJsonChangesNode(
  changesJson: ChangesJson,
  baseDir: string
): Promise<void> {
  if (!changesJson || !Array.isArray(changesJson.changes)) {
    throw new Error("Invalid changes JSON format. 'changes' array is required.");
  }

  for (const change of changesJson.changes) {
    switch (change.type) {
      case 'create':
        await handleCreate(change, baseDir);
        break;
      case 'delete':
        await handleDelete(change, baseDir);
        break;
      case 'complete_update':
        await handleCompleteUpdate(change, baseDir);
        break;
      case 'partial_update':
        await handlePartialUpdate(change, baseDir);
        break;
      case 'rename_move':
        await handleRenameMove(change, baseDir);
        break;
      default:
        console.warn(`Unknown change type: ${(change as any).type}`);
    }
  }
}

/**
 * Create or overwrite a file at the specified path with the given content.
 */
async function handleCreate(change: CreateChange, baseDir: string): Promise<void> {
  const absolutePath = resolveAndCheckPath(baseDir, change.path);
  // TODO: path sanitization checks (ensure not outside baseDir).
  const dirPath = path.dirname(absolutePath);
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(absolutePath, change.content.join('\n'), 'utf-8');
}

/**
 * Delete a file at the specified path.
 */
async function handleDelete(change: DeleteChange, baseDir: string): Promise<void> {
  const absolutePath = resolveAndCheckPath(baseDir, change.path);
  // TODO: path sanitization checks.
  await fs.rm(absolutePath, { force: true, recursive: false });
}

/**
 * Overwrite an entire file with new content (creates if not existing).
 */
async function handleCompleteUpdate(change: CompleteUpdateChange, baseDir: string): Promise<void> {
  const absolutePath = resolveAndCheckPath(baseDir, change.path);
  // TODO: path sanitization checks.
  const dirPath = path.dirname(absolutePath);
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(absolutePath, change.new_content.join('\n'), 'utf-8');
}

/**
 * Partially update a file by matching context blocks.
 */
async function handlePartialUpdate(change: PartialUpdateChange, baseDir: string): Promise<void> {
  const absolutePath = resolveAndCheckPath(baseDir, change.path);
  // TODO: path sanitization checks.

  let original: string;
  try {
    original = await fs.readFile(absolutePath, 'utf-8');
  } catch (err) {
    console.error(`File not found or unreadable for partial update: ${change.path}`);
    return; // Skip if file is missing
  }

  const fileLines = original.split('\n');

  for (const edit of change.edits) {
    const { match_context, occurrence_index, replacement } = edit;
    if (!Array.isArray(match_context) || !Array.isArray(replacement)) {
      console.warn("Skipping edit: 'match_context' and 'replacement' must be arrays of strings.");
      continue;
    }

    const occIndex = typeof occurrence_index === 'number' ? occurrence_index : 1;
    replaceContextBlock(fileLines, match_context, occIndex, replacement);
  }

  await fs.writeFile(absolutePath, fileLines.join('\n'), 'utf-8');
}

/**
 * Rename or move a file from old_path to new_path.
 */
async function handleRenameMove(change: RenameMoveChange, baseDir: string): Promise<void> {
  const oldAbsolutePath = resolveAndCheckPath(baseDir, change.old_path);
  const newAbsolutePath = resolveAndCheckPath(baseDir, change.new_path);
  // TODO: path sanitization checks.

  let content: Buffer;
  try {
    content = await fs.readFile(oldAbsolutePath);
  } catch (err) {
    console.error(`Failed to read file for rename/move: ${change.old_path}`);
    return;
  }

  const newDir = path.dirname(newAbsolutePath);
  await fs.mkdir(newDir, { recursive: true });
  await fs.writeFile(newAbsolutePath, content);

  try {
    await fs.rm(oldAbsolutePath, { force: true });
  } catch (err) {
    console.error(`Failed to remove old file after rename: ${change.old_path}`, err);
  }
}

/**
 * A small helper to ensure the path is absolute and inside baseDir.
 * Currently we just do path.resolve. We'll add the real checks in a future subtask.
 */
function resolveAndCheckPath(baseDir: string, relPath: string): string {
  const abs = path.resolve(baseDir, relPath);
  // TODO: if path.relative(baseDir, abs).startsWith('..'), throw new Error('Path escapes baseDir!');
  return abs;
}

/**
 * Find and replace the nth occurrence of `matchContext` lines in `fileLines` with `replacementLines` in place.
 */
function replaceContextBlock(
  fileLines: string[],
  matchContext: string[],
  occurrenceIndex: number,
  replacementLines: string[]
): void {
  const startIndices = findAllContextMatches(fileLines, matchContext);
  if (startIndices.length < occurrenceIndex) {
    console.warn(
      `Could not find occurrence #${occurrenceIndex} of the context block to replace.`
    );
    return;
  }

  const start = startIndices[occurrenceIndex - 1];
  const end = start + matchContext.length;
  fileLines.splice(start, matchContext.length, ...replacementLines);
}

/**
 * Returns a list of starting indices where `matchContext` lines appear consecutively in `fileLines` (trim comparison).
 */
function findAllContextMatches(
  fileLines: string[],
  matchContext: string[]
): number[] {
  const results: number[] = [];
  const maxStart = fileLines.length - matchContext.length;

  for (let i = 0; i <= maxStart; i++) {
    let matched = true;
    for (let j = 0; j < matchContext.length; j++) {
      if (fileLines[i + j].trim() !== matchContext[j].trim()) {
        matched = false;
        break;
      }
    }
    if (matched) {
      results.push(i);
    }
  }
  return results;
}