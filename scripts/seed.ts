#!/usr/bin/env ts-node

/**
 * Seed script for TOPPER.top MVP
 *
 * Generates demo JSON files in the project's `data/` directory:
 *  - users.json
 *  - categories.json
 *  - items.json
 *  - ratings.json
 *  - settings.json
 *
 * Usage:
 *   npm run seed
 *
 * Notes:
 * - Designed to run with Node >= 18 (uses crypto.randomUUID).
 * - Idempotent: re-runs will overwrite existing files.
 */

import { promises as fsp } from 'fs';
import path from 'path';
import crypto from 'crypto';

type User = {
  id: string;
  username: string;
  displayName?: string;
  role: 'user' | 'admin' | 'moderator';
  locale: 'en' | 'ru' | 'ro' | 'uk';
  createdAt: string;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  lang: 'en' | 'ru' | 'ro' | 'uk';
};

type Item = {
  content_id: string;
  content_canonical_text_en: string;
  content_text_en: string;
  content_text_ro: string;
  content_text_ua: string;
  content_text_ru: string;
  content_source_name_en: string;
  content_source_name_ro: string;
  content_source_name_ua: string;
  content_source_name_ru: string;
  content_source_link: string;
  content_country?: string;
  content_created_by?: string | null;
  content_created: string;
  content_published: string;
  content_edited?: string;
  content_type: string;
  content_category: string;
  content_subcategory?: string;
  content_tags: string[];
  content_votes: number;
  content_score: number;
  categories?: string[];
  lang: string;
};

type Rating = {
  id: string;
  userId?: string | null;
  itemId: string;
  value: 1 | -1;
  createdAt: string;
};

const DATA_DIR = path.resolve(process.cwd(), 'data');

function uuid() {
  // Node 18+ has crypto.randomUUID, fallback to pseudo if missing
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : crypto.randomBytes(16).toString('hex');
}

function nowISOString(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) d.setDate(d.getDate() - offsetDays);
  return d.toISOString();
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Cannot pick from empty array');
  }
  return arr[randInt(0, arr.length - 1)]!;
}

function sample<T>(arr: T[], count: number) {
  const copy = [...arr];
  const res: T[] = [];
  for (let i = 0; i < count && copy.length; i++) {
    const idx = randInt(0, copy.length - 1);
    const element = copy.splice(idx, 1)[0];
    if (element !== undefined) {
      res.push(element);
    }
  }
  return res;
}

async function ensureDataDir() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
}

async function writeJson(filename: string, obj: unknown) {
  const filePath = path.join(DATA_DIR, filename);
  const content = JSON.stringify(obj, null, 2) + '\n';
  await fsp.writeFile(filePath, content, 'utf8');
  console.log('Wrote', filePath);
}

async function generate() {
  console.log('Seeding data into:', DATA_DIR);
  await ensureDataDir();

  // Configuration
  const USER_COUNT = Number(process.env.SEED_USERS ?? 10);
  const ITEM_COUNT = Number(process.env.SEED_ITEMS ?? 30);
  const RATING_COUNT = Number(process.env.SEED_RATINGS ?? 150);

  const LANGS: Array<User['locale']> = ['en', 'ru', 'ro', 'uk'];

  // Sample pools for titles and tags (multilingual)
  const TITLE_POOLS: Record<string, string[]> = {
    en: [
      '10 surprising facts about {X}',
      'Breaking: {X} changes the market',
      'How to understand {X} in 5 minutes',
      "Top tips for {X} you didn't know",
      'Study reveals new insights into {X}',
      'Why {X} matters today',
    ],
    ru: [
      '10 удивительных фактов про {X}',
      'Срочно: {X} меняет рынок',
      'Как понять {X} за 5 минут',
      'Лучшие советы по {X}, о которых вы не знали',
      'Исследование раскрывает новое о {X}',
      'Почему {X} важно сегодня',
    ],
    ro: [
      '10 fapte surprinzătoare despre {X}',
      'Breaking: {X} schimbă piața',
      'Cum să înțelegi {X} în 5 minute',
      'Sfaturi de top pentru {X} pe care nu le știai',
      'Studiu dezvăluie noi informații despre {X}',
      'De ce contează {X} azi',
    ],
    uk: [
      '10 дивовижних фактів про {X}',
      'Терміново: {X} змінює ринок',
      'Як зрозуміти {X} за 5 хвилин',
      'Топ порад по {X}, про які ви не знали',
      'Дослідження відкриває нове про {X}',
      'Чому {X} важливий сьогодні',
    ],
  };

  const TAGS_POOL = [
    'science',
    'tech',
    'economy',
    'health',
    'politics',
    'sports',
    'culture',
    'product',
    'startup',
    'travel',
    'education',
    'fun',
  ];

  const SOURCES = [
    'Example News',
    'Facts Daily',
    'Top Insights',
    'Open Source',
    'Community Post',
    'Global Times',
  ];

  const CATEGORY_DEFS = [
    { slug: 'facts', name: 'Facts' },
    { slug: 'news', name: 'News' },
    { slug: 'offers', name: 'Offers' },
    { slug: 'ads', name: 'Ads' },
    { slug: 'products', name: 'Products' },
    { slug: 'opinion', name: 'Opinion' },
  ];

  // 1) Users
  const users: User[] = [];
  for (let i = 1; i <= USER_COUNT; i++) {
    const id = uuid();
    const locale = pick(LANGS);
    users.push({
      id,
      username: `user${i}`,
      displayName: `User ${i}`,
      role: i === 1 ? 'admin' : 'user',
      locale,
      createdAt: nowISOString(randInt(1, 365)),
    });
  }

  // 2) Categories
  const categories: Category[] = CATEGORY_DEFS.map((c, idx) => {
    const lang = LANGS[idx % LANGS.length];
    return {
      id: uuid(),
      slug: c.slug,
      name: c.name,
      lang: lang as 'en' | 'ru' | 'ro' | 'uk',
    };
  });

  // Helper to pick category ids
  function pickCategoryIds() {
    const count = randInt(1, 2);
    const chosen = sample(categories, count);
    return chosen.map(c => c.id);
  }

  // 3) Items
  const items: Item[] = [];
  for (let i = 0; i < ITEM_COUNT; i++) {
    const lang = pick(LANGS);
    const pool = TITLE_POOLS[lang];
    if (!pool || pool.length === 0) {
      throw new Error(`No title pool found for language: ${lang}`);
    }
    const template = pick(pool);
    const subject = pick([
      'AI',
      'climate',
      'economy',
      'startup',
      'education',
      'health',
      'sports',
      'travel',
    ]);
    let title = template.replace('{X}', subject);
    // ensure <= 140 chars
    if (title.length > 140) title = title.slice(0, 137) + '...';

    const source = pick(SOURCES);
    const id = uuid();
    const pickedUser = Math.random() < 0.8 ? pick(users) : null;
    const author = pickedUser ? pickedUser.id : null;
    const tagCount = randInt(1, 4);
    const tags: string[] = sample(TAGS_POOL, tagCount);
    const createdAt = nowISOString(randInt(0, 365));
    const publishedAt = nowISOString(randInt(0, 365));
    const pickedCategory = pick(CATEGORY_DEFS);
    const itemType = pickedCategory.slug; // Use one of the category slugs as the type

    // Create content in the main language
    const content: { [lang: string]: string } = {};
    content[lang] = title; // Use the generated title as content in the main language

    // Add some sample content in other languages (for demo purposes)
    const otherLangs = LANGS.filter(l => l !== lang);
    for (const otherLang of otherLangs) {
      const otherPool = TITLE_POOLS[otherLang];
      if (otherPool && otherPool.length > 0) {
        const otherTemplate = pick(otherPool);
        const otherSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let otherContent = otherTemplate.replace('{X}', otherSubject);
        // ensure <= 140 chars
        if (otherContent.length > 140)
          otherContent = otherContent.slice(0, 137) + '...';
        content[otherLang] = otherContent;
      }
    }

    // Generate content for each language
    let content_en = title;
    let content_ro = title;
    let content_ua = title;
    let content_ru = title;

    // Generate different content for each language based on the language
    if (lang === 'en') {
      content_en = title;
      // Generate Romanian content
      const roPool = TITLE_POOLS['ro'];
      if (roPool && roPool.length > 0) {
        const roTemplate = pick(roPool);
        const roSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let roContent = roTemplate.replace('{X}', roSubject);
        if (roContent.length > 140) roContent = roContent.slice(0, 137) + '...';
        content_ro = roContent;
      } else {
        content_ro = title; // fallback to the original title
      }

      // Generate Ukrainian content
      const uaPool = TITLE_POOLS['uk'];
      if (uaPool && uaPool.length > 0) {
        const uaTemplate = pick(uaPool);
        const uaSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let uaContent = uaTemplate.replace('{X}', uaSubject);
        if (uaContent.length > 140) uaContent = uaContent.slice(0, 137) + '...';
        content_ua = uaContent;
      } else {
        content_ua = title; // fallback to the original title
      }

      // Generate Russian content
      const ruPool = TITLE_POOLS['ru'];
      if (ruPool && ruPool.length > 0) {
        const ruTemplate = pick(ruPool);
        const ruSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let ruContent = ruTemplate.replace('{X}', ruSubject);
        if (ruContent.length > 140) ruContent = ruContent.slice(0, 137) + '...';
        content_ru = ruContent;
      } else {
        content_ru = title; // fallback to the original title
      }
    } else if (lang === 'ro') {
      content_ro = title;
      // Generate English content
      const enPool = TITLE_POOLS['en'];
      if (enPool && enPool.length > 0) {
        const enTemplate = pick(enPool);
        const enSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let enContent = enTemplate.replace('{X}', enSubject);
        if (enContent.length > 140) enContent = enContent.slice(0, 137) + '...';
        content_en = enContent;
      } else {
        content_en = title; // fallback to the original title
      }

      // Generate Ukrainian content
      const uaPool = TITLE_POOLS['uk'];
      if (uaPool && uaPool.length > 0) {
        const uaTemplate = pick(uaPool);
        const uaSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let uaContent = uaTemplate.replace('{X}', uaSubject);
        if (uaContent.length > 140) uaContent = uaContent.slice(0, 137) + '...';
        content_ua = uaContent;
      } else {
        content_ua = title; // fallback to the original title
      }

      // Generate Russian content
      const ruPool = TITLE_POOLS['ru'];
      if (ruPool && ruPool.length > 0) {
        const ruTemplate = pick(ruPool);
        const ruSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let ruContent = ruTemplate.replace('{X}', ruSubject);
        if (ruContent.length > 140) ruContent = ruContent.slice(0, 137) + '...';
        content_ru = ruContent;
      } else {
        content_ru = title; // fallback to the original title
      }
    } else if (lang === 'uk') {
      content_ua = title;
      // Generate English content
      const enPool = TITLE_POOLS['en'];
      if (enPool && enPool.length > 0) {
        const enTemplate = pick(enPool);
        const enSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let enContent = enTemplate.replace('{X}', enSubject);
        if (enContent.length > 140) enContent = enContent.slice(0, 137) + '...';
        content_en = enContent;
      } else {
        content_en = title; // fallback to the original title
      }

      // Generate Romanian content
      const roPool = TITLE_POOLS['ro'];
      if (roPool && roPool.length > 0) {
        const roTemplate = pick(roPool);
        const roSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let roContent = roTemplate.replace('{X}', roSubject);
        if (roContent.length > 140) roContent = roContent.slice(0, 137) + '...';
        content_ro = roContent;
      } else {
        content_ro = title; // fallback to the original title
      }

      // Generate Russian content
      const ruPool = TITLE_POOLS['ru'];
      if (ruPool && ruPool.length > 0) {
        const ruTemplate = pick(ruPool);
        const ruSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let ruContent = ruTemplate.replace('{X}', ruSubject);
        if (ruContent.length > 140) ruContent = ruContent.slice(0, 137) + '...';
        content_ru = ruContent;
      } else {
        content_ru = title; // fallback to the original title
      }
    } else {
      // ru
      content_ru = title;
      // Generate English content
      const enPool = TITLE_POOLS['en'];
      if (enPool && enPool.length > 0) {
        const enTemplate = pick(enPool);
        const enSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let enContent = enTemplate.replace('{X}', enSubject);
        if (enContent.length > 140) enContent = enContent.slice(0, 137) + '...';
        content_en = enContent;
      } else {
        content_en = title; // fallback to the original title
      }

      // Generate Romanian content
      const roPool = TITLE_POOLS['ro'];
      if (roPool && roPool.length > 0) {
        const roTemplate = pick(roPool);
        const roSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let roContent = roTemplate.replace('{X}', roSubject);
        if (roContent.length > 140) roContent = roContent.slice(0, 137) + '...';
        content_ro = roContent;
      } else {
        content_ro = title; // fallback to the original title
      }

      // Generate Ukrainian content
      const uaPool = TITLE_POOLS['uk'];
      if (uaPool && uaPool.length > 0) {
        const uaTemplate = pick(uaPool);
        const uaSubject = pick([
          'AI',
          'climate',
          'economy',
          'startup',
          'education',
          'health',
          'sports',
          'travel',
        ]);
        let uaContent = uaTemplate.replace('{X}', uaSubject);
        if (uaContent.length > 140) uaContent = uaContent.slice(0, 137) + '...';
        content_ua = uaContent;
      } else {
        content_ua = title; // fallback to the original title
      }
    }

    // Generate source names in different languages
    const sourceName_en = source;
    const sourceName_ro = `Sursa ${source}`;
    const sourceName_ua = `Джерело ${source}`;
    const sourceName_ru = `Источник ${source}`;

    items.push({
      content_id: id,
      content_canonical_text_en: content_en, // Using English as the canonical text
      content_text_en: content_en,
      content_text_ro: content_ro,
      content_text_ua: content_ua,
      content_text_ru: content_ru,
      content_source_name_en: sourceName_en,
      content_source_name_ro: sourceName_ro,
      content_source_name_ua: sourceName_ua,
      content_source_name_ru: sourceName_ru,
      content_source_link: `https://example.test/source/${encodeURIComponent(
        source.toLowerCase().replace(/\s+/g, '-')
      )}/${id}`,
      content_country: pick(['US', 'RO', 'UA', 'RU']), // Random country codes
      content_created_by: author,
      content_created: createdAt,
      content_published: publishedAt,
      content_type: itemType, // Use the picked category slug as type
      content_category: itemType, // Use the same for category
      content_subcategory: pick(['General', 'Tech', 'Science', 'News']), // Random subcategory
      content_tags: tags,
      content_votes: 0,
      content_score: 0,
      categories: pickCategoryIds(),
      lang: lang,
    });
  }

  // 4) Ratings
  const ratings: Rating[] = [];
  for (let i = 0; i < RATING_COUNT; i++) {
    const id = uuid();
    const item = pick(items);
    // 80% of votes are from users, 20% anonymous
    const userId = Math.random() < 0.8 ? pick(users).id : null;
    // roughly balanced but slightly positive bias
    const value: 1 | -1 = Math.random() < 0.55 ? 1 : -1;
    const createdAt = nowISOString(randInt(0, 365));
    ratings.push({
      id,
      userId,
      itemId: item.content_id,
      value,
      createdAt,
    });
  }

  // 5) Aggregate scores into items
  const scoreMap: Record<string, number> = {};
  for (const r of ratings) {
    scoreMap[r.itemId] = (scoreMap[r.itemId] ?? 0) + r.value;
  }
  for (const it of items) {
    it.content_score = scoreMap[it.content_id] ?? 0;
    it.content_votes = Object.values(ratings).filter(
      rating => rating.itemId === it.content_id
    ).length;
  }

  // 6) Settings
  const settings = {
    version: '0.0.1',
    seededAt: new Date().toISOString(),
    counts: {
      users: users.length,
      items: items.length,
      ratings: ratings.length,
      categories: categories.length,
    },
  };

  // Write files
  await writeJson('users.json', users);
  await writeJson('categories.json', categories);
  await writeJson('items.json', items);
  await writeJson('ratings.json', ratings);
  await writeJson('settings.json', settings);

  console.log('Seed complete:');
  console.log(`  users:     ${users.length}`);
  console.log(`  categories:${categories.length}`);
  console.log(`  items:     ${items.length}`);
  console.log(`  ratings:   ${ratings.length}`);
  console.log('');
  console.log(
    'Tip: run the dev server (npm run dev) and implement API endpoints to read from data/*.json'
  );
}

if (require.main === module) {
  (async () => {
    try {
      await generate();
      // eslint-disable-next-line no-process-exit
      process.exit(0);
    } catch (err) {
      console.error('Seed failed:', err);
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
  })();
}
