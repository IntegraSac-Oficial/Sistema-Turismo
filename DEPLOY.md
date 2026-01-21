# 📦 Guia de Deploy

## 🔧 Preparação

### 1. Inicializar Git (se ainda não foi feito)
```bash
git init
git add .
git commit -m "Initial commit - Praias Catarinenses"
```

### 2. Criar repositório no GitHub
1. Acesse https://github.com/new
2. Nome do repositório: `praias-catarinenses`
3. Descrição: `Plataforma completa de turismo para Santa Catarina`
4. Deixe como **Público** ou **Privado** (sua escolha)
5. **NÃO** marque "Initialize with README" (já temos um)
6. Clique em "Create repository"

### 3. Conectar ao GitHub
```bash
# Substitua SEU_USUARIO pelo seu usuário do GitHub
git remote add origin https://github.com/SEU_USUARIO/praias-catarinenses.git
git branch -M main
git push -u origin main
```

## 🚀 Deploy na Hostinger

### Opção 1: Upload Manual via FTP

#### Passo 1: Build do projeto
```bash
npm run build
```

#### Passo 2: Acessar FTP
1. Acesse o painel da Hostinger
2. Vá em "Arquivos" > "Gerenciador de Arquivos"
3. Ou use um cliente FTP (FileZilla, WinSCP)

#### Passo 3: Upload
1. Navegue até a pasta `public_html`
2. **IMPORTANTE**: Delete todos os arquivos antigos primeiro
3. Faça upload de **TODOS** os arquivos da pasta `dist`
4. Copie o arquivo `.htaccess` para `public_html`

### Opção 2: Deploy via Git (Recomendado)

#### Passo 1: Configurar Git na Hostinger
1. Acesse o painel da Hostinger
2. Vá em "Avançado" > "Git"
3. Clique em "Criar novo repositório"
4. Cole a URL do seu repositório GitHub
5. Branch: `main`
6. Caminho de deploy: `public_html`

#### Passo 2: Configurar Build Automático
Crie um arquivo `deploy.sh` na raiz do projeto:

```bash
#!/bin/bash
npm install
npm run build
cp -r dist/* public_html/
cp .htaccess public_html/
```

#### Passo 3: Deploy
```bash
git add .
git commit -m "Update: nova versão"
git push origin main
```

A Hostinger irá automaticamente fazer o deploy!

## 🔄 Atualizações Futuras

### Para atualizar o site:
```bash
# 1. Faça suas alterações no código
# 2. Commit das mudanças
git add .
git commit -m "Descrição das mudanças"

# 3. Push para o GitHub
git push origin main

# 4. Build e deploy
npm run build
# Faça upload da pasta dist para public_html
```

## ✅ Checklist de Deploy

- [ ] Build do projeto (`npm run build`)
- [ ] Testar o build localmente (`npm run preview`)
- [ ] Verificar se todas as rotas funcionam
- [ ] Upload dos arquivos da pasta `dist`
- [ ] Upload do arquivo `.htaccess`
- [ ] Testar o site em produção
- [ ] Verificar todas as páginas principais
- [ ] Testar em mobile

## 🐛 Troubleshooting

### Erro 404 nas rotas
- Verifique se o arquivo `.htaccess` está na pasta `public_html`
- Certifique-se que o mod_rewrite está ativado no servidor

### Imagens não carregam
- Verifique se todas as imagens foram enviadas
- Confirme os caminhos das imagens no código

### Site em branco
- Abra o console do navegador (F12)
- Verifique se há erros JavaScript
- Confirme que todos os arquivos foram enviados

## 📞 Suporte

Se precisar de ajuda:
- Documentação Hostinger: https://support.hostinger.com
- Suporte Hostinger: Via chat no painel
