/// <reference lib="dom" />
// modules/i18n.js
// Internationalization module

// Translations object
export const translations = {
  en: {
    language: 'Language',
    loadingContent: 'Loading content...',
    errorLoadingContent: 'Error loading content: ',
    noItemsAvailable: 'No items available',
    contentDisplay: 'Loading content...',
    viewSource: 'View Source',
    navigation: {
      prev: '← Prev',
      downvote: '↓ -1 (Not Similar)',
      upvote: '↑ +1 (Similar)',
      skip: '→ Skip',
    },
    accordions: {
      information: 'Information',
      filters: 'Filters',
      history: 'History',
      ratings: 'Ratings',
      statistics: 'Statistics',
      settings: 'Settings',
      about: 'About',
      contact: 'Contact Us',
      reset: 'Reset (Developer)',
    },
    informationContent: {
      fullInfo: '',
      id: 'Id:',
      title: 'Title:',
      description: 'Description:',
      url: 'URL:',
      score: 'Score:',
      language: 'Language:',
      published: 'Published:',
      created: 'Created:',
      tags: 'Tags:',
      type: 'Type:',
      category: 'Category:',
    },
    filters: {
      contentTypes: 'Content Types:',
      categories: 'Categories:',
      countriesGlobal: 'Countries/Global:',
      applyFilters: 'Apply Filters',
      clearFilters: 'Clear Filters',
      news: 'News',
      events: 'Events',
      articles: 'Articles',
      facts: 'Facts',
      ads: 'Ads',
      nature: 'Nature',
      people: 'People',
      health: 'Health',
      sports: 'Sports',
      technology: 'Technology',
      education: 'Education',
      business: 'Business',
      entertainment: 'Entertainment',
      global: 'Global',
      romania: 'Romania',
      russia: 'Russia',
      ukraine: 'Ukraine',
      usa: 'USA',
      uk: 'UK',
      germany: 'Germany',
    },
    history: {
      ratingHistory: 'Rating History',
      viewHistory: 'View History',
      noRatings: 'No ratings yet',
      noViews: 'No viewed items yet',
    },
    ratings: {
      topRatings: 'Top Ratings',
      allTimeTop10: 'All Time Top 10',
      top10News: 'Top 10 News',
      top10Technology: 'Top 10 Technology',
      top10Health: 'Top 10 Health',
      topRatedItems: 'Top Rated Items:',
      noTopRated: 'No top-rated items found.',
      errorLoadingTop: 'Error loading top ratings.',
    },
    statistics: {
      personalStats: 'Personal Statistics',
      totalRatings: 'Total Ratings:',
      positiveRatings: 'Positive Ratings:',
      negativeRatings: 'Negative Ratings:',
      favoriteCategories: 'Favorite Categories:',
      none: 'None',
      publicStats: 'Public Statistics',
      totalItems: 'Total Items:',
      totalRatingsPublic: 'Total Ratings:',
      mostRatedCategory: 'Most Rated Category:',
      averageScore: 'Average Score:',
    },
    settings: {
      autoLoad: 'Auto-load next content',
      itemsPerLoad: 'Items per load:',
    },
    about: {
      title: 'Topper.top - Universal Rating Platform',
      version: 'Version: 0.0.1',
      description:
        'A content rating system that allows users to evaluate and rank content items.',
    },
    contact: {
      text: 'For support or feedback, please contact us at: topper.top@example.com',
    },
    reset: {
      resetCache: 'Reset Cache',
      resetAllData: 'Reset All Data',
      clearLocalStorage: 'Clear Local Storage',
      reloadPage: 'Reload Page',
    },
    debug: {
      title: 'DEBUG (Developer Only)',
    },
  },
  ro: {
    language: 'Limba',
    loadingContent: 'Se încarcă conținutul...',
    errorLoadingContent: 'Eroare la încărcarea conținutului: ',
    noItemsAvailable: 'Nu există articole disponibile',
    contentDisplay: 'Se încarcă conținutul...',
    viewSource: 'Vezi sursa',
    navigation: {
      prev: '← Înapoi',
      downvote: '↓ -1 (Nu e similar)',
      upvote: '↑ +1 (Similar)',
      skip: '→ Treci peste',
    },
    accordions: {
      information: 'Informații',
      filters: 'Filtre',
      history: 'Istoric',
      ratings: 'Evaluări',
      statistics: 'Statistici',
      settings: 'Setări',
      about: 'Despre',
      contact: 'Contact',
      reset: 'Reset (Dezvoltator)',
    },
    informationContent: {
      fullInfo: '',
      id: 'Id:',
      title: 'Titlu:',
      description: 'Descriere:',
      url: 'URL:',
      score: 'Scor:',
      language: 'Limba:',
      published: 'Publicat:',
      created: 'Creat:',
      tags: 'Etichete:',
      type: 'Tip:',
      category: 'Categorie:',
    },
    filters: {
      contentTypes: 'Tipuri de conținut:',
      categories: 'Categorii:',
      countriesGlobal: 'Țări/Global:',
      applyFilters: 'Aplică filtrele',
      clearFilters: 'Șterge filtrele',
      news: 'Știri',
      events: 'Evenimente',
      articles: 'Articole',
      facts: 'Fapte',
      ads: 'Reclame',
      nature: 'Natură',
      people: 'Oameni',
      health: 'Sănătate',
      sports: 'Sport',
      technology: 'Tehnologie',
      education: 'Educație',
      business: 'Afaceri',
      entertainment: 'Distracție',
      global: 'Global',
      romania: 'România',
      russia: 'Rusia',
      ukraine: 'Ucraina',
      usa: 'SUA',
      uk: 'Marea Britanie',
      germany: 'Germania',
    },
    history: {
      ratingHistory: 'Istoric Evaluări',
      viewHistory: 'Istoric Vizualizări',
      noRatings: 'Nu există evaluări încă',
      noViews: 'Nu există articole vizualizate încă',
    },
    ratings: {
      topRatings: 'Evaluări de Top',
      allTimeTop10: 'Top 10 din totdeauna',
      top10News: 'Top 10 Știri',
      top10Technology: 'Top 10 Tehnologie',
      top10Health: 'Top 10 Sănătate',
      topRatedItems: 'Articole cu cele mai bune evaluări:',
      noTopRated: 'Nu s-au găsit articole evaluate.',
      errorLoadingTop: 'Eroare la încărcarea evaluărilor de top.',
    },
    statistics: {
      personalStats: 'Statistici Personale',
      totalRatings: 'Evaluări Totale:',
      positiveRatings: 'Evaluări Pozitive:',
      negativeRatings: 'Evaluări Negative:',
      favoriteCategories: 'Categorii Favorite:',
      none: 'Niciuna',
      publicStats: 'Statistici Publice',
      totalItems: 'Total Articole:',
      totalRatingsPublic: 'Total Evaluări:',
      mostRatedCategory: 'Categoriea Cel Mai Evaluată:',
      averageScore: 'Scor Mediu:',
    },
    settings: {
      autoLoad: 'Încarcă automat următorul conținut',
      itemsPerLoad: 'Articole pe pagină:',
    },
    about: {
      title: 'Topper.top - Platformă Universală de Evaluare',
      version: 'Versiune: 0.0.1',
      description:
        'Un sistem de evaluare a conținutului care permite utilizatorilor să evalueze și să clasifice articolele.',
    },
    contact: {
      text: 'Pentru suport sau feedback, vă rugăm să ne contactați la: topper.top@example.com',
    },
    reset: {
      resetCache: 'Resetează Cache-ul',
      resetAllData: 'Resetează Toate Datele',
      clearLocalStorage: 'Șterge Local Storage',
      reloadPage: 'Reîncarcă Pagina',
    },
    debug: {
      title: 'DEBUG (Doar Dezvoltator)',
    },
  },
  ru: {
    language: 'Язык',
    loadingContent: 'Загрузка контента...',
    errorLoadingContent: 'Ошибка загрузки контента: ',
    noItemsAvailable: 'Нет доступных элементов',
    contentDisplay: 'Загрузка контента...',
    viewSource: 'Посмотреть источник',
    navigation: {
      prev: '← Назад',
      downvote: '↓ -1 (Не похоже)',
      upvote: '↑ +1 (Похожее)',
      skip: '→ Пропустить',
    },
    accordions: {
      information: 'Информация',
      filters: 'Фильтры',
      history: 'История',
      ratings: 'Рейтинги',
      statistics: 'Статистика',
      settings: 'Настройки',
      about: 'О нас',
      contact: 'Контакты',
      reset: 'Сброс (Разработчик)',
    },
    informationContent: {
      fullInfo: '',
      id: 'Ид:',
      title: 'Название:',
      description: 'Описание:',
      url: 'URL:',
      score: 'Оценка:',
      language: 'Язык:',
      published: 'Опубликовано:',
      created: 'Создано:',
      tags: 'Теги:',
      type: 'Тип:',
      category: 'Категория:',
    },
    filters: {
      contentTypes: 'Типы контента:',
      categories: 'Категории:',
      countriesGlobal: 'Страны/Глобальные:',
      applyFilters: 'Применить фильтры',
      clearFilters: 'Очистить фильтры',
      news: 'Новости',
      events: 'События',
      articles: 'Статьи',
      facts: 'Факты',
      ads: 'Реклама',
      nature: 'Природа',
      people: 'Люди',
      health: 'Здоровье',
      sports: 'Спорт',
      technology: 'Технологии',
      education: 'Образование',
      business: 'Бизнес',
      entertainment: 'Развлечения',
      global: 'Глобальные',
      romania: 'Румыния',
      russia: 'Россия',
      ukraine: 'Украина',
      usa: 'США',
      uk: 'Великобритания',
      germany: 'Германия',
    },
    history: {
      ratingHistory: 'История оценок',
      viewHistory: 'История просмотра',
      noRatings: 'Пока нет оценок',
      noViews: 'Пока нет просмотренных элементов',
    },
    ratings: {
      topRatings: 'Лучшие рейтинги',
      allTimeTop10: 'Топ 10 за всё время',
      top10News: 'Топ 10 Новостей',
      top10Technology: 'Топ 10 Технологий',
      top10Health: 'Топ 10 Здоровья',
      topRatedItems: 'Лучшие оценённые элементы:',
      noTopRated: 'Лучших элементов не найдено.',
      errorLoadingTop: 'Ошибка загрузки лучших рейтингов.',
    },
    statistics: {
      personalStats: 'Личная статистика',
      totalRatings: 'Всего оценок:',
      positiveRatings: 'Положительных оценок:',
      negativeRatings: 'Отрицательных оценок:',
      favoriteCategories: 'Любимые категории:',
      none: 'Нет',
      publicStats: 'Публичная статистика',
      totalItems: 'Всего элементов:',
      totalRatingsPublic: 'Всего оценок:',
      mostRatedCategory: 'Наиболее оцениваемая категория:',
      averageScore: 'Средняя оценка:',
    },
    settings: {
      autoLoad: 'Автоматически загружать следующий контент',
      itemsPerLoad: 'Элементов на загрузку:',
    },
    about: {
      title: 'Topper.top - Универсальная платформа рейтинга',
      version: 'Версия: 0.0.1',
      description:
        'Система оценки контента, которая позволяет пользователям оценивать и ранжировать контент.',
    },
    contact: {
      text: 'Для поддержки или обратной связи, пожалуйста, свяжитесь с нами: topper.top@example.com',
    },
    reset: {
      resetCache: 'Сбросить кэш',
      resetAllData: 'Сбросить все данные',
      clearLocalStorage: 'Очистить локальное хранилище',
      reloadPage: 'Перезагрузить страницу',
    },
    debug: {
      title: 'ОТЛАДКА (Только разработчик)',
    },
  },
  uk: {
    language: 'Мова',
    loadingContent: 'Завантаження контенту...',
    errorLoadingContent: 'Помилка завантаження контенту: ',
    noItemsAvailable: 'Немає доступних елементів',
    contentDisplay: 'Завантаження контенту...',
    viewSource: 'Переглянути джерело',
    navigation: {
      prev: '← Назад',
      downvote: '↓ -1 (Не схоже)',
      upvote: '↑ +1 (Схоже)',
      skip: '→ Пропустити',
    },
    accordions: {
      information: 'Інформація',
      filters: 'Фільтри',
      history: 'Історія',
      ratings: 'Рейтинги',
      statistics: 'Статистика',
      settings: 'Налаштування',
      about: 'Про нас',
      contact: 'Контакти',
      reset: 'Скидання (Розробник)',
    },
    informationContent: {
      fullInfo: '',
      id: 'Ід:',
      title: 'Назва:',
      description: 'Опис:',
      url: 'URL:',
      score: 'Оцінка:',
      language: 'Мова:',
      published: 'Опубліковано:',
      created: 'Створено:',
      tags: 'Теги:',
      type: 'Тип:',
      category: 'Категорія:',
    },
    filters: {
      contentTypes: 'Типи контенту:',
      categories: 'Категорії:',
      countriesGlobal: 'Країни/Глобальні:',
      applyFilters: 'Застосувати фільтри',
      clearFilters: 'Очистити фільтри',
      news: 'Новини',
      events: 'Події',
      articles: 'Статті',
      facts: 'Факти',
      ads: 'Реклама',
      nature: 'Природа',
      people: 'Люди',
      health: "Здоров'я",
      sports: 'Спорт',
      technology: 'Технології',
      education: 'Освіта',
      business: 'Бізнес',
      entertainment: 'Розваги',
      global: 'Глобальні',
      romania: 'Румунія',
      russia: 'Росія',
      ukraine: 'Україна',
      usa: 'США',
      uk: 'Великобританія',
      germany: 'Німеччина',
    },
    history: {
      ratingHistory: 'Історія оцінок',
      viewHistory: 'Історія перегляду',
      noRatings: 'Ще немає оцінок',
      noViews: 'Ще немає переглянутих елементів',
    },
    ratings: {
      topRatings: 'Найкращі рейтинги',
      allTimeTop10: 'Топ 10 за весь час',
      top10News: 'Топ 10 Новин',
      top10Technology: 'Топ 10 Технологій',
      top10Health: "Топ 10 Здоров'я",
      topRatedItems: 'Найвищі оцінені елементи:',
      noTopRated: 'Найкращих елементів не знайдено.',
      errorLoadingTop: 'Помилка завантаження найкращих рейтингів.',
    },
    statistics: {
      personalStats: 'Особиста статистика',
      totalRatings: 'Усього оцінок:',
      positiveRatings: 'Позитивних оцінок:',
      negativeRatings: 'Негативних оцінок:',
      favoriteCategories: 'Улюблені категорії:',
      none: 'Немає',
      publicStats: 'Публічна статистика',
      totalItems: 'Усього елементів:',
      totalRatingsPublic: 'Усього оцінок:',
      mostRatedCategory: 'Найбільш оцінювана категорія:',
      averageScore: 'Середня оцінка:',
    },
    settings: {
      autoLoad: 'Автоматично завантажувати наступний контент',
      itemsPerLoad: 'Елементів за завантаження:',
    },
    about: {
      title: 'Topper.top - Універсальна платформа рейтингу',
      version: 'Версия: 0.0.1',
      description:
        'Система оцінки контенту, яка дозволяє користувачам оцінювати та ранжувати контент.',
    },
    contact: {
      text: "Для підтримки або відгуків, будь ласка, зв'яжіться з нами: topper.top@example.com",
    },
    reset: {
      resetCache: 'Скинути кеш',
      resetAllData: 'Скинути всі дані',
      clearLocalStorage: 'Очистити локальне сховище',
      reloadPage: 'Перезавантажити сторінку',
    },
    debug: {
      title: 'НАЛАГОДЖЕННЯ (Лише розробник)',
    },
  },
};

// Update language selector to show only required languages
export function updateLanguageSelector() {
  const selector = document.getElementById('language-selector');
  if (!selector) return;

  selector.innerHTML = '';
  selector.innerHTML += '<option value="en">English</option>';
  selector.innerHTML += '<option value="ro">Romanian</option>';
  selector.innerHTML += '<option value="uk">Ukrainian</option>';
  selector.innerHTML += '<option value="ru">Russian</option>';
}

// Update the interface language based on selected language
export function updateInterfaceLanguage(currentLanguage) {
  const t = translations[currentLanguage];
  if (!t) return;

  // Update language selector label
  const languageLabel =
    document.querySelector('label[for="language-selector"]') ||
    document.querySelector('div:first-child label');
  if (languageLabel) {
    // Find the text node directly within the label and update it
    for (let i = 0; i < languageLabel.childNodes.length; i++) {
      const node = languageLabel.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = t.language + ': '; // Add a space after colon
        break;
      }
    }
  }

  // Update navigation buttons
  const prevButton = document.querySelector(
    'button[onclick="previousContent()"]'
  );
  if (prevButton) prevButton.textContent = t.navigation.prev;

  const downvoteButton = document.querySelector(
    'button[onclick="downvoteAndNext()"]'
  );
  if (downvoteButton) downvoteButton.textContent = t.navigation.downvote;

  const upvoteButton = document.querySelector(
    'button[onclick="upvoteAndNext()"]'
  );
  if (upvoteButton) upvoteButton.textContent = t.navigation.upvote;

  const skipButton = document.querySelector('button[onclick="skipContent()"]');
  if (skipButton) skipButton.textContent = t.navigation.skip;

  // Update accordion summaries
  const infoAccordion = document.querySelector(
    '#information-accordion summary'
  );
  if (infoAccordion) infoAccordion.textContent = t.accordions.information;

  const filtersAccordion = document.querySelector('#filters-accordion summary');
  if (filtersAccordion) filtersAccordion.textContent = t.accordions.filters;

  const historyAccordion = document.querySelector('#history-accordion summary');
  if (historyAccordion) historyAccordion.textContent = t.accordions.history;

  const ratingsAccordion = document.querySelector('#ratings-accordion summary');
  if (ratingsAccordion) ratingsAccordion.textContent = t.accordions.ratings;

  const statsAccordion = document.querySelector(
    '#statistics-accordion summary'
  );
  if (statsAccordion) statsAccordion.textContent = t.accordions.statistics;

  const settingsAccordion = document.querySelector(
    '#settings-accordion summary'
  );
  if (settingsAccordion) settingsAccordion.textContent = t.accordions.settings;

  const aboutAccordion = document.querySelector('#about-accordion summary');
  if (aboutAccordion) aboutAccordion.textContent = t.accordions.about;

  const contactAccordion = document.querySelector('#contact-accordion summary');
  if (contactAccordion) contactAccordion.textContent = t.accordions.contact;

  const resetAccordion = document.querySelector('#developer-reset summary');
  if (resetAccordion) resetAccordion.textContent = t.accordions.reset;

  // Update information content labels
  const fullInfoLabel = document.querySelector(
    '#information-content p:nth-child(1) strong'
  );
  if (fullInfoLabel) fullInfoLabel.textContent = t.informationContent.fullInfo;

  updateLabel(
    document.querySelector('#information-content p:nth-child(2) strong'),
    t.informationContent.id
  );
  updateLabel(
    document.querySelector('#information-content p:nth-child(3) strong'),
    t.informationContent.title
  );
  updateLabel(
    document.querySelector('#information-content p:nth-child(4) strong'),
    t.informationContent.description
  );
  updateLabel(
    document.querySelector('#information-content p:nth-child(5) strong'),
    t.informationContent.url
  );
  updateLabel(
    document.querySelector('#information-content p:nth-child(6) strong'),
    t.informationContent.score
  );
  updateLabel(
    document.querySelector('#information-content p:nth-child(7) strong'),
    t.informationContent.language
  );
  updateLabel(
    document.querySelector('#information-content p:nth-child(8) strong'),
    t.informationContent.published
  );
  updateLabel(
    document.querySelector('#information-content p:nth-child(9) strong'),
    t.informationContent.created
  );
  updateLabel(
    document.querySelector('#information-content p:nth-child(10) strong'),
    t.informationContent.tags
  );
  updateLabel(
    document.querySelector('#information-content p:nth-child(11) strong'),
    t.informationContent.type
  );
  updateLabel(
    document.querySelector('#information-content p:nth-child(12) strong'),
    t.informationContent.category
  );

  // Update filters section
  const typesLabel = document.querySelector(
    'details:nth-child(2) div div label'
  );
  if (typesLabel) typesLabel.textContent = t.filters.contentTypes;

  updateLabelWithInput(
    'input[name="type-filter"][value="news"]',
    t.filters.news
  );
  updateLabelWithInput(
    'input[name="type-filter"][value="events"]',
    t.filters.events
  );
  updateLabelWithInput(
    'input[name="type-filter"][value="articles"]',
    t.filters.articles
  );
  updateLabelWithInput(
    'input[name="type-filter"][value="facts"]',
    t.filters.facts
  );
  updateLabelWithInput('input[name="type-filter"][value="ads"]', t.filters.ads);

  // Update category labels
  const categoryInputs = document.querySelectorAll(
    'input[name="category-filter"]'
  );
  categoryInputs.forEach(input => {
    const inputElement = input as HTMLInputElement;
    const label = inputElement.nextElementSibling;
    if (label && label.tagName === 'LABEL') {
      switch (inputElement.value) {
        case 'nature':
          updateLabel(label, t.filters.nature);
          break;
        case 'people':
          updateLabel(label, t.filters.people);
          break;
        case 'health':
          updateLabel(label, t.filters.health);
          break;
        case 'sports':
          updateLabel(label, t.filters.sports);
          break;
        case 'technology':
          updateLabel(label, t.filters.technology);
          break;
        case 'education':
          updateLabel(label, t.filters.education);
          break;
        case 'business':
          updateLabel(label, t.filters.business);
          break;
        case 'entertainment':
          updateLabel(label, t.filters.entertainment);
          break;
      }
    }
  });

  // Update country labels
  const countryInputs = document.querySelectorAll(
    'input[name="country-filter"]'
  );
  countryInputs.forEach(input => {
    const inputElement = input as HTMLInputElement;
    const label = inputElement.nextElementSibling;
    if (label && label.tagName === 'LABEL') {
      switch (inputElement.value) {
        case 'global':
          updateLabel(label, t.filters.global);
          break;
        case 'ro':
          updateLabel(label, t.filters.romania);
          break;
        case 'ru':
          updateLabel(label, t.filters.russia);
          break;
        case 'ua':
          updateLabel(label, t.filters.ukraine);
          break;
        case 'us':
          updateLabel(label, t.filters.usa);
          break;
        case 'uk':
          updateLabel(label, t.filters.uk);
          break;
        case 'de':
          updateLabel(label, t.filters.germany);
          break;
      }
    }
  });

  // Update filter buttons
  const filterButtons = document.querySelectorAll(
    'details:nth-child(3) div button'
  );
  if (filterButtons.length >= 2) {
    filterButtons[0].textContent = t.filters.applyFilters;
    filterButtons[1].textContent = t.filters.clearFilters;
  }

  // Update history section
  const historySection = document.querySelector('#history-content');
  if (historySection) {
    const h4Elements = historySection.querySelectorAll('h4');
    if (h4Elements.length >= 2) {
      h4Elements[0].textContent = t.history.ratingHistory;
      h4Elements[1].textContent = t.history.viewHistory;
    }
  }

  // Update ratings section
  const ratingsSection = document.querySelector('#ratings-content');
  if (ratingsSection) {
    const h4Elements = ratingsSection.querySelectorAll('h4');
    if (h4Elements.length >= 1) {
      h4Elements[0].textContent = t.ratings.topRatings;

      // Update rating buttons
      const ratingButtons = ratingsSection.querySelectorAll(
        '#top-ratings-list button'
      );
      if (ratingButtons.length >= 4) {
        ratingButtons[0].textContent = t.ratings.allTimeTop10;
        ratingButtons[1].textContent = t.ratings.top10News;
        ratingButtons[2].textContent = t.ratings.top10Technology;
        ratingButtons[3].textContent = t.ratings.top10Health;
      }
    }
  }

  // Update statistics section
  const statsSection = document.querySelector('#statistics-content');
  if (statsSection) {
    const h4Elements = statsSection.querySelectorAll('h4');
    if (h4Elements.length >= 2) {
      h4Elements[0].textContent = t.statistics.personalStats;
      h4Elements[1].textContent = t.statistics.publicStats;
    }

    updateLabel(
      document.querySelector('#personal-stats p:nth-child(1) strong'),
      t.statistics.totalRatings
    );
    updateLabel(
      document.querySelector('#personal-stats p:nth-child(2) strong'),
      t.statistics.positiveRatings
    );
    updateLabel(
      document.querySelector('#personal-stats p:nth-child(3) strong'),
      t.statistics.negativeRatings
    );
    updateLabel(
      document.querySelector('#personal-stats p:nth-child(4) strong'),
      t.statistics.favoriteCategories
    );
    updateLabel(
      document.querySelector('#public-stats p:nth-child(1) strong'),
      t.statistics.totalItems
    );
    updateLabel(
      document.querySelector('#public-stats p:nth-child(2) strong'),
      t.statistics.totalRatingsPublic
    );
    updateLabel(
      document.querySelector('#public-stats p:nth-child(3) strong'),
      t.statistics.mostRatedCategory
    );
    updateLabel(
      document.querySelector('#public-stats p:nth-child(4) strong'),
      t.statistics.averageScore
    );
  }

  // Update settings section
  const autoLoadLabel = document.querySelector(
    '#auto-load + span, #auto-load + label'
  );
  if (autoLoadLabel) {
    autoLoadLabel.textContent = t.settings.autoLoad;
  }
  const itemsPerLoadLabel = document.querySelector(
    'label[for="items-per-load"], label:has(#items-per-load)'
  );
  if (itemsPerLoadLabel) {
    itemsPerLoadLabel.textContent = t.settings.itemsPerLoad;
  }

  // Update about section
  const aboutSection = document.querySelector('#about-accordion div');
  if (aboutSection) {
    const ps = aboutSection.querySelectorAll('p');
    if (ps.length >= 3) {
      ps[0].textContent = t.about.title;
      ps[1].textContent = t.about.version;
      ps[2].textContent = t.about.description;
    }
  }

  // Update contact section
  const contactSection = document.querySelector('#contact-accordion div p');
  if (contactSection) {
    contactSection.textContent = t.contact.text;
  }

  // Update reset section
  const resetButtons = document.querySelectorAll('#developer-reset div button');
  if (resetButtons.length >= 4) {
    resetButtons[0].textContent = t.reset.resetCache;
    resetButtons[1].textContent = t.reset.resetAllData;
    resetButtons[2].textContent = t.reset.clearLocalStorage;
    resetButtons[3].textContent = t.reset.reloadPage;
  }

  // Update debug section
  const debugSummary = document.querySelector('#developer-debug summary');
  if (debugSummary) debugSummary.textContent = t.debug.title;
}

// Helper function to update label text
function updateLabel(element: Element | null, newText: string) {
  if (element) {
    // Get the text node and replace it
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    if (textNodes.length > 0) {
      // Replace the text content of the first text node
      textNodes[0].textContent = newText;
    }
  }
}

// Helper function to update label associated with input
function updateLabelWithInput(selector, newText) {
  if (typeof selector === 'string') {
    const input = document.querySelector(selector);
    if (input) {
      const label = input.nextElementSibling;
      if (label && label.tagName === 'LABEL') {
        updateLabel(label, newText);
      }
    }
  } else {
    const input = selector;
    if (input) {
      const label = input.nextElementSibling;
      if (label && label.tagName === 'LABEL') {
        updateLabel(label, newText);
      }
    }
  }
}
