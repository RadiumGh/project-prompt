/**
 * Describes a single change of type "create".
 *
 * TODO: Next rewriting plan: We'll move logic to server-side Node fs in `app/api/apply-json-changes/route.ts`. Keep old code for reference.
 */
interface CreateChange {
  type: 'create'
  path: string
  content: string[]
}

/**
 * Describes a single change of type "delete".
 */
interface DeleteChange {
  type: 'delete'
  path: string
}

/**
 * Describes a single change of type "complete_update".
 */
interface CompleteUpdateChange {
  type: 'complete_update'
  path: string
  new_content: string[]
}

/**
 * Describes the shape of an individual edit for "partial_update".
 */
interface PartialUpdateEdit {
  match_context: string[]
  occurrence_index?: number
  replacement: string[]
}

/**
 * Describes a single change of type "partial_update".
 */
interface PartialUpdateChange {
  type: 'partial_update'
  path: string
  edits: PartialUpdateEdit[]
}

/**
 * Describes a single change of type "rename_move".
 */
interface RenameMoveChange {
  type: 'rename_move'
  old_path: string
  new_path: string
}

/**
 * Union of all possible change types.
 */
type Change =
  | CreateChange
  | DeleteChange
  | CompleteUpdateChange
  | PartialUpdateChange
  | RenameMoveChange

/**
 * Defines the shape of the JSON containing the version and an array of changes.
 */
export interface ChangesJson {
  version?: number
  changes: Change[]
}

/**
 * Applies JSON-based changes to a directory using the File System Access API.
 * @param changesJson - The JSON object containing "version" (optional) and an array of "changes".
 * @param rootDirHandle - The root directory handle where changes apply.
 */
export async function applyJsonChanges(
  changesJson: ChangesJson,
  rootDirHandle: FileSystemDirectoryHandle,
): Promise<void> {
  if (!changesJson || !Array.isArray(changesJson.changes)) {
    throw new Error("Invalid changes JSON format. 'changes' array is required.")
  }

  for (const change of changesJson.changes) {
    switch (change.type) {
      case 'create':
        await createFile(change.path, change.content, rootDirHandle)
        break

      case 'delete':
        await deleteFile(change.path, rootDirHandle)
        break

      case 'complete_update':
        await completeUpdate(change.path, change.new_content, rootDirHandle)
        break

      case 'partial_update':
        await partialUpdate(change.path, change.edits, rootDirHandle)
        break

      case 'rename_move':
        await renameMoveFile(change.old_path, change.new_path, rootDirHandle)
        break

      default:
        console.warn(`Unknown change type: ${(change as any).type}`)
    }
  }
}

/**
 * Creates a new file (or overwrites if it exists) with the specified content.
 * @param path - File path relative to the root directory.
 * @param content - Array of lines for the new file.
 * @param rootDirHandle - The root directory handle.
 */
async function createFile(
  path: string,
  content: string[],
  rootDirHandle: FileSystemDirectoryHandle,
): Promise<void> {
  const { fileName, parentDir } = await getParentDirectoryAndFileName(
    path,
    rootDirHandle,
  )
  const fileHandle = await parentDir.getFileHandle(fileName, { create: true })
  await writeToFile(fileHandle, content)
}

/**
 * Deletes a file from the directory.
 * @param path - File path relative to the root directory.
 * @param rootDirHandle - The root directory handle.
 */
async function deleteFile(
  path: string,
  rootDirHandle: FileSystemDirectoryHandle,
): Promise<void> {
  const { fileName, parentDir } = await getParentDirectoryAndFileName(
    path,
    rootDirHandle,
  )
  await parentDir.removeEntry(fileName, { recursive: false })
}

/**
 * Overwrites an entire file with new content.
 * @param path - File path relative to the root directory.
 * @param newContent - Array of lines for the updated file.
 * @param rootDirHandle - The root directory handle.
 */
async function completeUpdate(
  path: string,
  newContent: string[],
  rootDirHandle: FileSystemDirectoryHandle,
): Promise<void> {
  const { fileName, parentDir } = await getParentDirectoryAndFileName(
    path,
    rootDirHandle,
  )
  const fileHandle = await parentDir.getFileHandle(fileName, { create: true })
  await writeToFile(fileHandle, newContent)
}

/**
 * Partially updates a file by matching specified contexts and replacing them.
 * @param path - File path relative to the root directory.
 * @param edits - Each edit has { match_context, occurrence_index, replacement }.
 * @param rootDirHandle - The root directory handle.
 */
async function partialUpdate(
  path: string,
  edits: PartialUpdateEdit[],
  rootDirHandle: FileSystemDirectoryHandle,
): Promise<void> {
  if (!Array.isArray(edits)) {
    throw new Error("Invalid partial_update: 'edits' must be an array.")
  }

  const { fileName, parentDir } = await getParentDirectoryAndFileName(
    path,
    rootDirHandle,
  )
  let fileHandle: FileSystemFileHandle

  try {
    fileHandle = await parentDir.getFileHandle(fileName)
  } catch (err) {
    console.error(`File not found for partial update: ${path}`)
    return
  }

  const fileData = await fileHandle.getFile()
  const originalText = await fileData.text()
  let fileLines = originalText.split('\n')

  for (const edit of edits) {
    const { match_context, occurrence_index, replacement } = edit
    if (!Array.isArray(match_context) || !Array.isArray(replacement)) {
      console.warn(
        "Skipping edit: 'match_context' and 'replacement' must be arrays of strings.",
      )
      continue
    }
    const occurrenceIdx =
      typeof occurrence_index === 'number' ? occurrence_index : 1
    fileLines = replaceContextBlock(
      fileLines,
      match_context,
      occurrenceIdx,
      replacement,
    )
  }

  await writeToFile(fileHandle, fileLines)
}

/**
 * Renames or moves a file by copying content to the new path and deleting the old one.
 * @param oldPath - Existing file path.
 * @param newPath - New file path.
 * @param rootDirHandle - The root directory handle.
 */
async function renameMoveFile(
  oldPath: string,
  newPath: string,
  rootDirHandle: FileSystemDirectoryHandle,
): Promise<void> {
  const { fileName: oldFile, parentDir: oldDir } =
    await getParentDirectoryAndFileName(oldPath, rootDirHandle)
  const oldHandle = await oldDir.getFileHandle(oldFile)
  const oldFileData = await oldHandle.getFile()
  const oldText = await oldFileData.text()

  const { fileName: newFile, parentDir: newDir } =
    await getParentDirectoryAndFileName(newPath, rootDirHandle)
  const newHandle = await newDir.getFileHandle(newFile, { create: true })
  await writeToFile(newHandle, oldText.split('\n'))

  await oldDir.removeEntry(oldFile, { recursive: false })
}

/**
 * Searches fileLines for the nth occurrence of matchContext (line-by-line, ignoring leading/trailing whitespace)
 * and replaces it with replacement lines. Returns the updated array of lines.
 * @param fileLines - The original file lines.
 * @param matchContext - The block of lines to find.
 * @param occurrenceIndex - Which occurrence of the block to replace (1-based).
 * @param replacementLines - The lines to replace the block with.
 */
function replaceContextBlock(
  fileLines: string[],
  matchContext: string[],
  occurrenceIndex: number,
  replacementLines: string[],
): string[] {
  const indices = findAllContextMatches(fileLines, matchContext)
  if (indices.length < occurrenceIndex) {
    console.warn(
      `Could not find occurrence #${occurrenceIndex} of the context block to replace.`,
    )
    return fileLines
  }

  const start = indices[occurrenceIndex - 1]
  const end = start + matchContext.length
  const before = fileLines.slice(0, start)
  const after = fileLines.slice(end)

  return [...before, ...replacementLines, ...after]
}

/**
 * Finds all start indices in fileLines where matchContext (consecutive lines) appears,
 * ignoring leading/trailing whitespace in each line.
 * @param fileLines - The lines of the file.
 * @param matchContext - The consecutive lines to match.
 */
function findAllContextMatches(
  fileLines: string[],
  matchContext: string[],
): number[] {
  const occurrences: number[] = []
  const maxStart = fileLines.length - matchContext.length

  for (let i = 0; i <= maxStart; i++) {
    let match = true
    for (let j = 0; j < matchContext.length; j++) {
      const fileLineTrimmed = fileLines[i + j].trim()
      const contextLineTrimmed = matchContext[j].trim()
      if (fileLineTrimmed !== contextLineTrimmed) {
        match = false
        break
      }
    }
    if (match) {
      occurrences.push(i)
    }
  }
  return occurrences
}

/**
 * Retrieves the final directory handle and file name by traversing the given path.
 * @param fullPath - The file path, relative to rootDirHandle.
 * @param rootDirHandle - The root directory handle.
 */
async function getParentDirectoryAndFileName(
  fullPath: string,
  rootDirHandle: FileSystemDirectoryHandle,
): Promise<{ parentDir: FileSystemDirectoryHandle; fileName: string }> {
  const parts = fullPath.split('/').filter(Boolean)
  const fileName = parts.pop() as string
  let currentDir = rootDirHandle

  for (const part of parts) {
    currentDir = await currentDir.getDirectoryHandle(part, { create: true })
  }
  return { parentDir: currentDir, fileName }
}

/**
 * Writes an array of lines to the given file handle, joining them with newline characters.
 * @param fileHandle - The file handle to write to.
 * @param lines - The lines of text to be written.
 */
async function writeToFile(
  fileHandle: FileSystemFileHandle,
  lines: string[],
): Promise<void> {
  const writable = await fileHandle.createWritable()
  await writable.write(lines.join('\n'))
  await writable.close()
}
