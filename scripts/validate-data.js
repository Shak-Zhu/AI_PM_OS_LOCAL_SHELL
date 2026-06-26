/**
 * JSON Data Contract Validator
 *
 * Validates all 26 JSON data files against their schemas.
 *
 * Usage:
 *   node scripts/validate-data.js
 *
 * Exit codes:
 *   0 = All checks passed
 *   1 = Validation failed (missing file, parse error, schema mismatch, orphan schema)
 */

'use strict';

var fs = require('fs');
var path = require('path');

var BASE = path.resolve(__dirname, '..');
var DATA_DIR = path.join(BASE, '07_DATA');
var SCHEMA_DIR = path.join(BASE, '07_DATA/schemas');

var DATA_FILES = [
  'actions.json', 'approvals.json', 'backlog.json', 'burndown.json',
  'changes.json', 'daily_briefing.json', 'dashboard_state.json',
  'decisions.json', 'documents.json', 'estimation.json',
  'gantt.json', 'input_log.json', 'meeting_actions.json',
  'meeting_decisions.json', 'meetings.json', 'milestones.json',
  'progress.json', 'project_roles.json', 'project_state.json',
  'raid.json', 'reports.json', 'requirements.json',
  'scope.json', 'sprints.json', 'todo.json', 'velocity.json'
];

var EXPECTED_COUNT = 26;

function parseJson(filePath) {
  try {
    var content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return { ok: true, data: JSON.parse(content), error: null };
  } catch (e) {
    return { ok: false, data: null, error: e.message };
  }
}

function getTopLevelType(obj) {
  if (Array.isArray(obj)) return 'array';
  if (obj !== null && typeof obj === 'object') return 'object';
  return 'unknown';
}

function validateValueAgainstSchema(val, propDef) {
  var errors = [];
  if (val === undefined || val === null) return errors;

  // Handle union types like ["string","null"]
  var allowedTypes = propDef.type;
  var actualType = Array.isArray(val) ? 'array' : typeof val;

  if (Array.isArray(allowedTypes)) {
    var validType = false;
    for (var ti = 0; ti < allowedTypes.length; ti++) {
      if (allowedTypes[ti] === actualType) { validType = true; break; }
    }
    if (!validType && actualType !== 'null') {
      errors.push('expected one of types ' + JSON.stringify(allowedTypes) + ', got ' + actualType);
    }
  } else if (allowedTypes === 'number') {
    if (typeof val !== 'number') {
      errors.push('expected number, got ' + typeof val);
    }
    if (typeof val === 'number') {
      if (propDef.minimum !== undefined && val < propDef.minimum) {
        errors.push('below minimum: ' + val + ' < ' + propDef.minimum);
      }
      if (propDef.maximum !== undefined && val > propDef.maximum) {
        errors.push('above maximum: ' + val + ' > ' + propDef.maximum);
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
      errors.push('invalid enum value: ' + val);
    }
  }

  return errors;
}

function validateFileAgainstSchema(dataPath, schemaPath) {
  var errors = [];

  var dataResult = parseJson(dataPath);
  if (!dataResult.ok) {
    return [{ msg: 'JSON parse error: ' + dataResult.error }];
  }

  var schemaResult = parseJson(schemaPath);
  if (!schemaResult.ok) {
    return [{ msg: 'Schema parse error: ' + schemaResult.error }];
  }

  var data = dataResult.data;
  var schema = schemaResult.data;
  var dataType = getTopLevelType(data);

  // Top-level type check
  if (schema.type === 'object' && dataType !== 'object') {
    errors.push({ msg: 'top-level type mismatch: expected object, got ' + dataType });
  } else if (schema.type === 'array' && dataType !== 'array') {
    errors.push({ msg: 'top-level type mismatch: expected array, got ' + dataType });
  }

  // Property validation
  if (dataType === 'object' && schema.properties) {
    var propNames = Object.keys(schema.properties);
    for (var pi = 0; pi < propNames.length; pi++) {
      var pname = propNames[pi];
      var pdef = schema.properties[pname];
      if (!pdef) continue;
      var val = data[pname];

      // Validate value against property definition
      var valErrors = validateValueAgainstSchema(val, pdef);
      for (var vi = 0; vi < valErrors.length; vi++) {
        errors.push({ msg: pname + ' ' + valErrors[vi] });
      }

      // Array item required field validation
      if (Array.isArray(val) && pdef.items && pdef.items.properties) {
        var itemReq = pdef.items.required || [];
        var itemProps = pdef.items.properties;
        for (var ai = 0; ai < val.length; ai++) {
          var item = val[ai];
          if (typeof item !== 'object' || item === null) continue;

          // Check required fields
          for (var ri = 0; ri < itemReq.length; ri++) {
            var rf = itemReq[ri];
            if (item[rf] === undefined || item[rf] === null) {
              errors.push({ msg: pname + '[' + ai + '] missing required field: ' + rf });
            }
          }

          // Validate item field values
          for (var ipn in itemProps) {
            var ipdef = itemProps[ipn];
            if (!ipdef) continue;
            var ival = item[ipn];
            if (ival === undefined || ival === null) continue;

            var ievalErrors = validateValueAgainstSchema(ival, ipdef);
            for (var ie = 0; ie < ievalErrors.length; ie++) {
              errors.push({ msg: pname + '[' + ai + '].' + ipn + ' ' + ievalErrors[ie] });
            }
          }
        }
      }
    }
  }

  return errors;
}

function main() {
  console.log('=== JSON Data Contract Validator ===');
  console.log('Base: ' + BASE);
  console.log('');

  var totalErrors = 0;
  var missingSchemas = [];

  // Phase 1: Check all 26 data files exist
  console.log('[Phase 1] Checking 26 data files exist...');
  var missingData = [];
  for (var i = 0; i < DATA_FILES.length; i++) {
    var df = path.join(DATA_DIR, DATA_FILES[i]);
    if (fs.existsSync(df)) {
    } else {
      missingData.push(DATA_FILES[i]);
    }
  }
  var dataFilesFound = EXPECTED_COUNT - missingData.length;
  console.log('  Found: ' + dataFilesFound + '/' + EXPECTED_COUNT);
  if (missingData.length > 0) {
    console.log('  MISSING data files: ' + missingData.join(', '));
    totalErrors += missingData.length;
  }

  // Phase 2: Check schemas exist (fail-closed: missing schema = error)
  console.log('');
  console.log('[Phase 2] Checking schemas exist...');
  var schemaMap = {};
  var missingSchemasList = [];
  if (fs.existsSync(SCHEMA_DIR)) {
    var schemaNames = fs.readdirSync(SCHEMA_DIR).filter(function(f) { return f.endsWith('.json'); });
    for (var si = 0; si < schemaNames.length; si++) {
      var sfp = path.join(SCHEMA_DIR, schemaNames[si]);
      var sr = parseJson(sfp);
      if (sr.ok) {
        schemaMap[schemaNames[si]] = sr.data;
      } else {
        // Parseable but invalid schema is still counted
        schemaMap[schemaNames[si]] = null;
      }
    }
  }

  // Check each expected schema exists
  for (var j = 0; j < DATA_FILES.length; j++) {
    var expectedSchema = DATA_FILES[j].replace('.json', '.schema.json');
    if (!schemaMap[expectedSchema]) {
      missingSchemasList.push(expectedSchema);
      console.log('  MISSING schema: ' + expectedSchema);
    }
  }

  if (missingSchemasList.length > 0) {
    totalErrors += missingSchemasList.length;
  }
  var schemaFilesFound = Object.keys(schemaMap).length;
  console.log('  Schema files found: ' + schemaFilesFound + ' (missing: ' + missingSchemasList.length + ')');

  // Phase 3: Orphan schema check
  console.log('');
  console.log('[Phase 3] Checking for orphan schemas...');
  var orphanSchemas = [];
  for (var sk in schemaMap) {
    var baseName = sk.replace('.schema.json', '.json');
    if (DATA_FILES.indexOf(baseName) === -1) {
      orphanSchemas.push(sk);
    }
  }
  if (orphanSchemas.length > 0) {
    console.log('  ORPHAN schemas: ' + orphanSchemas.join(', '));
    totalErrors += orphanSchemas.length;
  } else {
    console.log('  No orphan schemas.');
  }

  // Phase 4: Validate each data file against its schema
  console.log('');
  console.log('[Phase 4] Validating data files against schemas...');
  var fileErrors = 0;
  for (var fi = 0; fi < DATA_FILES.length; fi++) {
    var dfName = DATA_FILES[fi];
    var dfPath = path.join(DATA_DIR, dfName);
    var sfName = dfName.replace('.json', '.schema.json');
    var sfPath = path.join(SCHEMA_DIR, sfName);
    var relData = path.relative(BASE, dfPath);

    if (!fs.existsSync(dfPath)) {
      // Already reported in Phase 1
      continue;
    }

    if (!schemaMap[sfName]) {
      // Missing schema = SKIP but counts as error (QC-F-122 fix)
      console.log('  SKIP: ' + relData + ' (schema ' + sfName + ' not found)');
      fileErrors++;
      continue;
    }

    var errors = validateFileAgainstSchema(dfPath, sfPath);
    if (errors.length === 0) {
      console.log('  OK: ' + relData);
    } else {
      fileErrors += errors.length;
      totalErrors += errors.length;
      console.log('  FAIL: ' + relData);
      for (var ei = 0; ei < errors.length; ei++) {
        console.log('    - ' + errors[ei].msg);
      }
    }
  }

  // Summary
  console.log('');
  console.log('=== Summary ===');
  console.log('Data files found: ' + dataFilesFound + '/' + EXPECTED_COUNT);
  console.log('Schema files found: ' + schemaFilesFound);
  console.log('Missing schemas: ' + missingSchemasList.length);
  console.log('Orphan schemas: ' + orphanSchemas.length);
  console.log('Validation errors: ' + fileErrors);
  console.log('');

  // Fail-closed: any error condition must result in exit 1
  var ok = (dataFilesFound === EXPECTED_COUNT &&
             missingSchemasList.length === 0 &&
             orphanSchemas.length === 0 &&
             fileErrors === 0);

  if (ok) {
    console.log('RESULT: PASS - All data contracts valid.');
    process.exit(0);
  } else {
    console.log('RESULT: FAIL - Data contract errors detected.');
    process.exit(1);
  }
}

main();
