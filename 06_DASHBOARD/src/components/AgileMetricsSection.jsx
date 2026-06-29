import { useState, useEffect } from 'react';
import { isAgileMetricsEmpty, getAgileMetricsModel } from '../agileMetricsModel.js';

function EmptyState({ message = 'No data yet' }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">—</span>
      <span className="empty-state-text">{message}</span>
    </div>
  );
}

function MetricCard({ title, badgeLabel, badgeVariant, children }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <span className={`metric-badge badge-${badgeVariant}`}>{badgeLabel}</span>
      </div>
      <div className="metric-body">{children}</div>
    </div>
  );
}

export { EmptyState };

export default function AgileMetricsSection({ burndown, velocity, backlog }) {
  // R4 fix (QC-F-249): Use the SHARED model imported from agileMetricsModel.js
  if (isAgileMetricsEmpty(burndown, velocity)) {
    return (
      <section className="dashboard-section agile-metrics-section">
        <h2 className="section-title">Agile Metrics</h2>
        <EmptyState message="Agile data not yet synced — run npm run sync:data" />
      </section>
    );
  }

  var m = getAgileMetricsModel(burndown, velocity, backlog);

  // R4 fix (QC-F-249): All card data now sourced from the shared model
  const days = m.hasBD ? (burndown.days || []) : [];
  const sprints = m.hasVL ? (velocity.velocity || []) : [];

  const latestDay = days.length > 0 ? days[days.length - 1] : null;
  const sprintId = m.hasBD ? (burndown.sprint_id || '—') : '—';
  const totalPoints = m.hasBD ? (burndown.total_points || 0) : 0;

  const avgVelocity = sprints.length > 0
    ? Math.round(sprints.reduce(function(s, i) { return s + (i.completed_points || 0); }, 0) / sprints.length)
    : 0;

  const latestVelocity = sprints.length > 0 ? (sprints[sprints.length - 1] || {}) : {};
  const variance = latestVelocity.velocity_variance || 0;

  var burndownHealth = 'green';
  if (latestDay) {
    var diff = latestDay.actual_remaining_points - latestDay.planned_remaining_points;
    if (diff > 0) {
      var pct = (diff / latestDay.planned_remaining_points) * 100;
      if (pct > 40) burndownHealth = 'red';
      else if (pct > 20) burndownHealth = 'amber';
    }
  }

  var velocityHealth = 'green';
  if (variance < 0 && latestVelocity.planned_points > 0) {
    var absVar = Math.abs(variance);
    var vPct = (absVar / latestVelocity.planned_points) * 100;
    if (vPct > 40) velocityHealth = 'red';
    else if (vPct > 20) velocityHealth = 'amber';
  }

  // R4 fix (QC-F-249): blocked/carryover counts from shared model
  var blockedItems = [];
  var carryOverItems = [];
  if (backlog && Array.isArray(backlog.backlog)) {
    blockedItems = backlog.backlog.filter(function(item) {
      return item.status && item.status.toLowerCase().indexOf('blocked') !== -1;
    });
    carryOverItems = backlog.backlog.filter(function(item) {
      return item.carry_over === true || item.carry_over === 'true';
    });
  }

  function BurndownChart({ days }) {
    if (days.length < 2) return null;
    var maxP = days.reduce(function(m, d) { return Math.max(m, d.planned_remaining_points || 0); }, 0);
    if (maxP === 0) maxP = 1;
    return (
      <div className="burndown-chart" style={{ marginTop: '8px' }}>
        {days.map(function(d, i) {
          var idealBar = Math.round((d.planned_remaining_points / maxP) * 20);
          var actualBar = Math.round((d.actual_remaining_points / maxP) * 20);
          var dateStr = (d.date || '').substring(5);
          return (
            <div key={i} style={{ fontFamily: 'monospace', fontSize: '11px', marginBottom: '2px', color: '#94a3b8' }}>
              {dateStr}
              {' '}
              <span style={{ color: '#475569' }}>{'\u2588'.repeat(idealBar)}</span>
              {' '}
              <span style={{ color: '#3b82f6' }}>{'\u2588'.repeat(actualBar)}</span>
              {' '}
              {d.actual_remaining_points <= d.planned_remaining_points ? '\u2713' : (d.actual_remaining_points > d.planned_remaining_points * 1.2 ? '\u2717' : '\u2248')}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className="dashboard-section agile-metrics-section">
      <h2 className="section-title">Agile Metrics</h2>
      <div className="metrics-grid">

        <MetricCard title="Sprint Burndown" badgeLabel={burndownHealth} badgeVariant={burndownHealth}>
          <div className="metric-label">Sprint: {sprintId}</div>
          <div className="metric-label">Total SP: {totalPoints}</div>
          {latestDay && (
            <div className="metric-label">
              Remaining: {latestDay.actual_remaining_points} (ideal: {latestDay.planned_remaining_points})
            </div>
          )}
          {latestDay && latestDay.blocked_points > 0 && (
            <div className="metric-warn">Blocked: {latestDay.blocked_points} SP</div>
          )}
          <BurndownChart days={days} />
        </MetricCard>

        <MetricCard title="Sprint Velocity" badgeLabel={velocityHealth} badgeVariant={velocityHealth}>
          <div className="metric-label">Avg Velocity: {avgVelocity} SP/sprint</div>
          {latestVelocity.sprint_id && (
            <div className="metric-label">
              Last: {latestVelocity.sprint_id} — {latestVelocity.completed_points || 0}/{latestVelocity.planned_points || 0} SP
            </div>
          )}
          {variance !== 0 && (
            <div className="metric-label">
              Variance: {variance > 0 ? '+' : ''}{variance} SP
            </div>
          )}
          {latestVelocity.variance_reason && (
            <div className="metric-sublabel">{latestVelocity.variance_reason}</div>
          )}
          {sprints.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {sprints.slice(-4).map(function(s, i) {
                return (
                  <div key={i} style={{ fontSize: '11px', marginBottom: '2px', color: '#94a3b8' }}>
                    {(s.sprint_id || '?')} → {s.completed_points || 0}/{s.planned_points || 0}
                  </div>
                );
              })}
            </div>
          )}
        </MetricCard>

        <MetricCard title="Blocked Items" badgeLabel={blockedItems.length} badgeVariant={blockedItems.length > 0 ? 'amber' : 'green'}>
          {blockedItems.length === 0 ? (
            <EmptyState message="No blocked items" />
          ) : (
            blockedItems.slice(0, 5).map(function(item, i) {
              return (
                <div key={i} style={{ fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #334155' }}>
                  {(item.story_id || item.backlog_id || '?')} — {item.status || 'blocked'}
                </div>
              );
            })
          )}
        </MetricCard>

        <MetricCard title="Carry-over Items" badgeLabel={carryOverItems.length} badgeVariant={carryOverItems.length > 0 ? 'amber' : 'green'}>
          {carryOverItems.length === 0 ? (
            <EmptyState message="No carry-over items" />
          ) : (
            carryOverItems.slice(0, 5).map(function(item, i) {
              return (
                <div key={i} style={{ fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #334155' }}>
                  {(item.story_id || item.backlog_id || '?')}
                </div>
              );
            })
          )}
        </MetricCard>

      </div>
    </section>
  );
}
