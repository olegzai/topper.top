/// <reference types="node" />

import { IncomingMessage, ServerResponse } from 'http';
import { readData } from '../data';
import { Item } from '../../interfaces/api.types';

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

export async function handleLeaderboard(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string
) {
  // GET /api/leaderboard?limit=10&lang=ru
  if (pathname === '/api/leaderboard' && req.method === 'GET') {
    const url = new URL(`http://localhost${req.url}`);
    const qp = url.searchParams;
    const limit = Math.min(Number(qp.get('limit') ?? 10), 100);
    const langParam = qp.get('lang');
    const langFilterLeaderboard = langParam || undefined;
    const items = (await readData<Item[]>('items.json')) ?? [];
    let list = items.slice();
    if (langFilterLeaderboard)
      list = list.filter(i => i.lang === langFilterLeaderboard);
    list = list
      .sort((a, b) => b.content_score - a.content_score)
      .slice(0, limit);
    // Process items to select appropriate content based on language
    const processedList = list.map(item =>
      processItemByLanguage(item, langParam)
    );
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ items: processedList }));
    return true;
  }

  return false;
}
