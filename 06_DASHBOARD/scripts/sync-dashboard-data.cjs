/**
 * Dashboard Data Sync Script — 07_DATA/*.json → 06_DASHBOARD/public/data/
 *
 * Policy:
 * - Reads all required JSON from the project root 07_DATA/ directory.
 * - Copies to 06_DASHBOARD/public/data/ for the Vite dev server to serve.
 * - Fail-closed: missing source JSON or unparseable JSON exits non-zero.
 * - Uses Node.js standard library only (no npm packages).
 * - Cross-platform: works on Windows, macOS, Linux.
 *
 * Usage:
 *   node scripts/sync-dashboard-data.js
 *
 * Exit codes:
 *   0 = All data files synced successfully
 *   1 = One or more source files missing or invalid
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// Resolve paths relative to this script's location (06_DASHBOARD/)
const DASHBOARD_DIR = path.resolve(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(DASHBOARD_DIR, 'public', 'data');
const SOURCE_DATA_DIR = path.join(DASHBOARD_DIR, '..', '07_DATA');

// Required data files the Dashboard needs to read (P0 — all must sync)
// This list must cover every file that App.jsx loads and Dashboard P0 modules display.
// See WP-021 scope_in §3.
const REQUIRED_FILES = [
  'dashboard_state.json',
  'project_state.json',
  'scope.json',
  'milestones.json',
  'gantt.json',
  'raid.json',
  'actions.json',
  'approvals.json',
  'sprints.json',
  'backlog.json',
  'burndown.json',
  'velocity.json',
  'meetings.json',
  'meeting_actions.json',
  'meeting_decisions.json',
  'todo.json',
  'reports.json',
  'documents.json',
  'progress.json',
  'estimation.json',
  'project_roles.json',
];

// Optional data files (non-blocking if missing)
const OPTIONAL_FILES = [];

function log(msg)   { console.log('[dashboard-sync] ' + msg); }
function warn(msg)  { console.log('[dashboard-sync] WARN: ' + msg); }
function error(msg) { console.error('[dashboard-sync] ERROR: ' + msg); }

function parseJson(fp) {
  try {
    return { ok: true, data: JSON.parse(fs.readFileSync(fp, 'utf8')) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyAndValidate(srcPath, dstPath) {
  const r = parseJson(srcPath);
  if (!r.ok) {
    return { ok: false, error: 'Parse error: ' + r.error };
  }
  const content = JSON.stringify(r.data, null, 2) + '\n';
  fs.writeFileSync(dstPath, content, 'utf8');
  return { ok: true };
}

function main() {
  console.log('=== Dashboard Data Sync ===');
  console.log('Dashboard: ' + DASHBOARD_DIR);
  console.log('Source:    ' + SOURCE_DATA_DIR);
  console.log('Target:    ' + PUBLIC_DATA_DIR);
  console.log('');

  // Verify source directory exists
  if (!fs.existsSync(SOURCE_DATA_DIR)) {
    error('Source directory does not exist: ' + SOURCE_DATA_DIR);
    process.exit(1);
  }

  // Ensure public/data/ exists
  ensureDir(PUBLIC_DATA_DIR);

  let failCount = 0;
  let skipCount = 0;
  const results = [];

  // Process required files
  for (const file of REQUIRED_FILES) {
    const src = path.join(SOURCE_DATA_DIR, file);
    const dst = path.join(PUBLIC_DATA_DIR, file);

    if (!fs.existsSync(src)) {
      error('Required source missing: ' + file);
      results.push({ file, status: 'MISSING' });
      failCount++;
      continue;
    }

    const r = copyAndValidate(src, dst);
    if (!r.ok) {
      error('Invalid JSON in ' + file + ': ' + r.error);
      results.push({ file, status: 'INVALID', error: r.error });
      failCount++;
    } else {
      log('Synced: ' + file);
      results.push({ file, status: 'OK' });
    }
  }

  // Process optional files (non-blocking)
  for (const file of OPTIONAL_FILES) {
    const src = path.join(SOURCE_DATA_DIR, file);
    const dst = path.join(PUBLIC_DATA_DIR, file);

    if (!fs.existsSync(src)) {
      warn('Optional source missing (skipping): ' + file);
      results.push({ file, status: 'OPT_SKIP' });
      skipCount++;
      continue;
    }

    const r = copyAndValidate(src, dst);
    if (!r.ok) {
      warn('Optional file invalid (skipping): ' + file + ' — ' + r.error);
      results.push({ file, status: 'OPT_INVALID' });
      skipCount++;
    } else {
      log('Synced (optional): ' + file);
      results.push({ file, status: 'OK_OPT' });
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log('Synced:    ' + (results.filter(r => r.status === 'OK' || r.status === 'OK_OPT').length));
  console.log('Skipped:   ' + skipCount);
  console.log('Failed:    ' + failCount);
  console.log('');

  if (failCount > 0) {
    console.log('RESULT: FAIL - ' + failCount + ' required file(s) missing or invalid');
    process.exit(1);
  }

  console.log('RESULT: PASS - all required data files synced');
  process.exit(0);
}

main();
