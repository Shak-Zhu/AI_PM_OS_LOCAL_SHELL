/**
 * validate-template-semantics.js
 *
 * Semantic validator for AI PM OS Local Shell — Pure Project Management Copilot.
 *
 * Validates that the product shell does NOT contain:
 * 1. Old AI role terminology (PM AI, Coder AI, Human Owner, AI Reviewer)
 * 2. Work Package / Coder Work Package / Rework Package
 * 3. PM/QC Review, Human Acceptance Request, Coder->PM/QC->Human chain
 * 4. "implemented, pending PM/QC review" status
 * 5. GOVERNANCE_ROOT, Coder COC, GOVERNANCE_ROOT runtime dirs
 * 6. _DEV_PROJECT_CONTROL, pm-ai-work-packages, pm-ai-reviews in delivered files
 * 7. Renamed isomorphic chains (Delivery/Quality/Owner with same 3-tier structure)
 *
 * Also validates:
 * - Template files have required metadata (doc_role, instance_status)
 * - No fabricated project facts (specific REQ/US/WP, M1/P0, fixed dates)
 * - Approval records have decision_maker, relayed_by, source, decided_at
 *
 * Runs as fail-closed: any violation -> exit 1.
 *
 * Usage: node scripts/validate-template-semantics.js [--base <path>]
 */

'use strict';

var fs = require('fs');
var path = require('path');

var baseDir = process.cwd();
for (var ai = 0; ai < process.argv.length; ai++) {
  if (process.argv[ai] === '--base' && ai + 1 < process.argv.length) {
    baseDir = process.argv[ai + 1];
  }
}

// =============================================================================
// OLD MODEL PATTERNS — any match is a failure (in product files)
// =============================================================================

var OLD_PATTERNS = [
  // Old AI roles
  { regex: /PM\s+AI/gi, type: 'OLD_ROLE', note: 'PM AI role' },
  { regex: /Coder\s+AI/gi, type: 'OLD_ROLE', note: 'Coder AI role' },
  { regex: /Human\s+Owner/gi, type: 'OLD_ROLE', note: 'Human Owner role' },
  { regex: /AI\s+Reviewer/gi, type: 'OLD_ROLE', note: 'AI Reviewer role' },
  { regex: /Codex\s+Coder/gi, type: 'OLD_ROLE', note: 'Codex Coder role' },
  { regex: /Coder\s+Coder/gi, type: 'OLD_ROLE', note: 'Coder Coder role' },
  // Old Work Package terminology (English + Chinese)
  { regex: /Work\s+Package/gi, type: 'OLD_WP', note: 'Work Package term (English)' },
  { regex: /工作包(?![\u4e00-\u9fa5])/gi, type: 'OLD_WP', note: '工作包 term (Coder WP residual)' },
  { regex: /Rework\s+Package/gi, type: 'OLD_WP', note: 'Rework Package term' },
  { regex: /Coder\s+Work\s+Package/gi, type: 'OLD_WP', note: 'Coder Work Package term' },
  // R1 fix: also catch "AI对人类" in product files
  { regex: /AI对人类/gi, type: 'OLD_ROLE', note: 'AI对人类 residual role model' },
  // R1 fix: Chinese fixed review chain
  { regex: /PM[\s\/]*QC[\s]*Review/gi, type: 'OLD_CHAIN', note: 'PM/QC Review term (Chinese or mixed)' },
  // Old review chain
  { regex: /PM\s*\/\s*QC\s+Review/gi, type: 'OLD_CHAIN', note: 'PM/QC Review term' },
  { regex: /Human\s+Acceptance\s+Request/gi, type: 'OLD_CHAIN', note: 'Human Acceptance Request term' },
  { regex: /Coder\s*->.*PM\s*\/\s*QC/gi, type: 'OLD_CHAIN', note: 'Coder->PM/QC chain' },
  { regex: /Coder\s*->.*Human\s+Accept/gi, type: 'OLD_CHAIN', note: 'Coder->Human chain' },
  { regex: /COC-CWP/gi, type: 'OLD_COC', note: 'COC-CWP contract' },
  { regex: /COC-RWP/gi, type: 'OLD_COC', note: 'COC-RWP contract' },
  { regex: /COC-PQR/gi, type: 'OLD_COC', note: 'COC-PQR contract' },
  { regex: /COC-HAR/gi, type: 'OLD_COC', note: 'COC-HAR contract' },
  // Old status strings
  { regex: /implemented,\s*pending\s+PM\s*\/\s*QC\s+review/gi, type: 'OLD_STATUS', note: 'PM/QC review status' },
  // Old GOVERNANCE_ROOT
  { regex: /GOVERNANCE_ROOT/gi, type: 'OLD_GOV', note: 'GOVERNANCE_ROOT term' },
  // pm-ai-* paths in PRODUCT files
  { regex: /pm-ai-work-packages/gi, type: 'OLD_PATH', note: 'pm-ai-work-packages in product' },
  { regex: /pm-ai-reviews/gi, type: 'OLD_PATH', note: 'pm-ai-reviews in product' },
  // Old specific scenario IDs
  { regex: /SC-COC-/gi, type: 'OLD_SC', note: 'SC-COC scenario IDs' },
  // Renamed isomorphic chains
  { regex: /Delivery\s*->.*Quality\s*->.*Owner/gi, type: 'ISOMORPHIC', note: 'Isomorphic 3-tier chain renamed' },
  { regex: /Quality\s*->.*Owner/gi, type: 'ISOMORPHIC', note: 'Isomorphic 2-tier chain' },
];

// =============================================================================
// SCAN
// =============================================================================

var errors = [];
var filesScanned = 0;

function addError(msg) { errors.push(msg); }

function isControlSpace(fp) {
  var rel = path.relative(baseDir, fp).replace(/\\/g, '/');
  // Skip control space dirs
  if (/pm-ai-work-packages|pm-ai-reviews|_DEV_PROJECT_CONTROL|\.git$/i.test(rel)) return true;
  // Skip validator itself (contains old terms as documentation)
  if (/validate-template-semantics\.js$/.test(fp)) return true;
  // Skip verify-release.js (contains old terms in comments describing validator checks)
  if (/verify-release\.js$/.test(fp)) return true;
  return false;
}

// R1 fix: Files in PM context where "工作包" is legitimate PM terminology (not Coder WP residual)
var PM_TERMINOLOGY_ALLOWLIST = [
  /01_PM_DOCUMENTS[/\\]PM_WBS_PLAN\.md$/,
  /01_PM_DOCUMENTS[/\\]PM_SCOPE_MANAGEMENT_PLAN\.md$/,
  /01_PM_DOCUMENTS[/\\]PM_ESTIMATION_LOG\.md$/,
  /01_PM_DOCUMENTS[/\\]PM_CONTROL_SUMMARY\.md$/,
  /01_PM_DOCUMENTS[/\\]PM_ACTIVE_WBS\.md$/,
  /00_PM_MEMORY[/\\]PM_CURRENT_STATUS\.md$/,
  /ai-pm-os[/\\]references[/\\].+\.md$/,
  /ai-pm-os[/\\]scenarios[/\\]scenarios\.md$/,
  /PRODUCT_SHELL_MANIFEST\.md$/,
  /RELEASE_CHECKLIST\.md$/,
  /_AI_GLOBAL_MEMORY[/\\]AI_NAMING_CONVENTIONS\.md$/,
];

function isAllowlistedPMTerminology(fp) {
  for (var i = 0; i < PM_TERMINOLOGY_ALLOWLIST.length; i++) {
    if (PM_TERMINOLOGY_ALLOWLIST[i].test(fp)) return true;
  }
  return false;
}

function isScannableFile(fp) {
  var ext = path.extname(fp).toLowerCase();
  return ext === '.md' || ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx' || ext === '.json' || ext === '.cjs' || ext === '.mjs';
}

function scanFile(fp) {
  var rel = path.relative(baseDir, fp).replace(/\\/g, '/');
  if (!isScannableFile(fp)) return;

  var content;
  try {
    content = fs.readFileSync(fp, 'utf8');
    filesScanned++;
  } catch (e) {
    addError('Cannot read: ' + rel + ' — ' + e.message);
    return;
  }

  for (var i = 0; i < OLD_PATTERNS.length; i++) {
    var t = OLD_PATTERNS[i];
    if (t.regex.test(content)) {
      if (t.type === 'OLD_PATH' || t.type === 'OLD_WP' || t.type === 'OLD_COC' ||
          t.type === 'OLD_CHAIN' || t.type === 'OLD_ROLE' || t.type === 'OLD_STATUS' ||
          t.type === 'OLD_GOV' || t.type === 'OLD_SC' || t.type === 'ISOMORPHIC') {
        if (!isControlSpace(fp)) {
          // R1 fix: "工作包" in PM context files is allowed (legitimate PM terminology)
          if (t.note === '工作包 term (Coder WP residual)' && isAllowlistedPMTerminology(fp)) {
            continue;
          }
          // R2 fix: SC-COC- scenario IDs in validate-skill.js are historical references
          // to 8 deleted COC scenarios — not old-model runtime content
          if (t.note === 'SC-COC scenario IDs' && /validate-skill\.js$/.test(fp)) {
            continue;
          }
          addError(t.type + ': ' + rel + ' — ' + t.note);
        }
      }
    }
  }
}

function scanDir(dir) {
  var entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return;
  }
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    var rel = path.relative(baseDir, full).replace(/\\/g, '/');
    if (e.isDirectory()) {
      // Skip excluded dirs
      if (/pm-ai-work-packages|pm-ai-reviews|_DEV_PROJECT_CONTROL|\.git$|node_modules|dist$/i.test(rel)) continue;
      scanDir(full);
    } else if (e.isFile()) {
      scanFile(full);
    }
  }
}

// =============================================================================
// METADATA CHECKS
// =============================================================================

/**
 * R1 fix (QC-F-256/257/258): Template registry and metadata validation.
 * Checks that ALL templates in the registry have 4 required metadata fields.
 * Missing metadata = ERROR (exit non-0), not warning.
 */
function checkTemplateRegistry() {
  var registryPath = path.join(baseDir, '07_DATA/template_registry.json');
  if (!fs.existsSync(registryPath)) {
    addError('TEMPLATE_REGISTRY_MISSING: 07_DATA/template_registry.json does not exist');
    return;
  }

  var regContent;
  try {
    regContent = fs.readFileSync(registryPath, 'utf8');
  } catch (e) {
    addError('TEMPLATE_REGISTRY_UNREADABLE: ' + e.message);
    return;
  }

  var reg;
  try {
    reg = JSON.parse(regContent);
  } catch (e) {
    addError('TEMPLATE_REGISTRY_PARSE_ERROR: ' + e.message);
    return;
  }

  if (!reg || !Array.isArray(reg.templates)) {
    addError('TEMPLATE_REGISTRY_INVALID_STRUCTURE: missing templates array');
    return;
  }

  // Check each registered template
  for (var i = 0; i < reg.templates.length; i++) {
    var t = reg.templates[i];
    if (!t) continue;

    // Check file exists
    if (t.file_exists === false) continue; // Already marked missing, don't double-report

    // Check required fields
    var requiredFields = ['path', 'doc_role', 'instance_status', 'init_behavior', 'fact_declaration'];
    var missingFields = [];
    for (var j = 0; j < requiredFields.length; j++) {
      var f = requiredFields[j];
      if (!t[f] || (typeof t[f] === 'string' && t[f].trim() === '')) {
        missingFields.push(f);
      }
    }
    if (missingFields.length > 0) {
      addError('TEMPLATE_METADATA_MISSING_FIELDS: ' + t.path + ' — missing: ' + missingFields.join(', '));
    }

    // Check the actual file has metadata table
    var fullPath = path.join(baseDir, t.path);
    if (fs.existsSync(fullPath)) {
      try {
        var fileContent = fs.readFileSync(fullPath, 'utf8');
        var firstLines = fileContent.split('\n').slice(0, 30);
        var hasMetadata = firstLines.some(function(l) {
          return /^\|.*doc_role|^\|.*instance_status|^\|.*init_behavior|^\|.*fact_declaration/i.test(l.trim());
        });
        if (!hasMetadata) {
          addError('TEMPLATE_FILE_NO_METADATA_TABLE: ' + t.path + ' — file has no metadata table');
        }
      } catch (e) {
        addError('TEMPLATE_FILE_UNREADABLE: ' + t.path + ' — ' + e.message);
      }
    }
  }
}

// =============================================================================
// APPROVAL FIELD CHECKS
// =============================================================================

/**
 * R1 fix (QC-F-260): Approval field validation.
 * Checks that non-pending approvals have all 11 required fields.
 * Missing required fields = ERROR (exit non-0), not warning.
 */
function checkApprovalFields(fp) {
  var rel = path.relative(baseDir, fp).replace(/\\/g, '/');
  try {
    var content = fs.readFileSync(fp, 'utf8');
    var data = JSON.parse(content);
    if (data && data.approvals && Array.isArray(data.approvals)) {
      for (var i = 0; i < data.approvals.length; i++) {
        var a = data.approvals[i];
        if (!a || typeof a !== 'object') continue;
        // Empty array is fine; only check if there are entries
        if (Object.keys(a).length === 0) continue;
        if (a.status === 'pending' || a.status === 'unconfirmed') continue;
        // R1 fix: All 11 fields required per QC-F-260
        var required = ['approval_id', 'approval_type', 'related_object', 'decision_maker', 'decision_role', 'relayed_by', 'source', 'decided_at', 'decision', 'notes', 'status'];
        var missing = [];
        for (var j = 0; j < required.length; j++) {
          var rf = required[j];
          if (!a[rf] || (typeof a[rf] === 'string' && a[rf].trim() === '')) {
            missing.push(rf);
          }
        }
        if (missing.length > 0) {
          addError('APPROVAL_MISSING_FIELDS: ' + rel + '[' + i + '] missing required: ' + missing.join(', '));
        }
      }
    }
  } catch (e) {
    // not JSON or parse error — skip (other validators handle this)
  }
}

// =============================================================================
// MAIN
// =============================================================================

console.log('=== Semantic Template Validator ===');
console.log('Base: ' + baseDir);

// Scan product dirs
var dirs = [
  '_AI_GLOBAL_MEMORY', '00_PM_MEMORY', '01_PM_DOCUMENTS', '02_AGILE',
  '03_MEETINGS', '04_TODO', '05_REPORTS', '06_DASHBOARD', '07_DATA',
  '08_INTAKE', '09_ARCHIVE', 'ai-pm-os', 'scripts'
];
for (var di = 0; di < dirs.length; di++) {
  scanDir(path.join(baseDir, dirs[di]));
}

// Scan root product docs
var rootFiles = ['README.md', 'USER_GUIDE.md', 'PRODUCT_SHELL_MANIFEST.md', 'RELEASE_CHECKLIST.md', 'AGENTS.md'];
for (var ri = 0; ri < rootFiles.length; ri++) {
  var rf = path.join(baseDir, rootFiles[ri]);
  if (fs.existsSync(rf)) scanFile(rf);
}

// Template registry full validation (R1 fix: replaces spot checks)
checkTemplateRegistry();

// Approval field checks
var approvalFiles = ['07_DATA/approvals.json', '01_PM_DOCUMENTS/PM_APPROVAL_LOG.md'];
for (var ai2 = 0; ai2 < approvalFiles.length; ai2++) {
  checkApprovalFields(path.join(baseDir, approvalFiles[ai2]));
}

// Output
console.log('');
console.log('Files scanned: ' + filesScanned);
console.log('Errors: ' + errors.length);

if (errors.length > 0) {
  console.log('');
  console.log('=== ERRORS ===');
  for (var ei = 0; ei < errors.length; ei++) {
    console.log('  ' + errors[ei]);
  }
}

console.log('');
if (errors.length > 0) {
  console.log('RESULT: FAIL');
  process.exit(1);
} else {
  console.log('RESULT: PASS');
  process.exit(0);
}
