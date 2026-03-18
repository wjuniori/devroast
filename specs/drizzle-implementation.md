# Especificacao de dados para implantar Drizzle no Devroast

## Contexto considerado

Esta especificacao foi montada a partir de:

- `README.md`
- layout ativo em `devroast.pen`

### IA agnóstica com Vercel AI SDK

O roast (análise de código) será gerado por uma IA agnóstica através do **Vercel AI SDK**, que abstrai diferentes provedores de modelos (OpenAI, Anthropic, Google, etc.). Isso permite:

- Trocar de provider sem alterar a lógica de persistência
- Usar o provider mais adequado por custo/performance/latência
- Facilitar testes com diferentes modelos
- Manter a camada de IA separada da persistência de dados

A resposta do modelo será estruturada e salva nas tabelas de resultado (`roast_submissions`, `roast_analysis_items`, `roast_diff_blocks`, `roast_diff_lines`).

O produto hoje mostra quatro blocos funcionais bem claros no layout:

1. entrada de codigo com selecao de `roast mode`
2. tela de resultado com score, veredito, analise detalhada e diff sugerido
3. shame leaderboard publica
4. compartilhamento de roast (`share_roast`)

Isso indica que o banco precisa atender dois fluxos principais:

- persistir uma submissao de codigo e o resultado gerado
- publicar e consultar roasts no leaderboard e por link compartilhavel

## Decisoes de modelagem

### Escopo MVP

Para a primeira implantacao com Drizzle, o banco deve cobrir:

- submissao anonima de snippets
- persistencia do resultado do roast
- cards de analise detalhada
- diff sugerido
- leaderboard publica
- compartilhamento por slug

### Fora do escopo agora

Nao criar neste momento:

- tabela de usuarios
- autenticacao
- comentarios, likes ou votos
- historico de execucoes por usuario autenticado
- billing

O layout e o README ainda nao exigem isso. Se forcarmos essas tabelas agora, vamos adicionar complexidade sem uso imediato.

## Enums necessarios

### `code_language`

Representa a linguagem do snippet enviado.

Valores iniciais sugeridos:

- `javascript`
- `typescript`
- `sql`
- `python`
- `java`
- `go`
- `rust`
- `cpp`
- `csharp`
- `php`
- `ruby`
- `other`

### `roast_mode`

Reflete o toggle da home.

Valores:

- `roast`
- `honest`

### `roast_status`

Controla o ciclo de vida da analise.

Valores:

- `queued`
- `processing`
- `completed`
- `failed`

### `roast_verdict`

Veredito principal exibido no hero do resultado e no OG image.

Valores iniciais sugeridos:

- `needs_serious_help`
- `rough_but_fixable`
- `actually_not_bad`
- `clean_enough`

### `analysis_severity`

Usado nos cards de analise detalhada.

Valores:

- `critical`
- `warning`
- `good`

### `diff_line_kind`

Usado para renderizar o bloco de diff.

Valores:

- `context`
- `added`
- `removed`

### `visibility`

Define se o roast pode aparecer no leaderboard ou em pagina compartilhavel.

Valores:

- `private`
- `unlisted`
- `public`

## Tabelas necessarias

### 1. `roast_submissions`

Tabela principal do dominio.

Cada linha representa um snippet submetido e seu resultado agregado.

Colunas sugeridas:

- `id` uuid primary key
- `share_slug` text unique nullable
- `source_code` text not null
- `source_line_count` integer not null
- `language` `code_language` not null
- `mode` `roast_mode` not null default `roast`
- `status` `roast_status` not null default `queued`
- `visibility` `visibility` not null default `private`
- `score` numeric(3,1) nullable
- `verdict` `roast_verdict` nullable
- `headline` text nullable
- `summary` text nullable
- `model_name` text nullable
- `error_message` text nullable
- `is_featured` boolean not null default false
- `featured_rank` integer nullable
- `created_at` timestamp with time zone not null default now()
- `updated_at` timestamp with time zone not null default now()
- `completed_at` timestamp with time zone nullable

Observacoes:

- `score` precisa aceitar valores como `3.5`
- `headline` guarda a frase principal do roast, usada no hero e no OG image
- `summary` cobre texto auxiliar futuro sem obrigar recalcular UI
- `share_slug` permite uma rota do tipo `/roast/[slug]`
- `is_featured` + `featured_rank` ajudam a sustentar os exemplos intencionalmente ruins do leaderboard sem depender apenas de ordem por score

Indices sugeridos:

- index em `(status, created_at desc)`
- index em `(visibility, score asc)`
- unique index em `share_slug`
- partial index para leaderboard publico: `(score asc, created_at desc)` onde `visibility = 'public'` e `status = 'completed'`

### 2. `roast_analysis_items`

Tabela para os cards do bloco `detailed_analysis`.

Colunas sugeridas:

- `id` uuid primary key
- `submission_id` uuid not null references `roast_submissions.id` on delete cascade
- `severity` `analysis_severity` not null
- `title` text not null
- `description` text not null
- `display_order` integer not null
- `created_at` timestamp with time zone not null default now()

Observacoes:

- um roast pode ter varios itens `critical`, `warning` e `good`
- `display_order` garante a ordem do layout sem depender da ordem fisica do banco

Indices sugeridos:

- index em `(submission_id, display_order)`

### 3. `roast_diff_blocks`

Tabela para representar um diff sugerido por submissao.

Colunas sugeridas:

- `id` uuid primary key
- `submission_id` uuid not null references `roast_submissions.id` on delete cascade
- `from_label` text not null default `your_code.ts`
- `to_label` text not null default `improved_code.ts`
- `created_at` timestamp with time zone not null default now()

Observacoes:

- um roast pode inicialmente ter um unico diff
- manter a tabela separada evita acoplar cabecalho e linhas em uma unica coluna JSON
- se no futuro houver mais de uma sugestao por submissao, o modelo ja suporta

Indices sugeridos:

- unique index em `(submission_id)` para o MVP

### 4. `roast_diff_lines`

Linhas do diff exibido na tela de resultado.

Colunas sugeridas:

- `id` uuid primary key
- `diff_block_id` uuid not null references `roast_diff_blocks.id` on delete cascade
- `kind` `diff_line_kind` not null
- `display_order` integer not null
- `content` text not null
- `old_line_number` integer nullable
- `new_line_number` integer nullable

Observacoes:

- o layout atual usa apenas `context`, `removed` e `added`
- numeros de linha podem ser uteis depois para export, share page e auditoria visual

Indices sugeridos:

- index em `(diff_block_id, display_order)`

## Relacionamentos

- `roast_submissions` 1:N `roast_analysis_items`
- `roast_submissions` 1:1 `roast_diff_blocks` no MVP
- `roast_diff_blocks` 1:N `roast_diff_lines`

## O que o leaderboard usa

O leaderboard nao precisa de tabela propria no MVP.

Ele pode ser montado a partir de `roast_submissions` com:

- `status = 'completed'`
- `visibility = 'public'`
- `score is not null`
- ordenacao por `score asc`, `created_at desc`

Campos usados pela UI do leaderboard:

- rank: calculado em query
- score: `roast_submissions.score`
- linguagem: `roast_submissions.language`
- quantidade de linhas: `roast_submissions.source_line_count`
- preview de codigo: derivado de `source_code`
- item compartilhavel: `share_slug`

### Quando considerar uma tabela extra depois

Criar uma tabela como `leaderboard_entries` ou uma materialized view so vale a pena se:

- a geracao de ranking ficar cara
- houver score congelado por temporada/campanha
- existir curadoria manual mais forte do ranking

## Seeds iniciais recomendados

O README fala de exemplos intencionalmente ruins no leaderboard. Portanto, o projeto precisa de seed inicial com pelo menos:

- 5 roasts publicos completos
- linguagens variadas (`javascript`, `typescript`, `sql` pelo menos)
- score baixo para alimentar a leaderboard
- cards de analise preenchidos
- diff sugerido preenchido
- `share_slug` valido para cada seed publico

## Estrutura sugerida no codigo

```text
src/db/
  schema/
    enums.ts
    roast-submissions.ts
    roast-analysis-items.ts
    roast-diff-blocks.ts
    roast-diff-lines.ts
    index.ts
  client.ts
  queries/
    create-roast.ts
    get-roast-by-slug.ts
    get-leaderboard.ts
  seeds/
    leaderboard-seed.ts
src/ai/
  client.ts (inicializa Vercel AI SDK)
  roast-prompt.ts (template de prompt para roast)
  parse-roast.ts (parse resposta em estrutura tipada)
drizzle.config.ts
docker-compose.yml
```

## Integração com Vercel AI SDK

### Configuração

- Adicionar `ai` (Vercel AI SDK) como dependência
- Criar `src/ai/client.ts` com instância do modelo via `generateObject` ou `generateText`
- Suportar variáveis de ambiente para provider: `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY`
- Exemplo: OpenAI por padrão, mas flexível para Anthropic/Google

### Fluxo de geração

1. Usuário submete código + `roast_mode` na homepage
2. API cria registro em `roast_submissions` com `status = 'queued'`
3. Job/handler chama `src/ai/generate-roast.ts`:
   - Formata prompt com `source_code`, `language`, `mode`
   - Chama Vercel AI SDK com schema tipado
   - Recebe structured output: `{ verdict, score, headline, summary, analysis_items: [], diff_block: {} }`
4. Parser estrutura resposta em tipos TypeScript
5. Persistência atomicamente:
   - Atualiza `roast_submissions` com resultado
   - Insere `roast_analysis_items` (análise detalhada)
   - Insere `roast_diff_blocks` + `roast_diff_lines` (diff sugerido)
   - Define `status = 'completed'` ou `'failed'` com `error_message` se necessário

### Vantagens desta arquitetura

- **Provider agnóstico**: trocar `AI_PROVIDER` não afeta queries/schema
- **Separação de responsabilidades**: IA em `src/ai/`, dados em `src/db/`
- **Testabilidade**: mockar resposta do Vercel AI SDK sem tocar banco
- **Escalabilidade**: futura migração para job queue (Bull, RabbitMQ) sem quebrar schema

## TODOs de implantacao do Drizzle

### Infra local

- criar `docker-compose.yml` com servico `postgres`
- expor porta local padrao, ex.: `5432:5432`
- configurar volume persistente para dados
- definir `POSTGRES_DB`, `POSTGRES_USER` e `POSTGRES_PASSWORD`
- adicionar `.env.example` com `DATABASE_URL`
- documentar comando de subida: `docker compose up -d`

### Dependencias

- adicionar `drizzle-orm`
- adicionar `drizzle-kit`
- adicionar driver `postgres`
- adicionar `ai` (Vercel AI SDK)
- adicionar provider específico conforme escolha: `openai`, `@anthropic-ai/sdk`, `@google/generative-ai`, etc.
- adicionar `zod` para validação e schema tipado (usado pelo Vercel AI SDK)
- adicionar scripts npm para `db:generate`, `db:migrate`, `db:push`, `db:studio`, `db:seed`

### Configuracao

- criar `drizzle.config.ts`
- criar `src/db/client.ts` com singleton para o App Router
- centralizar schema em `src/db/schema/index.ts`
- padronizar timestamps com `created_at` e `updated_at`

### Banco e migracoes

- modelar os enums Postgres listados nesta especificacao
- criar as quatro tabelas do MVP
- gerar migracao inicial
- aplicar migracao no Postgres local via Docker Compose
- validar constraints, foreign keys e indices

### Dados e integracao

- criar seed para popular o shame leaderboard
- criar query para listar top roasts publicos
- criar query para buscar roast por `share_slug`
- criar query para persistir submissao completa com itens de analise e diff
- definir contrato entre camada de IA/analise e persistencia
- **configurar Vercel AI SDK**: criar `src/ai/client.ts` com suporte ao provider agnóstico
- **criar gerador de roast**: `src/ai/generate-roast.ts` com prompt estruturado e schema Zod
- **criar parser**: `src/ai/parse-roast.ts` para validar e estruturar resposta do modelo

### Aplicacao Next.js

- ligar a homepage a uma acao de criacao de submissao
- criar pagina de detalhe de roast compartilhado
- criar rota/pagina real de leaderboard usando banco
- trocar mocks hardcoded por queries Drizzle

### Observabilidade minima

- registrar falhas de processamento em `error_message`
- manter `status` e `completed_at` consistentes
- garantir que falhas nao vazem roasts incompletos para o leaderboard

## Ordem recomendada de implementacao

1. subir Postgres com Docker Compose
2. instalar Drizzle e configurar `drizzle.config.ts`
3. **instalar Vercel AI SDK e provider escolhido (ex: OpenAI)**
4. criar schema e migracao inicial
5. **criar camada de IA**: client, gerador de roast e parser
6. criar seed do leaderboard
7. trocar a listagem mockada da home por query real
8. criar persistencia da submissao e da tela de resultado com IA integrada
9. criar rota de compartilhamento por slug

## Assuncoes abertas

Estas decisoes foram tomadas como padrao por falta de restricao explicita no README/layout:

- submissao anonima e permitida
- leaderboard publica mostra roasts completos e finalizados
- um roast possui no maximo um diff principal no MVP
- exemplos do leaderboard serao mantidos por seed inicial

Se depois quisermos contas de usuario, historico pessoal ou multiplas execucoes por snippet, a primeira evolucao natural e adicionar `users` e `roast_runs` sem quebrar a base acima.
