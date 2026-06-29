import React from 'react';

function GanttTaskBar({ task }) {
  const raw = task.progress;
  let progNum = null;
  if (raw !== undefined && raw !== null) {
    const n = Number(raw);
    if (!isNaN(n)) {
      progNum = Math.min(100, Math.max(0, Math.round(n)));
    }
  }

  const colorMap = {
    completed: '#4caf50',
    in_progress: '#ff9800',
    not_started: '#9e9e9e',
    delayed: '#f44336',
  };
  const barColor = colorMap[task.status] || '#9e9e9e';

  const startStr = task.start_date || '?';
  const endStr = task.end_date || '?';
  const taskName = task.name || task.task_id || '';
  const taskIdStr = task.task_id || task.name || '—';

  return (
    <li className="gantt-task">
      <span className="gantt-task-id">{taskIdStr}</span>
      <div className="gantt-bar-container" title={startStr + ' \u2192 ' + endStr}>
        {progNum !== null ? (
          <div className="gantt-bar" style={{ width: progNum + '%', backgroundColor: barColor }}>
            <span className="gantt-bar-label">{taskName}</span>
          </div>
        ) : (
          <div className="gantt-bar" style={{ backgroundColor: barColor }}>
            <span className="gantt-bar-label">{taskName}</span>
          </div>
        )}
      </div>
      <span className="gantt-dates">{startStr} &rarr; {endStr}</span>
    </li>
  );
}

export default function GanttSection({ data }) {
  const gantt = data && typeof data === 'object' ? data : {};
  const tasks = Array.isArray(gantt.tasks) ? gantt.tasks : [];
  const hasReason = !!gantt.reason;

  return (
    <div className="module gantt-section">
      <h2 className="module-title">Gantt Chart</h2>
      <div className="module-content">
        {hasReason ? (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">{gantt.reason}</span>
          </div>
        ) : tasks.length > 0 ? (
          <ul className="gantt-list">
            {tasks.slice(0, 10).map(function(task, idx) {
              const k = task.task_id || task.name || idx;
              return <GanttTaskBar key={k} task={task} />;
            })}
            {tasks.length > 10 ? <li className="gantt-more">+{tasks.length - 10} more tasks</li> : null}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No Gantt data initialized</span>
          </div>
        )}
      </div>
    </div>
  );
}
