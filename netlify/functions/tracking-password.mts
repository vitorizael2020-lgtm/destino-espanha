import { readFile } from "node:fs/promises";
import { join } from "node:path";

const COOKIE_NAME = "de_tracking_session";
const COOKIE_PATH = "/acompanhar/3903444641a3371ce99f2b56";
const SESSION_SECONDS = 12 * 60 * 60;
const DISPLAY_TIME_ZONE = "Europe/Madrid";

function encodeBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";

  for (const entry of cookieHeader.split(";")) {
    const [key, ...valueParts] = entry.trim().split("=");
    if (key === name) return valueParts.join("=");
  }

  return null;
}

async function hmac(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return encodeBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(left: string, right: string): boolean {
  const maxLength = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;

  for (let index = 0; index < maxLength; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return difference === 0;
}

async function validPassword(submitted: string, configured: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [submittedHash, configuredHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(submitted)),
    crypto.subtle.digest("SHA-256", encoder.encode(configured)),
  ]);

  return constantTimeEqual(
    encodeBase64Url(new Uint8Array(submittedHash)),
    encodeBase64Url(new Uint8Array(configuredHash)),
  );
}

async function validSession(request: Request, secret: string): Promise<boolean> {
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

function securityHeaders(): HeadersInit {
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

function loginPage(errorMessage = ""): string {
  const error = errorMessage
    ? `<div class="error" role="alert">${errorMessage}</div>`
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
    button:hover { filter:brightness(1.04); }
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

function htmlResponse(body: string, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(body, {
    status,
    headers: {
      ...securityHeaders(),
      "content-type": "text/html; charset=utf-8",
      ...extraHeaders,
    },
  });
}

type TrackingRecord = {
  title: string;
  recipient: string;
  content: string;
  origin: string;
  destination: string;
  destinationShort: string;
  reference: string;
  sentIso: string;
  sentLong: string;
  sentShort: string;
  updatedIso: string;
  updatedLong: string;
  dueIso: string;
  dueLong: string;
  dueShort: string;
};

type TrackingConfig = {
  password: string;
  sessionSecret: string;
  record: TrackingRecord;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function currentDateIso(timeZone = DISPLAY_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function calendarDaysBetween(startIso: string, endIso: string): number {
  const start = Date.parse(`${startIso}T00:00:00Z`);
  const end = Date.parse(`${endIso}T00:00:00Z`);

  return Math.floor((end - start) / 86_400_000);
}

function trackingProgress(record: TrackingRecord) {
  const totalDays = Math.max(1, calendarDaysBetween(record.sentIso, record.dueIso));
  const elapsedDays = Math.max(
    0,
    Math.min(totalDays, calendarDaysBetween(record.sentIso, currentDateIso())),
  );
  const percentage = Math.max(2, Math.round((elapsedDays / totalDays) * 100));
  const overdue = calendarDaysBetween(record.dueIso, currentDateIso()) > 0;

  return {
    statusText: overdue ? "Prazo em verificação" : "Em trânsito",
    dayCount: overdue
      ? "Confirme a entrega com nossa equipe"
      : `${elapsedDays} de ${totalDays} dias decorridos`,
    percentage,
  };
}

function trackingConfig(): TrackingConfig | null {
  const raw = Netlify.env.get("TRACKING_A3796_CONFIG");
  if (!raw) return null;

  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    const config = JSON.parse(decoded) as Partial<TrackingConfig>;
    const record = config.record as Partial<TrackingRecord> | undefined;
    const requiredFields: Array<keyof TrackingRecord> = [
      "title", "recipient", "content", "origin", "destination",
      "destinationShort", "reference", "sentIso", "sentLong",
      "sentShort", "updatedIso", "updatedLong", "dueIso", "dueLong",
      "dueShort",
    ];

    if (
      typeof config.password !== "string" || !config.password ||
      typeof config.sessionSecret !== "string" || !config.sessionSecret ||
      !record ||
      requiredFields.some((field) => typeof record[field] !== "string" || !record[field])
    ) {
      return null;
    }

    return {
      password: config.password,
      sessionSecret: config.sessionSecret,
      record: record as TrackingRecord,
    };
  } catch (error) {
    console.error("Configuração do acompanhamento inválida.", error);
    return null;
  }
}

async function trackingPage(record: TrackingRecord): Promise<string> {
  const filePath = join(process.cwd(), "protected", "tracking-template.html");
  const template = await readFile(filePath, "utf8");
  const whatsappMessage = `Olá! Gostaria de uma atualização sobre o envio ${record.reference}.`;
  const progress = trackingProgress(record);
  const replacements: Record<string, string> = {
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
    UPDATED_ISO: record.updatedIso,
    UPDATED_LONG: record.updatedLong,
    DUE_ISO: record.dueIso,
    DUE_LONG: record.dueLong,
    DUE_SHORT: record.dueShort,
    STATUS_TEXT: progress.statusText,
    DAY_COUNT: progress.dayCount,
    PROGRESS_PERCENTAGE: String(progress.percentage),
    WHATSAPP_HREF: `https://wa.me/34642874197?text=${encodeURIComponent(whatsappMessage)}`,
  };

  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key: string) => {
    const replacement = replacements[key];
    return replacement === undefined ? "" : escapeHtml(replacement);
  });
}

export default async (request: Request) => {
  const config = trackingConfig();

  if (!config) {
    return htmlResponse("<h1>Acompanhamento temporariamente indisponível</h1>", 503);
  }

  const { password: configuredPassword, sessionSecret, record } = config;

  if (await validSession(request, sessionSecret)) {
    try {
      return htmlResponse(await trackingPage(record), 200, { vary: "Cookie" });
    } catch (error) {
      console.error("Não foi possível carregar a página protegida.", error);
      return htmlResponse("<h1>Acompanhamento temporariamente indisponível</h1>", 503);
    }
  }

  if (request.method === "POST") {
    const form = await request.formData();
    const submittedPassword = String(form.get("password") ?? "");

    if (await validPassword(submittedPassword, configuredPassword)) {
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

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Método não permitido", {
      status: 405,
      headers: { ...securityHeaders(), allow: "GET, HEAD, POST" },
    });
  }

  return htmlResponse(loginPage());
};

export const config = {
  path: [
    "/acompanhar/3903444641a3371ce99f2b56",
    "/acompanhar/3903444641a3371ce99f2b56/",
  ],
};
