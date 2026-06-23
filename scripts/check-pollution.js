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

// Pollution patterns to detect in PRODUCT files only.
// The script itself, _DEV_PROJECT_CONTROL/, and .git/ are skipped
// before this array is used for content scanning.
const POLLUTION_PATTERNS = [
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
  // Risk IDs (require word boundary to avoid matching inside COC-PQR-###)
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
// NOTE: ai-pm-os/ is NOT skipped — it is scanned like any other product directory.
// Pollution patterns (PU-001..PU-005, CHG-001..CHG-003, etc.) must be handled
// by using placeholders (PU-###, CHG-###, etc.) in scenario text, NOT by skipping
// the entire directory.
const SKIP_DIRS = [
  '.git',
  'node_modules',
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
  'README.md',  // Product name "AI PM OS Local Shell" is legitimate
];

// --- Utility Functions ---

/**
 * Check if a path component should be skipped (belong to a skipped directory).
 * Works with both Windows (\) and Unix (/) path separators.
 */
function shouldSkipDir(entryName) {
  return SKIP_DIRS.includes(entryName);
}

/**
 * Check if a file should be scanned based on extension.
 */
function shouldScanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SCAN_EXTENSIONS.has(ext);
}

/**
 * Check if a file is explicitly allowed (not pollution even if matched).
 */
function isAllowedFile(filePath) {
  const fileName = path.basename(filePath);
  return ALLOWED_FILES.includes(fileName);
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
      if (!shouldSkipDir(entry.name)) {
        results.push(...collectFiles(fullPath, baseDir));
      }
      // else: skip .git, node_modules, scripts, _DEV_PROJECT_CONTROL
    } else if (shouldScanFile(entry.name)) {
      results.push({ fullPath, relativePath });
    }
  }
  return results;
}

/**
 * Scan a single file for pollution patterns.
 * Returns array of { pattern: label, file: path }.
 */
function scanFile(filePath, patterns) {
  const findings = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const { pattern, label } of patterns) {
      if (pattern.test(content)) {
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
    const findings = scanFile(fullPath, POLLUTION_PATTERNS);
    if (findings.length > 0) {
      totalFindings += findings.length;
      console.log('');
      console.log(`  FOUND in: ${relativePath}`);
      for (const f of findings) {
        console.log(`    - ${f.pattern}`);
      }
    }
  }

  console.log('');
  console.log(`Files scanned: ${filesScanned}`);
  console.log(`Files skipped (allowed): ${filesSkipped}`);

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
      console.log(`  OK: ${relPath}`);
    } else {
      jsonErrors++;
      console.log(`  ERROR: ${relPath} - ${result.error}`);
    }
  }

  // Phase 3: Check for forbidden files in product root
  // (files that should have been deleted from the product repo)
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
      console.log(`  FORBIDDEN: ${name} still exists at product root`);
    }
  }
  if (forbiddenFound === 0) {
    console.log('  No forbidden files found in product root.');
  }

  // Phase 4: Report skipped directories
  console.log('');
  console.log('[Phase 4] Skipped directories:');
  for (const dir of SKIP_DIRS) {
    console.log(`  - ${dir}/`);
  }

  // Summary
  console.log('');
  console.log('=== Summary ===');
  console.log(`Pollution pattern hits (product files): ${totalFindings}`);
  console.log(`JSON validation errors: ${jsonErrors}`);
  console.log(`Forbidden files found: ${forbiddenFound}`);
  console.log(`Allowed files skipped: ${allowedFilesHit}`);
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
