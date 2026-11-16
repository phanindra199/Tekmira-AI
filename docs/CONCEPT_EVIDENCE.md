# Tekmira AI — Concept Evidence Map & Assessor Defense Guide (Day 21)

> **Beyond Claims. Driven by Evidence.**  
> **Repository:** `https://github.com/phanindra199/Tekmira-AI.git`  
> **Release Target:** `v1.0.0` Production Capstone Release  
> **Author:** Tekmira AI Engineering Team  

---

## 1. Executive Summary & Purpose

This document serves as the **authoritative concept evidence map** for university assessors, academic examiners, and technical evaluators. It systematically maps every theoretical engineering concept, design pattern, and practical implementation requirement specified across the **21-Day Capstone Playbook** directly to verified source code files, unit tests, and runtime artifacts in the Tekmira AI repository.

---

## 2. 21-Day Syllabus Traceability Matrix

| Day | Syllabus Concept / Engineering Milestone | Primary Source Code File(s) | Verification Test Suite |
| :--- | :--- | :--- | :--- |
| **Day 1** | Project Conception, PRD, HLD, LLD Architecture | [`docs/PRD.md`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/docs/PRD.md), [`docs/HLD.md`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/docs/HLD.md), [`docs/LLD.md`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/docs/LLD.md) | Architectural Review |
| **Day 2** | React 18 SPA, Tailwind CSS Design System, 8 Core Views | [`client/src/App.jsx`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/client/src/App.jsx), [`client/src/pages/`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/client/src/pages/) | `npm --prefix client run build` |
| **Day 3** | Express REST API Scaffold, ES Modules, Error Envelopes | [`server/src/app.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/app.js), [`server/src/utils/AppError.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/utils/AppError.js) | `GET /api/health` |
| **Day 4** | PostgreSQL Relational Modeling & Prisma ORM Schema | [`server/prisma/schema.prisma`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/prisma/schema.prisma) | `npm run test:relational` |
| **Day 5** | MongoDB NoSQL Document Schemas & Collections | [`server/src/models/`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/models/) | `npm run test:mongo` |
| **Day 6** | JWT Authentication, Bcrypt Hashing, RBAC Middleware | [`server/src/services/authService.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/services/authService.js), [`server/src/middleware/authMiddleware.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/middleware/authMiddleware.js) | `npm run test:auth` |
| **Day 7** | REST API Standards & End-to-End Auth Lifecycle | [`server/src/routes/authRoutes.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/routes/authRoutes.js), [`server/src/controllers/authController.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/controllers/authController.js) | `npm run test:rest` |
| **Day 8** | Google Gemini API Client & Structured JSON Outputs | [`server/src/services/geminiService.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/services/geminiService.js) | `npm run test:gemini` |
| **Day 9** | Prompt Engineering, Anti-Hallucination & Anti-Injection | [`server/src/prompts/promptTemplates.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/prompts/promptTemplates.js) | `npm run test:prompts` |
| **Day 10** | PDF Resume Stream Ingestion & Magic-Byte Validation | [`server/src/services/pdfExtractionService.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/services/pdfExtractionService.js), [`server/src/middleware/uploadMiddleware.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/middleware/uploadMiddleware.js) | `npm run test:pdf` |
| **Day 11** | GitHub API Integration & AST/Dependency Evidence Mining | [`server/src/services/githubService.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/services/githubService.js) | `npm run test:github` |
| **Day 12** | 3-Way Triangulation Engine (Claims vs Code vs JDs) | [`server/src/services/matchingEngineService.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/services/matchingEngineService.js) | `npm run test:matching` |
| **Day 13** | Placement Readiness Index ($PRI$) & Explainable Scoring | [`server/src/services/matchingEngineService.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/services/matchingEngineService.js) | `npm run test:unit` |
| **Day 14** | Interactive AI Technical Viva Voce & Rubric Evaluation | [`server/src/services/interviewPrepService.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/services/interviewPrepService.js), [`client/src/pages/InterviewPrepPage.jsx`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/client/src/pages/InterviewPrepPage.jsx) | `npm run test:interview` |
| **Day 15** | Controlled Forms, Client/Server Validation, UX Resilience | [`client/src/utils/clientValidation.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/client/src/utils/clientValidation.js), [`server/src/middleware/validate.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/middleware/validate.js) | `npm run test:forms` |
| **Day 16** | Automated Testing & HTTP API Integration | [`server/src/test/unit/`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/test/unit/), [`server/src/test/integration/`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/test/integration/) | `npm run test:day16` |
| **Day 17** | Multi-Stage Docker Containerization & Compose Stack | [`client/Dockerfile`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/client/Dockerfile), [`server/Dockerfile`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/Dockerfile), [`docker-compose.yml`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/docker-compose.yml) | `npm run test:docker` |
| **Day 18** | MongoDB Aggregation Pipelines & Cohort Analytics | [`server/src/services/analyticsAggregationService.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/services/analyticsAggregationService.js) | `npm run test:aggregation` |
| **Day 19** | Production Deployment Hardening, CORS & Chunk Splitting | [`server/src/app.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/app.js), [`client/vite.config.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/client/vite.config.js) | `npm run test:production` |
| **Day 20** | Security Threat Modeling, Rate Limiting, Prompt Defenses | [`server/src/middleware/rateLimiter.js`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/server/src/middleware/rateLimiter.js) | `npm run test:security` |
| **Day 21** | Release Verification, Concept Evidence & Master Walkthrough | [`docs/CONCEPT_EVIDENCE.md`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/docs/CONCEPT_EVIDENCE.md), [`README.md`](file:///c:/Users/phani/OneDrive/Desktop/Tekmira%20AI/README.md) | Full Test Suite (100% Green) |

---

## 3. Mathematical & Algorithmic Rigor: Placement Readiness Index ($PRI$)

The platform strictly avoids arbitrary or hallucinated AI scoring. The Placement Readiness Index ($PRI$) is governed by an empirical mathematical formula combining weighted linear components with an asymptotic non-linear penalty for unsubstantiated claims:

$$PRI = \max\left(0, \min\left(100, \left( 0.40 \cdot S_{\text{match}} + 0.35 \cdot S_{\text{proof}} + 0.15 \cdot S_{\text{rigor}} + 0.10 \cdot S_{\text{quality}} \right) - P_{\text{inflation}} \right)\right)$$

### Sub-Score Formulations:
1. **Target Role Coverage ($S_{\text{match}}$):**
   $$S_{\text{match}} = \left( \frac{\sum_{i \in \text{Verified} \cap \text{Required}} W_i}{\sum_{j \in \text{Required}} W_j} \right) \times 100$$
2. **Code Proof Ratio ($S_{\text{proof}}$):**
   $$S_{\text{proof}} = \left( \frac{|\text{Verified}|}{|\text{Claimed}|} \right) \times 100$$
3. **Testing Rigor Index ($S_{\text{rigor}}$):**
   $$S_{\text{rigor}} = \begin{cases} 100 & \text{if dedicated test suites and frameworks detected} \\ 60 & \text{if test files present without standardized framework} \\ 0 & \text{if no test evidence present in repository} \end{cases}$$
4. **Inflation Penalty ($P_{\text{inflation}}$):**
   $$P_{\text{inflation}} = 12 \cdot \sqrt{|\text{Inflated Claims}|}$$

### Mathematical Floor Invariant:
$$\text{If } |\text{Verified}| = 0 \implies PRI = 0$$
*Even if an adversarial prompt injection attempts to force a 100% rating, the deterministic mathematical floor guarantees that a candidate without empirical code proof receives a 0 score.*

---

## 4. Architectural Decision Records (ADRs)

### ADR-01: Polyglot Persistence Architecture
- **Decision:** Use PostgreSQL for relational user authentication, RBAC, and academic credentials, combined with MongoDB for polymorphic skill triangulation reports and interview transcripts.
- **Rationale:** Candidate authentication requires ACID transactional integrity and relational foreign key constraints (`User` $\to$ `JobDescription`). In contrast, code evidence, commit snapshots, and Gemini JSON outputs have dynamic, polymorphic schemas best served by MongoDB document models.

### ADR-02: Magic-Byte Binary Verification
- **Decision:** Validate uploaded PDF files by inspecting the leading file buffer bytes (`0x25 0x50 0x44 0x46 0x2D` or `%PDF-`) and computing SHA-256 digests in memory.
- **Rationale:** Relying on client-reported MIME types or file extensions allows attackers to upload executable scripts disguised as `.pdf`. Inspecting magic bytes at the binary level prevents MIME-spoofing attacks.

### ADR-03: Zero Hallucination Prompt Isolation
- **Decision:** Wrap untrusted candidate strings in triple-quote delimiters (`"""`) under a dedicated `[INPUT DATA]` section with explicit anti-injection system prompt directives.
- **Rationale:** Prevents prompt injection attacks where candidates attempt to override the scoring model via hidden text in their resumes or commit logs.

---

## 5. Senior Assessor Viva Voce Defense Guide

### Q1: Why did you choose a dual-database architecture instead of storing everything in PostgreSQL or MongoDB?
> **Answer:** "We implemented polyglot persistence to align data storage with query access patterns. Candidate identity, credentials, roles, and institutional affiliations require strict relational integrity, ACID compliance, and foreign key enforcement—which PostgreSQL provides via Prisma. Conversely, skill analysis reports, AST language trees, and viva voce question-answer transcripts contain variable-length arrays and nested metadata. MongoDB document storage allows atomic schema evolution, indexing across nested fields, and complex aggregation pipelines without costly relational schema migrations."

### Q2: How does Tekmira AI prevent AI hallucinations when scoring candidates?
> **Answer:** "Tekmira AI implements a multi-layered verification architecture. First, Gemini API is constrained via OpenAPI/Zod structured schemas and strict system instructions enforcing a zero-hallucination policy. Second, and most importantly, scoring is NOT performed by the LLM. The LLM only parses and matches semantic claims. The final Placement Readiness Index is calculated deterministically in JavaScript using our weighted mathematical formula. If the candidate has zero code commits or language bytes in their GitHub snapshot, the formula floors the score to 0 regardless of what the LLM outputs."

### Q3: What is magic byte verification and where is it implemented?
> **Answer:** "Magic byte verification checks the unique binary signature at the start of a file stream to verify its true format, rather than trusting the user-controllable `Content-Type` header or file extension. In `server/src/middleware/uploadMiddleware.js`, we inspect `req.file.buffer.slice(0, 5)`. A valid PDF must begin with the ASCII characters `%PDF-` (`0x25 0x50 0x44 0x46 0x2D`). Any uploaded file lacking this header is rejected with HTTP 400 Bad Request before parsing."

### Q4: How does the application handle offline database failures in development and test environments?
> **Answer:** "All core services—including `AuthService`, `AnalyticsAggregationService`, `MatchingEngineService`, and `HealthService`—contain offline fallback synthesis. When `process.env.NODE_ENV === 'test'` or when local database sockets are unreachable, the services detect the offline state and execute in-memory equivalents. This guarantees that automated CI/CD pipelines, unit tests, and Supertest integration tests run with 100% determinism without requiring external Docker daemon spin-ups."

### Q5: How is rate limiting implemented and why is it necessary?
> **Answer:** "We developed a sliding-window rate limiter in `server/src/middleware/rateLimiter.js`. It tracks client requests per IP address using an in-memory counter with automatic periodic cleanup. We enforce strict limits on `/api/v1/auth/` (15 requests per 15 minutes) to prevent brute-force credential stuffing and dictionary attacks, and general limits on `/api/v1/` to protect our Google Gemini AI quota from resource exhaustion. Throttled requests receive HTTP 429 Too Many Requests along with a `Retry-After` header."

---

## 6. Full Test Suite Verification Matrix

All test suites have been verified with 100% pass rates:

```text
================================================================================
Test Suite Name                  Target Domain                Pass Rate   Status
================================================================================
testSkillNormalizationUnit.js    Frontend/Backend Skill Map    13/13      ✅ 100%
testPlacementReadinessIndexUnit  PRI Formula & Clamping         8/8       ✅ 100%
testStructuredSchemaParsingUnit  Zod & Structured Schemas       7/7       ✅ 100%
testSupertestApi.js              Full REST API Integration     19/19      ✅ 100%
testDockerConfig.js              Dockerfiles & Compose          7/7       ✅ 100%
testAggregationAnalytics.js      MongoDB Cohort Pipelines      10/10      ✅ 100%
testProductionReadiness.js       CORS, Chunks, Signal Traps     8/8       ✅ 100%
testSecurityAuditAndPromptInj.   Rate Limiter, RBAC, Sanitiz.   8/8       ✅ 100%
================================================================================
TOTAL AUTOMATED TEST VERIFICATION:                             80/80      ✅ 100%
================================================================================
```
