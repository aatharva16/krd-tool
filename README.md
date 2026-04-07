# KRD Tool

A domain-agnostic web application that helps product managers write Key Requirements Documents faster and more consistently. Fill in a reusable team profile and a per-feature brief, and the tool uses an LLM via OpenRouter to generate a structured, complete KRD — streamed live, editable section by section, and exportable as a `.docx`.

---

## Prerequisites

- **Node.js** 20+
- **npm** 9+
- A **GitHub** account (for CI/CD)
- A **Supabase** account (needed from Phase 2)
- An **OpenRouter** API key (needed from Phase 1a)

---

## Local Setup

```bash
# 1. Clone the repo
git clone git@github.com:<your-org>/krd-tool.git
cd krd-tool

# 2. Install all workspace dependencies from the root
npm install

# 3. Copy environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
# Edit the .env files with your values (see Environment Variables section below)

# 4. Start both services
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable       | Service  | Description                   |
|----------------|----------|-------------------------------|
| `VITE_API_URL` | Frontend | URL of the backend API server |

### Backend (`backend/.env`)

| Variable               | Phase needed | Description                                              |
|------------------------|--------------|----------------------------------------------------------|
| `PORT`                 | Phase 0      | Port the Express server listens on (default: 3000)       |
| `CORS_ORIGIN`          | Phase 0      | Allowed frontend origin for CORS                         |
| `OPENROUTER_API_KEY`   | Phase 1a     | API key from openrouter.ai                               |
| `OPENROUTER_MODEL`     | Phase 1a     | Model string, e.g. `anthropic/claude-sonnet-4-5`         |
| `APP_URL`              | Phase 1a     | Public frontend URL (sent as HTTP-Referer to OpenRouter) |
| `SUPABASE_URL`         | Phase 2      | Your Supabase project URL                                |
| `SUPABASE_SERVICE_KEY` | Phase 2      | Service role key (server-side only, bypasses RLS)        |

---

## Running Lint and Type Check

```bash
# From the repo root — runs both frontend and backend
npm run lint

# Or individually
cd frontend && npx tsc -b --noEmit && npm run lint
cd backend  && npx tsc --noEmit    && npm run lint
```

---

## Project Structure

```
krd-tool/
├── frontend/                  Vite + React 19 + TypeScript
│   ├── src/
│   │   ├── App.tsx            Placeholder page + /health connectivity check
│   │   ├── main.tsx           React entry point
│   │   └── index.css          Tailwind CSS v4 import
│   ├── .env.example
│   └── vite.config.ts
├── backend/                   Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts           Express entry point, CORS, route mounting
│   │   └── routes/
│   │       └── health.ts      GET /health → { status, version }
│   ├── .env.example
│   └── tsconfig.json
├── shared/
│   └── types.ts               Shared TypeScript types (populated from Phase 2)
├── .github/
│   └── workflows/
│       ├── frontend.yml       CI: lint, type check, build
│       └── backend.yml        CI: lint, type check, build
└── package.json               Workspace root (npm workspaces)
```

---

## Phase Roadmap

| Phase | Version | User-facing capability                                                             |
|-------|---------|------------------------------------------------------------------------------------|
| 0     | v0.1.0  | Monorepo scaffold. Frontend loads. `/health` responds. CI passes.                  |
| 1a    | v0.2.0  | Paste context + fill feature brief → Generate → full KRD appears (non-streaming). |
| 1b    | v0.3.0  | Same as 1a but KRD streams word by word.                                           |
| 2     | v0.4.0  | Create and save team profiles. Active profile pre-fills the feature brief form.    |
| 3     | v0.5.0  | Generated KRDs auto-saved. Session history. Resume any past KRD.                  |
| 4     | v0.6.0  | Per-section regenerate + refine. Inline editing with manually-edited badge.        |
| 5     | v0.7.0  | Export full KRD as `.docx` with cover page, tables, and headings.                 |
| 6     | v1.0.0  | Live on a public URL. Full CI/CD to Vercel (FE) and Railway (BE).                 |
