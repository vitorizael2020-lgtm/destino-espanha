# Como Atualizar e Publicar o Site

O destino da migração é **Cloudflare Workers + Static Assets**. Enquanto a URL `workers.dev` não for homologada e o DNS não for trocado, a produção continua na Netlify; abrir ou integrar este pull request não altera o domínio.

## Estado da migração

- [x] Worker, pacote público e testes preparados;
- [ ] `TRACKING_390344_CONFIG` cadastrado de forma segura;
- [ ] URL temporária `workers.dev` publicada e homologada;
- [ ] registros DNS preservados e domínio conectado;
- [ ] Netlify desativada somente após a validação final.

## 1. Instalar e validar

```bash
npm ci
npm run check
```

O comando `check`:

1. cria `.cloudflare-dist` somente com os arquivos autorizados;
2. verifica referências locais e impede a publicação de código, documentos internos e templates protegidos;
3. testa o site estático, o redirecionamento do WhatsApp e o acompanhamento com senha.

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

Depois de revisar e integrar o pull request, cadastre estes segredos em **Settings > Secrets and variables > Actions** no GitHub:

- `CLOUDFLARE_API_TOKEN`: token com permissão mínima para publicar Workers;
- `TRACKING_390344_CONFIG`: configuração protegida do acompanhamento.

O Account ID `55057a6f624af0b23eefddb19302e757` está fixado no `wrangler.jsonc`, evitando publicação acidental em outra conta. Ele é um identificador, não uma credencial.

Não envie os valores por chat, issue, pull request ou log. Em seguida, abra **Actions > Cloudflare > Run workflow**. O workflow executa todas as validações e só publica quando iniciado manualmente.

Os pull requests executam somente `npm run check`; eles não recebem os segredos e não publicam o Worker.

Como alternativa local, depois de autenticar o Wrangler:

```bash
npm run deploy
```

O Wrangler executa novamente todas as validações antes do upload.

## Configuração protegida

O Worker precisa do secret `TRACKING_390344_CONFIG` para gerar o acompanhamento. Configure-o na conta da Cloudflare e nunca grave o valor em arquivos, commits, logs ou variáveis públicas:

```bash
npx wrangler secret put TRACKING_390344_CONFIG
```

Copie o valor integralmente, sem converter, reformatar ou extrair campos. A confirmação deve verificar apenas se o secret existe, nunca imprimir seu conteúdo.

Se o secret estiver ausente ou inválido, a rota de acompanhamento retorna indisponível sem revelar dados.

## Troca de DNS e reversão

Antes de trocar os nameservers, copie e confira todos os registros atuais, principalmente **MX, SPF, DKIM e DMARC**. A migração da hospedagem não deve interromper o e-mail. Primeiro valide a versão temporária `workers.dev`; conecte o domínio somente depois da homologação.

Após conectar o domínio, valide o domínio raiz, `www`, HTTPS, `/whatsapp`, a rota protegida e o recebimento de e-mail. Se algum teste crítico falhar, reverta o apontamento web para a Netlify enquanto corrige a Cloudflare.

Os arquivos antigos da Netlify e a implantação atual permanecem temporariamente como referência de reversão. Eles não entram no pacote público da Cloudflare e só devem ser removidos depois da homologação e do período de observação.
