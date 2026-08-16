import { access, readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, ".cloudflare-dist");

const requiredPaths = [
  "index.html",
  "login.html",
  "motorista.html",
  "passagens.html",
  "style.css",
  "script.js",
  "logo.jpg",
  "admin/dashboard.html",
  "cliente/painel.html",
  "shared/auth.js",
  "shared/supabase-config.js",
];

const forbiddenSegments = new Set([
  ".git",
  ".netlify",
  "netlify",
  "protected",
  "worker",
  "scripts",
  "tests",
  "node_modules",
]);

const forbiddenExtensions = new Set([
  ".md",
  ".toml",
  ".jsonc",
  ".mts",
]);

const forbiddenFiles = new Set([
  ".env",
  ".gitignore",
  ".assetsignore",
  "package.json",
  "package-lock.json",
  "server.js",
  "wrangler.jsonc",
]);

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listFiles(absolute, relative));
    } else if (entry.isFile()) {
      files.push(relative);
    }
  }

  return files;
}

for (const required of requiredPaths) {
  await access(join(output, required));
}

const files = await listFiles(output);
const violations = files.filter((file) => {
  const parts = file.split("/");
  return parts.some((part) => forbiddenSegments.has(part))
    || forbiddenExtensions.has(extname(file).toLowerCase())
    || forbiddenFiles.has(file)
    || file.startsWith(".");
});

if (violations.length) {
  throw new Error(`Arquivos privados no bundle público: ${violations.join(", ")}`);
}

const dynamicPaths = new Set([
  "/whatsapp",
  "/acompanhar/3903444641a3371ce99f2b56",
]);

const missingReferences = [];
for (const file of files.filter((path) => path.endsWith(".html"))) {
  const html = await readFile(join(output, file), "utf8");
  const references = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)]
    .map((match) => match[1]);

  for (const reference of references) {
    if (
      !reference
      || reference.startsWith("#")
      || reference.startsWith("data:")
      || reference.startsWith("mailto:")
      || reference.startsWith("tel:")
      || /^[a-z][a-z0-9+.-]*:\/\//i.test(reference)
    ) {
      continue;
    }

    const clean = reference.split(/[?#]/, 1)[0];
    if (!clean) continue;

    const normalizedDynamic = clean.replace(/\/$/, "");
    if ([...dynamicPaths].some((path) => normalizedDynamic === path)) continue;

    let target;
    if (clean === "/") {
      target = join(output, "index.html");
    } else if (clean.startsWith("/")) {
      target = join(output, clean.slice(1));
    } else {
      target = resolve(output, dirname(file), clean);
    }

    if (!target.startsWith(`${output}${sep}`) && target !== output) {
      missingReferences.push(`${file} -> ${reference} (fora do bundle)`);
      continue;
    }

    try {
      const info = await stat(target);
      if (info.isDirectory()) await access(join(target, "index.html"));
    } catch {
      missingReferences.push(`${file} -> ${reference}`);
    }
  }
}

if (missingReferences.length) {
  throw new Error(`Referências locais ausentes:\n${missingReferences.join("\n")}`);
}

console.log(`Bundle validado: ${files.length} arquivos públicos e nenhuma exposição detectada.`);
