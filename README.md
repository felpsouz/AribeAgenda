This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 🏍️ Aribé Motos - API de Agendamentos

Sistema de gerenciamento de agendamentos para retirada de motocicletas, desenvolvido com Node.js, TypeScript, Fastify e Firebase.

## 📋 Funcionalidades

- ✅ Criar agendamentos para retirada de motocicletas
- ✅ Consultar horários disponíveis
- ✅ Gerenciar status dos agendamentos (pendente/entregue)
- ✅ Validações de negócio (horários de funcionamento, antecedência mínima)
- ✅ Sistema de estatísticas
- ✅ API RESTful com validações robustas
- ✅ Rate limiting e segurança
- ✅ Logs estruturados

## 🕐 Regras de Horários

### Funcionamento
- **Segunda a Sexta**: 8h às 13h e 15h às 17h
- **Sábado**: 8h às 11h
- **Domingo**: Fechado

### Agendamentos
- ⏰ Antecedência mínima: 6 horas
- 🗓️ Apenas dias úteis (Segunda a Sábado)
- ⌛ Intervalos de 30 minutos

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- NPM ou Yarn
- Conta no Firebase com Firestore ativado

### 1. Instalação
```bash
# Clone o repositório
git clone [seu-repositorio]
cd aribe-motos-backend

# Instale as dependências
npm install
```

### 2. Configuração do Firebase

#### Opção 1: Arquivo JSON (Desenvolvimento)
1. Crie uma conta no [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative o Firestore Database
4. Vá em "Configurações do Projeto" > "Contas de Serviço"
5. Clique em "Gerar nova chave privada"
6. Salve o arquivo JSON como `config/firebase-service-account.json`

#### Opção 2: Variável de Ambiente (Produção)
1. Copie o conteúdo do arquivo JSON
2. Defina na variável `FIREBASE_SERVICE_ACCOUNT_KEY`

### 3. Configuração das Variáveis
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite as variáveis necessárias
nano .env
```

### 4. Executar o Projeto

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Executar versão compilada
npm start

# Executar testes
npm test

# Lint do código
npm run lint
```

## 📡 Endpoints da API

### Base URL
```
http://localhost:3333/api/v1
```

### Agendamentos

#### POST /agendamentos
Criar novo agendamento
```json
{
  "nome": "João",
  "sobrenome": "Silva",
  "telefone": "(82) 99999-9999",
  "modeloMoto": "Honda CG 160",
  "cor": "Vermelha",
  "chassi": "ABC123DEF456",
  "numeroPedido": "PED001",
  "dataRetirada": "2024-12-20",
  "horarioRetirada": "10:30"
}
```

#### GET /agendamentos
Listar agendamentos (com filtros opcionais)
```
?data=2024-12-20&status=pendente&limite=10
```

#### GET /agendamentos/:id
Obter agendamento específico

#### PATCH /agendamentos/:id/status
Atualizar status do agendamento
```json
{
  "status": "entregue"
}
```

#### DELETE /agendamentos/:id
Excluir agendamento

### Horários

#### GET /horarios/:data
Consultar horários disponíveis para uma data
```
GET /horarios/2024-12-20
```

### Estatísticas

#### GET /agendamentos/estatisticas
Obter estatísticas gerais

### Health Check

#### GET /health
Status geral da API

#### GET /agendamentos/health
Status específico do serviço de agendamentos

## 🏗️ Estrutura do Projeto

```
src/
├── config/
│   └── firebase.ts           # Configuração do Firebase
├── routes/
│   └── agendamentos.ts       # Rotas dos agendamentos
├── schemas/
│   └── agendamento.ts        # Schemas de validação (Zod)
├── services/
│   └── agendamentoService.ts # Lógica de negócio
├── types/
│   └── index.ts              # Tipos TypeScript
├── utils/
│   └── horarios.ts           # Utilitários para horários
└── server.ts                 # Servidor principal
```

## 🛡️ Validações Implementadas

### Dados do Cliente
- Nome e sobrenome: apenas letras e espaços
- Telefone: formato brasileiro (XX) XXXXX-XXXX
- Campos obrigatórios com tamanhos mínimos/máximos

### Dados da Moto
- Chassi: apenas letras maiúsculas e números
- Modelo e cor: validação de formato

### Regras de Negócio
- ✅ Chassi único por agendamento pendente
- ✅ Número de pedido único por agendamento pendente
- ✅ Validação de horários de funcionamento
- ✅ Antecedência mínima de 6 horas
- ✅ Apenas dias úteis

## 🔒 Segurança

- CORS configurado para domínios específicos
- Rate limiting (100 requests/minuto em produção)
- Helmet para headers de segurança
- Validação rigorosa de entrada
- Logs estruturados para auditoria

## 🚀 Deploy

### Variáveis de Produção
```bash
NODE_ENV=production
PORT=3333
FIREBASE_SERVICE_ACCOUNT_KEY="{...}"
FIREBASE_DATABASE_URL="https://..."
ALLOWED_ORIGINS="https://yourdomain.com"
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3333
CMD ["npm", "start"]
```

## 📞 Suporte

Para dúvidas ou suporte:
- Email: felipesouza@aribemotos.com.br
- Telefone: (79) 99935-9576

## 📄 Licença

Este projeto está sob licença ISC - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido para Aribé Motos**
