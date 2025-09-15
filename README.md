# IMC Monorepo

App para gerenciar **Usuários** (Admin/Professor/Aluno) e **Avaliações de IMC**.  
Monorepo com **API (Express + TypeORM + SQLite)**, **Web (Next.js + Chakra UI)** e **tipos compartilhados**.

## Requisitos
- Node.js 20+ (recomendado 22)
- npm 9+

## Estrutura
```
imc-monorepo/
├─ apps/
│  ├─ api/      # Express, TypeORM, SQLite
│  └─ web/      # Next.js (App Router)
└─ packages/
   └─ shared/   # Tipos/Zod compartilhados
```

## Setup rápido

1) **Instalar dependências (raiz)**
```bash
npm install
```

2) **Build do pacote compartilhado**
```bash
npm run build -w @imc/shared
```

3) **Variáveis de ambiente**

Crie `apps/api/.env`:
```env
PORTA=4000
JWT_SECRETO=uma_senha_bem_secreta
DB_PATH=./apps/api/imc.sqlite
```

Crie `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

4) **Banco de dados (SQLite) – migrações + seed**
```bash
# dentro da pasta da API
cd apps/api

# aplicar migrações
npx typeorm-ts-node-commonjs -d ./src/data-source.ts migration:run

# voltar para a raiz e criar usuário admin
cd ../..
npm run semente -w api
# Admin criado: admin@admin.com / admin123
```

## Como rodar

**API** (porta 4000):
```bash
npm run dev -w api
```

**Web** (porta 3000):
```bash
npm run dev -w web
```

Abra:
- Web: http://localhost:3000
- API: http://localhost:4000/saude (healthcheck)

**Login padrão:**
- e-mail: `admin@admin.com`
- senha: `admin123`

## Permissões (resumo)

| Recurso    | ADMIN | PROFESSOR                          | ALUNO                 |
|------------|:-----:|:----------------------------------:|-----------------------|
| Usuários   | CRUD  | CRUD **apenas de ALUNO**           | —                     |
| Avaliações | CRUD  | CRUD **apenas as que criou**       | Listar **as suas**    |

## Telas principais (Web)
- `/entrar` — Login
- `/painel` — Resumo e atalhos
- `/usuarios` — (ADMIN) CRUD de usuários
- `/alunos` — (PROFESSOR) CRUD de alunos
- `/avaliacoes` — Listagem + criação (ADMIN/PROF) e **edição inline**  
  - aceita altura/peso com vírgula (ex.: `1,70`)

## Endpoints úteis (API)
- `POST /auth/entrar` → `{ token, usuario }`
- `GET /me`
- `GET/POST/PATCH/DELETE /usuarios` (ADMIN)
- `GET /usuarios/alunos`, `POST /usuarios/alunos`, `PATCH /usuarios/alunos/:id` (PROFESSOR)
- `GET /avaliacoes` (restrito por cargo)
- `POST /avaliacoes` (ADMIN/PROF)
- `PATCH /avaliacoes/:id` (ADMIN / PROF apenas as dele)


## Scripts Uteis
```bash
Instalar dependências (raiz)
    
    npm install

# build do pacote compartilhado
npm run build -w @imc/shared

# API
npm run dev -w api
npm run build -w api
npm run migracao:gerar -w api
npm run migracao:rodar -w api
npm run semente -w api

# Web
npm run dev -w web
npm run build -w web

# lint/format (ajuste conforme seu .eslintrc/.prettierrc)
npm run lint
npm run format
