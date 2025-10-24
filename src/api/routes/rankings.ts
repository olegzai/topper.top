/// <reference types="node" />

import { IncomingMessage, ServerResponse } from 'http';
import { readData, writeData } from '../data';
import { rankingLimiter } from '../../utils/rate-limiter';
import { Item, Ranking } from '../../interfaces/api.types';

function processItemByLanguage(
  item: Item,
  langParam: string | null | undefined
) {
  const processedItem = { ...item };
  // Set contentText and sourceName based on requested language
  switch (langParam || processedItem.lang) {
    case 'en':
      processedItem['contentText'] = processedItem.content_text_en;
      processedItem['sourceName'] = processedItem.content_source_name_en;
      break;
    case 'ro':
      processedItem['contentText'] = processedItem.content_text_ro;
      processedItem['sourceName'] = processedItem.content_source_name_ro;
      break;
    case 'ua':
      processedItem['contentText'] = processedItem.content_text_ua;
      processedItem['sourceName'] = processedItem.content_source_name_ua;
      break;
    case 'ru':
      processedItem['contentText'] = processedItem.content_text_ru;
      processedItem['sourceName'] = processedItem.content_source_name_ru;
      break;
    default:
      processedItem['contentText'] = processedItem.content_text_en;
      processedItem['sourceName'] = processedItem.content_source_name_en;
  }
  return processedItem;
}

function generateId() {
  return `id_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}

export async function handleRankings(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string
) {
  // POST /api/rankings
  // body: { itemId, value: 1|-1, userId? }
  if (pathname === '/api/rankings' && req.method === 'POST') {
    // Rate limiting for ratings - max 10 requests per minute per IP
    const clientIP =
      (req.headers['x-forwarded-for'] as string) ||
      (req.connection && req.connection.remoteAddress) ||
      (req.socket && req.socket.remoteAddress) ||
      'unknown';
    const rateLimitKey = `ranking_${clientIP}`;

    const rateLimitResult = rankingLimiter.check(rateLimitKey, 10);
    if (!rateLimitResult.allowed) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'rate_limit_exceeded',
          retryAfter: (rateLimitResult.resetTime - Date.now()) / 1000,
        })
      );
      return true;
    }

    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk.toString();
      }

      const parsed = JSON.parse(body);
      const { itemId, value, userId } = parsed;

      // Validate input
      if (
        typeof itemId !== 'string' ||
        !/^[-a-zA-Z0-9]+$/.test(itemId) ||
        (value !== 1 && value !== -1) ||
        (userId !== undefined && typeof userId !== 'string')
      ) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'invalid_input' }));
        return true;
      }

      // Check if item exists
      const items = (await readData<Item[]>('items.json')) ?? [];
      const item = items.find(x => x.content_id === itemId);
      if (!item) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'item_not_found' }));
        return true;
      }

      // Create ranking record
      const newRanking: Ranking = {
        id: generateId(),
        userId: userId || null,
        itemId,
        value,
        createdAt: new Date().toISOString(),
      };

      // Save ranking
      const rankings = (await readData<Ranking[]>('rankings.json')) ?? [];
      rankings.push(newRanking);
      await writeData('rankings.json', rankings);

      // Update item score based on the new ranking
      const scoreAdjustment = value === 1 ? 1 : -1;
      item.content_score = (item.content_score || 0) + scoreAdjustment;
      // Make sure to update the original array
      const itemIndex = items.findIndex(x => x.content_id === itemId);
      if (itemIndex !== -1) {
        items[itemIndex] = item;
      }
      await writeData('items.json', items);

      // Try to get next item based on user's preference or random
      let nextItem: Item | undefined;
      if (value === 1) {
        // For positive rating, find a similar item
        // For simplicity, just return a random item for now
        const otherItems = items.filter(x => x.content_id !== itemId);
        nextItem =
          otherItems.length > 0
            ? otherItems[Math.floor(Math.random() * otherItems.length)]
            : undefined;
      } else {
        // For negative rating, find a different item
        const otherItems = items.filter(x => x.content_id !== itemId);
        nextItem =
          otherItems.length > 0
            ? otherItems[Math.floor(Math.random() * otherItems.length)]
            : undefined;
      }

      if (nextItem) {
        const url = new URL(`http://localhost${req.url}`);
        const langParam = url.searchParams.get('lang');
        const processedNextItem = processItemByLanguage(nextItem, langParam);
        nextItem = processedNextItem;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          ranking: newRanking,
          item: { id: item.content_id, score: item.content_score },
          nextItem,
        })
      );
      return true;
    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'invalid_json' }));
        return true;
      }
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'internal_error' }));
      return true;
    }
  }

  return false;
}
