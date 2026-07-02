# ✈️ Plano — Frente de PASSAGENS (Destino Espanha)

> Criado em 2026-07-02 a pedido do Vitor, após pesquisa de mercado. Contexto: passagens já são vendidas informalmente no fechamento dos planos (cotação → cliente aceita → compra otimizada + Onward Ticket → margem). Objetivo: transformar isso numa **frente de marketing estruturada**, com o mesmo funil dos vistos: **clique → WhatsApp → cotação no x1**.
> ⚖️ Compliance/contábil = setor jurídico do Vitor (fora do escopo deste plano).

---

## 1. A tese (o que descobri na pesquisa)

**Não vamos brigar com Decolar/123milhas/MaxMilhas por "passagem barata"** — eles têm escala infinita, margem de centavos e dominam esse leilão. **Vamos ser donos de um nicho que NINGUÉM atende: a "passagem de MUDANÇA".**

Quem vai **morar** na Espanha tem necessidades que a OTA não resolve (e nem entende):
1. **Só ida + prova de saída:** a Espanha tem histórico de barrar brasileiro sem passagem de volta ([Eurodicas](https://www.eurodicas.com.br/passagem-de-volta-para-o-brasil/): oficiais pedem com frequência; regra Schengen aceita comprovante de *saída* do espaço, não precisa ser volta ao Brasil). A OTA vende ida-e-volta cara; o imigrante não precisa da volta.
2. **Onward Ticket:** reserva real com PNR verificável, validade curta, custa US$7–16 no varejo ([onwardticket.com](https://onwardticket.com/pt)) — o cliente comum não conhece, tem medo de "ser ilegal" e não sabe usar. Nós já vendemos como "Reserva de Retorno" (€25 no site).
3. **Família + bagagem de mudança:** múltiplos passageiros, malas extras (23kg/158cm, taxas variam por cia), criança, pet. Ninguém orienta isso junto com a passagem.
4. **Data casada com o visto:** o imigrante compra passagem em função da cita/aprovação — a assessoria que JÁ cuida do visto é o lugar natural pra comprar.

**Conclusão:** o produto não é "passagem barata", é **"a passagem certa da sua mudança, sem risco na imigração"** — preço final fechado, com curadoria de rota, reserva de retorno inclusa e orientação de bagagem/família. A margem fica embutida no valor do serviço (modelo padrão de agência).

## 2. Nomenclatura — veredito

- Seção atual: ~~"Passagens Aéreas com Preço Negociado"~~ → **"Passagens de Mudança para a Espanha"**. "Preço negociado" vira bullet, não título. O nome novo casa com a dor buscada ("mudar", "só de ida") e nos tira da comparação direta com OTA.
- **Criar landing dedicada `/passagens`** (mesmo modelo da `/motorista`): hero com dor ("Vai se mudar? Não compre ida-e-volta à toa") → 3 blocos (Só ida sem risco / Reserva de retorno inclusa / Família e bagagem) → como funciona (cotação no WhatsApp em 4 passos) → FAQ (é seguro? o que a imigração pede? posso levar 4 malas?) → CTA.
- **CTA pré-preenchido etiquetado** (pra atendente triar na hora): *"Olá! Quero uma cotação de passagens para a minha mudança para a Espanha."*

## 3. O funil (igual aos pacotes — como o Vitor pediu)

```
Anúncio/Blog/Reel → /passagens → WhatsApp (texto etiquetado) → atendente qualifica
→ Vitor pesquisa (FlightConnections/Google Flights/etc.) → envia CARD DE COTAÇÃO no WhatsApp
→ cliente aceita → emissão + Onward Ticket → card de confirmação (já temos o modelo dos PDFs)
```

### 🃏 Card de Cotação padronizado (o "print 2")
Item novo a construir: **gerador interno de card de cotação** (página no admin, uso só nosso):
- Formulário: nome do cliente, rota, data, direto/escala, cia, tarifa final (R$), o que está incluso (reserva de retorno ✓, bagagem 23kg ✓, seguro ✗/✓, suporte ✓), validade da proposta.
- Gera **imagem PNG vertical** (boa pra WhatsApp) com a identidade Destino Espanha (navy+dourado, não o estilo "agência genérica" do exemplo Guia&Rota).
- Ganho: fechamento com cara profissional em 30 segundos, padronizado, sem depender de arte manual.
- Regra de copy no card: mostrar **"Tarifa final — tudo incluso"** (serviço embutido). Nunca rotular como "preço da companhia".

## 4. Google Ads — ⚠️ decisão de verba necessária

**Importante (descoberto na auditoria):** a campanha atual tem **"passagem/passagens" como palavra NEGATIVA** (proteção contra turista). Ou seja, keywords de passagem **não podem entrar na campanha atual** — e nem devem (intenção diferente, CPA diferente).

**Recomendação: campanha separada "Passagens - Mudança Espanha"**, orçamento-teste **€5/dia** (~R$180/mês) — *aguarda OK do Vitor (regra: verba só com confirmação)*:
- **🎯 PERSONA (definição do Vitor, 02/07):** caminhoneiro, enfermeira, família trabalhadora — **não pesquisa "hacks de viagem"**; vai na CVC do shopping, recebe 1–2 cotações caras e compara. Nós entramos como "a cotação melhor". **NUNCA usar keywords de mecânica** (`onward ticket`, `comprovante de volta`, `reserva de voo para imigração`) — atraem o nômade/TI que faz sozinho E ensinam o método ao cliente. O cliente ouve só o resultado: *"emito a sua só de ida com a volta cancelada — sai mais barato que ida-e-volta"*.
- **Keywords (frase) — como a NOSSA persona busca:**
  - `passagem só de ida para espanha` · `passagem de ida para a espanha`
  - `passagem barata para espanha` · `quanto custa passagem para espanha`
  - `passagem para espanha parcelada` · `passagem parcelada internacional`
  - `passagem para morar na espanha` · `agência de passagens para espanha`
- **Negativas da nova campanha:** onward ticket, milhas, decolar, 123milhas, maxmilhas, latam pass, smiles, feriado, réveillon, pacote turístico, hotel, resort.
- **Copy (sem restrição gov-docs! aqui pode ser mais agressivo):** "Passagem de Mudança p/ Espanha" · "Só Ida + Reserva de Retorno" · "Sem Risco na Imigração" · "Cotação Grátis no WhatsApp" · "Preço Final p/ Toda a Família".
- Landing: `/passagens`. Conversão: mesmo clique WhatsApp.
- **Bônus:** anúncio de passagens não cai na categoria restrita de imigração → sem "limitado", CTR melhor.

## 5. Blog — passagens é O tema perfeito pra estrear (Tarefa #5)

Alto volume de busca, zero restrição de política, dor real, e **cada artigo termina no WhatsApp**. 4 artigos-pilar:
1. **"Passagem só de ida para a Espanha: como não ser barrado na imigração (2026)"** — a dor nº1; explica que a imigração costuma exigir prova de retorno e que **nós emitimos a só-ida já com isso resolvido** (SEM explicar a mecânica). CTA cotação.
2. **"Ida-e-volta ou só de ida: qual comprar quando você vai MORAR fora (e por que a só-ida sai mais barato)"** — ataca direto a comparação com a cotação cara da agência de shopping; nossa persona se vê nesse texto. *(substituiu o artigo sobre Onward Ticket — não ensinar o método, decisão do Vitor 02/07)*.
3. **"Quanto custa a passagem de mudança para a Espanha (família, datas, bagagem)"** — capta busca de preço; mostra faixas reais e o que encarece; CTA cotação.
4. **"Bagagem de mudança: quantas malas dá pra levar e quanto custa"** — 23kg/158cm, taxa por cia, dicas; CTA.
> Interlinkar os 4 + linkar da /passagens. Estrutura de blog nasce aqui (`/blog/` simples, mesmo visual).

## 6. Reels/TikTok — formato que viraliza
- **"Achei GRU→MAD por R$X"** (print de tela + voz): gancho de preço, CTA "quer que eu ache a sua? link na bio". 
- **"Você NÃO precisa comprar ida-e-volta pra mudar de país"** — quebra de mito (salva/compartilha muito).
- **"O documento de R$100 que evita você ser barrado"** (reserva de retorno) — curiosidade.
> Roteiros completos eu escrevo quando o Vitor for gravar (mesmo formato do pacote motorista).

## 7. Upsell interno (o mais barato de todos)
- **Script pra atendente:** todo lead de visto qualificado ouve, no fechamento: *"Você já tem as passagens? A gente cuida disso também — cota sem compromisso."*
- Card "Passagens" na **área do cliente** (quem já é cliente de visto vê a oferta lá).
- Nos PDFs de plano de ação (Diagnóstico), incluir linha "Passagens de mudança: cotação inclusa".

## 8. Guardrails de copy (curto e prático)
- Vender **"tarifa final com tudo incluso"** — nunca "preço de custo da companhia" nem "desconto sobre a Decolar".
- Reserva de retorno = **"reserva real e verificável (código PNR)"** — nunca "passagem falsa".
- Nada de "garantimos que você não será barrado" — usar "reduz drasticamente o risco / exigência que a imigração costuma pedir".
- Depoimentos de passagem: usar casos reais assim que houver (Marcos = primeiro case ✓).

## 9. Sequência de execução
| # | Item | Depende de |
|---|---|---|
| 1 | Renomear seção na home + criar landing `/passagens` | — (eu faço) |
| 2 | Gerador de card de cotação (admin) | — (eu faço) |
| 3 | Artigo 1 do blog (só de ida) + estrutura /blog | — (eu faço) |
| 4 | Campanha Ads "Passagens" €5/dia | **OK do Vitor (verba)** |
| 5 | Artigos 2–4 + Reels | gravação/tempo |
| 6 | Script de upsell p/ atendente + card na área do cliente | — (eu faço) |

## 10. Métricas da frente
- Leads WhatsApp com etiqueta "passagens" /semana · taxa de fechamento · margem média por emissão (Vitor informa) · CPA da campanha nova (meta: < €2 por lead de cotação) · tráfego dos artigos (Search Console).

---
*Fontes da pesquisa: [Eurodicas — passagem de volta](https://www.eurodicas.com.br/passagem-de-volta-para-o-brasil/) · [Viajar na Europa — só ida](https://viajarnaeuropa.com.br/viajar-para-europa-so-com-passagem-de-ida/) · [OnwardTicket](https://onwardticket.com/pt) · [Melhores Destinos — bagagem](https://www.melhoresdestinos.com.br/bagagem-gratis-voos-internacionais.html) · consulados/Schengen via espanhalegal.info.*
