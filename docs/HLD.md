# Tekmira AI — High-Level Design (HLD)

**Document Version:** 1.2.0  
**Project Name:** Tekmira AI  
**Tagline:** Beyond Claims. Driven by Evidence.  
**Description:** An AI-powered platform that evaluates resume-claimed skills against actual GitHub project evidence, identifies skill gaps, recommends suitable job opportunities, and helps users improve their job readiness.  
**Status:** Living Architectural Blueprint  
**Scope:** System Architecture, Data Flow, Component Boundaries & Service Strategy  

---

## 1. System Architecture Overview

Tekmira AI employs a decoupled, multi-tier **Client-Server Service Architecture**. The presentation tier runs as an independent Single-Page Application (SPA), communicating over HTTP with a stateless RESTful API server.

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION TIER                                  |
|   React 18 + Vite 6 + Tailwind CSS SPA                                                |
|   (Port 5173 - STATUS: IMPLEMENTED & OPERATIONAL)                                     |
|   - 8 Pages: Home, Dashboard, Resume, GitHub, JobMatch, Report, Login, Register       |
|   - Reusable Component Shell: Navbar, Sidebar, Footer, DashboardCard, PageLayout      |
|   - Reusable Network Gateway: Axios API Client + BackendStatusBadge                   |
+-------------------------------------------+-------------------------------------------+
                                            │
                                            │ HTTP / JSON (CORS Enabled)
                                            ▼
+---------------------------------------------------------------------------------------+
|                                    APPLICATION TIER                                   |
|   Node.js + Express REST API (ES Modules)                                             |
|   (Port 5000 - STATUS: IMPLEMENTED & OPERATIONAL)                                     |
|   - Middleware: CORS, JSON Body Parser, notFoundHandler, errorHandler                 |
|   - Layered Modules: Routes ➔ Controllers ➔ Services                                  |
|   - Core Endpoint: GET /api/health                                                    |
+---------------------+-------------------------------------------+---------------------+
                      │                                           │
      [PLANNED INTEGRATIONS]                      [PLANNED INTEGRATIONS]
                      │                                           │
                      ▼                                           ▼
+-------------------------------------------+   +---------------------------------------+
|              PERSISTENCE TIER             |   |           EXTERNAL SERVICES           |
|        (STATUS: PLANNED - MODULE 4)       |   |      (STATUS: PLANNED - MODULE 5-7)   |
|                                           |   |                                       |
|  1. PostgreSQL (Relational)               |   |  1. Google Gemini API                 |
|     - Users & Auth Credentials            |   |     - Structured Schema Extraction    |
|     - Standardized Skills Taxonomy        |   |     - Triangulation & Gap Synthesis   |
|     - Target Job Catalog                  |   |                                       |
|                                           |   |  2. GitHub REST / GraphQL API         |
|  2. MongoDB (Document / Unstructured)     |   |     - Public Repo Inspection          |
|     - Parsed Resume Text & ASTs           |   |     - Commit Log Verification         |
|     - Raw GitHub Tree Digests             |   |     - Language & Dependency Trees     |
|     - Full AI Evaluation Reports          |   |                                       |
+-------------------------------------------+   +---------------------------------------+
```

---

## 2. Frontend Architecture (Implemented & Live)

The frontend is built using **React 18** and **Vite 6**, structured around component-driven composition:

- **State Management & Communication:**
  - Client-side routing managed declaratively via `react-router-dom` v6.
  - Asynchronous HTTP transport managed via an environment-driven `axios` client instance (`client/src/services/apiClient.js`).
  - Active server health verification managed via custom lifecycle polling (`client/src/components/BackendStatusBadge.jsx`).
- **Design Tokens & Styling:**
  - Built with **Tailwind CSS 3** using a customized palette:
    - *Primary Navy:* `#0A142F` (authoritative, enterprise SaaS feel).
    - *Backgrounds:* Clean white (`#FFFFFF`) and slate canvas (`#F8FAFC`).
    - *Accent Coral:* `#FF6B6B` (call-to-actions, badges, and status highlights).
- **Zero Fake Data Architecture:** Views use explicit empty/pending states, ensuring users are never shown fabricated AI results before the pipeline executes.

---

## 3. Backend Architecture (Implemented & Live)

The backend is built using **Node.js** with native **ECMAScript Modules (`"type": "module"`)** and **Express 4**:

- **Strict Separation of Configuration and Listener:**
  - `app.js`: Configures the Express middleware pipeline, mounts routes, registers 404 handlers, and exports the application instance. Does not bind to a network port (vital for automated integration testing).
  - `server.js`: Imports `app`, loads validated configuration from `.env`, starts the network listener on port `5000`, and binds OS process termination handlers (`SIGINT`, `SIGTERM`) for graceful shutdown.
- **Layered 4-Tier Pattern:**
  1. *Middleware Layer:* CORS headers, JSON request body parsing, rate limiting.
  2. *Routes Layer:* Maps HTTP verbs and paths (`/api/health`) to controller functions.
  3. *Controller Layer:* Extracts request data, invokes services, and sends standard JSON envelopes.
  4. *Service Layer:* Pure business logic with zero dependency on Express `req`/`res` objects.
- **Centralized Error-Handling Pipeline:** 
  - Standardized error response envelope (`{ success: false, message: '...' }`).
  - Custom `AppError` class encapsulating HTTP status codes and operational flags.
  - Automatic stack trace suppression in production environments.

---

## 4. Planned External Services (Scheduled for Later Modules)

> **Important Note:** These external services are fully planned in our architecture but have **not yet been connected** to preserve strict modular delivery.

### 4.1 Google Gemini API (Planned — Module 6 & 7)
- **Role:** Natural language understanding and semantic reasoning engine.
- **Planned Tasks:**
  1. *Resume Information Extraction:* Transforming unstructured text streams from PDF resumes into structured JSON schemas (skills list, project list, duration).
  2. *Semantic Taxonomy Normalization:* Mapping non-standard skill synonyms (e.g. "ReactJS", "React.js", "React Native") to canonical skill IDs.
  3. *Three-Way Triangulation:* Comparing resume claims against mined GitHub ASTs and target JDs to produce natural-language explanations for readiness scores.

### 4.2 GitHub REST & GraphQL APIs (Planned — Module 5 & 6)
- **Role:** Empirical code evidence extraction.
- **Planned Tasks:**
  1. *Profile Verification:* Verifying that public GitHub accounts exist and checking public repository counts.
  2. *Author Commit Filtering:* Filtering out cloned or forked repositories to ensure metrics reflect code authored by the student (`commit.author.login == student_username`).
  3. *Dependency & AST Inspection:* Sampling dependency manifests (`package.json`, `pom.xml`, `requirements.txt`) and key source code files to verify authentic usage.

---

## 5. Planned Database Architecture (Scheduled — Module 4)

Tekmira AI utilizes a **Dual-Database Strategy** to leverage the distinct advantages of both relational and document databases:

### 5.1 PostgreSQL (Relational Engine) — Planned
- **Role:** Storing highly structured, relational data requiring ACID compliance, referential integrity, and foreign-key constraints.
- **Planned Tables:**
  - `users`: Core student and recruiter account records, hashed passwords, academic profiles.
  - `target_jobs`: Curated and custom job descriptions, required skill matrices.
  - `skills_taxonomy`: Normalized directory of technical skills, categories, and synonym arrays.
  - `verifications`: Historical audit records of past analysis runs.

### 5.2 MongoDB (Document Engine) — Planned
- **Role:** Storing polymorphic, deeply nested, schema-less data structures generated during analysis.
- **Planned Collections:**
  - `resumes`: Raw extracted resume text, parsed token arrays, and candidate project descriptions.
  - `github_profiles`: Raw repository metadata trees, commit volume distributions, and sampled code snippets.
  - `analysis_reports`: Polymorphic explainable reports containing variable-length triangulation matrices, citations, and custom remediation roadmaps.

---

## 6. Application Data Flow

### 6.1 Currently Implemented Data Flow (Live)
```
[User Browser]
      │
      ▼
[React 18 SPA (localhost:5173)]
      │
      ▼ (Mounted / Loaded)
[BackendStatusBadge.jsx]
      │
      ▼ (Axios HTTP GET)
[Express Server (localhost:5000)]
      │
      ▼ (CORS Verification)
[app.use('/api', apiRoutes)]
      │
      ▼ (Route Matching)
[healthController.getHealth]
      │
      ▼ (Service Query)
[HealthService.getHealthInfo]
      │
      ▼ (HTTP 200 OK Response)
[{ success: true, message: "Tekmira AI backend is running" }]
      │
      ▼ (Axios Interceptor Unwraps Data)
[React State: status = 'connected']
      │
      ▼ (Re-render DOM)
[UI Displays: 🟢 "API Online"]
```

### 6.2 Planned End-to-End Pipeline Data Flow
```
[Student Uploads PDF] ───► [Express / Multer] ───► [pdf-parse] ───► [Gemini Extraction] ───► [MongoDB: resumes]
                                                                                                  │
[Student GitHub User] ───► [GitHub Miner] ────► [Commit/AST Audit] ──────────────────────────► [MongoDB: github]
                                                                                                  │
[Select Target JD]   ───► [JD Normalizer] ────► [Skills Catalog] ──────────────────────────────► [PostgreSQL: jobs]
                                                                                                  │
                                                                                                  ▼
                                                                                     [Gemini Triangulation Engine]
                                                                                                  │
                                                                                                  ▼
[React Visual Report] ◄── [REST API Dispatch] ◄── [Readiness Score Matrix] ◄── [MongoDB: reports]
```
