import React from 'react';

const RAG_COLORS = {
  green: '#22c55e',
  amber: '#f59e0b',
  yellow: '#eab308',
  red: '#ef4444',
};

function RAGBadge({ value, size = 'md' }) {
  const color = RAG_COLORS[value] || '#6b7280';
  const label = value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : 'N/A';
  return (
    <span
      className={`rag-badge rag-${value || 'grey'} rag-${size}`}
      style={{ backgroundColor: color }}
      title={value || 'No status'}
    >
      {label}
    </span>
  );
}

export default function ProjectStatus({ data, projectData }) {
  const rag = data.rag_status || 'green';
  const progress = data.overall_progress || 0;
  const projectName = projectData.project_name || null;
  const phase = projectData.current_phase || null;
  const currentSprint = data.current_sprint || null;
  const scopeStatus = data.scope_status || null;

  return (
    <div className="module project-status">
      <h2 className="module-title">Project Status</h2>
      <div className="module-content">
        <div className="metric-row">
          <span className="metric-label">Project Name</span>
          <span className="metric-value">
            {projectName ? String(projectName) : <span className="empty-inline">Not initialized</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">RAG Status</span>
          <span className="metric-value">
            <RAGBadge value={rag} />
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Phase</span>
          <span className="metric-value">
            {phase ? String(phase) : <span className="empty-inline">No phase set</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Scope Baseline</span>
          <span className="metric-value">
            {scopeStatus ? String(scopeStatus) : <span className="empty-inline">No baseline</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Overall Progress</span>
          <span className="metric-value">
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <span className="progress-label">{progress}%</span>
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Current Sprint</span>
          <span className="metric-value">
            {currentSprint ? String(currentSprint) : <span className="empty-inline">No sprint</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
