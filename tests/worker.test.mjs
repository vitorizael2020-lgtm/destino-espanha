import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { calculateProgress, createWorkerApp } from "../worker/app.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const trackingTemplate = await readFile(
  resolve(root, "protected/tracking-template.html"),
  "utf8",
);
const fixedNow = new Date("2026-08-16T10:00:00Z");
const sealedContext = "destino-espanha:tracking:3903444641a3371ce99f2b56:v1";

const record = {
  title: "Acompanhamento internacional",
  recipient: "Cliente Teste",
  content: "Documentos",
  origin: "Madri, Espanha",
  destination: "São Paulo, Brasil",
  destinationShort: "São Paulo",
  reference: "DE-TESTE-001",
  sentIso: "2026-08-07",
  sentLong: "07 de agosto de 2026",
  sentShort: "07/08/2026",
  dueIso: "2026-08-25",
  dueLong: "25 de agosto de 2026",
  dueShort: "25/08/2026",
};

const assets = {
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/private") || path.startsWith("/acompanhar/outro")) {
      return new Response("Not Found", { status: 404 });
    }
    return new Response(`asset:${path}`, { status: 200 });
  },
};

function encodeConfig(config) {
  return Buffer.from(JSON.stringify(config), "utf8").toString("base64");
}

async function sealRecord(password, value = record) {
  const encoder = new TextEncoder();
  const salt = Uint8Array.from({ length: 16 }, (_, index) => index + 1);
  const iv = Uint8Array.from({ length: 12 }, (_, index) => 32 + index);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "HKDF",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt,
      info: encoder.encode(sealedContext),
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData: encoder.encode(sealedContext),
    },
    key,
    encoder.encode(JSON.stringify(value)),
  );

  return {
    version: 1,
    kdf: "HKDF-SHA256",
    cipher: "AES-256-GCM",
    context: sealedContext,
    salt: Buffer.from(salt).toString("base64url"),
    iv: Buffer.from(iv).toString("base64url"),
    ciphertext: Buffer.from(ciphertext).toString("base64url"),
  };
}

const allowLoginAttempt = {
  async limit() {
    return { success: true };
  },
};

function environment(config = {}, bindings = {}) {
  return {
    ASSETS: assets,
    LOGIN_RATE_LIMITER: allowLoginAttempt,
    TRACKING_390344_CONFIG: encodeConfig({
      password: "senha-certa-e-forte",
      sessionSecret: "test-session-secret-at-least-32-bytes",
      record,
      ...config,
    }),
    ...bindings,
  };
}

function requestWithCountry(url, country, init = {}) {
  const request = new Request(url, init);
  if (country) Object.defineProperty(request, "cf", { value: { country } });
  return request;
}

function app() {
  return createWorkerApp({
    trackingTemplate,
    now: () => fixedNow,
    random: () => 0,
  });
}

function sealedApp(sealedTrackingConfig) {
  return createWorkerApp({
    trackingTemplate,
    sealedTrackingConfig,
    now: () => fixedNow,
    random: () => 0,
  });
}

async function authenticatedCookie(worker, env = environment()) {
  const response = await worker.fetch(new Request(
    "https://example.com/acompanhar/3903444641a3371ce99f2b56",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ password: "senha-certa-e-forte" }),
    },
  ), env);

  assert.equal(response.status, 303);
  return response.headers.get("set-cookie").split(";", 1)[0];
}

test("delega os arquivos estáticos ao binding ASSETS", async () => {
  const response = await app().fetch(new Request("https://example.com/"), environment());
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "asset:/");
});

test("calcula diariamente o progresso em Europe/Madrid", () => {
  assert.deepEqual(
    calculateProgress("2026-08-07", "2026-08-25", fixedNow),
    {
      statusText: "Em trânsito",
      dayCount: "9 de 18 dias decorridos",
      percentage: 50,
      todayIso: "2026-08-16",
      updatedLong: "16 de agosto de 2026",
    },
  );

  const overdue = calculateProgress(
    "2026-08-07",
    "2026-08-25",
    new Date("2026-08-26T10:00:00Z"),
  );
  assert.equal(overdue.statusText, "Prazo em verificação");
  assert.equal(overdue.percentage, 100);
});

test("redireciona o WhatsApp para países permitidos", async () => {
  const response = await app().fetch(requestWithCountry(
    "https://example.com/whatsapp?text=Ol%C3%A1%20%26%20fam%C3%ADlia",
    "BR",
  ), environment());

  assert.equal(response.status, 302);
  assert.equal(
    response.headers.get("location"),
    "https://wa.me/34642874197?text=Ol%C3%A1%20%26%20fam%C3%ADlia",
  );
});

test("bloqueia o WhatsApp fora da América Latina", async () => {
  for (const country of ["ES", "PT", "US"]) {
    const response = await app().fetch(
      requestWithCountry("https://example.com/whatsapp", country),
      environment(),
    );
    assert.equal(response.status, 403);
    assert.match(await response.text(), /403 Forbidden/u);
  }
});

test("não redireciona bots nem permite bypass por user-agent", async () => {
  const response = await app().fetch(requestWithCountry(
    "https://example.com/whatsapp",
    "ES",
    { headers: { "user-agent": "Googlebot/2.1" } },
  ), environment());
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("location"), null);
});

test("mantém compatibilidade de rota e bloqueia métodos indevidos no WhatsApp", async () => {
  const upperCase = await app().fetch(
    requestWithCountry("https://example.com/WHATSAPP/", "BR"),
    environment(),
  );
  assert.equal(upperCase.status, 302);

  const post = await app().fetch(requestWithCountry(
    "https://example.com/whatsapp",
    "BR",
    { method: "POST" },
  ), environment());
  assert.equal(post.status, 405);
});

test("mostra o login protegido sem revelar o acompanhamento", async () => {
  const url = "https://example.com/acompanhar/3903444641a3371ce99f2b56";
  const response = await app().fetch(new Request(url), environment());
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /Acompanhamento protegido/u);
  assert.doesNotMatch(body, /DE-TESTE-001/u);
  assert.equal(response.headers.get("cache-control"), "private, no-store, max-age=0");
  assert.match(response.headers.get("x-robots-tag"), /noindex/u);

  const head = await app().fetch(new Request(url, { method: "HEAD" }), environment());
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
});

test("recusa senha errada e cria cookie seguro com a senha correta", async () => {
  const url = "https://example.com/acompanhar/3903444641a3371ce99f2b56";
  const wrong = await app().fetch(new Request(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password: "errada" }),
  }), environment());

  assert.equal(wrong.status, 401);
  assert.equal(wrong.headers.get("set-cookie"), null);
  assert.match(await wrong.text(), /Senha incorreta/u);

  const worker = app();
  const cookie = await authenticatedCookie(worker);
  assert.match(cookie, /^de_tracking_session=\d+\.[A-Za-z0-9_-]+$/u);

  const response = await worker.fetch(new Request(url, {
    headers: { cookie },
  }), environment());
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /DE-TESTE-001/u);
  assert.match(body, /9 de 18 dias decorridos/u);
  assert.match(body, /Cálculo atualizado em: 16 de agosto de 2026/u);
  assert.match(body, /aria-valuenow="50"/u);
  assert.doesNotMatch(body, /\{\{[A-Z_]+\}\}/u);
});

test("abre o pacote selado sem secret e não mantém dados após atualizar", async () => {
  const password = "senha-selada-de-teste";
  const worker = sealedApp(await sealRecord(password));
  const env = { ASSETS: assets, LOGIN_RATE_LIMITER: allowLoginAttempt };
  const url = "https://example.com/acompanhar/3903444641a3371ce99f2b56";

  const login = await worker.fetch(new Request(url), env);
  assert.equal(login.status, 200);
  assert.doesNotMatch(await login.text(), /DE-TESTE-001/u);

  const wrong = await worker.fetch(new Request(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password: "senha-incorreta" }),
  }), env);
  assert.equal(wrong.status, 401);

  const correct = await worker.fetch(new Request(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password }),
  }), env);
  const tracking = await correct.text();
  assert.equal(correct.status, 200);
  assert.equal(correct.headers.get("set-cookie"), null);
  assert.match(tracking, /DE-TESTE-001/u);
  assert.match(tracking, /Cliente Teste/u);
  assert.doesNotMatch(tracking, /\{\{[A-Z_]+\}\}/u);

  const refreshed = await worker.fetch(new Request(url), env);
  assert.equal(refreshed.status, 200);
  assert.doesNotMatch(await refreshed.text(), /DE-TESTE-001/u);
});

test("recusa pacote selado adulterado e configuração selada inválida", async () => {
  const sealed = await sealRecord("senha-selada-de-teste");
  const corrupted = sealedApp({
    ...sealed,
    ciphertext: `${sealed.ciphertext[0] === "A" ? "B" : "A"}${sealed.ciphertext.slice(1)}`,
  });
  const url = "https://example.com/acompanhar/3903444641a3371ce99f2b56";
  const response = await corrupted.fetch(new Request(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password: "senha-selada-de-teste" }),
  }), { ASSETS: assets, LOGIN_RATE_LIMITER: allowLoginAttempt });
  assert.equal(response.status, 401);

  assert.throws(
    () => sealedApp({ ...sealed, iv: "invalido" }),
    /Pacote selado de acompanhamento ausente ou inválido/u,
  );
});

test("usa o pacote selado quando o secret legado está inválido", async () => {
  const password = "senha-selada-de-teste";
  const worker = sealedApp(await sealRecord(password));
  const url = "https://example.com/acompanhar/3903444641a3371ce99f2b56";
  const response = await worker.fetch(new Request(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password }),
  }), {
    ASSETS: assets,
    LOGIN_RATE_LIMITER: allowLoginAttempt,
    TRACKING_390344_CONFIG: "configuracao-invalida",
  });

  assert.equal(response.status, 200);
  assert.match(await response.text(), /DE-TESTE-001/u);
});

test("limita formato, tamanho e frequência das tentativas de login", async () => {
  const url = "https://example.com/acompanhar/3903444641a3371ce99f2b56";

  const unsupported = await app().fetch(new Request(url, {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "password=senha-certa-e-forte",
  }), environment());
  assert.equal(unsupported.status, 415);

  const oversized = await app().fetch(new Request(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `password=${"x".repeat(1_100)}`,
  }), environment());
  assert.equal(oversized.status, 413);

  const passwordTooLong = await app().fetch(new Request(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password: "x".repeat(257) }),
  }), environment());
  assert.equal(passwordTooLong.status, 400);

  let receivedKey = "";
  const limitedEnv = environment({}, {
    LOGIN_RATE_LIMITER: {
      async limit({ key }) {
        receivedKey = key;
        return { success: false };
      },
    },
  });
  const limited = await app().fetch(new Request(url, {
    method: "POST",
    headers: {
      "cf-connecting-ip": "203.0.113.10",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ password: "errada" }),
  }), limitedEnv);

  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "60");
  assert.equal(
    receivedKey,
    "tracking-login:203.0.113.10:/acompanhar/3903444641a3371ce99f2b56",
  );
});

test("falha fechado sem rate limit e rejeita POST entre sites", async () => {
  const url = "https://example.com/acompanhar/3903444641a3371ce99f2b56";
  const missingLimiter = await app().fetch(new Request(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password: "senha-certa-e-forte" }),
  }), environment({}, { LOGIN_RATE_LIMITER: undefined }));
  assert.equal(missingLimiter.status, 503);

  const crossSite = await app().fetch(new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "sec-fetch-site": "cross-site",
    },
    body: new URLSearchParams({ password: "senha-certa-e-forte" }),
  }), environment());
  assert.equal(crossSite.status, 403);
});

test("escapa dados do acompanhamento antes de montar o HTML", async () => {
  const unsafeRecord = {
    ...record,
    recipient: '<script>alert("x")</script> & Cliente',
  };
  const env = environment({ record: unsafeRecord });
  const worker = app();
  const cookie = await authenticatedCookie(worker, env);
  const response = await worker.fetch(new Request(
    "https://example.com/acompanhar/3903444641a3371ce99f2b56",
    { headers: { cookie } },
  ), env);
  const body = await response.text();

  assert.doesNotMatch(body, /<script>alert/u);
  assert.match(body, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; &amp; Cliente/u);
});

test("falha fechado quando o segredo está ausente ou inválido", async () => {
  const url = "https://example.com/acompanhar/3903444641a3371ce99f2b56";
  const missing = await app().fetch(new Request(url), { ASSETS: assets });
  assert.equal(missing.status, 503);

  const invalid = await app().fetch(new Request(url), environment({
    record: { ...record, dueIso: "2026-02-30" },
  }));
  assert.equal(invalid.status, 503);

  const weakPassword = await app().fetch(new Request(url), environment({
    password: "curta",
  }));
  assert.equal(weakPassword.status, 503);

  const weakSessionSecret = await app().fetch(new Request(url), environment({
    sessionSecret: "segredo-curto",
  }));
  assert.equal(weakSessionSecret.status, 503);
});

test("bloqueia métodos não permitidos mesmo com sessão válida", async () => {
  const worker = app();
  const env = environment();
  const cookie = await authenticatedCookie(worker, env);
  const response = await worker.fetch(new Request(
    "https://example.com/acompanhar/3903444641a3371ce99f2b56",
    { method: "DELETE", headers: { cookie } },
  ), env);

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD, POST");
});

test("não aceita outros identificadores de acompanhamento", async () => {
  const response = await app().fetch(
    new Request("https://example.com/acompanhar/outro"),
    environment(),
  );
  assert.equal(response.status, 404);
});
