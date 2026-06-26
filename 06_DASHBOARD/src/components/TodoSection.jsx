import React from 'react';

function TodoItem({ item }) {
  const isDone = item.status === 'done' || item.status === 'completed' || item.completed;
  return (
    <li className={`todo-item ${isDone ? 'todo-done' : ''}`}>
      <span className="item-id">{item.id || item.todo_id || '—'}</span>
      <span className="item-title">{item.title || item.task || '—'}</span>
      {item.due_date && <span className="item-date">{item.due_date}</span>}
      {isDone && <span className="status-badge status-done">Done</span>}
    </li>
  );
}

export default function TodoSection({ data }) {
  const todos = Array.isArray(data.todos) ? data.todos : [];
  const open = todos.filter(t => t.status !== 'done' && t.status !== 'completed' && !t.completed);
  const total = todos.length;
  const done = todos.length - open.length;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="module todo-section">
      <h2 className="module-title">To-do</h2>
      <div className="module-content">
        <div className="metric-row">
          <span className="metric-label">Today's To-do</span>
          <span className="metric-value">
            {open.length > 0 ? open.length : <span className="empty-inline">None</span>}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Completion Rate</span>
          <span className="metric-value">
            {total > 0
              ? <span>
                  <span className="progress-bar-wrap" style={{ display: 'inline-block', width: '60px', verticalAlign: 'middle' }}>
                    <div className="progress-bar" style={{ width: `${rate}%` }} />
                  </span>
                  <span> {rate}%</span>
                </span>
              : <span className="empty-inline">No data</span>}
          </span>
        </div>
        {todos.length > 0 ? (
          <ul className="todo-list">
            {todos.slice(0, 6).map((item, idx) => (
              <TodoItem key={item.id || item.todo_id || idx} item={item} />
            ))}
            {todos.length > 6 && <li className="todo-more">+{todos.length - 6} more</li>}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No to-do items</span>
          </div>
        )}
      </div>
    </div>
  );
}
