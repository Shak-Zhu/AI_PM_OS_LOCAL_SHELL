import React from 'react';

function ActionItem({ item }) {
  const isOverdue = item.status === 'overdue' || item.overdue;
  return (
    <li className={`action-item ${isOverdue ? 'action-overdue' : ''}`}>
      <span className="item-id">{item.id || item.action_id || '—'}</span>
      <span className="item-title">{item.title || item.description || '—'}</span>
      {item.owner && <span className="item-owner">{item.owner}</span>}
      {item.due_date && <span className="item-date">{item.due_date}</span>}
      {item.status && <span className={`status-badge status-${item.status}`}>{item.status}</span>}
      {isOverdue && <span className="rag-badge rag-red">Overdue</span>}
    </li>
  );
}

export default function ActionsSection({ data }) {
  const actions = Array.isArray(data.actions) ? data.actions : [];
  const open = actions.filter(a => a.status !== 'closed' && a.status !== 'completed' && a.status !== 'done');
  const overdue = actions.filter(a => a.status === 'overdue' || a.overdue);

  return (
    <div className="module actions-section">
      <h2 className="module-title">Actions</h2>
      <div className="module-content">
        <div className="metric-row">
          <span className="metric-label">Open Actions</span>
          <span className="metric-value">
            {open.length > 0 ? open.length : <span className="empty-inline">None</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Overdue</span>
          <span className="metric-value">
            {overdue.length > 0
              ? <span className="rag-badge rag-red">{overdue.length}</span>
              : <span className="empty-inline">None</span>}
          </span>
        </div>
        {actions.length > 0 ? (
          <ul className="action-list">
            {actions.slice(0, 5).map((item, idx) => (
              <ActionItem key={item.id || item.action_id || idx} item={item} />
            ))}
            {actions.length > 5 && <li className="action-more">+{actions.length - 5} more</li>}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No actions recorded</span>
          </div>
        )}
      </div>
    </div>
  );
}
