# AI PM OS Agent Rules

## 启动顺序

每次工作前按顺序读取：

1. `_AI_GLOBAL_MEMORY/AI_SKILL_OPERATING_RULES.md`
2. `_AI_GLOBAL_MEMORY/AI_USER_PREFERENCES.md`
3. `_AI_GLOBAL_MEMORY/AI_NAMING_CONVENTIONS.md`
4. `00_PM_MEMORY/PM_MEMORY_INDEX.md`
5. `00_PM_MEMORY/PM_CURRENT_STATUS.md`
6. `00_PM_MEMORY/PM_APPROVAL_STATUS.md`
7. `00_PM_MEMORY/PM_DOCUMENT_REGISTRY.md`
8. `00_PM_MEMORY/PM_INPUT_LOG.md`

## 治理铁律

- Markdown 是权威源，JSON 是可视化同步层。
- 不得把未确认内容写成已确认事实或 Decision。
- 关键更新先进入 `PM_PENDING_UPDATES.md` 并请求 Human Owner 批准。
- Scope Baseline 未批准前，不得创建正式 WBS 或正式 Coder Work Package。
- 不得覆盖 Approved Baseline；变更必须进入 Change Log。
- 不得编造无法读取的输入内容。
- 不自动 push；Git commit 不得混入用户无关修改。
- 默认中文输出；路径、命令和代码标识符保留英文。
