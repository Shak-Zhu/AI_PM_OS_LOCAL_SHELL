/**
 * JSON Data Consistency Audit Script
 *
 * Policy:
 * - Read-only: does not modify any files.
 * - Checks all 26 JSON files exist and parse.
 * - Checks all 26 source declarations (SOURCE_DECLARATIONS) for type accuracy:
 *     required: Markdown source must exist → missing is Major
 *     optional: Markdown source may not exist → missing is Minor
 *     generated: derived from other JSON data → no source file check
 *     no_source: explicitly no Markdown source → skip
 * - Detects orphan JSON entries (missing required fields).
 * - Outputs summary with: checked_files, source_declarations, required_sources,
 *     required_missing, optional_sources, optional_missing, generated_sources,
 *     no_source_files, critical_count, major_count, minor_count, result.
 *
 * Exit codes:
 *   0 = No Critical or Major issues found
 *   1 = Critical or Major issues found
 */

'use strict';

var fs = require('fs');
var path = require('path');

var BASE = path.resolve(__dirname, '..');
var DATA_DIR = path.join(BASE, '07_DATA');
var SCHEMA_DIR = path.join(BASE, '07_DATA/schemas');

// All 26 JSON files, each with an explicit source declaration
var SOURCE_DECLARATIONS = [
  // Required: source file expected to exist in any real project state
  { json_file: 'project_state.json',    source_path: '00_PM_MEMORY/PM_CURRENT_STATUS.md',              source_type: 'required',  reason: 'Core project state file — must exist' },
  { json_file: 'changes.json',          source_path: '01_PM_DOCUMENTS/PM_CHANGE_LOG.md',                 source_type: 'required',  reason: 'Change tracking — must exist' },
  { json_file: 'project_roles.json',    source_path: '00_PM_MEMORY/PM_ROLE_CONFIG.md',                 source_type: 'required',  reason: 'Role configuration — must exist' },
  { json_file: 'input_log.json',       source_path: '00_PM_MEMORY/PM_INPUT_LOG.md',                    source_type: 'required',  reason: 'Input log — must exist' },
  { json_file: 'requirements.json',     source_path: '01_PM_DOCUMENTS/PM_REQUIREMENTS_REGISTER.md',      source_type: 'required',  reason: 'Requirements register — must exist' },
  { json_file: 'scope.json',           source_path: '01_PM_DOCUMENTS/PM_SCOPE_BASELINE.md',            source_type: 'required',  reason: 'Scope baseline — must exist' },
  { json_file: 'backlog.json',         source_path: '02_AGILE/PM_PRODUCT_BACKLOG.md',                  source_type: 'required',  reason: 'Product backlog — must exist' },
  { json_file: 'sprints.json',         source_path: '02_AGILE/PM_SPRINT_BACKLOG.md',                  source_type: 'required',  reason: 'Sprint backlog — must exist' },
  { json_file: 'burndown.json',        source_path: '02_AGILE/PM_DAILY_STANDUP_LOG.md',              source_type: 'required',  reason: 'Daily standup log — must exist' },
  { json_file: 'velocity.json',        source_path: '02_AGILE/PM_VELOCITY_LOG.md',                   source_type: 'required',  reason: 'Velocity log — must exist' },
  // Optional: source is a registry/template that does not exist in clean product shell
  // These are tracked by the sync script but expected to be absent in shell
  // approvals.json: PM_PENDING_UPDATES.md may not exist in shell template — optional to allow clean shell pass
  { json_file: 'approvals.json',        source_path: '00_PM_MEMORY/PM_PENDING_UPDATES.md',              source_type: 'optional',  reason: 'PU tracking — absent in clean shell template, tracked by sync' },
  // documents.json: from PM_DOCUMENT_REGISTRY.md (corrected per EXT-QC-005)
  { json_file: 'documents.json',       source_path: '00_PM_MEMORY/PM_DOCUMENT_REGISTRY.md',          source_type: 'optional',  reason: 'Document registry — absent in clean shell, tracked by sync' },
  // meetings.json: from PM_MEETING_INDEX.md (corrected per EXT-QC-005)
  { json_file: 'meetings.json',        source_path: '03_MEETINGS/meeting_index/PM_MEETING_INDEX.md', source_type: 'optional',  reason: 'Meeting index — absent in clean shell, tracked by sync' },
  // milestones.json: from PM_SCHEDULE_BASELINE.md milestone table (corrected per EXT-QC-005)
  { json_file: 'milestones.json',      source_path: '01_PM_DOCUMENTS/PM_SCHEDULE_BASELINE.md',        source_type: 'optional',  reason: 'Milestone table in schedule baseline — absent in clean shell, tracked by sync' },
  { json_file: 'estimation.json',      source_path: '01_PM_DOCUMENTS/PM_ESTIMATION_LOG.md',           source_type: 'optional',  reason: 'Estimation log — absent in clean shell, tracked by sync' },
  // gantt.json: derived from PM_SCHEDULE_BASELINE.md (corrected per EXT-QC-005)
  { json_file: 'gantt.json',          source_path: '01_PM_DOCUMENTS/PM_SCHEDULE_BASELINE.md',        source_type: 'optional',  reason: 'Gantt tasks in schedule baseline — absent in clean shell, tracked by sync' },
  // raid.json: from PM_RAID_LOG.md (uses items array per EXT-QC-006)
  { json_file: 'raid.json',            source_path: '01_PM_DOCUMENTS/PM_RAID_LOG.md',                 source_type: 'optional',  reason: 'RAID log — absent in clean shell, tracked by sync' },
  { json_file: 'reports.json',         source_path: '05_REPORTS/',                                    source_type: 'optional',  reason: 'Reports directory — absent in clean shell, tracked by sync' },
  // todo.json: aggregated from 04_TODO/daily/*.md (corrected per EXT-QC-005)
  { json_file: 'todo.json',            source_path: '04_TODO/daily/',                                 source_type: 'optional',  reason: 'Daily TODO files — absent in clean shell (empty dir), tracked by sync' },
  // Generated: derived from other JSON data
  { json_file: 'dashboard_state.json',  source_path: null,                                             source_type: 'generated', reason: 'Derived from project_state.json, approvals.json' },
  // No Markdown source
  { json_file: 'decisions.json',       source_path: null,                                             source_type: 'no_source', reason: 'Derived from 03_MEETINGS/meeting_minutes/*.md (JSON-to-JSON, not in scope)' },
  { json_file: 'actions.json',         source_path: null,                                             source_type: 'no_source', reason: 'Derived from 03_MEETINGS/meeting_minutes/*.md (JSON-to-JSON, not in scope)' },
  { json_file: 'daily_briefing.json', source_path: null,                                            source_type: 'no_source', reason: 'Auto-generated from multiple sources, not in sync scope' },
  { json_file: 'meeting_actions.json', source_path: null,                                            source_type: 'no_source', reason: 'Derived from meeting minutes, not in sync scope' },
  { json_file: 'meeting_decisions.json', source_path: null,                                         source_type: 'no_source', reason: 'Derived from meeting minutes, not in sync scope' },
  { json_file: 'progress.json',        source_path: null,                                            source_type: 'no_source', reason: 'Derived from sprint/backlog data, not in sync scope' }
];

// Fast lookup: json_file → declaration
var SOURCE_MAP = {};
for (var i = 0; i < SOURCE_DECLARATIONS.length; i++) {
  SOURCE_MAP[SOURCE_DECLARATIONS[i].json_file] = SOURCE_DECLARATIONS[i];
}

// All 26 JSON files
var ALL_JSON_FILES = [
  'actions.json', 'approvals.json', 'backlog.json', 'burndown.json',
  'changes.json', 'daily_briefing.json', 'dashboard_state.json',
  'decisions.json', 'documents.json', 'estimation.json', 'gantt.json',
  'input_log.json', 'meeting_actions.json', 'meeting_decisions.json',
  'meetings.json', 'milestones.json', 'progress.json', 'project_roles.json',
  'project_state.json', 'raid.json', 'reports.json', 'requirements.json',
  'scope.json', 'sprints.json', 'todo.json', 'velocity.json'
];

var SCHEMA_FILES = ALL_JSON_FILES.map(function(f) {
  return f.replace('.json', '.schema.json');
});

function log(msg)     { console.log('[audit] ' + msg); }
function error(msg)  { console.error('[audit] ERROR: ' + msg); }
function critical(msg){ console.error('[audit] CRITICAL: ' + msg); }
function major(msg)   { console.error('[audit] MAJOR: ' + msg); }
function minor(msg)   { console.log('[audit] MINOR: ' + msg); }

function parseJson(fp) {
  try {
    return { ok: true, data: JSON.parse(fs.readFileSync(fp, 'utf8')) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function checkJsonExistsAndParses(jsonFile) {
  var fp = path.join(DATA_DIR, jsonFile);
  if (!fs.existsSync(fp)) {
    return { severity: 'CRITICAL', msg: jsonFile + ': file does not exist' };
  }
  var r = parseJson(fp);
  if (!r.ok) {
    return { severity: 'CRITICAL', msg: jsonFile + ': parse error: ' + r.error };
  }
  return null;
}

function checkSchemaExists(schemaFile) {
  var fp = path.join(SCHEMA_DIR, schemaFile);
  if (!fs.existsSync(fp)) {
    return { severity: 'CRITICAL', msg: schemaFile + ': schema file does not exist' };
  }
  var r = parseJson(fp);
  if (!r.ok) {
    return { severity: 'CRITICAL', msg: schemaFile + ': schema parse error: ' + r.error };
  }
  return null;
}

function checkSourceMapConsistency(jsonFile) {
  var decl = SOURCE_MAP[jsonFile];
  if (!decl) return null; // Not in our 26-file scope

  if (decl.source_type === 'no_source' || decl.source_type === 'generated') {
    return null; // No file to check
  }

  var srcFull = path.join(BASE, decl.source_path);

  // For optional/required sources that are directories, check if dir exists
  if (decl.source_path && decl.source_path.endsWith('/')) {
    if (!fs.existsSync(srcFull)) {
      if (decl.source_type === 'required') {
        return { severity: 'MAJOR', msg: jsonFile + ': required source directory does not exist: ' + decl.source_path };
      } else {
        return { severity: 'MINOR', msg: jsonFile + ': optional source directory does not exist: ' + decl.source_path };
      }
    }
    return null;
  }

  if (!fs.existsSync(srcFull)) {
    if (decl.source_type === 'required') {
      return { severity: 'MAJOR', msg: jsonFile + ': required source file does not exist: ' + decl.source_path };
    } else {
      return { severity: 'MINOR', msg: jsonFile + ': optional source file does not exist: ' + decl.source_path };
    }
  }
  return null;
}

function checkOrphanJsonEntries(jsonFile) {
  var fp = path.join(DATA_DIR, jsonFile);
  var r = parseJson(fp);
  if (!r.ok) return null;
  var data = r.data;

  var arrayFields = {
    'actions.json': 'actions', 'decisions.json': 'decisions', 'todo.json': 'todos',
    'approvals.json': 'approvals', 'changes.json': 'changes',
    'requirements.json': 'requirements', 'documents.json': 'documents',
    'meetings.json': 'meetings', 'milestones.json': 'milestones',
    'raid.json': 'items', 'backlog.json': 'backlog', 'sprints.json': 'sprints',
    'burndown.json': 'burndown', 'velocity.json': 'velocity',
    'project_roles.json': 'roles', 'input_log.json': 'entries'
  };

  var idFields = ['id', '_id', 'action_id', 'decision_id', 'todo_id',
    'approval_id', 'change_id', 'req_id', 'document_id', 'meeting_id',
    'milestone_id', 'item_id', 'risk_id', 'backlog_id', 'sprint_id', 'role_id', 'entry_id'];

  var containerKey = arrayFields[jsonFile];
  if (!containerKey) return null;

  var arr = data[containerKey];
  if (!Array.isArray(arr)) return null;

  var issues = [];
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    if (typeof item !== 'object' || item === null) continue;

    var hasId = false;
    for (var f = 0; f < idFields.length; f++) {
      if (item[idFields[f]]) { hasId = true; break; }
    }
    if (!hasId) {
      issues.push('item[' + i + ']: missing ID field');
    }

    if (item.owner === undefined || item.owner === null || item.owner === '') {
      issues.push('item[' + i + ']: missing owner');
    }

    if (item.status === undefined || item.status === null || item.status === '') {
      issues.push('item[' + i + ']: missing status');
    }

    if ((jsonFile === 'actions.json' || jsonFile === 'todo.json') &&
        (item.due_date === undefined || item.due_date === null || item.due_date === '')) {
      issues.push('item[' + i + ']: missing due_date');
    }
  }

  if (issues.length === 0) return null;
  return { severity: 'MAJOR', msg: jsonFile + ': ' + issues.slice(0, 3).join('; ') + (issues.length > 3 ? ' (+' + (issues.length - 3) + ' more)' : '') };
}

function checkJsonSchemaCompliance(jsonFile) {
  var fp = path.join(DATA_DIR, jsonFile);
  var schemaFile = path.join(SCHEMA_DIR, jsonFile.replace('.json', '.schema.json'));

  var r = parseJson(fp);
  if (!r.ok) return null;

  if (!fs.existsSync(schemaFile)) return null;

  var sr = parseJson(schemaFile);
  if (!sr.ok) {
    return { severity: 'CRITICAL', msg: jsonFile + ': schema file unparseable: ' + sr.error };
  }

  var schema = sr.data;
  var data = r.data;

  if (schema.type === 'object' && (typeof data !== 'object' || data === null || Array.isArray(data))) {
    return { severity: 'CRITICAL', msg: jsonFile + ': top-level type mismatch (expected object)' };
  }
  if (schema.type === 'array' && !Array.isArray(data)) {
    return { severity: 'CRITICAL', msg: jsonFile + ': top-level type mismatch (expected array)' };
  }

  if (schema.required && Array.isArray(data)) {
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      if (typeof item !== 'object' || item === null) continue;
      for (var j = 0; j < schema.required.length; j++) {
        var field = schema.required[j];
        if (item[field] === undefined || item[field] === null || item[field] === '') {
          return { severity: 'MAJOR', msg: jsonFile + '[' + i + ']: missing required field: ' + field };
        }
      }
    }
  }

  return null;
}

function main() {
  console.log('=== JSON Data Consistency Audit ===');
  console.log('Base: ' + BASE);
  console.log('');

  var criticalCount = 0, majorCount = 0, minorCount = 0;
  var issues = [];

  // Counters for source declaration summary
  var requiredSources = 0, requiredMissing = 0;
  var optionalSources = 0, optionalMissing = 0;
  var generatedSources = 0, noSourceFiles = 0;

  for (var d = 0; d < SOURCE_DECLARATIONS.length; d++) {
    var decl = SOURCE_DECLARATIONS[d];
    if (decl.source_type === 'required') requiredSources++;
    else if (decl.source_type === 'optional') optionalSources++;
    else if (decl.source_type === 'generated') generatedSources++;
    else if (decl.source_type === 'no_source') noSourceFiles++;
  }

  log('Checking JSON files exist and parse...');
  for (var i = 0; i < ALL_JSON_FILES.length; i++) {
    var r = checkJsonExistsAndParses(ALL_JSON_FILES[i]);
    if (r) { issues.push(r); if (r.severity === 'CRITICAL') criticalCount++; else if (r.severity === 'MAJOR') majorCount++; else minorCount++; }
  }
  log('  Checked: ' + ALL_JSON_FILES.length + ' JSON files');

  log('Checking schemas exist and parse...');
  for (var j = 0; j < SCHEMA_FILES.length; j++) {
    var sr = checkSchemaExists(SCHEMA_FILES[j]);
    if (sr) { issues.push(sr); if (sr.severity === 'CRITICAL') criticalCount++; else if (sr.severity === 'MAJOR') majorCount++; else minorCount++; }
  }
  log('  Checked: ' + SCHEMA_FILES.length + ' schema files');

  log('Checking source map consistency...');
  var srcMissingMajor = 0, srcMissingMinor = 0;
  for (var k = 0; k < ALL_JSON_FILES.length; k++) {
    var cr = checkSourceMapConsistency(ALL_JSON_FILES[k]);
    if (cr) {
      issues.push(cr);
      if (cr.severity === 'CRITICAL') criticalCount++;
      else if (cr.severity === 'MAJOR') { majorCount++; srcMissingMajor++; }
      else { minorCount++; srcMissingMinor++; }
    }
  }
  // Recount required/optional based on actual findings
  requiredMissing = srcMissingMajor;
  optionalMissing = srcMissingMinor;
  log('  Checked: ' + ALL_JSON_FILES.length + ' source declarations');

  log('Checking for orphan JSON entries...');
  for (var m = 0; m < ALL_JSON_FILES.length; m++) {
    var ar = checkOrphanJsonEntries(ALL_JSON_FILES[m]);
    if (ar) { issues.push(ar); if (ar.severity === 'CRITICAL') criticalCount++; else if (ar.severity === 'MAJOR') majorCount++; else minorCount++; }
  }

  log('Checking schema compliance...');
  for (var n = 0; n < ALL_JSON_FILES.length; n++) {
    var cr2 = checkJsonSchemaCompliance(ALL_JSON_FILES[n]);
    if (cr2) { issues.push(cr2); if (cr2.severity === 'CRITICAL') criticalCount++; else if (cr2.severity === 'MAJOR') majorCount++; else minorCount++; }
  }

  if (issues.length > 0) {
    console.log('');
    console.log('=== Issues Found ===');
    for (var p = 0; p < issues.length; p++) {
      var issue = issues[p];
      if (issue.severity === 'CRITICAL') critical(issue.msg);
      else if (issue.severity === 'MAJOR') major(issue.msg);
      else minor(issue.msg);
    }
  }

  console.log('');
  console.log('=== Audit Summary ===');
  console.log('checked_files: ' + ALL_JSON_FILES.length);
  console.log('source_declarations: ' + SOURCE_DECLARATIONS.length);
  console.log('required_sources: ' + requiredSources);
  console.log('required_missing: ' + requiredMissing);
  console.log('optional_sources: ' + optionalSources);
  console.log('optional_missing: ' + optionalMissing);
  console.log('generated_sources: ' + generatedSources);
  console.log('no_source_files: ' + noSourceFiles);
  console.log('critical_count: ' + criticalCount);
  console.log('major_count: ' + majorCount);
  console.log('minor_count: ' + minorCount);

  if (criticalCount > 0 || majorCount > 0) {
    console.log('result: FAIL');
    process.exit(1);
  } else {
    console.log('result: PASS');
    process.exit(0);
  }
}

main();
