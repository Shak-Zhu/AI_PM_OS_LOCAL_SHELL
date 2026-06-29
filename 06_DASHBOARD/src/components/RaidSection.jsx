import React from 'react';

function RiskItem({ item }) {
  const isHigh = item.priority === 'high' || item.risk_level === 'high' || item.severity === 'high';
  // item_id takes priority (EXT-QC-006 fix), then risk_id, then id
  const itemId = item.item_id || item.risk_id || item.id || '—';
  return (
    <li className={`risk-item ${isHigh ? 'risk-high' : 'risk-normal'}`}>
      <span className="item-id">{itemId}</span>
      <span className="item-title">{item.title || item.description || item.risk_description || '—'}</span>
      {item.owner && <span className="item-owner">{item.owner}</span>}
      {isHigh && <span className="rag-badge rag-red">High</span>}
    </li>
  );
}

export default function RaidSection({ data }) {
  // schema uses 'items' array (EXT-QC-006 fix)
  const items = Array.isArray(data && data.items) ? data.items
              : Array.isArray(data && data.risks) ? data.risks
              : [];

  return (
    <div className="module raid-section">
      <h2 className="module-title">Risks & Issues</h2>
      <div className="module-content">
        <div className="metric-row">
          <span className="metric-label">Total Risks/Issues</span>
          <span className="metric-value">{items.length > 0 ? items.length : <span className="empty-inline">None</span>}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">High Priority</span>
          <span className="metric-value">
            {items.filter(i => i.priority === 'high' || i.risk_level === 'high' || i.severity === 'high').length > 0
              ? items.filter(i => i.priority === 'high' || i.risk_level === 'high' || i.severity === 'high').length
              : <span className="empty-inline">None</span>}
          </span>
        </div>
        {items.length > 0 ? (
          <ul className="risk-list">
            {items.slice(0, 5).map((item, idx) => {
              const itemId = item.item_id || item.risk_id || item.id || idx;
              return <RiskItem key={itemId} item={item} />;
            })}
            {items.length > 5 && <li className="risk-more">+{items.length - 5} more</li>}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No risks or issues recorded</span>
          </div>
        )}
      </div>
    </div>
  );
}
