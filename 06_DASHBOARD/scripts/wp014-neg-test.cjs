/**
 * WP-014 Negative Tests for Dashboard Data Sync
 *
 * Tests fail-closed behavior of sync-dashboard-data.cjs and smoke-test.cjs.
 * All files are restored after each test.
 *
 * Usage:
 *   node scripts/wp014-neg-test.cjs
 *
 * Exit codes:
 *   0 = All negative tests passed (scripts correctly fail-closed)
 *   1 = One or more tests failed (unexpected behavior detected)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const DASHBOARD_DIR = path.resolve(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(DASHBOARD_DIR, 'public', 'data');
const SOURCE_DATA_DIR = path.join(DASHBOARD_DIR, '..', '07_DATA');

const REQUIRED_FILES = [
  'dashboard_state.json', 'project_state.json', 'scope.json', 'raid.json',
  'actions.json', 'approvals.json', 'sprints.json', 'backlog.json',
  'todo.json', 'reports.json', 'documents.json',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let passCount = 0;
let failCount = 0;

function log(msg)  { console.log('[NT] ' + msg); }
function pass(msg) { console.log('[NT] PASS: ' + msg); passCount++; }
function fail(msg) { console.error('[NT] FAIL: ' + msg); failCount++; }

function runCmd(cmd, args) {
  const { spawnSync } = require('child_process');
  const r = spawnSync('node', [cmd, ...(args || [])], {
    cwd: DASHBOARD_DIR, encoding: 'utf8', timeout: 15000
  });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function backupFile(fp) {
  if (fs.existsSync(fp)) {
    const backup = fp + '.nt.bak';
    fs.copyFileSync(fp, backup);
    return backup;
  }
  return null;
}

function restoreFile(backup) {
  if (backup && fs.existsSync(backup)) {
    const original = backup.replace('.nt.bak', '');
    fs.copyFileSync(backup, original);
    fs.unlinkSync(backup);
  }
}

function deleteFile(fp) {
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
}

// ---------------------------------------------------------------------------
// NT-01: Missing SOURCE file (07_DATA) causes sync to exit non-0
// ---------------------------------------------------------------------------
function nt01() {
  log('NT-01: Missing source file (07_DATA) should fail sync...');
  // Use a file that HAS a valid source: project_state.json
  // Temporarily hide its source to trigger fail-closed
  const srcFile = path.join(SOURCE_DATA_DIR, 'scope.json');
  const pubFile = path.join(PUBLIC_DATA_DIR, 'scope.json');
  const srcBackup = fs.existsSync(srcFile) ? path.join(SOURCE_DATA_DIR, 'scope.json.nt.bak') : null;

  try {
    if (srcBackup !== null) {
      fs.copyFileSync(srcFile, srcBackup);
      fs.unlinkSync(srcFile);
    }
    const r = runCmd('scripts/sync-dashboard-data.cjs');
    if (r.status !== 0) {
      pass('NT-01: sync exited non-0 when source file was missing');
    } else {
      fail('NT-01: sync exited 0 despite missing source file');
    }
  } finally {
    if (srcBackup && fs.existsSync(srcBackup)) {
      fs.copyFileSync(srcBackup, srcFile);
      fs.unlinkSync(srcBackup);
    }
    // Re-sync public/data from source to restore
    runCmd('scripts/sync-dashboard-data.cjs');
  }
}

// ---------------------------------------------------------------------------
// NT-02: Bad JSON in SOURCE file causes sync to exit non-0
// ---------------------------------------------------------------------------
function nt02() {
  log('NT-02: Bad JSON in source file (07_DATA) should fail sync...');
  const srcFile = path.join(SOURCE_DATA_DIR, 'actions.json');
  const backup = backupFile(srcFile);
  try {
    // Write invalid JSON to source
    fs.writeFileSync(srcFile, '{ "broken": json }', 'utf8');
    const r = runCmd('scripts/sync-dashboard-data.cjs');
    if (r.status !== 0) {
      pass('NT-02: sync exited non-0 when source file had bad JSON');
    } else {
      fail('NT-02: sync exited 0 despite bad JSON in source file');
    }
  } finally {
    restoreFile(backup);
    // Re-sync public/data from restored source
    runCmd('scripts/sync-dashboard-data.cjs');
  }
}

// ---------------------------------------------------------------------------
// NT-03: Bad JSON causes smoke to exit non-0
// ---------------------------------------------------------------------------
function nt03() {
  log('NT-03: Bad JSON in required file should fail smoke test...');
  const fp = path.join(PUBLIC_DATA_DIR, 'scope.json');
  const backup = backupFile(fp);
  try {
    fs.writeFileSync(fp, 'not even json{', 'utf8');
    const r = runCmd('scripts/smoke-test.cjs');
    if (r.status !== 0) {
      pass('NT-03: smoke exited non-0 when file had bad JSON');
    } else {
      fail('NT-03: smoke exited 0 despite bad JSON in required file');
    }
  } finally {
    restoreFile(backup);
  }
}

// ---------------------------------------------------------------------------
// NT-04: Empty data files — Dashboard shows empty (verify file is empty object/array)
// ---------------------------------------------------------------------------
function nt04() {
  log('NT-04: Empty data files are valid and sync succeeds...');
  const files_to_check = ['backlog.json', 'sprints.json'];
  const backup_map = {};

  try {
    for (const f of files_to_check) {
      const fp = path.join(PUBLIC_DATA_DIR, f);
      backup_map[f] = backupFile(fp);
      if (fs.existsSync(fp)) {
        // Backup current content
        backup_map[f + '.content'] = fs.readFileSync(fp, 'utf8');
      }
      // Write empty arrays (clean shell state)
      fs.writeFileSync(fp, JSON.stringify({ backlog: [] }, null, 2) + '\n', 'utf8');
    }
    const r = runCmd('scripts/sync-dashboard-data.cjs');
    if (r.status === 0) {
      pass('NT-04: sync succeeds with empty data files');
    } else {
      fail('NT-04: sync failed with empty data files: ' + r.stderr);
    }
  } finally {
    // Restore originals
    for (const f of files_to_check) {
      const fp = path.join(PUBLIC_DATA_DIR, f);
      if (backup_map[f + '.content']) {
        fs.writeFileSync(fp, backup_map[f + '.content'], 'utf8');
      }
      if (backup_map[f]) {
        fs.unlinkSync(backup_map[f]);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// NT-05: Source 07_DATA files are not modified by sync script
// ---------------------------------------------------------------------------
function nt05() {
  log('NT-05: Source 07_DATA files not modified by sync...');
  const hash_before = {};
  const hash_after = {};

  try {
    for (const f of REQUIRED_FILES) {
      const fp = path.join(SOURCE_DATA_DIR, f);
      if (fs.existsSync(fp)) {
        hash_before[f] = fs.readFileSync(fp, 'utf8');
      }
    }

    // Run sync
    runCmd('scripts/sync-dashboard-data.cjs');

    for (const f of REQUIRED_FILES) {
      const fp = path.join(SOURCE_DATA_DIR, f);
      if (fs.existsSync(fp)) {
        hash_after[f] = fs.readFileSync(fp, 'utf8');
        if (hash_before[f] !== hash_after[f]) {
          fail('NT-05: Source file ' + f + ' was modified by sync');
          return;
        }
      }
    }
    pass('NT-05: All 07_DATA source files unchanged after sync');
  } finally {
    // No restoration needed — we verified content did not change
  }
}

// ---------------------------------------------------------------------------
// NT-06: Missing optional file (velocity.json) — sync still succeeds
// ---------------------------------------------------------------------------
function nt06() {
  log('NT-06: Missing optional file should not fail sync...');
  const fp = path.join(PUBLIC_DATA_DIR, 'velocity.json');
  const backup = backupFile(fp);
  try {
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    const r = runCmd('scripts/sync-dashboard-data.cjs');
    if (r.status === 0) {
      pass('NT-06: sync succeeds despite missing optional file');
    } else {
      fail('NT-06: sync failed due to missing optional file');
    }
  } finally {
    restoreFile(backup);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log('=== WP-014 Negative Tests ===');
  console.log('');

  // Ensure public/data/ exists before testing
  if (!fs.existsSync(PUBLIC_DATA_DIR)) {
    console.error('public/data/ does not exist — run `npm run sync:data` first');
    process.exit(1);
  }

  nt01(); // Missing required file → fail
  nt02(); // Bad JSON in required file → fail (sync)
  nt03(); // Bad JSON in required file → fail (smoke)
  nt04(); // Empty data files → sync succeeds
  nt05(); // 07_DATA unchanged by sync
  nt06(); // Missing optional file → sync succeeds

  console.log('');
  console.log('=== NT Summary ===');
  console.log('PASS: ' + passCount);
  console.log('FAIL: ' + failCount);
  console.log('');

  if (failCount > 0) {
    console.log('RESULT: FAIL - ' + failCount + ' negative test(s) failed');
    process.exit(1);
  }

  console.log('RESULT: PASS - all negative tests passed');
  process.exit(0);
}

main();
