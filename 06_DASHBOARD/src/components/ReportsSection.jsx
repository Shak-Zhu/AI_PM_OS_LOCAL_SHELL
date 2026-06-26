import React from 'react';

function ReportItem({ item }) {
  const type = item.report_type || item.type || '—';
  return (
    <li className="report-item">
      <span className="item-id">{item.id || '—'}</span>
      <span className="item-title">{item.title || item.name || '—'}</span>
      <span className="item-type">{type}</span>
      {item.status && <span className={`status-badge status-${item.status}`}>{item.status}</span>}
    </li>
  );
}

export default function ReportsSection({ data }) {
  const reports = Array.isArray(data.reports) ? data.reports : [];
  const daily = reports.filter(r =>
    r.report_type === 'daily' || r.type === 'daily' || r.category === 'daily');
  const weekly = reports.filter(r =>
    r.report_type === 'weekly' || r.type === 'weekly' || r.category === 'weekly');
  const monthly = reports.filter(r =>
    r.report_type === 'monthly' || r.type === 'monthly' || r.category === 'monthly');
  const steering = reports.filter(r =>
    r.report_type === 'steering' || r.type === 'steering' || r.category === 'steering');

  return (
    <div className="module reports-section">
      <h2 className="module-title">Reports</h2>
      <div className="module-content">
        <div className="metric-row">
          <span className="metric-label">Daily</span>
          <span className="metric-value">
            {daily.length > 0 ? daily.length : <span className="empty-inline">None</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Weekly</span>
          <span className="metric-value">
            {weekly.length > 0 ? weekly.length : <span className="empty-inline">None</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Monthly</span>
          <span className="metric-value">
            {monthly.length > 0 ? monthly.length : <span className="empty-inline">None</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Steering</span>
          <span className="metric-value">
            {steering.length > 0 ? steering.length : <span className="empty-inline">None</span>}
          </span>
        </div>
        {reports.length > 0 ? (
          <ul className="report-list">
            {reports.slice(0, 5).map((item, idx) => (
              <ReportItem key={item.id || idx} item={item} />
            ))}
            {reports.length > 5 && <li className="report-more">+{reports.length - 5} more</li>}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No reports generated</span>
          </div>
        )}
      </div>
    </div>
  );
}
