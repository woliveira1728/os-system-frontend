# OS System Frontend

Aplicação web do **OS System** — um sistema completo de gerenciamento de ordens de serviço com autenticação, checklist, fotos e rastreamento de status.

Desenvolvido com **Next.js 14**, **React** e **Material-UI** para oferecer uma interface moderna, responsiva e intuitiva.

## Arquitetura do Sistema

O OS System é composto por três repositórios principais:

- **[Backend API](https://github.com/woliveira1728/os-system-backend)** — Servidor Fastify com Prisma ORM, autenticação JWT, e endpoints para gerenciamento de ordens, checklist e fotos
- **Frontend Web** (este repositório) — Aplicação Next.js 14 com interface responsiva para criação, edição, exclusão e acompanhamento de ordens de serviço
- **[Infraestrutura](https://github.com/woliveira1728/os-system)** — Orquestração com Docker Compose, variáveis de ambiente e scripts de inicialização

## Tecnologias

- **Framework**: Next.js 14.0.4 (App Router)
- **Linguagem**: TypeScript 5.3.3
- **UI Library**: React 18.2.0
- **Componentes**: Material-UI (MUI) 6.1.0
- **Gerenciamento de Estado**: Context API
- **Validação**: Zod 3.x + React Hook Form
- **HTTP Client**: Axios
- **Notificações**: React Hot Toast
- **Container**: Docker

## Pré-requisitos

- Node.js >= 20
- npm ou yarn
- Docker (opcional)

## Instalação e Setup

Para instruções detalhadas sobre instalação, configuração e como rodar a aplicação localmente, consulte o repositório de [Infraestrutura](https://github.com/woliveira1728/os-system).

Resumidamente, o repositório de infraestrutura fornece:
- Orquestração com Docker Compose
- Script `init.sh` para clonar todos os repositórios
- Variáveis de ambiente pré-configuradas
- Comandos para subir a stack completa com um único comando


A aplicação estará disponível em `http://localhost:3000`


## Estrutura de Pastas

```
src/
├── app/                   # App Router (Next.js 14)
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Página inicial (login)
│   ├── globals.css        # Estilos globais
│   ├── register/          # Página de registro
│   │   └── page.tsx
│   ├── dashboard/         # Dashboard principal
│   │   └── page.tsx
│   └── orders/            # Gerenciamento de ordens
│       ├── page.tsx       # Lista de ordens
│       └── [id]/
│           └── page.tsx   # Detalhes da ordem
│
├── components/            # Componentes React reutilizáveis
│   └── Navbar.tsx
├── contexts/              # Context API
│   ├── AuthContext.tsx    # Autenticação e usuário
│   └── OrdersContext.tsx  # Estado global de ordens
├── providers/             # Providers globais
│   ├── AppProvider.tsx
│   ├── QueryProvider.tsx
│   └── ThemeProvider.tsx
├── schemas/               # Schemas Zod para validação
│   ├── auth.schema.ts
│   ├── order.schema.ts
│   └── checklist.schema.ts
├── services/              # Configuração de API
│   └── api.ts
├── types/                 # TypeScript types
│   └── interfaces.ts
└── utils/                 # Funções auxiliares
```

## Funcionalidades

### Autenticação
- ✅ Login com email e senha
- ✅ Registro de novos usuários
- ✅ Autenticação JWT com refresh token
- ✅ Interceptor automático para renovação de token
- ✅ Redirecionamento para login em caso de expiração

### Ordens de Serviço
- ✅ Listar todas as ordens
- ✅ Criar nova ordem com título, descrição e prioridade
- ✅ Visualizar detalhes da ordem
- ✅ Editar título e descrição
- ✅ Deletar ordem com confirmação
- ✅ Filtros e busca (em desenvolvimento)

### Checklist
- ✅ Adicionar itens ao checklist da ordem
- ✅ Marcar/desmarcar itens como concluídos
- ✅ Deletar itens do checklist
- ✅ Ordenação estável (por ordem e data de criação)

### Fotos
- ✅ Upload de fotos da galeria
- ✅ Captura de foto pela câmera (mobile)
- ✅ Preview de fotos em modal
- ✅ Deletar fotos anexadas
- ✅ Suporte para câmera traseira em dispositivos móveis

### Interface
- ✅ Design responsivo (mobile-first)
- ✅ Tema claro/escuro (Material-UI)
- ✅ Notificações toast para feedback
- ✅ Loading states e error handling
- ✅ Navegação intuitiva com navbar

## Fluxo de Autenticação

1. Usuário faz login na página inicial (`/`)
2. Token JWT é armazenado em localStorage
3. AuthContext gerencia estado do usuário
4. Interceptor Axios adiciona token automaticamente
5. Em caso de 401, token é renovado ou redireciona para login
6. Rotas protegidas verificam autenticação

## Contextos

### AuthContext
Gerencia autenticação e informações do usuário:
```typescript
interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}
```

### OrdersContext
Gerencia ordens, checklist e operações CRUD:
```typescript
interface OrdersContextData {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  getOrder: (id: string) => Promise<Order>;
  createOrder: (data: CreateOrderData) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  fetchChecklist: (orderId: string) => Promise<ChecklistItem[]>;
  addChecklistItem: (orderId: string, title: string) => Promise<void>;
  toggleChecklistItem: (id: string) => Promise<void>;
  deleteChecklistItem: (id: string) => Promise<void>;
}
```
## Rotas

| Rota | Descrição | Protegida |
|------|-----------|-----------|
| `/` | Login | Não |
| `/register` | Registro de usuário | Não |
| `/dashboard` | Dashboard principal | Sim |
| `/orders` | Lista de ordens | Sim |
| `/orders/[id]` | Detalhes da ordem | Sim |
| `/checklist` | Templates de checklist | Sim |

## Desenvolvimento

### Adicionar nova página

1. Crie o arquivo em `src/app/[nome]/page.tsx`
2. Use o layout global ou crie um layout específico
3. Adicione proteção de rota se necessário (verificar `user` no AuthContext)

### Adicionar novo componente

1. Crie o componente em `src/components/[Nome].tsx`
2. Use TypeScript para props tipadas
3. Utilize componentes MUI quando possível

### Adicionar nova validação

1. Crie o schema em `src/schemas/[nome].schema.ts`
2. Use Zod para definir regras de validação
3. Exporte tipos TypeScript do schema

## Relacionado

- [Backend API](https://github.com/woliveira1728/os-system-backend)
- [Infraestrutura](https://github.com/woliveira1728/os-system)

## Licença

MIT
