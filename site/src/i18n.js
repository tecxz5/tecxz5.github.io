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
      hint: 'нажми для подробностей',
      contactBtn: 'Связаться в Telegram',
      cardScripts: {
        badge: 'Скрипты',
        sub: 'боты / скрипты',
        detailsTitle: 'Подробности об услугах',
        notice: 'Ратки, стилеры и подобное не пишу.',
        item1Title: 'Telegram и Discord боты',
        item1Desc: 'Боты для автоматизации, стараюсь делать способными для работы на картошке.',
        item1Price: 'от 1 000 ₽',
        item2Title: 'Плагины для exteraGram/AyuGram',
        item2Desc: 'da.',
        item2PriceHtml: 'Бесплатно <small>(срочные: от 500 ₽)</small>',
      },
      cardSites: {
        badge: 'Сайты',
        sub: 'визитки / сервисы',
        detailsTitle: 'Подробности об услугах',
        notice: 'Верстка по макету, и только. Если дизайна нет — помогу набросать интерфейс, но это обсуждается отдельно',
        item1Title: 'Лендинги и визитки',
        item1Desc: 'Одностраничник, или как этот.',
        item1Price: 'от 3 000 ₽',
        item2Title: 'Сервисы и веб-приложения',
        item2Desc: 'Админки, личные кабинеты, подключение API и баз данных..',
        item2Price: 'от 10 000 ₽',
      },
      contract: {
        badge: 'Условия работы',
        pdfLink: 'contract.pdf',
        item1Title: 'Исходный код и права',
        item1Desc: 'Весь написанный код и архитектура остаются у меня при любых обстоятельствах, это не обсуждается. Вы получаете готовый проект, а полный выкуп прав оговаривается отдельно.',
        item2Title: 'Гарантия на баги',
        item2Desc: 'Если в работе всплывет мой косяк или баг, не замеченный при сдаче — поправлю быстро и бесплатно по гарантии.',
        item3Title: 'Поддержка проекта',
        item3Desc: 'Бесплатно на постоянной поддержке «за спасибо» не сижу, у меня есть личная жизнь. Нужен регулярный мейнтенанс или дежурство — договариваемся на фикс или абонентку.',
        item4Title: 'Нарушение условий и&nbsp;цены',
        item4Desc: 'Если нарушаются договоренности по оплате, ТЗ или адекватной коммуникации — имею право отказаться от проекта в одностороннем порядке либо поднять ценник от 1.5x.',
        item5Title: 'Деплой и&nbsp;хостинг',
        item5Desc: 'Помогу с деплоем всего — но с одним но: за хостинг платите вы.',
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
      hint: 'click for details',
      contactBtn: 'Contact via Telegram',
      cardScripts: {
        badge: 'Scripts',
        sub: 'bots / scripts',
        detailsTitle: 'Service Details',
        notice: 'No RATs, stealers, or similar stuff.',
        item1Title: 'Telegram & Discord Bots',
        item1Desc: 'Automation bots, trying to make them capable of running on a potato.',
        item1Price: 'from 1,000 ₽',
        item2Title: 'Plugins for exteraGram/AyuGram',
        item2Desc: 'yes.',
        item2PriceHtml: 'Free <small>(urgent: from 500 ₽)</small>',
      },
      cardSites: {
        badge: 'Websites',
        sub: 'landing / web apps',
        detailsTitle: 'Service Details',
        notice: 'Layout strictly from mockups. If there is no design, I can help sketch an interface, but that is discussed separately',
        item1Title: 'Landing Pages & Promo Sites',
        item1Desc: 'One-page site, or like this one.',
        item1Price: 'from 3,000 ₽',
        item2Title: 'Web Apps & Dashboards',
        item2Desc: 'Admin panels, user dashboards, API and database integrations..',
        item2Price: 'from 10,000 ₽',
      },
      contract: {
        badge: 'Terms & Conditions',
        pdfLink: 'contract.pdf',
        item1Title: 'Source Code & Rights',
        item1Desc: 'All code and architecture remain mine under any circumstances, non-negotiable. You get a working project; full IP buyout is discussed separately.',
        item2Title: 'Bug Warranty',
        item2Desc: 'If a bug or mistake on my end surfaces after handover, I will fix it quickly and free of charge under warranty.',
        item3Title: 'Project Maintenance',
        item3Desc: 'I do not provide free 24/7 support "for a thank you" — I have a personal life. If you need ongoing maintenance, we arrange a fixed retainer.',
        item4Title: 'Breach of Terms &amp;&nbsp;Pricing',
        item4Desc: 'If agreed terms, payment schedules, or sane communication are violated, I reserve the right to drop the project or raise the price from 1.5x.',
        item5Title: 'Deployment &amp;&nbsp;Hosting',
        item5Desc: 'I will help deploy everything — with one catch: hosting is on you.',
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
