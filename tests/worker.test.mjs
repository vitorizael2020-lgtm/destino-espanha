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

function environment(config = {}) {
  return {
    ASSETS: assets,
    TRACKING_390344_CONFIG: encodeConfig({
      password: "senha-certa",
      sessionSecret: "test-secret",
      record,
      ...config,
    }),
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

async function authenticatedCookie(worker, env = environment()) {
  const response = await worker.fetch(new Request(
    "https://example.com/acompanhar/3903444641a3371ce99f2b56",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ password: "senha-certa" }),
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
