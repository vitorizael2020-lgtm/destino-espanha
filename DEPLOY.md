# Como Atualizar e Publicar o Site (Deploy)

Sempre que fizermos alterações no site (como mudar textos, imagens ou adicionar tags de rastreamento), precisamos garantir que as alterações sejam **salvas**, **enviadas para o GitHub** (Git Commit & Push) e **publicadas na Netlify** (Deploy).

Siga os passos abaixo no terminal do projeto para garantir que tudo atualize corretamente.

---

## Passo 1: Salvar e Enviar para o GitHub (Git)

Para registrar as alterações no histórico e atualizar o repositório online:

```bash
# 1. Adicionar todos os arquivos modificados
git add .

# 2. Criar o commit com uma mensagem descritiva
git commit -m "feat: atualizacao do site e tags"

# 3. Enviar para o GitHub
git push origin master
```

---

## Passo 2: Publicar na Netlify (Deploy)

Como o site às vezes não atualiza automaticamente apenas com o `git push` devido a configurações do servidor, a forma mais segura e garantida de publicar é rodando o comando da Netlify direto do seu terminal local:

```bash
# Publicar a versão atual da pasta diretamente em produção
npx netlify deploy --prod --dir=.
```

### O que este comando faz?
1. Ele faz o upload dos arquivos modificados diretamente para os servidores da Netlify.
2. Limpa o cache antigo do site.
3. Deixa a nova versão online imediatamente (em menos de 10 segundos).

---

## Resumo de Comandos Rápidos (Copiar e Colar)

Se quiser rodar tudo de uma vez só para salvar e publicar, copie e cole esta linha única no seu terminal:

```bash
git add .; git commit -m "update: deploy automatico"; git push origin master; npx netlify deploy --prod --dir=.
```
