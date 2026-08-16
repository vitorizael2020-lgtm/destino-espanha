# Como Atualizar e Publicar o Site

O destino da migração é **Cloudflare Workers + Static Assets**. Integrar o pull request, por si só, não altera DNS nem publica o site: o deploy continua sendo manual.

> Estado operacional verificado em 16/08/2026: o domínio e a URL da Netlify retornavam `Site not found`. Por isso, a primeira prioridade é publicar e homologar a URL `workers.dev`; o DNS só deve mudar depois que essa versão estiver aprovada.

## Estado da migração

- [x] Worker, pacote público e testes preparados;
- [x] validação `wrangler deploy --dry-run` incluída no CI;
- [x] login protegido por limite de tentativas e de corpo;
- [ ] credenciais de deploy cadastradas de forma segura;
- [ ] URL temporária `workers.dev` publicada e homologada;
- [ ] registros DNS preservados e domínio conectado;
- [ ] `workers.dev` desativado ou protegido após o domínio entrar;
- [ ] Netlify removida somente após a validação final e o período de observação.

## 1. Instalar e validar

```bash
npm ci
npm run check
npm run deploy:dry-run
```

Esses comandos:

1. criam `.cloudflare-dist` somente com os arquivos autorizados;
2. verificam referências locais e impedem a publicação de código, documentos internos e templates protegidos;
3. executam os testes do site, WhatsApp e acompanhamento;
4. fazem o Wrangler montar o Worker e validar a configuração e os Static Assets sem publicar.

## 2. Testar localmente

```bash
npm run dev
```

Abra a URL informada pelo Wrangler e confira a página inicial, o login, o portal do cliente, `/whatsapp` e o acompanhamento protegido.

## 3. Salvar no GitHub

Trabalhe em uma branch e abra um pull request antes de alterar a produção:

```bash
git switch -c minha-alteracao
git add .
git commit -m "feat: descreva a alteracao"
git push -u origin minha-alteracao
```

## 4. Publicar pelo GitHub Actions

Depois de revisar e integrar o pull request, cadastre em **Settings > Secrets and variables > Actions**:

- `CLOUDFLARE_API_TOKEN`: obrigatório; token com permissão mínima para publicar Workers;
- `TRACKING_390344_CONFIG`: configuração protegida do acompanhamento. Pode ficar ausente apenas no primeiro deploy de recuperação; nesse caso, somente a rota de acompanhamento responde `503`.

O Account ID `55057a6f624af0b23eefddb19302e757` está fixado no `wrangler.jsonc`. Ele é um identificador, não uma credencial.

Não envie os valores por chat, issue, pull request ou log. Abra **Actions > Cloudflare > Run workflow** depois de cadastrar o token. Cadastre também a configuração antes de homologar a rota de acompanhamento.

O workflow:

1. executa testes e o dry-run antes de receber credenciais;
2. quando a configuração protegida existe, valida tamanho e requisitos mínimos sem imprimi-la;
3. cria um arquivo temporário com permissão restrita somente quando necessário;
4. executa `wrangler deploy --secrets-file`, enviando código e secret na mesma versão, ou `wrangler deploy` quando o acompanhamento ainda não foi configurado;
5. apaga o arquivo temporário mesmo se o deploy falhar.

Isso evita o estado intermediário de código antigo com secret novo. Os pull requests não recebem segredos e nunca publicam.

Em deploys posteriores, o Wrangler preserva os secrets existentes. Para um primeiro deploy local, use um arquivo JSON ou `.env` temporário fora do repositório:

```bash
npx wrangler deploy --secrets-file /caminho/segredos-producao.json
```

Apague esse arquivo imediatamente depois e nunca o adicione ao Git.

## Configuração protegida

O acompanhamento exige `TRACKING_390344_CONFIG`. Sem ele, o restante do site funciona e essa rota falha de forma fechada com `503`. Quando configurado, o valor deve:

- ser um JSON codificado integralmente em base64url;
- ter no máximo 5 KB;
- conter uma senha com pelo menos 12 caracteres;
- conter um `sessionSecret` aleatório com pelo menos 32 bytes.

Copie o valor integralmente, sem converter, reformatar ou extrair campos. A confirmação deve verificar apenas formato, tamanho e presença, nunca imprimir o conteúdo.

Se o secret estiver ausente ou inválido, a rota de acompanhamento falha fechada e não revela dados.

## Homologação em `workers.dev`

Antes de conectar o domínio, teste na URL temporária:

- raiz, páginas institucionais, imagens, CSS, JavaScript e URLs `*.html`;
- `www`, HTTPS e redirecionamentos esperados;
- login Supabase, áreas de administrador e cliente e redefinição de senha;
- formulário/entrega de e-mail;
- `/whatsapp` e `/WHATSAPP/`;
- acompanhamento: login correto, senha errada, expiração da sessão e limite de tentativas.

Registre o resultado e não avance com falhas críticas.

## DNS, versões e reversão

Antes de alterar nameservers ou registros web, exporte e confira todos os registros atuais, principalmente **MX, SPF, DKIM e DMARC**. A migração da hospedagem não deve interromper o e-mail.

Antes do cutover, liste as versões e guarde o ID estável:

```bash
npx wrangler versions list
```

Depois de conectar o domínio, repita a homologação no domínio raiz e em `www`. Se o Worker falhar, reverta imediatamente para a versão estável:

```bash
npx wrangler rollback <VERSION_ID_ESTAVEL>
```

Se a falha for de DNS ou domínio, restaure o apontamento web anterior enquanto corrige a Cloudflare. Não altere os registros de e-mail durante essa reversão.

Depois que o domínio estiver estável, defina `workers_dev` como `false` e publique novamente, a menos que a URL temporária tenha sido deliberadamente protegida. Mantenha os arquivos da Netlify como referência recuperável até concluir o período de observação.
