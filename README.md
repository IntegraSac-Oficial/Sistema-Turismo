# Praias Catarinenses - Guia Completo de Santa Catarina

Plataforma completa de turismo para Santa Catarina, com informações sobre praias, cidades, imóveis, comércios, prestadores de serviço e eventos.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool rápido e moderno
- **React Router DOM v7** - Roteamento
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Framer Motion** - Animações
- **Lucide React** - Ícones
- **React Hook Form + Zod** - Formulários e validação

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🌐 Deploy na Hostinger

### 1. Build do projeto
```bash
npm run build
```

### 2. Upload para Hostinger
- Acesse o painel da Hostinger
- Vá em "Gerenciador de Arquivos"
- Navegue até `public_html`
- Faça upload de todos os arquivos da pasta `dist`

### 3. Configuração do .htaccess
Crie um arquivo `.htaccess` na pasta `public_html` com o seguinte conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 📱 Funcionalidades

### Páginas Públicas
- ✅ Exploração de cidades
- ✅ Listagem de praias
- ✅ Catálogo de imóveis
- ✅ Diretório de comércios
- ✅ Prestadores de serviço
- ✅ Calendário de eventos
- ✅ Comunidade e guias locais

### Sistemas
- ✅ Sistema de gamificação (pontos e conquistas)
- ✅ Clube de benefícios
- ✅ Planos de assinatura
- ✅ Sistema de pagamentos (Stripe + PIX)
- ✅ Dashboard para negócios
- ✅ Dashboard para corretores
- ✅ Dashboard para influenciadores
- ✅ Painel administrativo completo

## 🎨 Modo Mock

O projeto está configurado em modo mock para visualização sem necessidade de API. Para conectar à API real:

1. Abra `src/api/entities.js`
2. Altere `const USE_MOCK = true` para `const USE_MOCK = false`
3. Configure o `appId` correto em `src/api/base44Client.js`

## 📄 Licença

© 2012/2025 Praias Catarinenses. Todos os direitos reservados.

## 📞 Contato

- Email: contato@praiascatarinenses.com
- Telefone: (47) 99131-5105
