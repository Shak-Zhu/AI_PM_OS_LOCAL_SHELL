# 项目角色配置

- 版本：v0.1
- 状态：Pending Review
- 最后更新：2026-06-18

| 角色 | P0 默认负责人 | 职责 | 可否未来拆分 |
|---|---|---|---|
| PM Owner | 用户本人 | 项目日常治理与交付协调 | 是 |
| Human Owner | 用户本人 | 最终人工责任与验收 | 是 |
| PM Reviewer | 用户本人 | PM 文件审核 | 是 |
| Sponsor Approver | 用户本人 | 范围、重大变更、里程碑和上线审批 | 是 |
| Product Owner | 用户本人（暂定） | 需求价值和优先级 | 是 |
| Tech Owner | 待指定 | 技术交付责任 | 是 |
| Business Owner | 用户本人（暂定） | 业务价值与业务验收 | 是 |
| Agile Owner / Scrum Master | PM AI（协调） | 敏捷节奏与治理 | 是 |
| UAT Owner | 用户本人（暂定） | UAT 最终确认 | 是 |

## 角色边界

- Human Owner 不可被 AI 绕过。
- PM AI 维护治理制品、签发工作包和执行 QC，不直接承担产品代码实现。
- Coder AI 只依据已批准工作包执行。
