# 📦 Guia de Deploy - Praias Catarinenses

## ✅ Status Atual
- ✅ Git inicializado
- ✅ Commit inicial realizado
- ⏳ Aguardando push para GitHub
- ⏳ Aguardando deploy na Hostinger

## 🚀 Próximos Passos

### 1. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. **Nome do repositório**: `praias-catarinenses` (ou o nome que preferir)
3. **Descrição**: `Plataforma completa de turismo para Santa Catarina - Guia de praias, cidades, imóveis e eventos`
4. **Visibilidade**: Escolha Público ou Privado
5. **NÃO** marque "Initialize with README" (já temos)
6. Clique em **"Create repository"**

### 2. Conectar e Enviar para o GitHub

Após criar o repositório, execute os comandos abaixo (substitua `SEU_USUARIO` pelo seu usuário do GitHub):

```bash
# Adicionar o repositório remoto
git remote add origin https://github.com/SEU_USUARIO/praias-catarinenses.git

# Renomear branch para main (se necessário)
git branch -M main

# Enviar código para o GitHub
git push -u origin main
```

**Exemplo completo:**
```bash
git remote add origin https://github.com/joaosilva/praias-catarinenses.git
git branch -M main
git push -u origin main
```

### 3. Build do Projeto para Produção

Antes de fazer o deploy, gere os arquivos otimizados:

```bash
npm run build
```

Isso criará uma pasta `dist` com todos os arquivos prontos para produção.

### 4. Testar o Build Localmente (Opcional)

```bash
npm run preview
```

Acesse http://localhost:4173 para testar o build antes de enviar para produção.

---

## 🌐 Deploy na Hostinger

### Opção 1: Upload Manual via FTP (Mais Simples)

#### Passo 1: Acessar o Painel da Hostinger
1. Faça login em https://hpanel.hostinger.com
2. Selecione seu domínio/hospedagem
3. Vá em **"Arquivos"** > **"Gerenciador de Arquivos"**

#### Passo 2: Limpar a Pasta public_html
1. Entre na pasta `public_html`
2. **IMPORTANTE**: Delete TODOS os arquivos antigos (index.html, etc.)
3. Mantenha apenas `.htaccess` se já existir

#### Passo 3: Upload dos Arquivos
1. Abra a pasta `dist` do seu projeto local
2. Selecione **TODOS** os arquivos dentro de `dist`
3. Faça upload para `public_html`
4. Aguarde o upload completar (pode demorar alguns minutos)

#### Passo 4: Configurar .htaccess
Crie ou edite o arquivo `.htaccess` em `public_html` com este conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache para melhor performance
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Compressão GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript
</IfModule>
```

#### Passo 5: Testar o Site
1. Acesse seu domínio (ex: https://seudominio.com)
2. Teste todas as páginas principais
3. Verifique se as rotas funcionam (ex: /cidades, /praias, /eventos)

---

### Opção 2: Deploy via Git (Avançado)

#### Passo 1: Configurar Git na Hostinger
1. No painel da Hostinger, vá em **"Avançado"** > **"Git"**
2. Clique em **"Criar novo repositório"**
3. Cole a URL do seu repositório GitHub
4. Branch: `main`
5. Caminho de deploy: `public_html`

#### Passo 2: Configurar Deploy Automático
A Hostinger pode fazer deploy automático quando você fizer push para o GitHub.

**Nota**: Você precisará fazer o build localmente e commitar a pasta `dist`, ou configurar um script de build no servidor.

---

## 🔄 Atualizações Futuras

### Para atualizar o site após mudanças:

```bash
# 1. Faça suas alterações no código
# 2. Teste localmente
npm run dev

# 3. Commit das mudanças
git add .
git commit -m "Descrição das mudanças"

# 4. Push para o GitHub
git push origin main

# 5. Build para produção
npm run build

# 6. Upload da pasta dist para public_html (via FTP ou Git)
```

---

## ✅ Checklist de Deploy

Antes de considerar o deploy completo, verifique:

- [ ] Build do projeto executado (`npm run build`)
- [ ] Pasta `dist` gerada com sucesso
- [ ] Testado localmente com `npm run preview`
- [ ] Todas as rotas funcionam corretamente
- [ ] Código enviado para o GitHub
- [ ] Arquivos da pasta `dist` enviados para `public_html`
- [ ] Arquivo `.htaccess` configurado corretamente
- [ ] Site acessível pelo domínio
- [ ] Testadas as páginas principais:
  - [ ] Home (/)
  - [ ] Cidades (/cidades)
  - [ ] Praias (/praias)
  - [ ] Eventos (/eventos)
  - [ ] Comunidade (/comunidade)
  - [ ] Planos (/clube)
- [ ] Testado em dispositivos móveis
- [ ] Imagens carregando corretamente
- [ ] Animações funcionando suavemente

---

## 🐛 Troubleshooting

### Erro 404 nas rotas
**Problema**: Ao acessar /cidades ou outras rotas, aparece erro 404.

**Solução**:
1. Verifique se o arquivo `.htaccess` está em `public_html`
2. Confirme que o conteúdo do `.htaccess` está correto
3. Verifique se o mod_rewrite está ativado no servidor (geralmente já vem ativado na Hostinger)

### Imagens não carregam
**Problema**: Imagens aparecem quebradas ou não carregam.

**Solução**:
1. Verifique se todas as imagens foram enviadas
2. Confirme os caminhos das imagens no código
3. Verifique permissões das pastas (755 para pastas, 644 para arquivos)

### Site em branco
**Problema**: Página carrega mas fica em branco.

**Solução**:
1. Abra o console do navegador (F12)
2. Verifique se há erros JavaScript
3. Confirme que todos os arquivos foram enviados
4. Verifique se o arquivo `index.html` está na raiz de `public_html`

### Animações não funcionam
**Problema**: Animações não aparecem ou ficam travadas.

**Solução**:
1. Limpe o cache do navegador (Ctrl + Shift + Delete)
2. Verifique se os arquivos CSS e JS foram carregados
3. Teste em modo anônimo do navegador

### Erro ao fazer push para GitHub
**Problema**: `git push` pede autenticação ou falha.

**Solução**:
1. Configure suas credenciais do GitHub:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```
2. Use um Personal Access Token ao invés de senha
3. Ou configure SSH keys para autenticação

---

## 📞 Suporte

### Hostinger
- Documentação: https://support.hostinger.com
- Suporte via chat: Disponível no painel hPanel
- Email: support@hostinger.com

### GitHub
- Documentação: https://docs.github.com
- Suporte: https://support.github.com

---

## 🎉 Parabéns!

Após seguir todos os passos, seu site estará no ar! 🚀

Compartilhe o link e mostre para o mundo as maravilhas de Santa Catarina! 🏖️
