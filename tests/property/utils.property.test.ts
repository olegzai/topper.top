import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  findSimilarItems,
  findNonSimilarItems,
  findSimilarItem,
  findNonSimilarItem,
} from '../../public/js/modules/utils';

// Define arbitraries for property-based testing
const tagArbitrary = fc.string({ minLength: 1, maxLength: 20 });
const itemArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  content_id: fc.string({ minLength: 1, maxLength: 20 }),
  tags: fc.array(tagArbitrary, { minLength: 0, maxLength: 10 }),
});

describe('Property-based tests for utility functions', () => {
  test('findSimilarItems should not return the same item as input', () => {
    fc.assert(
      fc.property(
        itemArbitrary,
        fc.array(itemArbitrary, { minLength: 1, maxLength: 20 }),
        (inputItem, allItems) => {
          const similarItems = findSimilarItems(inputItem, allItems);

          // Property 1: None of the returned items should have the same ID as input
          similarItems.forEach(item => {
            expect(item.id).not.toBe(inputItem.id);
          });
        }
      )
    );
  });

  test('findSimilarItems should return items that share at least one tag with input', () => {
    fc.assert(
      fc.property(
        itemArbitrary,
        fc.array(itemArbitrary, { minLength: 1, maxLength: 20 }),
        (inputItem, allItems) => {
          // Filter out items that are identical to input to avoid empty results
          const differentItems = allItems.filter(
            item => item.id !== inputItem.id
          );
          const allItemsWithDiff = [...differentItems, inputItem];

          const similarItems = findSimilarItems(inputItem, allItemsWithDiff);

          // For each similar item, it should share at least one tag with input
          similarItems.forEach(similarItem => {
            const hasSharedTag = inputItem.tags.some(tag =>
              similarItem.tags?.includes(tag)
            );
            expect(hasSharedTag).toBe(true);
          });
        }
      )
    );
  });

  test('findNonSimilarItems should return items that share no tags with input', () => {
    fc.assert(
      fc.property(
        itemArbitrary,
        fc.array(itemArbitrary, { minLength: 1, maxLength: 20 }),
        (inputItem, allItems) => {
          // Only include items that have tags for meaningful testing
          const allItemWithTags = allItems.filter(
            item => item.tags && item.tags.length > 0
          );
          if (
            allItemWithTags.length === 0 ||
            (inputItem.tags && inputItem.tags.length === 0)
          ) {
            // If no items have tags, all items are "non-similar" by tag criteria
            return;
          }

          const nonSimilarItems = findNonSimilarItems(
            inputItem,
            allItemWithTags
          );

          // For each non-similar item, it should share no tags with input
          nonSimilarItems.forEach(nonSimilarItem => {
            const hasSharedTag = inputItem.tags.some(tag =>
              nonSimilarItem.tags?.includes(tag)
            );
            expect(hasSharedTag).toBe(false);
          });
        }
      )
    );
  });

  test('findSimilarItem should return undefined or an item with same properties as findSimilarItems', () => {
    fc.assert(
      fc.property(
        itemArbitrary,
        fc.array(itemArbitrary, { minLength: 1, maxLength: 20 }),
        (inputItem, allItems) => {
          const similarItems = findSimilarItems(inputItem, allItems);
          const similarItem = findSimilarItem(inputItem, allItems);

          if (similarItems.length === 0) {
            expect(similarItem).toBeUndefined();
          } else {
            // If findSimilarItems returns items, findSimilarItem should return one of them
            if (similarItem) {
              const isFromList = similarItems.some(
                item => item.id === similarItem.id
              );
              expect(isFromList).toBe(true);
            }
          }
        }
      )
    );
  });

  test('findNonSimilarItem should return undefined or an item with same properties as findNonSimilarItems', () => {
    fc.assert(
      fc.property(
        itemArbitrary,
        fc.array(itemArbitrary, { minLength: 1, maxLength: 20 }),
        (inputItem, allItems) => {
          const nonSimilarItems = findNonSimilarItems(inputItem, allItems);
          const nonSimilarItem = findNonSimilarItem(inputItem, allItems);

          if (nonSimilarItems.length === 0) {
            expect(nonSimilarItem).toBeUndefined();
          } else {
            // If findNonSimilarItems returns items, findNonSimilarItem should return one of them
            if (nonSimilarItem) {
              const isFromList = nonSimilarItems.some(
                item => item.id === nonSimilarItem.id
              );
              expect(isFromList).toBe(true);
            }
          }
        }
      )
    );
  });
});
