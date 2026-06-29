import React from 'react';

function EstimateItem({ item }) {
  // Schema: story_id, estimated_points, estimator, method, date
  return (
    <li className="estimate-item">
      <span className="estimate-id">{item.story_id || item.id || '—'}</span>
      <span className="estimate-name">{item.description || item.work_package || '—'}</span>
      {item.estimated_points != null && <span className="estimate-sp">{item.estimated_points} SP</span>}
      {item.hours != null && <span className="estimate-hours">{item.hours}h</span>}
      {item.effort && <span className="estimate-effort">{item.effort}</span>}
    </li>
  );
}

export default function EstimationSection({ data }) {
  const estimation = data && typeof data === 'object' ? data : {};
  // Schema uses 'estimates' array
  const estimates = Array.isArray(estimation.estimates) ? estimation.estimates : [];

  return (
    <div className="module estimation-section">
      <h2 className="module-title">Estimation</h2>
      <div className="module-content">
        {estimates.length > 0 ? (
          <ul className="estimate-list">
            {estimates.slice(0, 5).map((item, idx) => (
              <EstimateItem key={item.story_id || item.id || idx} item={item} />
            ))}
            {estimates.length > 5 && <li className="estimate-more">+{estimates.length - 5} more</li>}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No estimation data initialized</span>
          </div>
        )}
      </div>
    </div>
  );
}
