# 项目角色配置

- 版本：v0.1
- 状态：Draft
- 最后更新：YYYY-MM-DD

> 本文件在项目初始化时由 ai-pm-os Skill 生成。实际角色配置由 Human Owner 确认。

## 角色配置条目

| 角色 | P0 默认负责人 | 职责 | 可否未来拆分 |
|---|---|---|---|
| PM Owner | `INITIALIZE_PROJECT` | 项目日常治理与交付协调 | 是 |
| Human Owner | `INITIALIZE_PROJECT` | 最终人工责任与验收 | 是 |
| PM Reviewer | `INITIALIZE_PROJECT` | PM 文件审核 | 是 |
| Sponsor Approver | `INITIALIZE_PROJECT` | 范围、重大变更、里程碑和上线审批 | 是 |
| Product Owner | `INITIALIZE_PROJECT` | 需求价值和优先级 | 是 |
| Tech Owner | `INITIALIZE_PROJECT` | 技术交付责任 | 是 |
| Business Owner | `INITIALIZE_PROJECT` | 业务价值与业务验收 | 是 |
| Agile Owner / Scrum Master | `INITIALIZE_PROJECT` | 敏捷节奏与治理 | 是 |
| UAT Owner | `INITIALIZE_PROJECT` | UAT 最终确认 | 是 |

## 角色边界

- Human Owner 不可被 AI 绕过。
- PM AI 维护项目治理制品，不直接承担项目交付实现。
- 只有 Human Owner 明确启用 AI Coder 委派时，PM AI 才签发 Coder Work Package 并执行相应 QC。
- 未启用 AI Coder 委派时，不创建 Coder Work Package 或 PM/QC 代码审查记录。
- 启用后，Coder AI 只依据已授权工作包执行，不得自行改变 Approved Scope。
- 审批可拆分：同一工作包可由不同角色分别审批不同维度，审批状态独立追踪。
