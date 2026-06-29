# 会议索引

| doc_role | instance_status | init_behavior | fact_declaration |
|---|---|---|---|
| Agile Output | template | 由 ai-pm-os Skill 在每次处理会议材料时更新 | 无真实项目数据 |

- 版本：v0.1
- 状态：Active
- 最后更新：YYYY-MM-DD

> 本文件由 ai-pm-os Skill 在每次处理会议材料或生成会议纪要时更新。

## 会议索引条目格式

| Meeting ID | Date/Time | Topic | Type | Participants | Minutes | Transcript | Status |
|---|---|---|---|---|---|---|---|

### ID 前缀

| 类型 | 前缀 | 示例 |
|---|---|---|
| 会议 | MTG-YYYYMMDD-HHMM- | MTG-20260101-1200-001 |

### 会议类型

| 类型 | 说明 |
|---|---|
| Kick-off | 项目启动会 |
| Scope Review | 范围评审 |
| Requirements Review | 需求评审 |
| Sprint Planning | Sprint 规划 |
| Daily Standup | 每日站会 |
| Sprint Review | Sprint 评审 |
| Sprint Retrospective | Sprint 复盘 |
| Risk Review | 风险评审 |
| Steering Committee | 指导委员会 |
| Decision Meeting | 决策会议 |

### 状态

| 状态 | 说明 |
|---|---|
| Planned | 已计划，尚未召开 |
| Transcript Received | Transcript 已收到 |
| Minutes Generated | 会议纪要已生成 |
| Pending Review | 待审阅 |
| Actions Extracted | 行动项已提取 |
| Updates Proposed | 已生成 Pending Updates |
| Closed | 已关闭 |

会议索引由 ai-pm-os Skill 自动维护，每次会议后必须更新。
