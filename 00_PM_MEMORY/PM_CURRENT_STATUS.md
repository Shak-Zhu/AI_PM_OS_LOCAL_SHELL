# 项目当前状态

| doc_role | instance_status | init_behavior | fact_declaration |
|---|---|---|---|
| 当前状态快照 | template | 由 ai-pm-os Skill 在项目初始化后填充 | INITIALIZE_PROJECT 占位符 |

- 版本：v0.1
- 状态：Active
- 最后更新：YYYY-MM-DD

## 状态快照

- 当前阶段：`INITIALIZE_PROJECT`（由 ai-pm-os Skill 初始化后填充）
- RAG：`INITIALIZE_PROJECT`
- Scope Baseline：`INITIALIZE_PROJECT`
- 当前 Sprint：`INITIALIZE_PROJECT`
- 正式 WBS：`INITIALIZE_PROJECT`
- 最新授权：`INITIALIZE_PROJECT`

## 当前阻塞与门禁

1. 项目尚未初始化。调用 `ai-pm-os 初始化项目` 开始。
2. Scope Baseline 未批准前，不得创建正式 WBS。
3. 正式交付物需经过审批后进入 WBS。

## 下一步

1. 调用 `ai-pm-os 初始化项目`。
2. 完成初始化后，审阅生成的项目状态并提供基础信息。
3. 确认 Scope Baseline 范围。
