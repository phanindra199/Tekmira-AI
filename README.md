# Tekmira AI 🚀

> **Beyond Claims. Driven by Evidence.**  
> *A Production-Grade Campus Placement Readiness & Evidence Verification Platform*  
> **Release Target:** `v1.0.0` Production Capstone Release  
> **Repository:** [https://github.com/phanindra199/Tekmira-AI.git](https://github.com/phanindra199/Tekmira-AI.git)  

---

## 📖 Table of Contents

- [Overview & The Problem Solved](#-overview--the-problem-solved)
- [System Architecture & 3-Way Triangulation](#-system-architecture--3-way-triangulation)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development Setup](#local-development-setup)
  - [Docker Containerized Stack](#docker-containerized-stack)
- [Automated Verification & Testing (80/80 Passing)](#-automated-verification--testing)
- [Security Architecture & Threat Modeling](#-security-architecture--threat-modeling)
- [Documentation Index](#-documentation-index)
- [License](#-license)

---

## 🎯 Overview & The Problem Solved

College campus recruitment faces a systemic crisis: **resume inflation, keyword packing, and unverified skill claims**. Students routinely copy framework buzzwords into resumes without hands-on coding competence, while recruiters spend thousands of engineering hours conducting redundant technical screens on candidates with superficial knowledge.

**Tekmira AI** solves this by triangulating three independent data vectors into an objective, explainable **Placement Readiness Index ($PRI$)**:
1. **Self-Reported Claims:** Mined directly from uploaded PDF resumes using binary stream extraction and semantic entity parsing.
2. **Empirical Code Proof:** Mined from the candidate's public GitHub repositories (language byte distributions, dependencies, commit histories, and AST patterns).
3. **Target Job Requirements:** Extracted from target job descriptions (JDs) and university benchmark competency maps.

---

## 🏛️ System Architecture & 3-Way Triangulation

```text
+-----------------------+     +------------------------+     +-----------------------+
|  Candidate PDF Resume |     | GitHub Repository Code |     | Target Job Descriptor |
| (Claims & Credentials)|     | (Commits & AST Proof)  |     | (Benchmark Comp Map)  |
+-----------+-----------+     +-----------+------------+     +-----------+-----------+
            |                             |                              |
            v                             v                              v
    [ Stream Parser ]             [ Evidence Miner ]             [ Role Analyzer ]
    (Magic Bytes & SHA)           (Languages & Deps)             (Required Skills)
            \                             |                             /
             \                            |                            /
              +------------------->[ MATCHING ENGINE ]<---------------+
                                   (Triangulation Matrix)
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
         [ Placement Readiness Index ]            [ Grounded Viva Voce Prep ]
         - Formula Clamped [0, 100]               - File Citation Questions
         - 4-Tier Competency Breakdown            - 3-Way Rubric Scoring
         - High/Med/Low Remediation               - Real-Time Practice UI
```

### The Placement Readiness Index ($PRI$) Formula

$$PRI = \max\left(0, \min\left(100, \left( 0.40 \cdot S_{\text{match}} + 0.35 \cdot S_{\text{proof}} + 0.15 \cdot S_{\text{rigor}} + 0.10 \cdot S_{\text{quality}} \right) - P_{\text{inflation}} \right)\right)$$

- **Deterministic Mathematical Floor:** If verified code proof count is zero ($|\text{Verified}| = 0$), $PRI$ strictly equals $0$, neutralizing prompt injection and keyword stuffing.

---

## ✨ Key Features

- **Binary PDF Ingestion:** Rejects spoofed files via magic byte inspection (`%PDF-`), calculates SHA-256 cryptographic content digests, and extracts text streams without temporary disk storage.
- **Deep GitHub Evidence Mining:** Analyzes language byte ratios, authentic commit velocity, package manifest dependencies, and automated test suite existence.
- **Triangulation Matrix:** Categorizes every competency into `VERIFIED`, `INFLATED_CLAIM`, `UNCLAIMED_STRENGTH`, or `MISSING_CRITICAL`.
- **AI Technical Viva Voce:** Generates grounded interview questions with code citations, evaluates student answers using an objective rubric, and provides targeted remediation plans.
- **MongoDB Aggregation Analytics:** `$facet`, `$unwind`, and `$bucket` pipelines providing real-time cohort skill distribution, deficit reporting, and longitudinal candidate PRI growth trajectories.
- **Hardened Security & Rate Limiting:** Sliding-window rate limiter (HTTP 429), strict CORS origin whitelisting, role-based access control (RBAC), and sanitization of password hashes.
- **Docker Multi-Stage Deployability:** Nginx-powered Alpine SPA client, non-root Node 22 backend container, PostgreSQL 16, and MongoDB 7 orchestrated with health checks.

---

## 💻 Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, React Router v6, Axios, Lucide Icons | Responsive SPA, controlled forms, sub-second HMR |
| **Backend** | Node.js 22 (LTS), Express 4 (ES Modules), Zod, Multer, pdf-parse | High-throughput REST API engine & validation |
| **Relational DB** | PostgreSQL 16, Prisma ORM | Relational users, candidate profiles, and RBAC |
| **Document DB** | MongoDB 7, Mongoose ODM | Evidence snapshots, triangulation matrices, viva sessions |
| **AI / NLP** | Google Gemini AI (`@google/genai`) | Structured output extraction & grounded viva generation |
| **Security** | JWT (HS256), Bcrypt (10 rounds), Sliding Rate Limiter | Authentication, password digest, DoS prevention |
| **DevOps** | Docker, Docker Compose, Nginx Alpine, Multi-Stage Builds | Multi-container production deployment |

---

## 📁 Project Directory Structure

```text
Tekmira-AI/
├── client/                     # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI shells, Navbar, Sidebar, Badge
│   │   ├── pages/              # 8 Application Views (Dashboard, Viva, Reports)
│   │   ├── services/           # Axios API client & error mapping
│   │   └── utils/              # Client-side form validators & sanitizers
│   ├── nginx.conf              # Production Nginx SPA & reverse proxy config
│   ├── Dockerfile              # Multi-stage production build (Node -> Nginx)
│   └── vite.config.js          # Vendor chunk splitting & build optimization
├── server/                     # Node.js + Express REST API Engine
│   ├── prisma/                 # Prisma ORM schema & migrations
│   ├── src/
│   │   ├── config/             # Environment, Prisma, & MongoDB connectors
│   │   ├── controllers/        # REST controllers (Auth, Analysis, Viva, Analytics)
│   │   ├── middleware/         # Auth JWT, Zod validate, Rate limiter, Error
│   │   ├── models/             # Mongoose schemas (Reports, Viva, Snapshots)
│   │   ├── prompts/            # Standardized anti-injection prompt templates
│   │   ├── routes/             # Versioned REST endpoints (/api/v1/...)
│   │   ├── services/           # Gemini, GitHub, Matching, PDF, Aggregation
│   │   ├── test/               # 8 Automated Unit, API, & Security Test Suites
│   │   │   ├── unit/           # Unit tests (Skills, PRI, Schemas)
│   │   │   └── integration/    # HTTP integration tests
│   │   └── validations/        # Zod input schemas & structured outputs
│   ├── Dockerfile              # Multi-stage Node 22 Alpine non-root runner
│   └── package.json            # Scripts & dependencies
├── docs/                       # Comprehensive Architecture & Capstone Notes
│   ├── PRD.md                  # Product Requirements Document
│   ├── HLD.md                  # High-Level Architecture Design
│   ├── LLD.md                  # Low-Level Component Design
│   ├── CONCEPT_EVIDENCE.md     # 21-Day Syllabus Assessor Traceability Map
│   ├── Tekmira_AI_Master_Notes.html        # Week 1 Master Notes
│   └── Tekmira_AI_Week_2_Master_Notes.html # Week 2 Master Notes
├── docker-compose.yml          # Multi-container stack (Postgres, Mongo, API, Client)
└── .env.docker.example         # Container stack environment variables
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** v20.x or v22.x LTS
- **npm:** v10.x+
- **Git**

### Local Development Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/phanindra199/Tekmira-AI.git
   cd Tekmira-AI
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Populate GEMINI_API_KEY in .env
   npm run dev
   ```
   *Backend runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).*

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   *Frontend runs on `http://localhost:5173`.*

### Docker Containerized Stack

Deploy the entire production stack (PostgreSQL, MongoDB, Backend API, Nginx Client) with a single command:

```bash
# 1. Copy environment template
cp .env.docker.example .env

# 2. Launch multi-container stack in background
docker compose up -d --build

# 3. View live container logs
docker compose logs -f

# 4. Access Application:
# - Frontend SPA: http://localhost:3000
# - Backend API:  http://localhost:5000/api/health
```

---

## 🧪 Automated Verification & Testing

Tekmira AI includes **80 comprehensive automated tests** across 8 specialized suites covering business logic, schema parsing, HTTP APIs, container configurations, aggregation pipelines, and adversarial prompt injection defenses:

| Test Suite File | Domain Tested | Tests | Pass Rate | Status |
| :--- | :--- | :---: | :---: | :---: |
| `testSkillNormalizationUnit.js` | Frontend/Backend skill aliasing & edge cases | 13 | 13/13 | ✅ 100% |
| `testPlacementReadinessIndexUnit.js` | PRI mathematical clamping & tier bounds | 8 | 8/8 | ✅ 100% |
| `testStructuredSchemaParsingUnit.js` | Zod schema parsing & rubric evaluation bounds | 7 | 7/7 | ✅ 100% |
| `testSupertestApi.js` | Full HTTP REST request/response integration | 19 | 19/19 | ✅ 100% |
| `testDockerConfig.js` | Dockerfile stages, non-root user, compose | 7 | 7/7 | ✅ 100% |
| `testAggregationAnalytics.js` | MongoDB aggregation pipelines & schema indexes | 10 | 10/10 | ✅ 100% |
| `testProductionReadiness.js` | CORS whitelisting, chunk splitting, signals | 8 | 8/8 | ✅ 100% |
| `testSecurityAuditAndPromptInjection.js` | Rate limiting (429), anti-injection, RBAC | 8 | 8/8 | ✅ 100% |
| **TOTAL VERIFIED TEST SUITE** | **Full System Verification** | **80** | **80/80** | **✅ 100%** |

### Running the Test Suites

```bash
# Run unit tests
npm --prefix server run test:unit

# Run HTTP API integration tests
npm --prefix server run test:api

# Run Docker configuration verification
npm --prefix server run test:docker

# Run MongoDB aggregation analytics tests
npm --prefix server run test:aggregation

# Run production readiness tests
npm --prefix server run test:production

# Run security audit & prompt injection tests
npm --prefix server run test:security
```

---

## 🔒 Security Architecture & Threat Modeling

- **Zero Secret Leakage:** Authentication controllers strictly execute `AuthService.sanitizeUser()`, ensuring `passwordHash` digests are never leaked in HTTP payloads.
- **Brute-Force Defense:** Sliding-window rate limiting throttles requests on sensitive authentication endpoints, issuing HTTP 429 with `Retry-After` headers.
- **Magic-Byte Binary Protection:** Resumes are inspected at the raw byte level for `%PDF-` signatures before execution, preventing executable file upload vulnerabilities.
- **Adversarial Prompt Defense:** All candidate-supplied strings are isolated inside triple-quote boundary blocks (`"""`) accompanied by explicit system instructions directing the model to ignore scoring override commands.
- **Deterministic Math Invariant:** A candidate with zero empirical code evidence is mathematically floored to a PRI of $0$, completely eliminating hallucinated pass ratings.

---

## 📚 Documentation Index

- [PRD — Product Requirements Document](file:///docs/PRD.md)
- [HLD — High-Level Architecture Design](file:///docs/HLD.md)
- [LLD — Low-Level Component Design](file:///docs/LLD.md)
- [CONCEPT_EVIDENCE.md — Academic Assessor Traceability Map](file:///docs/CONCEPT_EVIDENCE.md)
- [Week 1 Master Architecture Notes (HTML)](file:///docs/Tekmira_AI_Master_Notes.html)
- [Week 2 Master Architecture Notes (HTML)](file:///docs/Tekmira_AI_Week_2_Master_Notes.html)
- [Viva Voce Technical Defense Guide](file:///docs/VIVA_PREP.md)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
