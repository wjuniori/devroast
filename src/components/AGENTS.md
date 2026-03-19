# Component Patterns

## General Guidelines

- Use named exports only. Never use default exports.
- Keep components generic and reusable; route-specific behavior stays in page files.
- Use Tailwind tokens from `src/app/globals.css` `@theme`; avoid hardcoded values.
- Prefer compound components for complex UI with multiple parts.
- Style with `tailwind-variants` for component variants.

## Number Animation with NumberFlow

Use `@number-flow/react` for animated number transitions (counting up/down effects).

### Installation

```bash
npm install @number-flow/react
```

### Import

```typescript
import NumberFlow from "@number-flow/react";
```

### Basic Usage

```typescript
"use client";

import NumberFlow from "@number-flow/react";

<NumberFlow value={count} />
```

### With Format Options

```typescript
<NumberFlow
  value={avgScore}
  format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
/>
```

### Animation from Initial Value

To animate from 0 to actual value on data load:

```typescript
"use client";

import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { trpc } from "@/trpc/client";

export function MetricsDisplay() {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  
  const { data } = trpc.metrics.getMetrics.useQuery(undefined, {
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setIsAnimating(true);
      setDisplayValue(data.totalRoasts);
      
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [data]);

  return (
    <NumberFlow 
      value={displayValue} 
      willChange={isAnimating}
    />
  );
}
```

### Rules

- Always import as default: `import NumberFlow from "@number-flow/react"`
- Use `willChange={isAnimating}` to optimize performance when animation is complete
- Set appropriate `format` options for decimal places
- Use `useEffect` to detect data changes and trigger re-animation
- Keep animation duration reasonable (500-800ms typical)

## Client vs Server Components

### Server Components

- Data fetching, static content, layout
- Use tRPC `prefetch()` for data
- No "use client" directive

### Client Components

- Interactivity, hooks, browser APIs
- Use tRPC `useQuery`/`useMutation` hooks
- Include "use client" directive at top

### When to Use Client Components

- Component uses `useState`, `useEffect`, or other hooks
- Component uses browser-only APIs
- Component needs real-time updates (polling)
- Component uses `@number-flow/react` for animations
