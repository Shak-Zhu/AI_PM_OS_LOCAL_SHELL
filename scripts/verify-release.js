/**
 * AI PM OS Local Shell - Release Verification Script
 *
 * Verifies the product shell and ai-pm-os Skill package are correctly packaged
 * for release. This script is the canonical release gate for WP-016 / WP-021 / WP-023.
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

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;

var baseDir = path.resolve(__dirname, '..');

var totalErrors = 0;
var tempDirs = [];

// --strict flag: P0 release gate — requires Dashboard build/sync/smoke to pass
var strictMode = process.argv.indexOf('--strict') !== -1;

// =============================================================================
// UTILITY: Temp directory management
// =============================================================================

function createTempDir() {
  var tmpDir = path.join(require('os').tmpdir(), 'ai-pm-os-release-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8));
  fs.mkdirSync(tmpDir, { recursive: true });
  tempDirs.push(tmpDir);
  return tmpDir;
}

function cleanupTempDirs() {
  for (var di = 0; di < tempDirs.length; di++) {
    try {
      if (fs.existsSync(tempDirs[di])) {
        fs.rmSync(tempDirs[di], { recursive: true, force: true });
      }
    } catch (e) { /* ignore */ }
  }
  tempDirs.length = 0;
}

function runNode(cmd, cwd) {
  try {
    var result = execSync(cmd, {
      cwd: cwd || baseDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000,
      windowsHide: true
    });
    return { exitCode: 0, stdout: result, stderr: '' };
  } catch (e) {
    return { exitCode: e.status || 1, stdout: e.stdout || '', stderr: e.stderr || '' };
  }
}

// =============================================================================
// CHECK 1: Required directories exist
// =============================================================================

function checkRequiredDirectories() {
  console.log('[Check 1] Verifying required directories...');

  var requiredDirs = [
    '_AI_GLOBAL_MEMORY', '00_PM_MEMORY', '01_PM_DOCUMENTS', '02_AGILE',
    '03_MEETINGS', '04_TODO', '05_REPORTS', '06_DASHBOARD', '07_DATA',
    '08_INTAKE', '09_ARCHIVE', 'ai-pm-os', 'scripts'
  ];

  var missing = [];
  for (var i = 0; i < requiredDirs.length; i++) {
    var d = requiredDirs[i];
    var fullPath = path.join(baseDir, d);
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
// CHECK 2: Required root files exist
// =============================================================================

function checkRequiredRootFiles() {
  console.log('\n[Check 2] Verifying required root files...');

  // R2 fix (QC-F-265): P0_GOVERNANCE_EVIDENCE.md is no longer a required root file.
  // It is a development governance artifact that must NOT enter the clean product shell.
  // Control-space historical evidence remains in _DEV_PROJECT_CONTROL/.
  var requiredRootFiles = [
    'AGENTS.md', 'README.md', 'USER_GUIDE.md', 'PRODUCT_SHELL_MANIFEST.md',
    'RELEASE_CHECKLIST.md', '.gitignore', '.gitattributes'
  ];

  var missing = [];
  for (var i = 0; i < requiredRootFiles.length; i++) {
    var f = requiredRootFiles[i];
    var fullPath = path.join(baseDir, f);
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
// CHECK 3: Semantic template validation (WP-023)
// Semantic validator checks for:
// - Old AI role terminology (PM AI, Coder AI, Human Owner, AI Reviewer)
// - Work Package / Rework Package / Coder Work Package
// - PM/QC Review / Human Acceptance Request
// - GOVERNANCE_ROOT, COC-CWP/RWP/PQR/HAR
// - pm-ai-work-packages / pm-ai-reviews in product files
// - Isomorphic renamed chains (Delivery->Quality->Owner)
// =============================================================================

function checkSemanticValidation() {
  console.log('\n[Check 3] Running semantic template validation (WP-023 Pure PM Copilot)...');

  var result = runNode('node scripts/validate-template-semantics.js');

  if (result.exitCode === 0) {
    console.log('  PASS: semantic validation exited 0 (no old model terms found)');
    return true;
  } else {
    console.log('  FAIL: semantic validation exited ' + result.exitCode);
    if (result.stdout) {
      var lines = result.stdout.split('\n');
      for (var li = 0; li < lines.length; li++) {
        if (lines[li].trim()) console.log('  ' + lines[li].trim().substring(0, 120));
      }
    }
    totalErrors++;
    return false;
  }
}

// =============================================================================
// CHECK 3b: Governance verifier (R2 — WP-023-R2)
// In --strict mode, verify-governance.js must also pass.
// This is the P0 release gate for role config, naming, Git, and auto-Git ops.
// =============================================================================

function checkGovernance() {
  console.log('\n[Check 3b] Running governance verification (WP-023-R2)...');

  var result = runNode('node scripts/verify-governance.js');

  if (result.exitCode === 0) {
    console.log('  PASS: governance verification exited 0');
    return true;
  } else {
    console.log('  FAIL: governance verification exited ' + result.exitCode);
    if (result.stdout) {
      var lines = result.stdout.split('\n');
      for (var li = 0; li < lines.length; li++) {
        if (lines[li].trim()) console.log('  ' + lines[li].trim().substring(0, 120));
      }
    }
    totalErrors++;
    return false;
  }
}

// =============================================================================
// CHECK 4: Full-host Skill validation
// =============================================================================

function checkFullHostValidation() {
  console.log('\n[Check 4] Running full-host Skill validation...');

  var result = runNode('node ai-pm-os/scripts/validate-skill.js');

  if (result.exitCode === 0) {
    console.log('  PASS: full-host validation exited 0');
    return true;
  } else {
    console.log('  FAIL: full-host validation exited ' + result.exitCode);
    totalErrors++;
    return false;
  }
}

// =============================================================================
// CHECK 5: Isolated ai-pm-os package copy validation
// =============================================================================

function checkIsolatedPackageValidation() {
  console.log('\n[Check 5] Running isolated ai-pm-os/ package copy validation...');

  var tmpDir = createTempDir();
  var pkgCopy = path.join(tmpDir, 'ai-pm-os');

  try {
    copyDirFlat(path.join(baseDir, 'ai-pm-os'), pkgCopy, [], 'ai-pm-os');
    console.log('  Copied ai-pm-os/ to isolated temp dir: ' + pkgCopy);

    var result = runNode('node ai-pm-os/scripts/validate-skill.js', tmpDir);

    if (result.exitCode === 0) {
      console.log('  PASS: isolated package validation exited 0');
      return true;
    } else {
      console.log('  FAIL: isolated package validation exited ' + result.exitCode);
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
// CHECK 6: Product shell copy validation (excluding control files)
// =============================================================================

var FORBIDDEN = [
  '_DEV_PROJECT_CONTROL', '.git', 'node_modules', 'dist',
  '06_DASHBOARD/node_modules', '06_DASHBOARD/dist', '06_DASHBOARD/public/data'
];

var INCLUDE_ITEMS = [
  'AGENTS.md', 'README.md', 'USER_GUIDE.md', 'PRODUCT_SHELL_MANIFEST.md',
  'RELEASE_CHECKLIST.md', '.gitignore', '.gitattributes',
  'ai-pm-os', 'scripts',
  '00_PM_MEMORY', '01_PM_DOCUMENTS', '02_AGILE', '03_MEETINGS', '04_TODO',
  '05_REPORTS', '06_DASHBOARD', '07_DATA', '08_INTAKE', '09_ARCHIVE', '_AI_GLOBAL_MEMORY'
];

function checkProductShellCopy() {
  console.log('\n[Check 6] Running product shell copy validation...');

  var tmpDir = createTempDir();

  try {
    for (var ii = 0; ii < INCLUDE_ITEMS.length; ii++) {
      var item = INCLUDE_ITEMS[ii];
      var src = path.join(baseDir, item);
      if (!fs.existsSync(src)) {
        console.log('  FAIL: required item missing: ' + item);
        totalErrors++;
        continue;
      }
      var dest = path.join(tmpDir, item);
      if (fs.statSync(src).isDirectory()) {
        copyDirFlat(src, dest, FORBIDDEN, item);
      } else {
        var destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(src, dest);
      }
    }

    console.log('  Copied product shell to: ' + tmpDir);

    var shellErrors = 0;

    var skillResult = runNode('node ai-pm-os/scripts/validate-skill.js', tmpDir);
    if (skillResult.exitCode === 0) {
      console.log('  OK: Skill validation passed in copied shell');
    } else {
      console.log('  FAIL: Skill validation failed in copied shell (exit ' + skillResult.exitCode + ')');
      shellErrors++;
    }

    var dataResult = runNode('node scripts/validate-data.js', tmpDir);
    if (dataResult.exitCode === 0) {
      console.log('  OK: JSON data validation passed');
    } else {
      console.log('  FAIL: JSON data validation failed in copied shell (exit ' + dataResult.exitCode + ')');
      shellErrors++;
    }

    var pollResult = runNode('node scripts/check-pollution.js', tmpDir);
    if (pollResult.exitCode === 0) {
      console.log('  OK: Pollution check passed');
    } else {
      console.log('  FAIL: Pollution check failed in copied shell (exit ' + pollResult.exitCode + ')');
      shellErrors++;
    }

    // WP-023: Semantic validation in copied shell
    var semResult = runNode('node scripts/validate-template-semantics.js', tmpDir);
    if (semResult.exitCode === 0) {
      console.log('  OK: Semantic validation passed in copied shell');
    } else {
      console.log('  FAIL: Semantic validation failed in copied shell (exit ' + semResult.exitCode + ')');
      shellErrors++;
    }

    // Verify no forbidden paths are present
    var forbiddenFound = [];
    for (var fi = 0; fi < FORBIDDEN.length; fi++) {
      var fpAbs = path.join(tmpDir, FORBIDDEN[fi]);
      if (fs.existsSync(fpAbs)) {
        forbiddenFound.push(FORBIDDEN[fi]);
      }
    }

    if (forbiddenFound.length > 0) {
      console.log('  FAIL: Forbidden path(s) found in copy: ' + forbiddenFound.join(', '));
      totalErrors++;
      return false;
    }
    console.log('  OK: No forbidden paths in copy');

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
// CHECK 7: Dashboard publishability
// =============================================================================

function checkDashboard() {
  console.log('\n[Check 7] Checking Dashboard publishability...');

  var dashDir = path.join(baseDir, '06_DASHBOARD');
  var dashErrors = 0;

  var rootGitignore = path.join(baseDir, '.gitignore');

  if (!fs.existsSync(rootGitignore)) {
    console.log('  FAIL: .gitignore not found at product root');
    totalErrors++;
    return false;
  }

  var gitignoreContent = fs.readFileSync(rootGitignore, 'utf8');

  var requiredRules = [
    { pattern: /^\s*\/06_DASHBOARD\/node_modules\/\s*$/m, name: '/06_DASHBOARD/node_modules/' },
    { pattern: /^\s*\/06_DASHBOARD\/dist\/\s*$/m, name: '/06_DASHBOARD/dist/' },
    { pattern: /^\s*\/06_DASHBOARD\/public\/data\/\s*$/m, name: '/06_DASHBOARD/public/data/' }
  ];

  for (var ri = 0; ri < requiredRules.length; ri++) {
    var rule = requiredRules[ri];
    if (rule.pattern.test(gitignoreContent)) {
      console.log('  OK: root .gitignore excludes ' + rule.name);
    } else {
      console.log('  FAIL: root .gitignore MISSING required rule: ' + rule.name);
      dashErrors++;
    }
  }

  if (dashErrors > 0) {
    console.log('  FAIL: ' + dashErrors + ' required Dashboard exclusion rule(s) missing');
    totalErrors += dashErrors;
    return false;
  }
  console.log('  PASS: root .gitignore contains all required Dashboard exclusion rules');

  var nodeModules = path.join(dashDir, 'node_modules');
  if (fs.existsSync(nodeModules)) {
    console.log('  INFO: node_modules present, running build check...');

    var buildResult = runNode('npm run build', dashDir);
    if (buildResult.exitCode === 0) {
      console.log('  OK: Dashboard build succeeded');
    } else {
      console.log('  FAIL: Dashboard build failed (exit ' + buildResult.exitCode + ')');
      if (strictMode) totalErrors++;
      if (strictMode) return false;
    }

    if (strictMode) {
      console.log('  INFO: --strict mode: also verifying sync:data and smoke...');

      var syncResult = runNode('npm run sync:data', dashDir);
      if (syncResult.exitCode === 0) {
        console.log('  OK: Dashboard sync:data succeeded');
      } else {
        console.log('  FAIL: Dashboard sync:data failed (exit ' + syncResult.exitCode + ')');
        totalErrors++;
        return false;
      }

      var smokeResult = runNode('npm run smoke', dashDir);
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
    }
    console.log('  INFO: node_modules not installed, skipping build/sync/smoke check');
  }

  return true;
}

// =============================================================================
// CHECK 8: Environment
// =============================================================================

function checkEnvironment() {
  console.log('[Check 8] Environment check...');
  console.log('  Platform: ' + require('os').platform());
  console.log('  Node.js: ' + require('process').version);
  return true;
}

// =============================================================================
// HELPER: Flat recursive copy with relative-path exclusion
// =============================================================================

function isForbidden(relPath, forbiddenList) {
  var relSlash = relPath + '/';
  for (var fi = 0; fi < forbiddenList.length; fi++) {
    var fpBase = forbiddenList[fi].replace(/\/$/, '');
    if (relPath === fpBase) return true;
    if (relSlash.indexOf(fpBase + '/') === 0) return true;
  }
  return false;
}

function copyDirFlat(src, dest, forbiddenList, projectRelPrefix) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  var entries = fs.readdirSync(src, { withFileTypes: true });

  for (var ei = 0; ei < entries.length; ei++) {
    var entry = entries[ei];
    var srcPath = path.join(src, entry.name);
    var destPath = path.join(dest, entry.name);
    var relPath = projectRelPrefix ? projectRelPrefix + '/' + entry.name : entry.name;

    if (isForbidden(relPath, forbiddenList)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirFlat(srcPath, destPath, forbiddenList, relPath);
    } else {
      var destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function checkPopulatedSyncFixture() {
  console.log('\n[Check 6b] Running populated data regression...');
  var result = runNode('node scripts/verify-populated-sync.js', baseDir);
  if (result.exitCode === 0) {
    console.log('  PASS: populated sync regression exited 0');
    return true;
  }

  console.log('  FAIL: populated sync regression failed (exit ' + result.exitCode + ')');
  if (result.stdout) console.log(result.stdout.trim());
  if (result.stderr) console.log(result.stderr.trim());
  totalErrors++;
  return false;
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
    checkSemanticValidation();
    if (strictMode) {
      checkGovernance();
    }
    checkFullHostValidation();
    checkIsolatedPackageValidation();
    checkProductShellCopy();
    if (strictMode) {
      checkPopulatedSyncFixture();
    }
    checkDashboard();

    console.log('\n=== Summary ===');
    console.log('Total errors: ' + totalErrors);

    if (totalErrors === 0) {
      console.log('RESULT: PASS - Release verification complete.');
      cleanupTempDirs();
      process.exit(0);
    } else {
      console.log('RESULT: FAIL - Release verification failed.');
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
