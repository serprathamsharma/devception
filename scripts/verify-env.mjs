#!/usr/bin/env node
/**
 * scripts/verify-env.mjs
 * Devception Environment & Dependency Diagnostic Checker
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${BOLD}${BLUE}╔════════════════════════════════════════════════════════╗${RESET}`);
console.log(`${BOLD}${BLUE}║        Devception System & Environment Checker         ║${RESET}`);
console.log(`${BOLD}${BLUE}╚════════════════════════════════════════════════════════╝${RESET}\n`);

let issues = 0;

// 1. Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.replace(/^v/, '').split('.')[0], 10);
if (majorVersion >= 20) {
  console.log(`  ${GREEN}✔${RESET} Node.js runtime: ${BOLD}${nodeVersion}${RESET} (Supported >= v20.0.0)`);
} else {
  console.log(`  ${RED}✖${RESET} Node.js runtime: ${BOLD}${nodeVersion}${RESET} (Requires >= v20.0.0)`);
  issues++;
}

// 2. Check Docker availability
try {
  const dockerVersion = execSync('docker --version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
  console.log(`  ${GREEN}✔${RESET} Docker engine: ${BOLD}${dockerVersion}${RESET}`);
} catch {
  console.log(`  ${YELLOW}⚠${RESET} Docker engine not detected (Required for docker compose up)`);
}

// 3. Check Workspace Directories
const clientPath = resolve(process.cwd(), 'devception-client');
const serverPath = resolve(process.cwd(), 'devception-server');

if (existsSync(clientPath)) {
  console.log(`  ${GREEN}✔${RESET} Frontend workspace: ${BOLD}devception-client${RESET} found`);
} else {
  console.log(`  ${RED}✖${RESET} Frontend workspace: ${BOLD}devception-client${RESET} missing`);
  issues++;
}

if (existsSync(serverPath)) {
  console.log(`  ${GREEN}✔${RESET} Backend workspace: ${BOLD}devception-server${RESET} found`);
} else {
  console.log(`  ${RED}✖${RESET} Backend workspace: ${BOLD}devception-server${RESET} missing`);
  issues++;
}

// 4. Check Template configurations
if (existsSync(resolve(process.cwd(), '.env.example'))) {
  console.log(`  ${GREEN}✔${RESET} Configuration template: ${BOLD}.env.example${RESET} ready`);
} else {
  console.log(`  ${YELLOW}⚠${RESET} Root .env.example not found`);
}

console.log('\n──────────────────────────────────────────────────────────');
if (issues === 0) {
  console.log(`${GREEN}${BOLD}All core system checks passed! Ready for local development.${RESET}\n`);
} else {
  console.log(`${RED}${BOLD}Found ${issues} issue(s) that should be addressed before running.${RESET}\n`);
}
