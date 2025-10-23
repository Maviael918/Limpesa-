# Guia de Implantação - Limpesa

Este documento fornece instruções para implantar a aplicação Limpesa permanentemente em plataformas de hospedagem.

## Opções de Hospedagem

### 1. Netlify (Recomendado)

**Passos:**

1. Acesse [netlify.com](https://netlify.com) e faça login com sua conta GitHub.
2. Clique em "New site from Git".
3. Selecione o repositório `Maviael918/Limpesa-`.
4. Escolha a branch `master`.
5. Clique em "Deploy site".
6. Após o deploy, vá para "Site settings" > "Build & deploy" > "Environment".
7. Adicione as variáveis de ambiente:
   - `SUPABASE_URL`: Sua URL do Supabase
   - `SUPABASE_ANON_KEY`: Sua chave anônima do Supabase

**Vantagens:**
- Implantação automática a cada push
- SSL/HTTPS gratuito
- CDN global
- Domínio gratuito (*.netlify.app)

### 2. Vercel

**Passos:**

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub.
2. Clique em "New Project".
3. Selecione o repositório `Maviael918/Limpesa-`.
4. Clique em "Import".
5. Configure as variáveis de ambiente:
   - `SUPABASE_URL`: Sua URL do Supabase
   - `SUPABASE_ANON_KEY`: Sua chave anônima do Supabase
6. Clique em "Deploy".

**Vantagens:**
- Implantação automática
- Performance otimizada
- Domínio gratuito (*.vercel.app)
- Suporte a serverless functions

### 3. GitHub Pages

**Passos:**

1. Vá para as configurações do repositório no GitHub.
2. Navegue até "Pages".
3. Selecione "Deploy from a branch".
4. Escolha a branch `master` e a pasta raiz.
5. Clique em "Save".

**Vantagens:**
- Totalmente gratuito
- Integrado ao GitHub
- Domínio gratuito (*.github.io)

**Desvantagens:**
- Sem suporte a serverless functions
- Sem variáveis de ambiente secretas

## Configuração do Supabase

1. Acesse [supabase.com](https://supabase.com).
2. Crie um novo projeto ou use um existente.
3. Vá para "Settings" > "API".
4. Copie:
   - **Project URL**: Use como `SUPABASE_URL`
   - **anon public**: Use como `SUPABASE_ANON_KEY`
5. Atualize o arquivo `js/supabase-config.js` com essas credenciais.

## Domínio Personalizado

### Conectar um domínio no Netlify

1. Vá para "Site settings" > "Domain management".
2. Clique em "Add custom domain".
3. Digite seu domínio.
4. Siga as instruções para atualizar os registros DNS do seu registrador de domínio.

### Conectar um domínio no Vercel

1. Vá para "Settings" > "Domains".
2. Clique em "Add".
3. Digite seu domínio.
4. Siga as instruções para atualizar os registros DNS.

## Monitoramento e Manutenção

- **Logs**: Verifique os logs de deployment na plataforma escolhida.
- **Performance**: Use ferramentas como Google PageSpeed Insights para otimizar.
- **Segurança**: Mantenha as dependências atualizadas.
- **Backups**: Faça backup regular dos dados no Supabase.

## Troubleshooting

### Erro: "SUPABASE_URL is not defined"
- Certifique-se de que as variáveis de ambiente foram adicionadas corretamente na plataforma.
- Verifique se o arquivo `js/supabase-config.js` está configurado.

### Erro: "Cannot find module"
- Verifique se todos os arquivos foram enviados para o repositório.
- Execute `git status` para confirmar.

### Aplicação não carrega
- Verifique o console do navegador (F12) para erros.
- Verifique os logs de deployment na plataforma.
- Certifique-se de que o arquivo `index.html` está na raiz do repositório.

## Suporte

Para dúvidas ou problemas, consulte:
- [Documentação do Netlify](https://docs.netlify.com)
- [Documentação do Vercel](https://vercel.com/docs)
- [Documentação do Supabase](https://supabase.com/docs)

