/**
 * AI PM OS Local Shell - Release Verification Script
 *
 * Verifies the product shell and ai-pm-os Skill package are correctly packaged
 * for release. This script is the canonical release gate for WP-016 / WP-021.
 *
 * Usage:
 *   node scripts/verify-release.js           # Standard mode
 *   node scripts/verify-release.js --strict  # P0 strict mode (requires Dashboard build)
 *
 * Exit codes:
 *   0 = All release checks passed
 *   1 = Release verification failed
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = path.resolve(__dirname, '..');

let totalErrors = 0;
const tempDirs = [];

// --strict flag: P0 release gate — requires Dashboard build/sync/smoke to pass
const strictMode = process.argv.includes('--strict');

// =============================================================================
// UTILITY: Temp directory management
// =============================================================================

function createTempDir() {
  const tmpDir = path.join(require('os').tmpdir(), 'ai-pm-os-release-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8));
  fs.mkdirSync(tmpDir, { recursive: true });
  tempDirs.push(tmpDir);
  return tmpDir;
}

function cleanupTempDirs() {
  for (const d of tempDirs) {
    try {
      if (fs.existsSync(d)) {
        fs.rmSync(d, { recursive: true, force: true });
      }
    } catch (e) {
      // ignore cleanup errors
    }
  }
  tempDirs.length = 0;
}

function runNode(cmd, cwd) {
  try {
    const result = execSync(cmd, {
      cwd: cwd || baseDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000,
      windowsHide: true
    });
    return { exitCode: 0, stdout: result, stderr: '' };
  } catch (e) {
    return { exitCode: e.status || 1, stdout: e.stdout || '', stderr: e.stderr || '' };
  }
}

// =============================================================================
// CHECK 1a: Required directories exist (QC-F-183 separation)
// =============================================================================

function checkRequiredDirectories() {
  console.log('[Check 1a] Verifying required directories...');

  const requiredDirs = [
    '_AI_GLOBAL_MEMORY',
    '00_PM_MEMORY',
    '01_PM_DOCUMENTS',
    '02_AGILE',
    '03_MEETINGS',
    '04_TODO',
    '05_REPORTS',
    '06_DASHBOARD',
    '07_DATA',
    '08_INTAKE',
    '09_ARCHIVE',
    'ai-pm-os',
    'scripts'
  ];

  let missing = [];
  for (const d of requiredDirs) {
    const fullPath = path.join(baseDir, d);
    if (!fs.existsSync(fullPath)) {
      missing.push(d);
      console.log('  MISSING: ' + d);
    } else {
      console.log('  OK: ' + d + ' exists');
    }
  }

  if (missing.length > 0) {
    console.log('  FAIL: ' + missing.length + ' required directory(ies) missing');
    totalErrors += missing.length;
    return false;
  }

  console.log('  PASS: all required directories exist');
  return true;
}

// =============================================================================
// CHECK 1b: Required root files exist (QC-F-183 separation)
// Every item in INCLUDE_ITEMS that is NOT a known directory must exist.
// =============================================================================

function checkRequiredRootFiles() {
  console.log('\n[Check 1b] Verifying required root files...');

  const requiredRootFiles = [
    'AGENTS.md',
    'README.md',
    'USER_GUIDE.md',
    'PRODUCT_SHELL_MANIFEST.md',
    'RELEASE_CHECKLIST.md',
    'P0_GOVERNANCE_EVIDENCE.md',
    '.gitignore',
    '.gitattributes'
  ];

  const knownDirs = new Set([
    '_AI_GLOBAL_MEMORY', '00_PM_MEMORY', '01_PM_DOCUMENTS', '02_AGILE',
    '03_MEETINGS', '04_TODO', '05_REPORTS', '06_DASHBOARD', '07_DATA',
    '08_INTAKE', '09_ARCHIVE', 'ai-pm-os', 'scripts'
  ]);

  let missing = [];
  for (const f of requiredRootFiles) {
    const fullPath = path.join(baseDir, f);
    if (!fs.existsSync(fullPath)) {
      missing.push(f);
      console.log('  MISSING: ' + f);
    } else {
      console.log('  OK: ' + f + ' exists');
    }
  }

  if (missing.length > 0) {
    console.log('  FAIL: ' + missing.length + ' required root file(s) missing');
    totalErrors += missing.length;
    return false;
  }

  console.log('  PASS: all required root files exist');
  return true;
}

// =============================================================================
// CHECK 2: Full-host Skill validation
// =============================================================================

function checkFullHostValidation() {
  console.log('\n[Check 2] Running full-host Skill validation...');

  const result = runNode('node ai-pm-os/scripts/validate-skill.js');

  if (result.exitCode === 0) {
    console.log('  PASS: full-host validation exited 0');
    if (result.stdout) {
      const lines = result.stdout.split('\n').filter(l => l.trim());
      console.log('  Output: ' + (lines[lines.length - 1] || 'PASS').trim());
    }
    return true;
  } else {
    console.log('  FAIL: full-host validation exited ' + result.exitCode);
    if (result.stderr) console.log('  Stderr: ' + result.stderr.substring(0, 500));
    totalErrors++;
    return false;
  }
}

// =============================================================================
// CHECK 3: Isolated ai-pm-os package copy validation
// =============================================================================

function checkIsolatedPackageValidation() {
  console.log('\n[Check 3] Running isolated ai-pm-os/ package copy validation...');

  const tmpDir = createTempDir();
  const pkgCopy = path.join(tmpDir, 'ai-pm-os');

  try {
    copyDirFlat(path.join(baseDir, 'ai-pm-os'), pkgCopy, [], 'ai-pm-os');
    console.log('  Copied ai-pm-os/ to isolated temp dir: ' + pkgCopy);

    const result = runNode('node ai-pm-os/scripts/validate-skill.js', tmpDir);

    if (result.exitCode === 0) {
      if (result.stdout && result.stdout.indexOf('ISOLATED') !== -1) {
        console.log('  PASS: isolated package validation exited 0 (ISOLATED mode detected)');
      } else {
        console.log('  WARN: exited 0 but ISOLATED mode not detected in output');
      }
      return true;
    } else {
      console.log('  FAIL: isolated package validation exited ' + result.exitCode);
      if (result.stdout) {
        const lines = result.stdout.split('\n').filter(l => l.trim());
        console.log('  Output: ' + (lines[lines.length - 1] || 'FAIL').trim());
      }
      totalErrors++;
      return false;
    }
  } catch (e) {
    console.log('  FAIL: exception during isolated copy: ' + e.message);
    totalErrors++;
    return false;
  }
}

// =============================================================================
// CHECK 4: Product shell copy validation (excluding control files)
//
// QC-F-155 fix: path-aware copy using full relative paths from project root.
// Forbidden paths are checked against the full relative path, not just entry.name.
// This correctly excludes nested paths like 06_DASHBOARD/public/data/.
// =============================================================================

function checkProductShellCopy() {
  console.log('\n[Check 4] Running product shell copy validation...');

  const tmpDir = createTempDir();

  try {
    // Forbidden relative paths — must never appear in release copy
    const FORBIDDEN = [
      '_DEV_PROJECT_CONTROL',
      '.git',
      'node_modules',
      'dist',
      '06_DASHBOARD/node_modules',
      '06_DASHBOARD/dist',
      '06_DASHBOARD/public/data'
    ];

    const INCLUDE_ITEMS = [
      // Core directories
      'AGENTS.md',
      'README.md',
      'USER_GUIDE.md',
      'PRODUCT_SHELL_MANIFEST.md',
      'RELEASE_CHECKLIST.md',
      'P0_GOVERNANCE_EVIDENCE.md',
      '.gitignore',
      '.gitattributes',
      'ai-pm-os',
      'scripts',
      '00_PM_MEMORY',
      '01_PM_DOCUMENTS',
      '02_AGILE',
      '03_MEETINGS',
      '04_TODO',
      '05_REPORTS',
      '06_DASHBOARD',
      '07_DATA',
      '08_INTAKE',
      '09_ARCHIVE',
      '_AI_GLOBAL_MEMORY'
    ];

    for (const item of INCLUDE_ITEMS) {
      const src = path.join(baseDir, item);
      if (!fs.existsSync(src)) {
        console.log('  FAIL: required item missing: ' + item);
        totalErrors++;
        continue;
      }
      const dest = path.join(tmpDir, item);
      if (fs.statSync(src).isDirectory()) {
        copyDirFlat(src, dest, FORBIDDEN, item);
      } else {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(src, dest);
      }
    }

    console.log('  Copied product shell to: ' + tmpDir);

    let shellErrors = 0;

    const skillResult = runNode('node ai-pm-os/scripts/validate-skill.js', tmpDir);
    if (skillResult.exitCode === 0) {
      console.log('  OK: Skill validation passed in copied shell');
    } else {
      console.log('  FAIL: Skill validation failed in copied shell (exit ' + skillResult.exitCode + ')');
      shellErrors++;
    }

    const dataResult = runNode('node scripts/validate-data.js', tmpDir);
    if (dataResult.exitCode === 0) {
      console.log('  OK: JSON data validation passed');
    } else {
      console.log('  WARN: JSON data validation failed (exit ' + dataResult.exitCode + ')');
    }

    const pollResult = runNode('node scripts/check-pollution.js', tmpDir);
    if (pollResult.exitCode === 0) {
      console.log('  OK: Pollution check passed');
    } else {
      console.log('  WARN: Pollution check failed (exit ' + pollResult.exitCode + ')');
    }

    // Verify no forbidden paths are present in the copy
    const checkPaths = [
      '_DEV_PROJECT_CONTROL',
      '.git',
      'node_modules',
      'dist',
      '06_DASHBOARD/node_modules',
      '06_DASHBOARD/dist',
      '06_DASHBOARD/public/data'
    ];

    let forbiddenFound = [];
    for (const fp of checkPaths) {
      const fpAbs = path.join(tmpDir, fp);
      if (fs.existsSync(fpAbs)) {
        forbiddenFound.push(fp);
      }
    }

    if (forbiddenFound.length > 0) {
      console.log('  FAIL: Forbidden path(s) found in copy: ' + forbiddenFound.join(', '));
      totalErrors++;
      return false;
    } else {
      console.log('  OK: No forbidden paths in copy');
      console.log('  Verified absent: _DEV_PROJECT_CONTROL/, .git/, node_modules/, dist/, 06_DASHBOARD/node_modules/, 06_DASHBOARD/dist/, 06_DASHBOARD/public/data/');
    }

    if (shellErrors > 0) {
      totalErrors += shellErrors;
      return false;
    }

    console.log('  PASS: product shell copy validation complete');
    return true;
  } catch (e) {
    console.log('  FAIL: exception during product shell copy: ' + e.message);
    totalErrors++;
    return false;
  }
}

// =============================================================================
// CHECK 5: Dashboard publishability — QC-F-156 fix
// Reads PRODUCT ROOT .gitignore (not 06_DASHBOARD/.gitignore)
// and verifies required Dashboard exclusion rules.
// =============================================================================

function checkDashboard() {
  console.log('\n[Check 5] Checking Dashboard publishability...');

  const dashDir = path.join(baseDir, '06_DASHBOARD');
  let dashErrors = 0;

  const rootGitignore = path.join(baseDir, '.gitignore');
  console.log('  Reading: ' + rootGitignore);

  if (!fs.existsSync(rootGitignore)) {
    console.log('  FAIL: .gitignore not found at product root: ' + rootGitignore);
    totalErrors++;
    return false;
  }

  const gitignoreContent = fs.readFileSync(rootGitignore, 'utf8');

  const requiredRules = [
    { pattern: /^\s*\/06_DASHBOARD\/node_modules\/\s*$/m, name: '/06_DASHBOARD/node_modules/' },
    { pattern: /^\s*\/06_DASHBOARD\/dist\/\s*$/m, name: '/06_DASHBOARD/dist/' },
    { pattern: /^\s*\/06_DASHBOARD\/public\/data\/\s*$/m, name: '/06_DASHBOARD/public/data/' }
  ];

  for (const rule of requiredRules) {
    if (rule.pattern.test(gitignoreContent)) {
      console.log('  OK: root .gitignore excludes ' + rule.name);
    } else {
      console.log('  FAIL: root .gitignore MISSING required rule: ' + rule.name);
      dashErrors++;
    }
  }

  if (dashErrors > 0) {
    console.log('  FAIL: ' + dashErrors + ' required Dashboard exclusion rule(s) missing from root .gitignore');
    totalErrors += dashErrors;
    return false;
  }

  console.log('  PASS: root .gitignore contains all required Dashboard exclusion rules');

  const nodeModules = path.join(dashDir, 'node_modules');
  if (fs.existsSync(nodeModules)) {
    console.log('  INFO: node_modules present, running build check...');

    const buildResult = runNode('npm run build', dashDir);
    if (buildResult.exitCode === 0) {
      console.log('  OK: Dashboard build succeeded');
    } else {
      console.log('  FAIL: Dashboard build failed (exit ' + buildResult.exitCode + ')');
      if (strictMode) totalErrors++;
      if (strictMode) return false;
    }

    // Strict mode: also verify sync:data and smoke pass
    if (strictMode) {
      console.log('  INFO: --strict mode: also verifying sync:data and smoke...');

      const syncResult = runNode('npm run sync:data', dashDir);
      if (syncResult.exitCode === 0) {
        console.log('  OK: Dashboard sync:data succeeded');
      } else {
        console.log('  FAIL: Dashboard sync:data failed (exit ' + syncResult.exitCode + ')');
        totalErrors++;
        return false;
      }

      const smokeResult = runNode('npm run smoke', dashDir);
      if (smokeResult.exitCode === 0) {
        console.log('  OK: Dashboard smoke succeeded');
      } else {
        console.log('  FAIL: Dashboard smoke failed (exit ' + smokeResult.exitCode + ')');
        totalErrors++;
        return false;
      }
    }
  } else {
    if (strictMode) {
      console.log('  FAIL: node_modules not installed — --strict mode requires full Dashboard verification');
      totalErrors++;
      return false;
    } else {
      console.log('  INFO: node_modules not installed, skipping build/sync/smoke check');
    }
  }

  return true;
}

// =============================================================================
// CHECK 6: Windows environment
// =============================================================================

function checkEnvironment() {
  console.log('\n[Check 6] Environment check...');

  const platform = require('os').platform();
  const nodeVersion = require('process').version;

  console.log('  Platform: ' + platform);
  console.log('  Node.js: ' + nodeVersion);

  if (platform === 'win32') {
    console.log('  Status: Windows environment detected');
  } else if (platform === 'darwin') {
    console.log('  Status: macOS environment detected');
  } else {
    console.log('  Status: Linux/other environment detected');
  }

  return true;
}

// =============================================================================
// HELPER: Flat recursive copy with relative-path exclusion
//
// QC-F-155 fix: receives full absolute src/dest and computes relative paths
// from the project root for every entry. Exclusion is checked against the full
// relative path (e.g. "06_DASHBOARD/public/data"), not just entry.name.
//
// Key logic: relPathSlash.startsWith(forbiddenBase + '/') matches when
// the current path IS a child of a forbidden directory (e.g. "public/data"
// is a child of "public"). This prevents "public/data" from being copied when
// "public/data" is in the forbidden list, because the recursion into "public"
// is stopped at the "public" level.
// =============================================================================

function isForbidden(relPath, forbiddenList) {
  const relSlash = relPath + '/';
  for (const fp of forbiddenList) {
    const fpBase = fp.replace(/\/$/, '');
    // relPath exactly matches a forbidden entry (e.g. relPath="06_DASHBOARD/public/data", fp="06_DASHBOARD/public/data")
    if (relPath === fpBase) return true;
    // relPath is a child of a forbidden directory (e.g. relPath="06_DASHBOARD/public/data/something", fp="06_DASHBOARD/public/data")
    if (relSlash.startsWith(fpBase + '/')) return true;
  }
  return false;
}

function copyDirFlat(src, dest, forbiddenList, projectRelPrefix) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    // relPath is always relative to the PROJECT root
    const relPath = projectRelPrefix ? projectRelPrefix + '/' + entry.name : entry.name;

    if (isForbidden(relPath, forbiddenList)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirFlat(srcPath, destPath, forbiddenList, relPath);
    } else {
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
  console.log('=== AI PM OS Local Shell - Release Verification ===');
  console.log('Base directory: ' + baseDir);
  if (strictMode) console.log('Mode: --strict (P0 strict release gate)');
  console.log('');

  try {
    checkEnvironment();
    checkRequiredDirectories();
    checkRequiredRootFiles();
    checkFullHostValidation();
    checkIsolatedPackageValidation();
    checkProductShellCopy();
    checkDashboard();

    console.log('\n=== Summary ===');
    console.log('Total errors: ' + totalErrors);

    if (totalErrors === 0) {
      console.log('RESULT: PASS - Release verification complete.');
      console.log('');
      cleanupTempDirs();
      process.exit(0);
    } else {
      console.log('RESULT: FAIL - Release verification failed.');
      console.log('');
      cleanupTempDirs();
      process.exit(1);
    }
  } catch (e) {
    console.error('FATAL: ' + e.message);
    cleanupTempDirs();
    process.exit(1);
  }
}

main();
