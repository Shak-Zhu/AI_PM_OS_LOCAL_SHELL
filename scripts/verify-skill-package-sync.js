/**
 * verify-skill-package-sync.js — Dual ai-pm-os/ repository comparison tool
 *
 * Compares two ai-pm-os/ directories by relative file list and SHA-256 hash.
 * Exits 0 if identical, exits 1 with diff report if files differ.
 *
 * Usage:
 *   node scripts/verify-skill-package-sync.js <path-a> <path-b>
 *   node scripts/verify-skill-package-sync.js ai-pm-os ../AI_PM_OS_SKILL/ai-pm-os
 *
 * Output format:
 *   COMPARING: <path-a> vs <path-b>
 *   Files in A: N
 *   Files in B: N
 *   SHA-256 mismatch count: N
 *   Missing in B: <list>
 *   Extra in B: <list>
 *   RESULT: PASS | FAIL
 *
 * Exit codes:
 *   0 = Identical (PASS)
 *   1 = Mismatch (FAIL)
 *   2 = Invalid usage
 */

'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

function log(msg)  { console.log('[compare] ' + msg); }
function warn(msg) { console.log('[compare] WARN: ' + msg); }
function error(msg) { console.error('[compare] ERROR: ' + msg); }

function sha256File(filePath) {
  try {
    var content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (e) {
    return null;
  }
}

function listFiles(dir, baseDir) {
  var results = {};
  if (!fs.existsSync(dir)) return results;
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = path.join(dir, entry.name);
    var relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
        continue;
      }
      var subFiles = listFiles(fullPath, baseDir);
      for (var sf in subFiles) {
        results[sf] = subFiles[sf];
      }
    } else if (entry.isFile()) {
      results[relPath] = sha256File(fullPath);
    }
  }
  return results;
}

function compareRepos(dirA, dirB) {
  // Normalize paths
  var absA = path.resolve(dirA);
  var absB = path.resolve(dirB);

  log('COMPARING: ' + absA);
  log('       VS: ' + absB);

  // List files relative to each directory's root
  var filesA = listFiles(absA, absA);
  var filesB = listFiles(absB, absB);

  var keysA = Object.keys(filesA).sort();
  var keysB = Object.keys(filesB).sort();

  log('Files in A: ' + keysA.length);
  log('Files in B: ' + keysB.length);

  // Find missing and extra
  var missingInB = keysA.filter(function(k) { return !filesB.hasOwnProperty(k); });
  var extraInB = keysB.filter(function(k) { return !filesA.hasOwnProperty(k); });

  // SHA-256 mismatches
  var hashMismatches = [];
  var commonKeys = keysA.filter(function(k) { return filesB.hasOwnProperty(k); });
  for (var i = 0; i < commonKeys.length; i++) {
    var k = commonKeys[i];
    if (filesA[k] !== filesB[k]) {
      hashMismatches.push(k);
    }
  }

  var hasIssue = missingInB.length > 0 || extraInB.length > 0 || hashMismatches.length > 0;

  if (missingInB.length > 0) {
    log('MISSING IN B (' + missingInB.length + '):');
    for (var mi = 0; mi < missingInB.length; mi++) {
      log('  - ' + missingInB[mi]);
    }
  }

  if (extraInB.length > 0) {
    log('EXTRA IN B (' + extraInB.length + '):');
    for (var ei = 0; ei < extraInB.length; ei++) {
      log('  + ' + extraInB[ei]);
    }
  }

  if (hashMismatches.length > 0) {
    log('SHA-256 MISMATCHES (' + hashMismatches.length + '):');
    for (var hi = 0; hi < hashMismatches.length; hi++) {
      log('  ~ ' + hashMismatches[hi]);
    }
  }

  log('Files in A: ' + keysA.length);
  log('Files in B: ' + keysB.length);
  log('SHA-256 mismatch count: ' + hashMismatches.length);

  if (!hasIssue) {
    log('RESULT: PASS — repositories are identical');
    return 0;
  } else {
    log('RESULT: FAIL — repositories differ');
    return 1;
  }
}

function main() {
  var args = process.argv.slice(2);

  if (args.length < 2) {
    error('Usage: node scripts/verify-skill-package-sync.js <path-a> <path-b>');
    error('Example: node scripts/verify-skill-package-sync.js ai-pm-os ../AI_PM_OS_SKILL/ai-pm-os');
    process.exit(2);
  }

  var dirA = args[0];
  var dirB = args[1];

  if (!fs.existsSync(dirA)) {
    error('Path A does not exist: ' + dirA);
    process.exit(2);
  }
  if (!fs.existsSync(dirB)) {
    error('Path B does not exist: ' + dirB);
    process.exit(2);
  }

  var exitCode = compareRepos(dirA, dirB);
  process.exit(exitCode);
}

main();
