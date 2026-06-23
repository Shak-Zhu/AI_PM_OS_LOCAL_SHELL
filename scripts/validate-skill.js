/**
 * AI PM OS Local Shell - Root Repository QA Wrapper
 *
 * This file is a thin repository-level QA wrapper.
 * The authoritative validation implementation lives at:
 *   ai-pm-os/scripts/validate-skill.js
 *
 * This wrapper provides:
 *   - Repository-level context (scans product root including _DEV_PROJECT_CONTROL/)
 *   - Forwards to the package-local implementation
 *
 * Usage:
 *   node scripts/validate-skill.js          (repo QA wrapper)
 *   node ai-pm-os/scripts/validate-skill.js  (package-local, standalone)
 *
 * Exit codes: 0 = pass, 1 = fail, 2 = error
 */

'use strict';

const path = require('path');
const { spawn } = require('child_process');

// Resolve the package-local implementation
const packageScript = path.resolve(__dirname, '..', 'ai-pm-os', 'scripts', 'validate-skill.js');

console.log('[Wrapper] Delegating to package-local validator: ai-pm-os/scripts/validate-skill.js');
console.log('[Wrapper] Repository root: ' + path.resolve(__dirname, '..'));
console.log('');

const child = spawn(process.execPath, [packageScript], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code);
});
