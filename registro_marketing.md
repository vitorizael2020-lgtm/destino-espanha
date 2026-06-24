# 📒 Registro de Marketing — Destino Espanha

**Para que serve:** histórico único de tudo que fazemos em marketing (anúncios, site, rastreamento), com **data e hora**, pra não perdermos o fio. **Sempre que falarmos de marketing, este documento deve ser consultado e atualizado.**

> Última atualização: **2026-06-23**

---

## 📌 Dados de acesso (referência rápida)

- **Google Ads (conta ativa):** `732-562-8280` — "Destino Espanha" — moeda **EUR (€)** — login **vitorlemos2023@gmail.com**
  - ⚠️ Existe outra conta no login `vitorizael2020@gmail.com` (`129-519-1323`, em R$, vazia/pausada) — **ignorar essa**.
- **Tag global Google Ads:** `AW-18239034284`
- **Conversão principal:** clique no WhatsApp (ação "Enviar formulário de lead", origem Site)
- **Site:** https://destinoespanhaassessoria.com (deploy via Netlify)
- **WhatsApp:** +34 624 15 98 70
- **Bônus Google:** gastar € 400 até **13/08/2026** para ganhar € 400 de crédito.

---

## ✅ Estado atual (2026-06-23)

- **Campanha ativa:** "Pesquisa - Espanha (Leads WhatsApp)" — Rede de Pesquisa — **NO AR** 🟢 · lance **Maximizar conversões**.
- **Performance Max:** ⏸️ pausado.
- **Verificação do anunciante:** ✅ concluída (identidade verificada) — conta saiu da pausa.
- **Orçamento ativo:** **€ 17,00/dia** (subiu de € 4,82 em 23/06 — campanha estava limitada por orçamento com CPA ótimo).
- **CPA atual:** ~€ 1,47/lead (Maximizar conversões, sem tCPA). tCPA a definir após ~1-2 semanas no novo orçamento.

---

## 🗓️ Linha do tempo (mais recente primeiro)

### 2026-06-23
- 💸 **Promoção do Diagnóstico: ~~€150~~ → ~~R$ 885~~ por R$ 295** (≈ €50). Diagnóstico Estratégico vira **porta de entrada barata** pro cliente BR (facilita o 1º sim → upsell pros pacotes maiores, onde está o lucro). **Site + checkout em R$** (link Stripe novo `buy.stripe.com/3cIeVg4DM5d32b853fgEg01`, cobra R$ 295,11; redireciona p/ Google Calendar). **Admin, métricas e PDFs seguem em € (€50)** pra não bagunçar o faturamento (que soma em €). Ancoragem "De R$ 885 por R$ 295" no card. *(Pendência: rastrear o checkout Stripe como conversão no Ads — tarefa já listada.)*
- 💰 **Orçamento: € 4,82 → € 17,00/dia.** Motivo: Search **limitada por orçamento** (gastava 100% todo dia) com CPA ótimo. Vitor confirmou a **verificação de identidade do Google** (Claude NÃO faz essa etapa — só o Vitor).
- 📊 **Resultados Search (14–22/jun, ~8 dias):** 5.383 impr · 129 cliques · CTR **2,40%** · CPC **€ 0,31** · custo **€ 39,72** · **27 leads (WhatsApp)** · taxa conv **20,93%** · **CPA € 1,47** (vs € 2,58 em 18/06 — melhorou muito). Lance: Maximizar conversões.
- 🧠 **CPA desejado (tCPA) — decisão: ESPERAR.** Google recomendou tCPA **€ 1,70** (+ aumentar orçamento). **Não aplicado** porque: (1) não mexer em orçamento E lance juntos (aprendizado duplo); (2) € 1,70 está colado no piso (CPA obtido com orçamento pequeno) e travaria o volume que o € 17 deve destravar; (3) pouco dado. **Plano:** ~1–2 semanas no € 17 em Maximizar conversões, medir o CPA real, e só então definir o tCPA (provável > € 1,70). **Checkpoint ~30/06–06/07.**
- 🔎 **Recomendações revisadas (score 71,9%): NENHUMA aplicada.** "Remover keywords redundantes" foi **rejeitada** após abrir a lista — ela **MANTÉM as AMPLAS e remove as FRASES** (contrário da nossa estratégia ampla→frase; risco de tráfego pior justo na escala pra € 17). A limpeza **certa** (remover as AMPLAS, manter as FRASES) fica pro **checkpoint**, fora da fase de reaprendizado. Também **NÃO**: correspondência ampla, recursos de **preço** (não publicamos preço), **lista de clientes**/Customer Match (**LGPD**), **logo** (removido de propósito). ⚠️ **Lição:** sempre abrir a lista da recomendação antes de aplicar — o Google "limpa" consolidando em ampla. Auto-aplicação confirmada **OFF** (resíduo: 3 recs auto-aplicadas 15–21/06, antes de desligar em 21/06).
- 📱 **WhatsApp: +34 642874197 → +34 624159870** no site todo. **Centralizado** na rota `/whatsapp` (edge function `geo-block.js`, lista `ATENDENTES_WHATSAPP` + sorteio) — **rodízio de atendentes pronto** (só adicionar o 2º número). Área do cliente + schema atualizados. Deploy + master. Geo-block testado (ES = 403 ✅). Ver memória `whatsapp-config-rota`.
- 🧹 **Sitelinks:** removidos 3 duplicados (Visto Nômade nível campanha, Pacotes "Conheça nossos planos", 1 "Fale comigo!") + "Histórias de Clientes" (reprovado gov-docs). Restam **11 sitelinks, todos Qualificada**.

### 2026-06-19
- **Pesquisa de concorrentes feita** (`analise_concorrentes_2026-06.md`): Espanha Fácil = gigante (desde 2007, +150 mil clientes), roda **~200 anúncios** em 3 frentes (vistos/confiança + **curso de espanhol como porta de entrada** + imóveis). Brecha = somos **especialistas + pessoais + nichos** que eles tratam no genérico.
- **Kit de conteúdo criado** (a partir da análise): (1) `novos_anuncios_google_2026-06.md` — sitelinks, callouts e **novo RSA** (ângulos pessoal/especialista/nichos CAP·nômade·não-lucrativa); (2) `guia_morar_espanha_isca.md` — **isca digital** (guia grátis → WhatsApp); (3) `legendas_reels_2026-06.md` — 8 legendas + banco de hashtags pros roteiros. **A aplicar:** subir sitelinks/callouts/RSA no Ads (via Chrome, **sem custo extra**); virar o guia em PDF/landing; gravar Reels. Orçamento mantido em **€ 4,82/dia** (decisão do Vitor).
- **Aplicado no Ads (via Chrome):** 5 callouts + 2 sitelinks de nicho (Nômade Digital, Motorista/CAP) + 1 RSA novo. Lance da campanha agora = **Maximizar conversões** (fase de aprendizado). Guia da isca exportado em **PDF** (`Guia_Morar_na_Espanha.pdf`, fora do repo).
- ⚠️🔧 **Política "Serviços oficiais e documentos do governo":** anúncios da nossa categoria (visto/documento) são **restritos** e exigem certificação (reservada a governo/concessionária). Caímos nisso: 1 sitelink reprovado (CAP "Dirija e trabalhe legal na UE") + 2 títulos limitados ("Do Brasil até a Espanha", "Visto 100% Legal e Seguro"). **Corrigido pra linguagem de consultoria** → "Assessoria Motorista CAP / Orientação no processo", "Mudança com Quem Vive Lá", "Imigração Legal e Segura". Resultado: anúncios voltaram a **Qualificada**. *(Importante: "limitado" ≠ bloqueio; strikes/suspensão só valem p/ violações graves — doc falso, drogas, armas, fraude. Nunca houve risco de suspensão por isso.)*
- 🔒 **Verificação de identidade do anunciante concluída** (resolve o prazo 28/06 — ESSE, sim, era o real risco de a conta ter os anúncios pausados).
- 📌 **REGRA FIXA (aprendizado):** (1) **toda copy de anúncio/sitelink/callout = consultoria/orientação**, NUNCA "tirar/fornecer/garantir o visto ou documento"; (2) **revisar as políticas do Google ANTES de subir** qualquer anúncio no nosso nicho (imigração = categoria restrita).

### 2026-06-18
- **Checkpoint Search (14–18/06):** 1.414 impr · CTR **3,82%** · 54 cliques · CPC **€ 0,38** · **8 conversões (cliques WhatsApp)** · taxa de conv. **14,81%** · custo **€ 20,61** → **€ 2,58 por lead**. ✅ Rastreamento de conversão confirmado funcionando. Campanha **limitada por orçamento** (€ 4,82/dia) e ainda em **aprendizado de lances** (Maximizar cliques). **PMax desconsiderada** (Vitor criou antes da estratégia; queima verba em Display — foco 100% na Search). Optimization score: campanha 86,1% / conta 91,1%. **Pendências priorizadas:** escalar orçamento (aguarda OK do Vitor), adicionar sitelinks/callouts, trocar amplas→frase, negativar termos, grupos próprios (nômade/aposentado/CAP), e ao chegar ~15–30 conv. trocar p/ Maximizar conversões. **Pesquisa de concorrentes** (Espanha Fácil etc.) a iniciar via Insights de leilão + Centro de Transparência de Anúncios.

### 2026-06-16
- **22:50** — 🎉🎉 **PRIMEIRA VENDA FECHADA + 3 leads!** Origem confirmada pelo Vitor: **Anúncio do Google (Search)**. A campanha de Pesquisa (criada em 15/06) converteu em **~1 dia**, com só **€ 4,82/dia**. **Valida a virada PMax → Search** — primeiro ROI real. ✅

### 2026-06-15
- **13:16** — 🎬✍️ **Roteiros de TikTok expandidos para FALADOS completos** (14 roteiros, palavra por palavra) + **template de reação a notícia diária** + lifestyle usando b-roll (La Manga, Murcia, praias, palmeiras). Marcados 🎯 impulsionar (só Brasil) vs 🌱 orgânico/marca. **Foco de público: brasileiros que vêm DIRETO do Brasil** (NÃO Portugal/já-na-Espanha). `roteiros_tiktok.md`.
- **13:15** — 🎬 **12 roteiros de TikTok orgânico criados** (`roteiros_tiktok.md`): caminhoneiro/CAP, nômade digital, aposentado, mito turista, história do Vitor, família, 4 passos, erros do visto, "é caro?", visto estudo, Portugal→Espanha, POV. Alinhados aos temas quentes da pesquisa. *(Conteúdo orgânico pra gravar — diferente do kit de anúncios pagos `roteiros_redes_sociais.md`.)*
- **~11:25** — ➕ **7 keywords de alto valor adicionadas** (frase) ao Grupo 1: Nômade Digital (`visto nomade digital espanha`, `...requisitos`, `...para brasileiros`, `como tirar...`) + Não Lucrativa/Aposentado (`visto não lucrativa espanha`, `visto de aposentado espanha`, `como morar na espanha sendo aposentado`). *Interim: usam o anúncio genérico — merecem **anúncio próprio** depois. Algumas em "baixo volume" (nicho).*
- **~11:12** — ⛔ **~36 palavras NEGATIVAS adicionadas** (nível campanha): turismo, emprego/vagas, outros países (não-Portugal), cidadania por descendência, golden visa, curso de espanhol, futebol, reddit, etc. *(Deixei "grátis" e "portugal" de fora de propósito — pra não bloquear leads da isca gratuita e brasileiros vindos de Portugal.)*
- **11:05** — ➕ **9 palavras-chave de alto volume adicionadas** (correspondência de frase) ao Grupo 1, com base na pesquisa (`visto espanha para brasileiros`, `como morar na espanha legalmente`, `imigrar para a espanha`, `visto de residência espanha`, etc.). Reaproveitou o anúncio atual. ⚠️ As 6 keywords antigas estão em correspondência **AMPLA** (revisar → frase); negativas ainda pendentes.
- **10:17** — 🔎 **Pesquisa de palavras-chave + tendências** (via agente). **Achado-chave:** a campanha mira "assessoria/consultoria" = volume de busca quase nulo; o público busca a dor/objetivo (`visto espanha para brasileiros`, `como morar na espanha legalmente`, `visto nomade digital requisitos`). Faltam grupos de alto volume (nômade digital, não lucrativa/aposentado, residência/família, estudo, CNH/CAP). Tendência quente: motorista CAP/caminhoneiro. Golden Visa morto (negativar). **Relatório completo: `pesquisa_palavras_chave_2026-06.md`.**
- **~10:00** — ✅ **Verificação do anunciante concluída** (Vitor) → **conta saiu da pausa**. Campanha de Search passou a **"Qualificada (aprendizado)"** (veiculando).
- **~09:40** — Adicionadas à campanha de Search: **4 frases de destaque** (*Análise grátis WhatsApp · Sem compromisso · Suporte Brasil e Espanha · +7 anos de experiência*) e **4 sitelinks** (*Análise Gratuita* → topo; *Quem Somos* → #historia; *Pacotes e Preços* → #servicos; *Resultados Reais* → #cases), cada sitelink com 2 descrições. *(entraram "Em análise")*
- **manhã** — **Campanha de Search criada e ativada** (Vitor ativou; PMax pausado). Configuração detalhada abaixo.
- **00:57** — Documentado o **plano da campanha de Search** em `plano_campanha_search_google_ads.md`.
- **00:04** — Site: **logo.jpg reduzido 90%** (162 KB → 17 KB; carrega em todas as páginas) + **SEO técnico** (robots.txt, sitemap.xml, canonical, favicon, correção do domínio errado nos dados estruturados). Deploy em produção.

### 2026-06-14
- **23:58** — Rastreamento: conversão do WhatsApp passou a usar **`transport_type: beacon`** (confiabilidade no celular). Deploy em produção.
- **21:02** — SEO: tags **Open Graph / Twitter Card** adicionadas.
- **17:39** — Instalado o **snippet de conversão** do Google Ads nos links de WhatsApp.
- **17:30** — Instalada a **tag global** do Google Ads (`AW-18239034284`).

---

## 🔍 Campanha de Search — configuração (criada em 2026-06-15)

- **Nome:** Pesquisa - Espanha (Leads WhatsApp) · **ID:** `23936318544`
- **Tipo:** Rede de Pesquisa (Display e Parceiros de pesquisa **DESLIGADOS**)
- **Local:** Brasil (presença) · **Idioma:** Português
- **Lances:** Maximizar cliques · **CPC máx:** € 0,70
- **Orçamento:** € 4,82/dia
- **Meta:** clique no WhatsApp (definida como Principal)
- **Grupo 1 — Assessoria/Consultoria** (correspondência de frase): `assessoria imigração espanha`, `assessoria para morar na espanha`, `consultoria imigração espanha`, `assessoria de visto espanha`, `ajuda para morar na espanha`, `como tirar visto para espanha`
- **Anúncio (RSA):** 10 títulos + 4 descrições → leva ao site
- **Extensões:** 4 frases de destaque + 4 sitelinks (ver linha do tempo)

---

## 📊 Checkpoints de resultados (atualizar a cada revisão)

| Data | Impressões | Cliques | CTR | CPC méd. | Conv. WhatsApp | Custo | Observações |
|---|---|---|---|---|---|---|---|
| 2026-06-15 | 22,2 mil* | 302* | — | € 0,05* | 0 | € 13,65* | *Números acumulados, quase tudo do **PMax** (agora pausado). Search recém no ar (aprendizado). |
| 2026-06-22 | 5.383 | 129 | 2,40% | € 0,31 | **27** | € 39,72 | **Só Search** (14–22/jun). **CPA € 1,47** · taxa conv 20,93%. Orçamento subiu p/ **€ 17** em 23/06 → próximo checkpoint medir CPA no novo patamar. |

> Próximo checkpoint sugerido: **~2026-06-18 a 19** (após 3-5 dias da Search rodando), já com dados só da Search.

---

## ⏳ Pendências / próximos passos
- [~] **Migrar eixo de palavras-chave** — PARCIAL (2026-06-15): 9 termos-objetivo de alto volume adicionados ao Grupo 1. Falta subir grupos com **anúncio próprio**: Nômade Digital, Não Lucrativa/Aposentado, Estudo, CNH/CAP — ver `pesquisa_palavras_chave_2026-06.md`.
- [ ] **Trocar as 6 keywords antigas de AMPLA → FRASE** (controle de custo).
- [x] **Subir palavras NEGATIVAS** — FEITO (~36, nível campanha, 2026-06-15).
- [ ] Puxar **volume exato + CPC** no Planejador de Palavras-chave (Keyword Planner) das ~30 keywords recomendadas.
- [ ] (após 3-5 dias) Revisar **termos de pesquisa** e adicionar **palavras negativas** (lista pronta no relatório de pesquisa).
- [ ] Confirmar se as **conversões do WhatsApp** estão entrando.
- [ ] Adicionar **grupos 2 e 3** (Morar na Espanha, Nômade Digital) — ver `plano_campanha_search_google_ads.md`.
- [ ] Após ~15-30 conversões: trocar lance para **Maximizar conversões**.
- [ ] Reavaliar orçamento (€ 4,82 → € 10,78?) quando houver dados.
- [ ] (futuro) Captura de e-mail, Blog (SEO), Pixels da Meta e do TikTok — quando lançar nessas redes.

---
> **Regra fixa:** nada que gaste ou altere verba no Ads sem confirmação do Vitor.
