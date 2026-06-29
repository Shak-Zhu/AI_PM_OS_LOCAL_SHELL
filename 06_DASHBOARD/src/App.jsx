import { useState, useEffect } from 'react';
import ProjectStatus from './components/ProjectStatus.jsx';
import ScopeSection from './components/ScopeSection.jsx';
import RaidSection from './components/RaidSection.jsx';
import ActionsSection from './components/ActionsSection.jsx';
import ApprovalsSection from './components/ApprovalsSection.jsx';
import SprintSection from './components/SprintSection.jsx';
import BacklogSection from './components/BacklogSection.jsx';
import TodoSection from './components/TodoSection.jsx';
import ReportsSection from './components/ReportsSection.jsx';
import DocumentsSection from './components/DocumentsSection.jsx';
import MilestoneSection from './components/MilestoneSection.jsx';
import GanttSection from './components/GanttSection.jsx';
import MeetingSection from './components/MeetingSection.jsx';
import ProgressSection from './components/ProgressSection.jsx';
import EstimationSection from './components/EstimationSection.jsx';
import AgileMetricsSection from './components/AgileMetricsSection.jsx';

function EmptyState({ message = 'No data yet' }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">—</span>
      <span className="empty-state-text">{message}</span>
    </div>
  );
}

export { EmptyState };

// All 21 P0 data files loaded by App.jsx (WP-021 scope §3)
const P0_DATA_FILES = [
  'dashboard_state', 'project_state', 'scope', 'milestones', 'gantt',
  'raid', 'actions', 'approvals', 'sprints', 'backlog', 'burndown',
  'velocity', 'meetings', 'meeting_actions', 'meeting_decisions',
  'todo', 'reports', 'documents', 'progress', 'estimation', 'project_roles',
];

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('./data/dashboard_state.json')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load dashboard_state.json — run `npm run sync:data` first');
        return r.json();
      })
      .then(ds => {
        return Promise.all(
          P0_DATA_FILES.slice(1).map(f =>  // skip dashboard_state (already loaded)
            fetch(`./data/${f}.json`)
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          )
        ).then(results => {
          const obj = { dashboard_state: ds };
          P0_DATA_FILES.slice(1).forEach((f, i) => { obj[f] = results[i] || {}; });
          return obj;
        });
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <span>Loading Dashboard…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Dashboard Error</h2>
        <p className="error-message">{error}</p>
        <p className="error-hint">Run <code>npm run sync:data</code> to prepare data files.</p>
      </div>
    );
  }

  const ds = data.dashboard_state || {};
  const ps = data.project_state || {};

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">AI PM OS Dashboard</h1>
        <span className="dashboard-subtitle">
          {ps.project_name || 'Project Not Initialized'}
          {ps.current_phase ? ` — ${ps.current_phase}` : ''}
        </span>
      </header>

      <main className="dashboard-grid">
        <ProjectStatus data={ds} projectData={ps} />
        <ScopeSection data={data.scope} />
        <RaidSection data={data.raid} />
        <MilestoneSection data={data.milestones} />
        <GanttSection data={data.gantt} />
        <ActionsSection data={data.actions} />
        <ApprovalsSection data={data.approvals} />
        <SprintSection data={data.sprints} />
        <BacklogSection data={data.backlog} />
        <AgileMetricsSection burndown={data.burndown} velocity={data.velocity} backlog={data.backlog} />
        <MeetingSection meetings={data.meetings} meeting_actions={data.meeting_actions} meeting_decisions={data.meeting_decisions} />
        <ProgressSection data={data.progress} />
        <EstimationSection data={data.estimation} />
        <TodoSection data={data.todo} />
        <ReportsSection data={data.reports} />
        <DocumentsSection data={data.documents} />
      </main>

      <footer className="dashboard-footer">
        <span>RAG: </span>
        <span className={`rag-badge rag-${ds.rag_status || 'green'}`}>
          {ds.rag_status || 'green'}
        </span>
        <span className="footer-sep">·</span>
        <span>Overall Progress: {ds.overall_progress || 0}%</span>
        <span className="footer-sep">·</span>
        <span>Pending Approvals: {ds.pending_approvals || 0}</span>
        <span className="footer-sep">·</span>
        <span>Open Actions: {ds.open_actions || 0}</span>
        <span className="footer-sep">·</span>
        <span>Open Risks: {ds.open_risks || 0}</span>
        <span className="footer-sep">·</span>
        <span>High Risks: {ds.high_risks || 0}</span>
      </footer>
    </div>
  );
}
