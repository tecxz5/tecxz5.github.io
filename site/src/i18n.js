export const translations = {
  ru: {
    nav: {
      about: 'обо мне',
      services: 'услуги',
      portfolio: 'портфолио',
      links: 'ссылки',
      switchAria: 'Сменить язык сайта',
    },
    top: {
      hint: 'просто листай вверх/вниз',
    },
    slides: {
      about: 'О себе',
      services: 'Услуги',
      portfolio: 'Портфолио',
    },
    about: {
      badge: 'Разработчик',
      title: 'Привет, я tecxz5',
      desc: 'Пишу ботов, веб-приложения и шейдерную графику. Предпочитаю чистый код, высокую производительность и простые интерфейсы без лишних зависимостей.',
      lastfmBadge: 'LAST.FM',
      lastfmLoading: 'загрузка...',
      lastfmWaiting: 'Ожидание данных...',
      lastfmProfile: 'Профиль tecxz5',
      nowPlaying: 'сейчас играет',
      lastPlayed: 'последний трек',
      offline: 'офлайн',
      fallbackText: 'у тебя ласт.фм недоступен',
      fallbackError: 'не удалось получить данные',
      justNow: 'только что',
      recently: 'недавно',
      yesterday: 'вчера',
      minAgo: (m) => `${m} мин назад`,
      hourAgo: (h) => `${h} ч назад`,
      daysAgo: (d) => `${d} дн назад`,
      scrobbles: (count) => `${count} треков`,
      wasOnline: (time) => `был в сети: ${time}`,
    },
    services: {
      hint: 'нажми на карточку для подробностей',
      contactBtn: 'Связаться в Telegram',
      cardScripts: {
        badge: 'Скрипты',
        sub: 'боты / скрипты',
        detailsTitle: 'Подробности об услугах',
        notice: 'Ратки, стилеры и вредоносный софт не пишу',
        item1Title: 'Telegram и Discord боты',
        item1Desc: 'Боты для автоматизации, интеграции с внешними API и приема платежей. Настройка сервера и деплой.',
        item1Price: 'от 1 000 ₽',
        item2Title: 'Плагины для exteraGram и AyuGram',
        item2Desc: 'Кастомные патчи и модули для клиентов Telegram.',
        item2PriceHtml: 'Бесплатно <small>(срочные: от 500 ₽)</small>',
      },
      cardSites: {
        badge: 'Сайты',
        sub: 'визитки / сервисы',
        detailsTitle: 'Подробности об услугах',
        notice: 'Верстка по макету (Figma). Без дизайна проектирование интерфейса оплачивается отдельно',
        item1Title: 'Лендинги и визитки',
        item1Desc: 'Быстрая адаптивная верстка, микроанимации, деплой на сервер или GitHub Pages.',
        item1Price: 'от 3 000 ₽',
        item2Title: 'Сервисы и веб-приложения',
        item2Desc: 'Панели управления, интеграции по API, сложные клиентские интерфейсы.',
        item2Price: 'от 10 000 ₽',
      },
    },
    portfolio: {
      card1: {
        title: 'Генератор фонов',
        desc: 'Интерактивный холст: сетки из Material Icons, шейдерные сдвиги и экспорт настроек.',
        action: 'Открыть генератор',
      },
      card2: {
        title: 'mus-downloader',
        desc: 'Консольная утилита для скачивания музыки в FLAC и MP3 с обложками и метаданными.',
        action: 'GitHub: mus-downloader',
      },
      card3: {
        title: 'Telegram-боты',
        desc: 'Боты для автоматизации каналов, парсинга медиа и интерактива со слотами.',
        chatInitial: 'Испытай удачу! Жми /slots ниже:',
        chatSpinning: 'Крутим...',
        chatWin: 'ДЖЕКПОТ! +1000 монет!',
        chatLose: 'Не повезло! Попробуй еще раз.',
        chatCmd: '/slots',
      },
    },
    footer: {
      ariaLinks: 'Ссылки',
    },
  },
  en: {
    nav: {
      about: 'about',
      services: 'services',
      portfolio: 'portfolio',
      links: 'links',
      switchAria: 'Switch website language',
    },
    top: {
      hint: 'scroll up/down to navigate',
    },
    slides: {
      about: 'About',
      services: 'Services',
      portfolio: 'Portfolio',
    },
    about: {
      badge: 'Developer',
      title: 'Hey, I\'m tecxz5',
      desc: 'Building bots, web applications, and shader graphics. Focused on clean code, strong performance, and lightweight interfaces with no bloat.',
      lastfmBadge: 'LAST.FM',
      lastfmLoading: 'loading...',
      lastfmWaiting: 'Waiting for data...',
      lastfmProfile: 'tecxz5 profile',
      nowPlaying: 'now playing',
      lastPlayed: 'last track',
      offline: 'offline',
      fallbackText: 'last.fm is unreachable',
      fallbackError: 'failed to fetch tracks',
      justNow: 'just now',
      recently: 'recently',
      yesterday: 'yesterday',
      minAgo: (m) => `${m}m ago`,
      hourAgo: (h) => `${h}h ago`,
      daysAgo: (d) => `${d}d ago`,
      scrobbles: (count) => `${count} scrobbles`,
      wasOnline: (time) => `last active: ${time}`,
    },
    services: {
      hint: 'click a card for details',
      contactBtn: 'Contact via Telegram',
      cardScripts: {
        badge: 'Scripts',
        sub: 'bots / scripts',
        detailsTitle: 'Service Details',
        notice: 'No RATs, stealers, or malware development',
        item1Title: 'Telegram & Discord Bots',
        item1Desc: 'Bots for channel automation, external API integration, and payments. Server configuration and deployment included.',
        item1Price: 'from 1,000 ₽',
        item2Title: 'Plugins for exteraGram & AyuGram',
        item2Desc: 'Custom patches and client modules for Telegram forks.',
        item2PriceHtml: 'Free <small>(urgent: from 500 ₽)</small>',
      },
      cardSites: {
        badge: 'Websites',
        sub: 'landing / web apps',
        detailsTitle: 'Service Details',
        notice: 'Frontend from Figma mockups. UI/UX design without existing layouts is priced separately',
        item1Title: 'Landing Pages & Promo Sites',
        item1Desc: 'Fast responsive layouts, smooth micro-interactions, deployment to VPS or GitHub Pages.',
        item1Price: 'from 3,000 ₽',
        item2Title: 'Web Apps & Dashboards',
        item2Desc: 'Admin panels, REST API integrations, and complex client-side applications.',
        item2Price: 'from 10,000 ₽',
      },
    },
    portfolio: {
      card1: {
        title: 'Background Generator',
        desc: 'Interactive canvas: Material Icons grids, shader distortion, and preset exports.',
        action: 'Open Generator',
      },
      card2: {
        title: 'mus-downloader',
        desc: 'Console utility to download music in FLAC and MP3 with covers and metadata.',
        action: 'GitHub: mus-downloader',
      },
      card3: {
        title: 'Telegram Bots',
        desc: 'Bots for channel automation, media scraping, and interactive mini-games.',
        chatInitial: 'Test your luck! Tap /slots below:',
        chatSpinning: 'Spinning...',
        chatWin: 'JACKPOT! +1,000 coins!',
        chatLose: 'No luck! Give it another spin.',
        chatCmd: '/slots',
      },
    },
    footer: {
      ariaLinks: 'Links',
    },
  },
};

const STORAGE_KEY = 'site_lang';

function getNested(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

export function detectLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'ru' || saved === 'en') return saved;
  const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  return browserLang.startsWith('ru') ? 'ru' : 'en';
}

let activeLang = 'ru';

export function getLanguage() {
  return activeLang;
}

export function t(key, params) {
  const currentDict = translations[activeLang] || translations.ru;
  const value = getNested(currentDict, key);
  if (typeof value === 'function') {
    return value(params);
  }
  return value ?? key;
}

export function applyLanguage(lang) {
  if (lang !== 'ru' && lang !== 'en') lang = 'ru';
  activeLang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore in private mode
  }

  document.documentElement.lang = lang;
  const currentDict = translations[lang];

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = getNested(currentDict, key);
    if (typeof val === 'string') {
      el.textContent = val;
    }
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    const val = getNested(currentDict, key);
    if (typeof val === 'string') {
      el.innerHTML = val;
    }
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    const val = getNested(currentDict, key);
    if (typeof val === 'string') {
      el.setAttribute('aria-label', val);
    }
  });

  const langBtn = document.getElementById('lang-switch-btn');
  if (langBtn) {
    langBtn.setAttribute('aria-label', currentDict.nav.switchAria);
    langBtn.querySelectorAll('.lang-tag').forEach((tag) => {
      tag.classList.toggle('is-active', tag.getAttribute('data-lang') === lang);
    });
  }

  window.dispatchEvent(new CustomEvent('site-language-change', { detail: { lang } }));
}

export function initI18n() {
  const initial = detectLanguage();
  applyLanguage(initial);

  const langBtn = document.getElementById('lang-switch-btn');
  if (langBtn) {
    langBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const next = activeLang === 'ru' ? 'en' : 'ru';
      applyLanguage(next);
    });
  }
}
