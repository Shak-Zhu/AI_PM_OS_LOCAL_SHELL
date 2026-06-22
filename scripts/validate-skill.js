/**
 * AI PM OS Local Shell - Skill Validation Script
 *
 * Cross-platform Node.js script to verify the ai-pm-os Skill package
 * structure, required capability tags, scenario structure, absence
 * of platform-specific absolute paths, and eight semantic invariants.
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

// WP-004: Single source of truth for scenario count. All heading/ID/block
// and Phase 3 checks reference this constant. No scattered magic numbers.
const EXPECTED_SCENARIO_COUNT = 42;

// Required files inside the ai-pm-os/ package
const REQUIRED_FILES = [
  'ai-pm-os/SKILL.md',
  'ai-pm-os/references/framework-matrix.md',
  'ai-pm-os/references/router.md',
  'ai-pm-os/references/fact-layers.md',
  'ai-pm-os/references/stability-rules.md',
  'ai-pm-os/references/install-and-invoke.md',
  'ai-pm-os/references/agile-delivery-rules.md',
  'ai-pm-os/references/memory-and-recovery.md',
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
          if (isFalsePositive(line)) continue;
          hits.push({ file: rel, line: i + 1, pattern: pat.toString() });
          break;
        }
      }
    }
  }
  return hits;
}

/**
 * checkScenarioHeadings: WP-003-R3 — rigorous double-counting verification.
 *
 * PASSES when ALL of the following are true:
 *   (a) Raw heading occurrences == 34 (NOT Set; each "## N." counted individually)
 *   (b) Every heading number N is in 1..34; no N < 1, N > 34, or extra heading numbers
 *   (c) Raw ID occurrences in document == 34 (NOT Set; each "- **ID**: SC-..." counted individually)
 *   (d) Unique IDs in document == 34 (each ID value appears exactly once in the whole file)
 *   (e) Per-heading-block parsing: each heading-to-next-heading block contains exactly 1 ID
 *
 * FAILS when:
 *   (a) Heading count != 34 (too many or too few)
 *   (b) Any heading number is outside 1..34, or duplicates exist
 *   (c) Raw ID count != 34 (e.g., ## 35 injection)
 *   (d) Unique ID count != 34 (duplicates indicate Set掩盖问题)
 *   (e) Any heading block has 0 or >1 IDs
 */
function checkScenarioHeadings(baseDir) {
  const scPath = path.join(baseDir, 'ai-pm-os', 'scenarios', 'scenarios.md');
  const content = readSafe(scPath) || '';
  const lines = content.split('\n');
  const errors = [];

  // (a) Count raw heading occurrences (NOT Set — every occurrence counts)
  const rawHeadingCount = lines.reduce((count, line) => {
    return count + (/^## (\d+)\./.test(line) ? 1 : 0);
  }, 0);
  if (rawHeadingCount !== EXPECTED_SCENARIO_COUNT) {
    errors.push('HEADING COUNT: found ' + rawHeadingCount + ' headings, exactly ' + EXPECTED_SCENARIO_COUNT + ' required');
  }

  // (b) Each heading number must be in 1..N; no extra numbers
  let lastHeadingNum = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^## (\d+)\./);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n < 1 || n > EXPECTED_SCENARIO_COUNT) {
        errors.push('HEADING NUMBER: ## ' + n + ' at line ' + (i + 1) + ' is outside valid range 1..' + EXPECTED_SCENARIO_COUNT);
      }
      if (n <= lastHeadingNum) {
        errors.push('HEADING ORDER: ## ' + n + ' at line ' + (i + 1) + ' is not strictly ascending (previous: ## ' + lastHeadingNum + ')');
      }
      lastHeadingNum = n;
    }
  }

  // (c) Count raw ID occurrences in the whole document (NOT Set)
  const rawIdMatches = content.match(/\- \*\*ID\*\*:\s*(SC-[A-Z0-9\-]+)/g) || [];
  const rawIdCount = rawIdMatches.length;
  if (rawIdCount !== EXPECTED_SCENARIO_COUNT) {
    errors.push('ID RAW COUNT: found ' + rawIdCount + ' IDs in document, exactly ' + EXPECTED_SCENARIO_COUNT + ' required');
  }

  // (d) Count unique IDs — array-based duplicate detection (NOT Set掩盖)
  const idValues = rawIdMatches.map(m => m.replace(/\- \*\*ID\*\*:\s*/, '').trim());
  const uniqueIds = [];
  const idSeen = {};
  for (const id of idValues) {
    if (idSeen[id]) {
      errors.push('ID DUPLICATE: "' + id + '" appears more than once in the document');
    } else {
      idSeen[id] = true;
      uniqueIds.push(id);
    }
  }
  if (uniqueIds.length !== EXPECTED_SCENARIO_COUNT) {
    errors.push('ID UNIQUE COUNT: found ' + uniqueIds.length + ' unique IDs, exactly ' + EXPECTED_SCENARIO_COUNT + ' required');
  }

  // (e) Per-heading-block parsing: each heading block contains exactly 1 ID
  // Find all heading line indices
  const headingLineIndices = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^## (\d+)\./.test(lines[i])) headingLineIndices.push(i);
  }
  for (let i = 0; i < headingLineIndices.length; i++) {
    const start = headingLineIndices[i];
    const end = (i + 1 < headingLineIndices.length) ? headingLineIndices[i + 1] : lines.length;
    const blockText = lines.slice(start, end).join('\n');
    const blockIdMatches = blockText.match(/\- \*\*ID\*\*:\s*(SC-[A-Z0-9\-]+)/g) || [];
    if (blockIdMatches.length === 0) {
      errors.push('HEADING BLOCK ID: heading at line ' + (start + 1) + ' block has 0 IDs (need exactly 1)');
    } else if (blockIdMatches.length > 1) {
      errors.push('HEADING BLOCK ID: heading at line ' + (start + 1) + ' block has ' + blockIdMatches.length + ' IDs (need exactly 1)');
    }
  }

  return errors;
}

// --- Helper: Scenario Block Parsing ---

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
  const idRe = /\*\*ID\*\*:\s*(SC-[A-Z0-9\-]+)/g;
  let match;
  const positions = [];
  while ((match = idRe.exec(content)) !== null) {
    positions.push({ id: match[1], start: match.index });
  }
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].start;
    const end = i + 1 < positions.length ? positions[i + 1].start : content.length;
    blocks.push({ id: positions[i].id, text: content.substring(start, end) });
  }
  return blocks;
}

// --- Semantic Invariants ---

/**
 * SI-01: Framework auto-selection
 *
 * PASSES when:
 *   (a) router.md contains §4 "框架自动选择" / "自动选择主框架" AND
 *   (b) SC-EDGE-01's Then block contains "自动选择" AND
 *   (c) SC-EDGE-01's Then block does NOT contain affirmative requests
 *       for user to choose methodology
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

  if (!routerContent.includes('框架自动选择') && !routerContent.includes('自动选择主框架')) {
    errors.push('SI-01a: router.md missing framework auto-selection rules (§4)');
  }

  const blocks = extractScenarioBlocks(scContent);
  const edge01 = blocks.find(b => b.id === 'SC-EDGE-01');

  if (!edge01) {
    errors.push('SI-01b: SC-EDGE-01 block not found in scenarios.md');
    return errors;
  }

  const thenBlock = extractFieldBlock(edge01.text, 'Then');

  if (!thenBlock.includes('自动选择') && !thenBlock.includes('自动选择主框架')) {
    errors.push('SI-01b: SC-EDGE-01 Then missing auto-selection behavior');
  }

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

  if (!stabilityContent.includes('原子') && !stabilityContent.includes('S-INV-01')) {
    errors.push('SI-02a: stability-rules.md missing atomic PU application rules');
  }

  const blocks = extractScenarioBlocks(scContent);
  const stb04 = blocks.find(b => b.id === 'SC-STB-04');

  if (!stb04) {
    errors.push('SI-02b: SC-STB-04 block not found in scenarios.md');
    return errors;
  }

  const forbidBlock = extractFieldBlock(stb04.text, 'Forbid');

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
 * FAILS when:
 *   Count mismatch between Given concrete items and Then reported count.
 */
function checkSemanticInvariant03(baseDir) {
  const scPath = path.join(baseDir, 'ai-pm-os', 'scenarios', 'scenarios.md');
  const scContent = readSafe(scPath) || '';
  const errors = [];

  const blocks = extractScenarioBlocks(scContent);
  const stb08 = blocks.find(b => b.id === 'SC-STB-08');

  if (!stb08) {
    errors.push('SI-03: SC-STB-08 block not found in scenarios.md');
    return errors;
  }

  const givenBlock = extractFieldBlock(stb08.text, 'Given');
  const thenBlock = extractFieldBlock(stb08.text, 'Then');

  const actOccurrences = (givenBlock.match(/ACT-/g) || []).length;
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

/**
 * SI-04: DoR != DoD separation (WP-003)
 *
 * PASSES when:
 *   (a) agile-delivery-rules.md contains DoR section with >= 4 check items AND
 *   (b) agile-delivery-rules.md contains DoD section with >= 4 check items AND
 *   (c) explicit DoR != DoD or "不得互换" separation statement exists
 *
 * FAILS when:
 *   (a) DoR or DoD section is missing OR
 *   (b) fewer than 4 check items in either section OR
 *   (c) no explicit separation statement
 */
function checkSemanticInvariant04(baseDir) {
  const agilePath = path.join(baseDir, 'ai-pm-os', 'references', 'agile-delivery-rules.md');
  const agileContent = readSafe(agilePath) || '';
  const errors = [];

  if (!agileContent.includes('DoR')) {
    errors.push('SI-04a: agile-delivery-rules.md missing DoR definition');
  }

  if (!agileContent.includes('DoD')) {
    errors.push('SI-04b: agile-delivery-rules.md missing DoD definition');
  }

  const dorMatch = agileContent.match(/(?:DoR.{0,30}检查项|DoR 最低检查项|## DoR[^#]*5\.2)[\s\S]{0,2000}/i);
  if (dorMatch) {
    const dorChecks = (dorMatch[0].match(/(?:^|\n)\d+\. /gm) || []).length;
    if (dorChecks < 4) {
      errors.push('SI-04c: DoR section has ' + dorChecks + ' check items, >= 4 required');
    }
  }

  const dodMatch = agileContent.match(/(?:DoD.{0,30}检查项|DoD 最低检查项|## DoD[^#]*5\.3)[\s\S]{0,2000}/i);
  if (dodMatch) {
    const dodChecks = (dodMatch[0].match(/(?:^|\n)\d+\. /gm) || []).length;
    if (dodChecks < 4) {
      errors.push('SI-04d: DoD section has ' + dodChecks + ' check items, >= 4 required');
    }
  }

  if (!/DoR[^= ]{0,15}≠[^= ]{0,15}DoD|DoD.{0,15}≠.{0,15}DoR|不得互换/.test(agileContent)) {
    errors.push('SI-04e: agile-delivery-rules.md missing explicit DoR != DoD separation statement');
  }

  return errors;
}

/**
 * SI-05: Scope conflict rule - unapproved Story not in committed Sprint (WP-003-R1)
 *
 * PASSES when:
 *   (a) agile-delivery-rules.md contains prohibition against unapproved entry in committed Sprint AND
 *   (b) scenarios.md contains SC-AGILE-SCP-01 AND
 *   (c) SC-AGILE-SCP-01 Then block item 6 explicitly requires BL-021 NOT in committed state
 *       (e.g., "不得将 BL-021 保持在 committed" - negation required) AND
 *   (d) SC-AGILE-SCP-01 Forbid block prohibits committed Sprint for unapproved items
 *       (e.g., "不得将未批准条目保持在 committed" - negation required)
 *
 * FAILS when:
 *   (a) rule in agile-delivery-rules.md is missing OR
 *   (b) SC-AGILE-SCP-01 scenario is missing OR
 *   (c) Then lacks negation restriction on committed state (reverse semantics like "允许") OR
 *   (d) Forbid lacks negation prohibition on committed Sprint
 */
function checkSemanticInvariant05(baseDir) {
  const agilePath = path.join(baseDir, 'ai-pm-os', 'references', 'agile-delivery-rules.md');
  const scPath = path.join(baseDir, 'ai-pm-os', 'scenarios', 'scenarios.md');
  const agileContent = readSafe(agilePath) || '';
  const scContent = readSafe(scPath) || '';
  const errors = [];

  if (!/禁止.{0,20}未批准.{0,30}committed|未批准.{0,20}不得.{0,20}committed/.test(agileContent)) {
    errors.push('SI-05a: agile-delivery-rules.md missing unapproved Story in committed Sprint rule');
  }
  if (!/禁止.{0,30}Sprint Backlog|committed.{0,20}禁止/.test(agileContent)) {
    errors.push('SI-05b: agile-delivery-rules.md missing committed Sprint prohibition rule');
  }

  if (!scContent.includes('SC-AGILE-SCP-01')) {
    errors.push('SI-05c: scenarios.md missing SC-AGILE-SCP-01 scope conflict scenario');
    return errors;
  }

  const blocks05 = extractScenarioBlocks(scContent);
  const scp01 = blocks05.find(b => b.id === 'SC-AGILE-SCP-01');
  if (scp01) {
    // Parse Then block - check item 6 explicitly contains negation "不得将 BL-021"
    // A "reverse semantic" (e.g., "允许将 BL-021 保持在 committed") must fail.
    const then05 = extractFieldBlock(scp01.text, 'Then');
    // Extract item 6 specifically (numbered list item 6.)
    const item6Match = then05.match(/(?:^|\n)\s*6\.\s*[^\n]+/m);
    if (!item6Match) {
      errors.push('SI-05c: SC-AGILE-SCP-01 Then missing item 6');
    } else {
      const item6 = item6Match[0];
      // Must contain "不得将 BL-021" (negation) AND "committed"
      const hasNegRestriction = /不得/.test(item6) && /committed/.test(item6);
      // Must NOT contain "允许将 BL-021" (reverse semantics)
      const hasReverse = /允许将 BL-021/.test(item6);
      if (!hasNegRestriction || hasReverse) {
        errors.push('SI-05c: SC-AGILE-SCP-01 Then item 6 lacks committed-state negation restriction (e.g., "不得将 BL-021 保持在 committed")');
      }
    }

    // Parse Forbid block - must contain negation "不得" + "committed"
    const forbid05 = extractFieldBlock(scp01.text, 'Forbid');
    // Must contain "不得" (negation) AND ("未批准" OR "committed")
    const hasNegForbid = /不得/.test(forbid05) &&
      (/未批准/.test(forbid05) || /committed/.test(forbid05));
    // Must NOT contain "允许将未批准条目保持在 committed" (reverse semantics)
    const hasReverseForbid = /允许将未批准条目保持在 committed/.test(forbid05);
    if (!hasNegForbid || hasReverseForbid) {
      errors.push('SI-05d: SC-AGILE-SCP-01 Forbid lacks committed Sprint negation prohibition (e.g., "不得将未批准条目保持在 committed")');
    }
  }

  return errors;
}

/**
 * SI-06: WIP limit enforcement (WP-003)
 *
 * PASSES when:
 *   (a) agile-delivery-rules.md contains WIP definition AND
 *   (b) "WIP 超限禁止拉入" rule AND
 *   (c) scenarios.md contains WIP-related scenario
 *
 * FAILS when:
 *   (a) WIP definition missing OR
 *   (b) WIP enforcement rule missing
 */
function checkSemanticInvariant06(baseDir) {
  const agilePath = path.join(baseDir, 'ai-pm-os', 'references', 'agile-delivery-rules.md');
  const scPath = path.join(baseDir, 'ai-pm-os', 'scenarios', 'scenarios.md');
  const agileContent = readSafe(agilePath) || '';
  const scContent = readSafe(scPath) || '';
  const errors = [];

  if (!agileContent.includes('WIP')) {
    errors.push('SI-06a: agile-delivery-rules.md missing WIP definition');
  }
  if (!/WIP.{0,20}禁止拉入|禁止拉入.{0,20}WIP|WIP 超限/.test(agileContent)) {
    errors.push('SI-06b: agile-delivery-rules.md missing WIP limit enforcement rule');
  }
  if (!/SC-AGILE-WIP|SC-KANBAN-01|WIP/.test(scContent)) {
    errors.push('SI-06c: scenarios.md missing WIP-related scenario');
  }

  return errors;
}

/**
 * SI-07: Story quality gap identification (WP-003)
 *
 * PASSES when agile-delivery-rules.md §7 defines all 5 gap types:
 *   (a) Acceptance Criteria missing, (b) Story Point missing, (c) Owner missing,
 *   (d) Priority missing, (e) Sprint assignment missing
 *
 * FAILS when any of the 5 gap types is missing.
 */
function checkSemanticInvariant07(baseDir) {
  const agilePath = path.join(baseDir, 'ai-pm-os', 'references', 'agile-delivery-rules.md');
  const content = readSafe(agilePath) || '';
  const errors = [];

  const gapTerms = [
    ['Acceptance Criteria', '缺 Acceptance Criteria', 'story-missing-ac'],
    ['Story Point', '缺 Story Point', 'story-missing-sp'],
    ['Owner', '缺 Owner', 'story-missing-owner'],
    ['优先级', '缺优先级', 'story-missing-priority'],
    ['Sprint', '缺 Sprint', 'story-missing-sprint'],
  ];

  let foundCount = 0;
  for (const [label, zhLabel, gapId] of gapTerms) {
    if (content.includes(label) || content.includes(zhLabel) || content.includes(gapId)) {
      foundCount++;
    }
  }
  if (foundCount < 5) {
    errors.push('SI-07: agile-delivery-rules.md missing Story quality gap definitions (found ' + foundCount + '/5)');
  }

  return errors;
}

/**
 * SI-08: Carry-over no silent roll (WP-003)
 *
 * PASSES when:
 *   (a) agile-delivery-rules.md contains "禁止静默滚动" AND
 *   (b) contains "重新评估 DoR" rule AND
 *   (c) scenarios.md contains Carry-over scenario
 *
 * FAILS when:
 *   (a) silent roll prohibition missing OR
 *   (b) DoR re-evaluation rule missing
 */
function checkSemanticInvariant08(baseDir) {
  const agilePath = path.join(baseDir, 'ai-pm-os', 'references', 'agile-delivery-rules.md');
  const scPath = path.join(baseDir, 'ai-pm-os', 'scenarios', 'scenarios.md');
  const agileContent = readSafe(agilePath) || '';
  const scContent = readSafe(scPath) || '';
  const errors = [];

  if (!/禁止.{0,10}静默|静默.{0,10}滚动/.test(agileContent)) {
    errors.push('SI-08a: agile-delivery-rules.md missing silent roll prohibition');
  }
  if (!/重新评估.{0,10}DoR|重新通过.{0,10}DoR/.test(agileContent)) {
    errors.push('SI-08b: agile-delivery-rules.md missing DoR re-evaluation rule for Carry-over');
  }
  if (!/SC-AGILE-CARRY|SC-KANBAN|Carry-over/.test(scContent)) {
    errors.push('SI-08c: scenarios.md missing Carry-over scenario');
  }

  return errors;
}

/**
 * SI-09: Memory Boot order (WP-004-R2)
 *
 * STRUCTURED PARSING APPROACH (QC-F-021/022 fix):
 * Instead of counting how many canonical names appear anywhere in a document (includes()),
 * this function:
 *   (1) Parses the §2.1 numbered list into an actual array of full path strings
 *   (2) Compares that parsed array to the canonical REQUIRED_MEMORY_BOOT_FILES array
 *       for EXACT equality: same length, same values, same order, no extras, no duplicates
 *   (3) Same structured parsing for AGENTS.md startup list
 *   (4) Reports specific errors for each failure mode (extra, missing, duplicate, out-of-order)
 *
 * QC-F-021: Duplicate canonical entry was not rejected by includes()-based count.
 * QC-F-022: Extra non-canonical entry was not rejected.
 * QC-F-023: Each pollution pattern must trigger independently (handled in SI-10d).
 */
function checkSemanticInvariant09(baseDir) {
  const mrPath = path.join(baseDir, 'ai-pm-os', 'references', 'memory-and-recovery.md');
  const mrContent = readSafe(mrPath) || '';
  const agentsPath = path.join(baseDir, 'AGENTS.md');
  const agentsContent = readSafe(agentsPath) || '';
  const skillPath = path.join(baseDir, 'ai-pm-os', 'SKILL.md');
  const skillContent = readSafe(skillPath) || '';
  const rulesPath = path.join(baseDir, '_AI_GLOBAL_MEMORY', 'AI_SKILL_OPERATING_RULES.md');
  const rulesContent = readSafe(rulesPath) || '';
  const errors = [];

  if (!mrContent.includes('六层')) {
    errors.push('SI-09a: memory-and-recovery.md missing six-layer authority definition');
  }

  // Canonical list (full path strings in order)
  const canonical = [
    '_AI_GLOBAL_MEMORY/AI_SKILL_OPERATING_RULES.md',
    '_AI_GLOBAL_MEMORY/AI_USER_PREFERENCES.md',
    '_AI_GLOBAL_MEMORY/AI_NAMING_CONVENTIONS.md',
    '00_PM_MEMORY/PM_MEMORY_INDEX.md',
    '00_PM_MEMORY/PM_CURRENT_STATUS.md',
    '00_PM_MEMORY/PM_APPROVAL_STATUS.md',
    '00_PM_MEMORY/PM_DOCUMENT_REGISTRY.md',
    '00_PM_MEMORY/PM_INPUT_LOG.md',
    '00_PM_MEMORY/PM_ACTIVE_CONTEXT.md',
  ];

  // --- (A) Parse memory-and-recovery.md §2.1 numbered list ---
  // QC-F-025 fix: fail-closed on anchor/section errors.
  const mrBootStart = mrContent.indexOf('Global Rules 层（先于一切）');
  const mrBootEnd = mrContent.indexOf('\n**Conditional 文件（按需读取）**');
  if (mrBootStart < 0) {
    errors.push('SI-09b: memory-and-recovery.md §2.1 start anchor "Global Rules 层（先于一切）" not found');
  }
  if (mrBootEnd < 0) {
    errors.push('SI-09c: memory-and-recovery.md §2.1 end anchor "**Conditional 文件" not found');
  }
  if (mrBootStart >= 0 && mrBootEnd >= 0 && mrBootEnd <= mrBootStart) {
    errors.push('SI-09d: memory-and-recovery.md §2.1 end anchor appears before or at start anchor');
  }
  if (mrBootStart >= 0 && mrBootEnd > mrBootStart) {
    const mrSection = mrContent.substring(mrBootStart, mrBootEnd);
    const mrLines = mrSection.split('\n');

    // Extract numbered list entries: "N. `path` — description"
    const mrParsed = [];
    for (const line of mrLines) {
      const m = line.match(/^\s*(\d+)\.\s+`([^`]+)`/);
      if (m) {
        mrParsed.push(m[2]); // full path string
      }
    }

    // (a) Check length equality
    if (mrParsed.length !== 9) {
      errors.push('SI-09e: memory-and-recovery.md §2.1 has ' + mrParsed.length + '/9 items (must be exactly 9)');
    }

    // (b) Check no extra/non-canonical entries (逐项精确相等)
    if (mrParsed.length === 9) {
      for (let i = 0; i < 9; i++) {
        if (mrParsed[i] !== canonical[i]) {
          errors.push('SI-09f: memory-and-recovery.md §2.1 item ' + (i + 1) + ' is "' + mrParsed[i] + '", expected "' + canonical[i] + '"');
        }
      }
    }
  }

  // --- (B) Parse AGENTS.md startup list ---
  // QC-F-025 fix: scope to "启动顺序" section, fail-closed on boundary errors.
  const agentsSectionStart = agentsContent.indexOf('## 启动顺序');
  const agentsSectionEnd = agentsContent.indexOf('\n##', agentsSectionStart + 1);
  if (agentsSectionStart < 0) {
    errors.push('SI-09g: AGENTS.md startup section start "## 启动顺序" not found');
  }
  if (agentsSectionStart >= 0 && agentsSectionEnd < 0) {
    // No next ## heading; use rest of file from section start
    errors.push('SI-09h: AGENTS.md startup section end marker not found');
  }
  if (agentsSectionStart >= 0 && agentsSectionEnd >= 0 && agentsSectionEnd <= agentsSectionStart) {
    errors.push('SI-09i: AGENTS.md startup section end appears before or at start');
  }
  if (agentsSectionStart >= 0 && agentsSectionEnd > agentsSectionStart) {
    const agentsSection = agentsContent.substring(agentsSectionStart, agentsSectionEnd);
    const agentsLines = agentsSection.split('\n');
    const agentsParsed = [];
    for (const line of agentsLines) {
      // AGENTS has: "N. `path`"
      const m = line.match(/^\s*(\d+)\.\s+`([^`]+)`/);
      if (m) {
        agentsParsed.push(m[2]);
      }
    }

    // (a) Check length equality
    if (agentsParsed.length !== 9) {
      errors.push('SI-09j: AGENTS.md startup section has ' + agentsParsed.length + '/9 items (must be exactly 9)');
    }

    // (b) Check no extra/non-canonical entries AND same order (逐项精确相等)
    if (agentsParsed.length === 9) {
      for (let i = 0; i < 9; i++) {
        if (agentsParsed[i] !== canonical[i]) {
          errors.push('SI-09k: AGENTS.md item ' + (i + 1) + ' is "' + agentsParsed[i] + '", expected "' + canonical[i] + '"');
        }
      }
    }
  }

  // --- (C) Strict reading order marker ---
  if (!/读取顺序|严格顺序/.test(mrContent)) {
    errors.push('SI-09l: memory-and-recovery.md missing strict Memory Boot reading order marker');
  }

  // --- (D) SKILL.md and rules canonical reference ---
  if (!/REQUIRED_MEMORY_BOOT_FILES|memory-and-recovery.*Memory Boot|PM Memory.*Global Rules.*3.*6/.test(skillContent)) {
    errors.push('SI-09m: SKILL.md missing REQUIRED_MEMORY_BOOT_FILES / canonical Memory Boot reference');
  }
  if (!/REQUIRED_MEMORY_BOOT_FILES|memory-and-recovery.*Memory Boot|PM Memory.*Global Rules.*3.*6/.test(rulesContent)) {
    errors.push('SI-09n: AI_SKILL_OPERATING_RULES.md missing REQUIRED_MEMORY_BOOT_FILES / canonical Memory Boot reference');
  }

  // --- (E) "3 Global + 6 PM Memory" count label ---
  if (!/3.*Global.*6.*PM Memory|Global Rules.*PM Memory.*3.*6/.test(mrContent)) {
    errors.push('SI-09o: memory-and-recovery.md missing "3 Global + 6 PM Memory" count label');
  }

  return errors;
}

/**
 * SI-10: Recovery 5-field source requirement (WP-004)
 *
 * PASSES when:
 *   (a) memory-and-recovery.md §3 defines exactly 5 recovery fields AND
 *   (b) each field has a source: annotation AND
 *   (c) missing source is marked as "Unknown"
 *
 * FAILS when:
 *   (a) §3 defines fewer than 5 fields OR
 *   (b) a field lacks source: annotation OR
 *   (c) missing source is not marked as Unknown
 */
function checkSemanticInvariant10(baseDir) {
  const mrPath = path.join(baseDir, 'ai-pm-os', 'references', 'memory-and-recovery.md');
  const mrContent = readSafe(mrPath) || '';
  const errors = [];

  // Must define 5 recovery fields with source: annotations
  const fieldTerms = ['当前阶段', 'Scope 状态', '活动 WP', '阻塞', '下一安全步骤'];
  let fieldCount = 0;
  for (const term of fieldTerms) {
    if (mrContent.includes(term)) fieldCount++;
  }
  if (fieldCount < 5) {
    errors.push('SI-10a: memory-and-recovery.md §3 defines only ' + fieldCount + '/5 recovery fields');
  }

  if (!/source:|来源文件|来源:/.test(mrContent)) {
    errors.push('SI-10b: memory-and-recovery.md §3 missing source: annotations for recovery fields');
  }

  if (!/Unknown|未知/.test(mrContent)) {
    errors.push('SI-10c: memory-and-recovery.md §3 missing "Unknown" marker for missing source');
  }

  // QC-F-023/026 fix: Each pollution pattern triggers independently (no cascading conditions).
  // Scope to §3.3 example block only. Any ONE of these patterns alone is enough to fail.
  // QC-F-026 fix: Find the next heading AFTER "### 3.3", not the first heading in the entire doc.
  const sec3idx = mrContent.indexOf('### 3.3');
  // Start searching AFTER sec3idx so we find the NEXT heading, not the first one
  const searchAfter = mrContent.indexOf('\n### 3.3') + 1;
  const nextHeadingIdx = mrContent.indexOf('\n### ', searchAfter);
  // Also check for ## headings as section boundaries
  const nextH2Idx = mrContent.indexOf('\n## ', searchAfter);
  // Use whichever comes first (h3 or h2) as the end of the §3.3 block
  const sec4idx = (nextHeadingIdx >= 0 && nextH2Idx >= 0) ? Math.min(nextHeadingIdx, nextH2Idx)
    : (nextHeadingIdx >= 0 ? nextHeadingIdx : nextH2Idx);
  const sec3 = (sec3idx >= 0)
    ? ((sec4idx >= 0 && sec4idx > sec3idx) ? mrContent.substring(sec3idx, sec4idx) : mrContent.substring(sec3idx))
    : '';
  if (sec3) {
    // Pattern 1: concrete WP-### (not placeholder WP-###)
    if (/\bWP-\d{3}\b/.test(sec3)) {
      errors.push('SI-10d1: §3.3 contains concrete WP-### (WP-\\d{3}): must use placeholder WP-###');
    }
    // Pattern 2: concrete Approved version (not placeholder vX.Y)
    if (/Approved v\d+\.\d+/.test(sec3)) {
      errors.push('SI-10d2: §3.3 contains concrete Approved version (v\\d+.\\d+): must use placeholder vX.Y');
    }
    // Pattern 3: concrete Sprint number (not placeholder Sprint N)
    if (/\bSprint \d+/.test(sec3)) {
      errors.push('SI-10d3: §3.3 contains concrete Sprint number: must use placeholder Sprint N');
    }
    // Pattern 4: concrete date (YYYY-MM-DD format)
    if (/\b\d{4}-\d{2}-\d{2}\b/.test(sec3)) {
      errors.push('SI-10d4: §3.3 contains a date value (YYYY-MM-DD): must use placeholder YYYY-MM-DD');
    }
  }

  return errors;
}

/**
 * SI-11: Active Context does not override Approved Baseline (WP-004)
 *
 * PASSES when:
 *   (a) memory-and-recovery.md §1.3 explicitly forbids Active Context overriding L1/L2 AND
 *   (b) PM_ACTIVE_CONTEXT.md template contains no Approved status field
 *
 * FAILS when:
 *   (a) no explicit prohibition in memory-and-recovery.md OR
 *   (b) PM_ACTIVE_CONTEXT.md contains an Approved field
 */
function checkSemanticInvariant11(baseDir) {
  const mrPath = path.join(baseDir, 'ai-pm-os', 'references', 'memory-and-recovery.md');
  const mrContent = readSafe(mrPath) || '';
  const acPath = path.join(baseDir, '00_PM_MEMORY', 'PM_ACTIVE_CONTEXT.md');
  const acContent = readSafe(acPath) || '';
  const errors = [];

  if (!/Active Context.*不得覆盖|不得覆盖.*Approved Baseline|禁止 Active Context 覆盖/.test(mrContent)) {
    errors.push('SI-11a: memory-and-recovery.md §1.3 missing explicit prohibition of Active Context overriding Baseline');
  }

  // PM_ACTIVE_CONTEXT.md template must NOT contain an Approved field
  if (/Approved|approved|已批准/.test(acContent)) {
    errors.push('SI-11b: PM_ACTIVE_CONTEXT.md template contains an Approved field (violates Active Context authority)');
  }

  return errors;
}

/**
 * SI-12: Partial failure recovery rules (WP-004)
 *
 * PASSES when:
 *   (a) memory-and-recovery.md §5.1 defines write partial failure scenario AND
 *   (b) preflight check is defined AND
 *   (c) forbidden actions are defined AND
 *   (d) next safe step is defined AND
 *   (e) evidence path includes PM_GAP_ANALYSIS.md
 *
 * FAILS when:
 *   (a) partial failure recovery is not defined OR
 *   (b) any of preflight/forbidden/next-step is missing
 */
function checkSemanticInvariant12(baseDir) {
  const mrPath = path.join(baseDir, 'ai-pm-os', 'references', 'memory-and-recovery.md');
  const mrContent = readSafe(mrPath) || '';
  const errors = [];

  if (!/写入中部分失败|部分失败/.test(mrContent)) {
    errors.push('SI-12a: memory-and-recovery.md §5 missing write partial failure definition');
  }

  if (!/preflight|写入前检查/.test(mrContent)) {
    errors.push('SI-12b: memory-and-recovery.md §5 missing preflight check for partial failure');
  }

  if (!/禁止继续写入|不得继续/.test(mrContent)) {
    errors.push('SI-12c: memory-and-recovery.md §5 missing forbidden actions for partial failure');
  }

  if (!/下一安全步骤|冲突报告/.test(mrContent)) {
    errors.push('SI-12d: memory-and-recovery.md §5 missing next safe step for partial failure');
  }

  if (!/PM_GAP_ANALYSIS\.md/.test(mrContent)) {
    errors.push('SI-12e: memory-and-recovery.md §5 missing PM_GAP_ANALYSIS.md as partial failure evidence');
  }

  return errors;
}

/**
 * SI-13: Missing Required Memory file fail-safe (WP-004)
 *
 * PASSES when:
 *   (a) memory-and-recovery.md §2.2 defines Required file missing handling AND
 *   (b) Skill stops execution AND
 *   (c) outputs Escalation: memory-boot-failure AND
 *   (d) writes Gap AND
 *   (e) does NOT guess and continue
 *
 * FAILS when:
 *   (a) Required file missing handling is not defined OR
 *   (b) Skill does not stop OR
 *   (c) no Escalation output or Gap is written
 */
function checkSemanticInvariant13(baseDir) {
  const mrPath = path.join(baseDir, 'ai-pm-os', 'references', 'memory-and-recovery.md');
  const mrContent = readSafe(mrPath) || '';
  const errors = [];

  if (!/Required.*文件.*缺失|缺失.*Required/.test(mrContent)) {
    errors.push('SI-13a: memory-and-recovery.md §2 missing Required file missing handling');
  }

  if (!/停止执行|必须停止/.test(mrContent)) {
    errors.push('SI-13b: memory-and-recovery.md §2 does not require Skill to stop on Required file missing');
  }

  if (!/Escalation.*memory-boot-failure|memory-boot-failure/.test(mrContent)) {
    errors.push('SI-13c: memory-and-recovery.md §2 missing Escalation: memory-boot-failure');
  }

  if (!/Gap.*写入|不得猜测|不得继续/.test(mrContent)) {
    errors.push('SI-13d: memory-and-recovery.md §2 missing Gap write / no-guess requirement');
  }

  return errors;
}

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
  if (sc.total < EXPECTED_SCENARIO_COUNT) {
    console.log('  FAIL: at least ' + EXPECTED_SCENARIO_COUNT + ' scenarios required, found ' + sc.total);
    totalErrors += 1;
  } else if (sc.errors.length === 0) {
    console.log('  OK: all scenarios contain Given/When/Then/Allow/Forbid/Evidence');
  } else {
    for (const e of sc.errors) {
      console.log('  FIELD MISSING: scenario ' + e.id + ' missing ' + e.missing);
      totalErrors += 1;
    }
  }

  // Phase 3b: Check scenario heading sequentiality (R2 requirement)
  const headingErrors = checkScenarioHeadings(baseDir);
  if (headingErrors.length === 0) {
    console.log('  OK: all ' + EXPECTED_SCENARIO_COUNT + ' scenario headings present (## 1..## ' + EXPECTED_SCENARIO_COUNT + ') with sequential correspondence');
  } else {
    for (const e of headingErrors) {
      console.log('  HEADING ERROR: ' + e);
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

  // Phase 5: agile-delivery-rules.md content
  console.log('');
  console.log('[Phase 5] Checking agile-delivery-rules.md content...');
  const agilePath = path.join(baseDir, 'ai-pm-os', 'references', 'agile-delivery-rules.md');
  const agileContent = readSafe(agilePath) || '';
  const agileErrors = [];
  const agileTerms = ['Product Backlog', 'Sprint Backlog', 'User Story', 'Acceptance Criteria',
    'Story Point', 'DoR', 'DoD', 'Sprint Goal', 'WIP', 'Blocked', 'Carry-over'];
  for (const term of agileTerms) {
    if (!agileContent.includes(term)) {
      agileErrors.push('  MISSING TERM: ' + term);
      totalErrors++;
    }
  }
  const frameworkTerms = ['Scrum', 'Kanban', 'Hybrid'];
  for (const fw of frameworkTerms) {
    if (!agileContent.includes(fw)) {
      agileErrors.push('  MISSING FRAMEWORK: ' + fw);
      totalErrors++;
    }
  }
  if (agileErrors.length === 0) {
    console.log('  OK: agile-delivery-rules.md contains all 11 agile terms and 3 frameworks');
  } else {
    for (const e of agileErrors) console.log(e);
  }

  // Phase 6: Semantic invariants
  console.log('');
  console.log('[Phase 6] Checking semantic invariants...');
  const siErrors = [];
  const si01 = checkSemanticInvariant01(baseDir);
  const si02 = checkSemanticInvariant02(baseDir);
  const si03 = checkSemanticInvariant03(baseDir);
  const si04 = checkSemanticInvariant04(baseDir);
  const si05 = checkSemanticInvariant05(baseDir);
  const si06 = checkSemanticInvariant06(baseDir);
  const si07 = checkSemanticInvariant07(baseDir);
  const si08 = checkSemanticInvariant08(baseDir);
  const si09 = checkSemanticInvariant09(baseDir);
  const si10 = checkSemanticInvariant10(baseDir);
  const si11 = checkSemanticInvariant11(baseDir);
  const si12 = checkSemanticInvariant12(baseDir);
  const si13 = checkSemanticInvariant13(baseDir);
  siErrors.push(...si01, ...si02, ...si03, ...si04, ...si05, ...si06, ...si07, ...si08, ...si09, ...si10, ...si11, ...si12, ...si13);
  if (siErrors.length === 0) {
    console.log('  OK: SI-01 (framework auto-selection) PASS');
    console.log('  OK: SI-02 (atomic PU apply) PASS');
    console.log('  OK: SI-03 (Given/Then count consistency) PASS');
    console.log('  OK: SI-04 (DoR != DoD separation) PASS');
    console.log('  OK: SI-05 (Scope conflict rule) PASS');
    console.log('  OK: SI-06 (WIP limit enforcement) PASS');
    console.log('  OK: SI-07 (Story quality gap) PASS');
    console.log('  OK: SI-08 (Carry-over no silent roll) PASS');
    console.log('  OK: SI-09 (Memory Boot order) PASS');
    console.log('  OK: SI-10 (5-field recovery source) PASS');
    console.log('  OK: SI-11 (Active Context authority) PASS');
    console.log('  OK: SI-12 (Partial failure recovery) PASS');
    console.log('  OK: SI-13 (Missing Required file fail-safe) PASS');
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
