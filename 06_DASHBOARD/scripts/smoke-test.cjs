/**
 * Dashboard Smoke Test — verifies public/data/*.json integrity
 *
 * Checks:
 * 1. All required data files exist.
 * 2. Each is valid JSON.
 * 3. Core read paths (top-level fields) are accessible.
 *
 * Usage:
 *   node scripts/smoke-test.cjs
 *
 * Exit codes:
 *   0 = All checks passed
 *   1 = One or more checks failed
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const DASHBOARD_DIR = path.resolve(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(DASHBOARD_DIR, 'public', 'data');

// P0 required files — all must exist and parse (clean shell: null arrays are OK)
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

// Minimal field checks per file: each file must have at least one of these paths accessible.
// Null/undefined is acceptable in clean shell; smoke only verifies parse + top-level access.
const FIELD_CHECKS = {
  'dashboard_state.json':    ['rag_status', 'overall_progress', 'open_actions', 'open_risks'],
  'project_state.json':     ['project_name', 'current_phase', 'overall_progress', 'rag_status'],
  'scope.json':             ['scope_baseline', 'in_scope', 'out_of_scope'],
  'milestones.json':        ['milestones'],
  'gantt.json':             ['tasks', 'status'],
  'raid.json':              ['items', 'risks'],
  'actions.json':          ['actions'],
  'approvals.json':         ['approvals'],
  'sprints.json':          ['sprints', 'current_sprint'],
  'backlog.json':           ['backlog'],
  'burndown.json':          ['sprint_id', 'total_points', 'days'],
  'velocity.json':          ['velocity', 'sprints'],
  'meetings.json':          ['meetings'],
  'meeting_actions.json':   ['meeting_actions'],
  'meeting_decisions.json': ['meeting_decisions'],
  'todo.json':              ['todo', 'todos'],
  'reports.json':           ['reports'],
  'documents.json':         ['documents'],
  'progress.json':         ['overall_progress', 'requirements_completion', 'milestones_completion', 'actions_completion', 'basis'],
  'estimation.json':         ['estimation', 'estimates'],
  'project_roles.json':     ['roles'],
};

function log(msg)   { console.log('[smoke] ' + msg); }
function error(msg) { console.error('[smoke] ERROR: ' + msg); }

function main() {
  console.log('=== Dashboard Smoke Test ===');
  console.log('Data dir: ' + PUBLIC_DATA_DIR);
  console.log('');

  let failCount = 0;
  let passCount = 0;

  if (!fs.existsSync(PUBLIC_DATA_DIR)) {
    error('Data directory does not exist: ' + PUBLIC_DATA_DIR);
    console.log('Run `npm run sync:data` first.');
    process.exit(1);
  }

  for (const file of REQUIRED_FILES) {
    const fp = path.join(PUBLIC_DATA_DIR, file);
    if (!fs.existsSync(fp)) {
      error('Missing: ' + file);
      failCount++;
      continue;
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    } catch (e) {
      error('Invalid JSON: ' + file + ' — ' + e.message);
      failCount++;
      continue;
    }

    const requiredFields = FIELD_CHECKS[file] || [];
    let hasField = false;
    for (const f of requiredFields) {
      if (data && (data[f] !== undefined)) {
        hasField = true;
        break;
      }
    }
    if (!hasField && requiredFields.length > 0) {
      error('No expected fields in: ' + file + ' (expected one of: ' + requiredFields.join(', ') + ')');
      failCount++;
      continue;
    }

    log('PASS: ' + file);
    passCount++;
  }

  console.log('');
  console.log('=== Summary ===');
  console.log('Passed: ' + passCount);
  console.log('Failed: ' + failCount);
  console.log('');

  if (failCount > 0) {
    console.log('RESULT: FAIL');
    process.exit(1);
  }

  console.log('RESULT: PASS - all smoke tests passed');
  process.exit(0);
}

main();
