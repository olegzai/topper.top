/// <reference types="node" />

import * as fsp from 'fs/promises';
import * as path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');

// Ensure data directory exists
fsp.mkdir(DATA_DIR, { recursive: true }).catch(() => {});

/** Read data from a JSON file in the data directory */
export async function readData<T>(filename: string): Promise<T | null> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch (err: unknown) {
    // File might not exist, return null
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

/** Write data to a JSON file in the data directory */
export async function writeData<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  await fsp.writeFile(filePath, JSON.stringify(data, null, 2));
}
