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

function EmptyState({ message = 'No data yet' }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">—</span>
      <span className="empty-state-text">{message}</span>
    </div>
  );
}

export { EmptyState };

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
        const files = [
          'project_state', 'scope', 'raid', 'actions', 'approvals',
          'sprints', 'backlog', 'todo', 'reports', 'documents',
          'velocity', 'burndown',
        ];
        return Promise.all(
          files.map(f =>
            fetch(`./data/${f}.json`)
              .then(r => r.ok ? r.json() : {})
              .catch(() => ({}))
          )
        ).then(results => {
          const obj = { dashboard_state: ds };
          files.forEach((f, i) => { obj[f] = results[i] || {}; });
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
        <ActionsSection data={data.actions} />
        <ApprovalsSection data={data.approvals} />
        <SprintSection data={data.sprints} />
        <BacklogSection data={data.backlog} />
        <TodoSection data={data.todo} />
        <ReportsSection data={data.reports} />
        <DocumentsSection data={data.documents} />
        <MilestoneSection />
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
