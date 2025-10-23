import { describe, test, expect } from 'vitest';
import {
  safeWriteFile,
  safeReadFile,
  atomicWriteMultiple,
} from '../../src/utils/file-operations';

describe('File Operations Utilities', () => {
  test('safeWriteFile should handle error case', async () => {
    // We can test error cases by using an invalid file path that would throw
    await expect(
      safeWriteFile('/invalid_directory/nonexistent_file.json', {
        test: 'data',
      })
    ).rejects.toThrow();
  });

  test('safeReadFile should return null for non-existent file', async () => {
    // Test reading a file that doesn't exist
    const result = await safeReadFile<Record<string, unknown>>(
      '/nonexistent_file.json'
    );
    expect(result).toBeNull();
  });

  test('atomicWriteMultiple should handle error case', async () => {
    // Test error case with invalid paths
    const filesToWrite = [{ path: '/invalid_dir/file1.json', data: { a: 1 } }];
    await expect(atomicWriteMultiple(filesToWrite)).rejects.toThrow();
  });
});
