# Database Seeding

Este diretório contém scripts para popular o banco de dados com dados fictícios usando Faker.js.

## Arquivos

### `seed.ts`
Script principal que gera 100 roasts completos com dados fictícios.

**Características:**
- Gera 100 roasts com dados variados
- Cria análises detalhadas (2-4 itens por roast)
- Gera diffs sugeridos para cada roast
- Distribui aleatoriamente entre visibilidades (private, unlisted, public)
- Usa 11 linguagens de programação diferentes
- Gera scores entre 0.0 e 3.0
- Cria slugs compartilháveis para roasts públicos

### `clear.ts`
Remove todos os dados de roasts do banco de dados (em ordem correta de foreign keys).

### `validate.ts`
Valida os dados inseridos e exibe estatísticas:
- Total de roasts
- Distribuição por visibilidade e linguagem
- Contagem de análises, diffs e linhas
- Estatísticas de score (average, min, max)

### `leaderboard-seed.ts` (legado)
Seed anterior com 5 roasts de exemplo. Pode ser usado para testes rápidos.

## Uso

### Executar seed completo (100 roasts)
```bash
npm run db:seed
```

### Limpar todos os dados
```bash
npm run db:seed-clear
```

### Validar dados do banco
```bash
npm run db:seed-validate
```

### Executar seed legado (5 roasts)
```bash
npm run db:seed-leaderboard
```

## Workflow Típico

1. **Setup inicial:**
   ```bash
   docker compose up -d          # Inicia PostgreSQL
   npm run db:push               # Aplica migrações
   npm run db:seed               # Popula com 100 roasts
   ```

2. **Resetar dados:**
   ```bash
   npm run db:seed-clear         # Limpa banco
   npm run db:seed               # Repopula
   npm run db:seed-validate      # Valida resultado
   ```

3. **Desenvolvimento:**
   - Dados estão sempre disponíveis no banco
   - Cada execução do seed cria dados diferentes (faker randomizado)
   - Use `npm run db:seed-clear` antes de executar seed novamente

## Estrutura de Dados

### roast_submissions (100 registros)
- **Distribuição de Visibilidade:** ~33% private, ~33% public, ~34% unlisted
- **Linguagens:** javascript, typescript, python, sql, java, go, rust, cpp, csharp, php, ruby
- **Scores:** 0.0 - 3.0 (média ~1.62)
- **Verdicts:** needs_serious_help, rough_but_fixable, actually_not_bad, clean_enough

### roast_analysis_items (~288 registros)
- **Severidade:** critical, warning, good
- **Por roast:** 2-4 análises

### roast_diff_blocks (100 registros)
- **1 diff por roast**

### roast_diff_lines (~1056 registros)
- **Por diff:** 5-15 linhas
- **Tipos:** context, added, removed

## Customização

Para modificar a quantidade de roasts, edite `seed.ts`:

```typescript
const roastsToInsert = 100;  // Mude este valor
```

Para adicionar mais linguagens, edite o array `languages`:

```typescript
const languages = [
  "javascript",
  "typescript",
  // ... adicione mais aqui
] as const;
```

Para customizar snippets de código, edite `codeSnippets`:

```typescript
const codeSnippets: Record<string, string[]> = {
  javascript: [
    // adicione mais snippets aqui
  ],
  // ...
};
```

## Dependências

- **@faker-js/faker**: Geração de dados fictícios
- **uuid**: Geração de UUIDs (instalado via drizzle-kit/tsx)
- **typescript**: Tipagem TypeScript
- **tsx**: Execução de arquivos TypeScript
