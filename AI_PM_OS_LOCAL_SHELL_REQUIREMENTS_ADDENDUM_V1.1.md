# AI PM OS Local Shell 需求补充说明 v1.1

- 状态：Pending Human Owner Approval
- 日期：2026-06-18
- 适用范围：解释并补充 `AI_PM_OS_LOCAL_SHELL_REQUIREMENTS_V1.0.md`

## 33.1 里程碑与优先级

- M1 是 V1 P0 的第一个可演示里程碑，不等于 P0 最终验收。
- V1 P0 是首版正式验收范围，M1 通过后仍须完成第 30.1 节其余 P0 项。
- 项目接管与 PM Audit 属于 V1 能力；P0 只验收入口、模板、基础规则和基础输出，P1 实现深度分析与审计。

## 33.2 输入能力边界

- 系统不是文件解析服务，也不自研 parser、OCR 或扫描件解析后端。
- P0 输入能力继承 Cursor/Codex 当前上下文可访问、可读取、可理解的材料能力，不设格式白名单。
- 可读材料均应被处理并登记，包括但不限于文本、Markdown、TXT、JSON、CSV、DOCX、PDF、截图、transcript 和旧项目文件。
- 无法读取的材料必须登记为 `Needs Readable Input` 或 `Unreadable by Current Agent Context`，请求用户提供可读版本；不得编造或静默忽略。
- `08_INTAKE/` 是归档和暂存区，不是唯一输入入口。

## 33.3 敏捷能力深度

P0 包含完整敏捷文档、数据模型、JSON、Dashboard 展示、报告体现和基础治理检查；不包含网页拖拽、多人协作、完整 Jira 式工作流或自动 Velocity 预测引擎。

## 33.4 报告格式

- 日报：Markdown + HTML；HTML PPT 为按需能力，不属于 P0 强制验收。
- 周报、月报、Steering Committee 报告：Markdown + HTML + HTML PPT。
- HTML PPT 是本地浏览器可打开的分页演示 HTML；P0 不要求导出 `.pptx`。

## 33.5 角色与审批

P0 默认用户本人同时承担 PM Owner、Human Owner、PM Reviewer、Sponsor Approver。项目结构必须支持拆分 Product Owner、Tech Owner、Business Owner、Agile Owner / Scrum Master、UAT Owner 等角色。

以下文件纳入 P0：

- `00_PM_MEMORY/PM_ROLE_CONFIG.md`
- `07_DATA/project_roles.json`

## 33.6 Skill 交付

- P0 交付可手动安装、复制、阅读和维护的 `ai-pm-os` Skill 源码包、项目壳、规则、命令示例和安装说明。
- Cursor 与 Codex 均为 P0 强制支持平台，允许调用方式不同，但必须遵守相同治理规则并生成结构一致的制品。
- 两个平台各至少完成一次真实运行验证。

## 33.7 跨平台与浏览器

- P0 支持 Windows 10/11 与真实 macOS 环境；Linux 不强制验收，但不得主动阻断兼容。
- 禁止写死绝对路径或依赖单一 shell；脚本优先采用 Node.js 跨平台能力。
- Dashboard 支持最新版 Chrome 和 Edge，桌面优先；推荐 1920x1080，最低 1366x768。
- 验收记录必须写明实际 Cursor、Codex、Node.js、npm、Chrome、Edge 和操作系统版本。

## 33.8 同步模型

- P0 不使用 Watchdog、后台监听、定时任务或无人值守同步。
- Skill 在应用正式更新、刷新 Dashboard、生成影响 Dashboard 的报告/会议纪要/To-do 时主动同步。
- Markdown 是权威源；`07_DATA/` 是 JSON 主副本；`06_DASHBOARD/public/data/` 是展示副本。
- 一致性针对关键 ID、状态、版本、审批、数量、日期、Owner、关联关系和路径，不要求自然语言逐字相同。

## 33.9 初始化与 Pending Updates

- 初始化可以直接创建目录、空模板、基础 metadata 和 Draft v0.1 文件。
- 用户材料产生的实质性范围、需求、决策、变更、风险、Sprint 或 Backlog 内容默认先进入 Pending Updates。
- Scope Baseline 初始化状态只能是 Draft / Not Approved；Human Owner 明确批准后才可变为 Approved Baseline。
- 未批准 Scope Baseline 前不得创建正式 WBS 或正式 Coder Work Package。

## 33.10 Git 边界

- 工作区干净时允许关键更新前 checkpoint commit 和更新后 commit。
- Dirty worktree 时必须提示并仅提交本次明确修改的文件；无法判断来源时请求用户确认。
- 不自动 push，不覆盖或混入用户无关修改。

## 33.11 P0 自动验收

P0 必须具备：JSON schema 检查、Markdown/JSON 基础一致性检查、Dashboard build/start smoke test、目录和必要文件检查、Pending Updates 流程检查、Git 初始化检查及 Dashboard 数据副本同步检查。不设置覆盖率百分比。

## 33.12 M1 Demo

M1 必须验证：项目壳复制、Skill 规则触发、初始化、核心 PM/敏捷文件、全局记忆、材料处理、Pending Updates 与审批、会议 transcript、会议纪要、会议 Action/Decision 摘要、To-do、日报、周报三种格式、JSON 同步和 Dashboard 核心模块展示。

M1 不要求完整项目接管、完整 PM Audit、完整网页敏捷操作、Watchdog、Dify、自动通知、云端部署或多人协作。

## 33.13 隐私说明

“本地优先”指项目文件默认保存在本地，不代表 Cursor/Codex 模型推理完全离线。数据是否发送至模型服务取决于用户所使用的平台、账号和隐私配置；README 必须明确此边界。
