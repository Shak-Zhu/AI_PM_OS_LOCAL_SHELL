# 项目角色配置

| doc_role | instance_status | init_behavior | fact_declaration |
|---|---|---|---|
| Project Record Template | template | 由 Project Owner 在项目初始化时配置 | 无真实项目数据 |

- 版本：v0.1
- 状态：Draft
- 最后更新：YYYY-MM-DD

> 本文件在项目初始化时由 ai-pm-os Skill 生成。实际角色配置由 Project Owner 确认。
> 角色按需配置，不要求全部存在。

## 角色配置条目

| 角色 | P0 默认负责人 | 职责 | 可否未来拆分 |
|---|---|---|---|
| Project Owner | `INITIALIZE_PROJECT` | 最终人工责任与验收 | 是 |
| Project Manager | `INITIALIZE_PROJECT` | 项目日常治理与交付协调 | 是 |
| Sponsor | `INITIALIZE_PROJECT` | 资源承诺与组织层支持 | 是 |
| Product Owner | `INITIALIZE_PROJECT` | 需求价值和优先级 | 是 |
| Delivery Owner | `INITIALIZE_PROJECT` | 交付节奏与可部署性 | 是 |
| Business Owner | `INITIALIZE_PROJECT` | 业务价值与业务验收 | 是 |
| Technical Owner | `INITIALIZE_PROJECT` | 技术架构与实现质量 | 是 |
| Scrum Master | `INITIALIZE_PROJECT` | 敏捷仪式与团队 impediments | 是 |
| UAT Owner | `INITIALIZE_PROJECT` | UAT 最终确认 | 是 |
| Approver | `INITIALIZE_PROJECT` | 范围、重大变更、里程碑和上线审批 | 是 |

## 角色边界

- 审批结果由 Project Owner 转达给 Copilot，Copilot 不得自行批准。
- 审批可拆分：不同审批维度可由不同角色分别审批，审批状态独立追踪。
