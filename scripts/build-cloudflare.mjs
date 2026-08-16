import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, ".cloudflare-dist");

// Lista positiva: somente estes arquivos chegam ao site público.
// Documentos .md, código de infraestrutura, templates protegidos e backups
// permanecem fora do bundle publicado.
const publicEntries = [
  "index.html",
  "login.html",
  "motorista.html",
  "obrigado-diagnostico.html",
  "passagens.html",
  "robots.txt",
  "sitemap.xml",
  "style.css",
  "script.js",
  "logo.jpg",
  "admin",
  "cliente",
  "css",
  "shared",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of publicEntries) {
  await cp(join(root, entry), join(output, entry), {
    recursive: true,
    force: true,
  });
}

console.log(`Bundle público criado com ${publicEntries.length} entradas permitidas.`);
