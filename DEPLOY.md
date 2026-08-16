# Como Atualizar e Publicar o Site

O site é publicado no **Cloudflare Workers + Static Assets**. O domínio continua sendo `destinoespanhaassessoria.com`; somente a infraestrutura de hospedagem mudou.

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

## 4. Publicar

Depois da revisão:

```bash
npm run deploy
```

O Wrangler executa novamente todas as validações antes do upload.

## Configuração protegida

O Worker precisa do secret `TRACKING_390344_CONFIG` para gerar o acompanhamento. Configure-o na conta da Cloudflare e nunca grave o valor em arquivos, commits, logs ou variáveis públicas:

```bash
npx wrangler secret put TRACKING_390344_CONFIG
```

Se o secret estiver ausente ou inválido, a rota de acompanhamento retorna indisponível sem revelar dados.

## Troca de DNS

Antes de trocar os nameservers, copie e confira todos os registros atuais, principalmente **MX, SPF, DKIM e DMARC**. A migração da hospedagem não deve interromper o e-mail. Primeiro valide a versão temporária `workers.dev`; conecte o domínio somente depois da homologação.

Os arquivos antigos da Netlify permanecem no repositório temporariamente como referência de reversão e não entram no pacote público da Cloudflare.
