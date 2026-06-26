/**
 * AI PM OS Local Shell - Pollution Check Script
 *
 * Cross-platform Node.js script to verify the product shell is free of
 * development governance artifacts.
 *
 * Usage:
 *   node scripts/check-pollution.js
 *
 * Exit codes:
 *   0 = All checks passed (clean)
 *   1 = Pollution detected (failed)
 *   2 = Unexpected error
 */

'use strict';

const fs = require('fs');
const path = require('path');

// --- Configuration ---

/**
 * Strict pollution patterns for product shell MEMORY templates (00_PM_MEMORY/).
 * These files are generic copyable project-start templates and must not contain
 * concrete project facts (WP IDs, dates, review statuses).
 * Placeholders like WP-###, YYYY-MM-DD, INITIALIZE_PROJECT are allowed.
 */
const STRICT_PATTERNS = [
  // Concrete WP IDs (not placeholder WP-###)
  { pattern: /\bWP-0[0-9]{2}(?:-R[0-9]+)?\b/, label: 'Concrete WP/Rework ID [STRICT]' },
  // Concrete date stamps (not placeholder YYYY-MM-DD)
  { pattern: /\b2026-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])\b/, label: 'Concrete date stamp [STRICT]' },
  // Development governance review/execution status in product shell templates.
  // These specific statuses indicate a concrete project execution state (not template schema).
  // We match specific phase/decision words but EXCLUDE:
  //   - "Pending Review" (legitimate document schema status)
  //   - "PM Review" / "Human Owner" / "Human Accepted" (role names)
  //   - "Rejected" (only if standalone, not part of "unrejected")
  // Match: implemented/Human Accepted/QC Review/Rework/Closed/Issued/HumanRejected
  { pattern: /\b(?:implemented|Human\s+Accepted|QC\s+Review|Rework|Issued|Closed)\b/i, label: 'Governance status in product shell [STRICT]' },
];

/**
 * General pollution patterns for all OTHER product files (ai-pm-os/, 01_PM_DOCUMENTS/,
 * 02_AGILE/, 03_MEETINGS/, etc.). These are NOT shell templates — they are
 * governance product files that legitimately contain governance IDs as part of
 * their content (e.g., scenarios referencing WP-001, or references mentioning
 * APR-001). We only flag machine-specific and absolute-path pollution here.
 */
const GENERAL_PATTERNS = [
  // Project-specific date stamp
  { pattern: /2026-06-18/, label: 'Date: 2026-06-18' },
  // Approval IDs
  { pattern: /APR-001/, label: 'ID: APR-001' },
  { pattern: /APR-002/, label: 'ID: APR-002' },
  { pattern: /APR-003/, label: 'ID: APR-003' },
  { pattern: /APR-004/, label: 'ID: APR-004' },
  { pattern: /APR-005/, label: 'ID: APR-005' },
  { pattern: /APR-006/, label: 'ID: APR-006' },
  // Change IDs
  { pattern: /CHG-001/, label: 'ID: CHG-001' },
  { pattern: /CHG-002/, label: 'ID: CHG-002' },
  { pattern: /CHG-003/, label: 'ID: CHG-003' },
  // Gap IDs
  { pattern: /GAP-001/, label: 'ID: GAP-001' },
  { pattern: /GAP-002/, label: 'ID: GAP-002' },
  { pattern: /GAP-003/, label: 'ID: GAP-003' },
  { pattern: /GAP-004/, label: 'ID: GAP-004' },
  { pattern: /GAP-005/, label: 'ID: GAP-005' },
  { pattern: /GAP-006/, label: 'ID: GAP-006' },
  { pattern: /GAP-007/, label: 'ID: GAP-007' },
  { pattern: /GAP-008/, label: 'ID: GAP-008' },
  // Meeting IDs
  { pattern: /MTG-20260618/, label: 'ID: MTG-20260618' },
  // Todo IDs with specific date
  { pattern: /TODO-20260618/, label: 'ID: TODO-20260618' },
  { pattern: /TODO-2026[0-9]{4}/, label: 'ID: TODO-2026...' },
  // Pending Update IDs
  { pattern: /PU-001/, label: 'ID: PU-001' },
  { pattern: /PU-002/, label: 'ID: PU-002' },
  { pattern: /PU-003/, label: 'ID: PU-003' },
  { pattern: /PU-004/, label: 'ID: PU-004' },
  { pattern: /PU-005/, label: 'ID: PU-005' },
  // Input IDs
  { pattern: /IN-20260618/, label: 'ID: IN-20260618' },
  // Action IDs
  { pattern: /ACT-001/, label: 'ID: ACT-001' },
  // Risk IDs
  { pattern: /\bR-001\b/, label: 'ID: R-001' },
  { pattern: /\bR-002\b/, label: 'ID: R-002' },
  { pattern: /\bR-003\b/, label: 'ID: R-003' },
  { pattern: /\bR-004\b/, label: 'ID: R-004' },
  { pattern: /\bR-005\b/, label: 'ID: R-005' },
  // Assumption IDs
  { pattern: /A-001/, label: 'ID: A-001' },
  { pattern: /A-002/, label: 'ID: A-002' },
  // Issue IDs
  { pattern: /I-001/, label: 'ID: I-001' },
  // Dependency IDs
  { pattern: /D-001/, label: 'ID: D-001' },
  { pattern: /D-002/, label: 'ID: D-002' },
  // Estimation IDs
  { pattern: /EST-001/, label: 'ID: EST-001' },
  // Milestone IDs
  { pattern: /MS-001/, label: 'ID: MS-001' },
  { pattern: /MS-003/, label: 'ID: MS-003' },
  { pattern: /MS-006/, label: 'ID: MS-006' },
  // Backlog IDs
  { pattern: /BL-001/, label: 'ID: BL-001' },
  // Windows absolute paths (machine-specific)
  { pattern: /C:\\Users\\[^\\]+\\/, label: 'Windows absolute path: C:\\Users\\...' },
  // macOS absolute paths (machine-specific)
  { pattern: /\/Users\/[^\/]+\//, label: 'macOS absolute path: /Users/...' },
  // Control space reference (old path - for backward compatibility)
  { pattern: /AI_PM_OS_LOCAL_SHELL_PROJECT_CONTROL/, label: 'Control space reference (old path)' },
];

// Directories to skip entirely (no scanning inside these).
const SKIP_DIRS = [
  '.git',
  'node_modules',
  'dist',
  'scripts',
  '_DEV_PROJECT_CONTROL',
];

// File extensions to scan
const SCAN_EXTENSIONS = new Set([
  '.md', '.txt', '.json', '.js', '.ts', '.html', '.css',
  '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf',
]);

// Files that are explicitly allowed (do not report as pollution)
const ALLOWED_FILES = [
  'README.md',
];

// Line-level allowlist for specific false-positive findings.
// Maps: relative file path -> array of { patternLabel, linePattern }
// If a finding matches the patternLabel AND the triggering line matches linePattern,
// the finding is suppressed.
// This is NOT a directory-level skip — it is a precise per-line exception.
const ALLOWED_FILE_LINES = [
  {
    file: 'ai-pm-os/scripts/validate-skill.js',
    entries: [
      {
        patternLabel: 'macOS absolute path: /Users/...',
        // Line 88 in validate-skill.js: `  /\/Users\/[^\/\s]+/,` — this is a regex
        // literal defining a path pattern, not a concrete absolute path.
        // The comment `// Unix /Users/ home directory` on line 87 also contains /Users/
        // but is clearly a pattern description, not an actual path.
        // Allow both the pattern definition line and the comment.
        linePrefixes: ['  //Users//', '  // Unix /Users/'],
      },
    ],
  },
];

// --- Utility Functions ---

function shouldSkipDir(relativePath) {
  // node_modules and dist must be skipped at ALL levels (third-party deps / build output).
  // scripts is skipped ONLY at the root level (product governance scripts).
  // _DEV_PROJECT_CONTROL is skipped at all levels.
  const parts = relativePath.split(path.sep);
  const dirName = parts[parts.length - 1];
  const atRoot = (parts.length === 1);

  if (atRoot) {
    return SKIP_DIRS.includes(dirName);
  }

  // Non-root: only skip node_modules, dist, _DEV_PROJECT_CONTROL
  if (dirName === 'node_modules' || dirName === 'dist') return true;
  if (dirName === '_DEV_PROJECT_CONTROL') return true;
  return false;
}

function shouldScanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SCAN_EXTENSIONS.has(ext);
}

function isAllowedFile(filePath) {
  const fileName = path.basename(filePath);
  return ALLOWED_FILES.includes(fileName);
}

/**
 * Returns true if the file is under the product shell memory templates directory.
 * On Windows, path separators can be / or \, so we check for both.
 */
function isPMMemoryFile(relativePath) {
  return relativePath.startsWith('00_PM_MEMORY' + path.sep) ||
         relativePath.startsWith('00_PM_MEMORY/') ||
         relativePath.startsWith('00_PM_MEMORY\\');
}

/**
 * Collect all files to scan, respecting SKIP_DIRS.
 * Returns array of { fullPath, relativePath }.
 */
function collectFiles(dir, baseDir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.error('  ERROR: Cannot read directory:', dir, err.message);
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (!shouldSkipDir(relativePath)) {
        results.push(...collectFiles(fullPath, baseDir));
      }
    } else if (shouldScanFile(entry.name)) {
      results.push({ fullPath, relativePath });
    }
  }
  return results;
}

/**
 * Check if a specific finding on a specific line should be suppressed by the
 * ALLOWED_FILE_LINES allowlist.
 */
function isAllowedLineFinding(filePath, patternLabel, lineContent) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  for (const entry of ALLOWED_FILE_LINES) {
    if (normalizedPath.endsWith(entry.file)) {
      for (const ae of entry.entries) {
        if (ae.patternLabel === patternLabel) {
          for (const prefix of ae.linePrefixes) {
            if (lineContent.startsWith(prefix)) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}

/**
 * Scan a single file for pollution patterns.
 * Returns array of { pattern: label, file: path }.
 * Applies ALLOWED_FILE_LINES for line-level false-positive suppression.
 * Scans LINE BY LINE to prevent cross-line regex matches from bypassing the allowlist.
 */
function scanFile(filePath, patterns) {
  const findings = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (const { pattern, label } of patterns) {
      let lineHit = false;
      for (let i = 0; i < lines.length; i++) {
        const lineContent = lines[i];
        if (pattern.test(lineContent)) {
          // Pattern matched on this specific line
          if (isAllowedLineFinding(filePath, label, lineContent)) {
            continue; // suppressed — check next line
          }
          // Not suppressed — record finding
          lineHit = true;
          break;
        }
      }
      if (lineHit) {
        findings.push({ pattern: label, file: filePath });
      }
    }
  } catch (err) {
    // Binary or unreadable file - skip silently
  }
  return findings;
}

/**
 * Validate that a JSON file is parseable.
 */
function validateJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// --- Main ---

function main() {
  const baseDir = path.resolve(__dirname, '..');
  const dataDir = path.join(baseDir, '07_DATA');

  console.log('=== AI PM OS Local Shell - Pollution Check ===');
  console.log('Base directory:', baseDir);
  console.log('');

  let totalFindings = 0;
  let filesScanned = 0;
  let filesSkipped = 0;
  let allowedFilesHit = 0;

  // Phase 1: Pattern scan
  console.log('[Phase 1] Scanning for development governance artifacts...');
  const files = collectFiles(baseDir, baseDir);

  for (const { fullPath, relativePath } of files) {
    if (isAllowedFile(fullPath)) {
      filesSkipped++;
      allowedFilesHit++;
      continue;
    }
    filesScanned++;

    let findings = [];
    if (isPMMemoryFile(relativePath)) {
      // Phase 1a: Strict check for product shell memory templates only
      findings = scanFile(fullPath, STRICT_PATTERNS);
    } else {
      // Phase 1b: General check for all other product files
      findings = scanFile(fullPath, GENERAL_PATTERNS);
    }

    if (findings.length > 0) {
      totalFindings += findings.length;
      console.log('');
      console.log('  FOUND in: ' + relativePath);
      for (const f of findings) {
        console.log('    - ' + f.pattern);
      }
    }
  }

  console.log('');
  console.log('Files scanned: ' + filesScanned);
  console.log('Files skipped (allowed): ' + filesSkipped);

  // Phase 2: JSON validation
  console.log('');
  console.log('[Phase 2] Validating JSON files in 07_DATA/...');
  let jsonFiles = [];
  try {
    const entries = fs.readdirSync(dataDir);
    jsonFiles = entries.filter(f => f.endsWith('.json')).map(f => path.join(dataDir, f));
  } catch (err) {
    console.log('  ERROR: Cannot read 07_DATA directory:', err.message);
  }

  let jsonErrors = 0;
  for (const jsonFile of jsonFiles) {
    const relPath = path.relative(baseDir, jsonFile);
    const result = validateJsonFile(jsonFile);
    if (result.ok) {
      console.log('  OK: ' + relPath);
    } else {
      jsonErrors++;
      console.log('  ERROR: ' + relPath + ' - ' + result.error);
    }
  }

  // Phase 3: Check for forbidden files in product root
  console.log('');
  console.log('[Phase 3] Checking for forbidden product files...');
  const forbiddenFiles = [
    'AI_PM_OS_LOCAL_SHELL_REQUIREMENTS_V1.0.md',
    'AI_PM_OS_LOCAL_SHELL_REQUIREMENTS_ADDENDUM_V1.1.md',
    'REQUIREMENTS_BASELINE_INDEX.md',
  ];
  let forbiddenFound = 0;
  for (const name of forbiddenFiles) {
    const checkPath = path.join(baseDir, name);
    if (fs.existsSync(checkPath)) {
      forbiddenFound++;
      console.log('  FORBIDDEN: ' + name + ' still exists at product root');
    }
  }
  if (forbiddenFound === 0) {
    console.log('  No forbidden files found in product root.');
  }

  // Phase 4: Report skipped directories
  console.log('');
  console.log('[Phase 4] Skipped directories:');
  for (const dir of SKIP_DIRS) {
    console.log('  - ' + dir + '/');
  }

  // Summary
  console.log('');
  console.log('=== Summary ===');
  console.log('Pollution pattern hits (product files): ' + totalFindings);
  console.log('JSON validation errors: ' + jsonErrors);
  console.log('Forbidden files found: ' + forbiddenFound);
  console.log('Allowed files skipped: ' + allowedFilesHit);
  console.log('');

  if (totalFindings === 0 && jsonErrors === 0 && forbiddenFound === 0) {
    console.log('RESULT: PASS - Product shell is clean.');
    console.log('');
    process.exit(0);
  } else {
    console.log('RESULT: FAIL - Pollution detected. See details above.');
    console.log('');
    process.exit(1);
  }
}

main();
