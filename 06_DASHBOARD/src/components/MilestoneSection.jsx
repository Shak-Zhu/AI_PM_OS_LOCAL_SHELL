import React from 'react';

export default function MilestoneSection() {
  return (
    <div className="module milestone-section">
      <h2 className="module-title">Milestones / Progress</h2>
      <div className="module-content">
        <div className="empty-state">
          <span className="empty-state-icon">—</span>
          <span className="empty-state-text">Milestone data not initialized</span>
        </div>
      </div>
    </div>
  );
}
