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

---

## 6. React Component Architecture, Hooks & Design System (Day 2)

### Q: Why does React favor Component Composition over Class Inheritance?
**Answer:** In React, UI is built by composing smaller, single-responsibility components together rather than creating deep inheritance hierarchies:
- **Flexibility:** A `<Card>` can host any arbitrary content via `{children}` or subcomponents (`CardHeader`, `CardTitle`, `CardContent`), rather than creating specialized subclasses like `DashboardMetricCard extends BaseCard`.
- **Reusability:** Small atomic components (`Button`, `Badge`, `Input`) can be assembled in various configurations without altering their internal logic.
- **Maintainability:** Refactoring an individual component does not break distant child classes, preventing fragile base class problems.

---

### Q: Explain `useState`, `useEffect`, and the purpose of the dependency array and cleanup function.
**Answer:**
1. **`useState`:** Declares a state variable that React tracks between renders. When updated via its setter function (`setState`), React schedules a re-render of the component and updates the DOM where state changed.
2. **`useEffect`:** Performs side effects in functional components (e.g., API requests, subscriptions, DOM listeners, timers). It runs after the render is committed to screen.
3. **Dependency Array (`[]`):** Controls when the effect executes:
   - *Omitted:* Runs after every single render.
   - *Empty array `[]`:* Runs exactly once after the initial mount (equivalent to `componentDidMount`).
   - *Array with values `[dep1, dep2]`:* Runs on mount and re-runs only if any dependency value changes between renders.
4. **Cleanup Function (`return () => { ... }`):** Returned by the effect callback. React executes it right before the component unmounts and before re-running the effect on dependency change. This prevents memory leaks, dangling network requests (using `AbortController`), or outdated state updates on unmounted components.

---

### Q: What is Client-Side Routing (React Router) vs Traditional Server-Side Routing?
**Answer:**
- **Traditional Server-Side Routing:** When the user clicks an `<a>` link, the browser makes a new HTTP GET request to the web server, which generates and returns a complete HTML document. The browser screen flashes blank, discards all in-memory JavaScript state, and re-parses all CSS and scripts.
- **Client-Side Routing (Single Page Application):** React Router intercepts link clicks via HTML5 History API (`pushState` / `replaceState`). It updates the URL in the browser address bar without sending a network request to the server, and conditionally mounts/unmounts React components in the DOM. This provides instantaneous page transitions and preserves global state across routes.

---

### Q: Why use Tailwind CSS utility classes instead of traditional CSS files or CSS-in-JS?
**Answer:**
- **No Style Clashes & Scoped Boundaries:** Utility classes are atomic and local. Editing an element never accidentally breaks styling on other unrelated pages.
- **Minimal Production Bundle Size:** Tailwind's Purge/JIT engine scans source files and extracts only the exact utility classes used, generating a minified CSS bundle (~29 kB for Tekmira AI) regardless of how large the application becomes.
- **Design System Consistency:** Colors (`#10223D`, `#FF806F`), spacing, typography, and breakpoints are centralized in `tailwind.config.js`, ensuring design consistency across all developer contributions.

---

## 7. JavaScript Core Foundations & Async Networking (Day 3)

### 7.1 JavaScript Hoisting
- **Simple Explanation:** Hoisting is JavaScript's default behavior of moving variable and function declarations to the top of their containing scope during the memory compilation phase before any code is executed.
- **Key Difference:**
  - `var` declarations are hoisted and initialized to `undefined`.
  - `let` and `const` declarations are hoisted into a **Temporal Dead Zone (TDZ)** and cannot be accessed before their declaration line (throwing a `ReferenceError`).
  - Function declarations (`function verify() {}`) are hoisted with their entire definition, meaning they can be called before they appear in code.
  - Function expressions (`const verify = () => {}`) are hoisted like variables (`const`), remaining uninitialized in TDZ.
- **Tiny Example:**
  ```javascript
  console.log(score); // undefined (var hoisted)
  var score = 85;

  console.log(candidate); // ReferenceError: Cannot access 'candidate' before initialization
  const candidate = "Alex";
  ```
- **Where it appears in Tekmira AI:** In our ES Module architecture (`server/src/app.js` and `client/src/services/apiClient.js`), we strictly use `const` and `let` to prevent accidental `undefined` leaks and enforce predictable initialization orders.
- **Viva Voce Question:** *"Why does `let` throw a ReferenceError when accessed before declaration if it is hoisted?"*
  - **Answer:** *"Because ECMAScript places `let` and `const` variables into the Temporal Dead Zone (TDZ) from the start of the block until the evaluation reaches the declaration statement. Accessing them inside TDZ is prohibited to prevent hidden bugs caused by accessing uninitialized state."*
- **Practice Exercise:** Predict the output:
  ```javascript
  function check() {
    console.log(a);
    var a = 10;
    console.log(a);
  }
  // Output: undefined, then 10
  ```

---

### 7.2 JavaScript Closures
- **Simple Explanation:** A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). In simple terms: an inner function always retains access to the variables of its outer function even after the outer function has finished executing and returned.
- **Tiny Example:**
  ```javascript
  function createCounter(initial) {
    let count = initial; // private variable enclosed
    return function increment() {
      count += 1;
      return count;
    };
  }
  const counter = createCounter(0);
  console.log(counter()); // 1
  console.log(counter()); // 2
  ```
- **Where it appears in Tekmira AI:**
  1. **Debounced Search:** On the dashboard skills tab (`setSkillSearch`), a closure retains the active timer ID across keystrokes.
  2. **Interceptors:** Axios request interceptors enclose the active token getter without exposing credentials to the global `window` scope.
- **Viva Voce Question:** *"How do closures enable data encapsulation in JavaScript without using classes?"*
  - **Answer:** *"Variables declared inside an outer factory function are not accessible from the global scope. By returning inner methods that reference those variables, those variables remain private to the closure, creating secure encapsulated state."*
- **Practice Exercise:** Implement a rate-limiter closure that allows a function to run only once every `N` milliseconds.

---

### 7.3 The JavaScript Event Loop, Call Stack & Queues
- **Simple Explanation:** JavaScript is single-threaded; it can only execute one command at a time on its **Call Stack**. To handle long-running operations (such as HTTP requests or file I/O) without freezing the UI, the runtime uses the **Event Loop**.
- **Execution Order:**
  1. **Call Stack:** Executes synchronous code line by line.
  2. **Web APIs / Node APIs:** Handles background timers (`setTimeout`), network calls (`fetch`/`axios`), and file I/O.
  3. **Microtask Queue (High Priority):** Holds Promise callbacks (`.then()`, `await` continuations, `queueMicrotask`). Processed *immediately* after the call stack empties and before any Macrotask.
  4. **Macrotask Queue (Low Priority):** Holds `setTimeout`, `setInterval`, `setImmediate`, and I/O events.
- **Tiny Example:**
  ```javascript
  console.log('1: Sync');
  setTimeout(() => console.log('2: Macrotask (Timeout)'), 0);
  Promise.resolve().then(() => console.log('3: Microtask (Promise)'));
  console.log('4: Sync');
  // Output: 1, 4, 3, 2
  ```
- **Where it appears in Tekmira AI:** When `checkBackendHealth()` fires in `<BackendStatusBadge />`, Axios sends the HTTP request through browser Web APIs. React continues rendering the "Connecting..." UI synchronously. When the backend responds, the Axios promise resolution runs as a Microtask, updating React state without lagging UI interactions.
- **Viva Voce Question:** *"Between a resolved Promise `.then()` callback and a `setTimeout(fn, 0)`, which runs first and why?"*
  - **Answer:** *"The Promise callback runs first because it enters the Microtask Queue. The Event Loop prioritizes and exhausts all microtasks before picking the next task from the Macrotask Queue."*

---

### 7.4 Promises versus Callbacks
- **Simple Explanation:**
  - **Callback:** A function passed as an argument into another function to be invoked when an asynchronous operation finishes. When multiple async operations depend on each other, callbacks lead to deeply nested, unmaintainable code known as **Callback Hell** or the "Pyramid of Doom", and suffer from **Inversion of Control** (you trust a third party to call your callback correctly).
  - **Promise:** An object representing the eventual completion (or failure) of an asynchronous operation and its resulting value. A Promise exists in one of three mutually exclusive states:
    1. `Pending`: Initial state, neither fulfilled nor rejected.
    2. `Fulfilled`: Operation completed successfully (`resolve(data)`).
    3. `Rejected`: Operation failed (`reject(error)`).
- **Tiny Example:**
  ```javascript
  // Callback approach:
  getUser(userId, (err, user) => {
    if (err) return handleError(err);
    getRepos(user.github, (err, repos) => { ... });
  });

  // Promise approach:
  getUser(userId)
    .then(user => getRepos(user.github))
    .then(repos => console.log(repos))
    .catch(err => handleError(err));
  ```
- **Where it appears in Tekmira AI:** Every API endpoint service (`apiClient.js`, `healthService.js`) returns standard Promises, allowing components to consume data using either chained `.then()` or `async/await`.
- **Viva Voce Question:** *"What is 'Inversion of Control' in the context of callbacks, and how do Promises solve it?"*
  - **Answer:** *"With callbacks, we pass our execution logic into a third-party function and have no control over whether, when, or how many times it will be executed. Promises invert this control back to our code: a Promise guarantees it will resolve or reject at most once, and its resolution is immutable and verifiable."*

---

### 7.5 Async/Await, Error Handling & Concurrency
- **Simple Explanation:** `async/await` is modern syntactic sugar built on top of JavaScript Promises. It allows asynchronous, non-blocking code to be written and read sequentially like synchronous code, using standard `try/catch` blocks for clean error handling.
- **Concurrency: Sequential vs Parallel (`Promise.all`):**
  - **Sequential (Slow):**
    ```javascript
    const resume = await parseResume(); // takes 2s
    const repos = await fetchRepos();   // takes 3s
    // Total time = 5 seconds
    ```
  - **Parallel with `Promise.all` (Fast):**
    ```javascript
    const [resume, repos] = await Promise.all([
      parseResume(),
      fetchRepos()
    ]);
    // Total time = max(2s, 3s) = 3 seconds
    ```
- **Where it appears in Tekmira AI:**
  1. In `server/src/controllers/healthController.js` and `client/src/services/healthService.js`.
  2. In the candidate verification pipeline (Phase 2), where resume claims extraction and GitHub repository metadata mining run concurrently using `Promise.all` to cut report generation latency in half.
  3. Safe request cancellation with `AbortController` in `DashboardPage.jsx` and `BackendStatusBadge.jsx`.
- **Viva Voce Question:** *"What happens if one Promise in `Promise.all()` rejects? What alternative can you use if you want all independent operations to settle regardless of failures?"*
  - **Answer:** *"If any promise in `Promise.all()` rejects, the entire `Promise.all()` immediately rejects (Fail-Fast behavior). If we want all operations to complete regardless of individual errors, we use `Promise.allSettled()`, which returns an array of objects detailing the status (`fulfilled` or `rejected`) and value/reason for each promise."*

