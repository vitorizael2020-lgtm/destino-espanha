const COOKIE_NAME = "de_tracking_session";
const COOKIE_PATH = "/acompanhar/3903444641a3371ce99f2b56";
const SESSION_SECONDS = 12 * 60 * 60;
const DISPLAY_TIME_ZONE = "Europe/Madrid";
const MAX_LOGIN_BODY_BYTES = 1024;
const MAX_PASSWORD_LENGTH = 256;

const TRACKING_PATHS = new Set([
  "/acompanhar/3903444641a3371ce99f2b56",
  "/acompanhar/3903444641a3371ce99f2b56/",
]);

const PAISES_PERMITIDOS = new Set([
  "BR", "AR", "CL", "UY", "PY", "BO", "PE", "CO", "EC", "VE",
  "MX", "CR", "PA", "GT", "HN", "SV", "NI", "DO", "CU", "PR",
]);

const BOTS_PERMITIDOS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "applebot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "google-inspectiontool",
  "adsbot-google",
];

const ATENDENTES_WHATSAPP = [
  "34642874197",
];

const TRACKING_FIELDS = [
  "title",
  "recipient",
  "content",
  "origin",
  "destination",
  "destinationShort",
  "reference",
  "sentIso",
  "sentLong",
  "sentShort",
  "dueIso",
  "dueLong",
  "dueShort",
];

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function decodeBase64Utf8(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function readCookie(request, name) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  for (const entry of cookieHeader.split(";")) {
    const [key, ...valueParts] = entry.trim().split("=");
    if (key === name) return valueParts.join("=");
  }

  return null;
}

async function hmac(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return bytesToBase64Url(new Uint8Array(signature));
}

function timingSafeEqualBytes(left, right) {
  if (typeof crypto.subtle.timingSafeEqual === "function") {
    return crypto.subtle.timingSafeEqual(left, right);
  }

  // Node.js ainda não expõe timingSafeEqual em SubtleCrypto. Este fallback é
  // usado somente pelos testes locais e recebe hashes SHA-256 de tamanho fixo.
  const leftBytes = new Uint8Array(left);
  const rightBytes = new Uint8Array(right);
  let difference = leftBytes.length ^ rightBytes.length;
  const maxLength = Math.max(leftBytes.length, rightBytes.length);

  for (let index = 0; index < maxLength; index += 1) {
    difference |= (leftBytes[index] || 0) ^ (rightBytes[index] || 0);
  }

  return difference === 0;
}

async function constantTimeEqual(left, right) {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);

  return timingSafeEqualBytes(leftHash, rightHash);
}

async function validPassword(submitted, configured) {
  return constantTimeEqual(submitted, configured);
}

async function validSession(request, secret) {
  const cookie = readCookie(request, COOKIE_NAME);
  if (!cookie) return false;

  const separator = cookie.indexOf(".");
  if (separator < 1) return false;

  const expiresAt = cookie.slice(0, separator);
  const signature = cookie.slice(separator + 1);
  const expiresAtNumber = Number(expiresAt);

  if (!Number.isFinite(expiresAtNumber) || expiresAtNumber <= Date.now() / 1000) {
    return false;
  }

  const expected = await hmac(`tracking:${expiresAt}`, secret);
  return constantTimeEqual(signature, expected);
}

function securityHeaders() {
  return {
    "cache-control": "private, no-store, max-age=0",
    "content-security-policy": "default-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
  };
}

function loginPage(errorMessage = "") {
  const error = errorMessage
    ? `<div class="error" role="alert">${escapeHtml(errorMessage)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <meta name="referrer" content="no-referrer">
  <meta name="theme-color" content="#071225">
  <title>Acesso protegido | Destino Espanha</title>
  <link rel="icon" type="image/jpeg" href="/logo.jpg">
  <style>
    :root { --navy:#071225; --navy-soft:#112442; --gold:#d4a82f; --ink:#172033; --muted:#68758b; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; display:grid; place-items:center; padding:24px; color:var(--ink); background:radial-gradient(circle at 18% 8%, rgba(212,168,47,.18), transparent 25rem), linear-gradient(145deg, #071225, #112442 55%, #1b3153); font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    .card { width:min(100%, 430px); overflow:hidden; border:1px solid rgba(255,255,255,.14); border-radius:26px; background:#fff; box-shadow:0 28px 80px rgba(0,0,0,.3); }
    .brand { padding:28px 30px 23px; display:flex; align-items:center; gap:14px; color:#fff; background:var(--navy); border-bottom:3px solid var(--gold); }
    .brand img { width:58px; height:58px; border-radius:50%; object-fit:cover; border:2px solid rgba(255,255,255,.28); }
    .brand strong { display:block; font-family:Georgia,serif; font-size:22px; }
    .brand span { display:block; margin-top:4px; color:#b9c6d9; font-size:11px; letter-spacing:.1em; text-transform:uppercase; }
    .content { padding:30px; }
    .lock { width:46px; height:46px; display:grid; place-items:center; border-radius:14px; color:#72570a; background:#fff5d7; font-size:22px; }
    h1 { margin:18px 0 8px; color:var(--navy); font-family:Georgia,serif; font-size:29px; line-height:1.1; }
    p { margin:0 0 22px; color:var(--muted); font-size:14px; line-height:1.6; }
    label { display:block; margin-bottom:8px; color:var(--navy); font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; }
    input { width:100%; min-height:50px; padding:0 15px; border:1px solid #cfd7e4; border-radius:12px; color:var(--ink); background:#f9fbfd; font:inherit; outline:none; }
    input:focus { border-color:var(--gold); box-shadow:0 0 0 4px rgba(212,168,47,.15); }
    button { width:100%; min-height:50px; margin-top:14px; border:0; border-radius:12px; color:var(--navy); background:var(--gold); font:800 14px/1 Inter,system-ui,sans-serif; cursor:pointer; }
    .error { margin-bottom:16px; padding:12px 14px; border:1px solid #f0b9b9; border-radius:10px; color:#8b2020; background:#fff0f0; font-size:13px; }
    .foot { padding:0 30px 25px; color:#8190a4; text-align:center; font-size:11px; line-height:1.5; }
  </style>
</head>
<body>
  <main class="card">
    <header class="brand">
      <img src="/logo.jpg" alt="Destino Espanha">
      <div><strong>Destino Espanha</strong><span>Assessoria</span></div>
    </header>
    <section class="content">
      <div class="lock" aria-hidden="true">🔒</div>
      <h1>Acompanhamento protegido</h1>
      <p>Digite a senha fornecida pela Destino Espanha para consultar o andamento do seu envio.</p>
      ${error}
      <form method="post">
        <label for="password">Senha de acesso</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
        <button type="submit">Acessar acompanhamento</button>
      </form>
    </section>
    <div class="foot">Página exclusiva do cliente · Conexão segura</div>
  </main>
</body>
</html>`;
}

function htmlResponse(body, status = 200, extraHeaders = {}, head = false) {
  return new Response(head ? null : body, {
    status,
    headers: {
      ...securityHeaders(),
      "content-type": "text/html; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/gu, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function currentDateIso(date, timeZone = DISPLAY_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function formatDateLong(isoDate, timeZone = DISPLAY_TIME_ZONE) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function calendarDaysBetween(startIso, endIso) {
  const start = Date.parse(`${startIso}T00:00:00Z`);
  const end = Date.parse(`${endIso}T00:00:00Z`);

  return Math.floor((end - start) / 86_400_000);
}

function validIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp)
    && new Date(timestamp).toISOString().slice(0, 10) === value;
}

export function calculateProgress(sentIso, dueIso, date = new Date()) {
  const todayIso = currentDateIso(date);
  const totalDays = Math.max(1, calendarDaysBetween(sentIso, dueIso));
  const elapsedDays = Math.max(
    0,
    Math.min(totalDays, calendarDaysBetween(sentIso, todayIso)),
  );
  const percentage = Math.max(2, Math.round((elapsedDays / totalDays) * 100));
  const overdue = calendarDaysBetween(dueIso, todayIso) > 0;

  return {
    statusText: overdue ? "Prazo em verificação" : "Em trânsito",
    dayCount: overdue
      ? "Confirme a entrega com nossa equipe"
      : `${elapsedDays} de ${totalDays} dias decorridos`,
    percentage,
    todayIso,
    updatedLong: formatDateLong(todayIso),
  };
}

function trackingConfig(env) {
  const raw = env.TRACKING_390344_CONFIG ?? env.TRACKING_A3796_CONFIG;
  if (!raw) return null;

  try {
    const config = JSON.parse(decodeBase64Utf8(raw));
    const record = config.record;

    if (
      typeof config.password !== "string"
      || !config.password
      || typeof config.sessionSecret !== "string"
      || !config.sessionSecret
      || !record
      || TRACKING_FIELDS.some((field) => typeof record[field] !== "string" || !record[field])
      || !validIsoDate(record.sentIso)
      || !validIsoDate(record.dueIso)
      || calendarDaysBetween(record.sentIso, record.dueIso) < 1
    ) {
      return null;
    }

    return {
      password: config.password,
      sessionSecret: config.sessionSecret,
      record,
    };
  } catch (error) {
    console.error(JSON.stringify({
      message: "Configuração do acompanhamento inválida.",
      error: error instanceof Error ? error.message : String(error),
    }));
    return null;
  }
}

function trackingPage(record, template, date) {
  const progress = calculateProgress(record.sentIso, record.dueIso, date);
  const whatsappMessage = `Olá! Gostaria de uma atualização sobre o envio ${record.reference}.`;
  const replacements = {
    TITLE: record.title,
    RECIPIENT: record.recipient,
    CONTENT: record.content,
    ORIGIN: record.origin,
    DESTINATION: record.destination,
    DESTINATION_SHORT: record.destinationShort,
    REFERENCE: record.reference,
    SENT_ISO: record.sentIso,
    SENT_LONG: record.sentLong,
    SENT_SHORT: record.sentShort,
    UPDATED_ISO: progress.todayIso,
    UPDATED_LONG: progress.updatedLong,
    DUE_ISO: record.dueIso,
    DUE_LONG: record.dueLong,
    DUE_SHORT: record.dueShort,
    STATUS_TEXT: progress.statusText,
    DAY_COUNT: progress.dayCount,
    PROGRESS_PERCENTAGE: String(progress.percentage),
    WHATSAPP_HREF: `https://wa.me/34642874197?text=${encodeURIComponent(whatsappMessage)}`,
  };

  return template.replace(/\{\{([A-Z_]+)\}\}/gu, (_, key) => {
    const replacement = replacements[key];
    return replacement === undefined ? "" : escapeHtml(replacement);
  });
}

function requestCountry(request) {
  const country = request.cf?.country ?? request.headers.get("cf-ipcountry");
  return country ? String(country).toUpperCase() : null;
}

function chooseAttendant(random) {
  return ATENDENTES_WHATSAPP[Math.floor(random() * ATENDENTES_WHATSAPP.length)];
}

function forbiddenPage() {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>403 Forbidden</title></head>
<body><h1>403 Forbidden</h1><p>Site em manutenção.</p></body></html>`;
}

async function handleWhatsApp(request, random) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Método não permitido", {
      status: 405,
      headers: {
        allow: "GET, HEAD",
        "cache-control": "private, no-store, max-age=0",
        "x-content-type-options": "nosniff",
      },
    });
  }

  const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
  const allowedBot = BOTS_PERMITIDOS.some((bot) => userAgent.includes(bot));
  const country = requestCountry(request);

  if (allowedBot) {
    return new Response(null, {
      status: 204,
      headers: { "cache-control": "private, no-store, max-age=0" },
    });
  }

  if (country && !PAISES_PERMITIDOS.has(country)) {
    return new Response(request.method === "HEAD" ? null : forbiddenPage(), {
      status: 403,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "private, no-store, max-age=0",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  const url = new URL(request.url);
  const text = url.searchParams.get("text") || "";
  const number = chooseAttendant(random);
  const whatsappUrl = text
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${number}`;

  return new Response(null, {
    status: 302,
    headers: {
      location: whatsappUrl,
      "cache-control": "private, no-store, max-age=0",
    },
  });
}

async function readBoundedLoginBody(request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const parsedLength = Number(contentLength);
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0) {
      return { error: "invalid" };
    }
    if (parsedLength > MAX_LOGIN_BODY_BYTES) {
      return { error: "too_large" };
    }
  }

  if (!request.body) return { value: "" };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      size += value.byteLength;
      if (size > MAX_LOGIN_BODY_BYTES) {
        try {
          await reader.cancel("login body too large");
        } catch {
          // O limite já foi aplicado; a falha ao cancelar não muda a resposta.
        }
        return { error: "too_large" };
      }

      body += decoder.decode(value, { stream: true });
    }

    body += decoder.decode();
    return { value: body };
  } catch {
    return { error: "invalid" };
  }
}

async function checkLoginRateLimit(request, env) {
  const limiter = env.LOGIN_RATE_LIMITER;
  if (!limiter || typeof limiter.limit !== "function") {
    console.error(JSON.stringify({
      message: "Binding de rate limit do acompanhamento indisponível.",
    }));
    return { available: false, success: false };
  }

  const clientAddress = request.headers.get("cf-connecting-ip")?.trim() || "unknown";

  try {
    const result = await limiter.limit({
      key: `tracking-login:${clientAddress}`,
    });
    return { available: true, success: result?.success === true };
  } catch (error) {
    console.error(JSON.stringify({
      message: "Falha ao consultar o rate limit do acompanhamento.",
      error: error instanceof Error ? error.message : String(error),
    }));
    return { available: false, success: false };
  }
}

async function handleTracking(request, env, trackingTemplate, date) {
  const config = trackingConfig(env);
  if (!config) {
    return htmlResponse(
      "<h1>Acompanhamento temporariamente indisponível</h1><p>Entre em contato com a Destino Espanha.</p>",
      503,
      {},
      request.method === "HEAD",
    );
  }

  const { password, sessionSecret, record } = config;

  if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "POST") {
    return new Response("Método não permitido", {
      status: 405,
      headers: { ...securityHeaders(), allow: "GET, HEAD, POST" },
    });
  }

  if (await validSession(request, sessionSecret)) {
    return htmlResponse(
      trackingPage(record, trackingTemplate, date),
      200,
      { vary: "Cookie" },
      request.method === "HEAD",
    );
  }

  if (request.method === "POST") {
    if (request.headers.get("sec-fetch-site") === "cross-site") {
      return htmlResponse(loginPage("Solicitação não autorizada."), 403);
    }

    const rateLimit = await checkLoginRateLimit(request, env);
    if (!rateLimit.available) {
      return htmlResponse(
        loginPage("Acompanhamento temporariamente indisponível. Tente novamente em instantes."),
        503,
      );
    }
    if (!rateLimit.success) {
      return htmlResponse(
        loginPage("Muitas tentativas. Aguarde um minuto e tente novamente."),
        429,
        { "retry-after": "60" },
      );
    }

    const mediaType = (request.headers.get("content-type") ?? "")
      .split(";", 1)[0]
      .trim()
      .toLowerCase();
    if (mediaType !== "application/x-www-form-urlencoded") {
      return htmlResponse(loginPage("Formato de solicitação não aceito."), 415);
    }

    const parsedBody = await readBoundedLoginBody(request);
    if (parsedBody.error === "too_large") {
      return htmlResponse(loginPage("Solicitação muito grande."), 413);
    }
    if (parsedBody.error) {
      return htmlResponse(loginPage("Solicitação inválida. Tente novamente."), 400);
    }

    const submittedPassword = new URLSearchParams(parsedBody.value)
      .get("password") ?? "";
    if (submittedPassword.length > MAX_PASSWORD_LENGTH) {
      return htmlResponse(loginPage("Solicitação inválida. Tente novamente."), 400);
    }

    if (await validPassword(submittedPassword, password)) {
      const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
      const signature = await hmac(`tracking:${expiresAt}`, sessionSecret);
      const url = new URL(request.url);

      return new Response(null, {
        status: 303,
        headers: {
          ...securityHeaders(),
          location: url.pathname,
          "set-cookie": `${COOKIE_NAME}=${expiresAt}.${signature}; Max-Age=${SESSION_SECONDS}; Path=${COOKIE_PATH}; Secure; HttpOnly; SameSite=Strict`,
        },
      });
    }

    return htmlResponse(loginPage("Senha incorreta. Verifique e tente novamente."), 401);
  }

  return htmlResponse(loginPage(), 200, {}, request.method === "HEAD");
}

export function createWorkerApp({ trackingTemplate, now = () => new Date(), random = Math.random }) {
  if (typeof trackingTemplate !== "string" || !trackingTemplate.includes("{{TITLE}}")) {
    throw new Error("Template protegido de acompanhamento ausente ou inválido.");
  }

  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      const path = url.pathname.toLowerCase();

      if (path === "/whatsapp" || path === "/whatsapp/") {
        return handleWhatsApp(request, random);
      }

      if (TRACKING_PATHS.has(path)) {
        return handleTracking(request, env, trackingTemplate, now());
      }

      if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
        return new Response("Not Found", { status: 404 });
      }

      return env.ASSETS.fetch(request);
    },
  };
}
