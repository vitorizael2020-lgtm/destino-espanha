// netlify/edge-functions/geo-block.js
// Bloqueia visitantes fora da America Latina (ex: Portugal) no SITE PUBLICO.
// As areas autenticadas (login, admin e cliente) ficam SEMPRE liberadas,
// independente do pais, pois ja sao protegidas por login.
// Libera tambem bots de busca (Googlebot, Bingbot, etc.) para preservar o SEO.

// Paises permitidos (codigos ISO 3166-1 alpha-2) - America Latina
const PAISES_PERMITIDOS = new Set([
  "BR", // Brasil
  "AR", // Argentina
  "CL", // Chile
  "UY", // Uruguai
  "PY", // Paraguai
  "BO", // Bolivia
  "PE", // Peru
  "CO", // Colombia
  "EC", // Equador
  "VE", // Venezuela
  "MX", // Mexico
  "CR", // Costa Rica
  "PA", // Panama
  "GT", // Guatemala
  "HN", // Honduras
  "SV", // El Salvador
  "NI", // Nicaragua
  "DO", // Republica Dominicana
  "CU", // Cuba
  "PR"  // Porto Rico
]);

// Prefixos de rota que ficam SEMPRE liberados (protegidos por login).
// Acessiveis de qualquer pais para que voce (admin) e os clientes
// possam logar de qualquer lugar.
const ROTAS_LIBERADAS = [
  "/login",
  "/admin",
  "/cliente",
  "/shared",
  "/css",
  "/logo.jpg",
  "/favicon.ico"
];

// User-agents de bots de busca legitimos que devem passar (preserva SEO)
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
  "adsbot-google"
];

export default async (request, context) => {
  const url = new URL(request.url);
  const caminho = url.pathname.toLowerCase();

  // Libera sempre as areas autenticadas (login, admin, cliente)
  const ehRotaLiberada = ROTAS_LIBERADAS.some((rota) => caminho.startsWith(rota));
  if (ehRotaLiberada) {
    return context.next();
  }

  const pais = context.geo && context.geo.country ? context.geo.country.code : null;
  const userAgent = (request.headers.get("user-agent") || "").toLowerCase();

  // Libera bots de busca para nao prejudicar a indexacao
  const ehBot = BOTS_PERMITIDOS.some((bot) => userAgent.includes(bot));
  if (ehBot) {
    return context.next();
  }

  // Se o pais for identificado e NAO estiver na lista permitida, bloqueia
  if (pais && !PAISES_PERMITIDOS.has(pais)) {
    return new Response(PAGINA_ERRO, {
      status: 403,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }

  // Redireciona para o WhatsApp real se o usuario for de um pais permitido
  if (caminho === "/whatsapp" || caminho === "/whatsapp/") {
    const texto = url.searchParams.get("text") || "";
    const numero = "34642874197";
    const waUrl = texto
      ? `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
      : `https://wa.me/${numero}`;
    return Response.redirect(waUrl, 302);
  }

  // Pais permitido ou nao identificado: segue normalmente
  return context.next();
};

export const config = { path: "/*" };

const PAGINA_ERRO = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<title>403 Forbidden</title>
</head>
<body>
<h1>403 Forbidden</h1>
<p>Site em construção.</p>
</body>
</html>`;
