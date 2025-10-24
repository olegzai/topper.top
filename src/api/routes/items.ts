/// <reference types="node" />

import { IncomingMessage, ServerResponse } from 'http';
import { readData } from '../data';
import { Item } from '../../interfaces/api.types';

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

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

export async function handleItems(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string
) {
  // GET /api/items?limit=20&offset=0&lang=ru&sort=top
  if (pathname === '/api/items' && req.method === 'GET') {
    const url = new URL(`http://localhost${req.url}`);
    const qp = url.searchParams;
    const limitParam = qp.get('limit');
    const offsetParam = qp.get('offset');

    // Validate and sanitize limit
    let limit = 20; // default
    if (limitParam !== null) {
      const parsedLimit = Number(limitParam);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
        limit = Math.min(parsedLimit, 100);
      }
    }

    // Validate and sanitize offset
    let offset = 0; // default
    if (offsetParam !== null) {
      const parsedOffset = Number(offsetParam);
      if (!isNaN(parsedOffset) && parsedOffset >= 0) {
        offset = Math.max(parsedOffset, 0);
      }
    }
    const langParam = qp.get('lang');
    const langFilter = langParam || undefined;
    const sort = qp.get('sort') || 'new';

    const items = (await readData<Item[]>('items.json')) ?? [];
    let filtered = items;
    if (langFilter) filtered = filtered.filter(i => i.lang === langFilter);
    if (sort === 'top') {
      filtered = filtered.sort((a, b) => b.content_score - a.content_score);
    } else {
      filtered = filtered.sort((a, b) => {
        const aTime = a.content_published ? Date.parse(a.content_published) : 0;
        const bTime = b.content_published ? Date.parse(b.content_published) : 0;
        // Validate that dates are valid
        const aValid = !isNaN(aTime);
        const bValid = !isNaN(bTime);
        if (!aValid && !bValid) return 0;
        if (!aValid) return 1;
        if (!bValid) return -1;
        return bTime - aTime;
      });
    }
    // Process items to select appropriate content based on language
    const processedSlice = filtered
      .slice(offset, offset + limit)
      .map(item => processItemByLanguage(item, langParam));
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ total: filtered.length, items: processedSlice }));
    return true;
  }

  // GET /api/items/:id
  if (pathname.startsWith('/api/items/') && req.method === 'GET') {
    const rawId = pathname.replace('/api/items/', '');
    // Validate the ID to prevent potential injection
    if (!/^[a-zA-Z0-9\\-_]+$/.test(rawId)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'invalid_id_format' }));
      return true;
    }
    const id = rawId;
    const items = (await readData<Item[]>('items.json')) ?? [];
    const it = items.find(x => String(x.content_id) === id);
    if (!it) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'not_found' }));
      return true;
    }
    // Process the item to include appropriate content based on language from query params if available
    const url = new URL(`http://localhost${req.url}`);
    const langParam = url.searchParams.get('lang');
    const processedItem = processItemByLanguage(it, langParam);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ item: processedItem }));
    return true;
  }

  // GET /api/random
  if (pathname === '/api/random' && req.method === 'GET') {
    const items = (await readData<Item[]>('items.json')) ?? [];
    const pick = pickRandom(items);
    if (!pick) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'no_items' }));
      return true;
    }
    // Process the item to include appropriate content
    const url = new URL(`http://localhost${req.url}`);
    const langParam = url.searchParams.get('lang');
    const processedItem = processItemByLanguage(pick, langParam);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ item: processedItem }));
    return true;
  }

  return false;
}
