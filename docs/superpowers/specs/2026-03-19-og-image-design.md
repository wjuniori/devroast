# OG Image para Roast Results

**Data:** 2026-03-19  
**Status:** Aprovado (v2)

## Resumo

Gerar automaticamente uma imagem OpenGraph (1200x630) para cada resultado de roast, usada quando links são compartilhados em redes sociais.

## Decisões de Design

| Decisão | Valor |
|---------|-------|
| Timing | Sob demanda (runtime) |
| Fonte dos dados | SSR direto (busca no DB) |
| Cache | Sem cache (on-the-fly) |
| Rota | `/roast/[id]/opengraph-image` (rota nativa Next.js) |
| Fallback | URL padrão estática |
| Template | Opção A: Template local |

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  User Shared Link: /roast/[id]                              │
│                          ↓                                   │
│  <head>                                                     │
│    <meta property="og:image" content="/roast/[id]/opengraph-image">
│  </head>                                                    │
│                          ↓                                   │
│  /roast/[id]/opengraph-image/route.tsx                      │
│    ├── Valida ID do roast                                   │
│    ├── Busca dados no DB                                    │
│    ├── Renderiza componente React (Satori)                  │
│    └── Retorna PNG 1200x630                                 │
└─────────────────────────────────────────────────────────────┘
```

## Estrutura de Arquivos

```
src/
├── app/
│   └── roast/[id]/
│       ├── page.tsx                  # Página (atualizar metadata)
│       └── opengraph-image/
│           └── route.tsx             # Rota OG image
└── components/
    └── og/
        └── RoastOGImage.tsx          # Componente template
```

## Cores (hex para Satori)

Satori não suporta CSS variables - usar valores hex diretos:

```ts
const COLORS = {
  bgPage: '#09090b',
  accentAmber: '#f59e0b',
  accentRed: '#ef4444',
  accentGreen: '#22c55e',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
  borderPrimary: '#27272a',
};
```

## Componente Template

Segue o design existente em `devroast.pen` (frame "Screen 4 - OG Image"):

- **Background:** `#09090b`
- **Logo:** ">" em verde (#22c55e) + "devroast" em branco
- **Score:** Número grande em âmbar (#f59e0b)
  - Score: 160px, bold
  - Denom: 56px, `#71717a`
- **Verdict Badge:** Dot vermelho (#ef4444) + texto vermelho
- **Info:** "lang: {language} · {lineCount} lines" (JetBrains Mono)
- **Quote:** Headline entre aspas, centrado

### Dimensões
- Imagem final: 1200x630
- Padding interno: 64px
- Gap entre elementos: 28px

### Tipografia
Fontes devem ser carregadas via fetch e passadas ao ImageResponse:
```tsx
const fontData = await fetch(
  new URL('https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf')
).then(res => res.arrayBuffer());
```

## Rota (route.tsx)

```tsx
import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import db from '@/db/client';
import { roastSubmissions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import RoastOGImage from '@/components/og/RoastOGImage';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export const runtime = 'edge';

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const roast = await db.query.roastSubmissions.findFirst({
    where: eq(roastSubmissions.id, id)
  });

  if (!roast || roast.status !== 'completed') {
    return new Response('Not found', { status: 404 });
  }

  const fontData = await fetch(
    new URL('https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf')
  ).then(res => res.arrayBuffer());

  return new ImageResponse(
    <RoastOGImage 
      score={Number(roast.score) || 0}
      verdict={roast.verdict || 'analyzed'}
      headline={roast.headline || 'Code roasted to perfection'}
      language={roast.language || 'unknown'}
      lineCount={roast.sourceLineCount || 0}
    />,
    {
      ...size,
      fonts: [{ name: 'JetBrains Mono', data: fontData, weight: 400 }],
    }
  );
}
```

**Nota:** Apenas gera OG image para roasts com `status === 'completed'`.

## Metadata na Página

```tsx
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return {
    openGraph: {
      images: [`/roast/${id}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/roast/${id}/opengraph-image`],
    },
  };
}
```

## Fallback

Se a geração falhar, usar uma imagem estática padrão:
- Rota: `/images/og-fallback.png`
- Imagem genérica com logo devroast (sem dados dinâmicos)
- Implementar via try/catch na rota ou via CDN rewrite

## Cache Headers

Adicionar na rota para cache em CDNs:
```tsx
export const dynamic = 'force-dynamic';
// Headers adicionados pelo Next.js automaticamente para ImageResponse
```

## Edge Cases

1. **Roast não existe:** Retorna 404
2. **Roast incompleto (queued/processing):** Retorna 404 ou fallback
3. **headline null:** Usar texto padrão
4. **score null:** Usar 0

## Notas de Implementação

1. Usar `ImageResponse` do `next/og` para renderização via Satori
2. **Não usar Tailwind** - Satori só suporta estilos inline
3. Usar `runtime = 'edge'` para performance
4. Carregar fonte externamente (Google Fonts)
5. Tratar erros graciosamente
