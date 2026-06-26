import React from 'react';

function BacklogItem({ item }) {
  const isBlocked = item.status === 'blocked' || item.blocked;
  const isCarryOver = item.carry_over || item.carryover;
  return (
    <li className={`backlog-item ${isBlocked ? 'backlog-blocked' : ''}`}>
      <span className="item-id">{item.id || item.backlog_id || '—'}</span>
      <span className="item-title">{item.title || item.name || item.description || '—'}</span>
      {item.priority && <span className="item-priority">{item.priority}</span>}
      {item.story_points && <span className="item-points">{item.story_points} SP</span>}
      {isBlocked && <span className="rag-badge rag-red">Blocked</span>}
      {isCarryOver && <span className="rag-badge rag-amber">Carry-over</span>}
    </li>
  );
}

export default function BacklogSection({ data }) {
  const backlog = Array.isArray(data.backlog) ? data.backlog : [];
  const blocked = backlog.filter(b => b.status === 'blocked' || b.blocked);
  const carryOver = backlog.filter(b => b.carry_over || b.carryover);

  return (
    <div className="module backlog-section">
      <h2 className="module-title">Backlog</h2>
      <div className="module-content">
        <div className="metric-row">
          <span className="metric-label">Backlog Items</span>
          <span className="metric-value">
            {backlog.length > 0 ? backlog.length : <span className="empty-inline">None</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Blocked</span>
          <span className="metric-value">
            {blocked.length > 0
              ? <span className="rag-badge rag-red">{blocked.length}</span>
              : <span className="empty-inline">None</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Carry-over</span>
          <span className="metric-value">
            {carryOver.length > 0
              ? <span className="rag-badge rag-amber">{carryOver.length}</span>
              : <span className="empty-inline">None</span>}
          </span>
        </div>
        {backlog.length > 0 ? (
          <ul className="backlog-list">
            {backlog.slice(0, 6).map((item, idx) => (
              <BacklogItem key={item.id || item.backlog_id || idx} item={item} />
            ))}
            {backlog.length > 6 && <li className="backlog-more">+{backlog.length - 6} more</li>}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No backlog items</span>
          </div>
        )}
      </div>
    </div>
  );
}
