#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const childProcess = require('child_process');

const BASE = path.resolve(__dirname, '..');
const DATA_FILES = [
  'actions.json', 'approvals.json', 'backlog.json', 'burndown.json',
  'changes.json', 'daily_briefing.json', 'dashboard_state.json',
  'decisions.json', 'documents.json', 'estimation.json', 'gantt.json',
  'input_log.json', 'meeting_actions.json', 'meeting_decisions.json',
  'meetings.json', 'milestones.json', 'progress.json', 'project_roles.json',
  'project_state.json', 'raid.json', 'reports.json', 'requirements.json',
  'scope.json', 'sprints.json', 'todo.json', 'velocity.json',
];
const EXCLUDED_SEGMENTS = new Set([
  '.git', '_DEV_PROJECT_CONTROL', 'node_modules', 'dist',
]);

function normalize(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function shouldCopy(sourcePath) {
  const relative = normalize(path.relative(BASE, sourcePath));
  if (!relative) return true;
  const segments = relative.split('/');
  if (segments.some(segment => EXCLUDED_SEGMENTS.has(segment))) return false;
  if (relative === '06_DASHBOARD/public/data' || relative.startsWith('06_DASHBOARD/public/data/')) {
    return false;
  }
  return true;
}

function writeFile(root, relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.trim() + '\n', 'utf8');
}

function writeJson(root, fileName, value) {
  writeFile(root, path.join('07_DATA', fileName), JSON.stringify(value, null, 2));
}

function runNode(root, relativeScript) {
  const result = childProcess.spawnSync(
    process.execPath,
    [relativeScript],
    { cwd: root, encoding: 'utf8' }
  );
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(relativeScript + ' exited ' + result.status + (detail ? '\n' + detail : ''));
  }
  return (result.stdout || '').trim();
}

function readJson(root, fileName) {
  return JSON.parse(fs.readFileSync(path.join(root, '07_DATA', fileName), 'utf8'));
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function dataHashes(root) {
  const hashes = {};
  for (const fileName of DATA_FILES) {
    hashes[fileName] = hashFile(path.join(root, '07_DATA', fileName));
  }
  return hashes;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertPopulatedOutputs(root) {
  const documents = readJson(root, 'documents.json').documents;
  const meetings = readJson(root, 'meetings.json').meetings;
  const milestones = readJson(root, 'milestones.json').milestones;
  const tasks = readJson(root, 'gantt.json').tasks;
  const todos = readJson(root, 'todo.json').todos;
  const estimates = readJson(root, 'estimation.json').estimates;
  const burndown = readJson(root, 'burndown.json');
  const velocity = readJson(root, 'velocity.json').velocity;
  const progress = readJson(root, 'progress.json');
  const actions = readJson(root, 'actions.json').actions;
  const decisions = readJson(root, 'decisions.json').decisions;
  const meetingActions = readJson(root, 'meeting_actions.json').meeting_actions;
  const meetingDecisions = readJson(root, 'meeting_decisions.json').meeting_decisions;

  assert(Array.isArray(documents) && documents.length === 2, 'documents fixture not populated');
  assert(Array.isArray(meetings) && meetings.length === 2, 'meetings fixture not populated');
  assert(Array.isArray(milestones) && milestones.length === 2, 'milestones fixture not populated');
  assert(Array.isArray(tasks) && tasks.length === 2, 'gantt.tasks fixture not populated');
  assert(Array.isArray(todos) && todos.length === 2, 'todo fixture not populated');
  assert(Array.isArray(estimates) && estimates.length === 2, 'estimation fixture not populated');
  assert(typeof estimates[0].estimated_points === 'number', 'estimated_points is not Number');
  assert(Array.isArray(burndown.days) && burndown.days.length === 2, 'burndown fixture not populated');
  assert(typeof burndown.days[0].actual_remaining_points === 'number', 'burndown numeric field is not Number');
  assert(Array.isArray(velocity) && velocity.length === 2, 'velocity fixture not populated');
  assert(typeof velocity[0].planned_points === 'number', 'velocity numeric field is not Number');
  assert(typeof progress.overall_progress === 'number' && progress.basis, 'progress fixture lacks numeric result or basis');
  assert(Array.isArray(actions) && actions.length === 1, 'Skill-maintained actions fixture not populated');
  assert(Array.isArray(decisions) && decisions.length === 1, 'Skill-maintained decisions fixture not populated');
  assert(Array.isArray(meetingActions) && meetingActions.length === 1, 'meeting_actions fixture not populated');
  assert(Array.isArray(meetingDecisions) && meetingDecisions.length === 1, 'meeting_decisions fixture not populated');
}

function seedMarkdown(root) {
  writeFile(root, '00_PM_MEMORY/PM_DOCUMENT_REGISTRY.md', `
| document_id | title | status |
|---|---|---|
| DOC-001 | Project Brief | approved |
| DOC-002 | Scope Baseline | review |
`);

  writeFile(root, '03_MEETINGS/meeting_index/PM_MEETING_INDEX.md', `
| meeting_id | title | date | status |
|---|---|---|---|
| MTG-001 | Project Kick-off | 2026-01-05 | completed |
| MTG-002 | Sprint Planning | 2026-01-12 | scheduled |
`);

  writeFile(root, '01_PM_DOCUMENTS/PM_SCHEDULE_BASELINE.md', `
# Schedule Baseline

## Milestones

| milestone_id | name | target_date | status |
|---|---|---|---|
| MS-001 | Initiation Complete | 2026-01-10 | achieved |
| MS-002 | First Release | 2026-02-01 | upcoming |

## Gantt

| task_id | name | start_date | end_date | status |
|---|---|---|---|---|
| TASK-001 | Planning | 2026-01-05 | 2026-01-10 | completed |
| TASK-002 | Delivery | 2026-01-11 | 2026-01-31 | in_progress |
`);

  writeFile(root, '04_TODO/daily/2026-01-05_TODO.md', `
| todo_id | description | status | date |
|---|---|---|---|
| TODO-001 | Confirm scope | done | 2026-01-05 |
| TODO-002 | Review risks | open | 2026-01-05 |
`);

  writeFile(root, '01_PM_DOCUMENTS/PM_ESTIMATION_LOG.md', `
| story_id | estimated_points | estimator |
|---|---|---|
| US-001 | 5 | Product Owner |
| US-002 | 8 | Technical Owner |
`);

  writeFile(root, '02_AGILE/PM_BURNDOWN_DATA.md', `
# Burndown Data

## Current Sprint

- sprint_id: SPR-001
- total_points: 13

## Burndown Data

| sprint_id | date | planned_remaining_points | actual_remaining_points | completed_points | scope_added_points | scope_removed_points | blocked_points | source |
|---|---|---|---|---|---|---|---|---|
| SPR-001 | 2026-01-05 | 13 | 13 | 0 | 0 | 0 | 0 | standup |
| SPR-001 | 2026-01-06 | 11 | 10 | 3 | 0 | 0 | 2 | standup |
`);

  writeFile(root, '02_AGILE/PM_VELOCITY_LOG.md', `
# Velocity Log

| sprint_id | planned_points | completed_points | accepted_points | carry_over_points | velocity_variance | variance_reason | source |
|---|---|---|---|---|---|---|---|
| SPR-001 | 13 | 10 | 10 | 3 | -3 | Blocked Items | sprint review |
| SPR-002 | 16 | 16 | 16 | 0 | 0 | Other | sprint review |
`);

  writeFile(root, '01_PM_DOCUMENTS/PM_REQUIREMENTS_REGISTER.md', `
| ID | Requirement | Priority | Status |
|---|---|---|---|
| REQ-001 | Initialize project | P0 | approved |
| REQ-002 | Generate reports | P0 | proposed |
`);

  writeFile(root, '01_PM_DOCUMENTS/PM_ACTION_LOG.md', `
| Action ID | Description | Status |
|---|---|---|
| ACT-001 | Confirm scope | completed |
| ACT-002 | Review risks | open |
`);
}

function seedSkillMaintainedJson(root) {
  writeJson(root, 'actions.json', {
    actions: [{
      action_id: 'ACT-001',
      description: 'Confirm scope',
      owner: 'Project Manager',
      due_date: '2026-01-06',
      status: 'completed',
      source_meeting: 'MTG-001',
    }],
  });
  writeJson(root, 'decisions.json', {
    source: '03_MEETINGS/meeting_minutes/2026-01-05_0900_MEETING_MINUTES_kickoff.md',
    decisions: [{
      decision_id: 'DEC-001',
      description: 'Approve project initiation',
      decided_by: 'Project Owner',
      date: '2026-01-05',
    }],
  });
  writeJson(root, 'meeting_actions.json', {
    meeting_actions: [{
      action_id: 'ACT-001',
      description: 'Confirm scope',
      owner: 'Project Manager',
      status: 'completed',
      due_date: '2026-01-06',
    }],
  });
  writeJson(root, 'meeting_decisions.json', {
    meeting_decisions: [{
      decision_id: 'DEC-001',
      description: 'Approve project initiation',
      decided_by: 'Project Owner',
      date: '2026-01-05',
    }],
  });
}

function main() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-pm-os-populated-'));
  console.log('=== Populated Sync Regression ===');
  console.log('Fixture: ' + tempRoot);

  try {
    fs.cpSync(BASE, tempRoot, {
      recursive: true,
      filter: shouldCopy,
    });
    seedMarkdown(tempRoot);
    seedSkillMaintainedJson(tempRoot);

    runNode(tempRoot, 'scripts/sync-data.js');
    seedSkillMaintainedJson(tempRoot);
    runNode(tempRoot, 'scripts/validate-data.js');
    runNode(tempRoot, '06_DASHBOARD/scripts/sync-dashboard-data.cjs');
    runNode(tempRoot, '06_DASHBOARD/scripts/smoke-test.cjs');
    assertPopulatedOutputs(tempRoot);

    const firstHashes = dataHashes(tempRoot);
    runNode(tempRoot, 'scripts/sync-data.js');
    seedSkillMaintainedJson(tempRoot);
    runNode(tempRoot, 'scripts/validate-data.js');
    const secondHashes = dataHashes(tempRoot);

    for (const fileName of DATA_FILES) {
      assert(firstHashes[fileName] === secondHashes[fileName], fileName + ' is not idempotent');
    }

    console.log('Populated outputs: 13/13');
    console.log('Schema validation: 26/26');
    console.log('Dashboard data smoke: 21/21');
    console.log('Second-run hashes unchanged: 26/26');
    console.log('RESULT: PASS - populated sync regression complete.');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    console.log('Temporary fixture removed: ' + (!fs.existsSync(tempRoot)));
  }
}

try {
  main();
} catch (error) {
  console.error('RESULT: FAIL - ' + error.message);
  process.exit(1);
}
