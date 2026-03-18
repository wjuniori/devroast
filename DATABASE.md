# 🗄️ Database Implementation - Quick Reference

## Setup Local (First Time)

```bash
# 1. Copy env vars
cp .env.example .env.local

# 2. Start PostgreSQL
docker compose up -d

# 3. Apply migrations
DATABASE_URL="postgresql://devroast:devroast_local_dev@localhost:5432/devroast" npm run db:push

# 4. Seed example data
DATABASE_URL="postgresql://devroast:devroast_local_dev@localhost:5432/devroast" node --import tsx src/db/seeds/leaderboard-seed.ts
```

## Database Connection in Code

```typescript
// Server Components / API Routes
import db from '@/db/client'
import { roastSubmissions } from '@/db/schema'

// Use db directly
const roasts = await db.select().from(roastSubmissions)
```

## Available Queries

### Create a Roast (Atomically)
```typescript
import { createRoast } from '@/db/queries/create-roast'

const submissionId = await createRoast({
  submission: {
    sourceCode: '...',
    sourceLineCount: 10,
    language: 'typescript',
    mode: 'roast',
    status: 'completed',
    visibility: 'public',
    score: '3.5',
    verdict: 'actually_not_bad',
    headline: 'Looking good!',
    summary: 'Clean code with proper types',
    modelName: 'gpt-4',
  },
  analysisItems: [
    {
      severity: 'good',
      title: 'Good typing',
      description: 'All functions are properly typed',
      displayOrder: 1,
    }
  ],
  diffBlock: {
    fromLabel: 'original.ts',
    toLabel: 'improved.ts',
  },
  diffLines: [
    {
      kind: 'context',
      displayOrder: 1,
      content: 'const x = 5;',
      oldLineNumber: 1,
      newLineNumber: 1,
    }
  ]
})
```

### Get Roast by Slug
```typescript
import { getRoastBySlug } from '@/db/queries/get-roast-by-slug'

const roast = await getRoastBySlug('forgot-to-close-loop')
// Returns: { submission, analysisItems[], diffBlock, diffLines[] }
```

### Get Leaderboard
```typescript
import { getLeaderboard } from '@/db/queries/get-leaderboard'

const leaderboard = await getLeaderboard(limit = 50, offset = 0)
// Returns sorted by score ASC, createdAt DESC
```

## Schema Overview

### Tables
- **roast_submissions**: Main table with aggregated result
- **roast_analysis_items**: Detailed analysis cards (1:N relation)
- **roast_diff_blocks**: Diff header (1:1 relation in MVP)
- **roast_diff_lines**: Diff lines (1:N relation)

### Enums
- `code_language`: javascript, typescript, sql, python, java, go, rust, cpp, csharp, php, ruby, other
- `roast_mode`: roast, honest
- `roast_status`: queued, processing, completed, failed
- `roast_verdict`: needs_serious_help, rough_but_fixable, actually_not_bad, clean_enough
- `analysis_severity`: critical, warning, good
- `diff_line_kind`: context, added, removed
- `visibility`: private, unlisted, public

### Key Indexes
- `idx_status_created_at`: For processing queue queries
- `idx_visibility_score`: For leaderboard filtering
- `idx_leaderboard_public`: Partial index for public leaderboard (visibility=public AND status=completed)

## NPM Scripts

```bash
npm run db:generate   # Generate migrations from schema changes
npm run db:migrate    # Run migrations (use db:push instead)
npm run db:push       # Apply pending migrations
npm run db:studio     # Open Drizzle Studio UI
npm run db:seed       # Populate with example data
```

## Important Notes

✅ **Config Casing**: `casing: 'snake_case'` in drizzle.config.ts automatically converts camelCase to snake_case in database

✅ **No Relations**: Queries are written manually without Drizzle relations for better SQL control

✅ **Minimal Indexes**: Only essential indexes created (status, visibility, leaderboard)

✅ **Foreign Keys**: Automatically created with CASCADE delete

⚠️ **Atomic Operations**: Use `createRoast()` to insert submission + analysis + diff atomically

## Troubleshooting

### PostgreSQL won't connect
```bash
# Check if container is running
docker compose ps

# Start it
docker compose up -d

# Verify connection
docker exec devroast-postgres psql -U devroast -d devroast -c "SELECT 1"
```

### Need to reset database
```bash
docker compose down -v  # Remove volumes
docker compose up -d    # Recreate fresh
npm run db:push         # Reapply schema
npm run db:seed         # Repopulate seed data
```

### Drizzle Studio
```bash
DATABASE_URL="postgresql://devroast:devroast_local_dev@localhost:5432/devroast" npm run db:studio
# Opens http://local.drizzle.studio
```

## Migration Workflow

1. Update schema in `src/db/schema/*.ts`
2. Run `npm run db:generate` to create migration
3. Review SQL in `drizzle/XXXX_*.sql`
4. Apply with `npm run db:push`
5. Commit drizzle folder

All migrations are version-controlled in `/drizzle` directory.
