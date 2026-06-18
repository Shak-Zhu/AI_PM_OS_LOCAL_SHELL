# AI PM OS Local Shell  
# 本地化 AI 项目管理壳系统需求文件 V1.0

文档状态：Draft v1.0  
默认语言：中文  
产品类型：本地项目壳 + Cursor/Codex Skill + Markdown 项目文件 + JSON 可视化同步层 + React/Vite 本地 Dashboard  
主要使用者：项目经理 / PMO / 交付型项目经理 / 敏捷项目负责人  
核心目标：让 AI 帮助用户从 0 启动项目、半路接手项目、自动生成与持续维护项目文件、处理会议 transcript、生成专业会议纪要、生成日报、周报、月报和 HTML PPT、刷新本地可视化 Dashboard，使用户减少手工写文档、做纪要和做汇报的负担，把精力集中在催办、开会、审批、升级和判断上。

---

## 0. 本版新增补强说明

本版本在原 V1.0 需求基础上继续保留全部既定内容，并新增以下关键要求：

1. `ai-pm-os` Skill 的能力、稳定性、执行稳定性、专业性必须作为核心产品能力，不得只做成普通 prompt。
2. Skill 的角色定位必须是资深项目经理，精通 PMP、PRINCE2、APM、敏捷、混合交付、PMO 治理和项目交付方法论。
3. 系统必须具备时间估算提醒和建议能力，能指导用户使用类比估算、参数估算、三点估算、PERT、自下而上估算、专家判断、Planning Poker、Story Point、Velocity 等方法。
4. Skill 不只是记录工具，还必须识别用户提供材料中的缺失、冲突、未覆盖点、未确认事项，并提醒用户补齐。
5. 系统必须增加专门的 To-do 文件夹，每天生成时间戳命名的 To-do 文件，支持用户或 AI 打勾、追踪未完成项、跨日滚动。
6. 系统必须增加日报文件夹，日报按日期命名归档。
7. 周报和月报必须分别存放在独立文件夹，文件名必须包含日期范围。
8. 日报、周报、月报必须由 Skill 的专业报告分支生成，不能只是流水账。
9. 全局文件命名系统必须统一，避免文件名混乱。
10. 用户的材料输入方式以“直接发给 Cursor/Codex 对话框”为主，`INBOX` / `INTAKE` 目录不应被理解为唯一输入方式，而是作为材料归档、暂存、处理记录和可选落盘区域。
11. 每次用户直接在对话框发送文件，Skill 必须记录材料来源、处理状态、是否已进入项目文件、是否已归档。
12. 系统必须内置专业会议纪要生成与管理能力。用户发送 meeting transcript 时，AI 不仅要更新项目文件，还必须直接生成专业会议纪要。
13. 会议纪要必须格式统一、命名统一，文件名必须包含会议时间和会议主题。
14. 每日 Briefing 和 To-do 中，AI 必须主动提出会议建议：建议开什么会、为什么开、邀请谁、会议目标是什么、会议应达成什么结果、会前需要准备什么材料。
15. To-do 必须写得足够详细，不能只写一句“跟进某某”。每条 To-do 必须包含背景、目的、对象、截止时间、输出物、关联项目文件、完成标准。
16. 一旦 AI 生成 Pending Updates，必须立即在对话中向用户确认，不能只静默写入文件。用户批准后才能正式应用更新。

---

## 1. 产品定位

AI PM OS Local Shell 是一个基于本地文件夹的 AI 项目管理工作系统。

它不是 SaaS 平台，不是 Dify 工作流，不是单纯 Chatbot，也不是普通项目管理模板库。

它的核心形态是：

用户复制一个本地项目壳文件夹，用 Cursor 或 Codex 打开，通过一个统一 Skill `ai-pm-os` 调用 AI。AI 根据用户输入的项目材料、会议 transcript、旧项目文件、聊天记录、需求说明、日报素材、To-do 完成情况等内容，自动创建、更新、维护项目管理文件，并同步本地 JSON 数据，使 React/Vite Dashboard 自动展示项目状态、范围、进度、风险、Action、审批、Sprint、Backlog、甘特图、敏捷图表和文档健康度。

产品本质是：

本地项目文件系统 + AI 项目管理规则 + 自动文档治理 + 专业项目控制 + 会议纪要管理 + 可视化驾驶舱。

---

## 2. 核心原则

### 2.1 本地优先

所有项目资料默认存在本地项目文件夹中。  
每个项目一个独立文件夹。  
用户可以复制项目壳生成新项目。  
Cursor / Codex 直接读取、创建、修改本地文件。

### 2.2 一个 Skill 总控

系统只开发一个 Skill：

`ai-pm-os`

不拆成多个 Skill。  
这个 Skill 内部包含项目初始化、材料处理、会议处理、会议纪要生成、会议建议、审批应用、每日 briefing、To-do 管理、日报、周报、月报、Dashboard 刷新、敏捷管理、项目接管、项目审计、估算建议、缺口识别等所有能力。

用户不需要记多个 Skill，只需要调用一个统一入口。

### 2.3 Skill 必须专业、稳定、可重复执行

`ai-pm-os` Skill 是系统成败关键。

它不能只是一个“提示词集合”，而必须是一个稳定、严格、可重复执行的项目管理操作规程。

Skill 必须满足：

执行前固定读取规则文件。  
执行中遵守审批和变更边界。  
执行后更新项目状态、文档注册表、JSON 数据和 Dashboard 数据。  
关键文件不直接覆盖。  
输出必须结构化。  
不得遗漏必要检查。  
不得每次改变文件命名和目录结构。  
不得随意重写 Dashboard 组件。  
不得编造项目事实。  
不得把未确认事项写成已确认决策。  
不得把会议 transcript 只当作普通文本总结，必须按 PM 专业逻辑提取会议结论、行动项、风险、决策、变更、依赖和待确认事项。

Skill 的行为必须像一个资深项目经理，而不是普通写作助手。

### 2.4 Skill 专业基线

Skill 必须具备以下专业能力：

PMP 项目管理知识体系。  
PRINCE2 项目治理方法。  
APM 项目管理方法论。  
PMO 治理逻辑。  
传统预测型项目管理。  
敏捷 Scrum / Kanban / 混合交付。  
需求管理。  
范围管理。  
进度管理。  
成本和资源意识。  
风险管理。  
问题管理。  
决策管理。  
变更控制。  
干系人管理。  
沟通管理。  
会议管理。  
会议纪要管理。  
质量和验收管理。  
UAT 和上线管理。  
项目汇报。  
项目复盘。  
项目接管。  
项目审计。  

Skill 的输出必须体现资深 PM 的判断，而不只是机械记录。

### 2.5 Markdown 是正式文件

项目正式文件以 Markdown 为准。

例如：

`PM_SCOPE_BASELINE.md` 是正式范围基线。  
`PM_DECISION_LOG.md` 是正式决策记录。  
`PM_CHANGE_LOG.md` 是正式变更记录。  
`PM_RAID_LOG.md` 是正式风险 / 假设 / 问题 / 依赖日志。  
`PM_ACTIVE_WBS.md` 是正式活跃工作包文件。  
`PM_DAILY_REPORT.md`、`PM_WEEKLY_REPORT.md`、`PM_MONTHLY_REPORT.md` 是正式报告输出。  
`MEETING_MINUTES` 文件是正式会议纪要输出。

### 2.6 JSON 是可视化同步层

Dashboard 不直接读取 Markdown。  
Dashboard 读取本地 JSON 数据。

Markdown 代表正式项目文档。  
JSON 代表图表和看板的数据源。  
每次 AI 更新项目文件后，必须同步更新对应 JSON。

如果 Markdown 与 JSON 冲突，默认 Markdown 为准，并要求 AI 执行一致性检查。

### 2.7 Dashboard 组件预置，数据驱动

第一版 Dashboard 必须可运行。  
所有图表组件提前写好。  
AI 不应每次临时重写图表。  
AI 只更新数据文件，图表自动变化。

### 2.8 Pending Updates 机制

AI 不应直接覆盖关键正式文件。  
新材料、会议 transcript、聊天记录、需求变化等输入，必须先生成 `PM_PENDING_UPDATES.md`。

用户审核后，AI 才能应用更新。

关键文件必须走 Pending Updates：

- `PM_PROJECT_BRIEF.md`
- `PM_REQUIREMENTS_REGISTER.md`
- `PM_SCOPE_BASELINE.md`
- `PM_RAID_LOG.md`
- `PM_DECISION_LOG.md`
- `PM_CHANGE_LOG.md`
- `PM_ACTIVE_WBS.md`
- `PM_SCHEDULE_BASELINE.md`
- `PM_ESTIMATION_LOG.md`
- `PM_PRODUCT_BACKLOG.md`
- `PM_SPRINT_BACKLOG.md`

### 2.9 Pending Updates 必须立即对话确认

当 AI 从材料、会议 transcript 或用户输入中生成 Pending Updates 后，必须立即在对话中向用户展示摘要并请求确认。

不得只写入文件而不提示用户。

AI 必须在对话中输出：

本次识别到多少条 Pending Updates。  
每条 Pending Update 的编号。  
更新对象。  
更新原因。  
是否影响范围、时间、风险、审批或 Sprint。  
哪些更新建议直接应用。  
哪些更新必须用户批准。  
哪些更新需要进一步确认。  

用户明确批准后，AI 才能应用更新。

示例：

“本次会议 transcript 已生成 7 条 Pending Updates：PU-001 至 PU-007。其中 PU-002 涉及 Scope Baseline，PU-004 涉及 Decision Log，PU-006 涉及 Change Log。请确认是否批准应用。”

### 2.10 Git 版本控制

项目壳必须使用 Git。  
每次重大更新前后都应建立 commit。  
AI 应在应用关键更新前创建 checkpoint，更新后提交 commit，保证可追溯和可回滚。

### 2.11 默认中文

所有项目文件、Dashboard 文案、会议纪要、日报、周报、月报和 HTML PPT 默认使用中文。  
后续可以扩展英文输出，但 V1 默认中文。

### 2.12 敏捷支持必须完整

系统不只支持传统项目管理，也必须完整支持敏捷管理。

包括：

- Product Backlog
- Sprint Backlog
- User Stories
- Acceptance Criteria
- Story Point
- Definition of Ready
- Definition of Done
- Sprint Planning
- Daily Standup Log
- Sprint Review
- Sprint Retrospective
- Burndown Chart
- Velocity Chart
- Carry-over Items
- Blocked Items

推荐交付模式是 Hybrid：

上层用 PMO / PMP / PRINCE2 / APM 文件治理范围、风险、决策和变更。  
下层用 Agile 管理 Sprint、Backlog、User Story 和迭代交付。

### 2.13 AI 不只是记录员

Skill 必须具备主动审查能力。

当用户提供材料时，AI 不仅要记录，还要识别：

项目目标是否不清。  
需求是否缺验收标准。  
范围是否没有明确“不做什么”。  
时间估算是否缺失。  
里程碑是否缺 owner。  
Action 是否缺 due date。  
风险是否缺 mitigation。  
决策是否未确认。  
变更是否绕过审批。  
Sprint Backlog 是否和 Scope 冲突。  
周报是否缺少风险和决策请求。  
会议是否应该召开但尚未安排。  
会议是否缺少明确目标和参会人。  
Dashboard 是否和 Markdown 不一致。  
今天 To-do 是否未完成。  
日报是否缺失。  
周报/月报是否未按周期生成。  

AI 必须告诉用户缺什么、为什么这是问题、会影响什么、建议怎么补。

---

## 3. 目标用户与使用场景

### 3.1 目标用户

主要用户是：

项目经理  
PMO  
交付型项目经理  
AI 项目交付负责人  
敏捷项目负责人  
需要半路接手项目的人  
不想手工写大量项目文件、会议纪要、日报、周报、月报和 PPT 的项目管理人员

### 3.2 用户真实痛点

用户当前痛点包括：

不知道项目开始时需要哪些文件。  
不知道项目文件怎么写。  
不知道会议 transcript 应该如何转化为专业会议纪要、Action、Risk、Decision、Change。  
不知道会议纪要应该怎么写、怎么命名、怎么归档。  
不知道什么时候该开会、该拉谁开会、会议应该达成什么结果。  
不知道如何估算任务时间和项目进度。  
不知道如何判断当前计划是否现实。  
不知道半路接手项目时应该如何整理已有文件。  
不知道如何保持项目文件持续更新。  
不知道如何快速生成日报、周报、月报和领导汇报。  
不知道如何做项目可视化。  
担心 Cursor / Codex 上下文限制导致 AI 忘记项目状态。  
担心多个项目之间规则不一致。  
担心 AI 直接改错正式文件。  
担心范围没批准就开始拆 WBS 或派工。  
担心自己每天不知道该催谁、该升级什么、该审什么。  
担心 To-do 做漏了没有人提醒。  
担心文件命名混乱，时间久了找不到材料。  
担心直接在对话框发给 Cursor/Codex 的材料没有被系统记录和归档。

### 3.3 目标体验

用户希望未来的使用方式是：

复制一个项目壳文件夹。  
用 Cursor / Codex 打开。  
调用一个 Skill：`ai-pm-os`。  
把项目材料、会议 transcript、聊天记录、旧文件、日报素材、To-do 完成情况丢给 AI。  
AI 自动创建和更新项目文件。  
AI 自动生成专业会议纪要。  
AI 自动生成待审批更新。  
AI 自动识别缺失项和风险项。  
AI 自动建议时间估算方式和进度控制方法。  
AI 自动建议需要开什么会、为什么开、拉谁参加、会议目标是什么。  
AI 自动生成每日 To-do。  
用户或 AI 对 To-do 打勾。  
AI 识别未完成 To-do 并滚动到后续日期。  
每天早上新开窗口问 AI：今天我该做什么。  
需要日报、周报、月报和 HTML PPT 时，给日期范围，AI 自动生成。  
本地 Dashboard 自动展示项目状态、进度、范围、风险、Action、Sprint、Backlog、审批、会议、To-do 和文档健康度。

---

## 4. 产品范围

### 4.1 V1 必须做

V1 必须交付以下能力：

本地项目壳文件夹结构。  
一个统一 Skill：`ai-pm-os`。  
全量 PM 文档模板。  
全量敏捷文档模板。  
AI 全局记忆文件夹。  
项目记忆文件夹。  
Markdown 正式项目文件。  
JSON 可视化同步层。  
React / Vite 本地 Dashboard。  
甘特图。  
项目进度图。  
风险图。  
Action 表。  
审批中心。  
Sprint Dashboard。  
Backlog Dashboard。  
燃尽图。  
Velocity 图。  
会议管理页面或会议数据展示。  
文档健康度。  
会议 transcript 处理。  
专业会议纪要生成。  
会议纪要归档管理。  
每日会议建议。  
对话框直接发文件的处理与归档记录机制。  
Pending Updates。  
Pending Updates 对话确认。  
每日 To-do 文件。  
日报生成与归档。  
周报生成与归档。  
月报生成与归档。  
HTML 报告。  
HTML PPT。  
每日 PM Briefing。  
项目接管模式。  
PM Audit 审计模式。  
时间估算建议与估算记录。  
缺口识别和文件覆盖检查。  
Git 版本控制。  

### 4.2 V1 暂不做

V1 不做以下能力：

云端 SaaS。  
多人实时协作。  
账号登录系统。  
权限管理系统。  
在线数据库。  
Dify 工作流。  
Webhook 自动触发。  
Telegram / 邮件主动推送。  
网页内直接编辑全部项目文件。  
网页内完成正式审批流。  
复杂企业资源负载管理。  
自动替用户做最终决策。  
自动绕过用户审批修改基线文件。

### 4.3 后续可扩展

后续可以扩展：

Dify。  
Watchdog。  
Telegram / 飞书提醒。  
数据库版本。  
云端同步。  
多项目组合管理。  
PPTX 导出。  
PDF 导出。  
DOCX 导出。  
Jira / Trello / Notion / 飞书集成。  
网页端审批。  
多人协作权限。  
资源负载图。  
预算和成本管理。  

---

## 5. 项目壳目录结构

每个项目使用统一目录结构。

```text id="b3uj8x"
PROJECT_NAME/
│
├── _AI_GLOBAL_MEMORY/
│   ├── AI_USER_PREFERENCES.md
│   ├── AI_PM_OUTPUT_STANDARDS.md
│   ├── AI_REPORTING_RULES.md
│   ├── AI_MEETING_MINUTES_RULES.md
│   ├── AI_MEETING_ADVISORY_RULES.md
│   ├── AI_DASHBOARD_STYLE_RULES.md
│   ├── AI_PROJECT_GOVERNANCE_RULES.md
│   ├── AI_ESTIMATION_RULES.md
│   ├── AI_NAMING_CONVENTIONS.md
│   └── AI_SKILL_OPERATING_RULES.md
│
├── 00_PM_MEMORY/
│   ├── PM_MEMORY_INDEX.md
│   ├── PM_CURRENT_STATUS.md
│   ├── PM_APPROVAL_STATUS.md
│   ├── PM_DOCUMENT_REGISTRY.md
│   ├── PM_PENDING_UPDATES.md
│   ├── PM_DAILY_BRIEFING.md
│   ├── PM_ACTIVE_CONTEXT.md
│   ├── PM_INPUT_LOG.md
│   └── PM_GAP_ANALYSIS.md
│
├── 01_PM_DOCUMENTS/
│   ├── PM_PROJECT_BRIEF.md
│   ├── PM_REQUIREMENTS_REGISTER.md
│   ├── PM_SCOPE_BASELINE.md
│   ├── PM_CONTROL_SUMMARY.md
│   ├── PM_RAID_LOG.md
│   ├── PM_DECISION_LOG.md
│   ├── PM_CHANGE_LOG.md
│   ├── PM_ACTIVE_WBS.md
│   ├── PM_STAKEHOLDER_REGISTER.md
│   ├── PM_RACI_MATRIX.md
│   ├── PM_COMMUNICATION_PLAN.md
│   ├── PM_ESTIMATION_LOG.md
│   ├── PM_SCHEDULE_BASELINE.md
│   ├── PM_UAT_PLAN.md
│   ├── PM_RELEASE_CHECKLIST.md
│   └── PM_RETROSPECTIVE.md
│
├── 02_AGILE/
│   ├── PM_PRODUCT_BACKLOG.md
│   ├── PM_SPRINT_BACKLOG.md
│   ├── PM_USER_STORIES.md
│   ├── PM_ACCEPTANCE_CRITERIA.md
│   ├── PM_DOR_DOD.md
│   ├── PM_SPRINT_PLAN.md
│   ├── PM_DAILY_STANDUP_LOG.md
│   ├── PM_SPRINT_REVIEW.md
│   ├── PM_SPRINT_RETROSPECTIVE.md
│   ├── PM_BURNDOWN_DATA.md
│   └── PM_VELOCITY_LOG.md
│
├── 03_MEETINGS/
│   ├── meeting_index/
│   ├── agendas/
│   ├── transcripts/
│   ├── meeting_minutes/
│   ├── meeting_actions/
│   ├── meeting_decisions/
│   └── extracted_actions/
│
├── 04_TODO/
│   ├── daily/
│   └── archive/
│
├── 05_REPORTS/
│   ├── daily/
│   ├── weekly/
│   ├── monthly/
│   ├── steering_committee/
│   └── ppt_html/
│
├── 06_DASHBOARD/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   └── public/
│       └── data/
│
├── 07_DATA/
│   ├── project_state.json
│   ├── scope.json
│   ├── milestones.json
│   ├── gantt.json
│   ├── requirements.json
│   ├── raid.json
│   ├── actions.json
│   ├── approvals.json
│   ├── decisions.json
│   ├── changes.json
│   ├── documents.json
│   ├── sprints.json
│   ├── backlog.json
│   ├── burndown.json
│   ├── velocity.json
│   ├── meetings.json
│   ├── meeting_actions.json
│   ├── meeting_decisions.json
│   ├── progress.json
│   ├── estimation.json
│   ├── todo.json
│   ├── reports.json
│   ├── input_log.json
│   ├── daily_briefing.json
│   └── dashboard_state.json
│
├── 08_INTAKE/
│   ├── chat_uploads/
│   ├── new_materials/
│   ├── transcripts_to_process/
│   ├── imported_docs/
│   └── screenshots/
│
├── 09_ARCHIVE/
│   ├── old_versions/
│   ├── processed_inputs/
│   ├── superseded_documents/
│   └── closed_reports/
│
├── AGENTS.md
├── README.md
└── .git/
```

---

## 6. 对话框直接发文件的处理机制

### 6.1 基本原则

用户主要通过 Cursor / Codex 对话框直接发送文件、截图、文本、transcript 或材料。

因此系统不能假设所有输入都先存在 `08_INTAKE/` 中。

`08_INTAKE/` 的定位是：

材料归档区。  
处理暂存区。  
输入记录区。  
可选落盘区。  
不是唯一输入入口。

### 6.2 Skill 处理对话框文件的要求

当用户直接在对话框发送文件时，Skill 必须：

识别本次输入材料。  
判断材料类型。  
记录材料名称。  
记录材料来源为 Chat Upload / Direct Chat Input。  
记录处理日期时间。  
记录是否已用于更新项目文件。  
记录是否已归档到 `08_INTAKE/`。  
必要时生成摘要。  
必要时生成 Pending Updates。  
必要时生成会议纪要。  
必要时提醒用户该材料是否缺失上下文。

### 6.3 PM_INPUT_LOG.md

系统必须维护：

`00_PM_MEMORY/PM_INPUT_LOG.md`

用于记录所有输入材料。

字段包括：

Input ID  
Input DateTime  
Input Type  
Original Name  
Source：Chat Upload / Manual Text / Local File / Transcript  
Related Project Area  
Processed Status  
Generated Pending Updates  
Generated Meeting Minutes  
Archived Path  
Notes  

### 6.4 input_log.json

系统必须同步维护：

`07_DATA/input_log.json`

用于 Dashboard 和审计。

### 6.5 文件归档规则

如果 Cursor / Codex 能访问到用户上传文件，应将副本或提取后的文本放入：

`08_INTAKE/chat_uploads/YYYY-MM-DD_HHMM_<short_name>/`

如果不能直接保存原文件，也必须在 `PM_INPUT_LOG.md` 中记录：

该文件由用户在对话框直接提供。  
本轮已处理。  
是否生成项目更新。  
是否生成会议纪要。  
是否需要用户后续手动放入项目目录。  

---

## 7. AI 全局记忆文件夹

### 7.1 作用

`_AI_GLOBAL_MEMORY/` 存放用户对 AI 的长期工作要求。

它不属于某一个具体项目的业务事实，而是记录用户希望 AI 每次如何工作。

例如：

周报必须包含哪些部分。  
会议纪要必须提取哪些字段。  
会议建议必须包含哪些内容。  
项目文件必须如何更新。  
Dashboard 要如何展示。  
敏捷内容必须包含哪些。  
估算时必须提醒用户使用哪些方法。  
所有 Action 必须有 owner、due date、status、next step。  
所有 Risk 必须有 impact、owner、mitigation、review date。  
任何 Scope Baseline 未批准不得拆 WBS。  
所有回答必须尽量引用项目文件和条目编号。  
所有文件命名必须遵守统一规范。  

### 7.2 文件说明

`AI_USER_PREFERENCES.md`  
记录用户长期偏好。

`AI_PM_OUTPUT_STANDARDS.md`  
记录所有 PM 文档输出标准。

`AI_REPORTING_RULES.md`  
记录日报、周报、月报、领导汇报、HTML PPT 的格式要求。

`AI_MEETING_MINUTES_RULES.md`  
记录会议 transcript 处理和会议纪要生成规则。

`AI_MEETING_ADVISORY_RULES.md`  
记录会议建议规则，包括什么时候建议开会、会议目标、参会人、会议输出、会前准备。

`AI_DASHBOARD_STYLE_RULES.md`  
记录 Dashboard 视觉和组件规范。

`AI_PROJECT_GOVERNANCE_RULES.md`  
记录项目治理铁律，如范围、变更、审批、RAID、决策。

`AI_ESTIMATION_RULES.md`  
记录时间估算、工期估算、敏捷估算、缓冲估算和进度判断规则。

`AI_NAMING_CONVENTIONS.md`  
记录全局文件命名规范、ID 命名规范和报告命名规范。

`AI_SKILL_OPERATING_RULES.md`  
记录 `ai-pm-os` Skill 的执行规则。

---

## 8. 项目记忆文件夹

### 8.1 作用

`00_PM_MEMORY/` 存放当前项目的运行记忆。

它用于解决 Cursor / Codex 上下文限制。  
每次 AI 工作前，必须先读取该目录核心文件。

### 8.2 必读文件

每次 AI 处理项目时，必须先读取：

`_AI_GLOBAL_MEMORY/AI_SKILL_OPERATING_RULES.md`  
`_AI_GLOBAL_MEMORY/AI_USER_PREFERENCES.md`  
`_AI_GLOBAL_MEMORY/AI_NAMING_CONVENTIONS.md`  
`_AI_GLOBAL_MEMORY/AI_MEETING_MINUTES_RULES.md`  
`_AI_GLOBAL_MEMORY/AI_MEETING_ADVISORY_RULES.md`  
`00_PM_MEMORY/PM_MEMORY_INDEX.md`  
`00_PM_MEMORY/PM_CURRENT_STATUS.md`  
`00_PM_MEMORY/PM_APPROVAL_STATUS.md`  
`00_PM_MEMORY/PM_DOCUMENT_REGISTRY.md`  
`00_PM_MEMORY/PM_INPUT_LOG.md`

### 8.3 文件说明

`PM_MEMORY_INDEX.md`  
当前项目所有 PM 文件、敏捷文件、会议文件、数据文件和报告文件的总入口。

`PM_CURRENT_STATUS.md`  
当前项目状态快照。记录阶段、状态、阻塞、下一步、基线版本、待审批事项、会议建议和 To-do 状态。

`PM_APPROVAL_STATUS.md`  
记录所有关键文件和更新的审批状态。

`PM_DOCUMENT_REGISTRY.md`  
记录所有项目文档状态、版本、最后更新时间、是否需要审批。

`PM_PENDING_UPDATES.md`  
记录 AI 根据材料、会议、聊天、旧文件生成的待审批更新。

`PM_DAILY_BRIEFING.md`  
每日 Briefing 输出文件。

`PM_ACTIVE_CONTEXT.md`  
记录当前 AI 正在处理的工作上下文，避免多窗口混乱。

`PM_INPUT_LOG.md`  
记录所有输入材料，包括对话框直接上传、文本输入、transcript、旧项目文件等。

`PM_GAP_ANALYSIS.md`  
记录 AI 发现的缺失、冲突、未覆盖范围、未确认事项和建议补齐动作。

---

## 9. 核心 PM 文件要求

### 9.1 PM_PROJECT_BRIEF.md

项目章程 / 项目简报。

必须说明：

项目目标。  
业务背景。  
一期 MVP 交付物。  
主要约束。  
角色边界。  
技术方向。  
验收口径。  
关键风险。  

状态：初始为 Draft v0.1 / Pending PM Review。

### 9.2 PM_REQUIREMENTS_REGISTER.md

需求登记册。

所有需求必须拆成可追踪条目，例如：

REQ-001  
REQ-002  
REQ-003

每条需求必须包含：

Req ID  
需求描述  
优先级 P0 / P1 / P2  
是否纳入一期  
验收标准  
依赖  
风险  
负责人  
来源  
创建日期  
状态  

### 9.3 PM_SCOPE_BASELINE.md

一期范围基线。

必须明确：

一期做什么。  
一期不做什么。  
新增范围如何走变更。  
Scope Baseline 是否批准。  
批准人。  
批准时间。  
当前版本。  

规则：

Scope Baseline 未批准前，不得创建正式 WBS，不得创建正式 Coder Work Package。

### 9.4 PM_CONTROL_SUMMARY.md

控制摘要。

记录：

关键决策。  
关键风险。  
关键限制。  
待确认事项。  
技术约束。  
成本约束。  
AI 调用上限。  
存储限制。  
OCR 是否后移。  
数据保留策略。  
估算假设。  
当前计划可信度。  
会议控制重点。  
近期需要召开的关键会议。  

### 9.5 PM_RAID_LOG.md

风险 / 假设 / 问题 / 依赖日志。

每条记录必须包含：

ID  
Type：Risk / Assumption / Issue / Dependency  
Description  
Impact  
Severity  
Owner  
Due Date / Review Date  
Status  
Next Step  
Source  
Last Updated  

### 9.6 PM_DECISION_LOG.md

决策记录。

只记录已经明确确认的决策。

每条决策必须包含：

Decision ID  
Decision  
Rationale  
Date  
Owner  
Impact  
Source  
Status  

未确认事项不得写入 Decision Log，只能放入 Pending Decision、RAID 或 Control Summary。

### 9.7 PM_CHANGE_LOG.md

变更记录。

项目初期可以为空，但必须建立。

每条变更必须包含：

Change ID  
Request  
Requested By  
Reason  
Impact on Scope  
Impact on Timeline  
Impact on Resource  
Impact on Testing  
Impact on Risk  
Decision  
Approved By  
Date  

规则：

Scope Baseline 批准后，任何新增范围必须进入 Change Log。

### 9.8 PM_CURRENT_STATUS.md

当前状态快照。

必须让用户在 30 秒内知道：

项目当前阶段。  
RAG 状态。  
Scope Baseline 状态。  
当前阻塞项。  
下一个动作。  
待审批文件。  
当前 Sprint。  
最新会议。  
最新重大风险。  
下一步建议。  
今日 To-do 是否已生成。  
最近日报是否已生成。  
周报/月报是否到期。  
近期建议召开的会议。  
最近会议纪要是否已生成。  

### 9.9 PM_MEMORY_INDEX.md

项目记忆索引。

所有 PM 文件、敏捷文件、会议文件、报告文件的入口。

必须说明：

文件名。  
文件作用。  
当前状态。  
最后更新时间。  
是否需要优先阅读。  

### 9.10 PM_ACTIVE_WBS.md

活跃工作包列表。

初始状态：

“暂无进行中工作包，等待 Scope Baseline 批准。”

规则：

Scope Baseline 未批准，不得生成正式 WBS。

### 9.11 PM_ESTIMATION_LOG.md

估算记录。

用于记录时间估算、工作量估算、敏捷估算和估算依据。

每条估算必须包含：

Estimate ID  
Work Item / Requirement / User Story  
Estimate Method  
Estimate Value  
Unit：hours / days / story points  
Confidence Level  
Assumptions  
Risks  
Estimator  
Date  
Review Needed  
Linked Requirement / WBS / Story  

支持方法：

专家判断。  
类比估算。  
参数估算。  
三点估算。  
PERT。  
自下而上估算。  
Planning Poker。  
Story Point。  
Velocity based forecasting。  
历史数据估算。  

### 9.12 PM_SCHEDULE_BASELINE.md

进度基线。

用于记录项目计划时间线、里程碑、关键路径、缓冲、计划批准状态。

必须包含：

计划开始日期。  
计划结束日期。  
关键里程碑。  
关键依赖。  
关键路径。  
估算依据。  
缓冲时间。  
审批状态。  
当前偏差。  
下一次复核日期。  

---

## 10. 时间估算与进度估算需求

### 10.1 Skill 必须主动提醒估算缺失

当项目出现以下情况时，Skill 必须提醒用户做估算：

需求已进入一期但没有工期估算。  
WBS 已拆分但没有工作包估算。  
Sprint Backlog 已确定但没有 Story Point。  
里程碑已设置但缺少估算依据。  
Action due date 是随便写的，没有估算来源。  
计划上线日期存在但没有关键路径分析。  
风险可能影响工期但没有缓冲。  

### 10.2 Skill 必须建议估算方法

Skill 应根据场景建议估算方法：

需求模糊时：建议专家判断 + 类比估算。  
有历史数据时：建议参数估算或历史数据估算。  
工作包明确时：建议自下而上估算。  
不确定性高时：建议三点估算 / PERT。  
敏捷 Sprint 时：建议 Story Point + Planning Poker。  
已有多个 Sprint 后：建议 Velocity based forecasting。  
上线时间固定时：建议倒排计划 + 关键路径 + 缓冲。  

### 10.3 Skill 必须输出估算提醒

当发现缺估算时，AI 必须输出：

缺少哪个估算。  
为什么这是问题。  
会影响什么。  
建议使用哪种估算方法。  
需要谁参与估算。  
估算结果应更新到哪个文件。  

例如：

“REQ-004 已纳入一期，但没有工期估算和验收复杂度判断。建议使用三点估算：乐观、最可能、悲观，并记录到 `PM_ESTIMATION_LOG.md`。若该需求进入 Sprint，还需在 `PM_PRODUCT_BACKLOG.md` 中补充 Story Point。”

---

## 11. 缺口识别与覆盖检查

### 11.1 Skill 必须执行 Gap Analysis

Skill 不只是记录材料，还要识别项目管理缺口。

### 11.2 常见缺口类型

目标缺失。  
范围缺失。  
Out of Scope 缺失。  
需求缺验收标准。  
需求缺 owner。  
需求缺优先级。  
需求缺估算。  
风险缺 owner。  
风险缺 mitigation。  
Issue 缺 next step。  
Action 缺 due date。  
Decision 未确认。  
Change 未审批。  
Stakeholder 未登记。  
RACI 未明确。  
沟通节奏未定义。  
会议节奏未定义。  
关键会议缺失。  
会议缺目标。  
会议缺参会人。  
会议缺决策输出。  
会议纪要未生成。  
UAT 计划缺失。  
上线检查清单缺失。  
Sprint 缺目标。  
Backlog 缺 Story Point。  
To-do 未完成。  
日报未生成。  
周报/月报缺失。  
Dashboard 数据未同步。  

### 11.3 PM_GAP_ANALYSIS.md

所有缺口必须写入：

`00_PM_MEMORY/PM_GAP_ANALYSIS.md`

字段：

Gap ID  
Gap Type  
Description  
Why It Matters  
Impact  
Suggested Fix  
Related File  
Owner  
Due Date  
Status  

### 11.4 Gap 不等于自动修改

AI 发现缺口后，不应直接替用户做假设。  
应生成建议，必要时进入 Pending Updates。

---

## 12. 会议纪要生成与管理需求

### 12.1 会议 transcript 处理原则

当用户发送 meeting transcript 时，AI 必须同时完成两类工作：

第一，生成专业会议纪要。  
第二，提取项目更新建议并生成 Pending Updates。

不能只更新项目文件，也不能只生成会议纪要。

### 12.2 会议纪要必须专业化

会议纪要必须体现专业项目经理能力，不能只是流水账。

会议纪要必须从 PMP、PRINCE2、APM、敏捷和 PMO 治理角度提取：

会议目标。  
会议背景。  
关键讨论。  
关键决策。  
行动项。  
风险与问题。  
依赖。  
范围影响。  
进度影响。  
成本 / 资源影响。  
质量 / UAT / 上线影响。  
变更请求。  
待确认事项。  
升级事项。  
下次会议建议。  

### 12.3 会议纪要命名规则

会议纪要文件命名格式：

`YYYY-MM-DD_HHMM_MEETING_MINUTES_<topic>.md`

例如：

`2026-06-18_1430_MEETING_MINUTES_AI_MVP_SCOPE_REVIEW.md`

会议 transcript 文件命名格式：

`YYYY-MM-DD_HHMM_TRANSCRIPT_<topic>.md`

会议议程文件命名格式：

`YYYY-MM-DD_HHMM_MEETING_AGENDA_<topic>.md`

会议行动项文件命名格式：

`YYYY-MM-DD_HHMM_MEETING_ACTIONS_<topic>.md`

会议决策摘要文件命名格式：

`YYYY-MM-DD_HHMM_MEETING_DECISIONS_<topic>.md`

### 12.4 会议纪要存放位置

会议纪要存放：

`03_MEETINGS/meeting_minutes/`

会议 transcript 存放：

`03_MEETINGS/transcripts/`

会议议程存放：

`03_MEETINGS/agendas/`

会议行动项摘要存放：

`03_MEETINGS/meeting_actions/`

会议决策摘要存放：

`03_MEETINGS/meeting_decisions/`

会议索引存放：

`03_MEETINGS/meeting_index/`

### 12.5 会议纪要模板

每份会议纪要必须包含：

会议标题。  
会议时间。  
会议主题。  
项目名称。  
会议类型。  
主持人。  
参会人。  
缺席人。  
会议背景。  
会议目标。  
讨论摘要。  
关键结论。  
已确认决策。  
未确认事项。  
Action Items。  
风险 / Issue / Dependency。  
Scope 影响。  
Schedule 影响。  
Sprint / Backlog 影响。  
Change Request。  
需要升级事项。  
下次会议建议。  
关联文件。  
生成来源。  

### 12.6 会议类型

Skill 应识别或建议会议类型：

Kick-off Meeting  
Scope Review Meeting  
Requirements Review Meeting  
Risk Review Meeting  
Sprint Planning  
Daily Standup  
Sprint Review  
Sprint Retrospective  
UAT Review  
Release Readiness Review  
Steering Committee  
Decision Meeting  
Issue Resolution Meeting  
Change Control Meeting  
Handover / Takeover Meeting  

### 12.7 会议纪要必须关联项目文件

会议纪要生成后，AI 必须判断是否影响：

PM_PROJECT_BRIEF.md  
PM_REQUIREMENTS_REGISTER.md  
PM_SCOPE_BASELINE.md  
PM_RAID_LOG.md  
PM_DECISION_LOG.md  
PM_CHANGE_LOG.md  
PM_ACTIVE_WBS.md  
PM_ESTIMATION_LOG.md  
PM_SCHEDULE_BASELINE.md  
PM_PRODUCT_BACKLOG.md  
PM_SPRINT_BACKLOG.md  
PM_CURRENT_STATUS.md  
PM_DAILY_BRIEFING.md  
To-do 文件  
日报 / 周报 / 月报  

如有影响，必须进入 Pending Updates，并立即在对话中让用户确认。

### 12.8 会议索引

系统必须维护会议索引文件：

`03_MEETINGS/meeting_index/PM_MEETING_INDEX.md`

字段：

Meeting ID  
Date  
Time  
Topic  
Type  
Participants  
Minutes File  
Transcript File  
Generated Actions  
Generated Decisions  
Generated Pending Updates  
Follow-up Required  
Status  

### 12.9 meetings.json

系统必须维护：

`07_DATA/meetings.json`

用于 Dashboard 展示会议历史、会议类型、会议状态、会议输出。

### 12.10 meeting_actions.json

系统必须维护：

`07_DATA/meeting_actions.json`

用于记录从会议中提取的行动项。

### 12.11 meeting_decisions.json

系统必须维护：

`07_DATA/meeting_decisions.json`

用于记录从会议中提取的决策摘要。

---

## 13. 会议建议需求

### 13.1 每日 Briefing 必须包含会议建议

每天用户调用：

`/ai-pm-os 今日 briefing`

AI 必须判断是否需要建议用户召开会议。

会议建议必须包含：

建议会议名称。  
为什么需要开。  
会议类型。  
建议参会人。  
会议目标。  
会议议程。  
会前材料。  
会议应达成的结果。  
会议后需要更新哪些文件。  
是否需要形成决策。  
是否需要升级。  

### 13.2 To-do 中必须包含会议 To-do

如果 AI 建议开会，必须在当天 To-do 中形成详细会议 To-do。

不能只写：

“开个风险会。”

必须写成：

会议 To-do：组织 Scope Baseline Review Meeting  
背景：当前 Scope Baseline 仍为 Draft，且 REQ-004、REQ-006 是否纳入一期未确认。  
目的：确认一期范围、Out of Scope、是否允许进入 WBS。  
建议参会人：PM、Sponsor、Product Owner、Tech Owner、业务 Owner。  
会前准备：PM_SCOPE_BASELINE.md v0.1、PM_REQUIREMENTS_REGISTER.md、PM_RAID_LOG.md。  
会议输出：批准或退回 Scope Baseline；确认是否进入 WBS；记录 Decision。  
完成标准：会议纪要生成，Decision Log / Pending Updates 更新，Scope Baseline 状态明确。  

### 13.3 会议建议触发条件

Skill 应在以下情况主动建议会议：

Scope Baseline 长期未审批。  
P0 需求是否纳入一期不清。  
关键风险没有 owner。  
High Risk 多日未更新。  
Change Request pending 太久。  
Sprint Backlog 与 Scope 冲突。  
UAT 准入条件不明确。  
上线日期临近但 Release Checklist 缺失。  
Action 多项逾期且涉及多个 owner。  
项目状态可能从 Green 转 Amber 或 Red。  
关键决策长期未确认。  
半路接手项目时信息不完整。  
会议 transcript 显示多人理解不一致。  

### 13.4 会议建议输出到文件

会议建议应同步写入：

`PM_DAILY_BRIEFING.md`  
当天 `YYYY-MM-DD_TODO.md`  
`daily_briefing.json`  
必要时写入 `PM_GAP_ANALYSIS.md`

---

## 14. To-do 管理需求

### 14.1 To-do 目录

系统必须创建：

`04_TODO/daily/`  
`04_TODO/archive/`

### 14.2 每日 To-do 文件命名

每日 To-do 文件命名格式：

`YYYY-MM-DD_TODO.md`

例如：

`2026-06-18_TODO.md`

如果一天内生成多个版本，可以命名：

`2026-06-18_TODO_v1.md`  
`2026-06-18_TODO_v2.md`

但默认每天一个主 To-do 文件。

### 14.3 To-do 文件内容

每日 To-do 必须包含：

日期。  
项目名称。  
今日项目状态。  
今日最重要 3 件事。  
要催的人。  
要升级的风险。  
待审批文件。  
待处理 Pending Updates。  
建议召开的会议。  
会议准备。  
需要生成的报告。  
Checklist。  
昨日滚动未完成项。  
AI 建议。  

### 14.4 To-do 必须详细

To-do 不能只写一句话。

每条 To-do 必须尽量包含：

Todo ID。  
任务名称。  
背景。  
为什么要做。  
关联文件。  
关联条目 ID。  
Owner。  
需要联系的人。  
截止时间。  
预期输出物。  
完成标准。  
优先级。  
状态。  
如果不做的影响。  
下一步动作。  

### 14.5 To-do 状态

每条 To-do 应包含：

Todo ID  
Task  
Source  
Related File / Item ID  
Priority  
Owner  
Due Time / Due Date  
Status：Open / Done / Deferred / Blocked / Cancelled / Rolled Over  
Notes  

### 14.6 用户或 AI 打勾

用户可以自己手动打勾。  
用户也可以把完成情况发给 AI，让 AI 更新 To-do。

### 14.7 未完成 To-do 识别

当用户把当天材料、日报、会议结果或更新文件发给 AI 时，AI 必须检查：

当天 To-do 是否完成。  
是否有未完成项。  
未完成项是否需要滚动到明天。  
是否需要升级。  
是否影响周报/月报。  

### 14.8 todo.json

系统必须同步维护：

`07_DATA/todo.json`

用于 Dashboard 显示今日 To-do、未完成 To-do、滚动项和完成率。

---

## 15. 报告归档需求

### 15.1 日报目录

日报存放：

`05_REPORTS/daily/`

日报命名：

`YYYY-MM-DD_DAILY_REPORT.md`  
`YYYY-MM-DD_DAILY_REPORT.html`

例如：

`2026-06-18_DAILY_REPORT.md`

### 15.2 周报目录

周报存放：

`05_REPORTS/weekly/`

周报命名：

`YYYY-MM-DD_to_YYYY-MM-DD_WEEKLY_REPORT.md`  
`YYYY-MM-DD_to_YYYY-MM-DD_WEEKLY_REPORT.html`  
`YYYY-MM-DD_to_YYYY-MM-DD_WEEKLY_REPORT_PPT.html`

例如：

`2026-06-15_to_2026-06-21_WEEKLY_REPORT.md`

### 15.3 月报目录

月报存放：

`05_REPORTS/monthly/`

月报命名：

`YYYY-MM_MONTHLY_REPORT.md`  
`YYYY-MM_MONTHLY_REPORT.html`  
`YYYY-MM_MONTHLY_REPORT_PPT.html`

例如：

`2026-06_MONTHLY_REPORT.md`

如需自然日期范围，也可使用：

`YYYY-MM-DD_to_YYYY-MM-DD_MONTHLY_REPORT.md`

### 15.4 Steering Committee 报告目录

管理层汇报存放：

`05_REPORTS/steering_committee/`

命名：

`YYYY-MM-DD_STEERCO_REPORT.md`  
`YYYY-MM-DD_STEERCO_REPORT.html`  
`YYYY-MM-DD_STEERCO_REPORT_PPT.html`

### 15.5 HTML PPT 目录

HTML PPT 存放：

`05_REPORTS/ppt_html/`

命名必须包含日期范围和报告类型。

### 15.6 reports.json

系统必须同步维护：

`07_DATA/reports.json`

记录所有日报、周报、月报、PPT 输出。

字段：

Report ID  
Report Type  
Date Range  
File Path  
Generated At  
Source Files  
Status  
Review Required  

---

## 16. 日报 / 周报 / 月报专业要求

### 16.1 Skill 必须有专业报告分支

日报、周报、月报不能只是流水账。

Skill 必须按项目管理专业方式生成报告。

### 16.2 日报必须包含

今日总体状态。  
今日完成事项。  
今日未完成事项。  
今日新增风险。  
今日新增 Issue。  
今日确认决策。  
今日新增变更。  
今日 Action 更新。  
今日会议纪要摘要。  
明日计划。  
需要催办的人。  
需要升级的事项。  
To-do 完成情况。  

### 16.3 周报必须包含

本周总体状态。  
本周完成事项。  
下周计划。  
关键风险。  
关键 Issue。  
待审批事项。  
逾期 Action。  
已确认决策。  
范围变更。  
Sprint 进展。  
Backlog 变化。  
里程碑进展。  
本周会议摘要。  
需要支持。  
管理层摘要。  

### 16.4 月报必须包含

本月总体进展。  
里程碑完成情况。  
需求完成情况。  
风险趋势。  
Issue 总结。  
变更总结。  
Sprint / Agile 进展。  
资源和阻塞情况。  
估算偏差和进度偏差。  
会议与治理节奏总结。  
下月计划。  
管理层决策请求。  

### 16.5 报告必须基于真实记录

AI 不得编造报告内容。  
报告必须基于：

Action。  
RAID。  
Decision。  
Change。  
Milestone。  
Sprint。  
Backlog。  
Meeting Minutes。  
To-do。  
Current Status。  

---

## 17. 敏捷文件要求

### 17.1 PM_PRODUCT_BACKLOG.md

产品待办池。

字段：

Backlog ID  
Title  
Description  
Priority  
Story Points  
Status  
Linked Requirement  
Acceptance Criteria  
Sprint  
Owner  

### 17.2 PM_SPRINT_BACKLOG.md

Sprint 待办。

字段：

Sprint ID  
Story ID  
Task  
Owner  
Status  
Story Points  
Blocked  
Due Date  

### 17.3 PM_USER_STORIES.md

用户故事。

格式：

作为【用户角色】，我希望【能力】，以便【业务价值】。

必须关联：

Requirement ID  
Acceptance Criteria  
Priority  
Story Points  
Sprint  
Status  

### 17.4 PM_ACCEPTANCE_CRITERIA.md

验收标准库。

每个需求和用户故事都必须有验收标准。

### 17.5 PM_DOR_DOD.md

Definition of Ready / Definition of Done。

必须定义：

什么样的需求可以进入 Sprint。  
什么样的工作算完成。  

### 17.6 PM_SPRINT_PLAN.md

Sprint 计划。

必须包含：

Sprint Goal  
Sprint 时间范围  
Committed Stories  
Committed Points  
Risks  
Dependencies  
Expected Demo Output  

### 17.7 PM_DAILY_STANDUP_LOG.md

每日站会记录。

字段：

Date  
Yesterday  
Today  
Blocker  
Owner  
Follow-up Action  

### 17.8 PM_SPRINT_REVIEW.md

Sprint 评审。

记录：

完成内容。  
Demo 结果。  
未完成内容。  
业务反馈。  
验收情况。  

### 17.9 PM_SPRINT_RETROSPECTIVE.md

Sprint 复盘。

记录：

做得好的。  
做得不好的。  
需要改进的。  
下个 Sprint 行动项。  

### 17.10 PM_BURNDOWN_DATA.md

燃尽数据。

用于同步 `burndown.json`。

### 17.11 PM_VELOCITY_LOG.md

速度记录。

用于同步 `velocity.json`。

---

## 18. 统一 Skill：ai-pm-os

### 18.1 Skill 定位

`ai-pm-os` 是唯一 Skill。  
它是总控型 Skill。  
它根据用户指令自动进入不同模式。

用户调用示例：

`/ai-pm-os 初始化项目`  
`/ai-pm-os 处理新材料`  
`/ai-pm-os 处理会议 transcript`  
`/ai-pm-os 生成会议纪要`  
`/ai-pm-os 应用待审批更新`  
`/ai-pm-os 今天我该做什么`  
`/ai-pm-os 生成日报`  
`/ai-pm-os 生成周报`  
`/ai-pm-os 生成月报`  
`/ai-pm-os 刷新 dashboard`  
`/ai-pm-os 审计项目`  
`/ai-pm-os 接管已有项目`  
`/ai-pm-os 做时间估算建议`  
`/ai-pm-os 检查项目缺口`  
`/ai-pm-os 建议我需要开什么会`

### 18.2 内部模式

Skill 内部包含以下模式：

项目初始化模式。  
材料处理模式。  
会议 transcript 模式。  
会议纪要生成模式。  
会议建议模式。  
审批应用模式。  
每日 briefing 模式。  
To-do 管理模式。  
日报模式。  
周报 / 月报模式。  
Dashboard 刷新模式。  
敏捷管理模式。  
项目接管模式。  
时间估算模式。  
缺口识别模式。  
PM Audit 审计模式。  

### 18.3 Skill 执行总规则

每次执行前必须读取全局记忆和项目记忆。  
不得绕过 Pending Updates 直接修改关键文件。  
不得覆盖 Approved Baseline。  
不得在 Scope Baseline 未批准前创建正式 WBS。  
不得把未确认事项写入 Decision Log。  
不得生成无来源的会议纪要、日报、周报和月报。  
必须同步 Markdown、JSON、Dashboard。  
必须更新 Document Registry 和 Current Status。  
必须更新 Input Log。  
必须更新 Meeting Index。  
必须更新 To-do 状态。  
必须在重大更新前后使用 Git commit。  
回答项目问题时，必须尽量引用文件名和条目 ID。  
必须识别缺失项并写入 Gap Analysis。  
必须在需要时提醒用户做估算。  
必须在生成 Pending Updates 后立即在对话中请求用户确认。  

---

## 19. 工作流设计

### 19.1 新项目初始化

用户复制项目壳。  
用 Cursor / Codex 打开。  
调用：

`/ai-pm-os 初始化项目`

AI 需要：

读取全局记忆。  
询问或读取项目基础信息。  
创建所有 PM 文件。  
创建所有敏捷文件。  
创建所有会议管理文件夹。  
创建所有 JSON 数据文件。  
初始化 Dashboard。  
初始化 Git。  
生成 Project Brief Draft。  
生成 Requirements Register Draft。  
生成 Scope Baseline Draft。  
生成 Current Status。  
生成 Memory Index。  
生成 Input Log。  
生成 Meeting Index。  
生成 Gap Analysis 初版。  
设置 `PM_ACTIVE_WBS.md` 为暂无工作包。  

输出：

初始化摘要。  
待用户确认问题。  
缺失项清单。  
下一步建议。  

### 19.2 新材料处理

用户可以通过两种方式提供材料：

直接在 Cursor / Codex 对话框发送。  
放入 `08_INTAKE/new_materials/`。

调用：

`/ai-pm-os 处理新材料`

AI 需要：

记录输入到 `PM_INPUT_LOG.md`。  
判断材料类型。  
识别新需求。  
识别新风险。  
识别新 Issue。  
识别新依赖。  
识别新决策。  
识别新变更。  
识别新行动项。  
识别会议相关内容。  
识别项目状态变化。  
识别敏捷 Backlog 影响。  
识别 Sprint 影响。  
识别 Dashboard 影响。  
识别缺失项和冲突项。  

AI 输出：

`PM_PENDING_UPDATES.md`  
`PM_GAP_ANALYSIS.md`

如生成 Pending Updates，必须立即在对话中向用户确认。

不得直接改关键正式文件。

### 19.3 会议 transcript 处理

用户可以直接发 transcript，也可以放入：

`08_INTAKE/transcripts_to_process/`

调用：

`/ai-pm-os 处理会议 transcript`

AI 必须完成：

生成专业会议纪要。  
更新 Meeting Index。  
提取 Action Items。  
提取 RAID 更新建议。  
提取 Decision 更新建议。  
提取 Change 更新建议。  
提取 Requirement 更新建议。  
分析 Scope 影响。  
分析 Estimation 影响。  
分析 Sprint / Backlog 影响。  
分析 Current Status 更新建议。  
分析 To-do 更新建议。  
生成 Pending Updates。  
立即在对话中请求用户确认 Pending Updates。

### 19.4 会议纪要生成

调用：

`/ai-pm-os 根据我刚刚发的 transcript 生成会议纪要`

AI 输出：

`03_MEETINGS/meeting_minutes/YYYY-MM-DD_HHMM_MEETING_MINUTES_<topic>.md`

并同步：

`03_MEETINGS/meeting_index/PM_MEETING_INDEX.md`  
`07_DATA/meetings.json`  
`07_DATA/meeting_actions.json`  
`07_DATA/meeting_decisions.json`

### 19.5 应用审批更新

用户审核 `PM_PENDING_UPDATES.md` 后，调用：

`/ai-pm-os 应用 PU-001 到 PU-006`

AI 需要：

创建 Git checkpoint。  
更新正式 Markdown 文件。  
同步 JSON。  
同步 Dashboard public/data。  
更新 Current Status。  
更新 Document Registry。  
更新 Approval Status。  
更新 Input Log。  
更新 Meeting Index。  
更新 Gap Analysis。  
更新 To-do。  
归档已处理输入。  
生成 Git commit。  
输出更新摘要。

### 19.6 每日 Briefing

用户每天新开窗口，调用：

`/ai-pm-os 今日 briefing`

AI 只读项目文件，不主动写入正式文件，除非用户要求保存为 To-do 或 Daily Briefing。

输出：

今日重点。  
今日要催谁。  
哪些 Action 逾期。  
哪些 To-do 未完成。  
哪些风险需要升级。  
哪些审批待处理。  
哪些会议建议召开。  
每个建议会议的会议目标、参会人、议程和预期输出。  
哪些会议要准备。  
项目当前 RAG 状态是否合理。  
是否需要生成日报。  
是否需要生成周报。  
是否需要刷新 Dashboard。  
建议用户今天做的 3-5 个动作。

### 19.7 To-do 生成与更新

调用：

`/ai-pm-os 生成今日 To-do`

AI 需要读取：

PM_CURRENT_STATUS。  
RAID。  
Actions。  
Approvals。  
Pending Updates。  
Milestones。  
Meetings。  
Sprint。  
Backlog。  
昨日 To-do。  

输出：

`04_TODO/daily/YYYY-MM-DD_TODO.md`

若发现昨日未完成项，应滚动到今日 To-do，并标明来源。

To-do 中如涉及会议，必须写明：

会议名称。  
会议背景。  
为什么要开。  
建议参会人。  
会议目标。  
议程。  
会前材料。  
预期输出。  
完成标准。

### 19.8 日报生成

调用：

`/ai-pm-os 生成今日日报`

AI 读取当日：

To-do。  
Action 更新。  
RAID 更新。  
Meeting Minutes。  
Decision。  
Change。  
Sprint 更新。  
Current Status。  

输出：

`05_REPORTS/daily/YYYY-MM-DD_DAILY_REPORT.md`  
`05_REPORTS/daily/YYYY-MM-DD_DAILY_REPORT.html`

### 19.9 周报 / 月报

用户调用：

`/ai-pm-os 生成 2026-06-15 到 2026-06-21 周报`

AI 需要读取该日期范围内：

已完成 Action。  
逾期 Action。  
To-do 完成率。  
日报。  
新增风险。  
关闭风险。  
新增 Issue。  
确认决策。  
变更请求。  
里程碑进展。  
Sprint 进展。  
Backlog 变化。  
会议摘要。  
会议决策。  
估算偏差。  

输出：

Markdown 周报。  
HTML 周报。  
HTML PPT 汇报版。  

不得编造未记录内容。

### 19.10 Dashboard 刷新

用户调用：

`/ai-pm-os 刷新 dashboard`

AI 需要：

从 Markdown 正式文件同步 JSON。  
复制 JSON 到 `06_DASHBOARD/public/data/`。  
检查 JSON schema。  
确认 Dashboard 可读取数据。  
输出刷新摘要。  

### 19.11 项目接管

用户把已有项目材料放入 Inbox 或直接发送给 AI。

调用：

`/ai-pm-os 接管已有项目`

AI 需要生成：

`PM_TAKEOVER_ASSESSMENT.md`

分析：

当前项目阶段。  
已有文件。  
缺失文件。  
范围是否清楚。  
需求是否可追踪。  
时间估算是否存在。  
风险是否有 owner。  
决策是否留痕。  
会议纪要是否缺失。  
关键会议是否开过。  
是否存在未记录变更。  
是否存在虚假 Green 状态。  
建议补齐文件。  
建议下一步动作。  
建议需要召开的接管会议。  

随后将已有资料重建为本系统格式。

### 19.12 PM Audit

用户调用：

`/ai-pm-os 审计项目`

AI 需要检查：

Scope Baseline 是否批准。  
是否未批范围就拆 WBS。  
需求是否缺验收标准。  
需求是否缺估算。  
Action 是否无 owner / due date。  
RAID 是否缺 mitigation / next step。  
Decision 是否无来源。  
Change 是否绕过审批。  
Sprint Backlog 是否与 Scope 冲突。  
Dashboard 是否与 Markdown 不一致。  
会议纪要是否缺失。  
关键会议是否缺失。  
日报是否缺失。  
To-do 是否长期未完成。  
周报是否漏掉重大风险。  
项目 RAG 状态是否合理。  

输出：

审计报告。  
问题清单。  
整改建议。  
建议会议。  
需要用户确认的问题。  

---

## 20. Dashboard 需求

### 20.1 Dashboard 技术形态

Dashboard 使用 React / Vite。

本地运行方式：

```bash id="6wjsl1"
cd 06_DASHBOARD
npm install
npm run dev
```

默认访问：

`http://localhost:5173`

### 20.2 Dashboard 数据源

Dashboard 读取：

`06_DASHBOARD/public/data/*.json`

AI 更新项目文件后，需要同步：

`07_DATA/*.json`  
到  
`06_DASHBOARD/public/data/*.json`

### 20.3 Dashboard 页面

Dashboard 至少包含以下页面：

Overview Page  
Delivery Page  
Agile Page  
Risk Page  
Approval Page  
Document Page  
Meeting Page  
Todo Page  
Reports Page  
Estimation Page  

### 20.4 Dashboard 模块

必须包含：

项目状态。  
范围批准状态。  
里程碑。  
甘特图。  
风险 RAID。  
Action Tracker。  
审批中心。  
Sprint Dashboard。  
Product Backlog。  
燃尽图。  
Velocity 图。  
进度图。  
会议纪要列表。  
会议行动项。  
会议决策。  
To-do 完成情况。  
报告归档情况。  
估算状态。  
文档健康度。  
Daily Briefing 摘要。  

### 20.5 Overview Page

显示：

项目名称。  
当前阶段。  
交付模式。  
RAG 状态。  
总体进度。  
Scope Baseline 状态。  
当前 Sprint。  
关键阻塞项。  
下一个行动。  
待审批数量。  
高风险数量。  
逾期 Action 数量。  
今日 To-do 完成率。  
最近会议纪要状态。  
最近日报状态。  
本周周报状态。  

### 20.6 Delivery Page

显示：

里程碑时间线。  
项目甘特图。  
总体进度图。  
需求完成率。  
Action 完成率。  
里程碑完成率。  
估算偏差。  

### 20.7 Agile Page

显示：

当前 Sprint。  
Sprint Goal。  
Committed Points。  
Completed Points。  
Blocked Points。  
Product Backlog。  
Sprint Backlog。  
Burndown Chart。  
Velocity Chart。  
Carry-over Items。  

### 20.8 Risk Page

显示：

Risk / Issue / Assumption / Dependency 分布。  
High / Medium / Low 分布。  
Open / Closed 分布。  
逾期 RAID。  
风险 Owner。  
需要升级的风险。  

### 20.9 Approval Page

显示：

待审批文件。  
待审批 Scope Baseline。  
待审批 Change Request。  
待审批 Decision。  
待审批 Pending Updates。  
审批影响说明。  

### 20.10 Document Page

显示：

所有项目文件状态。  
Draft / Pending Review / Approved / Approved Baseline。  
最后更新时间。  
是否 required。  
健康状态。  
缺失文件。  
过期文件。  
需要更新文件。  

### 20.11 Meeting Page

显示：

会议列表。  
会议类型。  
会议主题。  
会议时间。  
参会人。  
会议纪要文件。  
会议 transcript 文件。  
会议产生的 Action。  
会议产生的 Decision。  
会议产生的 Pending Updates。  
会议后续事项。  

### 20.12 Todo Page

显示：

今日 To-do。  
未完成 To-do。  
滚动 To-do。  
逾期 To-do。  
会议 To-do。  
To-do 完成率。  
按来源分类的 To-do。  

### 20.13 Reports Page

显示：

日报列表。  
周报列表。  
月报列表。  
HTML PPT 列表。  
报告生成状态。  
报告审核状态。  

### 20.14 Estimation Page

显示：

缺估算需求。  
估算方法。  
估算结果。  
估算信心等级。  
估算偏差。  
Story Point 分布。  
Velocity 趋势。  

---

## 21. Dashboard 数据文件

### 21.1 project_state.json

用于项目总览。

字段：

project_id  
project_name  
current_phase  
delivery_mode  
rag_status  
overall_progress  
scope_baseline_status  
current_sprint  
last_updated  
key_blockers  
next_actions  

### 21.2 scope.json

用于范围批准状态。

字段：

scope_baseline.status  
scope_baseline.approval_status  
scope_baseline.version  
scope_baseline.approved_by  
scope_baseline.approved_at  
in_scope  
out_of_scope  

### 21.3 milestones.json

用于里程碑。

字段：

milestone id  
name  
planned_date  
actual_date  
status  
owner  

### 21.4 gantt.json

用于甘特图。

字段：

task id  
name  
type  
start  
end  
progress  
status  
owner  
dependencies  

### 21.5 requirements.json

用于需求图表。

字段：

req id  
description  
priority  
phase_1_included  
acceptance_criteria  
dependency  
risk  
owner  
status  
created_at  
updated_at  
estimate_status  

### 21.6 raid.json

用于风险看板。

字段：

id  
type  
title  
impact  
severity  
probability  
owner  
due_date  
status  
next_step  
last_updated  

### 21.7 actions.json

用于行动项。

字段：

id  
action  
owner  
due_date  
status  
priority  
related_item  
next_step  
created_at  
closed_at  

### 21.8 approvals.json

用于审批中心。

字段：

id  
item_type  
item_name  
version  
status  
requested_by  
required_approver  
created_at  
due_date  
impact  

### 21.9 decisions.json

用于决策记录。

字段：

decision_id  
decision  
rationale  
date  
owner  
impact  
source  
status  

### 21.10 changes.json

用于变更记录。

字段：

change_id  
request  
requested_by  
reason  
impact_on_scope  
impact_on_timeline  
impact_on_resource  
impact_on_testing  
impact_on_risk  
decision  
approved_by  
date  

### 21.11 documents.json

用于文档健康度。

字段：

file  
category  
status  
approval_status  
last_updated  
health  
required  

### 21.12 sprints.json

用于 Sprint Dashboard。

字段：

current_sprint  
sprints  
sprint id  
goal  
start_date  
end_date  
status  
committed_points  
completed_points  
blocked_points  
carry_over_points  

### 21.13 backlog.json

用于 Backlog Dashboard。

字段：

backlog item id  
title  
priority  
story_points  
status  
sprint  
acceptance_criteria  
linked_requirement  

### 21.14 burndown.json

用于燃尽图。

字段：

sprint_id  
total_points  
days  
date  
ideal_remaining  
actual_remaining  

### 21.15 velocity.json

用于速度图。

字段：

sprint  
committed_points  
completed_points  

### 21.16 meetings.json

用于会议页面。

字段：

meeting_id  
datetime  
topic  
type  
participants  
chair  
minutes_file  
transcript_file  
status  
generated_actions  
generated_decisions  
generated_pending_updates  
follow_up_required  

### 21.17 meeting_actions.json

用于会议行动项。

字段：

meeting_id  
action_id  
action  
owner  
due_date  
status  
related_file  
related_item  

### 21.18 meeting_decisions.json

用于会议决策摘要。

字段：

meeting_id  
decision_id  
decision  
confirmed_status  
impact  
source  
pending_update_id  

### 21.19 progress.json

用于进度图。

字段：

overall_progress  
requirements_completion  
milestones_completion  
actions_completion  

### 21.20 estimation.json

用于估算页面。

字段：

estimate_id  
item_id  
item_type  
method  
estimate_value  
unit  
confidence  
assumptions  
risks  
estimator  
date  
review_needed  

### 21.21 todo.json

用于 To-do 页面。

字段：

todo_id  
date  
task  
source  
related_item  
priority  
owner  
due_date  
status  
rolled_from  
rolled_to  
completed_at  

### 21.22 reports.json

用于报告页面。

字段：

report_id  
report_type  
date_range  
file_path_md  
file_path_html  
file_path_ppt  
generated_at  
source_files  
status  
review_required  

### 21.23 input_log.json

用于输入材料追踪。

字段：

input_id  
datetime  
input_type  
original_name  
source  
processed_status  
pending_update_ids  
meeting_minutes_ids  
archived_path  
notes  

### 21.24 daily_briefing.json

用于 Daily Briefing Panel。

字段：

date  
focus_items  
people_to_chase  
risks_to_escalate  
pending_approvals  
meetings_to_prepare  
recommended_actions  

### 21.25 dashboard_state.json

用于首页快速渲染。

字段：

last_synced  
project_name  
rag_status  
overall_progress  
scope_status  
open_risks  
high_risks  
open_actions  
overdue_actions  
pending_approvals  
current_sprint  
sprint_progress  
todo_completion_rate  
document_health_score  
latest_meeting_minutes_status  

---

## 22. 统一命名系统

### 22.1 命名原则

所有文件必须命名稳定、可读、可排序、可追踪。

命名必须遵守：

英文大写模块名。  
下划线分隔。  
日期使用 ISO 格式。  
日期范围使用 `_to_`。  
版本使用 `v0.1`、`v1.0`。  
ID 使用固定前缀。  
不得随意使用空格、乱码、临时中文文件名。  

### 22.2 日期格式

日期：

`YYYY-MM-DD`

日期时间：

`YYYY-MM-DD_HHMM`

日期范围：

`YYYY-MM-DD_to_YYYY-MM-DD`

### 22.3 报告命名

日报：

`YYYY-MM-DD_DAILY_REPORT.md`

周报：

`YYYY-MM-DD_to_YYYY-MM-DD_WEEKLY_REPORT.md`

月报：

`YYYY-MM_MONTHLY_REPORT.md`

周报 HTML PPT：

`YYYY-MM-DD_to_YYYY-MM-DD_WEEKLY_REPORT_PPT.html`

### 22.4 To-do 命名

每日 To-do：

`YYYY-MM-DD_TODO.md`

### 22.5 会议命名

会议纪要：

`YYYY-MM-DD_HHMM_MEETING_MINUTES_<topic>.md`

会议议程：

`YYYY-MM-DD_HHMM_MEETING_AGENDA_<topic>.md`

会议 transcript：

`YYYY-MM-DD_HHMM_TRANSCRIPT_<topic>.md`

会议行动项摘要：

`YYYY-MM-DD_HHMM_MEETING_ACTIONS_<topic>.md`

会议决策摘要：

`YYYY-MM-DD_HHMM_MEETING_DECISIONS_<topic>.md`

### 22.6 ID 命名

需求：

`REQ-001`

风险：

`R-001`

假设：

`A-001`

问题：

`I-001`

依赖：

`D-001`

行动项：

`ACT-001`

决策：

`DEC-001`

变更：

`CHG-001`

审批：

`APR-001`

Pending Update：

`PU-001`

To-do：

`TODO-YYYYMMDD-001`

估算：

`EST-001`

里程碑：

`MS-001`

Sprint：

`SPR-001`

User Story：

`US-001`

Backlog Item：

`BL-001`

输入材料：

`IN-YYYYMMDD-HHMM-001`

会议：

`MTG-YYYYMMDD-HHMM-001`

### 22.7 命名规范文件

命名规范必须写入：

`_AI_GLOBAL_MEMORY/AI_NAMING_CONVENTIONS.md`

AI 每次创建新文件前必须读取。

---

## 23. Git 版本控制需求

项目壳必须初始化 Git。

AI 应遵守：

应用重大更新前创建 checkpoint。  
应用重大更新后提交 commit。  
commit message 必须说明更新来源和更新范围。  
Approved Baseline 文件被影响时必须额外提示用户。  
不得静默覆盖历史版本。

示例 commit message：

`PM update: applied PU-001 to PU-006 after meeting transcript 2026-06-18`

---

## 24. 状态与审批模型

### 24.1 文档状态

文档状态包括：

Draft  
Pending Review  
Approved  
Approved Baseline  
Change Proposed  
Superseded  
Archived  

### 24.2 审批规则

Project Brief 需要 PM Review。  
Requirements Register 需要 PM Review。  
Scope Baseline 需要 PM Approval，必要时 Sponsor Approval。  
Decision Log 只记录已确认决策。  
Change Log 中的变更必须有审批状态。  
Meeting Minutes 生成后应进入 Meeting Index。  
Active WBS 必须在 Scope Baseline 批准后才能正式生成。  

### 24.3 Pending Updates 状态

Pending Updates 状态包括：

Proposed  
Approved  
Rejected  
Needs Clarification  
Applied  
Archived  

### 24.4 To-do 状态

To-do 状态包括：

Open  
Done  
Deferred  
Blocked  
Cancelled  
Rolled Over  

### 24.5 Meeting 状态

会议状态包括：

Planned  
Transcript Received  
Minutes Generated  
Pending Review  
Actions Extracted  
Updates Proposed  
Closed  
Follow-up Required  

---

## 25. AI 回答问题要求

用户可以直接问：

这个项目现在能不能进入开发？  
当前最大风险是什么？  
今天我要催谁？  
昨天 To-do 哪些没做？  
Scope Baseline 批了吗？  
有没有范围蔓延？  
这周周报怎么写？  
Sprint 是否健康？  
哪些文件还没批？  
哪些需求没有验收标准？  
哪些需求没有估算？  
哪个文件缺失？  
我发的材料有没有覆盖项目启动需要的信息？  
我需要开什么会？  
这个会要拉谁？  
这个会的目标是什么？  
最近会议纪要有没有生成？  
会议里面有哪些 Action 没落实？  

AI 回答必须尽量引用：

文件名。  
条目 ID。  
会议 ID。  
日期。  
当前状态。  
需要用户确认的事项。

例如：

“当前不建议进入正式 WBS，因为 `PM_SCOPE_BASELINE.md` 状态仍为 Draft，`PM_APPROVAL_STATUS.md` 中 APR-001 显示 Pending Review。”

---

## 26. 非功能需求

### 26.1 可用性

用户应能通过复制项目壳快速创建新项目。  
用户不需要理解复杂后端。  
用户只需用 Cursor / Codex 打开项目文件夹并调用 Skill。

### 26.2 可维护性

项目文件结构必须稳定。  
Dashboard 组件必须预置。  
AI 不得随意改变目录结构。  
所有规则写入 `AGENTS.md` 和 `_AI_GLOBAL_MEMORY/`。

### 26.3 可追溯性

所有需求、风险、行动项、决策、变更、To-do、估算、会议、输入材料必须有 ID。  
所有关键更新必须有来源。  
所有重大更新必须有 Git 记录。  

### 26.4 可扩展性

后续可以扩展：

Dify。  
Watchdog。  
Telegram。  
数据库。  
云端同步。  
多人协作。  
PDF / DOCX / PPTX 导出。  
第三方项目管理工具集成。  

### 26.5 数据一致性

Markdown 与 JSON 必须同步。  
每次应用更新后必须运行一致性检查。  
Dashboard 数据必须来自 JSON。  
JSON 不得成为正式文件源头。

### 26.6 执行稳定性

Skill 必须稳定执行同一套流程。  
同一命令在同一项目状态下应产生一致结构的输出。  
不得因上下文变化改变文件结构。  
不得跳过必读文件。  
不得跳过 Git checkpoint。  
不得跳过 Pending Updates。  
不得在生成 Pending Updates 后忘记向用户确认。  
不得在处理会议 transcript 后忘记生成会议纪要。  

---

## 27. 核心验收标准

### 27.1 项目壳验收

复制项目壳后，目录结构完整。  
所有 PM 文件存在。  
所有敏捷文件存在。  
所有会议管理文件夹存在。  
所有 To-do / Report / Data / Dashboard 文件夹存在。  
所有 JSON 文件存在。  
Dashboard 可运行。  
Git 可用。  
AGENTS.md 存在。  
_AI_GLOBAL_MEMORY 存在。  

### 27.2 Skill 验收

调用 `ai-pm-os` 后，AI 能识别用户意图。  
AI 能初始化项目。  
AI 能处理材料。  
AI 能记录对话框直接上传的材料。  
AI 能处理会议 transcript。  
AI 能生成专业会议纪要。  
AI 能生成会议建议。  
AI 能生成 Pending Updates。  
AI 能在对话中立即请求用户确认 Pending Updates。  
AI 能应用用户批准的更新。  
AI 能生成 To-do。  
AI 能检查未完成 To-do。  
AI 能生成日报。  
AI 能生成周报月报。  
AI 能提出时间估算建议。  
AI 能识别缺失项。  
AI 能刷新 Dashboard。  
AI 能执行 PM Audit。  
AI 能进行项目接管分析。  

### 27.3 Dashboard 验收

Dashboard 可以通过 `npm run dev` 启动。  
Dashboard 显示项目状态。  
Dashboard 显示范围批准状态。  
Dashboard 显示里程碑。  
Dashboard 显示甘特图。  
Dashboard 显示 RAID。  
Dashboard 显示 Action。  
Dashboard 显示审批。  
Dashboard 显示 Sprint。  
Dashboard 显示 Backlog。  
Dashboard 显示燃尽图。  
Dashboard 显示 Velocity。  
Dashboard 显示进度图。  
Dashboard 显示会议纪要。  
Dashboard 显示会议行动项。  
Dashboard 显示 To-do。  
Dashboard 显示报告归档。  
Dashboard 显示估算状态。  
Dashboard 显示文档健康度。  
修改 JSON 后，Dashboard 自动显示变化。  

### 27.4 文档治理验收

Scope Baseline 未批准前，AI 不得生成正式 WBS。  
AI 不得将未确认事项写入 Decision Log。  
AI 不得直接覆盖 Approved Baseline。  
AI 必须先生成 Pending Updates。  
AI 应用更新后必须同步 Current Status、Document Registry 和 JSON。  
AI 必须更新 Input Log。  
AI 必须更新 Gap Analysis。  
AI 必须更新 Meeting Index。  

---

## 28. 风险与控制

### 28.1 AI 改错文件

风险：AI 可能误改正式文件。  
控制：关键文件必须 Pending Updates；Git checkpoint；Approved Baseline 不得直接覆盖。

### 28.2 Markdown 与 JSON 不一致

风险：Dashboard 显示与正式文件不一致。  
控制：每次更新后执行同步和一致性检查；Markdown 优先。

### 28.3 用户过度依赖 AI

风险：用户不做 PM 判断。  
控制：Scope、Decision、Change、Report 均需 PM Review。

### 28.4 Dashboard 被 AI 重写失控

风险：AI 每次改 UI，导致系统不稳定。  
控制：Dashboard 组件预置，AI 默认只改 JSON，不改组件结构。

### 28.5 敏捷与范围基线冲突

风险：Sprint Backlog 中加入未批准范围。  
控制：Backlog 必须关联 Requirement；Scope 变更必须走 Change Log。

### 28.6 上下文丢失

风险：Cursor / Codex 上下文限制导致 AI 忘记项目状态。  
控制：每次先读 `_AI_GLOBAL_MEMORY/` 和 `00_PM_MEMORY/`。

### 28.7 估算缺失导致计划失真

风险：计划日期随意填写，导致延期。  
控制：Skill 必须提醒估算缺失，并建议估算方法。

### 28.8 To-do 未完成但无人发现

风险：每日行动项丢失。  
控制：Skill 必须检查昨日 To-do，并滚动未完成项。

### 28.9 文件命名混乱

风险：文件长期不可维护。  
控制：统一命名系统写入 AI_NAMING_CONVENTIONS.md。

### 28.10 对话框文件未归档

风险：用户直接发给 Cursor/Codex 的材料没有留下记录。  
控制：Skill 必须维护 PM_INPUT_LOG.md 和 input_log.json。

### 28.11 会议 transcript 只被总结，没有进入项目治理

风险：会议纪要生成了，但 Action、Decision、Risk、Change 没有进入项目文件。  
控制：会议 transcript 处理必须同时生成会议纪要和 Pending Updates。

### 28.12 Pending Updates 未立即确认

风险：AI 生成更新建议但用户不知道，导致更新滞留或被误用。  
控制：生成 Pending Updates 后必须立即在对话中向用户请求确认。

---

## 29. 典型使用命令

### 29.1 初始化项目

`/ai-pm-os 初始化项目`

### 29.2 处理新材料

`/ai-pm-os 处理我刚刚发的材料，生成待审批更新，并记录到 PM_INPUT_LOG`

### 29.3 处理 Intake 材料

`/ai-pm-os 处理 08_INTAKE/new_materials/ 中的新材料，生成待审批更新`

### 29.4 处理会议 transcript

`/ai-pm-os 处理我刚刚发的会议 transcript，生成会议纪要、会议 Action、会议 Decision 和待审批更新`

### 29.5 单独生成会议纪要

`/ai-pm-os 根据我刚刚发的 transcript 生成专业会议纪要，并按统一命名归档`

### 29.6 应用审批更新

`/ai-pm-os 应用 PU-001 到 PU-006，PU-007 暂不应用`

### 29.7 每日 Briefing

`/ai-pm-os 今日 briefing：告诉我今天要做什么、催谁、升级什么、哪些文件待审批、建议开什么会`

### 29.8 生成 To-do

`/ai-pm-os 生成今天的 To-do，并把昨天没完成的滚动进来，会议建议也写进去`

### 29.9 检查 To-do

`/ai-pm-os 检查今天 To-do 哪些完成了，哪些没完成，需要滚动什么`

### 29.10 生成日报

`/ai-pm-os 生成 2026-06-18 日报，输出 Markdown 和 HTML`

### 29.11 生成周报

`/ai-pm-os 生成 2026-06-15 到 2026-06-21 周报，输出 Markdown、HTML、HTML PPT`

### 29.12 生成月报

`/ai-pm-os 生成 2026-06 月报，输出 Markdown、HTML、HTML PPT`

### 29.13 刷新 Dashboard

`/ai-pm-os 刷新 dashboard、甘特图、风险看板、审批中心、会议页面和敏捷图表`

### 29.14 项目审计

`/ai-pm-os 审计项目是否存在范围蔓延、未审批变更、逾期 Action、风险未更新、Sprint 与 Scope 冲突、会议纪要缺失`

### 29.15 半路接手项目

`/ai-pm-os 接管已有项目，根据我发的资料生成接管评估并重建项目文件`

### 29.16 时间估算

`/ai-pm-os 检查当前项目哪些需求和工作包缺少时间估算，并建议估算方法`

### 29.17 缺口识别

`/ai-pm-os 检查我给的项目材料还缺什么，哪些项目文件没有覆盖到`

### 29.18 会议建议

`/ai-pm-os 根据当前项目状态，建议我接下来需要开什么会、拉谁参加、会议目标是什么`

---

## 30. V1 开发优先级

### 30.1 P0 必须完成

项目壳目录结构。  
一个统一 Skill 规则文件。  
核心 PM 文档模板。  
核心敏捷文档模板。  
会议纪要模板。  
会议管理文件夹。  
全局 AI 记忆文件。  
项目记忆文件。  
统一命名规范。  
Input Log。  
Meeting Index。  
Gap Analysis。  
To-do 文件夹。  
日报、周报、月报文件夹。  
JSON 数据文件。  
React/Vite Dashboard 可运行。  
项目状态展示。  
Scope 状态展示。  
RAID 展示。  
Action 展示。  
审批展示。  
会议纪要展示。  
Sprint / Backlog 展示。  
甘特图。  
燃尽图。  
Velocity 图。  
进度图。  
To-do 展示。  
报告归档展示。  
估算状态展示。  
文档健康度。  
Pending Updates 机制。  
Pending Updates 对话确认机制。  
会议 transcript → 会议纪要 + Pending Updates。  
日报 Markdown / HTML。  
周报 Markdown / HTML / HTML PPT。  
月报 Markdown / HTML / HTML PPT。  
Git 初始化和 commit 规则。  
时间估算提醒。  
缺口识别。  

### 30.2 P1 应完成

项目接管模式。  
PM Audit。  
Dashboard 视觉优化。  
更多报告模板。  
更多会议类型模板。  
敏捷数据一致性检查。  
HTML PPT 美化。  
估算偏差分析。  
To-do 趋势分析。  
会议趋势分析。  

### 30.3 P2 后续扩展

Watchdog。  
Dify。  
主动通知。  
云同步。  
多人协作。  
PDF / DOCX / PPTX 导出。  
第三方项目管理工具集成。  

---

## 31. 当前冻结决策

以下为当前已确认产品决策：

1. 只做一个 Skill：`ai-pm-os`。
2. Cursor 与 Codex 都支持，Skill 规则通用。
3. 每个项目壳内自带 `_AI_GLOBAL_MEMORY/`。
4. Dashboard 使用 React / Vite。
5. Markdown 是正式文件，JSON 是可视化同步层。
6. 接受 Pending Updates 机制，关键更新需审核后应用。
7. 需要 Git 版本控制。
8. 报告输出为 Markdown + HTML + HTML PPT。
9. 默认中文。
10. 敏捷功能要做全。
11. 第一版 Dashboard 必须可运行。
12. Dashboard 必须显示项目状态、范围批准状态、里程碑、风险、Action、审批、Sprint、Backlog、文档健康度。
13. Dashboard 必须包含甘特图、敏捷图、进度图。
14. 图表数据预处理为本地 JSON 文件。
15. 每次文档更新后，同步更新图表数据文件，使可视化自动变化。
16. Skill 必须具备资深 PM 专业能力，精通 PMP、PRINCE2、APM、敏捷和混合交付。
17. Skill 稳定性和执行稳定性是核心需求。
18. Skill 必须提醒时间估算缺失，并建议估算方法。
19. Skill 必须识别用户材料和项目文件中的缺失、冲突、未覆盖点。
20. 必须增加 To-do 文件夹，每天一个时间戳 To-do 文件。
21. 必须支持 To-do 打勾、未完成检查和跨日滚动。
22. 必须增加日报文件夹。
23. 周报、月报必须分别独立归档，并按日期范围命名。
24. 日报、周报、月报必须由专业报告分支生成。
25. 必须建立全局命名系统，避免文件混乱。
26. 用户主要通过 Cursor/Codex 对话框直接发材料，Skill 必须记录输入来源并维护 Input Log。
27. Inbox / Intake 目录是归档和暂存区，不是唯一输入入口。
28. 必须具备会议纪要生成和管理能力。
29. Meeting transcript 处理必须同时生成会议纪要和 Pending Updates。
30. 会议纪要必须采用统一专业模板。
31. 会议纪要命名必须包含时间和会议主题。
32. 每日 Briefing 必须给出会议建议。
33. To-do 中的会议任务必须写明会议背景、参会人、目标、议程、预期结果和完成标准。
34. 生成 Pending Updates 后必须立即在对话中请求用户确认。

---

## 32. 产品一句话总结

AI PM OS Local Shell 是一个本地化、可复制、以 Cursor/Codex 为入口、以一个统一 Skill 为执行核心、以 Markdown 为正式项目文件、以 JSON 为可视化同步层、以 React/Vite Dashboard 为项目驾驶舱的 AI 项目管理系统。

它要帮助用户从 0 启动项目、半路接手项目、持续更新项目文件、处理会议 transcript、生成专业会议纪要、管理传统与敏捷交付、生成 To-do、日报、周报、月报和 HTML PPT，并通过本地 Dashboard 展示项目状态、范围、进度、风险、Action、审批、会议、Sprint、Backlog、甘特图、燃尽图、Velocity 图、估算状态和文档健康度。

核心原则是：

AI 负责生成、整理、更新、检查、估算建议、缺口识别、会议纪要、报告和可视化。  
用户负责审批、判断、催办、开会、升级和最终负责。  
