# AGENTS.md — Tekmira AI Agent & Developer Guidelines

> Universal instructions and operational manual for AI coding agents (OpenAI Codex, Claude Code, Cursor, Copilot Workspace, Antigravity) and human contributors.

---

## 1. Project Overview & Architecture

**Tekmira AI** (*"Beyond Claims. Driven by Evidence."*) is an AI-powered placement readiness and competency verification engine. It eliminates resume inflation in tech campus hiring by triangulating three independent data sources:
1. **Self-Reported Resume Claims**: Ingested via PDF memory streams (`multer`), validated through `%PDF-` magic-byte inspection, cryptographic SHA-256 fingerprinting, and structured Gemini 2.5 Flash schema extraction.
2. **Empirical Code Proofs**: Mined from candidate public GitHub repositories via GitHub REST API, extracting multi-file AST syntax, commit frequencies, test density, and language distribution.
3. **Target Job Requirements**: Benchmark junior full-stack developer competencies.

The triangulation engine calculates a deterministic **Placement Readiness Index (PRI: 0–100)** and classifies skills into four explainable buckets:
- `VERIFIED`: Claimed on resume + empirically proven in repository code.
- `UNCLAIMED_STRENGTH`: Not on resume, but discovered directly in GitHub code commits.
- `INFLATED_CLAIM`: Claimed on resume with zero code evidence (floored to prevent prompt injection).
- `MISSING_CRITICAL`: Required by target job, missing from both resume and code.

---

## 2. Technology Stack & Directory Layout

### Tech Stack
- **Frontend**: React 18, Vite 6, Tailwind CSS 3, Lucide React icons, React Router DOM v6.
- **Backend**: Node.js 22 (ES Modules `"type": "module"`), Express 4.21, Multer (memory storage), `pdf-parse`.
- **AI Engine**: Google Gemini API (`@google/genai` v3.3.0) using `gemini-2.5-flash` with strict Zod structured outputs.
- **Relational DB**: PostgreSQL via Prisma ORM v6 (`@prisma/client`).
- **Document DB**: MongoDB via Mongoose v9 (non-blocking connection with automatic fallback).
- **Security & Auth**: JWT (`jsonwebtoken`), bcryptjs, rate limiting, anti-prompt-injection boundary delimiters.
- **Testing**: Native Node test harness with Supertest-compatible fluent agent, 100% deterministic assertion.

### Directory Structure
```
Tekmira-AI/
├── AGENTS.md                 # Universal AI agent instructions (this file)
├── PROJECT_RULES.md          # 12 cardinal development principles & constraints
├── README.md                 # Human-facing project documentation
├── docker-compose.yml        # Multi-container orchestration (postgres, mongo, server, client)
├── client/                   # Frontend React SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── components/       # UI components & ErrorBoundary.jsx
│   │   ├── pages/            # Dashboard, ResumeAnalysis, GitHubAnalysis, AnalysisReport, InterviewPrep
│   │   ├── services/         # Axios API clients (aiService, repositoryService, interviewService)
│   │   └── utils/            # apiError.js (normalized error structures)
│   ├── package.json
│   └── vite.config.js
└── server/                   # Backend REST API Engine (Node.js ES Modules)
    ├── prisma/               # schema.prisma (User, Role, JobProfile relational schemas)
    ├── src/
    │   ├── config/           # env.js, database.js (Prisma), mongoDatabase.js (Mongoose)
    │   ├── controllers/      # auth, resume, github, matching, interview, analytics
    │   ├── models/           # Mongoose schemas (ResumeDocument, RepoSnapshot, SkillReport, InterviewSession)
    │   ├── routes/           # Express v1 routers
    │   ├── services/         # aiService, repositoryService, matchingService, interviewService, authService
    │   ├── test/             # 8 automated test suites (80 tests total)
    │   ├── validations/      # Zod validation schemas
    │   ├── app.js            # Express app configuration & middleware pipeline
    │   └── server.js         # HTTP server entrypoint & graceful shutdown handlers
    └── package.json
```

---

## 3. Environment Variables & Setup

### `server/.env`
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tekmira_db?schema=public"
MONGODB_URI="mongodb://localhost:27017/tekmira_docs"
JWT_SECRET="tekmira_ai_secure_dev_jwt_secret_key_2026_exam_ready"
JWT_EXPIRES_IN="7d"

# Gemini AI Configuration (optional: defaults to calibrated mock fallback if empty)
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"
```

### `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Key Developer Commands

### Installation
```bash
# Server
cd server
npm install
npx prisma generate

# Client
cd ../client
npm install
```

### Running Locally
```bash
# Terminal 1: Backend (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend (Port 5173)
cd client
npm run dev
```

### Running Tests (Mandatory Verification)
```bash
# Run all 80 automated unit, API, docker, aggregation, production, and security tests:
npm --prefix server run test:all

# Run individual test suites:
npm --prefix server run test:unit        # Skill normalization, PRI formula, Zod parsing
npm --prefix server run test:api         # Supertest HTTP integration
npm --prefix server run test:docker      # Docker multi-stage & compose verification
npm --prefix server run test:aggregation # MongoDB aggregation pipeline tests
npm --prefix server run test:production  # Production deployment checks
npm --prefix server run test:security    # Rate limiting, prompt injection, RBAC

# Verify client production bundle:
npm --prefix client run build
```

---

## 5. Coding & Contribution Rules for Agents

1. **ES Modules Only in Server**: The server uses native ES modules (`"type": "module"`). Always use `import`/`export`, never CommonJS `require()`.
2. **Never Break Working Tests**: All 80 automated tests must remain 100% green at all times.
3. **Normalized Error Handling**:
   - Backend controllers must wrap asynchronous routes with `next(err)` or centralized error middleware.
   - Frontend components must use `normalizeApiError(err).message` so that `ApiError` objects are never passed directly as React children.
4. **Resilient Non-Blocking Services**:
   - MongoDB and PostgreSQL connections should fail safely without crashing the HTTP server in development.
   - When `GEMINI_API_KEY` is not present, `aiService` automatically falls back to the deterministic mock engine.
5. **No Secret Leaks**: Never print, log, or commit `.env` secrets or raw API keys.
