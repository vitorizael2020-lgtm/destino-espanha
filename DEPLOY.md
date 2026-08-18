# Como Atualizar e Publicar o Site

A produção oficial usa exclusivamente **Cloudflare Workers + Static Assets**. Integrar o pull request, por si só, não publica o site: o deploy continua sendo manual.

> Estado operacional verificado em 16/08/2026: Worker publicado, domínio raiz e `www` conectados com HTTPS, e projeto da hospedagem anterior excluído. Não recrie deploys fora da Cloudflare nem restaure os antigos registros web.

## Estado da migração

- [x] Worker, pacote público e testes preparados;
- [x] validação `wrangler deploy --dry-run` incluída no CI;
- [x] login protegido por limite de tentativas e de corpo;
- [x] credencial de deploy cadastrada no GitHub Actions;
- [x] URL temporária `workers.dev` publicada e homologada;
- [x] registros DNS preservados e domínio raiz/`www` conectados;
- [ ] `workers.dev` desativado ou protegido após o domínio entrar;
- [x] hospedagem anterior removida após a validação dos domínios oficiais;
- [x] configuração protegida do acompanhamento recuperada em pacote selado;
- [ ] rota protegida homologada em produção após o próximo deploy manual.

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

Depois de revisar e integrar o pull request, confira em **Settings > Secrets and variables > Actions**:

- `CLOUDFLARE_API_TOKEN`: obrigatório; token com permissão mínima para publicar Workers;
- `TRACKING_390344_CONFIG`: opcional; quando presente, substitui o pacote selado versionado.

O Account ID `55057a6f624af0b23eefddb19302e757` está fixado no `wrangler.jsonc`. Ele é um identificador, não uma credencial.

Não envie credenciais por issue, pull request ou log. Abra **Actions > Cloudflare > Run workflow**; não é necessário criar um novo secret para restaurar o acompanhamento atual.

O workflow:

1. executa testes e o dry-run antes de receber credenciais;
2. usa o pacote selado por padrão e, quando um secret de substituição existe, valida tamanho e requisitos mínimos sem imprimi-lo;
3. cria um arquivo temporário com permissão restrita somente quando necessário;
4. executa `wrangler deploy --secrets-file`, enviando código e secret na mesma versão, ou `wrangler deploy` com o pacote selado;
5. confirma que a URL protegida voltou a responder após o deploy;
6. apaga o arquivo temporário mesmo se o deploy falhar.

Isso evita o estado intermediário de código antigo com secret novo. Os pull requests não recebem segredos e nunca publicam.

Em deploys posteriores, o Wrangler preserva os secrets existentes. Para um primeiro deploy local, use um arquivo JSON ou `.env` temporário fora do repositório:

```bash
npx wrangler deploy --secrets-file /caminho/segredos-producao.json
```

Apague esse arquivo imediatamente depois e nunca o adicione ao Git.

## Configuração protegida

O acompanhamento atual fica em `worker/tracking-sealed.js` como conteúdo cifrado e autenticado por AES-GCM. O arquivo não contém senha, nome do cliente, conteúdo, rota ou datas em texto legível. A senha fornecida ao cliente abre os dados somente durante a requisição e nenhuma sessão é preservada; ao atualizar a página, o login volta a ser solicitado.

O secret `TRACKING_390344_CONFIG` continua aceito como substituição operacional. Quando configurado, o valor deve:

- ser um JSON codificado integralmente em base64url;
- ter no máximo 5 KB;
- conter uma senha com pelo menos 12 caracteres;
- conter um `sessionSecret` aleatório com pelo menos 32 bytes.

Copie o valor integralmente, sem converter, reformatar ou extrair campos. A confirmação deve verificar apenas formato, tamanho e presença, nunca imprimir o conteúdo.

Se o secret estiver ausente ou inválido, o pacote selado válido é usado; sem nenhuma das duas configurações válidas, a rota falha fechada e não revela dados. Para trocar dados ou senha, gere um novo pacote selado com salt e IV aleatórios; nunca edite o texto cifrado manualmente nem registre os dados legíveis no Git.

## Homologação

Antes e depois de cada publicação, teste a URL temporária e os dois domínios oficiais:

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

Se a falha for de DNS ou domínio, corrija os domínios personalizados e os registros atuais na Cloudflare. A hospedagem anterior foi encerrada e não é uma opção de reversão. Não altere os registros de e-mail durante a correção.

Depois que o domínio estiver estável, defina `workers_dev` como `false` e publique novamente, a menos que a URL temporária tenha sido deliberadamente protegida. O histórico anterior permanece recuperável pelo Git, mas nenhum arquivo operacional da plataforma desativada deve voltar ao branch ativo.
