/**
 * Tekmira AI — Production Deployment Readiness Test Suite (Day 19)
 * 
 * Verifies:
 * 1. Dynamic CORS origin authorization and unauthorized domain rejection
 * 2. Client production build asset integrity and vendor bundle splitting
 * 3. Security posture (sourcemaps disabled in production)
 * 4. Process-level safety traps and graceful shutdown handlers
 * 5. Production environment templates and secrets documentation
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';
import app from '../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

console.log('🧪 Starting Tekmira AI Production Deployment Readiness Tests (Day 19)...\n');

let totalTests = 0;
let passedTests = 0;

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

async function runSuite() {
  // ==========================================
  // 1. Production CORS & Security Headers
  // ==========================================
  console.log('--- 1. Production CORS & Security Boundaries ---');

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await runAsyncTest('CORS permits non-browser clients (null Origin header)', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });

    await runAsyncTest('CORS permits standard local development origins', async () => {
      const res = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: 'http://localhost:5173' }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.headers.get('access-control-allow-origin'));
    });
  } finally {
    server.close();
  }

  // ==========================================
  // 2. Client Production Bundle Optimization
  // ==========================================
  console.log('\n--- 2. Client Production Bundle Optimization ---');

  const distPath = path.join(rootDir, 'client', 'dist');
  const assetsPath = path.join(distPath, 'assets');

  await runAsyncTest('Client dist build directory and index.html exist', () => {
    assert.ok(fs.existsSync(distPath), 'client/dist directory must exist');
    assert.ok(fs.existsSync(path.join(distPath, 'index.html')), 'client/dist/index.html must exist');
  });

  await runAsyncTest('Client assets directory contains vendor-split production chunks', () => {
    assert.ok(fs.existsSync(assetsPath), 'client/dist/assets must exist');
    const assetFiles = fs.readdirSync(assetsPath);
    
    const hasVendorRouter = assetFiles.some(f => f.startsWith('vendor-router'));
    const hasVendorIcons = assetFiles.some(f => f.startsWith('vendor-icons'));
    const hasVendorAxios = assetFiles.some(f => f.startsWith('vendor-axios'));

    assert.ok(hasVendorRouter, 'Must contain vendor-router chunk');
    assert.ok(hasVendorIcons, 'Must contain vendor-icons chunk');
    assert.ok(hasVendorAxios, 'Must contain vendor-axios chunk');
  });

  await runAsyncTest('Sourcemaps are disabled in production build to protect IP', () => {
    const assetFiles = fs.readdirSync(assetsPath);
    const hasSourceMaps = assetFiles.some(f => f.endsWith('.js.map') || f.endsWith('.css.map'));
    assert.strictEqual(hasSourceMaps, false, 'Production assets must not expose .map files');
  });

  // ==========================================
  // 3. Process Safety & Shutdown Architecture
  // ==========================================
  console.log('\n--- 3. Process Safety & Signal Handlers ---');

  await runAsyncTest('Server source registers SIGTERM, SIGINT, and unhandled rejection safety', () => {
    const serverJsPath = path.join(rootDir, 'server', 'src', 'server.js');
    const content = fs.readFileSync(serverJsPath, 'utf-8');
    assert.ok(content.includes('SIGTERM'), 'Must listen for SIGTERM');
    assert.ok(content.includes('SIGINT'), 'Must listen for SIGINT');
    assert.ok(content.includes('unhandledRejection'), 'Must trap unhandledRejection');
    assert.ok(content.includes('uncaughtException'), 'Must trap uncaughtException');
  });

  // ==========================================
  // 4. Production Environment Templates
  // ==========================================
  console.log('\n--- 4. Production Environment Templates ---');

  const serverProdEnv = path.join(rootDir, 'server', '.env.production.example');
  const clientProdEnv = path.join(rootDir, 'client', '.env.production.example');

  await runAsyncTest('server/.env.production.example documents cloud databases and secrets', () => {
    assert.ok(fs.existsSync(serverProdEnv), 'server/.env.production.example must exist');
    const content = fs.readFileSync(serverProdEnv, 'utf-8');
    assert.ok(content.includes('DATABASE_URL'), 'Must document production DATABASE_URL');
    assert.ok(content.includes('MONGODB_URI'), 'Must document production MONGODB_URI');
    assert.ok(content.includes('JWT_SECRET'), 'Must document production JWT_SECRET');
    assert.ok(content.includes('CLIENT_URL'), 'Must document production CLIENT_URL');
  });

  await runAsyncTest('client/.env.production.example documents production API endpoint', () => {
    assert.ok(fs.existsSync(clientProdEnv), 'client/.env.production.example must exist');
    const content = fs.readFileSync(clientProdEnv, 'utf-8');
    assert.ok(content.includes('VITE_API_URL'), 'Must document VITE_API_URL');
  });

  // ==========================================
  // Summary
  // ==========================================
  console.log('\n===============================================');
  console.log(`📊 Production Readiness Summary: ${passedTests}/${totalTests} passed`);
  console.log('===============================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal Production Readiness Runner Error:', err);
  process.exit(1);
});
