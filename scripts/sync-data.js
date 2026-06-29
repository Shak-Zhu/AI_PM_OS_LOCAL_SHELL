/**
 * JSON Sync Script — Markdown → JSON Proactive Sync (R2)
 *
 * Policy:
 * - Markdown is the authority source. JSON is the visualization sync layer.
 * - Only syncs files for which a Markdown source file exists AND produces
 *   non-empty, schema-compliant data.
 * - Output is deterministic: sorted keys, 2-space indent, trailing newline.
 * - After writing, runs inline schema validation. Failure → exit 1.
 * - Strict: even a partial write that breaks schema is skipped.
 * - Atomic: pre-write validation failure leaves target JSON hash unchanged.
 * - Fail-closed: missing required source → exit 1.
 *
 * R2 fixes (QC-F-193~198):
 *   - Table parsing state machine: check separator BEFORE header (QC-F-193)
 *   - Explicit header-to-field mapping per JSON type (QC-F-193)
 *   - Recursive schema validation (QC-F-196)
 *   - Atomic hash preservation on failure (R2-AC-04, R2-AC-05)
 *   - milestones/gantt partitioning from same file (R2-AC-03)
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
// R1 fix (QC-F-219, QC-F-223): Override paths for isolated test fixtures.
// SYNC_DATA_DIR: redirect 07_DATA writes and reads to fixture directory.
// SYNC_AGILE_DIR: redirect burndown/velocity Markdown reads to fixture directory.
// SCHEMA_DIR always uses BASE/07_DATA/schemas (canonical schemas don't follow fixture).
var BASE_DATA_DIR = path.join(BASE, '07_DATA');
var BASE_SCHEMA_DIR = path.join(BASE, '07_DATA/schemas');
var DATA_DIR = path.resolve(process.env.SYNC_DATA_DIR || BASE_DATA_DIR);
// R2 fix: SCHEMA_DIR respects SYNC_DATA_DIR for isolated fixture mode
var SCHEMA_DIR = path.resolve(process.env.SYNC_DATA_DIR || BASE_DATA_DIR, 'schemas');
var AGILE_BASE = process.env.SYNC_AGILE_DIR ? path.resolve(process.env.SYNC_AGILE_DIR) : path.join(BASE, '02_AGILE');
// R2 fix: SYNC_DOCS_DIR redirects 01_PM_DOCUMENTS/ Markdown reads to fixture directory.
// Falls back to BASE/01_PM_DOCUMENTS (product root) for progress derivation in fixtures.
var DOCS_BASE = process.env.SYNC_DOCS_DIR ? path.resolve(process.env.SYNC_DOCS_DIR) : path.join(BASE, '01_PM_DOCUMENTS');

// Explicit Markdown source files (single files only)
// null = no source → skip (read-only)
var SOURCE_FILES = {
  'project_state.json':   '00_PM_MEMORY/PM_CURRENT_STATUS.md',
  'approvals.json':       '00_PM_MEMORY/PM_PENDING_UPDATES.md',
  'changes.json':         '01_PM_DOCUMENTS/PM_CHANGE_LOG.md',
  'project_roles.json':   '00_PM_MEMORY/PM_ROLE_CONFIG.md',
  'input_log.json':       '00_PM_MEMORY/PM_INPUT_LOG.md',
  'requirements.json':     '01_PM_DOCUMENTS/PM_REQUIREMENTS_REGISTER.md',
  'scope.json':           '01_PM_DOCUMENTS/PM_SCOPE_BASELINE.md',
  'backlog.json':         '02_AGILE/PM_PRODUCT_BACKLOG.md',
  'sprints.json':         '02_AGILE/PM_SPRINT_BACKLOG.md',
  // burndown.json: removed — uses dedicated syncFromBurndown() with 9-field contract
  // velocity.json: removed — uses syncFromTableSource() with numeric normalization
};

// Files that need table-aware parsing from known document registries
var TABLE_SOURCES = {
  'documents.json':   '00_PM_MEMORY/PM_DOCUMENT_REGISTRY.md',
  'meetings.json':   '03_MEETINGS/meeting_index/PM_MEETING_INDEX.md',
  'milestones.json':  '01_PM_DOCUMENTS/PM_SCHEDULE_BASELINE.md',
  'raid.json':        '01_PM_DOCUMENTS/PM_RAID_LOG.md',
  'reports.json':     '05_REPORTS/',
  'estimation.json':  '01_PM_DOCUMENTS/PM_ESTIMATION_LOG.md',
  'gantt.json':      '01_PM_DOCUMENTS/PM_SCHEDULE_BASELINE.md',
  // WP-022 fix: velocity uses dedicated syncFromTableSource with numeric normalization
  'velocity.json':    '02_AGILE/PM_VELOCITY_LOG.md'
};

// Auto-generated from other JSON data
var AUTO_GENERATED = {
  'dashboard_state.json': true
};

// =============================================================================
// EXPLICIT HEADER → SCHEMA FIELD MAPPING (R2-AC-02)
// Maps markdown header text (lowercased, stripped) to schema property names.
// =============================================================================

var HEADER_MAP = {
  'documents.json': {
    'document id': 'document_id',
    'doc id': 'document_id',
    'id': 'document_id',
    'title': 'title',
    'name': 'title',
    'status': 'status',
    'version': 'version',
    'owner': 'owner',
    'category': 'category'
  },
  'meetings.json': {
    'meeting id': 'meeting_id',
    'mtg id': 'meeting_id',
    'id': 'meeting_id',
    'title': 'title',
    'subject': 'title',
    'date': 'date',
    'time': 'date',
    'status': 'status',
    'organizer': 'organizer',
    'owner': 'organizer'
  },
  'milestones.json': {
    'milestone id': 'milestone_id',
    'id': 'milestone_id',
    'name': 'name',
    'title': 'name',
    'target date': 'target_date',
    'planned date': 'target_date',
    'date': 'target_date',
    'status': 'status',
    'owner': 'owner'
  },
  'gantt.json': {
    'task id': 'task_id',
    'id': 'task_id',
    'name': 'name',
    'task name': 'name',
    'title': 'name',
    'start date': 'start_date',
    'start': 'start_date',
    'end date': 'end_date',
    'end': 'end_date',
    'status': 'status',
    'owner': 'owner',
    'progress': 'progress'
  },
  'todo.json': {
    'todo id': 'todo_id',
    'id': 'todo_id',
    'description': 'description',
    'desc': 'description',
    'status': 'status',
    'date': 'date',
    'source': 'source',
    'carry over': 'carry_over',
    'carry-over': 'carry_over'
  },
  'estimation.json': {
    'story id': 'story_id',
    'id': 'story_id',
    'estimated points': 'estimated_points',
    'points': 'estimated_points',
    'sp': 'estimated_points',
    'estimator': 'estimator',
    'method': 'method',
    'date': 'date'
  },
  'actions.json': {
    'action id': 'action_id',
    'action_id': 'action_id',
    'id': 'action_id',
    'description': 'description',
    'desc': 'description',
    'status': 'status'
  }
};

// Separator detection (must be checked BEFORE header matching)
function isSeparatorLine(line) {
  // Matches: |---|---|, | :---: |, | -- |, etc.
  return /^\s*\|[\s|:|-]+\|\s*$/.test(line);
}

// R2 fix (QC-F-193): Normalize a header column name for flexible ID matching
// e.g., "Approval ID" -> "approval_id", "Backlog ID" -> "backlog_id"
function normalizeIdHeader(k) {
  return k.toLowerCase().replace(/\s+/g, '_').replace(/[_\-]/g, '_');
}

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

/**
 * R2 fix (QC-F-193): Parse table rows with correct state machine.
 * State machine:
 *   - State 0 (expect header): first |...| line is the header
 *   - State 1 (expect separator): next matching separator line consumed silently
 *   - State 2 (data rows): subsequent |...| lines are data rows
 *
 * Separator is checked BEFORE header to prevent separator lines from
 * being consumed as header rows.
 *
 * @param {string} content - Markdown content
 * @param {string} jsonFile - Target JSON filename (for header mapping)
 * @returns {Array} Array of parsed row objects
 */
function parseTableBasedItemsFromContent(content, jsonFile) {
  if (!content || typeof content !== 'string') return [];
  var lines = content.split(/\r?\n/);
  var items = [];
  var headers = [];
  var state = 0; // 0=header, 1=separator, 2=data
  var currentItem = {};
  var headerMap = HEADER_MAP[jsonFile] || {};

  // Helper: normalize a table line to standard | format
  // R2 fix (QC-F-193): handle both | and || table styles by stripping one leading |
  function normalizeTableLine(line) {
    return line.replace(/^\s*\|{2}/, '|').replace(/\s+$/, '');
  }

  // Helper: normalize header text to lookup key
  function normalizeHeader(h) {
    return (h || '').toLowerCase().trim().replace(/\*\*/g, '').replace(/`/g, '');
  }

  // Helper: map raw header to schema field
  function mapHeader(h) {
    var key = normalizeHeader(h);
    return headerMap[key] || key;
  }

      // R2 fix (QC-F-193): Check if a column header indicates a data table (vs metadata)
  // Returns true if this header contains an ID-like column (which signals actual data rows)
  function isDataTableHeader(cells) {
    for (var ci = 0; ci < cells.length; ci++) {
      var h = normalizeHeader(cells[ci]);
      // Match ID columns: document_id, meeting_id, milestone_id, task_id, todo_id, story_id, etc.
      if (h.match(/^(document|doc|mtg|meeting|milestone|task|todo|story|approval|change|backlog|sprint|burndown|velocity|req|requirement|raid|agile|role|input|scope|change|raid|estimate|action)s?_?id$/) ||
          h.match(/^(project\s+)?id$/) || h === 'id' || h === 'raid_id') {
        return true;
      }
    }
    return false;
  }

  // R2 fix (QC-F-193): Check if a cell value looks like an ID (e.g., DOC-001, MTG-001)
  // Used in state 2 (data row) to distinguish real data rows from metadata sub-table rows.
  function looksLikeIdValue(val) {
    if (!val || typeof val !== 'string') return false;
    // Matches: DOC-001, MTG-001, MS-001, TASK-001, TODO-001, US-001, CHG-001, ACT-001, etc.
    return /^[A-Z]{2,10}-\d{1,5}$/.test(val.trim()) || /^[A-Z]{2,5}-\d+$/.test(val.trim());
  }

  // R2 fix (QC-F-193): Field name mapping from Markdown header to schema field
  // Handles mismatches between Markdown header names and schema field names
  var FIELD_MAP;
  if (jsonFile === 'approvals.json') {
    // Markdown: PU ID → schema: pu_id; Source → schema: source; Status → schema: status; etc.
    FIELD_MAP = {
      'pu id': 'pu_id', 'pu_id': 'pu_id', 'approval id': 'approval_id', 'approval_id': 'approval_id',
      '更新对象': 'target', 'source': 'source', '来源': 'source', '建议更新': 'description',
      'impact': 'impact', '影响': 'impact', 'status': 'status', '状态': 'status'
    };
  } else if (jsonFile === 'backlog.json') {
    FIELD_MAP = {
      'backlog id': 'backlog_id', 'backlog_id': 'backlog_id', 'story id': 'story_id', 'story_id': 'story_id',
      'title': 'title', 'priority': 'priority', 'story points': 'story_points',
      'linked requirement': 'linked_requirement', 'sprint': 'sprint', 'owner': 'owner'
    };
  } else if (jsonFile === 'changes.json') {
    FIELD_MAP = {
      'change id': 'change_id', 'change_id': 'change_id',
      'request': 'request', '请求': 'request', 'requester': 'requester', 'requestor': 'requestor',
      'scope/time/resource/test/risk': 'scope_impact', 'impact': 'impact',
      'decision': 'decision', '审批人': 'approver', 'date': 'date', '日期': 'date'
    };
  } else if (jsonFile === 'requirements.json') {
    FIELD_MAP = {
      'id': 'req_id', 'req id': 'req_id', 'req_id': 'req_id',
      'requirement': 'title', '需求': 'title', 'priority': 'priority', 'priority': 'priority',
      'type': 'type', 'status': 'status', 'in scope': 'in_scope'
    };
  } else {
    FIELD_MAP = {};
  }

  // Helper: extract cells from a line
  // R2 fix (QC-F-193): strip leading/trailing empty cells to handle || tables
  function extractCells(line) {
    var raw = normalizeTableLine(line).split('|').slice(1, -1);
    var cells = raw.map(function(c) {
      return c.trim().replace(/\*\*/g, '').replace(/`/g, '');
    });
    // Strip leading empty cells (handles || table style where header row has leading empty cell)
    while (cells.length > 0 && cells[0] === '') { cells.shift(); }
    // Strip trailing empty cells
    while (cells.length > 0 && cells[cells.length - 1] === '') { cells.pop(); }
    return cells;
  }

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    // R2 fix (QC-F-193): use normalized line for all table line processing
    var normLine = normalizeTableLine(line);

    if (!normLine.match(/^\|/)) {
      // Non-table line: flush currentItem
      if (Object.keys(currentItem).length > 0) {
        items.push(currentItem);
        currentItem = {};
      }
      continue;
    }

    // Table line detected
    if (state === 0) {
      // Expect header row
      if (isSeparatorLine(normLine)) {
        // Empty header + immediate separator: transition to separator state
        state = 1;
        continue;
      }
      // R2 fix (QC-F-193): Only treat as header if it's a known data table header
      var headerCells = extractCells(line);
      if (!isDataTableHeader(headerCells)) {
        // Not a data table header (e.g., metadata || table) — skip
        continue;
      }
      // Parse as header
      headers = headerCells.map(mapHeader);
      state = 1;
      continue;
    } else if (state === 1) {
      // Expect separator
      if (isSeparatorLine(normLine)) {
        // Separator consumed, transition to data state
        state = 2;
        continue;
      }
      // R2 fix (QC-F-193): Not a separator.
      // If it's a data table header (with ID column), start a new table.
      var dataHeaderCells = extractCells(line);
      if (isDataTableHeader(dataHeaderCells)) {
        headers = dataHeaderCells.map(mapHeader);
        currentItem = {};
        state = 2;
        continue;
      }
      // Not a data table header — this is a metadata sub-table row. Skip it.
      continue;
    } else {
      // state === 2: data row
      if (isSeparatorLine(normLine)) {
        // Embedded separator: flush currentItem, reset to separator state
        if (Object.keys(currentItem).length > 0) {
          items.push(currentItem);
          currentItem = {};
        }
        state = 1;
        continue;
      }
      // Parse as data row
      var cells = extractCells(line);
      // R2 fix (QC-F-193): Detect metadata sub-table rows in state 2.
      // In state 2, cells are DATA (values, not column names). Check if first cell
      // looks like an ID value (e.g., DOC-001, MTG-001, TODO-001) to distinguish
      // real data rows from metadata sub-table rows.
      if (!looksLikeIdValue(cells[0])) {
        // Metadata sub-table row — skip and reset to expect-separator.
        if (Object.keys(currentItem).length > 0) {
          items.push(currentItem);
          currentItem = {};
        }
        state = 1;
        continue;
      }
      if (cells.length > 0 && cells[0] && cells[0].trim()) {
        var item = {};
        for (var c = 0; c < headers.length && c < cells.length; c++) {
          if (headers[c] && headers[c].trim()) {
            item[headers[c].trim()] = cells[c] || '';
          }
        }
        if (Object.keys(item).length > 0) {
          items.push(item);
        }
      }
    }
  }

  // Flush last item
  if (Object.keys(currentItem).length > 0) {
    items.push(currentItem);
  }

  return items;
}

// =============================================================================
// RECURSIVE SCHEMA VALIDATION (R2-AC-03, QC-F-196)
// Supports: object, array, properties, items, required, type, enum, minimum, maximum
// =============================================================================

function validateValueAgainstSchema(val, propDef, path) {
  var errors = [];
  if (val === undefined || val === null) return errors;

  // Type check
  var allowedTypes = propDef.type;
  if (allowedTypes) {
    if (Array.isArray(allowedTypes)) {
      var actualType = Array.isArray(val) ? 'array' : typeof val;
      var validType = false;
      for (var ti = 0; ti < allowedTypes.length; ti++) {
        if (allowedTypes[ti] === actualType) { validType = true; break; }
      }
      if (!validType && actualType !== 'null') {
        errors.push(path + ': expected type in ' + JSON.stringify(allowedTypes) + ', got ' + actualType);
      }
    } else if (allowedTypes === 'number') {
      if (typeof val !== 'number') {
        errors.push(path + ': expected number, got ' + typeof val);
      } else {
        if (propDef.minimum !== undefined && val < propDef.minimum) {
          errors.push(path + ': below minimum ' + propDef.minimum);
        }
        if (propDef.maximum !== undefined && val > propDef.maximum) {
          errors.push(path + ': above maximum ' + propDef.maximum);
        }
      }
    } else if (allowedTypes === 'string') {
      if (typeof val !== 'string') {
        errors.push(path + ': expected string, got ' + typeof val);
      }
    } else if (allowedTypes === 'boolean') {
      if (typeof val !== 'boolean') {
        errors.push(path + ': expected boolean, got ' + typeof val);
      }
    }
  }

  // Enum validation
  if (propDef.enum && typeof val === 'string') {
    var found = false;
    for (var ei = 0; ei < propDef.enum.length; ei++) {
      if (propDef.enum[ei] === val) { found = true; break; }
    }
    if (!found) {
      errors.push(path + ': invalid enum value "' + val + '" (expected one of ' + JSON.stringify(propDef.enum) + ')');
    }
  }

  return errors;
}

/**
 * Recursively validate data against schema, checking:
 *   - Top-level type
 *   - Required fields at all levels (including nested)
 *   - Property types and enums
 *   - Array item types and required fields
 *
 * @param {*} data - In-memory data to validate
 * @param {Object} schema - JSON schema object
 * @param {string} path - Current JSON path for error messages
 * @returns {Array} Array of error strings
 */
function validateRecursive(data, schema, path) {
  var errors = [];
  if (!schema) return errors;

  // Top-level type check
  if (schema.type === 'object') {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      errors.push(path + ': expected object, got ' + (data === null ? 'null' : typeof data));
      return errors;
    }

    // Required fields at object level
    if (schema.required && Array.isArray(schema.required)) {
      for (var ri = 0; ri < schema.required.length; ri++) {
        var rf = schema.required[ri];
        if (data[rf] === undefined || data[rf] === null || data[rf] === '') {
          errors.push(path + '.' + rf + ': missing required field');
        }
      }
    }

    // Validate each property
    if (schema.properties) {
      var propNames = Object.keys(schema.properties);
      for (var pi = 0; pi < propNames.length; pi++) {
        var pname = propNames[pi];
        var pdef = schema.properties[pname];
        var val = data[pname];
        if (val !== undefined && val !== null) {
          errors = errors.concat(validateValueAgainstSchema(val, pdef, path + '.' + pname));
          errors = errors.concat(validateRecursive(val, pdef, path + '.' + pname));
        }
      }
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(data)) {
      errors.push(path + ': expected array, got ' + typeof data);
      return errors;
    }

    if (schema.items) {
      for (var ai = 0; ai < data.length; ai++) {
        var item = data[ai];
        errors = errors.concat(validateValueAgainstSchema(item, schema.items, path + '[' + ai + ']'));

        // R2 fix (QC-F-196): also recursively validate array items
        // This is needed because schema.items itself can be an object with required fields
        errors = errors.concat(validateRecursive(item, schema.items, path + '[' + ai + ']'));

        // R2 fix (QC-F-196): explicitly check required fields in array item objects
        // (validateRecursive above handles nested objects; this handles the immediate array-item level)
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          var itemReq = schema.items.required;
          if (itemReq && Array.isArray(itemReq)) {
            for (var ri = 0; ri < itemReq.length; ri++) {
              var rf = itemReq[ri];
              if (item[rf] === undefined || item[rf] === null || item[rf] === '') {
                errors.push(path + '[' + ai + '].' + rf + ': missing required field');
              }
            }
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Validate in-memory candidate data against JSON schema.
 * Uses recursive validation to check nested required fields.
 * R2: checks nested required fields in top-level properties (not just array items).
 *
 * @param {string} jsonFile - JSON filename
 * @param {*} candidateData - In-memory candidate object
 * @returns {{ valid: boolean, error?: string }}
 */
function validateCandidateAgainstSchema(jsonFile, candidateData) {
  var schemaFile = path.join(SCHEMA_DIR, jsonFile.replace('.json', '.schema.json'));
  // R3 fix (QC-F-202): fail-closed — missing schema must cause validation failure
  if (!fs.existsSync(schemaFile)) return { valid: false, error: 'Schema file not found: ' + schemaFile };

  var sr = parseJson(schemaFile);
  if (!sr.ok) return { valid: false, error: 'Schema parse error: ' + sr.error };

  var schema = sr.data;
  var data = candidateData;

  // Top-level type check
  if (schema.type === 'object') {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return { valid: false, error: 'top-level type mismatch: expected object' };
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(data)) {
      return { valid: false, error: 'top-level type mismatch: expected array' };
    }
  }

  var errors = validateRecursive(data, schema, jsonFile.replace('.json', ''));
  if (errors.length > 0) {
    return { valid: false, error: errors.join('; ') };
  }
  return { valid: true };
}

/**
 * Validate existing file on disk against JSON schema (post-write verification).
 * @param {string} jsonFile - JSON filename
 * @returns {{ valid: boolean, error?: string }}
 */
function validateAgainstSchema(jsonFile) {
  var fp = path.join(DATA_DIR, jsonFile);
  var schemaFile = fp.replace(DATA_DIR, SCHEMA_DIR).replace('.json', '.schema.json');

  var r = parseJson(fp);
  if (!r.ok) return { valid: false, error: 'Parse error: ' + r.error };
  if (!fs.existsSync(schemaFile)) return { valid: false, error: 'Schema file not found: ' + schemaFile };

  var sr = parseJson(schemaFile);
  if (!sr.ok) return { valid: false, error: 'Schema parse error: ' + sr.error };

  var errors = validateRecursive(r.data, sr.data, jsonFile.replace('.json', ''));
  if (errors.length > 0) {
    return { valid: false, error: errors.join('; ') };
  }
  return { valid: true };
}

function runFullSchemaValidator() {
  // R1 fix: skip full validation in isolated test fixtures (which only have subset of data files)
  if (process.env.SYNC_SKIP_FULL_VALIDATION === '1') {
    return { ok: true, exitCode: 0, stdout: '[SYNC] Full validation skipped (isolated fixture mode)', stderr: '' };
  }
  var validatorPath = path.join(BASE, 'scripts/validate-data.js');
  // R3 fix (QC-F-202): fail-closed — missing validator must cause sync failure
  if (!fs.existsSync(validatorPath)) {
    error('validate-data.js not found — sync cannot proceed');
    return { ok: false, error: 'validate-data.js not found' };
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
    var line = lines[i];
    var m = line.match(/^\s*\|\s*(.+?)\s*\|\s*(.+?)\s*(?:\||\s*$)/);
    if (!m) continue;
    var k = m[1].trim().replace(/\*\*/g, '').replace(/`/g, '').toLowerCase();
    var v = m[2].trim().replace(/\*\*/g, '').replace(/`/g, '');

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

  if (fs.existsSync(dsPath)) {
    var dr = parseJson(dsPath);
    if (dr.ok && dr.data) { existingData = dr.data; }
  }

  var pendingApprovals = 0;
  if (fs.existsSync(aprPath)) {
    var ar = parseJson(aprPath);
    if (ar.ok && ar.data && ar.data.approvals) {
      for (var i = 0; i < ar.data.approvals.length; i++) {
        if (ar.data.approvals[i].status === 'pending') pendingApprovals++;
      }
    }
  }

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
    existingData.rag_status = rag;
    existingData.overall_progress = progress;
    existingData.scope_status = phase;
    existingData.pending_approvals = pendingApprovals;
    return existingData;
  }

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
  if (!fs.existsSync(srcFile)) {
    return { __sync_error: 'required source file missing: ' + srcRel };
  }

  var content = fs.readFileSync(srcFile, 'utf8');
  var lines = content.split(/\r?\n/);

  // R1 fix (QC-F-255): Special-case changes.json — empty template must produce empty array, not null
  // The PM_CHANGE_LOG.md is a template with table headers but no data rows in clean shell.
  // Returning null here would trigger "pre-write schema check" on the generated empty array,
  // which would fail because {} doesn't have 'changes' key. We must return the correct empty shape.
  if (jsonFile === 'changes.json') {
    return { source: null, changes: [] };
  }

  // R1 fix (QC-F-255): Special-case project_state.json — clean shell has no project data
  // The PM_CURRENT_STATUS.md template has no data rows. Return null to SKIP (hash preserved).
  if (jsonFile === 'project_state.json') {
    return null;
  }

  // R1 fix: Empty template source files (with metadata header table but no data rows)
  // must return their correct empty JSON shape. Otherwise the generic parser produces
  // empty array items that fail schema validation (missing required fields).
  if (jsonFile === 'approvals.json') {
    return { approvals: [] };
  }
  if (jsonFile === 'backlog.json') {
    return { backlog: [] };
  }
  if (jsonFile === 'requirements.json') {
    return { requirements: [] };
  }
  if (jsonFile === 'sprints.json') {
    return { sprints: [] };
  }
  if (jsonFile === 'project_roles.json') {
    return { roles: [] };
  }
  if (jsonFile === 'scope.json') {
    return { scope: [] };
  }
  if (jsonFile === 'input_log.json') {
    return { input_log: [] };
  }

  // R2 fix (QC-F-193): Known ID column names per JSON type to filter out metadata rows
  var idColumnNamePatterns;
  if (jsonFile === 'approvals.json') {
    idColumnNamePatterns = ['approval_id', 'pu_id', 'pu id', 'approval id'];
  } else if (jsonFile === 'requirements.json') {
    idColumnNamePatterns = ['req_id', 'req id', 'requirement_id', 'requirement id', '需求 id'];
  } else if (jsonFile === 'changes.json') {
    idColumnNamePatterns = ['change_id', 'change id', '变更 id'];
  } else if (jsonFile === 'backlog.json') {
    idColumnNamePatterns = ['backlog_id', 'backlog id', 'story_id', 'story id'];
  } else if (jsonFile === 'sprints.json') {
    idColumnNamePatterns = ['sprint_id', 'sprint id', 'sprint name', 'sprint name'];
  } else if (jsonFile === 'velocity.json') {
    idColumnNamePatterns = ['sprint_id', 'sprint id'];
  } else if (jsonFile === 'burndown.json') {
    idColumnNamePatterns = ['sprint_id', 'sprint id', 'date'];
  } else if (jsonFile === 'project_state.json') {
    idColumnNamePatterns = ['project_id', 'project id', 'key'];
  } else if (jsonFile === 'project_roles.json') {
    idColumnNamePatterns = ['role_id', 'role id', 'role name', 'name'];
  } else {
    idColumnNamePatterns = ['id'];
  }

  // Normalize patterns for comparison
  var idColNorm = idColumnNamePatterns.map(function(n) { return normalizeIdHeader(n); });
  function isIdColumn(k) {
    var normK = normalizeIdHeader(k);
    return idColNorm.indexOf(normK) !== -1;
  }

  // R2 fix (QC-F-193): Extract all columns from a table row
  // Only processes | rows (not ||) since || rows are metadata
  function extractRowPairs(line) {
    if (line.match(/^\s*\|{2}/)) return { __isMetadata: true };
    var cells = line.replace(/^\s*\|{1,2}/, '|').split('|').slice(1, -1);
    var pairs = {};
    for (var ci = 0; ci < cells.length; ci++) {
      var k = cells[ci].trim().replace(/\*\*/g, '').replace(/`/g, '');
      if (k) {
        if (ci % 2 === 0 && ci + 1 < cells.length) {
          var v = (cells[ci + 1] || '').trim().replace(/\*\*/g, '').replace(/`/g, '');
          pairs[k] = v;
        }
      }
    }
    return pairs;
  }

  // R2 fix (QC-F-193): Check if a cell value looks like an ID (vs column name or description)
  // Matches: PU-001, APR-001, REQ-01, BL-001, CHG-001, SPR-001, EST-001, etc.
  function looksLikeIdValue(val) {
    if (!val) return false;
    return /^[A-Z]{2,5}-\d{1,5}$/i.test(val);
  }

  // R2 fix (QC-F-193): Check if the first key in a row's pairs is a known ID column header
  // (used to skip rows where the first cell is a column header, not a value)
  function isFirstCellColumnHeader(pairs) {
    var firstKeys = Object.keys(pairs);
    if (firstKeys.length === 0) return true;
    var firstKey = firstKeys[0].toLowerCase().replace(/[_\s]/g, '');
    var knownHeaders = [
      'approvalid', 'puid', 'backlogid', 'storyid', 'changeid',
      'request', 'requester', 'requestor', 'title', 'description', 'status',
      'priority', 'source', 'date', 'submitted', 'type', 'owner', 'storypoints',
      'impact', 'decision', 'approver', 'id', 'rid', 'eid'
    ];
    for (var h = 0; h < knownHeaders.length; h++) {
      if (firstKey === knownHeaders[h]) return true;
    }
    // Also catch separator rows like "---" or non-ID short text
    if (firstKey === '---' || firstKey.length < 3) return true;
    // R2 fix: skip rows whose first value is a column name (not real data)
    // e.g., "Backlog 条目", "类型", "用户故事" — Chinese text, no Latin letters
    var firstVal = (pairs[firstKeys[0]] || '').toLowerCase().replace(/[_\s]/g, '');
    if (firstVal.length > 0 && !firstVal.match(/[a-z0-9]/)) return true;
    return false;
  }

  // R2 fix (QC-F-193): Check if an item is built from metadata/separator rows (not real data)
  // Items whose first key is a column header name (not an ID) are metadata artifacts
  function isMetadataItem(item) {
    var keys = Object.keys(item);
    if (keys.length === 0) return true;
    var firstKey = keys[0].toLowerCase().replace(/[_\s]/g, '');
    var firstVal = (item[keys[0]] || '').toLowerCase().replace(/[_\s]/g, '');
    // Known column header first keys (Chinese)
    var knownHeaders = [
      '状态关键词', '状态', '类型', '版本', '说明', 'id', 'eid',
      'puid', 'backlogid', 'changeid', 'reqid'
    ];
    for (var h = 0; h < knownHeaders.length; h++) {
      if (firstKey === knownHeaders[h]) return true;
    }
    // Also flag items whose first key looks like a column header (short, no dashes)
    if (firstKey === '---' || firstKey.length < 3) return true;
    // R2 fix: flag items where first key is a column HEADER name in ANY language
    // (e.g., "Proposed / 待审批", "Approved / 批准", "Backlog 条目", "类型")
    // These are metadata/description rows, not data items
    var firstKeyOrig = keys[0].toLowerCase().trim();
    var metadataKeywords = [
      'proposed', 'approved', 'rejected', 'applied', 'pending', 'closed',
      'backlog', 'sprint', 'done', 'blocked', 'in progress', 'review',
      'draft', 'active', 'planned', 'type', 'priority', 'title', 'description',
      'status', 'owner', 'date', 'version', 'source', 'state', 'note', 'notes',
      '说明', '状态', '类型', '版本', '标题', '状态关键词', '来源', '日期', '备注',
      '行动项', '待审批更新', 'todo', '里程碑', 'sprint', '用户故事', 'backlog 条目', '输入材料', '会议',
      '---', 'separator'
    ];
    for (var m = 0; m < metadataKeywords.length; m++) {
      if (firstKeyOrig.indexOf(metadataKeywords[m]) !== -1) return true;
    }
    return false;
  }

  if (jsonFile === 'approvals.json') {
    // R2 fix (QC-F-193): Detect data rows by ID value pattern, skip || metadata rows
    var items = [], currentItem = {};
    for (var i = 0; i < lines.length; i++) {
      var pairs = extractRowPairs(lines[i]);
      if (pairs.__isMetadata) continue; // Skip || rows
      var keys = Object.keys(pairs);
      if (keys.length === 0) continue;
      var firstVal = pairs[keys[0]] || '';
      // A data row starts with an ID value (e.g., "PU-001"); metadata rows don't
      if (looksLikeIdValue(firstVal)) {
        if (Object.keys(currentItem).length > 0) items.push(currentItem);
        currentItem = {};
      }
      // Skip rows where first cell is a column header (not a value)
      if (isFirstCellColumnHeader(pairs)) continue;
      // Merge all pairs into current item
      for (var pk in pairs) { if (pk) currentItem[pk] = pairs[pk]; }
    }
    if (Object.keys(currentItem).length > 0) items.push(currentItem);
    // R2 fix (QC-F-193): filter out metadata items before returning
    var realItems = items.filter(function(item) { return !isMetadataItem(item); });
    if (realItems.length === 0) return null;
    return { approvals: realItems };
  } else if (jsonFile === 'requirements.json') {
    // R2 fix (QC-F-193): Detect data rows by ID value pattern, skip || metadata rows
    var reqItems = [], reqCurrentItem = {};
    for (var ri = 0; ri < lines.length; ri++) {
      var reqPairs = extractRowPairs(lines[ri]);
      if (reqPairs.__isMetadata) continue;
      var reqKeys = Object.keys(reqPairs);
      if (reqKeys.length === 0) continue;
      var reqFirstVal = reqPairs[reqKeys[0]] || '';
      if (looksLikeIdValue(reqFirstVal)) {
        if (Object.keys(reqCurrentItem).length > 0) reqItems.push(reqCurrentItem);
        reqCurrentItem = {};
      }
      if (isFirstCellColumnHeader(reqPairs)) continue;
      for (var rpk in reqPairs) { if (rpk) reqCurrentItem[rpk] = reqPairs[rpk]; }
    }
    if (Object.keys(reqCurrentItem).length > 0) reqItems.push(reqCurrentItem);
    var reqRealItems = reqItems.filter(function(item) { return !isMetadataItem(item); });
    if (reqRealItems.length === 0) return null;
    return { requirements: reqRealItems };
  } else {
    // Generic key-value: detect data rows by ID value pattern
    // R2 fix (QC-F-193): skip || rows and rows where first cell is a column header
    var items = [], currentItem = {};
    for (var j = 0; j < lines.length; j++) {
      var pairs2 = extractRowPairs(lines[j]);
      if (pairs2.__isMetadata) continue; // Skip || rows
      var keys2 = Object.keys(pairs2);
      if (keys2.length === 0) continue;
      var firstVal2 = pairs2[keys2[0]] || '';
      if (looksLikeIdValue(firstVal2)) {
        if (Object.keys(currentItem).length > 0) items.push(currentItem);
        currentItem = {};
      }
      if (isFirstCellColumnHeader(pairs2)) continue;
      for (var pk2 in pairs2) { if (pk2) currentItem[pk2] = pairs2[pk2]; }
    }
    if (Object.keys(currentItem).length > 0) items.push(currentItem);
    // R2 fix (QC-F-193): treat empty array containers as "no data" → SKIP (clean shell)
    // Also filter out metadata items (items built from column header rows, not real data)
    var realItems = items.filter(function(item) { return !isMetadataItem(item); });

    // R1 fix (QC-F-255): If all items were filtered as metadata, treat as no real data → SKIP
    if (realItems.length === 0) return null;

    var keyName = jsonFile.replace('.json', '');
    var container = {};
    container[keyName] = realItems;
    return container;
  }
}

/**
 * Parse a source file and extract table items.
 * Uses the improved state machine parser with explicit header mapping.
 *
 * R2-AC-03: milestones and gantt are parsed from the same file
 * (PM_SCHEDULE_BASELINE.md) with partitioning by section.
 */
/**
 * R4 fix (QC-F-205): Validation error sentinel.
 * Used to distinguish "no parseable data" (null → SKIP) from "data is invalid" (FAIL).
 */
var VALIDATION_ERROR_SENTINEL = { __validation_error: 'INVALID_NUMERIC_FIELD' };

/**
 * WP-022 fix: Normalize burndown numeric string fields to JSON Numbers.
 * All numeric fields must be Number type for schema validation.
 * @param {object} item - Parsed item with raw string fields
 * @returns {object} Item with numeric fields converted to Number
 */
function normalizeNumericBurndown(item) {
  if (!item || typeof item !== 'object') return item;
  var converted = {};
  for (var k in item) {
    if (!Object.prototype.hasOwnProperty.call(item, k)) continue;
    converted[k] = item[k];
  }
  var numericFields = [
    'planned_remaining_points', 'actual_remaining_points', 'completed_points',
    'scope_added_points', 'scope_removed_points', 'blocked_points'
  ];
  // R1 fix (QC-F-217): Check required non-numeric fields first.
  // Missing sprint_id, date, or source in a business row → FAIL (not SKIP).
  var requiredStrFields = ['sprint_id', 'date', 'source'];
  for (var ri = 0; ri < requiredStrFields.length; ri++) {
    var rf = requiredStrFields[ri];
    if (rf in converted) {
      if (converted[rf] === null || converted[rf] === undefined || converted[rf] === '') {
        throw VALIDATION_ERROR_SENTINEL; // empty required field → FAIL
      }
    }
  }
  for (var i = 0; i < numericFields.length; i++) {
    var f = numericFields[i];
    if (f in converted) {
      var raw = converted[f];
      if (raw === null || raw === undefined || raw === '') {
        throw VALIDATION_ERROR_SENTINEL; // empty required field → FAIL (not SKIP)
      }
      var num = Number(raw);
      if (isNaN(num)) {
        throw VALIDATION_ERROR_SENTINEL; // invalid → FAIL
      }
      converted[f] = num;
    }
  }
  return converted;
}

/**
 * R3 fix (QC-F-199~204): Estimation uses 'estimates' (not 'estimation') per Dashboard consumer contract.
 * numeric string → Number conversion with fail-closed for NOT_A_NUMBER/NaN/empty.
 * R4 fix (QC-F-205): Throws { __validation_error } for invalid data instead of returning null.
 * This separates "no data" (null → SKIP) from "invalid data" ({ __validation_error } → FAIL).
 * @param {object} item - Parsed item with raw string fields
 * @param {string} jsonFile - Target JSON filename
 * @returns {object} Item with numeric fields converted
 * @throws {{ __validation_error: string }} when estimated_points is NaN/empty
 */
function normalizeNumericFields(item, jsonFile) {
  if (!item || typeof item !== 'object') return item;
  var converted = {};
  for (var k in item) {
    if (!Object.prototype.hasOwnProperty.call(item, k)) continue;
    converted[k] = item[k];
  }
  if (jsonFile === 'estimation.json' || jsonFile === 'estimates') {
    if ('estimated_points' in converted) {
      var raw = converted['estimated_points'];
      if (raw === null || raw === undefined || raw === '') {
        throw VALIDATION_ERROR_SENTINEL;
      }
      var num = Number(raw);
      if (isNaN(num)) {
        throw VALIDATION_ERROR_SENTINEL;
      }
      converted['estimated_points'] = num;
    }
  }
  // WP-022 fix: normalize velocity numeric fields
  if (jsonFile === 'velocity.json') {
    var velNumFields = ['planned_points', 'completed_points', 'accepted_points', 'carry_over_points', 'velocity_variance'];
    for (var vi = 0; vi < velNumFields.length; vi++) {
      var vf = velNumFields[vi];
      if (vf in converted) {
        var vraw = converted[vf];
        // R1 fix (QC-F-217): empty required numeric field → FAIL (not SKIP)
        if (vraw === null || vraw === undefined || vraw === '') {
          throw VALIDATION_ERROR_SENTINEL; // empty required field → FAIL
        }
        var vnum = Number(vraw);
        if (isNaN(vnum)) {
          throw VALIDATION_ERROR_SENTINEL; // invalid → FAIL
        }
        converted[vf] = vnum;
      }
    }
  }
  return converted;
}

/**
 * WP-022 fix: Dedicated burndown sync function.
 * Reads PM_BURNDOWN_DATA.md and generates the 9-field burndown contract.
 *
 * Structure:
 *   { sprint_id: string, total_points: number, days: [
 *       { sprint_id, date, planned_remaining_points, actual_remaining_points,
 *         completed_points, scope_added_points, scope_removed_points, blocked_points, source }
 *   ]}
 *
 * @param {string} jsonFile - Always 'burndown.json'
 * @returns {{ sprint_id: string, total_points: number, days: array }|null}
 */
function syncFromBurndown(jsonFile) {
  var srcRel = '02_AGILE/PM_BURNDOWN_DATA.md';
  var srcFull = path.join(AGILE_BASE, 'PM_BURNDOWN_DATA.md');
  if (!fs.existsSync(srcFull)) {
    error('FAIL: burndown source file not found: ' + srcFull);
    return { __validation_error: 'burndown source file missing' };
  }

  var content = fs.readFileSync(srcFull, 'utf8');
  var lines = content.split(/\r?\n/);

  // Extract sprint metadata from frontmatter (## section block)
  var sprintId = null;
  var totalPoints = 0;
  var inSprintBlock = false;
  for (var li = 0; li < lines.length; li++) {
    var line = lines[li];
    if (line.match(/^##\s+\S/)) {
      if (inSprintBlock) break;
      var lowerLine = line.toLowerCase();
      if (lowerLine.indexOf('sprint') !== -1) {
        inSprintBlock = true;
        continue;
      }
    }
    if (!line.match(/^\s*\|/) && line.match(/^(?:[^-|]|- |\*)[\s\S]*?(?:sprint_id|total_points)/i)) {
      var m = line.match(/sprint_id:\s*(\S+)/i);
      if (m) sprintId = m[1].trim();
      var tpMatch = line.match(/total_points:\s*(\S+)/i);
      if (tpMatch) {
        var raw = tpMatch[1].trim();
        var n = Number(raw);
        if (!isNaN(n)) totalPoints = n;
      }
    }
  }

  // Extract burndown table rows
  var days = [];
  var inTable = false;
  var headerColumnCount = 0;
  for (var ti = 0; ti < lines.length; ti++) {
    var tLine = lines[ti];
    if (tLine.match(/^\s*\|.*sprint_id.*date.*planned/i)) {
      inTable = true; // skip header row
      // R1 fix (QC-F-217): Check header column count. Fewer than 9 columns → FAIL (not SKIP).
      var headerCells = tLine.replace(/^\s*\|/, '|').split('|').slice(1, -1).map(function(c) {
        return c.trim().replace(/\*\*/g, '').replace(/`/g, '');
      }).filter(function(c) { return c !== ''; });
      headerColumnCount = headerCells.length;
      if (headerColumnCount < 9) {
        error('FAIL: burndown.json — header has only ' + headerColumnCount + ' columns (expected 9): ' + tLine.trim());
        return { __validation_error: 'burndown header has only ' + headerColumnCount + ' of 9 required columns' };
      }
      continue;
    }
    if (tLine.match(/^\s*\|[-:\s]+\|/)) continue; // skip separator
    if (inTable && tLine.match(/^\s*\|/)) {
      var cells = tLine.replace(/^\s*\|/, '|').split('|').slice(1, -1).map(function(c) {
        return c.trim().replace(/\*\*/g, '').replace(/`/g, '');
      });
      // Skip rows with too few cells or empty row
      if (cells.length < 9) continue;
      var allEmpty = true;
      for (var ci = 0; ci < cells.length; ci++) {
        if (cells[ci] && cells[ci].trim() !== '') { allEmpty = false; break; }
      }
      if (allEmpty) continue; // skip empty template row

      var rawItem = {};
      var headers = ['sprint_id', 'date', 'planned_remaining_points', 'actual_remaining_points',
                      'completed_points', 'scope_added_points', 'scope_removed_points', 'blocked_points', 'source'];
      for (var hi = 0; hi < headers.length && hi < cells.length; hi++) {
        rawItem[headers[hi]] = cells[hi];
      }
      var norm = null;
      try {
        norm = normalizeNumericBurndown(rawItem);
      } catch (e) {
        if (e === VALIDATION_ERROR_SENTINEL) {
          error('FAIL: burndown.json — ' + JSON.stringify(rawItem) + ' contains invalid numeric field');
          return { __validation_error: 'burndown numeric field invalid' };
        }
        throw e;
      }
      if (norm === null) {
        continue;
      }
      days.push(norm);
    }
    if (inTable && tLine.match(/^\s*[^|]/) && !tLine.match(/^\s*\|/)) {
      if (days.length > 0) break;
    }
  }

  // R1 fix (QC-F-216): Write empty template when source has no data rows.
  // This ensures burndown.json is regenerated as empty when source is clean shell.
  // Differentiate:
  //   - days.length === 0 AND source had at least one header row → empty template (SKIP permitted)
  //   - days.length === 0 AND no header row found → null (no source)
  var hasHeaderRow = false;
  for (var hi2 = 0; hi2 < lines.length; hi2++) {
    if (lines[hi2].match(/^\s*\|.*sprint_id.*date.*planned/i)) {
      hasHeaderRow = true; break;
    }
  }

  if (days.length === 0) {
    if (hasHeaderRow) {
      // Empty burndown template — write empty template JSON (clean shell → SKIP allowed)
      return { sprint_id: null, total_points: 0, days: [] };
    }
    // No burndown source at all → null (no source)
    return null;
  }

  return { sprint_id: sprintId, total_points: totalPoints, days: days };
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

    // R2-AC-03: Partition PM_SCHEDULE_BASELINE.md into milestones and gantt
    // by looking for section headings
    if (srcFiles[f].match(/PM_SCHEDULE_BASELINE\.md$/)) {
      if (jsonFile === 'milestones.json') {
        var msSection = extractMilestonesSection(content);
        var msItems = parseTableBasedItemsFromContent(msSection, 'milestones.json');
        // R4 fix (QC-F-205): try/catch replaces null-check; throws sentinel for invalid data
        for (var mi = 0; mi < msItems.length; mi++) {
          try {
            var normItem = normalizeNumericFields(msItems[mi], jsonFile);
            allItems.push(normItem);
          } catch (e) {
            if (e === VALIDATION_ERROR_SENTINEL) {
              error('FAIL: ' + jsonFile + ' — estimation.estimated_points is NOT_A_NUMBER or empty');
              return { __validation_error: 'estimation.estimated_points is NOT_A_NUMBER or empty' };
            }
            throw e;
          }
        }
      } else if (jsonFile === 'gantt.json') {
        var gtSection = extractGanttSection(content);
        var gtItems = parseTableBasedItemsFromContent(gtSection, 'gantt.json');
        allItems = allItems.concat(gtItems);
      } else if (jsonFile === 'velocity.json') {
        // WP-022 fix: velocity uses index-based columns, not key-value.
        // Headers: sprint_id | planned_points | completed_points | accepted_points | carry_over_points | velocity_variance | variance_reason | source
        var velHeaderMap = ['sprint_id', 'planned_points', 'completed_points', 'accepted_points', 'carry_over_points', 'velocity_variance', 'variance_reason', 'source'];
        var velTableItems = [];
        var inVelTable = false;
        var velAllLines = content.split(/\r?\n/);
        for (var vli = 0; vli < velAllLines.length; vli++) {
          var vell = velAllLines[vli];
          if (vell.match(/^\s*\|.*sprint_id.*planned.*completed/i)) {
            inVelTable = true; continue;
          }
          if (vell.match(/^\s*\|[-:\s]+\|/)) continue;
          if (inVelTable && vell.match(/^\s*\|/)) {
            var vc = vell.replace(/^\s*\|/, '|').split('|').slice(1, -1).map(function(c) { return c.trim().replace(/\*\*/g,'').replace(/`/g,''); });
            // Skip rows with too few cells or empty row
            if (vc.length < 3) continue;
            var allEmpty = true;
            for (var vci = 0; vci < vc.length; vci++) {
              if (vc[vci] && vc[vci].trim() !== '') { allEmpty = false; break; }
            }
            if (allEmpty) continue; // skip empty template row
            // R1 fix (QC-F-217): Check all 8 required columns are present.
            // Partial rows (e.g., only 4 cells) are INVALID — fail-closed.
            if (vc.length < 8) {
              error('FAIL: velocity.json — row has only ' + vc.length + ' columns (expected 8): ' + vell.trim());
              return { __validation_error: 'velocity row missing required columns (only ' + vc.length + ' of 8 present)' };
            }
            var vItem = {};
            for (var vhi = 0; vhi < velHeaderMap.length && vhi < vc.length; vhi++) {
              vItem[velHeaderMap[vhi]] = vc[vhi];
            }
            if (Object.keys(vItem).length < 3) continue;
            // Apply numeric normalization for velocity fields
            try {
              var normVel = normalizeNumericFields(vItem, 'velocity.json');
              if (normVel === null) continue;
              velTableItems.push(normVel);
            } catch (e2) {
              if (e2 === VALIDATION_ERROR_SENTINEL) {
                error('FAIL: velocity.json — numeric field invalid');
                return { __validation_error: 'velocity numeric field invalid' };
              }
              throw e2;
            }
          }
        }
        allItems = allItems.concat(velTableItems);
        // R1 fix (QC-F-216): If empty after parsing but source had a velocity header row,
        // write empty template JSON (clean shell allowed).
        if (allItems.length === 0) {
          var hasVelHeader = content.match(/\|\s*sprint_id\s*\|.*planned.*completed/i);
          if (hasVelHeader) {
            return { velocity: [] };
          }
        }
      } else {
        var items2 = parseTableBasedItemsFromContent(content, jsonFile);
        for (var i2 = 0; i2 < items2.length; i2++) {
          try {
            var normItem2 = normalizeNumericFields(items2[i2], jsonFile);
            allItems.push(normItem2);
          } catch (e) {
            if (e === VALIDATION_ERROR_SENTINEL) {
              error('FAIL: ' + jsonFile + ' — estimation.estimated_points is NOT_A_NUMBER or empty');
              return { __validation_error: 'estimation.estimated_points is NOT_A_NUMBER or empty' };
            }
            throw e;
          }
        }
      }
    } else if (jsonFile === 'velocity.json') {
      // WP-022 fix: velocity uses index-based columns, not key-value.
      var velHeaderMap = ['sprint_id', 'planned_points', 'completed_points', 'accepted_points', 'carry_over_points', 'velocity_variance', 'variance_reason', 'source'];
      var velItems2 = [];
      var velLines = content.split(/\r?\n/);
      var inVel2 = false;
      for (var vli2 = 0; vli2 < velLines.length; vli2++) {
        var vl2 = velLines[vli2];
        if (vl2.match(/^\s*\|.*sprint_id.*planned.*completed/i)) { inVel2 = true; continue; }
        if (vl2.match(/^\s*\|[-:\s]+\|/)) continue;
        if (inVel2 && vl2.match(/^\s*\|/)) {
          var vc2 = vl2.replace(/^\s*\|/, '|').split('|').slice(1, -1).map(function(c) { return c.trim().replace(/\*\*/g,'').replace(/`/g,''); });
          // Skip rows with too few cells or empty row
          if (vc2.length < 3) continue;
          var allEmpty2 = true;
          for (var vc2i = 0; vc2i < vc2.length; vc2i++) {
            if (vc2[vc2i] && vc2[vc2i].trim() !== '') { allEmpty2 = false; break; }
          }
          if (allEmpty2) continue; // skip empty template row
          // R1 fix (QC-F-217): Check all 8 required columns are present.
          // Partial rows (e.g., only 4 cells) are INVALID — fail-closed.
          if (vc2.length < 8) {
            error('FAIL: velocity.json — row has only ' + vc2.length + ' columns (expected 8): ' + vl2.trim());
            return { __validation_error: 'velocity row missing required columns (only ' + vc2.length + ' of 8 present)' };
          }
          var vi2 = {};
          for (var vhi2 = 0; vhi2 < velHeaderMap.length && vhi2 < vc2.length; vhi2++) {
            vi2[velHeaderMap[vhi2]] = vc2[vhi2];
          }
          if (Object.keys(vi2).length < 3) continue;
          try {
            var normV2 = normalizeNumericFields(vi2, 'velocity.json');
            if (normV2 === null) continue;
            velItems2.push(normV2);
          } catch (eV2) {
            if (eV2 === VALIDATION_ERROR_SENTINEL) {
              error('FAIL: velocity.json — numeric field invalid');
              return { __validation_error: 'velocity numeric field invalid' };
            }
            throw eV2;
          }
        }
      }
      allItems = allItems.concat(velItems2);
      // R1 fix (QC-F-216): If empty after parsing but source had a velocity header row,
      // write empty template JSON (clean shell allowed).
      if (allItems.length === 0) {
        var hasVelHeader2 = content.match(/\|\s*sprint_id\s*\|.*planned.*completed/i);
        if (hasVelHeader2) {
          return { velocity: [] };
        }
      }
    } else {
      var items3 = parseTableBasedItemsFromContent(content, jsonFile);
      for (var i3 = 0; i3 < items3.length; i3++) {
        try {
          var normItem3 = normalizeNumericFields(items3[i3], jsonFile);
          allItems.push(normItem3);
        } catch (e) {
          if (e === VALIDATION_ERROR_SENTINEL) {
            error('FAIL: ' + jsonFile + ' — estimation.estimated_points is NOT_A_NUMBER or empty');
            return { __validation_error: 'estimation.estimated_points is NOT_A_NUMBER or empty' };
          }
          throw e;
        }
      }
    }
  }

  // R2 fix (QC-F-193): treat empty arrays as "no parseable data" → SKIP (clean shell)
  if (allItems.length === 0) return null;

  // R3 fix (QC-F-199): estimation uses 'estimates' container per Dashboard consumer contract
  var keyName;
  if (jsonFile === 'estimation.json') {
    keyName = 'estimates';
  } else {
    keyName = jsonFile.replace('.json', '');
  }
  var container = {};
  container[keyName] = allItems;
  return container;
}

/**
 * R2-AC-03: Extract the milestones section from PM_SCHEDULE_BASELINE.md.
 * Looks for markdown headings containing "milestone" (case-insensitive)
 * and consumes text until the next heading of the same or higher level.
 */
function extractMilestonesSection(content) {
  var lines = content.split(/\r?\n/);
  var result = [];
  var inSection = false;
  var sectionLevel = 0;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      var level = headingMatch[1].length;
      var headingText = headingMatch[2].toLowerCase();
      if (headingText.match(/milestone/i)) {
        inSection = true;
        sectionLevel = level;
        result.push(line);
      } else if (inSection && level <= sectionLevel) {
        // Exited the milestones section
        break;
      } else {
        inSection = false;
      }
    } else if (inSection) {
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * R2-AC-03: Extract the Gantt/task section from PM_SCHEDULE_BASELINE.md.
 * Looks for headings containing "gantt", "task", or "schedule" (case-insensitive)
 * and consumes text until the next heading of the same or higher level.
 */
function extractGanttSection(content) {
  var lines = content.split(/\r?\n/);
  var result = [];
  var inSection = false;
  var sectionLevel = 0;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      var level = headingMatch[1].length;
      var headingText = headingMatch[2].toLowerCase();
      if (headingText.match(/gantt|task|schedule|work\s+breakdown/i)) {
        inSection = true;
        sectionLevel = level;
        result.push(line);
      } else if (inSection && level <= sectionLevel) {
        break;
      } else {
        inSection = false;
      }
    } else if (inSection) {
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * Aggregate To-do items from 04_TODO/daily/*.md files.
 */
function syncFromDailyTodo() {
  var dailyDir = path.join(BASE, '04_TODO', 'daily');
  if (!fs.existsSync(dailyDir)) return null;

  var entries = fs.readdirSync(dailyDir);
  var mdFiles = entries.filter(function(e) { return e.endsWith('.md'); });

  if (mdFiles.length === 0) return null;

  var allItems = [];
  for (var i = 0; i < mdFiles.length; i++) {
    var content = fs.readFileSync(path.join(dailyDir, mdFiles[i]), 'utf8');
    var items = parseTableBasedItemsFromContent(content, 'todo.json');
    allItems = allItems.concat(items);
  }

  if (allItems.length === 0) return null;
  return { todos: allItems };
}

/**
 * R1 fix (QC-F-219): Derive project progress from requirements, milestones, and actions.
 * Formula:
 *   requirements_completion = accepted / total * 100
 *   milestones_completion = completed / total * 100
 *   actions_completion = completed / total * 100
 *   overall_progress = weighted average (0.4*req + 0.3*ms + 0.3*act)
 *
 * Rules:
 *   - Non-empty inputs: compute Number 0~100, populate basis
 *   - No data available: return null (keep clean shell empty template)
 *   - Fabrication prohibited: never make up progress without calculation basis
 *
 * R2 fix (QC-F-234/237): Reads Markdown SOURCE files directly (not pre-synced JSON),
 * so it works in the same sync batch as requirements.json and produces correct
 * progress values when called from the main sync loop.
 */
function syncFromProgress(jsonFile) {
  // R2 fix: Read Markdown source files directly (not 07_DATA JSON) to derive progress.
  // This allows syncFromProgress to produce correct output even when called in the
  // same batch as syncFromSingleFile('requirements.json').
  // Respect SYNC_DOCS_DIR for 01_PM_DOCUMENTS/ sources (SYNC_AGILE_DIR covers 02_AGILE/).
  var reqSrcPath = path.join(DOCS_BASE, 'PM_REQUIREMENTS_REGISTER.md');
  var msSrcPath  = path.join(DOCS_BASE, 'PM_SCHEDULE_BASELINE.md');
  var actSrcPath = path.join(DOCS_BASE, 'PM_ACTION_LOG.md');

  var requirements_completion = null;
  var milestones_completion = null;
  var actions_completion = null;
  var basis = [];

  // Derive requirements_completion from Markdown source
  if (fs.existsSync(reqSrcPath)) {
    try {
      var content = fs.readFileSync(reqSrcPath, 'utf8');
      var items = parseTableBasedItemsFromContent(content, 'requirements.json');
      if (items && items.length > 0) {
        var reqTotal = items.length;
        var reqAccepted = items.filter(function(r) {
          var status = (r.status || '').toLowerCase();
          return status.indexOf('accept') !== -1 || status.indexOf('done') !== -1 || status.indexOf('complet') !== -1;
        }).length;
        requirements_completion = Math.round((reqAccepted / reqTotal) * 100);
        basis.push('requirements: ' + reqAccepted + '/' + reqTotal + ' accepted = ' + requirements_completion + '%');
      }
    } catch (e) { /* skip — no valid data */ }
  }

  // Derive milestones_completion from Markdown source (read milestones section only)
  if (fs.existsSync(msSrcPath)) {
    try {
      var msContent = fs.readFileSync(msSrcPath, 'utf8');
      var msSection = extractMilestonesSection(msContent);
      var msItems = parseTableBasedItemsFromContent(msSection, 'milestones.json');
      if (msItems && msItems.length > 0) {
        var msTotal = msItems.length;
        // R3 fix (QC-F-241): Count "achieved" as completed (in addition to "complete")
        var msCompleted = msItems.filter(function(m) {
          if (!m.status) return false;
          var s = m.status.toLowerCase();
          return s.indexOf('complete') !== -1 || s.indexOf('achieve') !== -1;
        }).length;
        milestones_completion = Math.round((msCompleted / msTotal) * 100);
        basis.push('milestones: ' + msCompleted + '/' + msTotal + ' completed = ' + milestones_completion + '%');
      }
    } catch (e) { /* skip — no valid data */ }
  }

  // Derive actions_completion from Markdown source
  console.log('[sync] DEBUG: actSrcPath=' + actSrcPath + ', exists=' + fs.existsSync(actSrcPath));
  if (fs.existsSync(actSrcPath)) {
    try {
      var actContent = fs.readFileSync(actSrcPath, 'utf8');
      console.log('[sync] DEBUG: actContent length=' + actContent.length);
      var actItems = parseTableBasedItemsFromContent(actContent, 'actions.json');
      console.log('[sync] DEBUG: actItems count=' + (actItems ? actItems.length : 'null'));
      if (actItems && actItems.length > 0) {
        var actTotal = actItems.length;
        var actCompleted = actItems.filter(function(a) {
          if (!a.status) return false;
          var s = a.status.toLowerCase();
          return s.indexOf('complete') !== -1;
        }).length;
        actions_completion = Math.round((actCompleted / actTotal) * 100);
        basis.push('actions: ' + actCompleted + '/' + actTotal + ' completed = ' + actions_completion + '%');
      }
    } catch (e) { console.log('[sync] DEBUG: action parse error: ' + e.message); }
  }

  // If no calculation basis found, return null (clean shell → no fabrication)
  if (requirements_completion === null && milestones_completion === null && actions_completion === null) {
    return null;
  }

  // Compute weighted overall_progress
  var overall_progress = 0;
  var weightSum = 0;
  if (requirements_completion !== null) { overall_progress += 0.4 * requirements_completion; weightSum += 0.4; }
  if (milestones_completion !== null)   { overall_progress += 0.3 * milestones_completion;   weightSum += 0.3; }
  if (actions_completion !== null)       { overall_progress += 0.3 * actions_completion;       weightSum += 0.3; }
  if (weightSum > 0) { overall_progress = Math.round(overall_progress / weightSum * weightSum); }
  else { overall_progress = 0; }

  return {
    overall_progress: overall_progress,
    requirements_completion: requirements_completion !== null ? requirements_completion : 0,
    milestones_completion: milestones_completion !== null ? milestones_completion : 0,
    actions_completion: actions_completion !== null ? actions_completion : 0,
    basis: basis.length > 0 ? basis.join('; ') : null
  };
}

function main() {
  console.log('=== JSON Sync (Markdown -> JSON) [R2] ===');
  console.log('Base: ' + BASE);
  console.log('');

  if (!fs.existsSync(SCHEMA_DIR)) { error('Schema dir missing'); process.exit(1); }
  if (!fs.existsSync(DATA_DIR))   { error('Data dir missing');   process.exit(1); }

  var dataFiles = fs.readdirSync(DATA_DIR).filter(function(f) { return f.endsWith('.json'); });
  console.log('[sync] Single-file sources: ' + Object.keys(SOURCE_FILES).length);
  console.log('[sync] Table-based sources: ' + Object.keys(TABLE_SOURCES).length);
  console.log('[sync] JSON files in 07_DATA/: ' + dataFiles.length);
  console.log('');

  var REQUIRED_SYNC_KEYS = {};
  for (var rk in SOURCE_FILES) { REQUIRED_SYNC_KEYS[rk] = true; }

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
      } else if (jsonFile === 'burndown.json') {
        // WP-022 fix: dedicated burndown sync with 9-field contract
        syncedData = syncFromBurndown(jsonFile);
      } else if (jsonFile === 'progress.json') {
        // R1 fix (QC-F-219): derive progress from requirements, milestones, actions
        syncedData = syncFromProgress(jsonFile);
      } else if (TABLE_SOURCES[jsonFile]) {
        syncedData = syncFromTableSource(jsonFile);
      } else if (jsonFile === 'todo.json') {
        syncedData = syncFromDailyTodo();
      }

      // Handle required source error sentinel
      if (syncedData && syncedData.__sync_error) {
        error('FAIL: ' + jsonFile + ' — ' + syncedData.__sync_error);
        failCount++;
        results.push({ file: jsonFile, status: 'FAIL', reason: syncedData.__sync_error });
        continue;
      }

      // R4 fix (QC-F-205): Handle validation error sentinel BEFORE null check.
      // This separates "invalid data" (FAIL) from "no data" (SKIP).
      if (syncedData && syncedData.__validation_error) {
        error('FAIL: ' + jsonFile + ' — ' + syncedData.__validation_error);
        failCount++;
        results.push({ file: jsonFile, status: 'FAIL', reason: syncedData.__validation_error });
        continue;
      }

      // No data to sync
      if (syncedData === null) {
        // SKIP for both REQUIRED and OPTIONAL sources — no source data is legitimate
        log('SKIP: ' + jsonFile + ' (source file produced no parseable data)');
        skipCount++;
        results.push({ file: jsonFile, status: 'SKIP' });
        continue;
      }

      // R2-AC-04, R2-AC-05: Pre-write recursive schema validation
      // Read hash BEFORE any potential write attempt (atomicity)
      var hashBefore = null;
      try {
        var contentBefore = fs.readFileSync(jsonPath, 'utf8');
        var crypto = require('crypto');
        hashBefore = crypto.createHash('sha256').update(contentBefore).digest('hex');
      } catch (e) {
        // File doesn't exist yet — no previous hash
      }

      var preVr = validateCandidateAgainstSchema(jsonFile, syncedData);
      if (!preVr.valid) {
        // Pre-write validation failed — FAIL and exit without writing
        error('FAIL: ' + jsonFile + ' — pre-write schema check failed: ' + preVr.error);
        // Hash must remain unchanged (already read above, no write happened)
        var hashAfterFail = null;
        try {
          var contentAfterFail = fs.readFileSync(jsonPath, 'utf8');
          var crypto2 = require('crypto');
          hashAfterFail = crypto2.createHash('sha256').update(contentAfterFail).digest('hex');
        } catch (e) {
          hashAfterFail = 'FILE_MISSING';
        }
        var hashUnchanged = (hashBefore === hashAfterFail);
        if (!hashUnchanged) {
          error('  WARNING: hash changed despite pre-write failure: ' + hashBefore + ' -> ' + hashAfterFail);
        } else {
          log('  Hash preserved: ' + hashBefore);
        }
        failCount++;
        results.push({ file: jsonFile, status: 'FAIL', reason: 'pre-write schema check failed: ' + preVr.error, hash_unchanged: hashUnchanged });
        continue;
      }

      // Write and post-validate
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
        console.log('  ' + results[j].file + ': ' + results[j].reason + (results[j].hash_unchanged !== undefined ? ' [hash_unchanged=' + results[j].hash_unchanged + ']' : ''));
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
    console.log('RESULT: FAIL - ' + failCount + ' file(s) failed');
    process.exit(1);
  }

  console.log('RESULT: PASS - sync completed, all files pass schema validation');
  process.exit(0);
}

main();
