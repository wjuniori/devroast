# OG Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerar imagens OpenGraph dinâmicas (1200x630) para resultados de roast

**Architecture:** Rota nativa Next.js `/roast/[id]/opengraph-image` usa `ImageResponse` (Satori) para renderizar PNG a partir de componente React. Dados vem do DB via SSR.

**Tech Stack:** Next.js 15 App Router, `next/og` ImageResponse, Satori, Drizzle ORM

---

## File Structure

```
src/
├── app/roast/[id]/
│   ├── page.tsx                        # MODIFY: add generateMetadata
│   └── opengraph-image/
│       └── route.tsx                   # CREATE: OG image route
└── components/og/
    └── RoastOGImage.tsx                # CREATE: OG image component
```

---

## Task 1: Create OG Image Component

**Files:**
- Create: `src/components/og/RoastOGImage.tsx`
- Reference: `devroast.pen` frame "Screen 4 - OG Image" (node 4J5QT)

- [ ] **Step 1: Create component directory**

```bash
mkdir -p src/components/og
```

- [ ] **Step 2: Write RoastOGImage component**

```tsx
interface RoastOGImageProps {
  score: number;
  verdict: string;
  headline: string;
  language: string;
  lineCount: number;
}

const COLORS = {
  bgPage: '#09090b',
  accentAmber: '#f59e0b',
  accentRed: '#ef4444',
  accentGreen: '#22c55e',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
};

export default function RoastOGImage({
  score,
  verdict,
  headline,
  language,
  lineCount,
}: RoastOGImageProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: COLORS.bgPage,
        padding: 64,
        gap: 28,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          width: '100%',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: COLORS.accentGreen, fontSize: 24, fontWeight: 700 }}>&gt;</span>
          <span style={{ color: COLORS.textPrimary, fontSize: 20, fontWeight: 500 }}>devroast</span>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ color: COLORS.accentAmber, fontSize: 160, fontWeight: 900, lineHeight: 1 }}>
            {score.toFixed(1)}
          </span>
          <span style={{ color: COLORS.textTertiary, fontSize: 56, lineHeight: 1 }}>/10</span>
        </div>

        {/* Verdict */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: COLORS.accentRed,
            }}
          />
          <span style={{ color: COLORS.accentRed, fontSize: 20 }}>
            {verdict}
          </span>
        </div>

        {/* Language Info */}
        <span style={{ color: COLORS.textTertiary, fontSize: 16, fontFamily: 'JetBrains Mono, monospace' }}>
          lang: {language} · {lineCount} lines
        </span>

        {/* Headline Quote */}
        <span
          style={{
            color: COLORS.textPrimary,
            fontSize: 22,
            lineHeight: 1.5,
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          "{headline}"
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run lint/typecheck to verify**

```bash
npm run lint && npm run build
```

Expected: No errors related to RoastOGImage

- [ ] **Step 4: Commit**

```bash
git add src/components/og/RoastOGImage.tsx
git commit -m "feat: add RoastOGImage component for OpenGraph images"
```

---

## Task 2: Create OG Image Route

**Files:**
- Create: `src/app/roast/[id]/opengraph-image/route.tsx`

- [ ] **Step 1: Create route directory**

```bash
mkdir -p src/app/roast/\[id\]/opengraph-image
```

- [ ] **Step 2: Write OG image route**

```tsx
import { ImageResponse } from 'next/og';
import db from '@/db/client';
import { roastSubmissions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import RoastOGImage from '@/components/og/RoastOGImage';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let roast;
  try {
    roast = await db.query.roastSubmissions.findFirst({
      where: eq(roastSubmissions.id, id),
    });
  } catch {
    return new Response('Database error', { status: 500 });
  }

  if (!roast || roast.status !== 'completed') {
    return new Response('Not found', { status: 404 });
  }

  let fontData: ArrayBuffer;
  try {
    fontData = await fetch(
      new URL('https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf')
    ).then((res) => res.arrayBuffer());
  } catch {
    fontData = new ArrayBuffer();
  }

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

**Nota de Otimização:** O font fetch ocorre em cada request. Para produção, considerar bundlar a fonte ou usar edge KV cache.

- [ ] **Step 3: Run lint/typecheck to verify**

```bash
npm run lint && npm run build
```

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/roast/\[id\]/opengraph-image/route.tsx
git commit -m "feat: add OG image route for roast results"
```

---

## Task 3: Update Roast Page Metadata

**Files:**
- Modify: `src/app/roast/[id]/page.tsx`

- [ ] **Step 1: Add generateMetadata to page**

Replace the existing static `metadata` export with a dynamic `generateMetadata` (around line 15):

```tsx
import { eq } from 'drizzle-orm';
import db from '@/db/client';
import { roastSubmissions } from '@/db/schema';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const roast = await db.query.roastSubmissions.findFirst({
    where: eq(roastSubmissions.id, id),
  });

  if (!roast || roast.status !== 'completed') {
    return { title: 'Roast Result | Devroast' };
  }

  const score = Number(roast.score) || 0;

  return {
    title: `Roast Result: ${score.toFixed(1)}/10 - ${roast.verdict || 'analyzed'} | Devroast`,
    description: roast.headline || 'Your code has been roasted',
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

Remove the old static `metadata` export at the top of the file.

- [ ] **Step 2: Run lint/typecheck to verify**

```bash
npm run lint && npm run build
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/roast/\[id\]/page.tsx
git commit -m "feat: add OG image metadata to roast result page"
```

---

## Task 4: Test End-to-End

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test OG image route**

Navigate to: `http://localhost:3000/roast/[valid-id]/opengraph-image`

Expected: PNG image 1200x630 with score, verdict, and headline

- [ ] **Step 3: Test metadata in page**

Share the roast page URL in a browser's social preview debugger (e.g., Facebook Debugger, Twitter Card Validator)

Expected: Preview shows the generated OG image

---

## Edge Cases to Verify

1. **Invalid roast ID:** Returns 404
2. **Incomplete roast:** Returns 404
3. **Null headline:** Shows default text
4. **Null score:** Shows 0

---

## Summary

| Task | Files | Commits |
|------|-------|---------|
| 1. OG Image Component | `src/components/og/RoastOGImage.tsx` | 1 |
| 2. OG Image Route | `src/app/roast/[id]/opengraph-image/route.tsx` | 1 |
| 3. Update Metadata | `src/app/roast/[id]/page.tsx` | 1 |
| 4. E2E Test | - | - |
