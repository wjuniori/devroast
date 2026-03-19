# tRPC Patterns

## Architecture

- **Location**: `src/trpc/` with server/client split
- **Server files**: `src/trpc/server/` - context, procedures, routers
- **Client files**: `src/trpc/client.ts`, `src/trpc/server.ts`
- **API route**: `src/app/api/trpc/[trpc]/route.ts` using `fetchRequestHandler`

## Server Components Integration

Use `createHydrationHelpers` from `@trpc/react-query/rsc` for RSC support:

```typescript
// src/trpc/server.ts
import "server-only";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { appRouter } from "./server/routers/_app";
import { createTRPCContext, createCallerFactory } from "./server/trpc";
import { makeQueryClient } from "./query-client";

export const getQueryClient = cache(makeQueryClient);
const caller = createCallerFactory(appRouter)(createTRPCContext);

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient
);
```

## Prefetching in Server Components

Use `trpc.<router>.<procedure>.prefetch()` for server-side prefetching:

```typescript
// In a Server Component (page.tsx)
import { trpc } from "@/trpc/server";

export default async function Page() {
  await trpc.metrics.getMetrics.prefetch();
  return <HydrateClient><ClientComponent /></HydrateClient>;
}
```

## Client Components

Use `useQuery` hook from the tRPC client:

```typescript
// src/components/metrics/metrics-display.tsx
"use client";

import { trpc } from "@/trpc/client";

export function MetricsDisplay() {
  const { data } = trpc.metrics.getMetrics.useQuery(undefined, {
    staleTime: 60 * 1000,
  });

  return <div>{data?.totalRoasts ?? 0}</div>;
}
```

## Provider Setup

Wrap the app once in `src/app/layout.tsx`:

```typescript
// src/components/providers/trpc-provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { trpc } from "@/trpc/client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

## Transformer

Use `superjson` for serialization to preserve native types (dates, UUIDs):

```typescript
// src/trpc/server/trpc.ts
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});
```

## Router Structure

```typescript
// src/trpc/server/routers/_app.ts
import { router } from "../trpc";
import { metricsRouter } from "./metrics";

export const appRouter = router({
  metrics: metricsRouter,
});

export type AppRouter = typeof appRouter;
```

## Rules

- Always use named exports for routers and procedures
- Use `publicProcedure` for public endpoints
- Create context in `context.ts` with headers for SSR support
- Import types via `AppRouter` for client components
- Keep query keys consistent with router/procedure names
