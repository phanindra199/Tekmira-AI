# Tekmira AI — Project Charter & Development Rules

---

## 1. Project Overview

**Project Name:** Tekmira AI  
**Tagline:** Beyond Claims. Driven by Evidence.  
**Description:** An AI-powered platform that evaluates resume-claimed skills against actual GitHub project evidence, identifies skill gaps, recommends suitable job opportunities, and helps users improve their job readiness.

The platform solves the resume inflation and skill-mismatch problem in campus recruitment by triangulating three independent data sources:
1. **Claimed Skills:** Extracted from the student's resume (PDF/Docx).
2. **Demonstrated Evidence:** Verified by mining public GitHub repositories, commit history, language distributions, and actual code implementations.
3. **Target Job Requirements:** Extracted from target job descriptions (JDs) and industry benchmark competency maps.

The system generates an **explainable skill analysis**, **evidence-backed match score**, and an **actionable placement readiness roadmap** for the student.

---

## 2. Student & Project Constraints

- **Developer Profile:** 3rd-Year B.Tech Computer Science Student.
- **Background Level:** Beginner-to-intermediate across modern full-stack development, distributed databases, and generative AI APIs.
- **Available Time:** 21 Days (8 hours/day = 168 working hours).
- **Primary Objectives:**
  - Build a production-grade, working capstone/portfolio project.
  - Understand the deep architectural and conceptual "why" behind every line of code.
  - Prepare for college project reviews, external viva voce, and technical placement interviews.

---

## 3. Technology Stack Specification

| Tier | Technology | Purpose & Architectural Justification |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) + Tailwind CSS | Fast HMR, component-driven UI, modern responsive design for dashboards and report visualization. |
| **Backend** | Node.js + Express (ES Modules) | High-concurrency I/O engine, native JavaScript ecosystem, asynchronous API calls to GitHub and Gemini. |
| **AI Engine** | Google Gemini API | Structured output extraction, code understanding, semantic skill matching, and explainable report synthesis. |
| **Relational Database** | PostgreSQL | ACID-compliant storage for users, authentication, target job postings, standardized skill taxonomies, and audit logs. |
| **Document Database** | MongoDB | High-flexibility storage for polymorphic resume ASTs, raw GitHub commit/repo metadata trees, and full AI report payloads. |
| **Authentication** | JWT (JSON Web Tokens) + bcrypt | Stateless authentication with securely salted password hashing and role/access control. |
| **Automated Testing** | Jest + Supertest | Unit testing for business logic/scoring algorithms and integration testing for Express REST API endpoints. |
| **DevOps & Infra** | Docker & Docker Compose | Containerized local environment ensuring reproducible services across PostgreSQL, MongoDB, backend, and frontend. |

---

## 4. The 12 Cardinal Development Rules

1. **Incremental Delivery:** Never build the entire application at once. Develop feature-by-feature, module-by-module.
2. **Single-Module Focus:** Work on exactly one development module at a time. Do not advance until the current module meets its acceptance criteria.
3. **Concept First:** Always explain the computer science and architectural concepts before writing or modifying any implementation code.
4. **File Inspection:** Always inspect existing files and understand system context before applying any modifications.
5. **Preserve Working State:** Never delete, refactor, or break working functionality without explicit permission and a clear rollback plan.
6. **Modular Architecture:** Adhere to clean architecture principles: separation of concerns (Controllers, Services, Repositories/Models, Middleware, Utilities).
7. **Zero Hardcoded Secrets:** Never hardcode secrets, database URIs, or API keys. Always use `.env` files managed via strict environment validation schemas.
8. **Semantic HTTP Standards:** Always use proper HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) and accurate HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `422`, `500`).
9. **Robust Error Handling:** Implement centralized server-side error handling, input validation middleware, and safe, informative error responses (no stack trace leakage in production).
10. **Mandatory Verification:** Test every feature manually and with automated test cases before marking it complete.
11. **Production-Grade Data Only:** Never use fake or dummy mock data for production functionality. Mocking is restricted strictly to automated unit tests.
12. **Living Documentation:** Keep the Product Requirement Document (PRD), High-Level Design (HLD), Low-Level Design (LLD), and API documentation continuously synchronized with the codebase.

---

## 5. Mandatory Module Explanation Framework (The 7-Question Template)

For **every single development module and feature**, the senior developer/teacher MUST structure the lesson and handover using the following format:

1. **What problem are we solving?**  
   *The business requirement, user friction, or technical bottleneck.*
2. **What concept are we implementing?**  
   *Underlying CS concepts (e.g., Lexical parsing, AST extraction, Vector similarity, ACID transactions vs Document stores, JWT lifecycle).*
3. **Why are we using this technology?**  
   *Engineering trade-offs and rationale for selecting this specific library, database, or API.*
4. **Which files are involved?**  
   *Exact file paths, directory structure changes, and responsibility of each file.*
5. **How does the code work?**  
   *Walkthrough of the execution flow, key functions, input/output contracts, and edge-case handling.*
6. **How can I test it?**  
   *Step-by-step reproduction instructions: curl/Postman commands, browser checks, and automated Jest test execution.*
7. **What questions can be asked in my viva?**  
   *Anticipated viva voce, academic defense, and technical interview questions, complete with high-scoring answers.*

---

## 6. Documentation Standards

The project root must maintain and synchronize:
- `PROJECT_RULES.md`: Core rules, stack definition, and operating contracts (this file).
- `docs/PRD.md`: Product Requirements Document (features, user personas, acceptance criteria).
- `docs/HLD.md`: High-Level Design (system architecture, data flow diagrams, external API boundaries).
- `docs/LLD.md`: Low-Level Design (database schemas, ER diagrams, REST API endpoints, class/service structures).
- `docs/VIVA_PREP.md`: Cumulative viva preparation bank updated after every module.

---

## 7. Development Roadmap Overview (21 Days / 168 Hours)

- **Phase 1: Foundations & Architecture (Days 1–3)**  
  Requirements refinement, PRD/HLD/LLD, Dual-Database Docker orchestration, Express scaffold with ES Modules & centralized error handling.
- **Phase 2: Authentication & User Profiles (Days 4–5)**  
  PostgreSQL schema, bcrypt hashing, JWT auth, input validation, role separation (Student / Recruiter / Admin).
- **Phase 3: Resume Ingestion & Parsing (Days 6–8)**  
  Multipart file upload, PDF text extraction, Gemini-driven structured skill & project extraction, MongoDB storage.
- **Phase 4: GitHub Evidence Engine (Days 9–12)**  
  GitHub REST/GraphQL integration, repository inspection, language & commit analytics, AST/code-snippet evidence extraction.
- **Phase 5: Job Description & Competency Matching (Days 13–15)**  
  JD ingestion, skill standardization, Gemini-assisted triangulation algorithm (Resume vs GitHub vs JD), scoring matrix.
- **Phase 6: Explainable Report & Analytics Engine (Days 16–17)**  
  Generation of explainable skill gap reports, confidence scores, and learning roadmaps; API delivery.
- **Phase 7: Frontend Application & Dashboards (Days 18–19)**  
  React + Vite + Tailwind setup, student upload & report dashboard, radar charts, evidence inspector UI.
- **Phase 8: End-to-End Testing, Dockerization & Viva Polish (Days 20–21)**  
  Integration test suite with Supertest, complete Docker Compose deployment, final documentation sync, and mock viva drill.
