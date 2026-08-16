import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(resolve(root, file), "utf8");
const marketingFiles = [
  "index.html",
  "motorista.html",
  "passagens.html",
  "aviso-legal.html",
  "termos.html",
  "privacidade.html",
  "cookies.html",
  "atendimento.html",
];

test("publica identidade empresarial e base de confiança verificável", async () => {
  const [home, legal] = await Promise.all([read("index.html"), read("aviso-legal.html")]);
  for (const source of [home, legal]) {
    assert.match(source, /42\.952\.684\/0001-71/u);
    assert.match(source, /Cadastur/u);
  }
  assert.match(home, /Empresa formal desde 2021/u);
  assert.match(home, /Cenários ilustrativos que mostram como a assessoria é organizada/u);
});

test("não publica antigos argumentos comerciais enganosos", async () => {
  const content = (await Promise.all(marketingFiles.map(read))).join("\n");
  assert.doesNotMatch(content, /30 mil caminhoneiros|€2\.800|70% dos caminhoneiros|Só ida com retorno resolvido|usada por viajantes do mundo todo/u);
  assert.doesNotMatch(content, /<div class="faq-question"/u);
});

test("não antecipa objeções comerciais sobre aprovação nas páginas públicas", async () => {
  const content = (await Promise.all(marketingFiles.map(read))).join("\n");
  assert.doesNotMatch(
    content,
    /sem promessa de aprovação|garante que meu visto|garantem visto ou emprego|não garantimos vistos|não há garantia de aprovação|ausência de garantia|sem prometer resultado|promessas? de resultado|sem promessa de emprego|sem vender emprego nem aprovação/iu,
  );
});

test("carrega medição opcional somente pelo gerenciador de consentimento", async () => {
  const html = (await Promise.all(marketingFiles.map(read))).join("\n");
  const script = await read("script.js");
  assert.doesNotMatch(html, /googletagmanager\.com\/gtag\/js/u);
  assert.match(script, /de_cookie_consent_v1/u);
  assert.match(script, /AW-18239034284\/qeSeCJrL8r4cEKynhvlD/u);
});

test("explica que reserva temporária não é bilhete", async () => {
  const [home, flights, terms] = await Promise.all([
    read("index.html"),
    read("passagens.html"),
    read("termos.html"),
  ]);
  for (const source of [home, flights, terms]) {
    assert.match(source, /não (?:equivale a|substitui uma|é )[^.]*(?:bilhete|passagem)/iu);
  }
});
