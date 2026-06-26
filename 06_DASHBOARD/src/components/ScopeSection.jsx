import React from 'react';

export default function ScopeSection({ data }) {
  const baseline = data.scope_baseline || {};
  const inScope = Array.isArray(data.in_scope) ? data.in_scope : [];
  const outOfScope = Array.isArray(data.out_of_scope) ? data.out_of_scope : [];
  const hasBaseline = baseline.status || baseline.version || baseline.approval_status;

  return (
    <div className="module scope-section">
      <h2 className="module-title">Scope</h2>
      <div className="module-content">
        <div className="metric-row">
          <span className="metric-label">Baseline Status</span>
          <span className="metric-value">
            {hasBaseline
              ? String(baseline.status || '—')
              : <span className="empty-inline">No baseline</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Approval Status</span>
          <span className="metric-value">
            {baseline.approval_status
              ? String(baseline.approval_status)
              : <span className="empty-inline">—</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">In Scope Items</span>
          <span className="metric-value">
            {inScope.length > 0
              ? inScope.length
              : <span className="empty-inline">No items</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Out of Scope</span>
          <span className="metric-value">
            {outOfScope.length > 0
              ? outOfScope.length
              : <span className="empty-inline">No items</span>}
          </span>
        </div>
        {inScope.length === 0 && outOfScope.length === 0 && !hasBaseline && (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">Scope not initialized</span>
          </div>
        )}
      </div>
    </div>
  );
}
