import fs from 'fs/promises';
import path from 'path';
import { jest } from '@jest/globals';
import { applyJsonChangesNode, ChangesJson } from './applyJsonChangesNode';

// We'll mock fs in these tests to avoid writing to disk.
jest.mock('fs/promises');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('applyJsonChangesNode', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('throws if no changes array is present', async () => {
    const data: any = { version: 1 };
    await expect(applyJsonChangesNode(data, '/fake/baseDir')).rejects.toThrow(
      "Invalid changes JSON format. 'changes' array is required."
    );
  });

  it('can create a file', async () => {
    const changes: ChangesJson = {
      changes: [
        { type: 'create', path: 'docs/new-file.txt', content: ['Hello'] }
      ]
    };
    mockedFs.writeFile.mockResolvedValueOnce(undefined);
    mockedFs.mkdir.mockResolvedValueOnce(undefined);

    await applyJsonChangesNode(changes, '/fake/baseDir');

    expect(mockedFs.mkdir).toHaveBeenCalledWith(
      path.resolve('/fake/baseDir', 'docs'),
      { recursive: true }
    );
    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      path.resolve('/fake/baseDir', 'docs/new-file.txt'),
      'Hello',
      'utf-8'
    );
  });

  it('deletes a file', async () => {
    const changes: ChangesJson = {
      changes: [
        { type: 'delete', path: 'old.txt' }
      ]
    };
    mockedFs.rm.mockResolvedValueOnce(undefined);

    await applyJsonChangesNode(changes, '/fake/baseDir');
    expect(mockedFs.rm).toHaveBeenCalledWith(
      path.resolve('/fake/baseDir', 'old.txt'),
      { force: true, recursive: false }
    );
  });

  it('does a complete update', async () => {
    const changes: ChangesJson = {
      changes: [
        {
          type: 'complete_update',
          path: 'file.txt',
          new_content: ['Line A', 'Line B']
        }
      ]
    };
    mockedFs.writeFile.mockResolvedValueOnce(undefined);
    mockedFs.mkdir.mockResolvedValueOnce(undefined);

    await applyJsonChangesNode(changes, '/fake/baseDir');
    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      path.resolve('/fake/baseDir', 'file.txt'),
      'Line A\nLine B',
      'utf-8'
    );
  });

  it('skips partial update if file does not exist', async () => {
    const changes: ChangesJson = {
      changes: [
        {
          type: 'partial_update',
          path: 'missing.txt',
          edits: [{ match_context: ['A'], replacement: ['B'] }]
        }
      ]
    };
    mockedFs.readFile.mockRejectedValueOnce(new Error('No file'));

    await applyJsonChangesNode(changes, '/fake/baseDir');
    // Should just log error and not throw
    expect(mockedFs.writeFile).not.toHaveBeenCalled();
  });

  it('rename/move a file', async () => {
    const changes: ChangesJson = {
      changes: [
        {
          type: 'rename_move',
          old_path: 'old-name.txt',
          new_path: 'new-name.txt'
        }
      ]
    };
    mockedFs.readFile.mockResolvedValueOnce(Buffer.from('content'));
    mockedFs.writeFile.mockResolvedValueOnce(undefined);
    mockedFs.rm.mockResolvedValueOnce(undefined);
    mockedFs.mkdir.mockResolvedValueOnce(undefined);

    await applyJsonChangesNode(changes, '/fake/baseDir');
    expect(mockedFs.readFile).toHaveBeenCalledWith(path.resolve('/fake/baseDir', 'old-name.txt'));
    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      path.resolve('/fake/baseDir', 'new-name.txt'),
      Buffer.from('content')
    );
    expect(mockedFs.rm).toHaveBeenCalledWith(
      path.resolve('/fake/baseDir', 'old-name.txt'),
      { force: true }
    );
  });
});
