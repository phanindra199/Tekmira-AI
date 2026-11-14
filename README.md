# Tekmira AI 🚀

> **Beyond Claims. Driven by Evidence.**

Tekmira AI is an AI-powered platform that evaluates resume-claimed skills against actual GitHub project evidence, identifies skill gaps, recommends suitable job opportunities, and helps users improve their job readiness.

The platform solves the resume inflation and skill-mismatch problem in college campus recruitment by triangulating three independent data sources:
1. **Self-Reported Claims:** Extracted from the student's resume.
2. **Empirical Evidence:** Mined from the student's public GitHub repositories, commit logs, and code implementations.
3. **Target Job Requirements:** Extracted from target job descriptions (JDs) and industry benchmark competency maps.

The system produces an **explainable skill analysis**, an **evidence-backed match score ($0-100$)**, and an **actionable placement readiness roadmap**.

---

## 🏗️ Technology Stack

| Layer | Technologies Currently Implemented | Technologies Planned in Roadmap |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, React Router v6, Axios, Lucide Icons | Chart.js / Recharts (for radar graphs) |
| **Backend** | Node.js (v22), Express 4 (ES Modules), CORS, dotenv | Multer, pdf-parse, Supertest |
| **Databases** | *None connected yet* | PostgreSQL (Relational) + MongoDB (Documents) |
| **AI Engine** | *None connected yet* | Google Gemini API (Structured Schema Extraction) |
| **Security & Auth** | *None connected yet* | JWT (JSON Web Tokens), bcrypt |
| **DevOps** | Native environment configs (`.env`) | Docker & Docker Compose |

---

## 📊 Current Implementation Status

> **Important:** To ensure modular engineering and academic integrity, features are delivered incrementally. Below is the exact status of each module:

| Module / Layer | Component / Feature | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | React + Vite Single Page Application | ✅ **LIVE** | Sub-second HMR running on port `5173`. |
| **Frontend** | Responsive Design System (Tailwind CSS) | ✅ **LIVE** | Navy primary (`#0A142F`), white canvas, coral accent. |
| **Frontend** | 8 Application Views | ✅ **LIVE** | Home, Dashboard, Resume, GitHub, Job Match, Report, Login, Register. |
| **Frontend** | Reusable Component Shell | ✅ **LIVE** | Navbar, Sidebar, Footer, DashboardCard, PageLayout. |
| **Frontend** | Reusable Axios API Gateway | ✅ **LIVE** | Environment-driven `apiClient.js` with interceptors. |
| **Frontend** | Live Backend Status Badge | ✅ **LIVE** | Reactive status widget displayed in Navbar & Sidebar. |
| **Backend** | Express REST API Scaffold | ✅ **LIVE** | Native ES Modules on port `5000`. |
| **Backend** | Health Check Endpoint | ✅ **LIVE** | `GET /api/health` returning operational status. |
| **Backend** | Centralized Error & 404 Handlers | ✅ **LIVE** | `AppError` class, uniform error JSON envelopes. |
| **Cross-Origin** | CORS Gateway | ✅ **LIVE** | Whitelisted communication between port 5173 and 5000. |
| **Database** | PostgreSQL & MongoDB | ⏳ *PLANNED* | Scheduled for Module 4 (Docker Compose). |
| **Auth** | JWT + bcrypt Authentication | ⏳ *PLANNED* | Scheduled for Module 4. |
| **Parser** | PDF Resume Parsing (`pdf-parse`) | ⏳ *PLANNED* | Scheduled for Module 5. |
| **Miner** | GitHub Commit & AST Mining | ⏳ *PLANNED* | Scheduled for Module 6. |
| **AI Engine** | Google Gemini API Triangulation | ⏳ *PLANNED* | Scheduled for Module 7. |

---

## 📁 Repository Structure

```text
tekmira-ai/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/         # Reusable UI components & BackendStatusBadge
│   │   ├── pages/              # 8 Application Views
│   │   ├── services/           # Axios apiClient & healthService
│   │   ├── App.jsx             # React Router v6 registry
│   │   └── main.jsx            # Entry point wrapped in BrowserRouter
│   └── package.json
│
├── server/                     # Backend Application (Node.js + Express REST API)
│   ├── src/
│   │   ├── config/             # Environment variable loader
│   │   ├── controllers/        # HTTP request dispatchers
│   │   ├── middleware/         # Central error handler & 404 handler
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Pure business logic layer
│   │   ├── utils/              # AppError & ApiResponse helpers
│   │   ├── app.js              # Express app configuration & middleware
│   │   └── server.js           # Server listener & process signal manager
│   └── package.json
│
├── docs/                       # Living Specifications & Academic Guides
│   ├── PRD.md                  # Product Requirements Document
│   ├── HLD.md                  # High-Level Design & System Architecture
│   ├── LLD.md                  # Low-Level Design & Schemas
│   └── VIVA_PREP.md            # Cumulative Viva Voce Question Bank
│
├── PROJECT_RULES.md            # 12 Master Development Rules & 7-Question Template
└── README.md                   # Project overview & quickstart (this file)
```

---

## 🚦 Installation & Local Setup

### Prerequisites
- **Node.js:** `v20.x` or `v22.x` (verified on `v22.14.0`)
- **npm:** `v10.x` or higher
- **Git:** Installed and configured

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Tekmira AI"
```

### 2. Configure Environment Files
Both client and server include `.env.example` templates. Ensure your local `.env` files are configured:

**In `server/.env`:**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**In `client/.env`:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 💻 Development Commands

### Running the Backend Server
```bash
cd server
npm install
npm run dev
```
The Express API will boot at `http://localhost:5000` with native file watching (`node --watch`).

### Running the Frontend Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
The React development server will start at `http://localhost:5173`.

### Verifying the Connection
1. Open `http://localhost:5173/dashboard` in your browser.
2. Observe the green **`API Online`** badge in the Navbar and Sidebar.
3. Test the backend directly:
```bash
curl http://localhost:5000/api/health
# Response: {"success": true, "message": "Tekmira AI backend is running"}
```

---

## 📚 Living Documentation Links

- 📋 [Product Requirements Document (PRD)](file:///docs/PRD.md)
- 🏛️ [High-Level Design (HLD)](file:///docs/HLD.md)
- 📐 [Low-Level Design (LLD)](file:///docs/LLD.md)
- 🎓 [Viva Voce & Technical Defense Guide](file:///docs/VIVA_PREP.md)
- ⚖️ [Project Rules & Development Charter](file:///PROJECT_RULES.md)
