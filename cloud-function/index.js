'use strict';

const crypto = require('crypto');

// ============================================================
// Конфигурация (из переменных окружения)
// ============================================================

/** Секрет для HMAC-подписи кук */
const HMAC_SECRET = process.env.HMAC_SECRET || '';

/** URL origin на GitHub Pages (без trailing slash) */
const ORIGIN_URL = (process.env.ORIGIN_URL || '').replace(/\/+$/, '');

/** JSON с хешами кодов доступа */
const ACCESS_HASHES = JSON.parse(process.env.ACCESS_HASHES || '{}');

/** Имя куки сессии */
const COOKIE_NAME = '__session';

/** Максимум попыток авторизации с одного IP */
const MAX_ATTEMPTS = 10;

/** Окно rate-limit (15 минут) */
const RATE_WINDOW_MS = 15 * 60 * 1000;

/**
 * In-memory rate-limiter.
 * Сбрасывается при холодном старте — допустимо для прототипов.
 * @type {Map<string, {count: number, resetAt: number}>}
 */
const rateLimitMap = new Map();

/** Максимальный размер карты rate-limit (защита от переполнения памяти) */
const RATE_MAP_MAX_SIZE = 10000;

/** Content-Type, которые считаются бинарными */
const BINARY_CONTENT_PREFIXES = [
  'image/',
  'font/',
  'audio/',
  'video/',
  'application/octet-stream',
  'application/wasm',
  'application/pdf',
  'application/zip',
  'application/gzip',
  'application/x-tar',
  'application/vnd.',
];

// ============================================================
// Утилиты: криптография
// ============================================================

/**
 * SHA-256 хеш строки → hex
 * @param {string} str
 * @returns {string}
 */
function sha256(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

/**
 * HMAC-SHA256 подпись → hex
 * @param {string} data
 * @returns {string}
 */
function hmacSign(data) {
  return crypto.createHmac('sha256', HMAC_SECRET).update(data, 'utf8').digest('hex');
}

/**
 * Constant-time сравнение двух строк.
 * Предотвращает timing-атаки при сравнении хешей.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// ============================================================
// Утилиты: Base64url
// ============================================================

/**
 * Base64url-кодирование строки (RFC 4648 §5, без паддинга)
 * @param {string} str
 * @returns {string}
 */
function base64urlEncode(str) {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64url-декодирование обратно в строку
 * @param {string} encoded
 * @returns {string}
 */
function base64urlDecode(encoded) {
  let str = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

// ============================================================
// Утилиты: куки
// ============================================================

/**
 * Создание подписанной куки: base64url(payload).hmac(payload)
 * @param {{type: string, slugs: string[]}} payload — данные сессии
 * @param {number} ttlDays — время жизни в днях
 * @returns {string} значение куки
 */
function createSignedCookie(payload, ttlDays) {
  const exp = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  const data = { ...payload, exp };
  const json = JSON.stringify(data);
  const encoded = base64urlEncode(json);
  const sig = hmacSign(encoded);
  return `${encoded}.${sig}`;
}

/**
 * Парсинг и валидация подписанной куки.
 * Проверяет HMAC-подпись и срок действия.
 * @param {string|null} cookieValue
 * @returns {{type: string, slugs: string[], exp: number}|null}
 */
function parseSignedCookie(cookieValue) {
  if (!cookieValue || typeof cookieValue !== 'string') return null;

  const dotIndex = cookieValue.lastIndexOf('.');
  if (dotIndex === -1) return null;

  const encoded = cookieValue.substring(0, dotIndex);
  const sig = cookieValue.substring(dotIndex + 1);

  // Проверка HMAC-подписи (constant-time)
  const expectedSig = hmacSign(encoded);
  if (!safeCompare(sig, expectedSig)) return null;

  try {
    const json = base64urlDecode(encoded);
    const payload = JSON.parse(json);

    // Проверка срока действия
    if (!payload.exp || typeof payload.exp !== 'number' || Date.now() > payload.exp) {
      return null;
    }

    // Проверка обязательных полей
    if (!payload.type || !Array.isArray(payload.slugs)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Извлечение значения конкретной куки из заголовка Cookie
 * @param {Record<string, string>} headers
 * @param {string} name
 * @returns {string|null}
 */
function getCookie(headers, name) {
  const raw = headers?.Cookie || headers?.cookie || '';
  // Ищем нужную куку; значение может содержать '.' и '=' (base64url)
  const re = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`);
  const match = raw.match(re);
  return match ? decodeURIComponent(match[1]) : null;
}

// ============================================================
// Утилиты: сеть и rate-limiting
// ============================================================

/**
 * Получение IP-адреса клиента из заголовков
 * @param {object} event
 * @returns {string}
 */
function getClientIp(event) {
  const forwarded =
    event.headers?.['X-Forwarded-For'] ||
    event.headers?.['x-forwarded-for'] ||
    '';
  if (forwarded) return forwarded.split(',')[0].trim();

  return (
    event.requestContext?.identity?.sourceIp ||
    'unknown'
  );
}

/**
 * Проверка rate-limit для IP.
 * @param {string} ip
 * @returns {boolean} true = запрос разрешён, false = превышен лимит
 */
function checkRateLimit(ip) {
  const now = Date.now();

  // Периодическая очистка просроченных записей (защита от утечки памяти)
  if (rateLimitMap.size > RATE_MAP_MAX_SIZE) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  let entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateLimitMap.set(ip, entry);
  }

  entry.count++;
  return entry.count <= MAX_ATTEMPTS;
}

/**
 * Определение, является ли content-type бинарным
 * @param {string} contentType
 * @returns {boolean}
 */
function isBinaryContentType(contentType) {
  if (!contentType) return false;
  const lower = contentType.toLowerCase();
  return BINARY_CONTENT_PREFIXES.some((prefix) => lower.includes(prefix));
}

/**
 * Собирает query string из объекта параметров
 * @param {Record<string, string>|undefined} params
 * @returns {string} готовая строка вида "?key=val&..." или ""
 */
function buildQueryString(params) {
  if (!params || typeof params !== 'object') return '';
  const entries = Object.entries(params).filter(([, v]) => v != null);
  if (entries.length === 0) return '';
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `?${qs}`;
}

// ============================================================
// Аутентификация: проверка кода
// ============================================================

/**
 * Проверяет код доступа по хешам из конфигурации.
 * Возвращает информацию о доступе или null, если код невалиден.
 *
 * Порядок проверки: мастер → группы → индивидуальные.
 *
 * @param {string} code — введённый пользователем код
 * @returns {{type: string, slugs: string[], ttlDays: number}|null}
 */
function authenticateCode(code) {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;

  const hash = sha256(trimmed);

  // 1. Мастер-код (полный доступ)
  if (ACCESS_HASHES.masterHash && safeCompare(hash, ACCESS_HASHES.masterHash)) {
    return {
      type: 'master',
      slugs: ['*'],
      ttlDays: ACCESS_HASHES.masterTtlDays || 30,
    };
  }

  // 2. Групповые коды (доступ к набору прототипов)
  if (Array.isArray(ACCESS_HASHES.groups)) {
    for (const group of ACCESS_HASHES.groups) {
      if (group.hash && safeCompare(hash, group.hash)) {
        return {
          type: 'group',
          slugs: group.slugs || [],
          ttlDays: group.ttlDays || 7,
        };
      }
    }
  }

  // 3. Индивидуальные коды (доступ к одному прототипу)
  if (ACCESS_HASHES.prototypes && typeof ACCESS_HASHES.prototypes === 'object') {
    for (const [slug, proto] of Object.entries(ACCESS_HASHES.prototypes)) {
      if (proto.hash && safeCompare(hash, proto.hash)) {
        return {
          type: 'proto',
          slugs: [slug],
          ttlDays: proto.ttlDays || 7,
        };
      }
    }
  }

  return null;
}

// ============================================================
// Прокси: проксирование запроса к GitHub Pages
// ============================================================

/**
 * Проксирует GET-запрос к origin (GitHub Pages) и возвращает ответ
 * в формате Yandex Cloud Functions.
 *
 * @param {string} path — путь запроса (начинается с /)
 * @param {string} queryString — query-параметры
 * @returns {Promise<object>} ответ функции
 */
async function proxyToOrigin(path, queryString) {
  const url = `${ORIGIN_URL}${path}${queryString}`;

  /** @type {Response} */
  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'View21-Proxy/1.0',
        Accept: '*/*',
      },
      redirect: 'follow',
    });
  } catch (err) {
    return {
      statusCode: 502,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
      body: errorPageHtml(
        '502 — Ошибка проксирования',
        `Не удалось получить ответ от origin: ${err.message}`,
      ),
    };
  }

  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const isBinary = isBinaryContentType(contentType);

  let body;
  let isBase64Encoded = false;

  if (isBinary) {
    // Бинарный контент → base64
    const buffer = Buffer.from(await response.arrayBuffer());
    body = buffer.toString('base64');
    isBase64Encoded = true;
  } else {
    body = await response.text();
  }

  // Формируем заголовки ответа
  const isHtml = contentType.includes('text/html');
  const responseHeaders = {
    'Content-Type': contentType,
    'Cache-Control': isHtml
      ? 'no-cache, no-store, must-revalidate'
      : 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  };

  // Копируем полезные заголовки от origin
  for (const name of ['etag', 'last-modified']) {
    const val = response.headers.get(name);
    if (val) responseHeaders[name] = val;
  }

  return {
    statusCode: response.status,
    headers: responseHeaders,
    body,
    isBase64Encoded,
  };
}

// ============================================================
// HTML: страница логина
// ============================================================

/**
 * Генерирует самостоятельную HTML-страницу авторизации.
 * Без внешних зависимостей — всё инлайн.
 *
 * @param {string} [errorMessage] — текст ошибки (если есть)
 * @returns {string} полный HTML-документ
 */
function loginPageHtml(errorMessage = '') {
  const errorBlock = errorMessage
    ? `<div class="error" role="alert">${escapeHtml(errorMessage)}</div>`
    : '';

  return /* html */ `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Доступ к прототипам</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      height: 100%;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                   'Helvetica Neue', Arial, sans-serif;
      background: #0c0d12;
      color: #d4d4d8;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .card {
      background: #18191f;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      padding: 48px 36px 40px;
      width: 100%;
      max-width: 420px;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.03),
        0 24px 80px rgba(0, 0, 0, 0.6);
    }

    .icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      margin: 0 auto 20px;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 16px;
    }

    .icon-wrap svg {
      width: 28px;
      height: 28px;
      color: #818cf8;
    }

    h1 {
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      color: #f4f4f5;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }

    .subtitle {
      text-align: center;
      font-size: 14px;
      color: #71717a;
      margin-bottom: 32px;
      line-height: 1.5;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #a1a1aa;
      margin-bottom: 8px;
    }

    input[type="text"] {
      width: 100%;
      padding: 14px 16px;
      background: #0f1015;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      color: #f4f4f5;
      font-size: 16px;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    input[type="text"]::placeholder {
      color: #3f3f46;
      letter-spacing: 0.5px;
      text-transform: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    input[type="text"]:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    }

    button[type="submit"] {
      width: 100%;
      margin-top: 24px;
      padding: 14px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s ease, transform 0.1s ease;
      letter-spacing: 0.01em;
    }

    button[type="submit"]:hover {
      opacity: 0.92;
    }

    button[type="submit"]:active {
      transform: scale(0.98);
    }

    .error {
      margin-top: 20px;
      padding: 14px 16px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 12px;
      color: #f87171;
      font-size: 14px;
      text-align: center;
      line-height: 1.4;
    }

    .footer {
      text-align: center;
      margin-top: 24px;
      font-size: 12px;
      color: #3f3f46;
    }

    /* Мобильная адаптация */
    @media (max-width: 480px) {
      .card {
        padding: 36px 24px 32px;
        border-radius: 16px;
      }

      h1 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </div>
    <h1>Доступ к прототипам</h1>
    <p class="subtitle">Введите код доступа для продолжения</p>

    <form method="POST" action="/__auth" autocomplete="off">
      <label for="code">Код доступа</label>
      <input
        type="text"
        id="code"
        name="code"
        placeholder="Введите код"
        autocomplete="off"
        autocapitalize="characters"
        autocorrect="off"
        spellcheck="false"
        maxlength="20"
        autofocus
        required
      />
      <button type="submit">Войти</button>
    </form>

    ${errorBlock}

    <div class="footer">Прототипы · Системная аналитика</div>
  </div>
</body>
</html>`;
}

// ============================================================
// HTML: страница ошибки прокси
// ============================================================

/**
 * Генерирует минимальную страницу ошибки
 * @param {string} title
 * @param {string} message
 * @returns {string}
 */
function errorPageHtml(title, message) {
  return /* html */ `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0c0d12; color: #d4d4d8;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0; padding: 16px;
    }
    .box {
      text-align: center; max-width: 480px;
    }
    h1 { font-size: 28px; color: #f87171; margin-bottom: 12px; }
    p  { font-size: 15px; color: #a1a1aa; line-height: 1.5; }
    a  { color: #818cf8; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="box">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <p style="margin-top:20px"><a href="/">← На главную</a></p>
  </div>
</body>
</html>`;
}

/**
 * Экранирование HTML-символов (XSS-защита)
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// Вспомогательные ответы
// ============================================================

/**
 * Формирует HTTP-ответ с редиректом
 * @param {string} location
 * @param {Record<string, string>} [extraHeaders]
 * @returns {object}
 */
function redirect(location, extraHeaders = {}) {
  return {
    statusCode: 302,
    headers: { Location: location, ...extraHeaders },
    body: '',
  };
}

/**
 * Формирует HTML-ответ
 * @param {number} statusCode
 * @param {string} html
 * @returns {object}
 */
function htmlResponse(statusCode, html) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
    body: html,
  };
}

/**
 * Формирует строку Set-Cookie для сессии
 * @param {string} value — значение куки
 * @param {number} maxAgeSec — время жизни в секундах
 * @returns {string}
 */
function sessionCookieHeader(value, maxAgeSec) {
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

/**
 * Формирует строку Set-Cookie для удаления сессии
 * @returns {string}
 */
function clearSessionCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// ============================================================
// Главный обработчик Yandex Cloud Function
// ============================================================

/**
 * Точка входа — обработчик HTTP-запроса.
 *
 * Формат входа/выхода: Yandex Cloud Functions + API Gateway.
 * @see https://yandex.cloud/ru/docs/functions/concepts/function-invoke
 *
 * @param {object} event   — HTTP-событие (httpMethod, path, headers, body, ...)
 * @param {object} context — контекст выполнения функции
 * @returns {Promise<{statusCode: number, headers: object, body: string, isBase64Encoded?: boolean}>}
 */
module.exports.handler = async function handler(event, context) {
  const method = (event.httpMethod || 'GET').toUpperCase();
  const path = event.path || '/';
  const headers = event.headers || {};

  // ────────────────────────────────────────────────────────
  // Сценарий C: POST /__logout — очистка сессии
  // ────────────────────────────────────────────────────────
  if (method === 'POST' && path === '/__logout') {
    return redirect('/', {
      'Set-Cookie': clearSessionCookieHeader(),
    });
  }

  // ────────────────────────────────────────────────────────
  // Сценарий B: POST /__auth — аутентификация по коду
  // ────────────────────────────────────────────────────────
  if (method === 'POST' && path === '/__auth') {
    const ip = getClientIp(event);

    // Rate-limit: защита от перебора кодов
    if (!checkRateLimit(ip)) {
      return htmlResponse(
        429,
        loginPageHtml('Слишком много попыток. Подождите 15 минут и попробуйте снова.'),
      );
    }

    // Разбор тела запроса (application/x-www-form-urlencoded)
    let rawBody = event.body || '';
    if (event.isBase64Encoded) {
      rawBody = Buffer.from(rawBody, 'base64').toString('utf8');
    }

    const params = new URLSearchParams(rawBody);
    const code = (params.get('code') || '').trim();

    if (!code) {
      return htmlResponse(400, loginPageHtml('Введите код доступа.'));
    }

    // Проверка кода по хешам
    const auth = authenticateCode(code);

    if (!auth) {
      return htmlResponse(403, loginPageHtml('Неверный код доступа. Попробуйте ещё раз.'));
    }

    // Код верный — создаём подписанную куку
    const cookieValue = createSignedCookie(
      { type: auth.type, slugs: auth.slugs },
      auth.ttlDays,
    );
    const maxAgeSec = auth.ttlDays * 24 * 60 * 60;

    return redirect('/', {
      'Set-Cookie': sessionCookieHeader(cookieValue, maxAgeSec),
    });
  }

  // ────────────────────────────────────────────────────────
  // Сценарий A: GET * — проверка сессии → прокси или логин
  // ────────────────────────────────────────────────────────

  // Извлекаем и проверяем куку сессии
  const sessionValue = getCookie(headers, COOKIE_NAME);
  const session = parseSignedCookie(sessionValue);

  // Нет валидной сессии → показываем страницу логина
  if (!session) {
    return htmlResponse(200, loginPageHtml());
  }

  // Сессия валидна → проксируем запрос к GitHub Pages
  const queryString = buildQueryString(event.queryStringParameters);

  try {
    return await proxyToOrigin(path, queryString);
  } catch (err) {
    // Непредвиденная ошибка проксирования
    return htmlResponse(
      502,
      errorPageHtml('502 — Ошибка', `Не удалось загрузить страницу: ${err.message}`),
    );
  }
};
