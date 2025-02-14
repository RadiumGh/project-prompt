import fs from 'fs';
import path from 'path';
import os from 'os';
import { describe, it, beforeAll, afterAll, expect, jest } from '@jest/globals';
import { applyJsonChangesNode, ChangesJson } from './applyJsonChangesNode';

// We'll create a temporary test directory on the real filesystem
// to replicate the BDD scenarios from the old browser-based tests.
// We also unify previous simple checks (like validating invalid changes array).

// TODO: We can add advanced path-sanitization tests once we finalize that logic.
// TODO: We can add full E2E tests by calling the Next.js route in the future.

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function ensureFileDoesNotExist(filePath: string): void {
  if (fileExists(filePath)) {
    fs.rmSync(filePath, { force: true, recursive: false });
  }
}

function ensureFileExists(filePath: string, lines: string[]): void {
  const dirPath = path.dirname(filePath);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, lines.join('\n'), { encoding: 'utf-8' });
}

function readFileLines(filePath: string): string[] {
  const text = fs.readFileSync(filePath, 'utf-8');
  return text.split('\n');
}

function assertFileContent(filePath: string, expectedLines: string[]): void {
  const actual = readFileLines(filePath);
  expect(actual).toEqual(expectedLines);
}

describe('applyJsonChangesNode (Consolidated BDD)', () => {
  let baseDir: string;

  beforeAll(() => {
    // Create a unique temp directory for these tests
    baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ajcn-test-'));
  });

  afterAll(() => {
    // Remove our entire temp test folder
    fs.rmSync(baseDir, { recursive: true, force: true });
  });

  it('throws if no changes array is present', async () => {
    const data: any = { version: 1 };
    await expect(applyJsonChangesNode(data, baseDir)).rejects.toThrow(
      "Invalid changes JSON format. 'changes' array is required."
    );
  });

  it('handles unknown change type gracefully', async () => {
    const changesJson: ChangesJson = {
      version: 1,
      changes: [
        {
          type: 'unknown_type' as any,
          path: 'whatever.txt'
        }
      ]
    };

    // Should just warn and not throw
    await expect(applyJsonChangesNode(changesJson, baseDir)).resolves.toBeUndefined();
  });

  // BDD-like scenarios adapted from the old apply-json-changes-tests.ts:

  it('Create a new file (Scenario: Successfully create a new file)', async () => {
    const testFile = path.join(baseDir, 'folder/newFile.txt');
    ensureFileDoesNotExist(testFile);

    const changes: ChangesJson = {
      changes: [
        { type: 'create', path: 'folder/newFile.txt', content: ['Line 1', 'Line 2'] }
      ]
    };

    await applyJsonChangesNode(changes, baseDir);
    expect(fileExists(testFile)).toBe(true);
    assertFileContent(testFile, ['Line 1', 'Line 2']);
  });

  it('Create a file that already exists (overwrites)', async () => {
    const testFile = path.join(baseDir, 'folder/existingFile.txt');
    ensureFileDoesNotExist(testFile);
    ensureFileExists(testFile, ['Old Content']);

    const changes: ChangesJson = {
      changes: [
        {
          type: 'create',
          path: 'folder/existingFile.txt',
          content: ['New Content Line 1', 'New Content Line 2']
        }
      ]
    };

    await applyJsonChangesNode(changes, baseDir);
    assertFileContent(testFile, ['New Content Line 1', 'New Content Line 2']);
  });

  it('Successfully delete an existing file', async () => {
    const testFile = path.join(baseDir, 'folder/toDelete.txt');
    ensureFileDoesNotExist(testFile);
    ensureFileExists(testFile, ['Temporary content']);

    const changes: ChangesJson = {
      changes: [
        { type: 'delete', path: 'folder/toDelete.txt' }
      ]
    };

    await applyJsonChangesNode(changes, baseDir);
    expect(fileExists(testFile)).toBe(false);
  });

  it('Complete update on an existing file', async () => {
    const testFile = path.join(baseDir, 'folder/updateMe.txt');
    ensureFileDoesNotExist(testFile);
    ensureFileExists(testFile, ['Line A', 'Line B']);

    const changes: ChangesJson = {
      changes: [
        {
          type: 'complete_update',
          path: 'folder/updateMe.txt',
          new_content: ['Replaced Line 1', 'Replaced Line 2']
        }
      ]
    };

    await applyJsonChangesNode(changes, baseDir);
    assertFileContent(testFile, ['Replaced Line 1', 'Replaced Line 2']);
  });

  it('Complete update on a non-existing file', async () => {
    const testFile = path.join(baseDir, 'folder/brandNew.txt');
    ensureFileDoesNotExist(testFile);

    const changes: ChangesJson = {
      changes: [
        {
          type: 'complete_update',
          path: 'folder/brandNew.txt',
          new_content: ['Fresh Line 1', 'Fresh Line 2']
        }
      ]
    };

    await applyJsonChangesNode(changes, baseDir);
    expect(fileExists(testFile)).toBe(true);
    assertFileContent(testFile, ['Fresh Line 1', 'Fresh Line 2']);
  });

  it('Partial update - single match with default occurrence', async () => {
    const testFile = path.join(baseDir, 'folder/partialUpdate.txt');
    ensureFileDoesNotExist(testFile);
    ensureFileExists(testFile, ['First matching line', 'Second matching line', 'Third line']);

    const changes: ChangesJson = {
      changes: [
        {
          type: 'partial_update',
          path: 'folder/partialUpdate.txt',
          edits: [
            {
              match_context: ['First matching line', 'Second matching line'],
              replacement: ['New Line 1', 'New Line 2']
            }
          ]
        }
      ]
    };

    await applyJsonChangesNode(changes, baseDir);
    assertFileContent(testFile, ['New Line 1', 'New Line 2', 'Third line']);
  });

  it('Partial update - second occurrence replacement', async () => {
    const testFile = path.join(baseDir, 'folder/duplicateContext.txt');
    ensureFileDoesNotExist(testFile);
    ensureFileExists(testFile, ['Start', 'MATCH', 'MATCH', 'End']);

    const changes: ChangesJson = {
      changes: [
        {
          type: 'partial_update',
          path: 'folder/duplicateContext.txt',
          edits: [
            {
              match_context: ['MATCH'],
              occurrence_index: 2,
              replacement: ['SECOND OCC REPLACE']
            }
          ]
        }
      ]
    };

    await applyJsonChangesNode(changes, baseDir);
    assertFileContent(testFile, ['Start', 'MATCH', 'SECOND OCC REPLACE', 'End']);
  });

  it('Partial update with invalid edits array', async () => {
    const changesJson: any = {
      changes: [
        {
          type: 'partial_update',
          path: 'folder/invalidEdits.txt',
          edits: 'NOT_AN_ARRAY'
        }
      ]
    };

    await expect(applyJsonChangesNode(changesJson, baseDir)).rejects.toThrow(
      "Invalid partial_update: 'edits' must be an array."
    );
  });

  it('Partial update on a missing file (should log and skip)', async () => {
    const testFile = path.join(baseDir, 'folder/missingFile.txt');
    ensureFileDoesNotExist(testFile);

    const changes: ChangesJson = {
      changes: [
        {
          type: 'partial_update',
          path: 'folder/missingFile.txt',
          edits: [
            { match_context: ['Any'], replacement: ["Doesn't matter"] }
          ]
        }
      ]
    };

    // Should not throw, should just skip since file doesn't exist.
    await applyJsonChangesNode(changes, baseDir);
    expect(fileExists(testFile)).toBe(false);
  });

  it('Successfully rename/move an existing file', async () => {
    const oldFile = path.join(baseDir, 'folder/oldName.txt');
    const newFile = path.join(baseDir, 'folder/renamedName.txt');
    ensureFileDoesNotExist(oldFile);
    ensureFileDoesNotExist(newFile);
    ensureFileExists(oldFile, ['Original content']);

    const changes: ChangesJson = {
      changes: [
        {
          type: 'rename_move',
          old_path: 'folder/oldName.txt',
          new_path: 'folder/renamedName.txt'
        }
      ]
    };

    await applyJsonChangesNode(changes, baseDir);
    expect(fileExists(oldFile)).toBe(false);
    expect(fileExists(newFile)).toBe(true);
    assertFileContent(newFile, ['Original content']);
  });

  it('Invalid changesJson format (missing changes array)', async () => {
    const changes: any = { version: 1 };
    await expect(applyJsonChangesNode(changes, baseDir)).rejects.toThrow(
      "Invalid changes JSON format. 'changes' array is required."
    );
  });

  it('Invalid changesJson format (changes is not an array)', async () => {
    const changes: any = {
      version: 1,
      changes: {}
    };
    await expect(applyJsonChangesNode(changes, baseDir)).rejects.toThrow(
      "Invalid changes JSON format. 'changes' array is required."
    );
  });

  it('Applies changesJson with or without a version field', async () => {
    const fileA = path.join(baseDir, 'folder/withVersion.txt');
    const fileB = path.join(baseDir, 'folder/noVersion.txt');
    ensureFileDoesNotExist(fileA);
    ensureFileDoesNotExist(fileB);

    const withVersion: ChangesJson = {
      version: 2,
      changes: [
        {
          type: 'create',
          path: 'folder/withVersion.txt',
          content: ['withVersion content']
        }
      ]
    };

    const withoutVersion: ChangesJson = {
      changes: [
        {
          type: 'create',
          path: 'folder/noVersion.txt',
          content: ['noVersion content']
        }
      ]
    };

    await applyJsonChangesNode(withVersion, baseDir);
    await applyJsonChangesNode(withoutVersion, baseDir);

    expect(fileExists(fileA)).toBe(true);
    expect(fileExists(fileB)).toBe(true);
    assertFileContent(fileA, ['withVersion content']);
    assertFileContent(fileB, ['noVersion content']);
  });
});
