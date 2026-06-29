import React from 'react';

export default function ProgressSection({ data }) {
  const progress = data && typeof data === 'object' ? data : {};
  // Schema: overall_progress, requirements_completion, milestones_completion, actions_completion, basis
  // No hardcoded default — show empty state if no data
  const overallNum = typeof progress.overall_progress === 'number' ? progress.overall_progress : null;
  const percent = overallNum !== null
    ? Math.min(100, Math.max(0, Math.round(overallNum)))
    : null;

  return (
    <div className="module progress-section">
      <h2 className="module-title">Progress</h2>
      <div className="module-content">
        {percent !== null ? (
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: percent + '%' }} />
            <span className="progress-bar-label">{percent}%</span>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No progress data initialized</span>
          </div>
        )}
      </div>
    </div>
  );
}
