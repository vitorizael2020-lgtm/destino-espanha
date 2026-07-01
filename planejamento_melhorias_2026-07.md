# 🎯 Planejamento de Melhorias — Destino Espanha (julho/2026)

> Criado em 2026-07-01 após auditoria completa: site (código + conteúdo), paleta de cores, campanhas Google Ads (dados 14–30/jun), concorrentes e funil. Atualizar conforme itens forem concluídos.

---

## 📊 Diagnóstico geral (onde estamos)

**O que está FORTE ✅**
- **Campanha Search:** CPA **€0,94** · 122 leads/17 dias · taxa de conversão 22,8% (excelente pro nicho). Reestruturada em 01/07 em 5 grupos temáticos.
- **Site tecnicamente sólido:** SEO técnico feito (sitemap, canonical, schema, OG), tag de conversão com beacon, velocidade otimizada, design premium coerente.
- **Diferencial real vs concorrência:** founder-led (Vitor mora lá), nichos (CAP/motorista, trabalho), **área do cliente online** (nenhum concorrente tem), diagnóstico barato R$295 como porta de entrada.
- **Kit de conteúdo pronto:** 14 roteiros TikTok + 8 roteiros motorista/CAP + legendas + isca digital (PDF pronto).

**O que está FRACO ⚠️ (em ordem de gravidade)**
1. **Prova social com furo grave:** depoimento de **Golden Visa datado de 2026 — o programa foi EXTINTO em abr/2025**. Qualquer lead informado (ou revisor do Google) percebe. Mina toda a credibilidade da seção.
2. **Cases desalinhados do posicionamento:** 3 de 8 depoimentos são de **nacionalidade/cidadania** — exatamente o território da Espanha Fácil que decidimos NÃO disputar (até negativamos essas palavras no Ads). E **não existe case de Motorista/CAP nem de Trabalho** — nossos nichos mais quentes.
3. **Todos os anúncios apontam pra home genérica:** os grupos novos (Trabalho, Motorista CAP, Documentos NIE, Estudo) caem na mesma página. Sem landing por nicho, o Índice de Qualidade fica travado e a conversão é menor.
4. **Sinal de conversão fraco:** otimizamos pra "clique no WhatsApp" — o Google não sabe quem VIROU VENDA. Lead curioso vale igual a cliente de €2.000.
5. **Isca digital manual:** guias entregues só via WhatsApp → sem captura de e-mail, lead noturno esfria, zero remarketing.
6. **Orgânico parado:** blog inexistente, Reels não gravados (roteiros prontos), pixels Meta/TikTok não instalados.
7. **Paleta com problemas de contraste/acessibilidade** (detalhe abaixo).

---

## 🎨 Análise da Paleta de Cores

**Paleta atual (style.css):**
| Papel | Cor | Uso |
|---|---|---|
| Primária | `#0a0f1a` navy escuro (+ variações `#141c2e`, `#1a2744`) | Fundos hero/footer, títulos |
| Destaque | `#d4a853` dourado (+ `#f0d68a` claro, `#b8912e` escuro) | CTAs, labels, gradientes, preços |
| Acentos | `#4a7cff` azul · `#2dd4bf` teal | Detalhes pontuais |
| Neutros | `#1a1a2e` texto · `#6b7280`/`#9ca3af` cinzas · `#f8fafc`/`#f1f5f9` fundos |
| Fontes | Playfair Display (títulos serif) + Inter (texto) |

**Veredito: a base é BOA — manter.** Navy + dourado transmite premium/confiança e **foge do azul-clichê** das agências de imigração (Espanha Fácil = vermelho/amarelo populares; zerrahq = azul corporativo). O glassmorphism está bem executado. **Não trocar a paleta — corrigir o uso:**

1. **⚠️ Contraste reprovado (acessibilidade WCAG):**
   - `--gold #d4a853` sobre **branco** (section-labels, ícones, links) = contraste **~2,2:1** → reprova AA (mínimo 4,5:1 texto normal / 3:1 texto grande). Muita gente 40+ (nosso público não-lucrativa/aposentado!) lê mal.
   - `--gold-dark #b8912e` sobre branco (.avulso-link 0.9rem) = ~3,2:1 → ainda reprova pra texto pequeno.
   - **Correção:** criar `--gold-text: #8a6a1d` (ou `#7a5e1a`) e usar em TODO texto dourado sobre fundo claro. Dourado vivo (`#d4a853`) fica reservado pra fundos escuros (onde brilha e passa) e elementos grandes/decorativos.
2. **CTA compete consigo mesmo:** tudo é dourado — botão principal, links, labels, preços. O olho não sabe onde clicar. **Sugestão:** hero com **um único botão dominante**; teste A/B do CTA principal em **verde WhatsApp (#25D366)** — o funil é WhatsApp e o verde é o "affordance" universal de conversa (hipótese clássica de CRO pra este funil).
3. **Identidade "Espanha" tímida:** a paleta atual é "premium genérico". Um toque **discreto** de vermelho espanhol (`#c60b1e`, da bandeira) em micro-detalhes (badge "Mais Escolhido", bullets, tag de promoção) reforçaria o destino sem quebrar o luxo. Usar com muita parcimônia (nunca em texto longo).
4. **Consistência:** conferir se área do cliente/admin usam as mesmas variáveis (evitar deriva de identidade entre páginas).

---

## 🗺️ PLANO DE AÇÃO (priorizado por impacto ÷ esforço)

### 🔴 SEMANA 1 — Credibilidade e correções rápidas ✅ **CONCLUÍDA em 01/07 (deploy 6a45a24f)**
> Itens 1–5 todos aplicados e em produção. Novo item descoberto na execução: **criar .netlifyignore/pasta publish** — o deploy atual publica os .md internos do repo (acessíveis por URL direta). → movido pra Semana 2.
| # | Ação | Impacto | Esforço |
|---|---|---|---|
| 1 | **Trocar os cases problemáticos:** remover "Golden Visa 2026" (programa extinto!) e os 2 de nacionalidade → substituir por **Motorista/CAP, Visto de Trabalho e Estudo-família** (temas que vendemos e anunciamos) | 🔥 Alto (credibilidade + alinhamento) | Baixo |
| 2 | **Corrigir contrastes da paleta** (criar `--gold-text` e aplicar em labels/links sobre fundo claro) | Médio (acessibilidade/legibilidade, público 40+) | Baixo |
| 3 | **Schema FAQPage** no FAQ (rich snippet no Google = mais espaço no resultado orgânico) | Médio | Baixo |
| 4 | Hero: revisar "Vistos de Estudo (CAP)" → separar claro: "Estudo, Trabalho, Não Lucrativa, Motorista (CAP)" — visitante leigo não entende a sigla junto de "estudo" | Médio | Baixo |
| 5 | Deploy + registrar | — | — |

### 🟠 SEMANA 2 — Converter mais do mesmo tráfego
| # | Ação | Impacto | Esforço |
|---|---|---|---|
| 6 | **Landing page /motorista** (primeira — nicho mais quente): dor→oportunidade (30 mil vagas, €2.800–3.200)→como funciona→case→CTA WhatsApp. Apontar o grupo "Motorista CAP" do Ads pra ela. **Depois replicar /trabalho** | 🔥 Alto (IQ↑ = CPC↓ + conversão↑) | Médio |
| 7 | **Captura de e-mail nos guias** (Netlify Forms): formulário nome+e-mail → entrega o PDF automático → sequência follow-up manual por enquanto. Tarefa #4 | 🔥 Alto (leads 24/7 + base própria) | Médio |
| 8 | **Rastrear checkout Stripe como conversão** no Ads (Tarefa #2) | Médio | Baixo |
| 9 | Divulgar a **Área do Cliente** como diferencial no site/anúncios ("acompanhe seu processo online" — ninguém no mercado tem) | Médio | Baixo |

### 🟡 SEMANAS 3–4 — Otimizar pra VENDA, não pra clique
| # | Ação | Impacto | Esforço |
|---|---|---|---|
| 10 | **Conversões de valor:** marcar no Ads quais leads viraram venda (importação manual de conversões offline via planilha, semanal). O Google passa a otimizar pra quem COMPRA. É o upgrade mais importante do funil de mídia | 🔥 Alto | Médio |
| 11 | **Definir tCPA** com dados estabilizados do novo patamar (€17 + grupos novos) | Médio | Baixo |
| 12 | **Blog — 4 artigos fundadores** (long-tail que a Espanha Fácil trata no genérico): "CAP na Espanha passo a passo", "Visto de procura de trabalho 2026", "Quanto custa morar na Espanha (por cidade)", "NIE: guia completo". Tarefa #5 | Alto (médio prazo) | Médio |
| 13 | **Gravar os Reels de motorista** (8 roteiros prontos) + instalar Pixel Meta/TikTok no site quando lançar (Tarefa #6) | Alto (orgânico + retarget) | Médio |

### 🟢 MÊS 2 — Escala e defesa
| # | Ação | Impacto |
|---|---|---|
| 14 | **Prova social real:** depoimento em vídeo/print WhatsApp de clientes reais (com autorização) + Google Reviews (perfil de empresa) | Alto |
| 15 | **Campanha de marca** (Search "destino espanha assessoria") — centavos, defende a marca de concorrente | Baixo custo |
| 16 | **Subir orçamento** além de €17 se CPA seguir < €1,50 E vendas confirmarem qualidade (bônus €400 já garantido até 13/08 no ritmo atual) | Alto |
| 17 | Remarketing Display leve (sem customer match — LGPD ok) pra visitantes que não converteram | Médio |

---

## 📏 Métricas pra acompanhar (checkpoint semanal no registro)
1. **CPA e nº de conversões** (meta: manter < €1,50 escalando)
2. **% vendas/leads** (qualidade do lead — só dá pra ver com o item 10)
3. **Índice de Qualidade** dos grupos novos (meta: sair de "raramente exibido")
4. **% topo da página** no leilão (hoje 36,7% vs zerrahq 84% — meta: >60%)
5. **Leads da isca digital** (e-mails/semana) quando o item 7 estiver no ar
6. Cliques orgânicos (Search Console) quando o blog nascer

---

## 🚫 O que NÃO fazer (decisões já tomadas — não re-litigar)
- ❌ Disputar **cidadania/nacionalidade** com a Espanha Fácil (fora do posicionamento; keywords negativadas)
- ❌ Voltar com **nômade digital** no Ads (0 conversões em 15 cliques; nomadespain domina 99% topo)
- ❌ Publicar **preços nos anúncios** (recursos de preço reprovariam na política gov-docs; padrão do mercado é não publicar)
- ❌ **Customer Match** / lista de clientes no Google (LGPD)
- ❌ Copy que prometa "tirar/garantir visto/documento/vaga" (política + ética — só consultoria/orientação)
- ❌ PMax (queima verba em Display de baixa intenção — já validado)
