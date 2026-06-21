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

## Skill 入口

`ai-pm-os` Skill 的权威源码位于项目根目录的 `ai-pm-os/`。在执行 Skill
之前，必须：

1. 读取 `ai-pm-os/SKILL.md` 了解执行循环与失败升级。
2. 读取 `ai-pm-os/references/framework-matrix.md` 选用合适的专业框架组合。
3. 读取 `ai-pm-os/references/router.md` 完成意图路由与前置门检查。
4. 读取 `ai-pm-os/references/fact-layers.md` 标注事实层级。
5. 读取 `ai-pm-os/references/stability-rules.md` 处理重复 / 冲突 / 恢复 / 脏工作树。
6. 读取 `ai-pm-os/scenarios/scenarios.md` 校验行为与基准场景一致。

不得越过上述文件直接猜测 Skill 行为；不得删除或弱化 `ai-pm-os/` 中
任何强制条目。Skill 内核破坏时 `scripts/validate-skill.js` 必退出非 0。

## 治理铁律

- Markdown 是权威源，JSON 是可视化同步层。
- 不得把未确认内容写成已确认事实或 Decision。
- 关键更新先进入 `PM_PENDING_UPDATES.md` 并请求 Human Owner 批准。
- Scope Baseline 未批准前，不得创建正式 WBS 或正式 Coder Work Package。
- 不得覆盖 Approved Baseline；变更必须进入 Change Log。
- 不得编造无法读取的输入内容。
- 不自动 push；Git commit 不得混入用户无关修改。
- 默认中文输出；路径、命令和代码标识符保留英文。
