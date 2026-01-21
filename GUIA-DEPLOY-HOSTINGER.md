# 🚀 GUIA RÁPIDO - Deploy na Hostinger

## ⚠️ IMPORTANTE: Você enviou os arquivos ERRADOS!

### ❌ O que NÃO enviar:
- ❌ Pasta `src/`
- ❌ Pasta `node_modules/`
- ❌ Pasta `BD-GUIA PRAIAS/`
- ❌ Arquivos de configuração (package.json, vite.config.js, etc.)

### ✅ O que DEVE enviar:
- ✅ Arquivo `index.html` (da pasta dist)
- ✅ Pasta `assets/` (da pasta dist)
- ✅ Arquivo `.htaccess` (da raiz do projeto)

---

## 📋 PASSO A PASSO (SIGA EXATAMENTE):

### 1️⃣ LIMPAR O PUBLIC_HTML

1. Acesse: https://hpanel.hostinger.com
2. Vá em "Gerenciador de Arquivos"
3. Entre na pasta `public_html`
4. **SELECIONE TUDO** (Ctrl + A)
5. **DELETE TUDO** (botão Excluir)
6. Confirme a exclusão

### 2️⃣ LOCALIZAR OS ARQUIVOS CORRETOS

No seu computador:
1. Abra o Windows Explorer
2. Navegue até: `C:\projetos-dev\projeto-praia\dist`
3. Você verá:
   ```
   dist/
   ├── index.html          ← Este arquivo
   └── assets/             ← Esta pasta
       ├── index-Ddfq4Sk-.js
       └── index-DVW9-FGJ.css
   ```

### 3️⃣ ENVIAR OS ARQUIVOS

**OPÇÃO A - Via Gerenciador de Arquivos (Mais Fácil):**

1. No Gerenciador de Arquivos da Hostinger
2. Certifique-se que está em `public_html`
3. Clique em "Upload"
4. Selecione:
   - `index.html` (de dentro da pasta dist)
   - Pasta `assets` (de dentro da pasta dist)
5. Aguarde o upload completar

**OPÇÃO B - Arrastar e Soltar:**

1. Abra duas janelas lado a lado:
   - Esquerda: Pasta `dist` no seu computador
   - Direita: `public_html` na Hostinger
2. Arraste `index.html` e pasta `assets` para a Hostinger

### 4️⃣ ADICIONAR O .HTACCESS

1. Na Hostinger, em `public_html`
2. Clique em "Novo Arquivo"
3. Nome: `.htaccess` (com o ponto no início!)
4. Copie o conteúdo do arquivo `.htaccess` do projeto
5. Cole e salve

---

## ✅ ESTRUTURA FINAL NO PUBLIC_HTML:

```
public_html/
├── .htaccess
├── index.html
└── assets/
    ├── index-Ddfq4Sk-.js
    └── index-DVW9-FGJ.css
```

**APENAS ISSO! NADA MAIS!**

---

## 🧪 TESTAR O SITE

1. Limpe o cache do navegador (Ctrl + Shift + Delete)
2. Acesse seu domínio
3. O site deve carregar com todos os estilos e animações

---

## 🐛 Se ainda não funcionar:

1. Abra o Console do navegador (F12)
2. Vá na aba "Console"
3. Tire um print dos erros
4. Me mostre os erros

---

## 📞 DÚVIDAS?

Se tiver qualquer problema, me avise e eu te ajudo!
