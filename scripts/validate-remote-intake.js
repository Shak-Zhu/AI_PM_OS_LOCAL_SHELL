'use strict';

/**
 * ai-pm-os — Remote Intake Contract Validator
 *
 * Fail-closed static + data contract validator for the unified remote intake feature.
 * Checks file existence, schema structure, forbidden fallback patterns, and security.
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = one or more checks failed
 */

var fs = require('fs');
var path = require('path');

var baseDir = path.resolve(__dirname, '..');

// =============================================================================
// CONTRACT DEFINITIONS
// =============================================================================

var REQUIRED_FILES = [
  '08_INTAKE/README.md',
  '08_INTAKE/remote_sources/README.md',
  '00_PM_MEMORY/PM_INPUT_LOG.md',
  '07_DATA/input_log.json',
  '07_DATA/schemas/input_log.schema.json',
  'ai-pm-os/references/remote-intake-rules.md'
];

var REQUIRED_INPUT_FIELDS = [
  'input_id',
  'batch_id',
  'received_at',
  'source_type',
  'provider',
  'source_locator',
  'resource_type',
  'resource_id',
  'retrieval_method',
  'access_status',
  'completeness',
  'read_scope',
  'source_fingerprint',
  'processing_status',
  'related_input_id',
  'related_updates',
  'notes'
];

var REQUIRED_SCHEMA_PROPERTIES = [
  'input_id',
  'received_at',
  'source_type',
  'source_locator',
  'retrieval_method',
  'access_status',
  'processing_status'
];

var FORBIDDEN_FALLBACK_PATTERNS = [
  // Positive forward descriptions (forbidden): fail → automatic ACTION
  // Key: must NOT have "不" between "失败" and "自动"
  // Pattern: "失败" ... "自动[verb]" WITHOUT "不自动" in between
  /Cooper.{0,30}失败(?!.{0,30}不自动).{0,30}自动(?:调用|打开|切换|回退|switch|fallback)/i,
  /(?:浏览器|chrome|browser).{0,30}失败(?!.{0,30}不自动).{0,30}自动(?:调用|打开|切换|回退|下载|switch|fallback)/i,
  /(?:Cooper|browser).{0,30}立即(?:调用|打开|切换|回退|下载)(?!.{0,20}不)/i,
  // Explicit "回退" forward descriptions (without negation)
  /(?:失败|unavailable).{0,30}回退.{0,30}(?:浏览器|Cooper|chrome|browser)(?!.{0,10}不)/i
];

var FORBIDDEN_SECRETS_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-_]{10,}/,
  /Token["\s:=]+[A-Za-z0-9\-_]{10,}/,
  /api[_-]?key["\s:=]+[A-Za-z0-9\-_]{10,}/i,
  /password["\s:=]+\S+/i,
  /secret["\s:=]+[A-Za-z0-9\-_]{10,}/i,
  /session[_-]?id["\s:=]+[A-Za-z0-9\-_]{10,}/i
];

// =============================================================================
// HELPERS
// =============================================================================

function log(msg) {
  console.error('[validate-remote-intake] ' + msg);
}

function error(msg) {
  console.error('[ERROR] ' + msg);
}

function pass(msg) {
  console.log('[PASS] ' + msg);
}

var failures = 0;

function fail(label, detail) {
  failures++;
  error((detail ? label + ': ' + detail : label));
}

function checkFilesExist() {
  var allGood = true;
  for (var i = 0; i < REQUIRED_FILES.length; i++) {
    var fp = path.join(baseDir, REQUIRED_FILES[i]);
    if (!fs.existsSync(fp)) {
      fail('Missing required file: ' + REQUIRED_FILES[i]);
      allGood = false;
    } else {
      pass('File exists: ' + REQUIRED_FILES[i]);
    }
  }
  return allGood;
}

function checkSchemaRootKey() {
  var schemaPath = path.join(baseDir, '07_DATA', 'schemas', 'input_log.schema.json');
  if (!fs.existsSync(schemaPath)) {
    fail('Schema file missing: 07_DATA/schemas/input_log.schema.json');
    return false;
  }
  try {
    var schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    if (!schema.required || schema.required.indexOf('input_log') === -1) {
      fail('Schema required array must include "input_log"');
      return false;
    }
    if (!schema.properties || !schema.properties.input_log) {
      fail('Schema properties must have "input_log" key');
      return false;
    }
    if (schema.properties.input_log.type !== 'array') {
      fail('Schema properties.input_log.type must be "array"');
      return false;
    }
    pass('Schema root key: input_log');
    return true;
  } catch (e) {
    fail('Schema parse error: ' + e.message);
    return false;
  }
}

function checkSchemaFieldCoverage() {
  var schemaPath = path.join(baseDir, '07_DATA', 'schemas', 'input_log.schema.json');
  try {
    var schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    var itemProps = schema.properties && schema.properties.input_log &&
                    schema.properties.input_log.items &&
                    schema.properties.input_log.items.properties;
    if (!itemProps) {
      fail('Schema missing input_log items properties');
      return false;
    }
    var allGood = true;
    for (var i = 0; i < REQUIRED_SCHEMA_PROPERTIES.length; i++) {
      var field = REQUIRED_SCHEMA_PROPERTIES[i];
      if (!itemProps[field]) {
        fail('Schema missing required field: ' + field);
        allGood = false;
      } else {
        pass('Schema field present: ' + field);
      }
    }
    return allGood;
  } catch (e) {
    fail('Schema parse error: ' + e.message);
    return false;
  }
}

function checkJsonRootKey() {
  var jsonPath = path.join(baseDir, '07_DATA', 'input_log.json');
  if (!fs.existsSync(jsonPath)) {
    fail('JSON file missing: 07_DATA/input_log.json');
    return false;
  }
  try {
    var data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (typeof data.input_log === 'undefined') {
      fail('JSON root key must be "input_log"');
      return false;
    }
    if (!Array.isArray(data.input_log)) {
      fail('JSON input_log must be an array');
      return false;
    }
    pass('JSON root key: input_log (array)');
    return true;
  } catch (e) {
    fail('JSON parse error: ' + e.message);
    return false;
  }
}

function checkSyncDataNoHardcodedEmpty() {
  var syncPath = path.join(baseDir, 'scripts', 'sync-data.js');
  if (!fs.existsSync(syncPath)) {
    fail('sync-data.js missing');
    return false;
  }
  var content = fs.readFileSync(syncPath, 'utf8');
  // Check for the forbidden pattern: return { input_log: [] } (hardcoded empty)
  var hardcodedEmpty = /return\s*\{\s*['"]input_log['"]\s*:\s*\[\s*\]/;
  if (hardcodedEmpty.test(content)) {
    fail('sync-data.js contains hardcoded "return { input_log: [] }" — must use dynamic sync');
    return false;
  }
  pass('sync-data.js: no hardcoded empty return');
  return true;
}

function checkRemoteIntakeRules() {
  var rulesPath = path.join(baseDir, 'ai-pm-os', 'references', 'remote-intake-rules.md');
  if (!fs.existsSync(rulesPath)) {
    fail('remote-intake-rules.md missing');
    return false;
  }
  var content = fs.readFileSync(rulesPath, 'utf8');
  var allGood = true;

  // Check parallel input methods
  var methods = ['local_file', 'pasted_text', 'chat_upload', 'transcript',
                 'screenshot', 'print_pdf', 'cooper', 'browser_url'];
  for (var i = 0; i < methods.length; i++) {
    if (content.indexOf(methods[i]) === -1) {
      fail('remote-intake-rules.md missing input method: ' + methods[i]);
      allGood = false;
    } else {
      pass('Input method documented: ' + methods[i]);
    }
  }

  // Check "fail and stop" for Cooper — works for both Chinese and English
  // Patterns: "Stop X" or "失败后...停止" with no intervening "auto-switch"
  var cooperFail = /(?:Stop Cooper|stop reading|do not auto-?call|不得自动|失败后.*停止)/i;
  if (!cooperFail.test(content)) {
    fail('remote-intake-rules.md missing Cooper fail-and-stop behavior');
    allGood = false;
  } else {
    pass('Cooper fail-and-stop documented');
  }

  // Check "fail and stop" for browser
  var browserFail = /(?:Stop browser|stop reading|do not auto-?download|不得自动|失败后.*停止)/i;
  if (!browserFail.test(content)) {
    fail('remote-intake-rules.md missing browser fail-and-stop behavior');
    allGood = false;
  } else {
    pass('Browser fail-and-stop documented');
  }

  // Check multi-URL independent processing
  if (content.indexOf('multi') === -1 && content.indexOf('多') === -1 && content.indexOf('URL') === -1) {
    fail('remote-intake-rules.md missing multi-URL independent processing');
    allGood = false;
  } else {
    pass('Multi-URL processing documented');
  }

  return allGood;
}

function checkIntakeReadme() {
  var readmePath = path.join(baseDir, '08_INTAKE', 'README.md');
  if (!fs.existsSync(readmePath)) {
    fail('08_INTAKE/README.md missing');
    return false;
  }
  var content = fs.readFileSync(readmePath, 'utf8');
  var methods = ['local_file', 'pasted_text', 'chat_upload', 'transcript',
                 'screenshot', 'print_pdf', 'cooper', 'browser_url'];
  var allGood = true;
  for (var i = 0; i < methods.length; i++) {
    if (content.indexOf(methods[i]) === -1) {
      fail('08_INTAKE/README.md missing input method: ' + methods[i]);
      allGood = false;
    } else {
      pass('08_INTAKE README method: ' + methods[i]);
    }
  }
  return allGood;
}

function checkRemoteSourcesReadme() {
  var readmePath = path.join(baseDir, '08_INTAKE', 'remote_sources', 'README.md');
  if (!fs.existsSync(readmePath)) {
    fail('08_INTAKE/remote_sources/README.md missing');
    return false;
  }
  var content = fs.readFileSync(readmePath, 'utf8');
  var allGood = true;

  // Cooper fail-stop
  var cooperFail = /Cooper.{0,200}(失败|fail).{0,100}(停止|stop|不继续)/i;
  if (!cooperFail.test(content)) {
    fail('remote_sources/README.md missing Cooper fail-and-stop');
    allGood = false;
  } else {
    pass('remote_sources README: Cooper fail-and-stop');
  }

  // Browser fail-stop
  var browserFail = /(浏览器|browser).{0,200}(失败|fail).{0,100}(停止|stop|不继续)/i;
  if (!browserFail.test(content)) {
    fail('remote_sources/README.md missing browser fail-and-stop');
    allGood = false;
  } else {
    pass('remote_sources README: browser fail-and-stop');
  }

  return allGood;
}

function checkForbiddenFallbackPatterns() {
  var rulesPath = path.join(baseDir, 'ai-pm-os', 'references', 'remote-intake-rules.md');
  var readmePath = path.join(baseDir, '08_INTAKE', 'README.md');
  var sourcesPath = path.join(baseDir, '08_INTAKE', 'remote_sources', 'README.md');
  var filesToCheck = [rulesPath, readmePath, sourcesPath];
  var allGood = true;

  for (var f = 0; f < filesToCheck.length; f++) {
    if (!fs.existsSync(filesToCheck[f])) continue;
    var content = fs.readFileSync(filesToCheck[f], 'utf8');
    for (var p = 0; p < FORBIDDEN_FALLBACK_PATTERNS.length; p++) {
      var match = FORBIDDEN_FALLBACK_PATTERNS[p].exec(content);
      if (match) {
        fail('Forbidden fallback pattern found in ' + path.basename(filesToCheck[f]) +
             ': ' + match[0].substring(0, 100));
        allGood = false;
      }
    }
  }
  if (allGood) {
    pass('No forbidden fallback patterns found');
  }
  return allGood;
}

function checkNoSecrets() {
  var filesToCheck = [
    '07_DATA/input_log.json',
    '00_PM_MEMORY/PM_INPUT_LOG.md',
    'ai-pm-os/references/remote-intake-rules.md',
    '08_INTAKE/README.md',
    '08_INTAKE/remote_sources/README.md'
  ];
  var allGood = true;
  for (var i = 0; i < filesToCheck.length; i++) {
    var fp = path.join(baseDir, filesToCheck[i]);
    if (!fs.existsSync(fp)) continue;
    var content = fs.readFileSync(fp, 'utf8');
    for (var p = 0; p < FORBIDDEN_SECRETS_PATTERNS.length; p++) {
      var match = FORBIDDEN_SECRETS_PATTERNS[p].exec(content);
      if (match) {
        fail('Forbidden secret pattern in ' + filesToCheck[i] + ': ' + match[0].substring(0, 60));
        allGood = false;
      }
    }
  }
  if (allGood) {
    pass('No secret patterns found in intake files');
  }
  return allGood;
}

function checkInputLogMarkdown() {
  var logPath = path.join(baseDir, '00_PM_MEMORY', 'PM_INPUT_LOG.md');
  if (!fs.existsSync(logPath)) {
    fail('PM_INPUT_LOG.md missing');
    return false;
  }
  var content = fs.readFileSync(logPath, 'utf8');
  var allGood = true;

  // Find the header row of the INPUT LOG table.
  // The file has TWO tables: doc_role template (table 1) and input log (table 2).
  // We identify by checking for 'input_id' in the header.
  var lines = content.split('\n');
  var headerLine = null;
  for (var li = 0; li < lines.length; li++) {
    var l = lines[li].trim();
    if (l.charAt(0) !== '|') continue;
    // Skip separator rows
    if (/^[\|\-:\s]+$/.test(l)) continue;
    // Header row of input log table contains 'input_id'
    if (l.toLowerCase().indexOf('input_id') !== -1) {
      headerLine = l;
      break;
    }
  }

  if (!headerLine) {
    fail('PM_INPUT_LOG.md: no input log table header row found');
    return false;
  }

  // Normalize: remove leading/trailing pipes, split by '|', trim each cell
  var headerRow = headerLine.replace(/^\|/, '').replace(/\|$/, '');
  var cells = headerRow.split('|').map(function(c) { return c.trim().toLowerCase(); });

  for (var i = 0; i < REQUIRED_INPUT_FIELDS.length; i++) {
    var field = REQUIRED_INPUT_FIELDS[i].toLowerCase();
    if (cells.indexOf(field) === -1) {
      fail('PM_INPUT_LOG.md missing column header: ' + REQUIRED_INPUT_FIELDS[i]);
      allGood = false;
    } else {
      pass('PM_INPUT_LOG.md header: ' + REQUIRED_INPUT_FIELDS[i]);
    }
  }
  return allGood;
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
  console.error('');
  console.error('=== Remote Intake Contract Validation ===');
  console.error('');

  var results = [];
  results.push(checkFilesExist());
  results.push(checkSchemaRootKey());
  results.push(checkSchemaFieldCoverage());
  results.push(checkJsonRootKey());
  results.push(checkSyncDataNoHardcodedEmpty());
  results.push(checkRemoteIntakeRules());
  results.push(checkIntakeReadme());
  results.push(checkRemoteSourcesReadme());
  results.push(checkForbiddenFallbackPatterns());
  results.push(checkNoSecrets());
  results.push(checkInputLogMarkdown());

  console.error('');
  if (failures > 0) {
    console.error('=== RESULT: FAIL (' + failures + ' failure(s)) ===');
    process.exit(1);
  } else {
    console.error('=== RESULT: PASS — all checks passed ===');
    process.exit(0);
  }
}

main();
