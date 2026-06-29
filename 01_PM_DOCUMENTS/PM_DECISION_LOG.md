# 决策日志

| doc_role | instance_status | init_behavior | fact_declaration |
|---|---|---|---|
| Project Document Template | template | 由 Project Manager 在决策后填充 | 无真实项目数据 |

- 版本：v0.1
- 状态：Active
- 最后更新：YYYY-MM-DD

> 本文件由 ai-pm-os Skill 持续维护。只记录已明确确认的决策。未确认事项不得写入本文件，必须放入 Pending Updates、RAID 或 Control Summary。

## 决策条目格式

| Decision ID | 决策 | 理由 | 日期 | Owner | 影响 | 来源 | 状态 |
|---|---|---|---|---|---|---|---|

### ID 前缀

| 类型 | 前缀 | 示例 |
|---|---|---|
| 决策 | DEC- | DEC-001 |

### 状态

- **Proposed**：已提出，尚未确认
- **Confirmed**：已明确确认
- **Revisit**：需要重新审议
- **Superseded**：已被新决策替代

决策必须说明理由、影响范围和来源。未确认事项不得写入 Decision Log。
