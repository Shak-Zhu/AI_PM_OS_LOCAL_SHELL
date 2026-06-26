import React from 'react';

function SprintItem({ item }) {
  const isCurrent = item.status === 'active' || item.current;
  return (
    <li className={`sprint-item ${isCurrent ? 'sprint-current' : ''}`}>
      <span className="item-id">{item.id || item.sprint_id || '—'}</span>
      <span className="item-title">{item.name || item.goal || '—'}</span>
      {item.start_date && <span className="item-date">{item.start_date}</span>}
      {item.end_date && <span className="item-date">→ {item.end_date}</span>}
      {item.status && <span className={`status-badge status-${item.status}`}>{item.status}</span>}
      {isCurrent && <span className="rag-badge rag-green">Current</span>}
    </li>
  );
}

export default function SprintSection({ data }) {
  const sprints = Array.isArray(data.sprints) ? data.sprints : [];
  const currentSprint = data.current_sprint || null;
  const sprintProgress = data.sprint_progress || 0;

  return (
    <div className="module sprint-section">
      <h2 className="module-title">Sprints</h2>
      <div className="module-content">
        <div className="metric-row">
          <span className="metric-label">Current Sprint</span>
          <span className="metric-value">
            {currentSprint ? String(currentSprint) : <span className="empty-inline">No sprint</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Sprint Progress</span>
          <span className="metric-value">
            {currentSprint
              ? <span>{sprintProgress}%</span>
              : <span className="empty-inline">—</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Total Sprints</span>
          <span className="metric-value">
            {sprints.length > 0 ? sprints.length : <span className="empty-inline">None</span>}
          </span>
        </div>
        {sprints.length > 0 ? (
          <ul className="sprint-list">
            {sprints.slice(0, 4).map((item, idx) => (
              <SprintItem key={item.id || item.sprint_id || idx} item={item} />
            ))}
            {sprints.length > 4 && <li className="sprint-more">+{sprints.length - 4} more</li>}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No sprints defined</span>
          </div>
        )}
      </div>
    </div>
  );
}
