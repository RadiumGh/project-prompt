/**
 * File: tests/apply-json-changes-bdd-tests.ts
 *
 * TODO: [Subtask7] We plan to unify or remove these browser-based BDD tests in favor of Node-based logic.
 * Retain them temporarily for any fallback or legacy usage.
 *
 * These tests exercise the BDD Scenarios defined in the provided Gherkin file
 * against the `applyJsonChanges` function using the Web FileSystem API in a browser
 * environment. They will run in a "test" directory under the provided `rootDirHandle`
 * so that nothing under "src" is affected.
 *
 * Usage:
 *   1. Obtain a FileSystemDirectoryHandle pointing to your root/project directory, e.g. by using:
 *        const rootDirHandle = await window.showDirectoryPicker();
 *   2. Call the exported function:
 *        await runApplyJsonChangesBDDTests(rootDirHandle);
 *   3. Check your browser console for test results.
 *
 * Important:
 *   - You must be running this in a secure context (HTTPS or localhost).
 *   - The File System Access API must be supported by your browser.
 */

import { applyJsonChanges, ChangesJson } from './apply-json-changes'

// A simple TestResult structure
interface TestResult {
  scenario: string
  passed: boolean
  error?: any
}

// Export a single function to run all BDD scenarios
export async function runApplyJsonChangesBDDTests(
  rootDirHandle: FileSystemDirectoryHandle,
): Promise<void> {
  // We'll create (or reuse) a directory named "test" under rootDirHandle.
  const testDir = await rootDirHandle.getDirectoryHandle('test', {
    create: true,
  })

  const results: TestResult[] = []

  // Helper to run each scenario and store results
  async function runScenario(
    scenarioName: string,
    scenarioFn: () => Promise<void>,
  ) {
    try {
      await scenarioFn()
      results.push({ scenario: scenarioName, passed: true })
      console.log(`✅ [PASSED] ${scenarioName}`)
    } catch (err) {
      results.push({ scenario: scenarioName, passed: false, error: err })
      console.error(`❌ [FAILED] ${scenarioName}`, err)
    }
  }

  /**
   * Utilities to help with file operations and assertions
   */
  async function fileExists(
    path: string,
    dirHandle: FileSystemDirectoryHandle,
  ): Promise<boolean> {
    try {
      const { parentDir, fileName } = await getParentDirectoryAndFileName(
        path,
        dirHandle,
      )
      await parentDir.getFileHandle(fileName)
      return true
    } catch {
      return false
    }
  }

  async function readFileLines(
    path: string,
    dirHandle: FileSystemDirectoryHandle,
  ): Promise<string[]> {
    const { parentDir, fileName } = await getParentDirectoryAndFileName(
      path,
      dirHandle,
    )
    const fileHandle = await parentDir.getFileHandle(fileName)
    const fileData = await fileHandle.getFile()
    const text = await fileData.text()
    return text.split('\n')
  }

  async function ensureFileDoesNotExist(
    path: string,
    dirHandle: FileSystemDirectoryHandle,
  ) {
    const exists = await fileExists(path, dirHandle)
    if (exists) {
      const { parentDir, fileName } = await getParentDirectoryAndFileName(
        path,
        dirHandle,
      )
      await parentDir.removeEntry(fileName, { recursive: false })
    }
  }

  async function ensureFileExists(
    path: string,
    lines: string[],
    dirHandle: FileSystemDirectoryHandle,
  ) {
    // Create the file with the given content
    const { parentDir, fileName } = await getParentDirectoryAndFileName(
      path,
      dirHandle,
    )
    const fh = await parentDir.getFileHandle(fileName, { create: true })
    const writable = await fh.createWritable()
    await writable.write(lines.join('\n'))
    await writable.close()
  }

  function assert(condition: any, message: string): asserts condition {
    if (!condition) {
      throw new Error(message)
    }
  }

  async function assertFileContent(
    path: string,
    expectedLines: string[],
    dirHandle: FileSystemDirectoryHandle,
  ) {
    const actual = await readFileLines(path, dirHandle)
    const match =
      actual.length === expectedLines.length &&
      actual.every((line, idx) => line === expectedLines[idx])

    if (!match) {
      const formattedExpected = JSON.stringify(expectedLines, null, 2)
      const formattedActual = JSON.stringify(actual, null, 2)
      throw new Error(
        `File content mismatch for "${path}"\nExpected:\n${formattedExpected}\nActual:\n${formattedActual}`,
      )
    }
  }

  async function getParentDirectoryAndFileName(
    fullPath: string,
    root: FileSystemDirectoryHandle,
  ): Promise<{ parentDir: FileSystemDirectoryHandle; fileName: string }> {
    const parts = fullPath.split('/').filter(Boolean)
    const fileName = parts.pop() as string
    let currentDir = root
    for (const part of parts) {
      currentDir = await currentDir.getDirectoryHandle(part, { create: true })
    }
    return { parentDir: currentDir, fileName }
  }

  /**
   * Now let's implement the Gherkin scenarios one by one.
   * We'll place all test files/folders under `testDir`.
   */

  // @create
  await runScenario('Successfully create a new file', async () => {
    // Given an empty or known state
    await ensureFileDoesNotExist('folder/newFile.txt', testDir)

    // And I have a changesJson
    const changesJson = {
      version: 1,
      changes: [
        {
          type: 'create',
          path: 'folder/newFile.txt',
          content: ['Line 1', 'Line 2'],
        },
      ],
    }

    // When I call applyJsonChanges
    await applyJsonChanges(changesJson as ChangesJson, testDir)

    // Then a file "folder/newFile.txt" should exist
    assert(
      await fileExists('folder/newFile.txt', testDir),
      '"folder/newFile.txt" does not exist',
    )

    // And its contents should be ...
    await assertFileContent('folder/newFile.txt', ['Line 1', 'Line 2'], testDir)
  })

  // @create
  await runScenario(
    'Create a file that already exists (overwrites existing)',
    async () => {
      // Given "folder/existingFile.txt" already exists with content "Old Content"
      await ensureFileDoesNotExist('folder/existingFile.txt', testDir)
      await ensureFileExists(
        'folder/existingFile.txt',
        ['Old Content'],
        testDir,
      )

      // And I have a changesJson
      const changesJson = {
        version: 1,
        changes: [
          {
            type: 'create',
            path: 'folder/existingFile.txt',
            content: ['New Content Line 1', 'New Content Line 2'],
          },
        ],
      }

      // When I call applyJsonChanges
      await applyJsonChanges(changesJson as ChangesJson, testDir)

      // Then file should exist and contain new content
      assert(
        await fileExists('folder/existingFile.txt', testDir),
        '"folder/existingFile.txt" not found',
      )
      await assertFileContent(
        'folder/existingFile.txt',
        ['New Content Line 1', 'New Content Line 2'],
        testDir,
      )
    },
  )

  // @delete
  await runScenario('Successfully delete an existing file', async () => {
    // Given "folder/toDelete.txt" exists
    await ensureFileDoesNotExist('folder/toDelete.txt', testDir)
    await ensureFileExists(
      'folder/toDelete.txt',
      ['Temporary content'],
      testDir,
    )

    // And I have a changesJson
    const changesJson = {
      version: 1,
      changes: [
        {
          type: 'delete',
          path: 'folder/toDelete.txt',
        },
      ],
    }

    // When
    await applyJsonChanges(changesJson as ChangesJson, testDir)

    // Then the file should no longer exist
    assert(
      !(await fileExists('folder/toDelete.txt', testDir)),
      '"folder/toDelete.txt" was not deleted',
    )
  })

  // @complete_update
  await runScenario('Complete update on an existing file', async () => {
    // Given "folder/updateMe.txt" exists with content
    await ensureFileDoesNotExist('folder/updateMe.txt', testDir)
    await ensureFileExists('folder/updateMe.txt', ['Line A', 'Line B'], testDir)

    // changesJson
    const changesJson = {
      version: 1,
      changes: [
        {
          type: 'complete_update',
          path: 'folder/updateMe.txt',
          new_content: ['Replaced Line 1', 'Replaced Line 2'],
        },
      ],
    }

    // When
    await applyJsonChanges(changesJson as ChangesJson, testDir)

    // Then file should contain new lines
    await assertFileContent(
      'folder/updateMe.txt',
      ['Replaced Line 1', 'Replaced Line 2'],
      testDir,
    )
  })

  // @complete_update
  await runScenario('Complete update on a non-existing file', async () => {
    // Given "folder/brandNew.txt" does not exist
    await ensureFileDoesNotExist('folder/brandNew.txt', testDir)

    // changesJson
    const changesJson = {
      version: 1,
      changes: [
        {
          type: 'complete_update',
          path: 'folder/brandNew.txt',
          new_content: ['Fresh Line 1', 'Fresh Line 2'],
        },
      ],
    }

    // When
    await applyJsonChanges(changesJson as ChangesJson, testDir)

    // Then it should be created with the specified content
    assert(
      await fileExists('folder/brandNew.txt', testDir),
      '"folder/brandNew.txt" was not created',
    )
    await assertFileContent(
      'folder/brandNew.txt',
      ['Fresh Line 1', 'Fresh Line 2'],
      testDir,
    )
  })

  // @partial_update
  await runScenario(
    'Partial update - single match with default occurrence',
    async () => {
      // Given "folder/partialUpdate.txt" exists
      await ensureFileDoesNotExist('folder/partialUpdate.txt', testDir)
      await ensureFileExists(
        'folder/partialUpdate.txt',
        ['First matching line', 'Second matching line', 'Third line'],
        testDir,
      )

      // changesJson
      const changesJson = {
        version: 1,
        changes: [
          {
            type: 'partial_update',
            path: 'folder/partialUpdate.txt',
            edits: [
              {
                match_context: ['First matching line', 'Second matching line'],
                replacement: ['New Line 1', 'New Line 2'],
              },
            ],
          },
        ],
      }

      // When
      await applyJsonChanges(changesJson as ChangesJson, testDir)

      // Then
      await assertFileContent(
        'folder/partialUpdate.txt',
        ['New Line 1', 'New Line 2', 'Third line'],
        testDir,
      )
    },
  )

  // @partial_update
  await runScenario(
    'Partial update - second occurrence replacement',
    async () => {
      // Given "folder/duplicateContext.txt" exists
      await ensureFileDoesNotExist('folder/duplicateContext.txt', testDir)
      await ensureFileExists(
        'folder/duplicateContext.txt',
        ['Start', 'MATCH', 'MATCH', 'End'],
        testDir,
      )

      // changesJson
      const changesJson = {
        version: 1,
        changes: [
          {
            type: 'partial_update',
            path: 'folder/duplicateContext.txt',
            edits: [
              {
                match_context: ['MATCH'],
                occurrence_index: 2,
                replacement: ['SECOND OCC REPLACE'],
              },
            ],
          },
        ],
      }

      // When
      await applyJsonChanges(changesJson as ChangesJson, testDir)

      // Then
      await assertFileContent(
        'folder/duplicateContext.txt',
        ['Start', 'MATCH', 'SECOND OCC REPLACE', 'End'],
        testDir,
      )
    },
  )

  // @partial_update
  await runScenario('Partial update with invalid edits array', async () => {
    // We expect an error to be thrown because "edits" is not an array
    const changesJson = {
      version: 1,
      changes: [
        {
          type: 'partial_update',
          path: 'folder/invalidEdits.txt',
          edits: 'NOT_AN_ARRAY' as any,
        },
      ],
    }

    let errorThrown = false
    try {
      await applyJsonChanges(changesJson as ChangesJson, testDir)
    } catch (err) {
      errorThrown = true
    }
    assert(errorThrown, 'Expected error was NOT thrown for invalid "edits"')
  })

  // @partial_update
  await runScenario(
    'Partial update with invalid match_context or replacement array',
    async () => {
      // Given file
      await ensureFileDoesNotExist('folder/partialInvalid.txt', testDir)
      await ensureFileExists(
        'folder/partialInvalid.txt',
        ['Some lines', 'More lines'],
        testDir,
      )

      // changesJson
      const changesJson = {
        version: 1,
        changes: [
          {
            type: 'partial_update',
            path: 'folder/partialInvalid.txt',
            edits: [
              {
                match_context: 'NOT_AN_ARRAY',
                replacement: ['Valid array'],
              },
            ],
          },
        ],
      }

      // The code logs a warning and skips invalid edits, so the file should remain unchanged
      await applyJsonChanges(changesJson as ChangesJson, testDir)

      await assertFileContent(
        'folder/partialInvalid.txt',
        ['Some lines', 'More lines'],
        testDir,
      )
    },
  )

  // @partial_update
  await runScenario('Partial update on a missing file', async () => {
    // file does not exist
    await ensureFileDoesNotExist('folder/missingFile.txt', testDir)

    // changesJson
    const changesJson = {
      version: 1,
      changes: [
        {
          type: 'partial_update',
          path: 'folder/missingFile.txt',
          edits: [
            {
              match_context: ['Any'],
              replacement: ["Doesn't matter"],
            },
          ],
        },
      ],
    }

    // This should log an error and do nothing
    await applyJsonChanges(changesJson as ChangesJson, testDir)

    // confirm it was not created
    assert(
      !(await fileExists('folder/missingFile.txt', testDir)),
      '"folder/missingFile.txt" was created unexpectedly',
    )
  })

  // @rename_move
  await runScenario('Successfully rename/move an existing file', async () => {
    // Given oldName.txt exists
    await ensureFileDoesNotExist('folder/oldName.txt', testDir)
    await ensureFileDoesNotExist('folder/renamedName.txt', testDir)
    await ensureFileExists('folder/oldName.txt', ['Original content'], testDir)

    // changesJson
    const changesJson = {
      version: 1,
      changes: [
        {
          type: 'rename_move',
          old_path: 'folder/oldName.txt',
          new_path: 'folder/renamedName.txt',
        },
      ],
    }

    // When
    await applyJsonChanges(changesJson as ChangesJson, testDir)

    // Then
    assert(
      !(await fileExists('folder/oldName.txt', testDir)),
      '"oldName.txt" was not removed',
    )
    assert(
      await fileExists('folder/renamedName.txt', testDir),
      '"renamedName.txt" does not exist',
    )
    await assertFileContent(
      'folder/renamedName.txt',
      ['Original content'],
      testDir,
    )
  })

  // @unknown_type
  await runScenario('Unknown change type is provided', async () => {
    // changesJson
    const changesJson = {
      version: 1,
      changes: [
        {
          type: 'unknown_type',
          path: 'folder/file.txt',
        },
      ],
    } as any

    // Should log a warning, do nothing
    await applyJsonChanges(changesJson as ChangesJson, testDir)

    // No changes to check. We just verify it doesn't crash. If it didn't throw, we're good.
  })

  // @invalid
  await runScenario(
    'Invalid changesJson format (missing changes array)',
    async () => {
      const changesJson = {
        version: 1,
        // no 'changes' key
      }

      let errorThrown = false
      try {
        // This should throw
        await applyJsonChanges(changesJson as ChangesJson, testDir)
      } catch (err) {
        errorThrown = true
      }

      assert(
        errorThrown,
        'Expected error was NOT thrown for missing "changes" array',
      )
    },
  )

  // @invalid
  await runScenario(
    'Invalid changesJson format ("changes" is not an array)',
    async () => {
      const changesJson = {
        version: 1,
        changes: {},
      }

      let errorThrown = false
      try {
        await applyJsonChanges(changesJson as ChangesJson, testDir)
      } catch (err) {
        errorThrown = true
      }

      assert(
        errorThrown,
        'Expected error was NOT thrown for "changes" not an array',
      )
    },
  )

  // @version_handling
  await runScenario('changesJson with or without a version', async () => {
    // Make sure both pass without error
    await ensureFileDoesNotExist('folder/withVersion.txt', testDir)
    await ensureFileDoesNotExist('folder/noVersion.txt', testDir)

    const withVersion = {
      version: 2,
      changes: [
        {
          type: 'create',
          path: 'folder/withVersion.txt',
          content: ['withVersion content'],
        },
      ],
    }

    const withoutVersion = {
      changes: [
        {
          type: 'create',
          path: 'folder/noVersion.txt',
          content: ['noVersion content'],
        },
      ],
    }

    await applyJsonChanges(withVersion as ChangesJson, testDir)
    await applyJsonChanges(withoutVersion as ChangesJson, testDir)

    // Then both files should exist
    assert(
      await fileExists('folder/withVersion.txt', testDir),
      '"withVersion.txt" not found',
    )
    assert(
      await fileExists('folder/noVersion.txt', testDir),
      '"noVersion.txt" not found',
    )
  })

  // Final summary
  console.log('\n=== BDD Test Summary ===')
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.length - passedCount
  console.log(
    `Total: ${results.length}, Passed: ${passedCount}, Failed: ${failedCount}`,
  )
  if (failedCount > 0) {
    console.log('Failed scenarios:')
    results
      .filter(r => !r.passed)
      .forEach(r => console.log(` - ${r.scenario}`, r.error))
  }
  console.log('=== End of BDD Tests ===\n')

  // Remove "test" directory at the end of all tests
  try {
    await rootDirHandle.removeEntry('test', { recursive: true })
    console.log('✅ Removed "test" directory after tests completed.')
  } catch (err) {
    console.error('❌ Failed to remove "test" directory:', err)
  }
}
