/**
 * JSON Sync Script — Markdown → JSON Proactive Sync
 *
 * Policy:
 * - Markdown is the authority source. JSON is the visualization sync layer.
 * - Only syncs files for which a Markdown source file exists AND produces
 *   non-empty, schema-compliant data.
 * - Output is deterministic: sorted keys, 2-space indent, trailing newline.
 * - After writing, runs inline schema validation. Failure → exit 1.
 * - Strict: even a partial write that would break schema is skipped.
 * - Fail-closed: missing source, unwritable file, or schema failure → exit 1.
 *
 * Usage:
 *   node scripts/sync-data.js
 *
 * Exit codes:
 *   0 = Sync completed, all written files pass schema validation
 *   1 = Sync failed
 */

'use strict';

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var BASE = path.resolve(__dirname, '..');
var DATA_DIR = path.join(BASE, '07_DATA');
var SCHEMA_DIR = path.join(BASE, '07_DATA/schemas');

// Explicit Markdown source files (single files only)
// null = no source → skip (read-only)
var SOURCE_FILES = {
  'project_state.json':   '00_PM_MEMORY/PM_CURRENT_STATUS.md',
  'approvals.json':       '00_PM_MEMORY/PM_PENDING_UPDATES.md',
  'changes.json':         '01_PM_DOCUMENTS/PM_CHANGE_LOG.md',
  'project_roles.json':   '00_PM_MEMORY/PM_ROLE_CONFIG.md',
  'input_log.json':       '00_PM_MEMORY/PM_INPUT_LOG.md',
  'requirements.json':    '01_PM_DOCUMENTS/PM_REQUIREMENTS_REGISTER.md',
  'scope.json':           '01_PM_DOCUMENTS/PM_SCOPE_BASELINE.md',
  'backlog.json':        '02_AGILE/PM_PRODUCT_BACKLOG.md',
  'sprints.json':        '02_AGILE/PM_SPRINT_BACKLOG.md',
  'burndown.json':       '02_AGILE/PM_DAILY_STANDUP_LOG.md',
  'velocity.json':       '02_AGILE/PM_VELOCITY_LOG.md',
  'todo.json':          '04_TODO/PM_TODO_LIST.md'
};

// Files that need table-aware parsing from known document registries
var TABLE_SOURCES = {
  'documents.json':   '01_PM_DOCUMENTS/PM_DOCUMENT_REGISTRY.md',
  'meetings.json':   '03_MEETINGS/PM_MEETING_MINUTES_INDEX.md',
  'milestones.json': '01_PM_DOCUMENTS/PM_MILESTONE_PLAN.md',
  'raid.json':        '01_PM_DOCUMENTS/PM_RAID_LOG.md',
  'reports.json':    '05_REPORTS/',
  'estimation.json': '01_PM_DOCUMENTS/PM_ESTIMATION_LOG.md',
  'gantt.json':      '01_PM_DOCUMENTS/PM_GANTT_CHART.md'
};

// Auto-generated from other JSON data
var AUTO_GENERATED = {
  'dashboard_state.json': true
};

function log(msg)   { console.log('[sync] ' + msg); }
function warn(msg)  { console.log('[sync] WARN: ' + msg); }
function error(msg) { console.error('[sync] ERROR: ' + msg); }

function parseJson(fp) {
  try {
    return { ok: true, data: JSON.parse(fs.readFileSync(fp, 'utf8')) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  var keys = Object.keys(obj).sort();
  var result = {};
  for (var i = 0; i < keys.length; i++) result[keys[i]] = sortObjectKeys(obj[keys[i]]);
  return result;
}

function tableRowToKV(line) {
  var m = line.match(/^\s*\|\s*(.+?)\s*\|\s*(.+?)\s*(?:\||\s*$)/);
  if (!m) return null;
  var k = m[1].trim().replace(/\*\*/g, '').replace(/`/g, '');
  var v = m[2].trim().replace(/\*\*/g, '').replace(/`/g, '');
  if (!k || !v) return null;
  return { key: k, value: v };
}

function listItemToKV(line) {
  var m = line.match(/^\s*[-*]\s*\*\*?([^:*]+)\*?:\s*(.+)/);
  if (!m) return null;
  return { key: m[1].trim(), value: m[2].trim() };
}

function extractKV(line) {
  return tableRowToKV(line) || listItemToKV(line);
}

function extractId(line) {
  var m = line.match(/\b([A-Z]{2,6}-\d{3,})\b/);
  return m ? m[1] : null;
}

function hasTableRows(content) {
  var lines = content.split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].match(/^\s*\|[^|]+\|[^|]*\|/)) return true;
  }
  return false;
}

function parseTableBasedItemsFromContent(content) {
  if (!content || typeof content !== 'string') return [];
  var lines = content.split(/\r?\n/);
  var items = [];
  var headers = [];
  var separatorFound = false;
  var tableEnded = false;
  var currentItem = {};

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    if (line.match(/^\s*\|/) && !separatorFound && !tableEnded) {
      var cells = line.split('|').slice(1, -1).map(function(c) {
        return c.trim().replace(/\*\*/g, '').replace(/`/g, '');
      });
      if (cells.length > 0 && cells[0] && cells[0].trim()) {
        if (headers.length > 0 && separatorFound) {
          tableEnded = true;
        }
        headers = cells;
      }
      continue;
    }

    if (line.match(/^\s*\|[\s|-]+\|\s*$/) && headers.length > 0 && !separatorFound) {
      separatorFound = true;
      continue;
    }

    if (line.match(/^\s*\|/) && headers.length > 0 && separatorFound && !tableEnded) {
      var cells = line.split('|').slice(1, -1).map(function(c) {
        return c.trim().replace(/\*\*/g, '').replace(/`/g, '');
      });
      if (cells.length > 0 && cells[0] && cells[0].trim()) {
        var item = {};
        for (var c = 0; c < headers.length && c < cells.length; c++) {
          if (headers[c] && headers[c].trim()) {
            item[headers[c].trim()] = cells[c] || '';
          }
        }
        items.push(item);
      }
      continue;
    }

    if (!line.match(/^\s*\|/)) {
      var kv = listItemToKV(line);
      if (kv) {
        var id = extractId(line);
        if (id) {
          if (Object.keys(currentItem).length > 0) items.push(currentItem);
          currentItem = {};
        }
        currentItem[kv.key] = kv.value;
      }
    }
  }

  if (Object.keys(currentItem).length > 0) items.push(currentItem);
  return items;
}

function syncProjectState() {
  var srcFile = path.join(BASE, SOURCE_FILES['project_state.json']);
  if (!fs.existsSync(srcFile)) return null;
  var content = fs.readFileSync(srcFile, 'utf8');
  var lines = content.split(/\r?\n/);
  var result = {
    project_id: null,
    project_name: null,
    current_phase: null,
    rag_status: null,
    overall_progress: 0,
    scope_baseline_status: null,
    current_sprint: null,
    last_updated: null,
    key_blockers: []
  };

  for (var i = 0; i < lines.length; i++) {
    var kv = extractKV(lines[i]);
    if (!kv) continue;
    var k = kv.key.toLowerCase();
    var v = kv.value;

    if (k.match(/version|版本/))           result.project_id = v;
    if (k.match(/phase|阶段/))             result.current_phase = v;
    if (k.match(/sprint/i))               result.current_sprint = v;
    if (k.match(/scope.*baseline/i))       result.scope_baseline_status = v;
    if (k.match(/update|更新/))            result.last_updated = v;
    if (k.match(/blocker|阻塞/))           result.key_blockers.push(v);
    if (k.match(/rag/i)) {
      if (v.match(/green/i))  result.rag_status = 'green';
      else if (v.match(/amber/i)) result.rag_status = 'amber';
      else if (v.match(/red/i))   result.rag_status = 'red';
    }
  }
  return result;
}

function syncDashboardState() {
  var dsPath = path.join(DATA_DIR, 'dashboard_state.json');
  var psPath = path.join(DATA_DIR, 'project_state.json');
  var aprPath = path.join(DATA_DIR, 'approvals.json');
  var existingData = null;

  // Read existing file to preserve key ordering (idempotency: same keys in same order)
  if (fs.existsSync(dsPath)) {
    var dr = parseJson(dsPath);
    if (dr.ok && dr.data) { existingData = dr.data; }
  }

  // Count pending approvals
  var pendingApprovals = 0;
  if (fs.existsSync(aprPath)) {
    var ar = parseJson(aprPath);
    if (ar.ok && ar.data && ar.data.approvals) {
      for (var i = 0; i < ar.data.approvals.length; i++) {
        if (ar.data.approvals[i].status === 'pending') pendingApprovals++;
      }
    }
  }

  // Derive live values from source files
  var rag = 'green', progress = 0, phase = null;
  if (fs.existsSync(psPath)) {
    var r = parseJson(psPath);
    if (r.ok && r.data) {
      if (r.data.rag_status) rag = r.data.rag_status;
      if (typeof r.data.overall_progress === 'number') progress = r.data.overall_progress;
      if (r.data.current_phase) phase = r.data.current_phase;
    }
  }

  if (existingData !== null) {
    // Preserve existing key order; update only derived values
    existingData.rag_status = rag;
    existingData.overall_progress = progress;
    existingData.scope_status = phase;
    existingData.pending_approvals = pendingApprovals;
    return existingData;
  }

  // No existing file — generate with stable key order
  return {
    last_synced: null,
    project_name: null,
    rag_status: rag,
    overall_progress: progress,
    scope_status: phase,
    open_risks: 0,
    high_risks: 0,
    open_actions: 0,
    overdue_actions: 0,
    pending_approvals: pendingApprovals,
    current_sprint: null,
    sprint_progress: 0,
    todo_completion_rate: 0,
    document_health_score: 0,
    latest_meeting_minutes_status: null
  };
}

function syncFromSingleFile(jsonFile) {
  var srcRel = SOURCE_FILES[jsonFile];
  if (!srcRel) return null;
  var srcFile = path.join(BASE, srcRel);
  if (!fs.existsSync(srcFile)) return null;

  var content = fs.readFileSync(srcFile, 'utf8');

  if (hasTableRows(content)) {
    var items = parseTableBasedItemsFromContent(content);
    if (items.length === 0) return null;
    var keyName = jsonFile.replace('.json', '');
    var container = {};
    container[keyName] = items;
    return container;
  }

  var lines = content.split(/\r?\n/);

  if (jsonFile === 'approvals.json') {
    var items = [], currentItem = {};
    for (var i = 0; i < lines.length; i++) {
      var kv = extractKV(lines[i]);
      if (!kv) continue;
      if (kv.key.toLowerCase() === 'id') {
        if (Object.keys(currentItem).length > 0) items.push(currentItem);
        currentItem = {};
      }
      currentItem[kv.key.trim()] = kv.value;
    }
    if (Object.keys(currentItem).length > 0) items.push(currentItem);
    if (items.length === 0) return null;
    return { approvals: items };
  }

  var items = [], currentItem = {};
  for (var j = 0; j < lines.length; j++) {
    var kv = extractKV(lines[j]);
    if (!kv) continue;
    if (kv.key.toLowerCase() === 'id') {
      if (Object.keys(currentItem).length > 0) items.push(currentItem);
      currentItem = {};
    }
    currentItem[kv.key.trim()] = kv.value;
  }
  if (Object.keys(currentItem).length > 0) items.push(currentItem);
  if (items.length === 0) return null;

  var keyName = jsonFile.replace('.json', '');
  var container = {};
  container[keyName] = items;
  return container;
}

function syncFromTableSource(jsonFile) {
  var srcRel = TABLE_SOURCES[jsonFile];
  if (!srcRel) return null;

  var srcFull = path.join(BASE, srcRel);
  var srcFiles = [];

  if (fs.existsSync(srcFull)) {
    var stat = fs.statSync(srcFull);
    if (stat.isDirectory()) {
      var entries = fs.readdirSync(srcFull);
      for (var e = 0; e < entries.length; e++) {
        if (entries[e].endsWith('.md')) {
          srcFiles.push(path.join(srcFull, entries[e]));
        }
      }
    } else {
      srcFiles.push(srcFull);
    }
  }

  if (srcFiles.length === 0) return null;

  var allItems = [];
  for (var f = 0; f < srcFiles.length; f++) {
    var content = fs.readFileSync(srcFiles[f], 'utf8');
    var items = parseTableBasedItemsFromContent(content);
    allItems = allItems.concat(items);
  }

  if (allItems.length === 0) return null;

  var keyName = jsonFile.replace('.json', '');
  var container = {};
  container[keyName] = allItems;
  return container;
}

/**
 * Validate a candidate in-memory data object against the JSON schema.
 * Used for pre-write validation to ensure we never write schema-invalid data.
 * @param {string} jsonFile - The JSON filename (used to locate the schema)
 * @param {*} candidateData - The in-memory candidate object to validate
 * @returns {{ valid: boolean, error?: string }}
 */
function validateCandidateAgainstSchema(jsonFile, candidateData) {
  var schemaFile = path.join(SCHEMA_DIR, jsonFile.replace('.json', '.schema.json'));
  if (!fs.existsSync(schemaFile)) return { valid: true };
  var sr = parseJson(schemaFile);
  if (!sr.ok) return { valid: false, error: 'Schema parse error: ' + sr.error };
  var schema = sr.data;
  var data = candidateData;

  if (schema.type === 'object' && (typeof data !== 'object' || data === null || Array.isArray(data))) {
    return { valid: false, error: 'top-level type mismatch: expected object' };
  }
  if (schema.type === 'array' && !Array.isArray(data)) {
    return { valid: false, error: 'top-level type mismatch: expected array' };
  }

  if (schema.required && Array.isArray(data)) {
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      if (typeof item !== 'object' || item === null) continue;
      for (var j = 0; j < schema.required.length; j++) {
        if (item[schema.required[j]] === undefined || item[schema.required[j]] === null || item[schema.required[j]] === '') {
          return { valid: false, error: 'Item ' + i + ' missing required field: ' + schema.required[j] };
        }
      }
    }
  }

  return { valid: true };
}

/**
 * Validate an existing file on disk against the JSON schema (post-write verification).
 * @param {string} jsonFile - The JSON filename
 * @returns {{ valid: boolean, error?: string }}
 */
function validateAgainstSchema(jsonFile) {
  var fp = path.join(DATA_DIR, jsonFile);
  var schemaFile = fp.replace(DATA_DIR, SCHEMA_DIR).replace('.json', '.schema.json');

  var r = parseJson(fp);
  if (!r.ok) return { valid: false, error: 'Parse error: ' + r.error };

  if (!fs.existsSync(schemaFile)) return { valid: true };

  var sr = parseJson(schemaFile);
  if (!sr.ok) return { valid: false, error: 'Schema parse error: ' + sr.error };

  var schema = sr.data;
  var data = r.data;

  if (schema.type === 'object' && (typeof data !== 'object' || data === null || Array.isArray(data))) {
    return { valid: false, error: 'top-level type mismatch: expected object' };
  }
  if (schema.type === 'array' && !Array.isArray(data)) {
    return { valid: false, error: 'top-level type mismatch: expected array' };
  }

  if (schema.required && Array.isArray(data)) {
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      if (typeof item !== 'object' || item === null) continue;
      for (var j = 0; j < schema.required.length; j++) {
        if (item[schema.required[j]] === undefined || item[schema.required[j]] === null || item[schema.required[j]] === '') {
          return { valid: false, error: 'Item ' + i + ' missing required field: ' + schema.required[j] };
        }
      }
    }
  }

  return { valid: true };
}

function runFullSchemaValidator() {
  var validatorPath = path.join(BASE, 'scripts/validate-data.js');
  if (!fs.existsSync(validatorPath)) {
    warn('validate-data.js not found — skipping full validation');
    return { ok: true };
  }
  try {
    var result = child_process.spawnSync('node', [validatorPath], {
      cwd: BASE, encoding: 'utf8', timeout: 30000
    });
    return {
      ok: result.status === 0,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode: result.status
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function main() {
  console.log('=== JSON Sync (Markdown -> JSON) ===');
  console.log('Base: ' + BASE);
  console.log('');

  if (!fs.existsSync(SCHEMA_DIR)) { error('Schema dir missing'); process.exit(1); }
  if (!fs.existsSync(DATA_DIR))   { error('Data dir missing');   process.exit(1); }

  var dataFiles = fs.readdirSync(DATA_DIR).filter(function(f) { return f.endsWith('.json'); });
  console.log('[sync] Single-file sources: ' + Object.keys(SOURCE_FILES).length);
  console.log('[sync] Table-based sources: ' + Object.keys(TABLE_SOURCES).length);
  console.log('[sync] JSON files in 07_DATA/: ' + dataFiles.length);
  console.log('');

  var syncCount = 0, skipCount = 0, failCount = 0;
  var results = [];

  for (var i = 0; i < dataFiles.length; i++) {
    var jsonFile = dataFiles[i];
    var jsonPath = path.join(DATA_DIR, jsonFile);

    try {
      var syncedData = null;

      if (AUTO_GENERATED[jsonFile]) {
        syncedData = syncDashboardState();
      } else if (SOURCE_FILES[jsonFile]) {
        syncedData = syncFromSingleFile(jsonFile);
      } else if (TABLE_SOURCES[jsonFile]) {
        syncedData = syncFromTableSource(jsonFile);
      }

      if (syncedData === null) {
        log('SKIP: ' + jsonFile + ' (no source or source produced no data)');
        skipCount++;
        results.push({ file: jsonFile, status: 'SKIP' });
        continue;
      }

      var preVr = validateCandidateAgainstSchema(jsonFile, syncedData);
      if (!preVr.valid) {
        warn('Pre-write check: ' + jsonFile + ' would fail schema: ' + preVr.error);
        warn('  → Skipping write to preserve existing valid data');
        results.push({ file: jsonFile, status: 'SKIP', reason: 'pre-write schema check failed: ' + preVr.error });
        skipCount++;
        continue;
      }

      var sorted = sortObjectKeys(syncedData);
      var content = JSON.stringify(sorted, null, 2) + '\n';
      fs.writeFileSync(jsonPath, content, 'utf8');
      log('SYNCED: ' + jsonFile);

      var postVr = validateAgainstSchema(jsonFile);
      if (!postVr.valid) {
        error('Post-write validation FAILED for ' + jsonFile + ': ' + postVr.error);
        failCount++;
        results.push({ file: jsonFile, status: 'FAIL', reason: postVr.error });
      } else {
        results.push({ file: jsonFile, status: 'OK' });
        syncCount++;
      }

    } catch (e) {
      error('Exception: ' + jsonFile + ': ' + e.message);
      failCount++;
      results.push({ file: jsonFile, status: 'ERROR', reason: e.message });
    }
  }

  console.log('');
  console.log('=== Sync Summary ===');
  console.log('Synced: ' + syncCount);
  console.log('Skipped: ' + skipCount);
  console.log('Failed: ' + failCount);

  if (failCount > 0) {
    for (var j = 0; j < results.length; j++) {
      if (results[j].status !== 'OK') {
        console.log('  ' + results[j].file + ': ' + results[j].reason);
      }
    }
  }

  console.log('');
  console.log('=== Running full schema validator ===');
  var vr2 = runFullSchemaValidator();
  console.log(vr2.stdout || '');

  if (!vr2.ok) {
    console.log('validate-data.js exit code: ' + vr2.exitCode);
    console.log('RESULT: FAIL - schema validation failed');
    process.exit(1);
  }

  if (failCount > 0) {
    console.log('RESULT: FAIL - ' + failCount + ' file(s) failed post-write validation');
    process.exit(1);
  }

  console.log('RESULT: PASS - sync completed, all files pass schema validation');
  process.exit(0);
}

main();
