import React from 'react';

function MilestoneItem({ item }) {
  const statusColor = {
    achieved: 'green',
    upcoming: 'blue',
    at_risk: 'amber',
    missed: 'red',
  }[item.status] || 'grey';

  return (
    <li className="milestone-item">
      <span className="milestone-id">{item.milestone_id || '—'}</span>
      <span className="milestone-name">{item.name || '—'}</span>
      <span className="milestone-date">{item.target_date || '—'}</span>
      <span className={`rag-badge rag-${statusColor}`}>{item.status || '—'}</span>
    </li>
  );
}

export default function MilestoneSection({ data }) {
  const milestones = Array.isArray(data && data.milestones) ? data.milestones : [];

  return (
    <div className="module milestone-section">
      <h2 className="module-title">Milestones</h2>
      <div className="module-content">
        <div className="metric-row">
          <span className="metric-label">Total Milestones</span>
          <span className="metric-value">
            {milestones.length > 0 ? milestones.length : <span className="empty-inline">None</span>}
          </span>
        </div>
        {milestones.length > 0 ? (
          <ul className="milestone-list">
            {milestones.slice(0, 5).map((item, idx) => (
              <MilestoneItem key={item.milestone_id || item.name || idx} item={item} />
            ))}
            {milestones.length > 5 && <li className="milestone-more">+{milestones.length - 5} more</li>}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No milestones recorded</span>
          </div>
        )}
      </div>
    </div>
  );
}
