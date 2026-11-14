# Tekmira AI — Product Requirements Document (PRD)

**Document Version:** 1.2.0  
**Project Name:** Tekmira AI  
**Tagline:** Beyond Claims. Driven by Evidence.  
**Description:** An AI-powered platform that evaluates resume-claimed skills against actual GitHub project evidence, identifies skill gaps, recommends suitable job opportunities, and helps users improve their job readiness.  
**Author:** Senior Full-Stack Engineering Team & Student Developer  
**Status:** Living Specification  

---

## 1. Problem Statement

In engineering campus placements and junior tech hiring, recruiters and students face a significant trust and transparency bottleneck:

1. **Resume Inflation & Exaggeration:** Due to competitive pressures, student resumes often list technologies (e.g., Docker, Kubernetes, Redis, GraphQL) that candidates have never written production code for or merely copied from tutorial repositories.
2. **Recruiter Verification Burden:** Technical recruiters and placement cell coordinators lack the time to manually audit every student's GitHub repositories, inspect commit histories, or verify whether code was genuinely authored by the candidate.
3. **Student Blind Spots:** Students lack objective, evidence-based feedback on whether their actual GitHub projects satisfy the real-world technical requirements of their target company job descriptions.
4. **Black-Box AI Evaluation:** Existing resume screening algorithms use opaque scoring metrics that fail to explain *why* a candidate was rejected or *what specific evidence* was lacking.

---

## 2. Target Users & Personas

### Persona A: The Engineering Student (Primary End-User)
- **Profile:** 3rd or 4th-year B.Tech / B.E. Computer Science student preparing for upcoming on-campus or off-campus technical placement drives.
- **Pain Points:** 
  - Unsure if their resume accurately reflects their coding skills.
  - Unaware of specific skill gaps relative to target job descriptions.
  - Wants verifiable proof to stand out during technical interviews.
- **Goal:** Receive an evidence-backed placement readiness index and an actionable study roadmap with code citations.

### Persona B: Campus Placement Officer & Technical Recruiter (Secondary User)
- **Profile:** College placement cell coordinators or corporate technical recruiters screening early-career software engineering candidates.
- **Pain Points:** 
  - Overwhelmed by identical resumes with buzzword stuffing.
  - Inability to quickly distinguish authentic developers from tutorial copiers.
- **Goal:** Access a one-click explainable report that links claimed skills directly to authentic GitHub commit diffs and code snippets.

---

## 3. Proposed Solution

**Tekmira AI** provides a transparent, explainable skill verification platform through **Three-Way Triangulation**:

```
                  ┌────────────────────────┐
                  │ 1. Resume Claims       │
                  │ (Extracted via NLP)    │
                  └───────────┬────────────┘
                              │
                              ▼
┌────────────────────────┐         ┌────────────────────────┐
│ 2. GitHub Evidence     │◄───────►│ 3. Target Job (JD)     │
│ (Mined Commits & ASTs) │         │ (Benchmark Competency) │
└────────────────────────┴─────────┴────────────────────────┘
                              │
                              ▼
               ┌─────────────────────────────┐
               │ Explainable Readiness Report│
               │ Score + Evidence Citations  │
               └─────────────────────────────┘
```

1. **Ingest Resume:** Parse claimed technical proficiencies and listed project descriptions.
2. **Mine GitHub Code Proof:** Scan public repositories for authentic commits, language distribution, dependency files, and code usage.
3. **Align with Job Description:** Normalize required competencies against standard industry taxonomies.
4. **Synthesize Explainable Report:** Produce a deterministic score ($0-100$) and an explainable matrix citing specific repositories, commit counts, and file snippets.

---

## 4. Main Features Breakdown

### 4.1 Implemented Features (Operational)
- [x] **Decoupled SPA Architecture:** High-performance React 18 frontend powered by Vite 6 and Tailwind CSS.
- [x] **Client-Side Routing Suite:** 8 fully registered views (`/`, `/login`, `/register`, `/dashboard`, `/resume-analysis`, `/github-analysis`, `/job-match`, `/analysis-report`).
- [x] **Composite Layout System:** Reusable `Navbar`, `Sidebar`, `Footer`, `DashboardCard`, and `PageLayout` components.
- [x] **Express REST API Scaffold:** Modular Node.js backend using native ES Modules, CORS configuration, and environment loaders.
- [x] **Centralized Error & 404 Pipeline:** Custom `AppError` class and 4-argument error middleware with environment-aware stack traces.
- [x] **Real-Time API Health Monitor:** Asynchronous Axios gateway connecting frontend status badges to backend `GET /api/health`.

### 4.2 Planned Features (Scheduled in 21-Day Roadmap)
- [ ] **Phase 2: Authentication & User Accounts:** JWT (JSON Web Tokens), salted `bcrypt` password hashing, and user profile management.
- [ ] **Phase 3: PDF Resume Extraction:** Text extraction from PDF uploads using `pdf-parse` and structured claim extraction via Google Gemini API.
- [ ] **Phase 4: GitHub Code Mining Engine:** Integration with GitHub REST/GraphQL API to analyze commit trees, author verification, and dependency files.
- [ ] **Phase 5: Job Description Competency Mapper:** Skill taxonomy normalization and keyword extraction from target job descriptions.
- [ ] **Phase 6: Gemini Triangulation & Scoring:** Automated three-way cross-verification algorithm and explainable report synthesis.
- [ ] **Phase 7: Database Persistence:** Dual-database implementation (PostgreSQL for users/jobs + MongoDB for resume ASTs/reports).
- [ ] **Phase 8: Docker Containerization:** Multi-container orchestration via Docker Compose.

---

## 5. Functional Requirements (FRs)

| Requirement ID | Module | Description | Implementation Status |
| :--- | :--- | :--- | :--- |
| **FR-01** | Frontend | Responsive SaaS interface with Navy/White/Coral design system and 8 navigation routes. | **IMPLEMENTED** |
| **FR-02** | Gateway | Asynchronous Axios client with base URL configuration, request/response interceptors, and error handling. | **IMPLEMENTED** |
| **FR-03** | Backend | Express REST API on port 5000 with CORS, JSON body parsing, and `GET /api/health`. | **IMPLEMENTED** |
| **FR-04** | Backend | Centralized error-handling middleware preventing unhandled crashes and returning proper HTTP status codes. | **IMPLEMENTED** |
| **FR-05** | Auth | User registration, login, and protected routes using JWT and bcrypt. | *PLANNED (Module 4)* |
| **FR-06** | Database | Dual-database persistence using PostgreSQL (Relational) and MongoDB (Documents). | *PLANNED (Module 4)* |
| **FR-07** | Resume | Multipart file upload and text extraction for student PDF resumes. | *PLANNED (Module 5)* |
| **FR-08** | GitHub | Mining public GitHub repositories, verifying author commits, and inspecting dependencies. | *PLANNED (Module 6)* |
| **FR-09** | AI Engine | Google Gemini API integration for structured JSON schema extraction and triangulation logic. | *PLANNED (Module 7)* |
| **FR-10** | Reporting | Explainable Placement Readiness Index calculation and actionable remediation roadmap generation. | *PLANNED (Module 8)* |

---

## 6. Non-Functional Requirements (NFRs)

- **Explainability:** Zero opaque scores. Every readiness deduction or verification mark must cite a specific resume claim, GitHub commit/file, or JD requirement.
- **Zero Fake Data:** The application will never use mocked or fabricated AI analysis in production functionality. Unimplemented features must display clear pending states.
- **Performance:** Frontend initial page load time under 1.5 seconds. Backend health check response latency under 20 milliseconds.
- **Security:** Strict separation of environment secrets via `.env`. Zero transmission or storage of GitHub personal access tokens.
- **Maintainability:** Modular, layered code structure adhering strictly to the Controller-Service-Repository pattern.
