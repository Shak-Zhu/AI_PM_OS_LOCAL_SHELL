/**
 * AI PM OS Local Shell - Governance Verification Script
 *
 * Verifies P0 governance evidence for REQ-004, REQ-005, REQ-006,
 * REQ-007, REQ-008, and REQ-028.
 *
 * Exit codes:
 *   0 = All governance checks passed
 *   1 = One or more governance checks failed
 */

'use strict';

const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');

let totalErrors = 0;

// =============================================================================
// HELPERS
// =============================================================================

function checkFileExists(filePath) {
  return fs.existsSync(path.join(baseDir, filePath));
}

function readFile(filePath) {
  const full = path.join(baseDir, filePath);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
}

function checkFile(filePath, description) {
  const full = path.join(baseDir, filePath);
  if (fs.existsSync(full)) {
    console.log('  OK: ' + filePath + ' (' + description + ')');
    return true;
  } else {
    console.log('  FAIL: ' + filePath + ' NOT FOUND (' + description + ')');
    return false;
  }
}

// =============================================================================
// REQ-004 — Markdown Authority Source
//
// All three must be true simultaneously:
// 1. Markdown identified as authority source
// 2. JSON identified as sync/visualization layer
// 3. JSON forbidden to reverse-overwrite Markdown
// =============================================================================

function checkREQ004() {
  console.log('\n[REQ-004] Markdown 权威项目文件');

  const jsonSyncContent = readFile('ai-pm-os/references/json-sync-and-audit-rules.md');
  const memContent = readFile('ai-pm-os/references/memory-and-recovery.md');
  const conflictContent = readFile('ai-pm-os/references/conflict-and-chaos-rules.md');

  let errors = 0;

  // 1. Markdown is authority source
  const hasMarkdownAuthority =
    /Markdown.*authority.*source|authority.*source.*Markdown|Markdown.*source.*authoritative/i.test(jsonSyncContent) ||
    /Markdown.*是.*权威|Markdown.*权威源/i.test(jsonSyncContent);
  if (hasMarkdownAuthority) {
    console.log('  OK: Markdown identified as authority source');
  } else {
    console.log('  FAIL: Markdown NOT identified as authority source');
    errors++;
  }

  // 2. JSON is sync/visualization layer
  const hasJsonSync =
    /JSON.*sync|sync.*JSON|JSON.*visualization|visualization.*JSON/i.test(jsonSyncContent) ||
    /JSON.*可视化/i.test(jsonSyncContent);
  if (hasJsonSync) {
    console.log('  OK: JSON identified as sync/visualization layer');
  } else {
    console.log('  FAIL: JSON NOT identified as sync/visualization layer');
    errors++;
  }

  // 3. JSON forbidden to reverse-overwrite Markdown
  const hasJsonForbidden =
    /JSON.*shall not.*reverse.*overwrite|JSON.*forbidden.*reverse/i.test(jsonSyncContent) ||
    /JSON.*禁止.*覆盖|JSON.*不得.*覆盖/i.test(jsonSyncContent) ||
    /不得.*JSON.*覆盖|不得.*JSON反向/i.test(jsonSyncContent);
  if (hasJsonForbidden) {
    console.log('  OK: JSON reverse-overwrite explicitly forbidden');
  } else {
    console.log('  FAIL: JSON reverse-overwrite NOT forbidden');
    errors++;
  }

  if (errors > 0) {
    console.log('  FAIL: REQ-004 (' + errors + ' sub-check(s) failed — all three must pass');
    totalErrors += errors;
    return false;
  }

  console.log('  PASS: REQ-004 — Markdown authority, JSON sync direction, and forbidden reverse-overwrite all verified');
  return true;
}

// =============================================================================
// REQ-005 — Pending Updates Mechanism
//
// All four states AND the enforcement rule must be present:
// Proposed, Approved, Rejected, Applied + "未经批准不得直接应用" rule
// =============================================================================

function checkREQ005() {
  console.log('\n[REQ-005] Pending Updates 审批机制');

  const content = readFile('00_PM_MEMORY/PM_PENDING_UPDATES.md');
  let errors = 0;

  const states = [
    { pattern: /Proposed|待审批|待批准/i, name: 'Proposed/待审批' },
    { pattern: /Approved|已批准|批准/i, name: 'Approved/批准' },
    { pattern: /Rejected|拒绝/i, name: 'Rejected/拒绝' },
    { pattern: /Applied|已应用|已执行/i, name: 'Applied/已应用' }
  ];

  for (const s of states) {
    if (s.pattern.test(content)) {
      console.log('  OK: state found: ' + s.name);
    } else {
      console.log('  FAIL: state missing: ' + s.name);
      errors++;
    }
  }

  // Enforcement rule
  const hasRule = /未经.*批准.*不得.*应用|未批准.*不得.*直接.*应用|未.*批准.*不得.*正式.*文件/i.test(content);
  if (hasRule) {
    console.log('  OK: approval enforcement rule present');
  } else {
    console.log('  FAIL: approval enforcement rule missing');
    errors++;
  }

  if (errors > 0) {
    console.log('  FAIL: REQ-005 (' + errors + ' sub-check(s) failed — all four states + rule required');
    totalErrors += errors;
    return false;
  }

  console.log('  PASS: REQ-005 — all four states and enforcement rule verified');
  return true;
}

// =============================================================================
// REQ-006 — Role Configuration and Splittable Approvals (R2)
// References: CHG-012 §3.3.4, PM_COPILOT_OPERATING_MODEL_DESIGN.md §3
//
// Role model (R2):
// - PM_ROLE_CONFIG.md defines 10 candidate natural project roles
// - project_roles.json is the runtime JSON; clean shell = roles: []
// - After initialization: each role must be a known candidate OR an explicit project custom role
// - No fixed quantity, no requirement for all roles, no default owner field, no old AI-role set
// =============================================================================

function checkREQ006() {
  console.log('\n[REQ-006] 角色配置与可拆分审批');

  const roleConfigContent = readFile('00_PM_MEMORY/PM_ROLE_CONFIG.md');
  const rolesJsonContent = readFile('07_DATA/project_roles.json');
  let errors = 0;

  // ---- Part A: PM_ROLE_CONFIG.md must define 10 candidate natural roles ----
  const candidateRoles = [
    'Project Owner',
    'Project Manager',
    'Sponsor',
    'Product Owner',
    'Delivery Owner',
    'Business Owner',
    'Technical Owner',
    'Scrum Master',
    'UAT Owner',
    'Approver'
  ];

  for (const role of candidateRoles) {
    if (roleConfigContent.includes(role)) {
      console.log('  OK: role found in Markdown: ' + role);
    } else {
      console.log('  FAIL: role missing in Markdown: ' + role);
      errors++;
    }
  }

  // ---- Part B: Splittable approval rule ----
  const hasSplittable = /可拆分|拆分.*审批|splittable.*approval|separate.*approval/i.test(roleConfigContent);
  if (hasSplittable) {
    console.log('  OK: splittable approval rule present');
  } else {
    console.log('  FAIL: splittable approval rule missing');
    errors++;
  }

  // ---- Part C: project_roles.json must be valid JSON ----
  let parsed = null;
  try {
    parsed = JSON.parse(rolesJsonContent);
    console.log('  OK: project_roles.json is valid JSON');
  } catch (e) {
    console.log('  FAIL: project_roles.json JSON parse error: ' + e.message);
    errors++;
    console.log('  FAIL: REQ-006 (' + errors + ' sub-check(s) failed)');
    totalErrors += errors;
    return false;
  }

  // ---- Part D: Clean shell — empty roles array is valid ----
  const roleEntries = Array.isArray(parsed.roles) ? parsed.roles : [];
  if (roleEntries.length === 0) {
    // Clean shell: empty roles array is the correct not_initialized state
    console.log('  OK: project_roles.json has empty roles array (clean shell — valid)');
    console.log('  PASS: REQ-006 — 10 candidate roles in Markdown, splittable rule present, clean shell valid');
    totalErrors += errors;
    return errors > 0 ? false : true;
  }

  // ---- Part E: Post-initialization — validate each role entry ----
  const seenRoleIds = new Set();
  let hasDuplicate = false;
  let hasInvalidField = false;
  let hasUnknownRole = false;

  for (let idx = 0; idx < roleEntries.length; idx++) {
    const entry = roleEntries[idx];
    if (!entry || typeof entry !== 'object') {
      console.log('  FAIL: project_roles.json[' + idx + '] is not a valid object');
      hasInvalidField = true;
      errors++;
      continue;
    }

    // role_id must be a non-empty string
    const roleId = (entry.role_id || '').trim();
    if (!roleId) {
      console.log('  FAIL: project_roles.json[' + idx + '] missing non-empty role_id');
      hasInvalidField = true;
      errors++;
    }

    // Check for duplicates
    if (roleId && seenRoleIds.has(roleId)) {
      console.log('  FAIL: project_roles.json has duplicate role_id: "' + roleId + '"');
      hasDuplicate = true;
      errors++;
    }
    if (roleId) seenRoleIds.add(roleId);

    // Each role must be either a known candidate OR an explicit custom project role
    // A known candidate role must be one of the 10 in PM_ROLE_CONFIG.md
    // A custom role must have a non-empty description
    const isKnownCandidate = candidateRoles.includes(roleId);
    const hasDescription = entry.description && entry.description.trim() !== '';
    if (!isKnownCandidate && !hasDescription) {
      console.log('  FAIL: project_roles.json[' + idx + '] role_id="' + roleId + '" is not a known candidate and has no description (custom role must have description)');
      hasUnknownRole = true;
      errors++;
    } else if (isKnownCandidate) {
      console.log('  OK: role entry is known candidate: ' + roleId);
    } else {
      console.log('  OK: role entry is custom role with description: ' + roleId);
    }

    // role_name should match role_id (or be a localized version)
    if (!entry.role_name || entry.role_name.trim() === '') {
      console.log('  FAIL: project_roles.json[' + idx + '] role_id="' + roleId + '" missing non-empty role_name');
      hasInvalidField = true;
      errors++;
    }

    // owner, status, default_or_optional are informational — not required to be present
    // But if present, owner should be a non-empty string
    if (entry.owner !== undefined && typeof entry.owner === 'string' && entry.owner.trim() === '') {
      console.log('  FAIL: project_roles.json[' + idx + '] role_id="' + roleId + '" has empty owner field');
      hasInvalidField = true;
      errors++;
    }
  }

  if (hasDuplicate) {
    console.log('  FAIL: duplicate role_id values found');
  }
  if (hasInvalidField) {
    console.log('  FAIL: invalid field values found in role entries');
  }

  if (errors > 0) {
    console.log('  FAIL: REQ-006 (' + errors + ' sub-check(s) failed)');
    totalErrors += errors;
    return false;
  }

  console.log('  PASS: REQ-006 — 10 candidate roles in Markdown, splittable rule, clean shell valid, initialized roles valid');
  return true;
}

// =============================================================================
// REQ-007 — Unified Naming and ID System
//
// ALL core ID prefixes must be present (not a threshold >= N):
// REQ-, R-, A-, I-, D-, ACT-, DEC-, CHG-, PU-, BL-, US-, MTG-
// =============================================================================

function checkREQ007() {
  console.log('\n[REQ-007] 统一命名与ID系统');

  const content = readFile('_AI_GLOBAL_MEMORY/AI_NAMING_CONVENTIONS.md');
  let errors = 0;

  // All 12 core ID prefixes must be present
  // Use simple includes() checks — reliable and predictable
  for (const prefix of ['REQ-', 'ACT-', 'DEC-', 'CHG-', 'PU-', 'BL-', 'US-', 'MTG-']) {
    if (content.includes(prefix)) {
      console.log('  OK: ID prefix found: ' + prefix);
    } else {
      console.log('  FAIL: ID prefix missing: ' + prefix + ' (all prefixes required)');
      errors++;
    }
  }

  // These are the tricky ones: R-, A-, I-, D-
  // Template uses backtick format: `R-` `A-` `I-` `D-`
  // We accept the backtick-enclosed form OR the plain form
  const trickyPrefixes = [
    { patterns: ['`R-`', 'R-'], name: 'R-' },
    { patterns: ['`A-`', 'A-'], name: 'A-' },
    { patterns: ['`I-`', 'I-'], name: 'I-' },
    { patterns: ['`D-`', 'D-'], name: 'D-' }
  ];
  for (const tp of trickyPrefixes) {
    const found = tp.patterns.some(p => content.includes(p));
    if (found) {
      console.log('  OK: ID prefix found: ' + tp.name + ' (backtick-enclosed or plain)');
    } else {
      console.log('  FAIL: ID prefix missing: ' + tp.name + ' (all prefixes required)');
      errors++;
    }
  }

  if (errors > 0) {
    console.log('  FAIL: REQ-007 — ' + errors + ' prefix(es) missing (all 12 required)');
    totalErrors += errors;
    return false;
  }

  console.log('  PASS: REQ-007 — all 12 core ID prefixes present');
  return true;
}

// =============================================================================
// REQ-008 — Input Material Registration and Archiving
//
// Both required simultaneously:
// 1. Input Log structure (Input ID table header)
// 2. Unreadable input handling rule
// =============================================================================

function checkREQ008() {
  console.log('\n[REQ-008] 输入材料登记与归档');

  const content = readFile('00_PM_MEMORY/PM_INPUT_LOG.md');
  let errors = 0;

  // 1. Input Log structure (17-column format: input_id, batch_id, ... OR Input ID, Batch ID, ...)
  // PM_INPUT_LOG.md uses underscore-separated headers (input_id) per WP-024-R1
  const hasInputID =
    /input_id|Input ID|输入 ID|InputID/i.test(content);
  if (hasInputID) {
    console.log('  OK: Input Log structure present (underscore or space separated header)');
  } else {
    console.log('  FAIL: Input Log structure missing (input_id table header)');
    errors++;
  }

  // 2. Unreadable input handling rule
  const hasUnreadableRule =
    /不可读|unreadable|Unreadable|Needs Readable Input|Unreadable by Current Agent|不得.*虚构|不得.*编造/i.test(content);
  if (hasUnreadableRule) {
    console.log('  OK: unreadable input handling rule present');
  } else {
    console.log('  FAIL: unreadable input handling rule missing');
    errors++;
  }

  if (errors > 0) {
    console.log('  FAIL: REQ-008 (' + errors + ' sub-check(s) failed — structure AND rule both required');
    totalErrors += errors;
    return false;
  }

  console.log('  PASS: REQ-008 — Input Log structure and unreadable handling rule both verified');
  return true;
}

// =============================================================================
// REQ-028 — Git Checkpoint and Traceable Commits
//
// 1. .git directory exists
// 2. Git repository has at least one valid commit
// 3. Dirty worktree rule exists in AGENTS.md or conflict-and-chaos-rules.md
// 4. verify-release.js and check-pollution.js exist
// =============================================================================

function checkREQ028() {
  console.log('\n[REQ-028] Git checkpoint 与可追溯提交');

  let errors = 0;

  // 1. .git directory exists
  const gitDir = path.join(baseDir, '.git');
  if (fs.existsSync(gitDir)) {
    console.log('  OK: .git directory exists');
  } else {
    console.log('  FAIL: .git directory not found');
    errors++;
    return false;
  }

  // 2. Git has at least one valid commit
  try {
    const headFile = path.join(gitDir, 'HEAD');
    if (!fs.existsSync(headFile)) {
      console.log('  FAIL: Git HEAD not found');
      errors++;
    } else {
      const headContent = fs.readFileSync(headFile, 'utf8').trim();
      if (headContent.startsWith('ref: ')) {
        const refPath = headContent.substring(5);
        const refFile = path.join(gitDir, refPath);
        if (fs.existsSync(refFile)) {
          const commitHash = fs.readFileSync(refFile, 'utf8').trim();
          if (commitHash && commitHash.length >= 7) {
            console.log('  OK: Git repository has valid commit (hash: ' + commitHash.substring(0, 7) + ')');
          } else {
            console.log('  FAIL: Git HEAD ref file is empty');
            errors++;
          }
        } else {
          console.log('  FAIL: Git HEAD points to non-existent ref: ' + refPath);
          errors++;
        }
      } else {
        // Detached HEAD with commit hash
        if (headContent.match(/^[0-9a-f]{7,40}$/i)) {
          console.log('  OK: Git repository in detached HEAD state with valid commit');
        } else {
          console.log('  FAIL: Git HEAD content unexpected: ' + headContent);
          errors++;
        }
      }
    }
  } catch (e) {
    console.log('  FAIL: Git validation error: ' + e.message);
    errors++;
  }

  // 3. Dirty worktree rule exists in governance docs
  const agentsContent = readFile('AGENTS.md');
  const conflictContent = readFile('ai-pm-os/references/conflict-and-chaos-rules.md');
  const dirtyWorktreeRule =
    /dirty.*worktree|worktree.*dirty|脏工作树|dirty_tree/i.test(agentsContent) ||
    /dirty.*worktree|worktree.*dirty|脏工作树|dirty_tree/i.test(conflictContent) ||
    /不得.*混入|不得.*未跟踪|混入.*未授权/i.test(agentsContent) ||
    /不得.*混入|混入.*无关/i.test(conflictContent);
  if (dirtyWorktreeRule) {
    console.log('  OK: dirty worktree governance rule present');
  } else {
    console.log('  FAIL: dirty worktree governance rule missing from AGENTS.md or conflict-and-chaos-rules.md');
    errors++;
  }

  // 4. Git checkpoint scripts exist
  const checkPollution = checkFile('scripts/check-pollution.js', 'pollution check script');
  const verifyRelease = checkFile('scripts/verify-release.js', 'release verification script');
  if (!checkPollution) errors++;
  if (!verifyRelease) errors++;

  if (errors > 0) {
    console.log('  FAIL: REQ-028 (' + errors + ' sub-check(s) failed');
    totalErrors += errors;
    return false;
  }

  console.log('  PASS: REQ-028 — Git initialized, valid commit exists, dirty worktree rule present, scripts exist');
  return true;
}

// =============================================================================
// Governance: No Automatic Git Operations
//
// Detect execSync / spawnSync / spawn / exec calls containing git add/commit/push.
// Patterns:
//   execSync("git push ...")       → execSync form
//   spawn('git', ['push', ...])     → spawn array form
//   spawn('git push ...')          → spawn string form
// =============================================================================

function checkNoAutoGitOps() {
  console.log('\n[Governance] No automatic git add/commit/push in scripts');

  const scripts = [
    'scripts/verify-governance.js',
    'scripts/check-pollution.js',
    'scripts/verify-release.js'
  ];

  for (const s of scripts) {
    const file = path.join(baseDir, s);
    if (!fs.existsSync(file)) continue;

    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const lineNum = i + 1;

      // Skip pure comment lines
      const trimmed = rawLine.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

      if (!/execSync|exec\s*\(|spawnSync|spawn\s*\(/.test(rawLine)) continue;

      // ---- Helper: extract the first string argument after a call ----
      // After the function name and opening paren, find first quoted string
      function extractFirstStringArg(line, callName) {
        const idx = line.indexOf(callName);
        if (idx < 0) return null;
        const openParen = line.indexOf('(', idx);
        if (openParen < 0) return null;
        // Find the first string literal after the paren
        const sq = line.indexOf("'", openParen);
        const dq = line.indexOf('"', openParen);
        const bq = line.indexOf('`', openParen);
        // Find the closest quote after openParen
        let firstQuotePos = sq;
        let quoteChar = "'";
        if (firstQuotePos < 0 || (dq >= 0 && dq < firstQuotePos)) { firstQuotePos = dq; quoteChar = '"'; }
        if (firstQuotePos < 0 || (bq >= 0 && bq < firstQuotePos)) { firstQuotePos = bq; quoteChar = '`'; }
        if (firstQuotePos < 0) return null;
        // Find the closing quote
        const closePos = line.indexOf(quoteChar, firstQuotePos + 1);
        if (closePos < 0) return null;
        return line.substring(firstQuotePos + 1, closePos);
      }

      // ---- execSync("git push ...") ----
      const execArg = extractFirstStringArg(rawLine, 'execSync(');
      if (execArg !== null) {
        const lower = execArg.toLowerCase();
        if (/\bgit\s+add\b/i.test(lower) || /\bgit\s+commit\b/i.test(lower) || /\bgit\s+push\b/i.test(lower)) {
          console.log('  FAIL: ' + s + ':' + lineNum + ' execSync contains git command: ' + execArg.substring(0, 40));
          totalErrors++;
          return false;
        }
      }

      // ---- spawn('git', ['add', ...]) or spawn('git', ['push', ...]) ----
      // Pattern: 'git' (or "git") followed somewhere by an array with add/commit/push
      const spawnIdx = rawLine.search(/spawn\s*\(|spawnSync\s*\(/);
      if (spawnIdx >= 0) {
        // Extract everything after spawn/spawnSync( for analysis
        const afterSpawn = rawLine.substring(spawnIdx);
        // Check for array form: 'git' or "git" then later [ with add/commit/push
        // Use a simple approach: find 'git' (or "git") and check if there's a bracket with the command nearby
        const gitMatch = afterSpawn.match(/['"]git['"]/);
        if (gitMatch) {
          const gitPos = afterSpawn.indexOf(gitMatch[0]) + gitMatch[0].length;
          const afterGit = afterSpawn.substring(gitPos, gitPos + 100); // look 100 chars ahead
          // Look for array with add/commit/push as a string element
          if (/\[.*?(?:['"]add['"][^'\]]*\]|['"]commit['"][^'\]]*\]|['"]push['"][^'\]]*\])/i.test(afterGit)) {
            console.log('  FAIL: ' + s + ':' + lineNum + ' spawn contains git command in array form');
            totalErrors++;
            return false;
          }
        }

        // ---- spawn('git push ...') string form ----
        const spawnArg = extractFirstStringArg(rawLine, 'spawn(');
        const spawnSyncArg = extractFirstStringArg(rawLine, 'spawnSync(');
        const spawnStr = spawnArg || spawnSyncArg;
        if (spawnStr !== null) {
          const lower = spawnStr.toLowerCase();
          if (/\bgit\s+add\b/i.test(lower) || /\bgit\s+commit\b/i.test(lower) || /\bgit\s+push\b/i.test(lower)) {
            console.log('  FAIL: ' + s + ':' + lineNum + ' spawn contains git command in string: ' + spawnStr.substring(0, 40));
            totalErrors++;
            return false;
          }
        }
      }
    }
  }

  console.log('  OK: no automatic git add/commit/push found in governance scripts');
  console.log('  PASS: no-auto-git-ops');
  return true;
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
  console.log('=== AI PM OS Local Shell - Governance Verification ===');
  console.log('Base directory: ' + baseDir);
  console.log('');

  checkREQ004();   // Markdown authority
  checkREQ005();   // Pending Updates
  checkREQ006();   // Role config
  checkREQ007();   // Naming conventions
  checkREQ008();   // Input log
  checkREQ028();   // Git checkpoint
  checkNoAutoGitOps();

  console.log('\n=== Summary ===');
  console.log('Total errors: ' + totalErrors);

  if (totalErrors === 0) {
    console.log('RESULT: PASS - All governance checks passed.');
    process.exit(0);
  } else {
    console.log('RESULT: FAIL - ' + totalErrors + ' governance check(s) failed.');
    process.exit(1);
  }
}

main();
