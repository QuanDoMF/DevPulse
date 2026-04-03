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
- Code must be clean, readable, and well-structured
- Follow security best practices (OWASP Top 10)

## Security

- **Secrets in `.env` only** — API tokens, keys, and credentials MUST go in `.env` (via `VITE_` prefix for client-side). NEVER store secrets in `localStorage`, `sessionStorage`, cookies, or hardcode them in source.
- **No sensitive data in client storage** — `localStorage`/`sessionStorage` may only store non-sensitive preferences (theme, repo name, UI state). Never tokens, passwords, or PII.
- **Sanitize user input** — Validate and sanitize all external input before rendering or using in API calls. Use parameterized queries for database operations.
- **Avoid XSS** — Never use `dangerouslySetInnerHTML`. Escape all dynamic content rendered in the DOM.
- **Minimal token scope** — Request only the minimum permissions needed (e.g., read-only `repo` scope for GitHub).
- **No secrets in git** — `.env` is gitignored. Never commit tokens, keys, or credentials.

## Refactoring Context
When refactoring: do NOT change business logic, only improve structure.

## Important

- Do NOT commit `.env` (contains DATABASE_URL and VITE_GITHUB_TOKEN)
- Run `prisma:generate` after every schema.prisma change

## Git Workflow

**Branching model:**
- `main` — stable, production-ready code only. Do NOT commit directly to main.
- `develop` — primary development branch. Do NOT commit directly to develop.
- `feature/short-name` or `fix/short-name` — created from `develop`, merged back into `develop`.
- **Release:** merge `develop` into `main` only when user explicitly requests it.

**CRITICAL RULES — MUST FOLLOW:**
1. **NEVER commit directly to `develop` or `main`.** Always create a `feature/` or `fix/` branch from `develop`.
2. **NEVER commit, push, create PR, or merge without user confirmation.** After making code changes, tell the user to test on localhost. WAIT for explicit "OK" / "test passed" / similar confirmation.
3. **Flow (step by step, no skipping):**
   - Create `feature/` or `fix/` branch from `develop`
   - Make code changes
   - Tell user to test on localhost
   - **STOP and WAIT** for user to confirm it works
   - Only after confirmation: commit → push → create PR → merge into `develop`
   - Delete feature/fix branch after merge
   - Checkout back to `develop`
4. Commit message: Conventional Commits, in English
5. After committing, always push the branch to remote
6. Merging `develop` → `main` only happens when user explicitly asks for it

**Automation (Claude handles, but ONLY after user confirms test OK):**
- Create feature/fix branches from `develop`
- Commit, push, create PR, and merge into `develop` via `gh` CLI
- Delete feature branch after merge
- User reviews UI at localhost — Claude does NOT proceed until user says OK