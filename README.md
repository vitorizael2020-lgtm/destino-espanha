# Destino Espanha

Site institucional e portal operacional da **Destino Espanha Assessoria**, empresa brasileira de Vitor Izael Vieira Lemos, CNPJ 42.952.684/0001-71, constituída em 02/08/2021 e cadastrada como Agência de Turismo no Cadastur.

## Site público

- Landing page responsiva com uma rota real Brasil–Madrid e acesso à experiência cinematográfica em cinco capítulos.
- Experiência Madrid 3D com fotografias reais, globo terrestre da NASA/GSFC, montagem fragmentada e navegação por rolagem, toque ou controles.
- Páginas específicas de motorista e passagens.
- Perfis comerciais claramente identificados como ilustrativos; não há depoimentos ou resultados inventados.
- Identificação empresarial, termos, privacidade, cookies e canal de atendimento/reclamações.
- Google Ads carregado somente após consentimento; todos os CTAs comerciais de WhatsApp usam a mesma conversão.
- Conteúdo acessível sem JavaScript, navegação por teclado e respeito a `prefers-reduced-motion`.

## Aplicação interna

- `admin/`: gestão operacional de clientes e documentos.
- `cliente/`: portal de acompanhamento do cliente.
- `shared/`: autenticação e configuração do Supabase.
- `worker/`: rotas dinâmicas, redirecionamento controlado do WhatsApp e acompanhamento protegido.
- `protected/`: templates que nunca entram no bundle estático público.

O portal usa Supabase. Não há credenciais de teste documentadas nem senhas fixas no bundle público.

## Desenvolvimento

```bash
npm ci
npm run check
npm run dev
```

O build usa uma lista positiva em `scripts/build-cloudflare.mjs`. O verificador recusa arquivos privados, referências quebradas e senhas temporárias fixas.

## Publicação

A hospedagem oficial é **Cloudflare Workers + Static Assets**. Toda mudança passa por pull request e pelas validações do GitHub Actions. Depois do merge em `master`, execute o workflow **Cloudflare** manualmente.

```bash
npm run deploy:dry-run
```

- Produção: `https://destinoespanhaassessoria.com`
- Worker: `destino-espanha`
- Procedimento operacional: `DEPLOY.md`
