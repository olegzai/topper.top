// tests/modules/utils.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import {
  escapeHtml,
  findSimilarItems,
  findNonSimilarItems,
  safeStringCompare,
  generateId,
  safeArrayGet,
  debounce,
} from '../../public/js/modules/utils';
import { Item } from '../../public/js/types/api.types';

describe('Utility Functions', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });

    it('should handle regular strings', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('findSimilarItems', () => {
    it('should find items with shared tags', () => {
      const item: Item = {
        id: '1',
        content_id: 'content-1',
        tags: ['tag1', 'tag2'],
      };
      const allItems: Item[] = [
        { id: '2', content_id: 'content-2', tags: ['tag1', 'tag3'] }, // Similar - shares tag1
        { id: '3', content_id: 'content-3', tags: ['tag4', 'tag5'] }, // Not similar
        { id: '4', content_id: 'content-4', tags: ['tag2', 'tag6'] }, // Similar - shares tag2
      ];

      const result = findSimilarItems(item, allItems);
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('2');
      expect(result[1]?.id).toBe('4');
    });

    it('should return empty array if no tags', () => {
      const item: Item = { id: '1', content_id: 'content-1' };
      const allItems: Item[] = [
        { id: '2', content_id: 'content-2', tags: ['tag1'] },
      ];

      const result = findSimilarItems(item, allItems);
      expect(result).toHaveLength(0);
    });
  });

  describe('findNonSimilarItems', () => {
    it('should find items without shared tags', () => {
      const item: Item = {
        id: '1',
        content_id: 'content-1',
        tags: ['tag1', 'tag2'],
      };
      const allItems: Item[] = [
        { id: '2', content_id: 'content-2', tags: ['tag1', 'tag3'] }, // Similar - shares tag1
        { id: '3', content_id: 'content-3', tags: ['tag4', 'tag5'] }, // Not similar
        { id: '4', content_id: 'content-4', tags: ['tag6', 'tag7'] }, // Not similar
      ];

      const result = findNonSimilarItems(item, allItems);
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('3');
      expect(result[1]?.id).toBe('4');
    });
  });

  describe('safeStringCompare', () => {
    it('should compare strings case-insensitively', () => {
      expect(safeStringCompare('Hello', 'HELLO')).toBe(true);
      expect(safeStringCompare('world', 'WORLD')).toBe(true);
    });

    it('should handle undefined values', () => {
      expect(safeStringCompare(undefined, undefined)).toBe(true);
      expect(safeStringCompare('test', undefined)).toBe(false);
      expect(safeStringCompare(undefined, 'test')).toBe(false);
    });

    it('should return false for different strings', () => {
      expect(safeStringCompare('hello', 'world')).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toMatch(/^id_\d+_\d+$/);
      expect(id2).toMatch(/^id_\d+_\d+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('safeArrayGet', () => {
    it('should return element at valid index', () => {
      const arr = ['a', 'b', 'c'];
      expect(safeArrayGet(arr, 1)).toBe('b');
      expect(safeArrayGet(arr, 0)).toBe('a');
      expect(safeArrayGet(arr, 2)).toBe('c');
    });

    it('should return undefined for invalid indices', () => {
      const arr = ['a', 'b', 'c'];
      expect(safeArrayGet(arr, 5)).toBeUndefined();
      expect(safeArrayGet(arr, -1)).toBeUndefined();
      expect(safeArrayGet<string>([], 0)).toBeUndefined();
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
