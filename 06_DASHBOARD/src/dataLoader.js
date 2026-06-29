/**
 * Data loader — reads from public/data/*.json (synced by npm run sync:data)
 * Returns empty arrays/objects when no data is present (clean shell).
 * P0: 21 required data files (WP-021 scope §3)
 */
const DATA_FILES = [
  'dashboard_state',
  'project_state',
  'scope',
  'milestones',
  'gantt',
  'raid',
  'actions',
  'approvals',
  'sprints',
  'backlog',
  'burndown',
  'velocity',
  'meetings',
  'meeting_actions',
  'meeting_decisions',
  'todo',
  'reports',
  'documents',
  'progress',
  'estimation',
  'project_roles',
];

const BASE = import.meta.env.BASE_URL + 'data/';

function loadJson(filename) {
  try {
    const val = import.meta.glob('/data/*.json', { query: '?raw', import: 'default', eager: true });
    const key = Object.keys(val).find(k => k.endsWith(`/${filename}.json`));
    if (key && val[key]) {
      return JSON.parse(val[key]);
    }
  } catch (e) {
    // fall through to empty
  }
  return null;
}

export function loadDashboardData() {
  const data = {};
  for (const name of DATA_FILES) {
    data[name] = loadJson(name);
  }
  return data;
}

export const DATA_STATUS = {
  dashboard_state: 'dashboard_state.json',
  project_state: 'project_state.json',
  scope: 'scope.json',
  milestones: 'milestones.json',
  gantt: 'gantt.json',
  raid: 'raid.json',
  actions: 'actions.json',
  approvals: 'approvals.json',
  sprints: 'sprints.json',
  backlog: 'backlog.json',
  burndown: 'burndown.json',
  velocity: 'velocity.json',
  meetings: 'meetings.json',
  meeting_actions: 'meeting_actions.json',
  meeting_decisions: 'meeting_decisions.json',
  todo: 'todo.json',
  reports: 'reports.json',
  documents: 'documents.json',
  progress: 'progress.json',
  estimation: 'estimation.json',
  project_roles: 'project_roles.json',
};
