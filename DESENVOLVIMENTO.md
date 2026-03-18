# 🛠️ Guia de Desenvolvimento - DevRoast

## 📖 Documentação

- **[DATABASE.md](./DATABASE.md)** - Guia do Drizzle, queries, troubleshooting
- **[specs/drizzle-implementation.md](./specs/drizzle-implementation.md)** - Especificação técnica completa
- **[README.md](./README.md)** - Overview do projeto

## 🚀 Começar

### 1️⃣ Setup Inicial (primeira vez)

```bash
# Instalar dependências
npm install

# Copiar env example
cp .env.example .env.local

# Subir banco (Docker)
docker compose up -d

# Aplicar migrations
DATABASE_URL="postgresql://devroast:devroast_local_dev@localhost:5432/devroast" npm run db:push

# Popular com dados de exemplo
DATABASE_URL="postgresql://devroast:devroast_local_dev@localhost:5432/devroast" node --import tsx src/db/seeds/leaderboard-seed.ts
```

### 2️⃣ Desenvolvimento Local

```bash
# Terminal 1: App Next.js
npm run dev
# App roda em http://localhost:3000

# Terminal 2: Drizzle Studio (opcional)
DATABASE_URL="postgresql://devroast:devroast_local_dev@localhost:5432/devroast" npm run db:studio
# UI em http://local.drizzle.studio
```

## 📊 Stack Técnico

- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- **Database**: PostgreSQL 16 + Drizzle ORM
- **AI**: Vercel AI SDK (agnóstico de provider)
- **UI Components**: Base UI + Compound Components Pattern
- **Code Highlighting**: Shiki + Highlight.js
- **Styling**: Tailwind Variants para component APIs

## 🗂️ Estrutura de Pastas

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout
│   └── [dinâmicas]/         # Rotas dinâmicas (ex: /roast/[slug])
├── components/
│   ├── ui/                  # Reusable compound components
│   │   ├── code-block.tsx
│   │   ├── score-ring.tsx
│   │   ├── diff-line.tsx
│   │   └── ...
│   └── layout/              # Layout components
│       └── navbar.tsx
├── db/
│   ├── schema/              # Drizzle schema definitions
│   │   ├── enums.ts
│   │   ├── roast-submissions.ts
│   │   ├── roast-analysis-items.ts
│   │   ├── roast-diff-blocks.ts
│   │   ├── roast-diff-lines.ts
│   │   └── index.ts
│   ├── queries/             # Database queries (sem relations)
│   │   ├── create-roast.ts
│   │   ├── get-roast-by-slug.ts
│   │   └── get-leaderboard.ts
│   ├── seeds/               # Seed scripts
│   │   └── leaderboard-seed.ts
│   └── client.ts            # Singleton Drizzle instance
├── ai/                      # (TODO) Vercel AI SDK integration
│   ├── client.ts
│   ├── generate-roast.ts
│   └── parse-roast.ts
├── lib/                     # Utilities
│   ├── languages.ts         # Language constants
│   └── useShikiHighlighter.ts
└── app/globals.css          # Tailwind + design tokens
```

## 🔄 Workflow de Features

### Exemplo: Adicionar novo enum

1. Edite `src/db/schema/enums.ts`
2. Execute `npm run db:generate`
3. Review migration em `drizzle/`
4. Execute `npm run db:push`
5. Commit (schema + migrations)

### Exemplo: Adicionar nova query

1. Crie arquivo em `src/db/queries/`
2. Use `select()`, `insert()`, `update()`, `delete()` sem relations
3. Implemente joins manualmente com `.leftJoin()` ou `.innerJoin()`
4. Export função tipada
5. Importe e use em Server Components/API Routes

### Exemplo: Criar nova página dinâmica

1. Crie arquivo em `src/app/[param]/page.tsx`
2. Use `getParams()` do Next.js 16
3. Chame query do banco (Server Component)
4. Render com UI components de `src/components/ui/`

## 📝 Padrões de Código

### Components
```typescript
// Prefer named exports + compound component pattern
export function Button({ variant, children }: ButtonProps) {
  return <button className={buttonStyles({ variant })}>{children}</button>
}
```

### Queries
```typescript
import db from '@/db/client'
import { roastSubmissions } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getRoastById(id: string) {
  const [roast] = await db
    .select()
    .from(roastSubmissions)
    .where(eq(roastSubmissions.id, id))
  return roast
}
```

### Server Components
```typescript
export default async function RoastPage({ params }: { params: { slug: string } }) {
  const roast = await getRoastBySlug(params.slug)
  
  if (!roast) return <NotFound />
  
  return <RoastDetail roast={roast} />
}
```

## 🧪 Testing

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Build
npm run build
```

## 📦 Deploy (Vercel)

1. Push para repo
2. Vercel auto-deploys em `main`
3. Configure `DATABASE_URL` em environment variables
4. Rodas migrations em post-deploy hook
5. Done!

## 🐛 Debugging

### Ver queries SQL geradas
```typescript
// Drizzle sempre mostra SQL em console
const result = await db.select().from(table) // Vê SQL no terminal
```

### Conectar ao banco local
```bash
docker exec devroast-postgres psql -U devroast -d devroast
```

### Reset banco completamente
```bash
docker compose down -v          # Remove containers + volumes
docker compose up -d            # Recreate fresh
npm run db:push
npm run db:seed
```

## 📋 Checklist antes de PR

- [ ] Build passa sem erros
- [ ] TypeScript sem warnings
- [ ] Formatado com Biome
- [ ] Schema + migrations commitados
- [ ] Queries sem relations (manual joins)
- [ ] Índices apenas se necessário
- [ ] Types exportados de schema
- [ ] DATABASE.md atualizado se relevante

## 🔗 Recursos Úteis

- [Drizzle Docs](https://orm.drizzle.team/)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/)

---

**Dúvidas?** Consulte DATABASE.md ou a especificação em specs/
