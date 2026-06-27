# AI PM OS - 产品壳清单

- 版本：v0.1
- 状态：Active
- 最后更新：YYYY-MM-DD

## 目的

本文档记录本地 AI 项目管理壳系统的目录结构、文件类别、初始化状态和禁止包含的污染类型。

## 污染定义

以下内容**禁止**作为真实项目数据存在于产品壳中：

1. **真实项目名称**：不得包含具体项目名称
2. **真实项目状态**：不得包含 RAG 状态对应的真实评估
3. **真实审批记录**：不得包含具体审批条目及其状态
4. **真实风险条目**：不得包含具体风险及其描述
5. **真实问题条目**：不得包含具体 Issue 及其描述
6. **真实假设条目**：不得包含具体假设及其描述
7. **真实依赖条目**：不得包含具体依赖及其描述
8. **真实决策记录**：不得包含具体决策条目
9. **真实变更记录**：不得包含具体变更条目
10. **真实待办条目**：不得包含真实 To-do
11. **真实行动项**：不得包含具体行动项
12. **真实估算记录**：不得包含具体估算条目
13. **真实里程碑**：不得包含具体里程碑
14. **真实输入材料**：不得包含具体输入记录
15. **真实会议记录**：不得包含具体会议
16. **真实 Pending Updates**：不得包含具体待审批更新
17. **真实日期戳**：不得包含具体项目日期
18. **真实角色分配**：不得包含具体人员名字作为 Assignee
19. **绝对路径**：不得包含本机绝对路径
20. **外部控制空间引用**：不得包含外部控制空间目录引用

## 允许内容

以下内容**允许**作为模板、占位符或中性数据存在于产品壳中：

- `INITIALIZE_PROJECT`：表示由 ai-pm-os Skill 初始化后填充
- `YYYY-MM-DD`：表示由 ai-pm-os Skill 在运行时填充
- 中性模板结构
- 空的 JSON 数组或 `null` 值

## 目录清单

### `_AI_GLOBAL_MEMORY/`

AI 全局记忆文件夹。存放用户对 AI 的长期工作要求。

| 文件 | 用途 | 初始化状态 |
|---|---|---|
| `AI_SKILL_OPERATING_RULES.md` | ai-pm-os Skill 执行规则 | 模板 |
| `AI_USER_PREFERENCES.md` | 用户长期偏好 | 模板 |
| `AI_NAMING_CONVENTIONS.md` | 全局文件命名规范 | 模板 |
| `AI_PM_OUTPUT_STANDARDS.md` | PM 文档输出标准 | 模板 |
| `AI_REPORTING_RULES.md` | 报告格式规则 | 模板 |
| `AI_MEETING_MINUTES_RULES.md` | 会议纪要生成规则 | 模板 |
| `AI_MEETING_ADVISORY_RULES.md` | 会议建议规则 | 模板 |
| `AI_DASHBOARD_STYLE_RULES.md` | Dashboard 视觉规范 | 模板 |
| `AI_PROJECT_GOVERNANCE_RULES.md` | 项目治理铁律 | 模板 |
| `AI_ESTIMATION_RULES.md` | 估算方法与提醒规则 | 模板 |

### `00_PM_MEMORY/`

项目运行记忆文件夹。

| 文件 | 用途 | 初始化状态 |
|---|---|---|
| `PM_MEMORY_INDEX.md` | 项目记忆总入口 | 模板（带占位符） |
| `PM_CURRENT_STATUS.md` | 当前状态快照 | 模板（带占位符） |
| `PM_APPROVAL_STATUS.md` | 审批状态 | 模板（空条目） |
| `PM_DOCUMENT_REGISTRY.md` | 文档注册表 | 模板（带占位符） |
| `PM_PENDING_UPDATES.md` | 待审批更新 | 模板（空条目） |
| `PM_DAILY_BRIEFING.md` | 每日 Briefing | 模板（带占位符） |
| `PM_ACTIVE_CONTEXT.md` | 当前工作上下文 | 模板（带占位符） |
| `PM_INPUT_LOG.md` | 输入材料日志 | 模板（空条目） |
| `PM_GAP_ANALYSIS.md` | 缺口分析 | 模板（空条目） |
| `PM_REQUIREMENTS_TRACEABILITY.md` | 需求追踪矩阵 | 模板 |
| `PM_ROLE_CONFIG.md` | 角色配置 | 模板（占位符角色） |
| `PM_DOCUMENT_INVENTORY.md` | 文档完整清单 | 模板（带占位符） |

### `01_PM_DOCUMENTS/`

项目管理文档文件夹。

| 文件 | 用途 | 初始化状态 |
|---|---|---|
| `PM_PROJECT_BRIEF.md` | 项目章程 | 模板（带占位符） |
| `PM_REQUIREMENTS_REGISTER.md` | 需求登记册 | 模板（空条目） |
| `PM_SCOPE_BASELINE.md` | 范围基线 | 模板（带占位符） |
| `PM_CONTROL_SUMMARY.md` | 控制摘要 | 模板（带占位符） |
| `PM_RAID_LOG.md` | RAID 日志 | 模板（空条目） |
| `PM_DECISION_LOG.md` | 决策日志 | 模板（空条目） |
| `PM_CHANGE_LOG.md` | 变更日志 | 模板（空条目） |
| `PM_ACTIVE_WBS.md` | 活跃 WBS | 模板（Gate Locked） |
| `PM_STAKEHOLDER_REGISTER.md` | 干系人登记册 | 模板 |
| `PM_RACI_MATRIX.md` | RACI 矩阵 | 模板 |
| `PM_COMMUNICATION_PLAN.md` | 沟通计划 | 模板 |
| `PM_ESTIMATION_LOG.md` | 估算记录 | 模板（空条目） |
| `PM_SCHEDULE_BASELINE.md` | 进度基线 | 模板 |
| `PM_UAT_PLAN.md` | UAT 计划 | 模板（带占位符） |
| `PM_RELEASE_CHECKLIST.md` | 发布检查清单 | 模板 |
| `PM_RETROSPECTIVE.md` | 复盘文档 | 模板 |
| `PM_ACCEPTANCE_LOG.md` | 验收日志 | 模板 |
| `PM_ACTION_LOG.md` | 行动项日志 | 模板（空条目） |
| `PM_BENEFITS_MANAGEMENT_PLAN.md` | 效益管理计划 | 模板 |
| `PM_COMPLETION_METRICS.md` | 完工指标 | 模板 |
| `PM_CONFIGURATION_MANAGEMENT_PLAN.md` | 配置管理计划 | 模板 |
| `PM_COST_BASELINE.md` | 成本基线 | 模板 |
| `PM_DATA_GOVERNANCE_PLAN.md` | 数据治理计划 | 模板 |
| `PM_DELIVERY_STRATEGY.md` | 交付策略 | 模板 |
| `PM_LESSONS_LEARNED.md` | 经验教训 | 模板 |
| `PM_PROCUREMENT_PLAN.md` | 采购计划 | 模板 |
| `PM_QUALITY_MANAGEMENT_PLAN.md` | 质量管理计划 | 模板 |
| `PM_RESOURCE_MANAGEMENT_PLAN.md` | 资源管理计划 | 模板 |
| `PM_RISK_MANAGEMENT_PLAN.md` | 风险管理计划 | 模板 |
| `PM_SCOPE_MANAGEMENT_PLAN.md` | 范围管理计划 | 模板 |
| `PM_STAGE_HISTORY.md` | 阶段历史 | 模板 |
| `PM_STAKEHOLDER_ENGAGEMENT_PLAN.md` | 干系人参与计划 | 模板 |
| `PM_TEST_AND_ACCEPTANCE_PLAN.md` | 测试与验收计划 | 模板 |
| `PM_WBS_PLAN.md` | WBS 计划 | 模板 |

### `02_AGILE/`

敏捷文档文件夹。

| 文件 | 用途 | 初始化状态 |
|---|---|---|
| `PM_PRODUCT_BACKLOG.md` | 产品待办池 | 模板（空条目） |
| `PM_SPRINT_BACKLOG.md` | Sprint 待办 | 模板（空条目） |
| `PM_USER_STORIES.md` | 用户故事 | 模板 |
| `PM_ACCEPTANCE_CRITERIA.md` | 验收标准库 | 模板 |
| `PM_DOR_DOD.md` | DoR / DoD | 模板 |
| `PM_SPRINT_PLAN.md` | Sprint 计划 | 模板 |
| `PM_DAILY_STANDUP_LOG.md` | 每日站会日志 | 模板（空条目） |
| `PM_SPRINT_REVIEW.md` | Sprint 评审 | 模板 |
| `PM_SPRINT_RETROSPECTIVE.md` | Sprint 复盘 | 模板 |
| `PM_BURNDOWN_DATA.md` | 燃尽数据 | 模板 |
| `PM_VELOCITY_LOG.md` | 速度记录 | 模板 |

### `03_MEETINGS/`

会议管理文件夹。

| 路径 | 用途 | 初始化状态 |
|---|---|---|
| `meeting_index/PM_MEETING_INDEX.md` | 会议索引 | 模板（空条目） |
| `agendas/MEETING_AGENDA_TEMPLATE.md` | 会议议程模板 | 模板 |
| `transcripts/README.md` | Transcript 归档说明 | 模板 |
| `meeting_minutes/MEETING_MINUTES_TEMPLATE.md` | 会议纪要模板 | 模板 |
| `meeting_actions/MEETING_ACTIONS_TEMPLATE.md` | 会议行动项模板 | 模板 |
| `meeting_decisions/MEETING_DECISIONS_TEMPLATE.md` | 会议决策模板 | 模板 |
| `extracted_actions/README.md` | 提取行动项说明 | 模板 |

### `04_TODO/`

To-do 管理文件夹。

| 路径 | 用途 | 初始化状态 |
|---|---|---|
| `daily/` | 每日 To-do 文件夹 | 空目录 |
| `archive/README.md` | 归档说明 | 模板 |

### `05_REPORTS/`

报告归档文件夹。

| 路径 | 用途 | 初始化状态 |
|---|---|---|
| `daily/DAILY_REPORT_TEMPLATE.md` | 日报模板 | 模板 |
| `weekly/WEEKLY_REPORT_TEMPLATE.md` | 周报模板 | 模板 |
| `monthly/MONTHLY_REPORT_TEMPLATE.md` | 月报模板 | 模板 |
| `steering_committee/STEERCO_REPORT_TEMPLATE.md` | 管理层报告模板 | 模板 |
| `ppt_html/README.md` | HTML PPT 说明 | 模板 |

### `06_DASHBOARD/`

React/Vite Dashboard（scope_out，不在 WP-001 中实现）。

| 路径 | 用途 | 初始化状态 |
|---|---|---|
| `README.md` | Dashboard 说明 | 模板 |

### `07_DATA/`

JSON 数据主副本文件夹。所有文件初始化为空数组或 null 值。

| 文件 | 用途 | 初始化状态 |
|---|---|---|
| `project_state.json` | 项目总览 | 空/null |
| `scope.json` | 范围数据 | 空/null |
| `milestones.json` | 里程碑数据 | 空数组 |
| `gantt.json` | 甘特图数据 | 空数组 |
| `requirements.json` | 需求数据 | 空数组 |
| `raid.json` | RAID 数据 | 空数组 |
| `actions.json` | 行动项数据 | 空数组 |
| `approvals.json` | 审批数据 | 空数组 |
| `decisions.json` | 决策数据 | 空数组 |
| `changes.json` | 变更数据 | 空数组 |
| `documents.json` | 文档数据 | 空数组 |
| `sprints.json` | Sprint 数据 | 空数组 |
| `backlog.json` | Backlog 数据 | 空数组 |
| `burndown.json` | 燃尽图数据 | 空/null |
| `velocity.json` | 速度数据 | 空数组 |
| `meetings.json` | 会议数据 | 空数组 |
| `meeting_actions.json` | 会议行动项 | 空数组 |
| `meeting_decisions.json` | 会议决策 | 空数组 |
| `progress.json` | 进度数据 | 空/null |
| `estimation.json` | 估算数据 | 空数组 |
| `todo.json` | To-do 数据 | 空数组 |
| `reports.json` | 报告数据 | 空数组 |
| `input_log.json` | 输入日志数据 | 空数组 |
| `daily_briefing.json` | Briefing 数据 | 空/null |
| `dashboard_state.json` | Dashboard 状态 | 空/null |
| `project_roles.json` | 角色数据 | 空数组 |

### `08_INTAKE/`

材料输入归档文件夹。

| 路径 | 用途 | 初始化状态 |
|---|---|---|
| `chat_uploads/README.md` | 对话上传说明 | 模板 |
| `new_materials/README.md` | 新材料说明 | 模板 |
| `transcripts_to_process/README.md` | Transcript 处理说明 | 模板 |
| `imported_docs/README.md` | 导入文档说明 | 模板 |
| `screenshots/README.md` | 截图说明 | 模板 |

### `09_ARCHIVE/`

归档文件夹。

| 路径 | 用途 | 初始化状态 |
|---|---|---|
| `old_versions/README.md` | 旧版本说明 | 模板 |
| `processed_inputs/README.md` | 已处理输入说明 | 模板 |
| `superseded_documents/README.md` | 替代文档说明 | 模板 |
| `closed_reports/README.md` | 已关闭报告说明 | 模板 |

### 项目根目录

| 文件 | 用途 | 初始化状态 |
|---|---|---|
| `AGENTS.md` | Agent 启动规则 | 模板 |
| `README.md` | 项目说明 | 模板 |
| `.gitattributes` | Git 属性 | 模板 |

## 干净壳与 Git 边界

本仓库只交付可复制的项目壳。每次 clone 后，用户应将其初始化为独立项目，
并维护该项目自己的 Git 历史。

### 边界规则

1. 产品壳 Git 只跟踪本清单列出的模板、Skill、脚本、Dashboard 和空数据文件。
2. 新项目不得包含 AI PM OS 产品开发期间的需求、工作包、审查报告或真实项目事实。
3. 未初始化字段必须使用 `INITIALIZE_PROJECT`、`YYYY-MM-DD`、`TBD` 或空数组等占位值。
4. 实际项目内容不得 push 回产品壳模板仓库。

### 发布边界

- 发布物必须来自外层 Git `clone`、`git archive` 或 clean export。
- 不得把未跟踪文件、依赖、构建产物或本机临时文件混入发布包。
- 发布前必须运行 `scripts/check-pollution.js` 验证无污染。

## 污染检查

产品壳必须通过污染检查脚本验证，参见 `scripts/check-pollution.js`。

脚本在以下目录上执行时无输出（已被 skip）：

- `.git/`：Git 元数据
- `node_modules/`：依赖包
- `scripts/`：检查器自身工具代码

`README.md` 允许包含产品名称 "AI PM OS Local Shell" 作为合法标识，不视为开发治理污染。

## 版本历史

| 版本 | 日期 | 说明 |
|---|---|---|
| v0.1 | YYYY-MM-DD | 初始产品壳版本 |
| v0.2 | YYYY-MM-DD | 增加干净壳、Git 与发布边界规则 |
