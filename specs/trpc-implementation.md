# tRPC Implementation Spec

## Context

O DevRoast precisa de uma camada de API typesafe entre o front-end Next.js e o back-end (Drizzle + Vercel AI SDK). A spec de Drizzle já define tabelas e queries; tRPC será a cola que conecta essas operações ao front-end de forma type-safe, sem necessidade de REST/OpenAPI.

O projeto usa **Next.js App Router** (não Pages Router), então a integração deve seguir o padrão de **React Server Components** com `createHydrationHelpers` do `@trpc/react-query/rsc`.

## Goal

Integrar tRPC v11 como camada de API do projeto, seguindo:

- Arquitetura server/client split
- Server Components para prefetch e render-as-you-fetch
- Server Actions via tRPC procedures para mutations
- Zero código generated; tipagem inference-only
- Pronto para receber as queries do Drizzle definidas na spec `drizzle-implementation.md`

## Architecture Overview

```
src/trpc/
├── server/
│   ├── index.ts          # initTRPC, context, routers export
│   ├── trpc.ts          # t, publicProcedure, protectedProcedure
│   ├── context.ts       # createTRPCContext (cookies, headers)
│   └── routers/
│       ├── _app.ts      # root router aggregating all routers
│       ├── roast.ts     # roast submissions, leaderboard
│       └── ai.ts        # roast generation triggers
├── client.ts             # createTRPCReact client (for client components)
└── query-client.ts       # makeQueryClient factory
```

```
src/app/api/trpc/[trpc]/
└── route.ts             # tRPC HTTP handler for App Router
```

## Decisions

### 1. App Router com Server Components

**Decision:** Usar `@trpc/react-query/rsc` com `createHydrationHelpers`.

```typescript
// src/trpc/query-client.ts
import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serialize: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
        deserialize: superjson.deserialize,
      },
    },
  });
}
```

```typescript
// src/trpc/server.ts
import 'server-only';
import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cache } from 'react';
import { appRouter } from './routers/_app';
import { createTRPCContext } from './context';
import { makeQueryClient } from '../query-client';

export const getQueryClient = cache(makeQueryClient);
const caller = createCallerFactory(appRouter)(createTRPCContext);

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient,
);
```

**Rationale:** Permite prefetch em Server Components com `dehydrate` + `HydrationBoundary`, evitando waterfalls e loading states desnecessários.

### 2. Transformer

**Decision:** Usar `superjson` para serialização.

**Rationale:** O projeto já tem Drizzle com timestamps e tipos complexos (dates, UUIDs). Superjson preserva tipos nativos através do boundary sem config extra.

### 3. HTTP Handler

**Decision:** API route handler via `@trpc/server/adapters/fetch`.

```typescript
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '~/trpc/server/routers/_app';
import { createTRPCContext } from '~/trpc/server/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

**Rationale:** Nativo do App Router, não precisa de Pages Router ou edge runtime especial.

### 4. Context

**Decision:** Criar context com headers/cookies do request para SSR.

```typescript
// src/trpc/server/context.ts
import { headers } from 'next/headers';

export async function createTRPCContext() {
  const heads = new Headers(await headers());
  return {
    headers: heads,
  };
}
```

**Rationale:** Necessário para forwarding de cookies em SSR e futuras procedures autenticadas.

### 5. Procedure Base

**Decision:** Exportar `publicProcedure` e estrutura para `protectedProcedure` futuro.

```typescript
// src/trpc/server/trpc.ts
import { initTRPC } from '@trpc/server';
import { createTRPCContext } from './context';

const t = initTRPC.context<typeof createTRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
```

## Proposed Spec

### Provider Setup

O `TRPCProvider` com `QueryClientProvider` deve envolver o app uma única vez em `src/app/layout.tsx`.

```typescript
// src/components/providers/trpc-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from '~/trpc/client';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

### Initial Routers

#### `roast.ts` - Queries de leitura

```typescript
// src/trpc/server/routers/roast.ts
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '~/db/client';
import { roastSubmissions } from '~/db/schema';
import { desc, eq, and } from 'drizzle-orm';

export const roastRouter = router({
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return db.query.roastSubmissions.findFirst({
        where: and(
          eq(roastSubmissions.shareSlug, input.slug),
          eq(roastSubmissions.status, 'completed'),
        ),
        with: {
          analysisItems: true,
          diffBlocks: {
            with: { diffLines: true },
          },
        },
      });
    }),

  leaderboard: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ input }) => {
      return db.query.roastSubmissions.findMany({
        where: and(
          eq(roastSubmissions.visibility, 'public'),
          eq(roastSubmissions.status, 'completed'),
        ),
        orderBy: [roastSubmissions.score],
        limit: input.limit,
      });
    }),
});
```

#### `ai.ts` - Mutations para gerar roasts

```typescript
// src/trpc/server/routers/ai.ts
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { generateRoast } from '~/ai/generate-roast';
import { createRoast } from '~/db/queries/create-roast';

export const aiRouter = router({
  generate: publicProcedure
    .input(z.object({
      sourceCode: z.string(),
      language: z.enum(['javascript', 'typescript', 'sql', 'python', 'java', 'go', 'rust', 'cpp', 'csharp', 'php', 'ruby', 'other']),
      mode: z.enum(['roast', 'honest']),
    }))
    .mutation(async ({ input }) => {
      const result = await generateRoast(input);
      const submission = await createRoast({
        ...input,
        aiResult: result,
      });
      return submission;
    }),
});
```

### Client Component Example

```typescript
// src/app/roast/[slug]/page.tsx
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient, trpc } from '~/trpc/server';
import { RoastResult } from './roast-result';

export default async function RoastPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  
  await queryClient.prefetchQuery(
    trpc.roast.bySlug.queryOptions({ slug }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoastResult />
    </HydrationBoundary>
  );
}
```

```typescript
// src/app/roast/[slug]/roast-result.tsx (client component)
'use client';
import { trpc } from '~/trpc/client';
import { useParams } from 'next/navigation';

export function RoastResult() {
  const { slug } = useParams<{ slug: string }>();
  const { data: roast, isLoading } = trpc.roast.bySlug.useQuery({ slug });

  if (isLoading) return <div>Loading...</div>;
  if (!roast) return <div>Roast not found</div>;

  return <div>{roast.headline}</div>;
}
```

## Dependencies

```bash
npm install @trpc/server@next @trpc/client@next @trpc/react-query@next @tanstack/react-query superjson zod
```

## Out of Scope

- Autenticação/users (futuro)
- WebSockets/subscriptions
- Rate limiting
- Caching layer (Cloudflare/Vercel)

## Implementation Order

1. Instalar dependências
2. Criar `src/trpc/server/context.ts`, `trpc.ts`
3. Criar `src/trpc/query-client.ts`
4. Criar `src/trpc/server/routers/_app.ts` com router vazio
5. Criar API route handler em `src/app/api/trpc/[trpc]/route.ts`
6. Criar `src/trpc/client.ts`
7. Criar `TRPCProvider` em `src/components/providers/trpc-provider.tsx`
8. Integrar provider no `layout.tsx`
9. Criar primeiro router `roast.ts`
10. Testar com query simples

## References

- https://trpc.io/docs/client/tanstack-react-query/setup
- https://trpc.io/docs/client/tanstack-react-query/server-components
