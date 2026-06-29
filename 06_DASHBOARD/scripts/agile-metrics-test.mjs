/**
 * agile-metrics-test.mjs — Node.js test for shared agileMetricsModel
 * Imports the SAME module that AgileMetricsSection.jsx imports.
 * Verifies clean Empty State + populated 4-card precise values.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { isAgileMetricsEmpty, getAgileMetricsModel } from '../src/agileMetricsModel.js';

var __dirname = dirname(fileURLToPath(import.meta.url));

var passed = 0;
var failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log('  PASS: ' + msg);
    passed++;
  } else {
    console.error('  FAIL: ' + msg);
    failed++;
  }
}

console.log('=== agile-metrics-test.mjs — shared agileMetricsModel ===');
console.log('  Imported from: ' + join(__dirname, '../src/agileMetricsModel.js'));

// R4-AC-02: Clean Empty State
console.log('\n--- Clean Empty State ---');
var empty = isAgileMetricsEmpty({}, {});
assert(empty === true, 'isAgileMetricsEmpty({},{}}) === true');

var m0 = getAgileMetricsModel({}, {}, {});
assert(m0.isEmpty === true, 'model.isEmpty === true (empty input)');
assert(m0.hasBD === false, 'model.hasBD === false (empty input)');
assert(m0.hasVL === false, 'model.hasVL === false (empty input)');
assert(m0.burndownCard === null, 'model.burndownCard === null (empty input)');
assert(m0.velocityCard === null, 'model.velocityCard === null (empty input)');
assert(m0.blockedCount === 0, 'model.blockedCount === 0 (empty input)');
assert(m0.carryoverCount === 0, 'model.carryoverCount === 0 (empty input)');

// R4-AC-02: Populated 4-card precise values
console.log('\n--- Populated 4-Card Precise Values ---');
var m1 = getAgileMetricsModel(
  { sprint_id: 'SPRINT-2026-03', total_points: 34, days: [
    { date: '2026-06-15', planned_remaining_points: 34, actual_remaining_points: 34, blocked_points: 0 },
    { date: '2026-06-22', planned_remaining_points: 22, actual_remaining_points: 28, blocked_points: 3 },
  ]},
  { velocity: [
    { sprint_id: 'SPRINT-2026-01', planned_points: 30, completed_points: 28, velocity_variance: -2, variance_reason: 'Estimation Gap' },
    { sprint_id: 'SPRINT-2026-02', planned_points: 32, completed_points: 32, velocity_variance: 0 },
    { sprint_id: 'SPRINT-2026-03', planned_points: 34, completed_points: 28, velocity_variance: -6, variance_reason: 'Scope Added' },
  ]},
  { backlog: [
    { backlog_id: 'BLK-001', status: 'Blocked', carry_over: false },
    { backlog_id: 'BLK-002', status: 'In Progress', carry_over: true },
    { backlog_id: 'BLK-003', status: 'Active', carry_over: false },
  ]}
);

assert(m1.isEmpty === false, 'model.isEmpty === false (populated input)');
assert(m1.hasBD === true, 'model.hasBD === true');
assert(m1.hasVL === true, 'model.hasVL === true');

// Burndown card
assert(m1.burndownCard !== null, 'model.burndownCard !== null');
assert(m1.burndownCard.days === 2, 'Burndown days === 2 (got ' + m1.burndownCard.days + ')');
assert(m1.burndownCard.sprint === 'SPRINT-2026-03', 'Burndown sprint === SPRINT-2026-03');
assert(m1.burndownCard.totalPoints === 34, 'Burndown totalPoints === 34');
assert(m1.burndownCard.remaining === 28, 'Burndown remaining === 28 (latest actual)');
assert(m1.burndownCard.plannedRemaining === 22, 'Burndown plannedRemaining === 22');
assert(m1.burndownCard.blockedPoints === 3, 'Burndown blockedPoints === 3');

// Velocity card
assert(m1.velocityCard !== null, 'model.velocityCard !== null');
assert(m1.velocityCard.avg === 29, 'Velocity avg === 29 (28+32+28=88/3=29.33→29)');
assert(m1.velocityCard.last === 28, 'Velocity last completed_points === 28');
assert(m1.velocityCard.lastSprint === 'SPRINT-2026-03', 'Velocity lastSprint === SPRINT-2026-03');
assert(m1.velocityCard.planned === 34, 'Velocity planned === 34');
assert(m1.velocityCard.variance === -6, 'Velocity variance === -6');
assert(m1.velocityCard.varianceReason === 'Scope Added', 'Velocity varianceReason === Scope Added');
assert(m1.velocityCard.count === 3, 'Velocity count === 3 sprints');

// Blocked / Carry-over
assert(m1.blockedCount === 1, 'blockedCount === 1 (got ' + m1.blockedCount + ')');
assert(m1.carryoverCount === 1, 'carryoverCount === 1 (got ' + m1.carryoverCount + ')');

// Summary
console.log('\n=== Summary ===');
console.log('Passed: ' + passed);
console.log('Failed: ' + failed);

if (failed > 0) {
  console.error('RESULT: FAIL');
  process.exit(1);
} else {
  console.log('RESULT: PASS');
  process.exit(0);
}
