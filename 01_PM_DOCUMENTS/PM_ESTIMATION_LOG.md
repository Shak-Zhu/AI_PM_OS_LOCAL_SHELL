# 估算日志

- 版本：v0.1
- 状态：Open / Awaiting Scope Approval
- 最后更新：YYYY-MM-DD

> 本文件由 ai-pm-os Skill 在完成估算后维护。

## 估算条目格式

| Estimate ID | 对象 | 方法 | 值 | 单位 | 信心 | 假设 | 风险 | Estimator | 状态 |
|---|---|---|---|---|---|---|---|---|---|

### ID 前缀

| 类型 | 前缀 | 示例 |
|---|---|---|
| 估算 | EST- | EST-### |

### 估算方法

| 方法 | 适用场景 |
|---|---|
| Expert Judgment | 需求模糊 |
| Analogy | 有历史数据 |
| Bottom-up | 工作包明确 |
| Three-point | 不确定性高 |
| PERT | 复杂估算 |
| Planning Poker | Sprint Story Point |
| Velocity-based | 已有 Sprint 历史 |

估算提醒规则见 `_AI_GLOBAL_MEMORY/AI_ESTIMATION_RULES.md`。
