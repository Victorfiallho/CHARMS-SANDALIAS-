# Charms Sandálias CRM — Claude Code Instructions

## Commits

NEVER add `Co-Authored-By` trailers to any commit message.
NEVER mention Claude, Anthropic, or any AI tool in commit messages.
Commit messages should be authored solely as the git user configured (`Victor Fialho`).

## Stack

- Next.js 14.2 App Router, TypeScript strict
- Supabase (Postgres + Realtime)
- Tailwind CSS v4 (`@import "tailwindcss"` + `@theme {}`)
- Package manager: **npm** (not pnpm, not yarn)
- Dev command: `npm run dev:web` (from monorepo root)

## Convenções

- Português para mensagens de commit e comentários de código
- Inline styles para componentes React (não Tailwind classes em JSX)
- Classes CSS globais definidas em `apps/web/app/globals.css`
- Constantes de stage/status em `apps/web/lib/constants.ts` (a criar)
