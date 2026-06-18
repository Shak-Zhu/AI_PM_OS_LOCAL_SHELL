# 需求登记册

- 版本：v0.1
- 状态：Pending Human Owner Approval
- 最后更新：2026-06-18
- 来源：V1.0 原始需求 + v1.1 补充口径

| ID | 需求 | 优先级 | 类型 | 状态 | In Scope | 验收标准 | 依赖 | 风险 | Owner |
|---|---|---|---|---|---|---|---|---|---|
| REQ-001 | 可复制本地项目壳与规定目录 | P0 | functional | clarified | 是 | 完整性检查确认规定目录和必要文件 100% 存在 | 无已知依赖 | 模板遗漏 | PM Owner |
| REQ-002 | 统一 `ai-pm-os` Skill 源码包 | P0 | functional | clarified | 是 | Cursor、Codex 各成功触发 1 次并生成结构一致制品 | REQ-001 | 平台规则差异 | PM Owner |
| REQ-003 | 全局记忆与项目 Memory Boot | P0 | functional | clarified | 是 | 每次关键流程读取规定文件并报告至少 3 个状态字段 | REQ-001 | 上下文遗漏 | PM Owner |
| REQ-004 | Markdown 权威项目文件 | P0 | governance | clarified | 是 | 冲突测试中以 Markdown 修复 JSON，且不反向覆盖基线 | REQ-001 | 双源误用 | PM Owner |
| REQ-005 | Pending Updates 审批机制 | P0 | governance | clarified | 是 | 新材料产生 PU；未批准前正式文件不变；批准后状态可追踪 | REQ-003 | 审批被绕过 | Human Owner |
| REQ-006 | 角色配置与可拆分审批 | P0 | governance | clarified | 是 | `PM_ROLE_CONFIG.md` 与 `project_roles.json` 存在且默认/可选角色完整 | REQ-001 | 角色不清 | Human Owner |
| REQ-007 | 统一命名与 ID 系统 | P0 | governance | clarified | 是 | 自动检查对规定文档、报告和对象 ID 无违规项 | REQ-001 | 文件混乱 | PM Owner |
| REQ-008 | 输入材料登记与归档 | P0 | operational | clarified | 是 | 可读/不可读输入均进入 Input Log；不可读项不生成虚构内容 | REQ-003 | 底层 Agent 不可读 | PM Owner |
| REQ-009 | 项目初始化工作流 | P0 | functional | clarified | 是 | 一次命令创建 Draft 模板、metadata、JSON 和空工作状态 | REQ-001~008 | 错写已批准状态 | PM Owner |
| REQ-010 | 材料处理工作流 | P0 | functional | clarified | 是 | 测试材料能提取需求/RAID/Action/Gap 并生成 PU | REQ-005,008 | 误解释材料 | PM Owner |
| REQ-011 | 审批更新应用工作流 | P0 | functional | clarified | 是 | 仅批准 PU 被应用，并同步状态、日志和 JSON | REQ-005 | 部分应用错误 | Human Owner |
| REQ-012 | Daily Briefing 与会议建议 | P0 | functional | clarified | 是 | 输出 3-5 个动作、待催办/审批/风险及结构化会议建议 | REQ-003 | 建议无依据 | PM Owner |
| REQ-013 | Gap Analysis 与缺失提醒 | P0 | functional | clarified | 是 | 15 个验收场景中预置缺口均被识别并关联文件/Owner | REQ-003 | 误报漏报 | PM Owner |
| REQ-014 | 基础项目接管 | P0 | functional | clarified | 是 | 有入口/模板并识别已有、缺失、风险、未确认范围和待补信息 | REQ-008 | 输入质量差 | PM Owner |
| REQ-015 | 基础 PM Audit | P0 | functional | clarified | 是 | 检查范围批准、未批变更、逾期 Action、必填字段和明显数据不同步 | REQ-004~007 | 规则覆盖不足 | PM Owner |
| REQ-016 | transcript 处理与专业会议纪要 | P0 | functional | clarified | 是 | 1 份 transcript 同时生成纪要、Action/Decision 摘要、Meeting Index 和 PU | REQ-005,008 | 未确认决策误入正式日志 | PM Owner |
| REQ-017 | 会议治理与会议建议 | P0 | functional | clarified | 是 | 会议建议包含背景、人员、目标、议程、材料、输出和完成标准 | REQ-012,016 | 会议过度 | PM Owner |
| REQ-018 | 每日 To-do 与滚动 | P0 | functional | clarified | 是 | To-do 字段完整；未完成项跨日保留来源并更新状态 | REQ-012 | 状态丢失 | PM Owner |
| REQ-019 | 日报系统 | P0 | reporting | clarified | 是 | 生成 Markdown+HTML，内容只来自当日正式记录 | REQ-018 | 编造内容 | PM Owner |
| REQ-020 | 周报/月报/管理层报告 | P0 | reporting | clarified | 是 | 每类支持 Markdown+HTML+HTML PPT，日期范围与来源可追踪 | REQ-019 | HTML PPT 可移植性 | PM Owner |
| REQ-021 | 完整敏捷文档与数据模型 | P0 | functional | clarified | 是 | 规定 11 类敏捷文档与 JSON 字段存在 | REQ-001 | 过度扩展为 Jira | Product Owner |
| REQ-022 | 敏捷维护与治理检查 | P0 | functional | clarified | 是 | 能维护 Backlog/Sprint/User Story/AC/SP/DoR/DoD 并检测 Scope 冲突 | REQ-005,021 | 未批范围进入 Sprint | Agile Owner |
| REQ-023 | 敏捷报告与图表数据 | P0 | reporting | clarified | 是 | 日/周/月报体现 Sprint/Backlog，燃尽和 Velocity 数据可渲染 | REQ-021,022 | 数据不足 | Agile Owner |
| REQ-024 | JSON 数据主副本 | P0 | data | clarified | 是 | `07_DATA` 所有规定 JSON 存在且通过 schema 检查 | REQ-001,004 | Schema 不完整 | Tech Owner |
| REQ-025 | Markdown/JSON 一致性同步 | P0 | data | clarified | 是 | 核心 ID/状态/版本/审批/数量/Owner/关联/路径一致 | REQ-004,024 | 同步遗漏 | Tech Owner |
| REQ-026 | React/Vite Dashboard | P0 | functional | clarified | 是 | `npm run dev` 可启动且默认地址可访问 | REQ-024 | 依赖/版本问题 | Tech Owner |
| REQ-027 | Dashboard 核心页面与模块 | P0 | functional | clarified | 是 | M1 模块全部显示；P0 规定页面、图表和状态全部可读 | REQ-023~026 | 范围过大 | Tech Owner |
| REQ-028 | Git checkpoint 与可追溯提交 | P0 | operational | clarified | 是 | 干净/dirty 两类场景均不混入无关修改且不自动 push | REQ-001 | 用户改动混入 | PM Owner |
| REQ-029 | Windows/macOS 跨平台 | P0 | non_functional | clarified | 是 | 两个平台完成复制、Skill、同步、Dashboard、Git 回滚实测 | REQ-002,024~028 | 环境不可用 | Tech Owner |
| REQ-030 | 基础自动验收与 M1 Demo | P0 | quality | clarified | 是 | 15 个规定场景全部有通过/失败证据；M1 闭环完整演示 | REQ-001~029 | 测试准备不足 | UAT Owner |
| REQ-031 | 完整项目接管分析 | P1 | functional | proposed | 否（P0） | 形成完整接管评估、重建建议和治理缺口报告 | REQ-014 | P0 膨胀 | PM Owner |
| REQ-032 | 深度 PM Audit | P1 | functional | proposed | 否（P0） | 完成跨文件一致性、整改建议和完整审计报告 | REQ-015 | 审计复杂度 | PM Owner |
| REQ-033 | Dashboard 视觉优化和趋势分析 | P1 | functional | proposed | 否（P0） | 视觉与趋势验收标准另行批准 | REQ-027 | 主观验收 | Product Owner |
| REQ-034 | Watchdog/云/多人/第三方集成 | P2 | functional | parked | 否 | 仅在独立变更批准后定义 | 无已知依赖 | 范围蔓延 | Human Owner |

## Out of Scope 说明

P0 不包含自研 parser/OCR、后台监听、SaaS、账号权限、多人实时协作、原生平台自动安装、完整 Jira 式网页交互、自动通知、数据库、云部署、PDF/DOCX/PPTX 导出或第三方 PM 工具集成。
