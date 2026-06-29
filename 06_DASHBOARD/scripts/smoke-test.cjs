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
  'scope.json':             ['scope_baseline', 'in_scope', 'out_of_scope', 'scope'],
  'milestones.json':        ['milestones'],
  'gantt.json':             ['tasks', 'status'],
  'raid.json':              ['items', 'risks'],
  'actions.json':          ['actions'],
  'approvals.json':         ['approvals'],
  'sprints.json':          ['sprints', 'current_sprint'],
  'backlog.json':           ['backlog'],
  'burndown.json':          ['sprint_id', 'days'],
  'velocity.json':          ['velocity'],
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

    // WP-022 AC-09 fix: structural check for burndown days array items
    if (file === 'burndown.json' && data && Array.isArray(data.days) && data.days.length > 0) {
      const firstDay = data.days[0];
      const burndownFields = ['sprint_id', 'date', 'planned_remaining_points', 'actual_remaining_points', 'completed_points', 'scope_added_points', 'scope_removed_points', 'blocked_points', 'source'];
      let dayHasAllFields = true;
      for (const bf of burndownFields) {
        if (firstDay[bf] === undefined) { dayHasAllFields = false; break; }
      }
      if (!dayHasAllFields) {
        error('burndown.json day item missing required 9-field contract fields');
        failCount++;
        continue;
      }
      // WP-022 AC-03 fix: numeric fields must be Number type
      const numericFields = ['planned_remaining_points', 'actual_remaining_points', 'completed_points', 'scope_added_points', 'scope_removed_points', 'blocked_points'];
      for (const nf of numericFields) {
        if (typeof firstDay[nf] !== 'number') {
          error('burndown.json field "' + nf + '" must be Number, got ' + typeof firstDay[nf]);
          failCount++;
          hasField = false;
          break;
        }
      }
    }

    // WP-022 AC-04 fix: structural check for velocity items
    if (file === 'velocity.json' && data && Array.isArray(data.velocity) && data.velocity.length > 0) {
      const firstItem = data.velocity[0];
      const velFields = ['sprint_id', 'planned_points', 'completed_points'];
      let itemHasAllFields = true;
      for (const vf of velFields) {
        if (firstItem[vf] === undefined) { itemHasAllFields = false; break; }
      }
      if (!itemHasAllFields) {
        error('velocity.json item missing required fields (sprint_id, planned_points, completed_points)');
        failCount++;
        continue;
      }
      // WP-022 AC-04 fix: numeric fields must be Number type
      const velNumFields = ['planned_points', 'completed_points', 'accepted_points', 'carry_over_points', 'velocity_variance'];
      for (const vnf of velNumFields) {
        if (firstItem[vnf] !== undefined && typeof firstItem[vnf] !== 'number') {
          error('velocity.json field "' + vnf + '" must be Number, got ' + typeof firstItem[vnf]);
          failCount++;
          hasField = false;
          break;
        }
      }
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
