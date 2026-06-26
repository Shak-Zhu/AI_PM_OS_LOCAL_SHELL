import React from 'react';

function ApprovalItem({ item }) {
  return (
    <li className="approval-item">
      <span className="item-id">{item.id || item.approval_id || '—'}</span>
      <span className="item-title">{item.title || item.description || '—'}</span>
      {item.submitted_by && <span className="item-owner">By {item.submitted_by}</span>}
      {item.submitted_date && <span className="item-date">{item.submitted_date}</span>}
      {item.status && (
        <span className={`status-badge status-${item.status}`}>{item.status}</span>
      )}
    </li>
  );
}

export default function ApprovalsSection({ data }) {
  const approvals = Array.isArray(data.approvals) ? data.approvals : [];
  const pending = approvals.filter(a => a.status === 'pending');

  return (
    <div className="module approvals-section">
      <h2 className="module-title">Approvals</h2>
      <div className="module-content">
        <div className="metric-row">
          <span className="metric-label">Pending Approvals</span>
          <span className="metric-value">
            {pending.length > 0
              ? <span className="rag-badge rag-amber">{pending.length}</span>
              : <span className="empty-inline">None</span>}
          </span>
        </div>
        {approvals.length > 0 ? (
          <ul className="approval-list">
            {approvals.slice(0, 5).map((item, idx) => (
              <ApprovalItem key={item.id || item.approval_id || idx} item={item} />
            ))}
            {approvals.length > 5 && <li className="approval-more">+{approvals.length - 5} more</li>}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No approvals pending</span>
          </div>
        )}
      </div>
    </div>
  );
}
