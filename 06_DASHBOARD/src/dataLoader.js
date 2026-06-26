/**
 * Data loader — reads from public/data/*.json (synced by npm run sync:data)
 * Returns empty arrays/objects when no data is present (clean shell).
 */
const DATA_FILES = [
  'dashboard_state',
  'project_state',
  'scope',
  'raid',
  'actions',
  'approvals',
  'sprints',
  'backlog',
  'todo',
  'reports',
  'documents',
  'velocity',
  'burndown',
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
  raid: 'raid.json',
  actions: 'actions.json',
  approvals: 'approvals.json',
  sprints: 'sprints.json',
  backlog: 'backlog.json',
  todo: 'todo.json',
  reports: 'reports.json',
  documents: 'documents.json',
  velocity: 'velocity.json',
  burndown: 'burndown.json',
};
