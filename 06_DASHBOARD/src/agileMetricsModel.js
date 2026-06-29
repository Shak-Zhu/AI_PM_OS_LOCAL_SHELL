/**
 * agileMetricsModel.js — Shared view-model for Dashboard Agile Metrics
 * Imported by: AgileMetricsSection.jsx (ESM import) and agile-metrics-test.mjs (dynamic import)
 * This is the SINGLE SOURCE OF TRUTH for burndown/velocity/blocked/carryover card logic.
 * IMPORTANT: This file uses ES module syntax because package.json has "type": "module".
 */

function isAgileMetricsEmpty(bd, vel) {
  var hasBD = !!(bd && bd.days && bd.days.length > 0);
  var hasVL = !!(vel && vel.velocity && vel.velocity.length > 0);
  return !hasBD && !hasVL;
}

function getAgileMetricsModel(bd, vel, bl) {
  var hasBD = !!(bd && bd.days && bd.days.length > 0);
  var hasVL = !!(vel && vel.velocity && vel.velocity.length > 0);

  var m = {
    isEmpty: !hasBD && !hasVL,
    hasBD: hasBD,
    hasVL: hasVL,
    burndownCard: null,
    velocityCard: null,
    blockedCount: 0,
    carryoverCount: 0,
  };

  if (hasBD && bd.days.length > 0) {
    var ld = bd.days[bd.days.length - 1];
    m.burndownCard = {
      sprint: bd.sprint_id || 'N/A',
      totalPoints: bd.total_points || 0,
      days: bd.days.length,
      remaining: ld.actual_remaining_points || 0,
      plannedRemaining: ld.planned_remaining_points || 0,
      blockedPoints: ld.blocked_points || 0,
    };
  }

  if (hasVL && vel.velocity.length > 0) {
    var sum = vel.velocity.reduce(function(s, v) { return s + (v.completed_points || 0); }, 0);
    var avg = Math.round(sum / vel.velocity.length);
    var ls = vel.velocity[vel.velocity.length - 1];
    m.velocityCard = {
      avg: avg,
      last: ls.completed_points || 0,
      lastSprint: ls.sprint_id || 'N/A',
      planned: ls.planned_points || 0,
      variance: ls.velocity_variance || 0,
      varianceReason: ls.variance_reason || null,
      count: vel.velocity.length,
    };
  }

  if (bl && bl.backlog && Array.isArray(bl.backlog)) {
    m.blockedCount = bl.backlog.filter(function(i) {
      return i.status && i.status.toLowerCase().indexOf('blocked') !== -1;
    }).length;
    m.carryoverCount = bl.backlog.filter(function(i) {
      return i.carry_over === true || i.carry_over === 'true';
    }).length;
  }

  return m;
}

export { isAgileMetricsEmpty, getAgileMetricsModel };
