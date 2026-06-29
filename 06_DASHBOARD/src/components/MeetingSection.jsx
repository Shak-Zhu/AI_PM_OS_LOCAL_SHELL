import React from 'react';

function MeetingItem({ item }) {
  const meetingId = item.meeting_id || item.id || '—';
  return (
    <li className="meeting-item">
      <span className="meeting-id">{meetingId}</span>
      <span className="meeting-title">{item.title || '—'}</span>
      {item.date && <span className="meeting-date">{item.date}</span>}
      {item.status && <span className={`status-badge status-${item.status}`}>{item.status}</span>}
    </li>
  );
}

function ActionItem({ item }) {
  // meeting_actions schema: action_id, description, owner, status, due_date
  return (
    <li className="action-item">
      <span className="action-id">{item.action_id || item.id || '—'}</span>
      <span className="action-desc">{item.description || '—'}</span>
      {item.owner && <span className="action-owner">{item.owner}</span>}
      {item.status && <span className={`status-badge status-${item.status}`}>{item.status}</span>}
    </li>
  );
}

function DecisionItem({ item }) {
  // meeting_decisions schema: decision_id, description, decided_by, date
  return (
    <li className="decision-item">
      <span className="decision-id">{item.decision_id || item.id || '—'}</span>
      <span className="decision-desc">{item.description || '—'}</span>
      {item.decided_by && <span className="decision-by">{item.decided_by}</span>}
    </li>
  );
}

export default function MeetingSection({ meetings, meeting_actions, meeting_decisions }) {
  const meetingsArr = Array.isArray(meetings && meetings.meetings) ? meetings.meetings : [];
  const actionsArr = Array.isArray(meeting_actions && meeting_actions.meeting_actions)
    ? meeting_actions.meeting_actions : [];
  const decisionsArr = Array.isArray(meeting_decisions && meeting_decisions.meeting_decisions)
    ? meeting_decisions.meeting_decisions : [];

  const hasMeetings = meetingsArr.length > 0;
  const hasActions = actionsArr.length > 0;
  const hasDecisions = decisionsArr.length > 0;
  const hasAny = hasMeetings || hasActions || hasDecisions;

  return (
    <div className="module meeting-section">
      <h2 className="module-title">Meetings</h2>
      <div className="module-content">
        {hasAny ? (
          <div>
            {hasMeetings && (
              <div>
                <div className="metric-row">
                  <span className="metric-label">Total Meetings</span>
                  <span className="metric-value">{meetingsArr.length}</span>
                </div>
                <ul className="meeting-list">
                  {meetingsArr.slice(0, 5).map((item, idx) => (
                    <MeetingItem key={item.meeting_id || item.id || idx} item={item} />
                  ))}
                  {meetingsArr.length > 5 && <li className="meeting-more">+{meetingsArr.length - 5} more</li>}
                </ul>
              </div>
            )}
            {hasActions && (
              <div>
                <div className="metric-row">
                  <span className="metric-label">Action Items</span>
                  <span className="metric-value">{actionsArr.length}</span>
                </div>
                <ul className="action-list">
                  {actionsArr.slice(0, 5).map((item, idx) => (
                    <ActionItem key={item.action_id || item.id || idx} item={item} />
                  ))}
                  {actionsArr.length > 5 && <li className="action-more">+{actionsArr.length - 5} more</li>}
                </ul>
              </div>
            )}
            {hasDecisions && (
              <div>
                <div className="metric-row">
                  <span className="metric-label">Decisions</span>
                  <span className="metric-value">{decisionsArr.length}</span>
                </div>
                <ul className="decision-list">
                  {decisionsArr.slice(0, 5).map((item, idx) => (
                    <DecisionItem key={item.decision_id || item.id || idx} item={item} />
                  ))}
                  {decisionsArr.length > 5 && <li className="decision-more">+{decisionsArr.length - 5} more</li>}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">—</span>
            <span className="empty-state-text">No meetings recorded</span>
          </div>
        )}
      </div>
    </div>
  );
}
