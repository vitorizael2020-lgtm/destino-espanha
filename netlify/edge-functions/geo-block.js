// netlify/edge-functions/geo-block.js
// Protege o link do WhatsApp para acessos fora da América Latina (ex: Portugal/Espanha).
// A página inicial e outras rotas do site ficam abertas globalmente,
// garantindo que o Google Ads aprove o site como "Destino Acessível".
// Se o usuário de uma região bloqueada tentar iniciar contato pelo WhatsApp, ele é bloqueado.

// Países permitidos (códigos ISO 3166-1 alpha-2) - América Latina
const PAISES_PERMITIDOS = new Set([
  "BR", // Brasil
  "AR", // Argentina
  "CL", // Chile
  "UY", // Uruguai
  "PY", // Paraguai
  "BO", // Bolívia
  "PE", // Peru
  "CO", // Colômbia
  "EC", // Equador
  "VE", // Venezuela
  "MX", // México
  "CR", // Costa Rica
  "PA", // Panamá
  "GT", // Guatemala
  "HN", // Honduras
  "SV", // El Salvador
  "NI", // Nicarágua
  "DO", // República Dominicana
  "CU", // Cuba
  "PR"  // Porto Rico
]);

// User-agents de bots de busca legítimos que devem passar
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

// === ATENDENTES DO WHATSAPP (rota /whatsapp) ===========================
// 🔧 TROCAR O NÚMERO: edite a lista abaixo (formato DDI+DDD+número, só dígitos).
// 🔁 ATIVAR O RODÍZIO entre atendentes: descomente/adicione os outros números.
//    Com 1 número, todo lead cai nele. Com 2 ou mais, o atendente é sorteado
//    a cada acesso (a edge function não guarda estado, então o sorteio aleatório
//    é o que melhor equilibra o volume sem precisar de banco de dados).
const ATENDENTES_WHATSAPP = [
  "34642874197", // Vitor — atendimento direto enquanto o funil é validado
  // "34XXXXXXXXX", // Atendente 2 — descomente e troque p/ entrar no rodízio
];

function escolherAtendente() {
  return ATENDENTES_WHATSAPP[Math.floor(Math.random() * ATENDENTES_WHATSAPP.length)];
}

export default async (request, context) => {
  const url = new URL(request.url);
  const caminho = url.pathname.toLowerCase();

  // Documentos internos de trabalho (.md) fazem parte do repositório mas NÃO são
  // páginas do site — sem este bloqueio ficariam acessíveis por URL direta.
  if (caminho.endsWith(".md")) {
    return new Response("Not Found", { status: 404 });
  }

  // Aplica o bloqueio geográfico APENAS no redirecionamento do WhatsApp
  if (caminho === "/whatsapp" || caminho === "/whatsapp/") {
    const pais = context.geo && context.geo.country ? context.geo.country.code : null;
    const userAgent = (request.headers.get("user-agent") || "").toLowerCase();

    // Libera bots de busca (se por acaso passarem pelo link)
    const ehBot = BOTS_PERMITIDOS.some((bot) => userAgent.includes(bot));
    if (ehBot) {
      return context.next();
    }

    // Se o país for identificado e NÃO estiver na lista permitida, bloqueia o redirecionamento
    if (pais && !PAISES_PERMITIDOS.has(pais)) {
      return new Response(PAGINA_ERRO, {
        status: 403,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store"
        }
      });
    }

    // Se o país for permitido ou não identificado: redireciona para o WhatsApp real
    const texto = url.searchParams.get("text") || "";
    const numero = escolherAtendente();
    const waUrl = texto
      ? `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
      : `https://wa.me/${numero}`;
    return Response.redirect(waUrl, 302);
  }

  // Qualquer outra rota do site (homepage, admin, cliente, css, etc.) segue normalmente
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
<p>Site em manutenção.</p>
</body>
</html>`;
