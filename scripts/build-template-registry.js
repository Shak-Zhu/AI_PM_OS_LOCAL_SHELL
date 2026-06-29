/**
 * build-template-registry.js
 *
 * 1. Creates 07_DATA/template_registry.json with ALL 60 template files
 * 2. Creates 07_DATA/template_registry.schema.json
 * 3. Adds missing metadata tables to template files (NOT product docs or runtime rules)
 * 4. Exits non-0 on any failure
 *
 * Usage: node scripts/build-template-registry.js
 */

'use strict';

var fs = require('fs');
var path = require('path');

var baseDir = process.cwd();
var DATA_DIR = path.join(baseDir, '07_DATA');

// =============================================================================
// TEMPLATE FILE LIST
// =============================================================================

var ALL_TEMPLATES = [
  // 00_PM_MEMORY — Project Record Templates
  { path: '00_PM_MEMORY/PM_MEMORY_INDEX.md', doc_role: 'Project Record Template', init_behavior: '由 ai-pm-os Skill 在项目初始化时生成' },
  { path: '00_PM_MEMORY/PM_CURRENT_STATUS.md', doc_role: 'Project Record Template', init_behavior: '由 ai-pm-os Skill 在项目初始化后填充' },
  { path: '00_PM_MEMORY/PM_APPROVAL_STATUS.md', doc_role: 'Project Record Template', init_behavior: '由 Project Owner 批准后填充' },
  { path: '00_PM_MEMORY/PM_PENDING_UPDATES.md', doc_role: 'Project Record Template', init_behavior: '由 ai-pm-os Skill 在项目运行中维护，Project Owner 批准后生效' },
  { path: '00_PM_MEMORY/PM_ROLE_CONFIG.md', doc_role: 'Project Record Template', init_behavior: '由 Project Owner 在项目初始化时配置' },
  { path: '00_PM_MEMORY/PM_DOCUMENT_REGISTRY.md', doc_role: 'Project Record Template', init_behavior: '由 ai-pm-os Skill 持续维护' },
  { path: '00_PM_MEMORY/PM_INPUT_LOG.md', doc_role: 'Project Record Template', init_behavior: '由 ai-pm-os Skill 在每次接收输入时记录' },
  { path: '00_PM_MEMORY/PM_ACTIVE_CONTEXT.md', doc_role: 'Project Record Template', init_behavior: '由 ai-pm-os Skill 在每次会话时更新' },
  { path: '00_PM_MEMORY/PM_GAP_ANALYSIS.md', doc_role: 'Project Record Template', init_behavior: '由 ai-pm-os Skill 在 Memory Boot 时生成' },
  { path: '00_PM_MEMORY/PM_REQUIREMENTS_TRACEABILITY.md', doc_role: 'Project Record Template', init_behavior: '由 ai-pm-os Skill 在需求确认时维护' },
  { path: '00_PM_MEMORY/PM_DOCUMENT_INVENTORY.md', doc_role: 'Project Record Template', init_behavior: '由 ai-pm-os Skill 定期更新' },
  { path: '00_PM_MEMORY/PM_DAILY_BRIEFING.md', doc_role: 'Project Record Template', init_behavior: '由 ai-pm-os Skill 在每日启动时生成' },

  // 01_PM_DOCUMENTS — Project Document Templates
  { path: '01_PM_DOCUMENTS/PM_PROJECT_BRIEF.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在项目初始化时生成，Project Owner 填入实际内容' },
  { path: '01_PM_DOCUMENTS/PM_ACTIVE_WBS.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在 Scope Baseline 批准后生成' },
  { path: '01_PM_DOCUMENTS/PM_SCOPE_BASELINE.md', doc_role: 'Project Document Template', init_behavior: '由 Project Owner 在范围评审后填充，Project Owner 批准后生效' },
  { path: '01_PM_DOCUMENTS/PM_SCOPE_MANAGEMENT_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在项目规划时填充' },
  { path: '01_PM_DOCUMENTS/PM_WBS_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在 Scope Baseline 批准后填充' },
  { path: '01_PM_DOCUMENTS/PM_SCHEDULE_BASELINE.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在规划阶段填充' },
  { path: '01_PM_DOCUMENTS/PM_RAID_LOG.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 持续维护' },
  { path: '01_PM_DOCUMENTS/PM_ESTIMATION_LOG.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在估算时填充' },
  { path: '01_PM_DOCUMENTS/PM_COST_BASELINE.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在规划阶段填充' },
  { path: '01_PM_DOCUMENTS/PM_CHANGE_LOG.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在变更获批后填充' },
  { path: '01_PM_DOCUMENTS/PM_DECISION_LOG.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在决策后填充' },
  { path: '01_PM_DOCUMENTS/PM_ACTION_LOG.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在行动项确认后填充' },
  { path: '01_PM_DOCUMENTS/PM_LESSONS_LEARNED.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在阶段结束时填充' },
  { path: '01_PM_DOCUMENTS/PM_RETROSPECTIVE.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在 Sprint 复盘后填充' },
  { path: '01_PM_DOCUMENTS/PM_STAGE_HISTORY.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在阶段结束时生成' },
  { path: '01_PM_DOCUMENTS/PM_STAKEHOLDER_REGISTER.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在项目初始化时填充' },
  { path: '01_PM_DOCUMENTS/PM_STAKEHOLDER_ENGAGEMENT_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在规划阶段填充' },
  { path: '01_PM_DOCUMENTS/PM_COMMUNICATION_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在规划阶段填充' },
  { path: '01_PM_DOCUMENTS/PM_RESOURCE_MANAGEMENT_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在规划阶段填充' },
  { path: '01_PM_DOCUMENTS/PM_QUALITY_MANAGEMENT_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在规划阶段填充' },
  { path: '01_PM_DOCUMENTS/PM_TEST_AND_ACCEPTANCE_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在规划阶段填充' },
  { path: '01_PM_DOCUMENTS/PM_UAT_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在测试规划时填充' },
  { path: '01_PM_DOCUMENTS/PM_ACCEPTANCE_LOG.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在验收时填充' },
  { path: '01_PM_DOCUMENTS/PM_PROCUREMENT_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在采购需求确认时填充' },
  { path: '01_PM_DOCUMENTS/PM_REQUIREMENTS_REGISTER.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在需求收集时维护' },
  { path: '01_PM_DOCUMENTS/PM_REQUIREMENTS_MANAGEMENT_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在规划阶段填充' },
  { path: '01_PM_DOCUMENTS/PM_RELEASE_CHECKLIST.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在发布前填充' },
  { path: '01_PM_DOCUMENTS/PM_CONTROL_SUMMARY.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在项目运行中持续更新' },
  { path: '01_PM_DOCUMENTS/PM_COMPLETION_METRICS.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在阶段结束时生成' },
  { path: '01_PM_DOCUMENTS/PM_CONFIGURATION_MANAGEMENT_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在规划阶段填充' },
  { path: '01_PM_DOCUMENTS/PM_DATA_GOVERNANCE_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在规划阶段填充' },
  { path: '01_PM_DOCUMENTS/PM_DELIVERY_STRATEGY.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在项目启动时填充' },
  { path: '01_PM_DOCUMENTS/PM_JSON_DATA_CONTRACT.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在数据契约定义时填充' },
  { path: '01_PM_DOCUMENTS/PM_BENEFITS_MANAGEMENT_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在收益识别时填充' },
  { path: '01_PM_DOCUMENTS/PM_RISK_MANAGEMENT_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在风险规划时填充' },
  { path: '01_PM_DOCUMENTS/PM_RACI_MATRIX.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在规划阶段填充' },

  // 02_AGILE — Project Document Templates (Agile)
  { path: '02_AGILE/PM_PRODUCT_BACKLOG.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在项目初始化时生成，Project Owner 填入实际需求' },
  { path: '02_AGILE/PM_USER_STORIES.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在需求细化时生成' },
  { path: '02_AGILE/PM_SPRINT_BACKLOG.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在 Sprint Planning 时生成' },
  { path: '02_AGILE/PM_DOR_DOD.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在项目初始化时填充' },
  { path: '02_AGILE/PM_VELOCITY_LOG.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在 Sprint 结束时更新' },
  { path: '02_AGILE/PM_BURNDOWN_DATA.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在 Sprint 期间持续更新' },
  { path: '02_AGILE/PM_SPRINT_PLAN.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在 Sprint Planning 时生成' },
  { path: '02_AGILE/PM_SPRINT_REVIEW.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在 Sprint Review 时生成' },
  { path: '02_AGILE/PM_SPRINT_RETROSPECTIVE.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在 Sprint Retrospective 时生成' },
  { path: '02_AGILE/PM_DAILY_STANDUP_LOG.md', doc_role: 'Project Document Template', init_behavior: '由 ai-pm-os Skill 在每日站会时生成' },
  { path: '02_AGILE/PM_ACCEPTANCE_CRITERIA.md', doc_role: 'Project Document Template', init_behavior: '由 Project Manager 在需求细化时填充' },

  // 03_MEETINGS — Agile Output Templates
  { path: '03_MEETINGS/meeting_index/PM_MEETING_INDEX.md', doc_role: 'Agile Output', init_behavior: '由 ai-pm-os Skill 在每次处理会议材料时更新' },
];

// =============================================================================
// FILES THAT ALREADY HAVE METADATA (skip adding)
// =============================================================================

var ALREADY_HAS_METADATA = {
  '00_PM_MEMORY/PM_MEMORY_INDEX.md': true,
  '00_PM_MEMORY/PM_CURRENT_STATUS.md': true,
  '00_PM_MEMORY/PM_APPROVAL_STATUS.md': true,
  '01_PM_DOCUMENTS/PM_CHANGE_LOG.md': true,
};

// =============================================================================
// METADATA TABLE TEMPLATE
// =============================================================================

function buildMetadataTable(doc_role, init_behavior) {
  return '| doc_role | instance_status | init_behavior | fact_declaration |\n' +
         '|---|---|---|---|\n' +
         '| ' + doc_role + ' | template | ' + init_behavior + ' | 无真实项目数据 |';
}

// =============================================================================
// CHECK IF FILE HAS METADATA IN FIRST 5 LINES
// =============================================================================

function fileHasMetadata(fp) {
  try {
    var content = fs.readFileSync(fp, 'utf8');
    var lines = content.split('\n').slice(0, 5);
    return lines.some(function(l) { return /\|.*doc_role/.test(l); });
  } catch (e) {
    return false;
  }
}

// =============================================================================
// ADD METADATA TABLE TO FILE
// =============================================================================

function addMetadataToFile(fp, doc_role, init_behavior) {
  try {
    var content = fs.readFileSync(fp, 'utf8');
    var lines = content.split('\n');

    // Find insertion point:
    // Skip YAML frontmatter (lines between --- markers), then find first H1 or blank after it
    var insertAfter = -1;
    var inFrontmatter = false;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // YAML frontmatter detection
      if (line.trim() === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true;
        } else {
          // End of frontmatter
          inFrontmatter = false;
          insertAfter = i; // put after the closing ---
          break;
        }
        continue;
      }

      if (!inFrontmatter && insertAfter < 0) {
        insertAfter = i - 1; // will be before this line (blank)
        break;
      }
    }

    if (insertAfter < 0) insertAfter = 0;

    // Build the metadata block
    var metaBlock = buildMetadataTable(doc_role, init_behavior);

    // Insert with blank line before and after for readability
    var newContent = lines.slice(0, insertAfter + 1).join('\n') +
                     '\n\n' + metaBlock + '\n' +
                     lines.slice(insertAfter + 1).join('\n');

    fs.writeFileSync(fp, newContent, 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

// =============================================================================
// VALIDATE FILE IS READABLE
// =============================================================================

function validateFileReadable(fp) {
  try {
    fs.readFileSync(fp, 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

// =============================================================================
// MAIN
// =============================================================================

var errors = [];
var warnings = [];
var filesModified = [];

console.log('=== Template Registry Builder ===');
console.log('Base: ' + baseDir);
console.log('');

// Step 1: Build registry data
var registryTemplates = [];
for (var i = 0; i < ALL_TEMPLATES.length; i++) {
  var t = ALL_TEMPLATES[i];
  var fp = path.join(baseDir, t.path);
  var exists = fs.existsSync(fp);

  if (!exists) {
    errors.push('MISSING_FILE: ' + t.path + ' — file does not exist');
  } else {
    // Verify readable
    if (!validateFileReadable(fp)) {
      errors.push('UNREADABLE: ' + t.path);
    }
  }

  registryTemplates.push({
    path: t.path,
    doc_role: t.doc_role,
    instance_status: 'template',
    init_behavior: t.init_behavior,
    fact_declaration: '无真实项目数据',
    file_exists: exists
  });
}

// Step 2: Add missing metadata tables
for (var j = 0; j < ALL_TEMPLATES.length; j++) {
  var t2 = ALL_TEMPLATES[j];
  var fp2 = path.join(baseDir, t2.path);

  if (!fs.existsSync(fp2)) continue; // already reported as error

  if (ALREADY_HAS_METADATA[t2.path]) {
    // Already confirmed to have metadata
    continue;
  }

  if (fileHasMetadata(fp2)) {
    // Already has metadata
    continue;
  }

  // Add metadata
  if (addMetadataToFile(fp2, t2.doc_role, t2.init_behavior)) {
    filesModified.push(t2.path);
  } else {
    errors.push('FAILED_TO_ADD_METADATA: ' + t2.path);
  }
}

// Step 3: Create template_registry.json
var registry = {
  version: '1.0.0',
  generated_at: new Date().toISOString(),
  generated_by: 'build-template-registry.js',
  total_templates: registryTemplates.length,
  templates: registryTemplates
};

var registryPath = path.join(DATA_DIR, 'template_registry.json');
try {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
  console.log('Created: ' + registryPath);
} catch (e) {
  errors.push('FAILED_TO_WRITE_REGISTRY: ' + e.message);
}

// Step 4: Create template_registry.schema.json
var schema = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  'title': 'template_registry',
  'type': 'object',
  'properties': {
    'version': { 'type': 'string' },
    'generated_at': { 'type': 'string' },
    'generated_by': { 'type': 'string' },
    'total_templates': { 'type': 'number' },
    'templates': {
      'type': 'array',
      'items': {
        'type': 'object',
        'required': ['path', 'doc_role', 'instance_status', 'init_behavior', 'fact_declaration', 'file_exists'],
        'properties': {
          'path': { 'type': 'string' },
          'doc_role': { 'type': 'string' },
          'instance_status': { 'type': 'string' },
          'init_behavior': { 'type': 'string' },
          'fact_declaration': { 'type': 'string' },
          'file_exists': { 'type': 'boolean' }
        }
      }
    }
  }
};

var schemaPath = path.join(DATA_DIR, 'template_registry.schema.json');
try {
  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), 'utf8');
  console.log('Created: ' + schemaPath);
} catch (e) {
  errors.push('FAILED_TO_WRITE_SCHEMA: ' + e.message);
}

// =============================================================================
// REPORT
// =============================================================================

console.log('');
console.log('Templates registered: ' + registryTemplates.length);
console.log('Files with metadata added: ' + filesModified.length);
console.log('Errors: ' + errors.length);
console.log('Warnings: ' + warnings.length);

if (filesModified.length > 0) {
  console.log('');
  console.log('Modified files:');
  for (var k = 0; k < filesModified.length; k++) {
    console.log('  + ' + filesModified[k]);
  }
}

if (errors.length > 0) {
  console.log('');
  console.log('=== ERRORS ===');
  for (var m = 0; m < errors.length; m++) {
    console.log('  ' + errors[m]);
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
