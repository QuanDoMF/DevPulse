# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — tsc + Vite production build
- `npm run preview` — preview production build locally
- `npm run prisma:generate` — regenerate Prisma client after schema changes
- `npm run prisma:migrate` — create and apply database migrations
- `npm run prisma:studio` — open Prisma Studio GUI

- `npm run lint` — ESLint check
- `npm run format` — Prettier format

## Architecture

**Stack:** React 19 + TypeScript + Vite 5 + Tailwind CSS 3 + Prisma 5 (SQLite)

**State:** Redux Toolkit. **HTTP:** Axios. **Auth:** not yet implemented.

**Path alias:** `@/*` resolves to `src/*` (configured in both tsconfig.json and vite.config.ts).

**Structure:** Feature-based.

**Key directories:**
- `src/components/` — shared UI components (PascalCase filenames, named exports)
- `src/pages/` — page-level components
- `src/hooks/` — custom React hooks
- `src/services/` — API calls (do NOT call APIs directly in components)
- `src/store/` — Redux Toolkit slices
- `src/lib/` — utilities, Prisma client instance
- `prisma/schema.prisma` — database schema definition

**Styling:** Tailwind utility classes directly in JSX — no separate CSS files. Dark theme (gray-950 background, indigo-500 accent). Global Tailwind directives in `src/index.css`.

**Database:** SQLite via Prisma ORM. DB file at `prisma/dev.db`. Run `prisma:generate` after any schema.prisma change.

## Conventions

- Components: PascalCase filenames, named exports
- Commit messages: Conventional Commits
- API calls go in `src/services/`, never directly in components

## Refactoring Context
When refactoring: do NOT change business logic, only improve structure.

## Important

- Do NOT commit `.env` (contains DATABASE_URL)
- Run `prisma:generate` after every schema.prisma change

## Git Workflow
- For each new feature/task: create a branch from the main one
- Name the branch: feature/short-name or fix/short-name
- Commit after the task is completed and I have tested it OK
- Commit message: Conventional Commits, in English
- DO NOT automatically push unless I tell you to push