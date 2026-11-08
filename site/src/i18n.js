// Русские плюрали: 1 трек, 2-4 трека, 5+ треков, 11-14 треков.
// n может прийти готовой строкой ("3 941") — приводим к целому до форматирования.
function pluralRu(n, one, few, many) {
  const num = Math.trunc(Number(String(n).replace(/[^\d]/g, '')));
  if (!Number.isFinite(num)) return many;
  const t = num % 100, o = num % 10;
  if (t >= 11 && t <= 14) return many;
  if (o === 1) return one;
  if (o >= 2 && o <= 4) return few;
  return many;
}

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
      title: 'Привет, я <span class="about-card__title-accent">t5</span>',
      desc: 'Вроде как что-то делаю, пусть этот сайт и доделал спустя полгода...',
      lastfmBadge: 'Last.fm',
      lastfmLoading: 'загрузка...',
      lastfmWaiting: 'Ожидание данных...',
      lastfmProfile: 'Профиль на last.fm',
      nowPlaying: 'сейчас играет',
      lastPlayed: 'последний трек',
      offline: 'офлайн',
      fallbackText: 'last.fm не отвечает',
      fallbackError: 'не удалось получить данные',
      justNow: 'только что',
      recently: 'недавно',
      yesterday: 'вчера',
      minAgo: (m) => `${m} мин назад`,
      hourAgo: (h) => `${h} ч назад`,
      daysAgo: (d) => `${d} ${pluralRu(d, 'день', 'дня', 'дней')} назад`,
      wasOnline: (time) => `был в сети: ${time}`,
      noName: 'Без названия',
      noArtist: 'Неизвестный исполнитель',
      coverAlt: 'Обложка трека',
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
        desc: 'Генератор процедурных обоев на чистом WebGL. Раскладывает иконки в сетки, крутит шейдерные искажения и отдает конфиг.',
        action: 'Открыть генератор',
      },
      card2: {
        title: 'mus-downloader',
        desc: 'Качает треки в FLAC и MP3 напрямую из Soulseek, Deezer и YouTube. Сам подтягивает теги с обложками, жмет в честный 320 kbps и отдает через CLI или TG-бота до 2 ГБ.',
        action: 'GitHub: mus-downloader',
      },
      card3: {
        title: 'Telegram-боты',
        desc: 'Боты на aiogram: автопостинг в каналы, парсинг контента, скачивание медиа и мини-игры со слотами.',
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
      title: 'Hey, I\'m <span class="about-card__title-accent">t5</span>',
      desc: 'I kinda build stuff, even if it took me half a year to finally finish this site...',
      lastfmBadge: 'Last.fm',
      lastfmLoading: 'loading...',
      lastfmWaiting: 'Waiting for data...',
      lastfmProfile: 'Last.fm profile',
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
      wasOnline: (time) => `last active: ${time}`,
      noName: 'Untitled',
      noArtist: 'Unknown artist',
      coverAlt: 'Album cover',
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
        desc: 'Procedural wallpaper generator on pure WebGL. Grids of icons, shader distortion passes, and live config export.',
        action: 'Open Generator',
      },
      card2: {
        title: 'mus-downloader',
        desc: 'Downloads tracks in FLAC and MP3 from Soulseek, Deezer, and YouTube. Pulls metadata and covers, transcodes to 320 kbps, and delivers via CLI or a TG bot up to 2 GB.',
        action: 'GitHub: mus-downloader',
      },
      card3: {
        title: 'Telegram Bots',
        desc: 'Bots on aiogram: channel automation, content scraping, media downloading, and mini-games with slots.',
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

  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const key = el.getAttribute('data-i18n-alt');
    const val = getNested(currentDict, key);
    if (typeof val === 'string') {
      el.setAttribute('alt', val);
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
