# OG Image para Roast Results

**Data:** 2026-03-19  
**Status:** Aprovado

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
│       └── opengraph-image/
│           └── route.tsx          # Rota OG image
└── components/
    └── og/
        └── RoastOGImage.tsx       # Componente template
```

## Componente Template

Segue o design existente em `devroast.pen` (frame "Screen 4 - OG Image"):

- **Background:** `$bg-page` (#09090b)
- **Logo:** ">" em verde + "devroast" em branco (esquerda)
- **Score:** Número grande em âmbar (centro)
  - Score: 160px, bold, `$accent-amber`
  - Denom: 56px, `$text-tertiary` (#71717a)
- **Verdict Badge:** Dot vermelho + texto em vermelho
- **Info:** "lang: {language} · {lineCount} lines"
- **Quote:** Headline entre aspas, centrado

### Dimensões
- Imagem final: 1200x630
- Padding interno: 64px
- Gap entre elementos: 28px

## Rota (route.tsx)

```tsx
import { ImageResponse } from 'next/og';
import { db } from '@/db/client';
import { roastSubmissions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import RoastOGImage from '@/components/og/RoastOGImage';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }) {
  const roast = await db.query.roastSubmissions.findFirst({
    where: eq(roastSubmissions.id, params.id)
  });
  
  if (!roast) return notFound();

  return new ImageResponse(
    <RoastOGImage {...roast} />,
    { ...size }
  );
}
```

## Meta Tags

Na página `/roast/[id]/page.tsx`, adicionar:

```tsx
export const metadata = {
  openGraph: {
    images: [`/roast/${id}/opengraph-image`],
  },
  twitter: {
    card: 'summary_large_image',
    images: [`/roast/${id}/opengraph-image`],
  },
};
```

## Fallback

Se a geração falhar, usar uma imagem estática padrão (placeholder).

## Dados do Roast

O componente recebe:
- `score`: número (0-10)
- `verdict`: string (e.g., "needs_serious_help")
- `headline`: string (quote do roast)
- `language`: string
- `sourceLineCount`: número
- `mode`: string

## Notas de Implementação

1. Usar `ImageResponse` do `next/og` para renderização via Satori
2. Seguir estilo monospace (`JetBrains Mono`) para info de language
3. Cores via CSS variables compatíveis com Satori
4. Testar com diferentes tamanhos de headline (wrapping)
