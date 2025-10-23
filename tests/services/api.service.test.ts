// tests/services/api.service.test.ts
import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  type Mock,
} from 'vitest';
import apiService from '../../public/js/services/api.service';
import { Item } from '../../public/js/types/api.types';

describe('API Service', () => {
  beforeEach(() => {
    // Mock fetch API
    global.fetch = vi.fn();

    // Reset the API service to use test server URL
    // Note: We can't easily reset the private baseUrl property,
    // so we'll work with the default for now
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful item loading', async () => {
    const mockItems: Item[] = [
      { id: '1', content_id: 'content-1', title: 'Test Item 1', score: 10 },
      { id: '2', content_id: 'content-2', title: 'Test Item 2', score: 5 },
    ];

    const mockResponse = {
      json: vi.fn().mockResolvedValue({ items: mockItems, total: 2 }),
      ok: true,
    };

    (global.fetch as Mock).mockResolvedValue(
      mockResponse as unknown as Response
    );

    const result = await apiService.loadContent('en');

    expect(result).toEqual(mockItems);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/items?limit=50&lang=en'
    );
  });

  it('should handle empty response from item loading', async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ items: [], total: 0 }),
      ok: true,
    };

    (global.fetch as Mock).mockResolvedValue(
      mockResponse as unknown as Response
    );

    const result = await apiService.loadContent();

    expect(result).toEqual([]);
  });

  it('should handle rating submission', async () => {
    const mockRatingResponse = {
      rating: {
        id: 'rate1',
        userId: null,
        itemId: 'item1',
        value: 1,
        createdAt: '2023-01-01T00:00:00Z',
      },
      item: { id: 'item1', score: 5 },
    };

    const mockResponse = {
      json: vi.fn().mockResolvedValue(mockRatingResponse),
      ok: true,
    };

    (global.fetch as Mock).mockResolvedValue(
      mockResponse as unknown as Response
    );

    const result = await apiService.submitRating('item1', 1);

    expect(result).toEqual(mockRatingResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/ratings',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          itemId: 'item1',
          value: 1,
        }),
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

    await expect(apiService.loadContent()).rejects.toThrow('Network error');
  });

  it('should handle API error responses', async () => {
    const mockErrorResponse = {
      json: vi.fn().mockResolvedValue({ error: 'Item not found' }),
      ok: false,
      status: 404,
    };

    (global.fetch as Mock).mockResolvedValue(
      mockErrorResponse as unknown as Response
    );

    await expect(apiService.submitRating('invalid-id', 1)).rejects.toThrow(
      'Item not found'
    );
  });
});
