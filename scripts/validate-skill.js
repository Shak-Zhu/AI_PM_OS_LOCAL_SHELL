/**
 * AI PM OS Local Shell - Skill Validation Script
 *
 * Cross-platform Node.js script to verify the ai-pm-os Skill package
 * structure, required capability tags, scenario structure, absence
 * of platform-specific absolute paths, and three semantic invariants.
 *
 * Usage:
 *   node scripts/validate-skill.js
 *
 * Exit codes:
 *   0 = All checks passed (clean)
 *   1 = Validation failed
 *   2 = Unexpected error
 */

'use strict';

const fs = require('fs');
const path = require('path');

// --- Configuration ---

// Required files inside the ai-pm-os/ package
const REQUIRED_FILES = [
  'ai-pm-os/SKILL.md',
  'ai-pm-os/references/framework-matrix.md',
  'ai-pm-os/references/router.md',
  'ai-pm-os/references/fact-layers.md',
  'ai-pm-os/references/stability-rules.md',
  'ai-pm-os/references/install-and-invoke.md',
  'ai-pm-os/scenarios/scenarios.md',
];

// Required capability tags that must appear in SKILL.md
const REQUIRED_CAPABILITY_TAGS = [
  'governance:judgment',
  'framework:pmp_pmbok',
  'framework:prince2',
  'framework:apm',
  'framework:pmo',
  'framework:scrum',
  'framework:kanban',
  'framework:hybrid',
  'fact:layered',
  'stability:idempotent',
  'stability:recoverable',
  'stability:traced',
  'stability:deterministic',
  'consistency:cross_agent',
];

// Platforms / path patterns that must NOT appear (machine-specific)
const FORBIDDEN_PATH_PATTERNS = [
  // Any Windows drive letter + backslash (e.g. C:\..., D:\...)
  /[A-Za-z]:\\[^\\\s]+/,
  // Any Windows drive letter + forward slash (e.g. C:/..., D:/...)
  /[A-Za-z]:\/[^\/\s]+/,
  // Windows UNC path (\\server\share\...)
  /\\\\[^\\\s]+\\[^\\\s]+/,
  // macOS /Volumes/ mount path
  /\/Volumes\/[^\/\s]+/,
  // Unix /Users/ home directory
  /\/Users\/[^\/\s]+/,
  // Unix /home/ directory
  /\/home\/[^\/\s]+/,
  // macOS /Applications/
  /\/Applications\//,
  // Windows C:\Program Files\ (preserve existing specific pattern)
  /C:\\Program Files\\/i,
];

// Exact strings that must NOT be flagged as forbidden paths.
// Only these three strings are suppressed — all other content is checked normally.
// NOTE: /ai-pm-os and 07_DATA/... do NOT match any FORBIDDEN_PATH_PATTERNS regex
// (they don't start with drive letters, UNC, /Volumes/, etc.).
// Only http://localhost:5173 needs suppression because "http:" matches [A-Za-z]: in
// the drive-letter patterns; exact-string match avoids bypassing via mixed lines.
const PATH_FALSE_POSITIVE_EXACT = [
  '/ai-pm-os',
  '07_DATA/project_state.json',
  'http://localhost:5173',
];

function isFalsePositive(line) {
  return PATH_FALSE_POSITIVE_EXACT.some(s => line === s);
}

// Scenario section headings we expect to find at least once
const REQUIRED_SCENARIO_FIELDS = [
  'Given',
  'When',
  'Then',
  'Allow',
  'Forbid',
  'Evidence',
];

// --- Utility ---

function readSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (err) {
    return null;
  }
}

function listAllFiles(dir, baseDir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(baseDir, full);
    if (e.isDirectory()) {
      out.push(...listAllFiles(full, baseDir));
    } else {
      out.push({ full, rel });
    }
  }
  return out;
}

// --- Checks ---

function checkRequiredFiles(baseDir) {
  const missing = [];
  for (const rel of REQUIRED_FILES) {
    const p = path.join(baseDir, rel);
    if (!fs.existsSync(p)) {
      missing.push(rel);
    }
  }
  return missing;
}

function checkCapabilityTags(baseDir) {
  const skillPath = path.join(baseDir, 'ai-pm-os', 'SKILL.md');
  const content = readSafe(skillPath) || '';
  const missing = [];
  for (const tag of REQUIRED_CAPABILITY_TAGS) {
    if (!content.includes(tag)) {
      missing.push(tag);
    }
  }
  return { missing, content };
}

function checkScenarios(baseDir) {
  const scPath = path.join(baseDir, 'ai-pm-os', 'scenarios', 'scenarios.md');
  const content = readSafe(scPath) || '';

  // Find scenario IDs
  const idPattern = /\*\*ID\*\*:\s*(SC-[A-Z0-9\-]+)/g;
  const ids = new Set();
  let m;
  while ((m = idPattern.exec(content)) !== null) {
    ids.add(m[1]);
  }

  // For each scenario ID block, check that it contains all required fields
  const errors = [];
  const required = REQUIRED_SCENARIO_FIELDS;
  for (const id of ids) {
    const blockRe = new RegExp(`\\*\\*ID\\*\\*:\\s*${id}[\\s\\S]*?(?=\\*\\*ID\\*\\*:|$)`);
    const block = (content.match(blockRe) || [''])[0];
    for (const f of required) {
      if (!new RegExp(`\\*\\*${f}\\*\\*:`).test(block)) {
        errors.push({ id, missing: f });
      }
    }
  }

  return { total: ids.size, errors };
}

function checkAbsolutePaths(baseDir) {
  const skillDir = path.join(baseDir, 'ai-pm-os');
  const files = listAllFiles(skillDir, baseDir);
  const hits = [];
  for (const { full, rel } of files) {
    const content = readSafe(full) || '';
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pat of FORBIDDEN_PATH_PATTERNS) {
        if (pat.test(line)) {
          // Suppress false positives for allowed relative paths and URLs
          if (isFalsePositive(line)) continue;
          hits.push({ file: rel, line: i + 1, pattern: pat.toString() });
          break;
        }
      }
    }
  }
  return hits;
}

// --- Semantic Invariant Checks (Phase 5) ---

/**
 * Extract a named field block from a scenario block.
 * Returns the text between "- **FieldName**:" and the next "- **" heading or end.
 */
function extractFieldBlock(scenarioText, fieldName) {
  const re = new RegExp(
    `- \\*\\*${fieldName}\\*\\*:([\\s\\S]*?)(?=\\n- \\*\\*|\\n---|$)`,
    ''
  );
  const m = scenarioText.match(re);
  return m ? m[1].replace(/^\n/, '') : '';
}

/**
 * Extract all scenario blocks from scenarios.md.
 * Returns array of { id, text } by finding ID positions and taking substrings.
 */
function extractScenarioBlocks(content) {
  const blocks = [];
  // Find all positions of scenario IDs
  const idRe = /\*\*ID\*\*:\s*(SC-[A-Z0-9\-]+)/g;
  let match;
  const positions = [];
  while ((match = idRe.exec(content)) !== null) {
    positions.push({ id: match[1], start: match.index });
  }
  // Extract text between each ID position and the next one
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].start;
    const end = i + 1 < positions.length ? positions[i + 1].start : content.length;
    blocks.push({ id: positions[i].id, text: content.substring(start, end) });
  }
  return blocks;
}

/**
 * SI-01: Framework auto-selection
 *
 * PASSES when:
 *   (a) router.md contains §4 "框架自动选择" / "自动选择主框架" AND
 *   (b) SC-EDGE-01's Then block contains "自动选择" AND
 *   (c) SC-EDGE-01's Then block does NOT contain affirmative requests
 *       for user to choose methodology (e.g., "请用户选择" not preceded by "请")
 *
 * FAILS when:
 *   (a) router.md lacks §4 / "框架自动选择" section OR
 *   (b) SC-EDGE-01 Then lacks auto-selection behavior OR
 *   (c) SC-EDGE-01 Then asks user to pick a methodology
 */
function checkSemanticInvariant01(baseDir) {
  const routerPath = path.join(baseDir, 'ai-pm-os', 'references', 'router.md');
  const scPath = path.join(baseDir, 'ai-pm-os', 'scenarios', 'scenarios.md');
  const routerContent = readSafe(routerPath) || '';
  const scContent = readSafe(scPath) || '';

  const errors = [];

  // (a) router.md must have auto-selection rules
  if (!routerContent.includes('框架自动选择') && !routerContent.includes('自动选择主框架')) {
    errors.push('SI-01a: router.md missing framework auto-selection rules (§4)');
  }

  // Extract SC-EDGE-01 block
  const blocks = extractScenarioBlocks(scContent);
  const edge01 = blocks.find(b => b.id === 'SC-EDGE-01');

  if (!edge01) {
    errors.push('SI-01b: SC-EDGE-01 block not found in scenarios.md');
    return errors;
  }

  // Extract only the Then block (not Allow or Forbid)
  const thenBlock = extractFieldBlock(edge01.text, 'Then');

  // Then block must contain auto-selection behavior
  if (!thenBlock.includes('自动选择') && !thenBlock.includes('自动选择主框架')) {
    errors.push('SI-01b: SC-EDGE-01 Then missing auto-selection behavior');
  }

  // Then block must NOT contain affirmative user-choice requests
  // Use negative lookbehind to avoid matching "不请求用户选择" (which contains "请求用户选择")
  // Pattern matches "请用户选择" or "请用户指定" NOT preceded by "请" or "求"
  const asksUserToChoose = /(?<!请|求)请用户选择|请用户指定/.test(thenBlock);
  if (asksUserToChoose) {
    errors.push('SI-01c: SC-EDGE-01 Then asks user to choose methodology (violates auto-selection rule)');
  }

  return errors;
}

/**
 * SI-02: Atomic PU application (no partial apply)
 *
 * PASSES when:
 *   (a) stability-rules.md contains "原子应用" or "S-INV-01" AND
 *   (b) SC-STB-04 Forbid block explicitly forbids partial application
 *
 * FAILS when:
 *   (a) stability-rules.md lacks atomic PU rules OR
 *   (b) SC-STB-04 Forbid does not mention "部分应用" prohibition
 */
function checkSemanticInvariant02(baseDir) {
  const stabilityPath = path.join(baseDir, 'ai-pm-os', 'references', 'stability-rules.md');
  const scPath = path.join(baseDir, 'ai-pm-os', 'scenarios', 'scenarios.md');
  const stabilityContent = readSafe(stabilityPath) || '';
  const scContent = readSafe(scPath) || '';

  const errors = [];

  // (a) stability-rules.md must have atomic PU rules
  if (!stabilityContent.includes('原子') && !stabilityContent.includes('S-INV-01')) {
    errors.push('SI-02a: stability-rules.md missing atomic PU application rules');
  }

  // Extract SC-STB-04 block
  const blocks = extractScenarioBlocks(scContent);
  const stb04 = blocks.find(b => b.id === 'SC-STB-04');

  if (!stb04) {
    errors.push('SI-02b: SC-STB-04 block not found in scenarios.md');
    return errors;
  }

  // Extract Forbid block
  const forbidBlock = extractFieldBlock(stb04.text, 'Forbid');

  // Forbid block must prohibit partial application
  if (!forbidBlock.includes('部分应用') && !forbidBlock.includes('静默部分应用')) {
    errors.push('SI-02b: SC-STB-04 Forbid missing partial-application prohibition');
  }

  return errors;
}

/**
 * SI-03: Given/Then output count consistency (SC-STB-08)
 *
 * PASSES when:
 *   Given block of SC-STB-08 contains N concrete overdue items
 *   and Then says exactly "N 项逾期" (matching count).
 *
 * Counting method: Count occurrences of "ACT-" prefix (representing ACT-### template items)
 * in the Given block; match against the number in "N 项逾期" in the Then block.
 *
 * FAILS when:
 *   Count mismatch between Given concrete items and Then reported count.
 */
function checkSemanticInvariant03(baseDir) {
  const scPath = path.join(baseDir, 'ai-pm-os', 'scenarios', 'scenarios.md');
  const scContent = readSafe(scPath) || '';
  const errors = [];

  // Extract SC-STB-08 block
  const blocks = extractScenarioBlocks(scContent);
  const stb08 = blocks.find(b => b.id === 'SC-STB-08');

  if (!stb08) {
    errors.push('SI-03: SC-STB-08 block not found in scenarios.md');
    return errors;
  }

  // Extract Given and Then blocks
  const givenBlock = extractFieldBlock(stb08.text, 'Given');
  const thenBlock = extractFieldBlock(stb08.text, 'Then');

  // Count concrete ACT-### template items in Given by counting "ACT-" occurrences
  // Pattern: ACT- appears N times (e.g., "ACT-###、ACT-###、ACT-###" = 3 items)
  const actOccurrences = (givenBlock.match(/ACT-/g) || []).length;

  // Count "N 项逾期" in Then block
  const overdueCountRe = /(\d+)\s+项逾期/;
  const thenMatch = thenBlock.match(overdueCountRe);

  if (actOccurrences > 0 && thenMatch) {
    const thenCount = parseInt(thenMatch[1], 10);
    if (thenCount !== actOccurrences) {
      errors.push(`SI-03: SC-STB-08 Given has ${actOccurrences} ACT- items but Then says "${thenCount} 项逾期" (count mismatch)`);
    }
  }

  return errors;
}

// --- Main ---

function main() {
  const baseDir = path.resolve(__dirname, '..');

  console.log('=== ai-pm-os Skill Validation ===');
  console.log('Base directory:', baseDir);
  console.log('');

  let totalErrors = 0;

  // Phase 1: Required files
  console.log('[Phase 1] Checking required files...');
  const missingFiles = checkRequiredFiles(baseDir);
  if (missingFiles.length === 0) {
    console.log('  OK: all required files present (' + REQUIRED_FILES.length + ')');
  } else {
    for (const f of missingFiles) console.log('  MISSING: ' + f);
    totalErrors += missingFiles.length;
  }

  // Phase 2: Required capability tags
  console.log('');
  console.log('[Phase 2] Checking required capability tags in SKILL.md...');
  const tagCheck = checkCapabilityTags(baseDir);
  if (tagCheck.missing.length === 0) {
    console.log('  OK: all required capability tags present (' + REQUIRED_CAPABILITY_TAGS.length + ')');
  } else {
    for (const t of tagCheck.missing) console.log('  MISSING: ' + t);
    totalErrors += tagCheck.missing.length;
  }

  // Phase 3: Scenario structure
  console.log('');
  console.log('[Phase 3] Checking scenario structure...');
  const sc = checkScenarios(baseDir);
  console.log('  Total scenarios: ' + sc.total);
  if (sc.total < 20) {
    console.log('  FAIL: at least 20 scenarios required, found ' + sc.total);
    totalErrors += 1;
  } else if (sc.errors.length === 0) {
    console.log('  OK: all scenarios contain Given/When/Then/Allow/Forbid/Evidence');
  } else {
    for (const e of sc.errors) {
      console.log('  FIELD MISSING: scenario ' + e.id + ' missing ' + e.missing);
      totalErrors += 1;
    }
  }

  // Phase 4: Forbidden absolute paths
  console.log('');
  console.log('[Phase 4] Checking for forbidden absolute paths in ai-pm-os...');
  const pathHits = checkAbsolutePaths(baseDir);
  if (pathHits.length === 0) {
    console.log('  OK: no platform-specific absolute paths detected');
  } else {
    for (const h of pathHits) {
      console.log('  FORBIDDEN PATH: ' + h.file + ':' + h.line + ' matches ' + h.pattern);
      totalErrors += 1;
    }
  }

  // Phase 5: Semantic invariants (WP-002-R1 fixes)
  console.log('');
  console.log('[Phase 5] Checking semantic invariants...');
  const siErrors = [];
  const si01 = checkSemanticInvariant01(baseDir);
  const si02 = checkSemanticInvariant02(baseDir);
  const si03 = checkSemanticInvariant03(baseDir);
  siErrors.push(...si01, ...si02, ...si03);
  if (siErrors.length === 0) {
    console.log('  OK: SI-01 (framework auto-selection) PASS');
    console.log('  OK: SI-02 (atomic PU apply) PASS');
    console.log('  OK: SI-03 (Given/Then count consistency) PASS');
  } else {
    for (const e of siErrors) {
      console.log('  SEMANTIC VIOLATION: ' + e);
      totalErrors += 1;
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log('Required files missing: ' + missingFiles.length);
  console.log('Capability tags missing: ' + tagCheck.missing.length);
  console.log('Scenario structure errors: ' + sc.errors.length);
  console.log('Absolute path hits: ' + pathHits.length);
  console.log('Semantic invariant violations: ' + siErrors.length);
  console.log('');

  if (totalErrors === 0) {
    console.log('RESULT: PASS - ai-pm-os Skill is well-formed.');
    console.log('');
    process.exit(0);
  } else {
    console.log('RESULT: FAIL - Skill validation errors detected.');
    console.log('');
    process.exit(1);
  }
}

main();
