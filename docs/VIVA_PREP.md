# Tekmira AI — Viva Voce & Technical Defense Guide

This document is your dedicated academic question bank and technical defense cheat sheet for college project reviews, external viva voce, and technical placement interviews.

---

## 1. Core Architecture & Philosophy

### Q: Why did you build Tekmira AI? What is the core problem?
**Answer:** In technical campus placements, recruiters are overwhelmed with resumes claiming proficiencies in complex technologies (e.g. Docker, GraphQL, Kubernetes, Redis) that students often only read about or cloned from tutorials. At the same time, students receive no objective feedback on whether their actual GitHub code meets hiring benchmarks. Tekmira AI eliminates resume inflation and provides explainable placement readiness by triangulating three independent data sources:
1. **Self-Reported Claims:** Extracted from the student's resume.
2. **Empirical Evidence:** Mined from the student's public GitHub commit history and code ASTs.
3. **Objective Benchmarks:** Extracted from real target Job Descriptions (JDs).

---

### Q: Why 3-Way Triangulation? Why can't you just pass the resume into ChatGPT or Gemini?
**Answer:** A Large Language Model (LLM) analyzing only a resume can only evaluate *what the candidate claims*, not *what the candidate actually built*. This results in:
1. **Resume Inflation:** Candidates who write buzzwords score higher than candidates with strong code but modest resumes.
2. **Hallucination:** An LLM evaluating an ungrounded resume must guess whether claims are true.
By grounding the analysis with empirical GitHub code evidence and comparing both against a target JD, our system achieves deterministic, evidence-backed verification with clickable proof links.

---

## 2. Frontend & System Design Concepts

### Q: What is the Virtual DOM and how does React use it?
**Answer:** The Virtual DOM is an in-memory tree representation of the actual DOM elements. When state changes in a React component:
1. React generates a new Virtual DOM tree.
2. It executes a diffing algorithm (Reconciliation) to compare the new tree with the previous snapshot.
3. It computes the minimal set of changes (patches) and batches them to update the real DOM.
This prevents expensive browser recalculations (reflow and repaint cycles).

---

### Q: Why did you decouple the project into separate `client/` and `server/` folders instead of a monolithic Express template engine (like EJS)?
**Answer:** Decoupling adheres to the **Separation of Concerns** principle:
- **Scalability:** The client compiles into static assets that can be distributed globally across CDNs (like Cloudflare or Vercel) with near-zero latency.
- **Portability:** The backend remains a purely stateless RESTful API, allowing us to build mobile apps or CLI tools in the future without modifying backend business logic.
- **Security:** It prevents server-side secrets, database credentials, and internal modules from leaking into client browser bundles.

---

### Q: Why use Vite instead of Create React App (CRA)?
**Answer:** CRA relies on Webpack, which bundles the entire application before starting the development server. As the app grows, cold start times and rebuild times become slow. Vite uses **native browser ES Modules (ESM)** and pre-bundles third-party dependencies using `esbuild` (written in Go, which is 10–100x faster than JavaScript-based bundlers). Vite only processes source files when requested by the browser, resulting in instant startup and sub-second Hot Module Replacement (HMR).

---

## 3. Scoring & Algorithm Formulation

### Q: How is the Placement Readiness Index calculated?
**Answer:** The index ($R$) is evaluated on a $0$ to $100$ scale using a weighted formula:
$$R = 0.40 \times S_{\text{match}} + 0.35 \times E_{\text{code}} + 0.15 \times D_{\text{recency}} + 0.10 \times T_{\text{testing}}$$
- $S_{\text{match}}$ (40%): Percentage of mandatory skills from the target JD present in the student's profile.
- $E_{\text{code}}$ (35%): Ratio of claimed skills verified through authentic GitHub code implementations.
- $D_{\text{recency}}$ (15%): Recency factor weighting code committed in the last 12 months.
- $T_{\text{testing}}$ (10%): Engineering hygiene bonus for test suites (Jest, JUnit, PyTest).


---

## 4. Backend & Express Architecture Concepts

### Q: Why do you separate `app.js` from `server.js`?
**Answer:** Separating application configuration from network listening is a critical software design pattern:
- **`app.js`**: Configures middleware, body parsers, routes, and error handlers. It exports the Express `app` instance without binding to a network port. This enables automated integration testing tools (like Supertest) to test endpoints in-memory without starting a live HTTP server or causing port collisions.
- **`server.js`**: The process entry point. It imports `app`, binds to a physical network port using `app.listen()`, connects to databases, and manages OS process termination signals (`SIGTERM`, `SIGINT`).

---

### Q: What is the architectural difference between Routes, Controllers, and Services?
**Answer:** We follow the **Layered Architecture (Separation of Concerns)** pattern:
- **Routes (`src/routes/`):** Act as the URL map. They define HTTP methods and paths (e.g. `router.get('/health', getHealth)`) and attach route-specific middleware (auth, rate limits, validators). Routes do not contain business logic.
- **Controllers (`src/controllers/`):** Act as HTTP traffic directors. They extract parameters (`req.params`, `req.query`, `req.body`), validate inputs, call the appropriate Service layer functions, and dispatch standard HTTP responses with proper status codes (`res.status(200).json(...)`).
- **Services (`src/services/`):** The pure business logic layer. They perform calculations, communicate with databases (PostgreSQL/MongoDB), and invoke external APIs (Gemini, GitHub). Services have zero knowledge of HTTP request/response objects, making them 100% reusable and easily unit-testable.

---

### Q: What is Express Middleware and how does the `next()` function work?
**Answer:** Middleware functions are functions that have access to the Request object (`req`), the Response object (`res`), and the next middleware function in the application’s request-response cycle (`next`).
- When a request arrives, it travels through a sequential pipeline of middleware (e.g., `cors()`, `express.json()`, authentication).
- If the current middleware does not terminate the cycle by sending a response (`res.send`), it **must** call `next()` to pass control to the subsequent middleware.
- If an argument is passed to `next(err)`, Express skips all remaining standard middleware and jumps directly to the **Error-Handling Middleware** (`(err, req, res, next)`).

---

### Q: What is CORS and why is it necessary?
**Answer:** **CORS (Cross-Origin Resource Sharing)** is a browser security mechanism based on the **Same-Origin Policy (SOP)**. By default, browsers block web applications on one origin (e.g. `http://localhost:5173` - our Vite client) from making AJAX/Fetch requests to a different origin (e.g. `http://localhost:5000` - our Express API). The `cors` package configures HTTP response headers (like `Access-Control-Allow-Origin: http://localhost:5173`), instructing the browser that our frontend is authorized to communicate with our API.


---

## 5. Full-Stack Communication & Client-Server Networking

### Q: How do the React frontend and Express backend communicate in our architecture?
**Answer:** They communicate asynchronously over the **HTTP protocol using RESTful JSON standards**:
1. **User Action / Lifecycle Hook:** A React component (e.g., `<BackendStatusBadge />` via `useEffect`) triggers an API call.
2. **Axios Client Request:** Axios sends an asynchronous HTTP `GET` request to `http://localhost:5000/api/health` with `Content-Type: application/json`.
3. **CORS Validation:** The Express backend receives the preflight and GET request, checks the `Origin: http://localhost:5173` header against its allowed origins, and attaches `Access-Control-Allow-Origin: http://localhost:5173`.
4. **Express Routing & Controller:** Express matches the route `/api/health` and executes `getHealth(req, res, next)`.
5. **JSON Serialization:** The controller returns a serialized JSON payload `{ success: true, message: "..." }` with status code `200 OK`.
6. **State Mutation & DOM Update:** Axios unwraps the response data, React updates its component state via `setStatus('connected')`, and the Virtual DOM renders the live green badge without reloading the page.

---

### Q: Why do we use Axios instead of native browser `fetch()`?
**Answer:** While native `fetch` is built into modern browsers, Axios provides significant enterprise advantages:
- **Automatic JSON Transformation:** `fetch` requires two manual steps (`const res = await fetch(...); const data = await res.json()`), whereas Axios automatically transforms JSON response bodies.
- **HTTP Error Handling:** Native `fetch` does not reject promises on HTTP error status codes (e.g. 404, 500); it only rejects on network loss. Axios automatically treats 4xx and 5xx responses as errors, routing them into `.catch()` or `try/catch`.
- **Interceptors:** Axios provides global request and response interceptors. We use them to automatically attach JWT authorization tokens to every outbound request and centralize error logging in one single file (`apiClient.js`).
- **Configurable Timeouts:** Axios supports explicit request timeouts (e.g. `timeout: 15000`), terminating dead network calls automatically.

---

### Q: Why do environment variables in Vite require the `VITE_` prefix?
**Answer:** For **security against accidental credential leakage**. By default, Vite prevents server secrets (like database passwords or private API keys) from accidentally leaking into the client-side JavaScript bundle downloaded by user browsers. Only environment variables explicitly prefixed with `VITE_` (e.g. `VITE_API_BASE_URL`) are embedded into the client code during build time and made accessible through `import.meta.env`.
