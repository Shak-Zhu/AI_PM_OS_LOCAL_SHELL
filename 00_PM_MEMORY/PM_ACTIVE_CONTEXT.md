# 当前 AI 工作上下文

- 版本：v0.2
- 状态：Active
- 最后更新：YYYY-MM-DD

> 本文件记录当前 AI 工作会话的上下文，避免多窗口混淆。
> 生命周期：创建/刷新 → Checkpoint（正式写入前）→ 写入/更新 → 完成/清空。
> **不得写入本项目真实名称、WP 编号、日期、路径等事实。**

## 当前状态

| 字段 | 内容 | 约束 |
|---|---|---|
| `current_intent` | `INITIALIZE_PROJECT` | 仅作会话跟踪，不得作为正式决策依据 |
| `active_workflow` | `INITIALIZE_PROJECT` | 来自 router.md §1 |
| `last_completed_step` | `INITIALIZE_PROJECT` | 来自 Skill 执行记录 |
| `next_safe_step` | `INITIALIZE_PROJECT` | 来自 router.md + PM_CURRENT_STATUS.md |
| `pending_writes` | `INITIALIZE_PROJECT` | 会话级追踪，会话结束清空 |
| `pending_approvals` | `INITIALIZE_PROJECT` | 来自 PM_PENDING_UPDATES.md |
| `dirty_worktree` | `clean` 或 `dirty` | 来自 `git status` |
| `last_error` | `null` 或错误信息 | 无错误时为 `null` |
| `source_files` | `INITIALIZE_PROJECT` | 记录来源，不得替代正式文件 |
| `updated_at` | `YYYY-MM-DDTHH:MM:SSZ` | ISO 8601 格式 |

## 生命周期

1. **创建/刷新**：启动新工作流时，创建或刷新 Active Context。
2. **Checkpoint**：正式写入前，将 pending_writes 和 dirty_worktree 状态固化。
3. **写入/更新**：Skill 成功写入正式文件后，同步更新 pending_writes。
4. **完成/清空**：工作流正常结束时，清空 pending_writes、last_error、pending_approvals
   （已处理项）；保留 current_intent 供下一步参考。
5. **过期/损坏时重建**：Active Context 损坏或过期超过 1 小时，从 L1/L2 正式文件重建，
   不得从对话记忆补全。

## 权威层级说明

本文档属于 Active Context（L4），**不得**覆盖 L1（已确认基线）或 L2（正式 Markdown 热记忆）。
Active Context 的所有写入在 L1/L2 面前均为临时会话状态。
详见 ai-pm-os/references/memory-and-recovery.md §1。
