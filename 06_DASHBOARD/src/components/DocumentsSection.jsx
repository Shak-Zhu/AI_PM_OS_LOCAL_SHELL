import React from 'react';

function DocItem({ item }) {
  const health = item.health || item.status;
  const healthColor = health === 'healthy' || health === 'complete' ? 'rag-green'
    : health === 'incomplete' ? 'rag-amber'
    : health === 'missing' ? 'rag-red' : 'rag-grey';
  return (
    <li className="doc-item">
      <span className="item-id">{item.id || item.document_id || '—'}</span>
      <span className="item-title">{item.title || item.name || '—'}</span>
      {health && <span className={`rag-badge ${healthColor}`}>{health}</span>}
    </li>
  );
}

export default function DocumentsSection({ data }) {
  const documents = Array.isArray(data.documents) ? data.documents : [];
  const healthScore = data.document_health_score || data.health_score || null;

  return (
    <div className="module documents-section">
      <h2 className="module-title">Document Health</h2>
      <div className="module-content">
        <div className="metric-row">
          <span className="metric-label">Documents</span>
          <span className="metric-value">
            {documents.length > 0 ? documents.length : <span className="empty-inline">None</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Health Score</span>
          <span className="metric-value">
            {healthScore !== null && healthScore !== undefined
              ? <span>{Number(healthScore)}%</span>
              : <span className="empty-inline">Not scored</span>}
          </span>
        </div>
        {documents.length > 0 ? (
          <ul className="doc-list">
            {documents.slice(0, 5).map((item, idx) => (
              <DocItem key={item.id || item.document_id || idx} item={item} />
            ))}
            {documents.length > 5 && <li className="doc-more">+{documents.length - 5} more</li>}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No documents tracked</span>
          </div>
        )}
      </div>
    </div>
  );
}
