# Tekmira AI — Low-Level Design (LLD)

**Document Version:** 1.2.0  
**Project Name:** Tekmira AI  
**Tagline:** Beyond Claims. Driven by Evidence.  
**Description:** An AI-powered platform that evaluates resume-claimed skills against actual GitHub project evidence, identifies skill gaps, recommends suitable job opportunities, and helps users improve their job readiness.  
**Status:** Living Engineering Specifications  
**Scope:** Folder Structure, Component Responsibilities, API Specifications, Database Schemas & Service Methods  

---

## 1. Project Directory & File Structure

```text
tekmira-ai/
│
├── client/                             # Frontend Single Page Application (React 18 + Vite 6)
│   ├── .env                            # VITE_API_BASE_URL=http://localhost:5000/api
│   ├── .env.example                    # Environment variable template
│   ├── index.html                      # HTML entry template with Google Inter font
│   ├── package.json                    # Client dependencies (React, Vite, Tailwind, Axios, Lucide)
│   ├── postcss.config.js               # PostCSS processor configuration
│   ├── tailwind.config.js              # Custom theme: Navy primary, Coral accent
│   ├── vite.config.js                  # Vite dev server configuration (Port 5173)
│   └── src/
│       ├── App.jsx                     # Route registry (8 routes + wildcard redirect)
│       ├── main.jsx                    # React DOM entry point wrapped in BrowserRouter
│       ├── index.css                   # Tailwind directives & custom scrollbars
│       │
│       ├── components/                 # Reusable Presentational & Composite Components
│       │   ├── BackendStatusBadge.jsx  # Live API connection indicator (checking/connected/error)
│       │   ├── DashboardCard.jsx       # Metric & status card with coral accents
│       │   ├── Footer.jsx              # SaaS footer with architecture tags
│       │   ├── Navbar.jsx              # Responsive header with mobile drawer & API badge
│       │   ├── PageLayout.jsx          # Master wrapper (Navbar + Sidebar + Content + Footer)
│       │   └── Sidebar.jsx             # Pipeline navigation & active step badges
│       │
│       ├── pages/                      # Application Views
│       │   ├── HomePage.jsx            # Value proposition, 3-step workflow & hero
│       │   ├── LoginPage.jsx           # Sign-in form (Phase 2 preview notice)
│       │   ├── RegisterPage.jsx        # Student registration (Degree, Year, GitHub handle)
│       │   ├── DashboardPage.jsx       # 4 metric cards, verification pipeline tracker
│       │   ├── ResumeAnalysisPage.jsx  # PDF drag-and-drop zone & parsed claims categories
│       │   ├── GitHubAnalysisPage.jsx  # GitHub profile scanner & code proof monitor
│       │   ├── JobMatchPage.jsx        # Benchmark campus roles & custom JD textarea
│       │   └── AnalysisReportPage.jsx  # Triangulation evidence matrix & remediation roadmap
│       │
│       └── services/                   # Network & Gateway Services
│           ├── apiClient.js            # Axios client instance with response interceptors
│           └── healthService.js        # Service calling GET /api/health
│
├── server/                             # Backend REST API Engine (Node.js + Express ESM)
│   ├── .env                            # PORT=5000, NODE_ENV=development, CLIENT_URL
│   ├── .env.example                    # Environment variable template
│   ├── package.json                    # Server dependencies (Express, CORS, dotenv)
│   └── src/
│       ├── app.js                      # Express configuration, CORS, middleware, routes, error handlers
│       ├── server.js                   # Process entry point, port listener, graceful shutdown handlers
│       │
│       ├── config/
│       │   └── env.js                  # Validated environment variable loader
│       │
│       ├── controllers/
│       │   └── healthController.js     # HTTP request handler for /api/health
│       │
│       ├── middleware/
│       │   ├── errorHandler.js         # Centralized 4-argument error response formatter
│       │   └── notFoundHandler.js      # Catches unmatched routes and throws AppError(404)
│       │
│       ├── routes/
│       │   ├── healthRoutes.js         # Express Router binding GET /health
│       │   └── index.js                # Master /api router aggregator
│       │
│       ├── services/
│       │   └── healthService.js        # Pure business logic returning system health info
│       │
│       └── utils/
│           ├── ApiResponse.js          # Standard JSON response envelope helper
│           └── AppError.js             # Custom Error class with statusCode and operational flag
│
├── docs/                               # Engineering Documentation
│   ├── PRD.md                          # Product Requirements Document
│   ├── HLD.md                          # High-Level Design
│   ├── LLD.md                          # Low-Level Design (this file)
│   └── VIVA_PREP.md                    # Cumulative Viva Voce & Academic Defense Bank
│
├── PROJECT_RULES.md                    # Master operating rules & 7-question template
├── README.md                           # Quick start, installation & current implementation status
└── .gitignore                          # Excludes node_modules, .env, build outputs
```

---

## 2. Component Responsibilities (Implemented)

### 2.1 Design System UI Library (`client/src/components/common/`)
| Component | File Path | Props / Inputs | Responsibility |
| :--- | :--- | :--- | :--- |
| **`Button`** | `client/src/components/common/Button.jsx` | `variant` (primary, secondary, outline, ghost, coral), `size`, `loading`, `disabled`, `children` | Accessible, consistent button with keyboard focus and loading spinner. |
| **`Card`** | `client/src/components/common/Card.jsx` | `children`, subcomponents: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Modular card container for surfaces, metrics, and data sections. |
| **`Input`** | `client/src/components/common/Input.jsx` | `label`, `error`, `helperText`, `leftIcon`, `rightIcon`, standard HTML input props | Form input with state validation, clear label association, and error feedback. |
| **`Badge`** | `client/src/components/common/Badge.jsx` | `variant` (neutral, success, warning, coral, navy, outline), `size`, `children` | Status pills for categories, verification states, and role tags. |
| **`PageHeader`** | `client/src/components/common/PageHeader.jsx` | `title`, `description`, `breadcrumbs`, `actions` | Standard page header with title, subtitle, and contextual action buttons. |
| **`LoadingIndicator`** | `client/src/components/common/LoadingIndicator.jsx` | `size`, `text`, `centered` | Accessible ARIA-compliant loading spinner and feedback. |
| **`ErrorMessage`** | `client/src/components/common/ErrorMessage.jsx` | `title`, `message`, `onRetry` | Alert notification banner with retry callback action. |
| **`EmptyState`** | `client/src/components/common/EmptyState.jsx` | `icon`, `title`, `description`, `actionLabel`, `onAction` | Zero-data placeholder guiding candidate to upload or connect evidence. |

### 2.2 Shell & Navigation Components
| Component | File Path | Props / Inputs | Responsibility |
| :--- | :--- | :--- | :--- |
| **`MainLayout`** | `client/src/components/MainLayout.jsx` | `children`, `showSidebar` (default `true`) | Master application shell coordinating mobile sidebar drawer state, Top Navbar, and Footer. |
| **`PageLayout`** | `client/src/components/PageLayout.jsx` | Forwarding props to `MainLayout` | Backward-compatibility wrapper for pages specifying layouts. |
| **`Navbar`** | `client/src/components/Navbar.jsx` | `onToggleSidebar`, `isSidebarOpen` | Top navigation bar with branding, mobile drawer hamburger, profile menu dropdown, and `BackendStatusBadge`. |
| **`Sidebar`** | `client/src/components/Sidebar.jsx` | `isOpen`, `onClose` | Collapsible sidebar with 8 navigation links, quota tracker, and mobile overlay backdrop. |
| **`NavigationItem`** | `client/src/components/NavigationItem.jsx` | `to`, `label`, `icon`, `badge`, `badgeVariant`, `onClick` | NavLink wrapper applying active route highlights and triggering drawer close on mobile. |
| **`BackendStatusBadge`** | `client/src/components/BackendStatusBadge.jsx` | `compact` (boolean) | Reactive widget that triggers `checkBackendHealth()`, managing loading, connected, and error states. |

---

## 3. API Design: Implemented vs. Planned

### 3.1 Implemented API Endpoints (Operational)

#### `GET /api/health`
- **Controller:** `server/src/controllers/healthController.js`
- **Service:** `server/src/services/healthService.js`
- **HTTP Status:** `200 OK`
- **Response Payload:**
  ```json
  {
    "success": true,
    "message": "Tekmira AI backend is running"
  }
  ```

#### 404 Route Catch-All
- **Middleware:** `server/src/middleware/notFoundHandler.js`
- **HTTP Status:** `404 Not Found`
- **Response Payload:**
  ```json
  {
    "success": false,
    "message": "Resource not found at /api/<requested-route>",
    "stack": "... (included only in development mode) ..."
  }
  ```

---

### 3.2 Planned API Endpoints (Scheduled Modules)

| Method | Planned Endpoint | Module | Description | Expected Payload |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Module 4 | Student account creation | `{ email, password, fullName, githubUsername, degree, gradYear }` |
| `POST` | `/api/v1/auth/login` | Module 4 | User authentication | `{ email, password }` ➔ `{ token, user }` |
| `GET` | `/api/v1/auth/me` | Module 4 | Current user profile | Bearer JWT ➔ `{ user }` |
| `POST` | `/api/v1/resume/upload` | Module 5 | Upload & extract resume | `multipart/form-data` (PDF) ➔ `{ resumeId, skills, projects }` |
| `GET` | `/api/v1/github/scan/:username` | Module 6 | Mine public GitHub repositories | None ➔ `{ repos, languages, authenticCommits }` |
| `POST` | `/api/v1/jobs/match` | Module 7 | Ingest JD & normalize skills | `{ title, description }` ➔ `{ jobId, requiredSkills }` |
| `POST` | `/api/v1/analysis/triangulate` | Module 8 | Run 3-way triangulation | `{ resumeId, githubUsername, jobId }` ➔ Complete Report JSON |
| `GET` | `/api/v1/analysis/report/:id` | Module 8 | Fetch existing report | None ➔ Complete Report JSON |

---

## 4. Database Models & Schemas (PostgreSQL Implemented — Day 4)

### 4.1 PostgreSQL Relational Schema via Prisma (`server/prisma/schema.prisma`)
Implemented and generated via Prisma Client (`v6.19.3`):

```prisma
// server/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  RECRUITER
  ADMIN
}

enum ApplicationStatus {
  SAVED
  APPLIED
  INTERVIEWING
  OFFER
  REJECTED
}

model User {
  id           String           @id @default(uuid())
  email        String           @unique
  passwordHash String
  fullName     String
  githubHandle String?
  collegeName  String?
  graduationYr Int?
  role         Role             @default(STUDENT)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  savedJobs    SavedJob[]
  applications JobApplication[]

  @@map("users")
}

model JobDescription {
  id             String           @id @default(uuid())
  title          String
  company        String
  location       String?
  jobType        String?
  rawText        String           @db.Text
  requiredSkills String[]
  minExperience  Int              @default(0)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  savedBy        SavedJob[]
  applications   JobApplication[]

  @@map("job_descriptions")
}

model SavedJob {
  id        String         @id @default(uuid())
  userId    String
  jobId     String
  savedAt   DateTime       @default(now())

  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  job       JobDescription @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@unique([userId, jobId])
  @@map("saved_jobs")
}

model JobApplication {
  id          String            @id @default(uuid())
  userId      String
  jobId       String
  status      ApplicationStatus @default(SAVED)
  matchScore  Float?
  notes       String?           @db.Text
  appliedAt   DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  job         JobDescription    @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@map("job_applications")
}
```

### 4.2 Database Service Layer (`server/src/services/jobApplicationService.js`)
- **`getUserApplications(userId)`**: Relational query joining `job_applications` with `job_descriptions` (`INNER JOIN`).
- **`getUserSavedJobs(userId)`**: Relational query joining `saved_jobs` with `job_descriptions`.
- **`getJobWithApplicants(jobId)`**: Relational query joining `job_descriptions` with `job_applications` and candidate `users`.
- **`checkDatabaseHealth()`**: Safe connection ping (`SELECT 1`) that never exposes credentials or passwords in health responses.
    role VARCHAR(20) DEFAULT 'student', -- 'student', 'recruiter', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Target Job Descriptions Catalog
CREATE TABLE target_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) DEFAULT 'Campus Placement Benchmark',
    raw_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Standardized Skills Taxonomy (Synonym Mapper)
CREATE TABLE skills_taxonomy (
    id SERIAL PRIMARY KEY,
    canonical_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'frontend', 'backend', 'database', 'devops', 'ai'
    synonyms TEXT[] -- e.g. ARRAY['react', 'react.js', 'reactjs']
);
```

### 4.3 MongoDB Document Schemas via Mongoose (Implemented — Day 5)

Implemented and operational in `server/src/models/`:

#### 1. `ResumeDocument` (`server/src/models/ResumeDocument.js`)
- **Collection:** `resume_documents`
- **Fields:** `userId` (indexed UUID), `fileName`, `fileSize`, `mimeType`, `rawText`, `parserVersion`
- **Embedded Subdocuments:**
  - `extractedClaims.skills`: `[{ name, category, confidence, context }]`
  - `extractedClaims.projects`: `[{ title, description, technologies, repoUrl }]`
  - `extractedClaims.education`: `[{ degree, institution, graduationYear, score }]`
  - `extractedClaims.experienceYears`: `Number`

#### 2. `RepositorySnapshot` (`server/src/models/RepositorySnapshot.js`)
- **Collection:** `repository_snapshots`
- **Fields:** `userId`, `githubHandle`, `repoName`, `repoUrl`, `isFork`, `defaultBranch`, `stargazersCount`, `detectedDependencies`, `hasTestFiles`, `minedAt`
- **Composite Unique Index:** `@@index([userId, repoName], { unique: true })`
- **Embedded Subdocuments:**
  - `languages`: `[{ name, bytes, percentage }]`
  - `authenticCommits`: `[{ hash, message, committedAt, additions, deletions, verifiedAuthored }]`

#### 3. `SkillAnalysisReport` (`server/src/models/SkillAnalysisReport.js`)
- **Collection:** `skill_analysis_reports`
- **Fields:** `userId`, `jobId`, `resumeId` (ObjectId ref), `overallReadinessScore` (0-100), `status`, `summary`, `aiModelUsed`, `reportVersion`
- **Embedded Subdocuments:**
  - `triangulationMatrix`: `[{ skillName, isClaimedInResume, isDemonstratedInCode, isRequiredInJob, verificationStatus, evidence }]`
  - `remediationPlan`: `[{ skill, gapSeverity, recommendation, suggestedProject, suggestedResources }]`
  - `metrics`: `{ totalSkillsEvaluated, verifiedCount, inflatedCount, missingCriticalCount, unclaimedStrengthsCount }`

---

## 5. Service Responsibilities: Implemented vs. Planned

| Service Class / Module | File Path | Implementation Status | Scope & Responsibilities |
| :--- | :--- | :--- | :--- |
| **`HealthService`** | `server/src/services/healthService.js` | **IMPLEMENTED** | Returns system operational state, uptime, environment, and polyglot database connectivity metrics. |
| **`JobApplicationService`** | `server/src/services/jobApplicationService.js` | **IMPLEMENTED** | Relational queries joining PostgreSQL `users`, `job_descriptions`, and `job_applications` with raw SQL reference logic. |
| **`ResumeService`** | `server/src/services/resumeService.js` | **IMPLEMENTED** | CRUD operations for unstructured candidate resume records in MongoDB with candidate ownership checks. |
| **`RepositoryService`** | `server/src/services/repositoryService.js` | **IMPLEMENTED** | Upsert and retrieval operations for mined GitHub repository snapshots and authentic commit lists in MongoDB. |
| **`AnalysisReportService`** | `server/src/services/analysisReportService.js` | **IMPLEMENTED** | Stores, updates, and queries complete 3-way skill triangulation analysis reports in MongoDB. |
| **`AuthService`** | `server/src/services/authService.js` | *PLANNED (Day 6)* | Salted password hashing via `bcrypt`, credential verification, and JWT generation/validation. |
| **`GeminiTriangulationService`**| `server/src/services/triangulationService.js` | *PLANNED (Day 8)* | Orchestrating Gemini 1.5 Pro to synthesize resume claims against GitHub code evidence and target JD. |
