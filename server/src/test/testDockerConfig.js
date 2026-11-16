/**
 * Tekmira AI — Docker Containerization Verification Suite (Day 17)
 * 
 * Statically and structurally validates:
 * 1. Multi-stage client Dockerfile (Vite build + Nginx Alpine runner)
 * 2. Multi-stage server Dockerfile (Node 22 Alpine + Prisma binary generator + non-root user)
 * 3. Nginx reverse proxy configuration & SPA routing fallback
 * 4. Docker compose orchestration, health checks, dependency ordering, and persistent volumes
 * 5. Docker ignore boundaries protecting credentials and build artifacts
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

console.log('🧪 Starting Tekmira AI Docker Containerization Tests (Day 17)...\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

// ==========================================
// 1. Client Dockerfile & Nginx Structure
// ==========================================
console.log('--- 1. Client Dockerfile & Nginx Structure ---');

const clientDockerPath = path.join(rootDir, 'client', 'Dockerfile');
const clientNginxPath = path.join(rootDir, 'client', 'nginx.conf');
const clientIgnorePath = path.join(rootDir, 'client', '.dockerignore');

runTest('client/Dockerfile exists and has multi-stage build targets', () => {
  assert.ok(fs.existsSync(clientDockerPath), 'client/Dockerfile must exist');
  const content = fs.readFileSync(clientDockerPath, 'utf-8');
  assert.ok(content.includes('FROM node:22-alpine AS builder'), 'Must use node:22-alpine builder stage');
  assert.ok(content.includes('FROM nginx:alpine AS runner'), 'Must use nginx:alpine runner stage');
  assert.ok(content.includes('COPY --from=builder /app/dist /usr/share/nginx/html'), 'Must copy dist from builder');
  assert.ok(content.includes('EXPOSE 80'), 'Must expose port 80');
  assert.ok(content.includes('HEALTHCHECK'), 'Must define container healthcheck');
});

runTest('client/nginx.conf specifies SPA routing and reverse proxy to backend', () => {
  assert.ok(fs.existsSync(clientNginxPath), 'client/nginx.conf must exist');
  const content = fs.readFileSync(clientNginxPath, 'utf-8');
  assert.ok(content.includes('try_files $uri $uri/ /index.html;'), 'Must have SPA fallback routing');
  assert.ok(content.includes('proxy_pass http://backend:5000/api/;'), 'Must reverse proxy /api/ to backend:5000');
  assert.ok(content.includes('gzip on;'), 'Must enable gzip compression');
  assert.ok(content.includes('X-Frame-Options'), 'Must enforce security headers');
});

runTest('client/.dockerignore excludes node_modules, dist, and local .env files', () => {
  assert.ok(fs.existsSync(clientIgnorePath), 'client/.dockerignore must exist');
  const content = fs.readFileSync(clientIgnorePath, 'utf-8');
  assert.ok(content.includes('node_modules'), 'Must exclude node_modules');
  assert.ok(content.includes('dist'), 'Must exclude dist');
  assert.ok(content.includes('.env'), 'Must exclude .env');
});

// ==========================================
// 2. Server Dockerfile & Security Posture
// ==========================================
console.log('\n--- 2. Server Dockerfile & Security Posture ---');

const serverDockerPath = path.join(rootDir, 'server', 'Dockerfile');
const serverIgnorePath = path.join(rootDir, 'server', '.dockerignore');

runTest('server/Dockerfile exists with Prisma generator and non-root execution', () => {
  assert.ok(fs.existsSync(serverDockerPath), 'server/Dockerfile must exist');
  const content = fs.readFileSync(serverDockerPath, 'utf-8');
  assert.ok(content.includes('FROM node:22-alpine AS deps'), 'Must use multi-stage deps builder');
  assert.ok(content.includes('prisma generate'), 'Must pre-generate Prisma ORM client');
  assert.ok(content.includes('USER node'), 'Must execute as non-root user node for least privilege');
  assert.ok(content.includes('dumb-init'), 'Must use dumb-init for PID 1 signal forwarding');
  assert.ok(content.includes('HEALTHCHECK'), 'Must declare backend health check');
  assert.ok(content.includes('EXPOSE 5000'), 'Must expose port 5000');
});

runTest('server/.dockerignore excludes node_modules, logs, and sensitive credentials', () => {
  assert.ok(fs.existsSync(serverIgnorePath), 'server/.dockerignore must exist');
  const content = fs.readFileSync(serverIgnorePath, 'utf-8');
  assert.ok(content.includes('node_modules'), 'Must exclude node_modules');
  assert.ok(content.includes('.env'), 'Must exclude .env secrets');
  assert.ok(content.includes('*.log'), 'Must exclude runtime log files');
});

// ==========================================
// 3. Docker Compose Multi-Service Architecture
// ==========================================
console.log('\n--- 3. Docker Compose Multi-Service Architecture ---');

const composePath = path.join(rootDir, 'docker-compose.yml');
const dockerEnvPath = path.join(rootDir, '.env.docker.example');

runTest('docker-compose.yml defines all 4 required microservices with health checks', () => {
  assert.ok(fs.existsSync(composePath), 'docker-compose.yml must exist');
  const content = fs.readFileSync(composePath, 'utf-8');
  
  // Services
  assert.ok(content.includes('postgres:'), 'Must declare postgres service');
  assert.ok(content.includes('mongodb:'), 'Must declare mongodb service');
  assert.ok(content.includes('backend:'), 'Must declare backend service');
  assert.ok(content.includes('frontend:'), 'Must declare frontend service');

  // Healthcheck condition ordering
  assert.ok(content.includes('condition: service_healthy'), 'Must enforce service_healthy startup ordering');

  // Volumes & Networks
  assert.ok(content.includes('volumes:'), 'Must declare named volumes');
  assert.ok(content.includes('pgdata:'), 'Must persist PostgreSQL data in named volume');
  assert.ok(content.includes('mongodata:'), 'Must persist MongoDB data in named volume');
  assert.ok(content.includes('tekmira-network:'), 'Must interconnect services on isolated bridge network');
});

runTest('.env.docker.example documents containerized environment variables', () => {
  assert.ok(fs.existsSync(dockerEnvPath), '.env.docker.example must exist');
  const content = fs.readFileSync(dockerEnvPath, 'utf-8');
  assert.ok(content.includes('POSTGRES_DB'), 'Must declare POSTGRES_DB');
  assert.ok(content.includes('POSTGRES_USER'), 'Must declare POSTGRES_USER');
  assert.ok(content.includes('MONGO_INITDB_DATABASE'), 'Must declare MONGO_INITDB_DATABASE');
  assert.ok(content.includes('GEMINI_API_KEY'), 'Must declare GEMINI_API_KEY placeholder');
});

// ==========================================
// Summary
// ==========================================
console.log('\n===============================================');
console.log(`📊 Docker Configuration Summary: ${passedTests}/${totalTests} passed`);
console.log('===============================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
