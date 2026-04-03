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

**Branching model:**
- `main` — stable, production-ready code only. Do NOT commit directly to main.
- `develop` — primary development branch. All feature work merges here.
- `feature/short-name` or `fix/short-name` — created from `develop`, merged back into `develop`.
- **Release:** merge `develop` into `main` when ready for production.

**Rules:**
- Commit after the task is completed and I have tested it OK
- Commit message: Conventional Commits, in English
- After committing, always push the branch to remote
- Always push both `develop` and the feature branch

**Automation (Claude handles entirely):**
- Create feature/fix branches from `develop`
- Commit, push, create PR, and merge into `develop` via `gh` CLI
- Delete feature branch after merge
- User only reviews UI at localhost — all git operations are automated