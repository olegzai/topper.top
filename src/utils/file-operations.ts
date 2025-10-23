/**
 * Safe file operations with atomic writes to prevent data corruption
 */
import { promises as fsp } from 'fs';

/**
 * Safely write data to a file using atomic operations
 * This prevents data corruption during concurrent writes
 */
export async function safeWriteFile(
  filePath: string,
  data: unknown
): Promise<void> {
  // Create backup of original file if it exists
  try {
    const backupPath = filePath + '.backup';
    await fsp.copyFile(filePath, backupPath).catch(() => {}); // Ignore if file doesn't exist

    // Write to temporary file first
    const tempPath = filePath + '.tmp';
    const serializedData = JSON.stringify(data, null, 2);
    await fsp.writeFile(tempPath, serializedData, 'utf8');

    // Atomically replace the original file with the temp file
    await fsp.rename(tempPath, filePath);

    // Clean up backup after successful write
    if (backupPath) {
      await fsp.unlink(backupPath).catch(() => {}); // Ignore errors when removing backup
    }
  } catch (error) {
    // If something fails during atomic write, try to restore from backup
    try {
      const backupPath = filePath + '.backup';
      await fsp.rename(backupPath, filePath).catch(() => {}); // Restore from backup if available
    } catch {
      // If we can't restore from backup, we at least tried
    }
    throw error;
  }
}

/**
 * Read file with error handling
 */
export async function safeReadFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch (error) {
    // If there's an error reading the file (e.g., doesn't exist or corrupt), return null
    return null;
  }
}

/**
 * Write data to multiple files atomically (all succeed or all fail)
 */
export async function atomicWriteMultiple(
  fileDataPairs: Array<{ path: string; data: unknown }>
): Promise<void> {
  const tempPaths: string[] = [];
  const backupPaths: string[] = [];

  try {
    // Step 1: Create backups and write to temporary files
    for (const pair of fileDataPairs) {
      const backupPath = pair.path + '.backup';
      const tempPath = pair.path + '.tmp';

      // Create backup of original file
      try {
        await fsp.copyFile(pair.path, backupPath);
      } catch {
        // File may not exist, which is fine
      }

      backupPaths.push(backupPath);

      // Write to temporary file
      const serializedData = JSON.stringify(pair.data, null, 2);
      await fsp.writeFile(tempPath, serializedData, 'utf8');
      tempPaths.push(tempPath);
    }

    // Step 2: Atomically replace original files with temp files
    for (let i = 0; i < fileDataPairs.length; i++) {
      const tempPath = tempPaths[i];
      const targetPath = fileDataPairs[i]?.path;
      if (tempPath && targetPath) {
        await fsp.rename(tempPath, targetPath);
      }
    }

    // Step 3: Clean up backup files
    for (const backupPath of backupPaths) {
      if (backupPath) {
        try {
          await fsp.unlink(backupPath);
        } catch {
          // Ignore errors when removing backups
        }
      }
    }
  } catch (error) {
    // If anything fails, try to restore from backups
    for (let i = 0; i < backupPaths.length; i++) {
      try {
        // If original file exists, remove it (it might be corrupted)
        if (i < fileDataPairs.length && i < backupPaths.length) {
          const targetPath = fileDataPairs[i]?.path;
          const backupPath = backupPaths[i];
          if (targetPath && backupPath) {
            await fsp.unlink(targetPath).catch(() => {});
            // Then restore from backup
            await fsp.rename(backupPath, targetPath).catch(() => {});
          }
        }
      } catch {
        // If we can't restore, we at least tried
      }
    }

    // Remove any remaining temp files
    for (const tempPath of tempPaths) {
      try {
        await fsp.unlink(tempPath).catch(() => {});
      } catch {
        // Ignore errors
      }
    }

    throw error;
  }
}
