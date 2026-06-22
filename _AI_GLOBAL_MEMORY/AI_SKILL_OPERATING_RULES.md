# ai-pm-os Skill 操作规则

- 版本：v0.3
- 状态：Active
- 最后更新：YYYY-MM-DD

每次执行必须完成 Memory Boot、识别意图、读取必要文件、生成制品、验证
门检查、更新项目记忆和输出下一步。Skill 不自研 parser/OCR；它处理当前
Cursor/Codex 上下文可读材料。正式更新后主动同步 JSON；P0 不使用后台
监听。生成 Pending Updates 后必须立即请求用户确认。

## 1. 强制执行循环（memory-and-recovery.md REQUIRED_MEMORY_BOOT_FILES）

1. **Memory Boot**：`ai-pm-os/references/memory-and-recovery.md` 定义的六层信息源 +
   严格读取顺序；`REQUIRED_MEMORY_BOOT_FILES` 定义 Global Rules 层 3 文件 + PM Memory 层 6 文件。
2. **Skill 入口**：`ai-pm-os/SKILL.md` + 8 个 references + 50 个场景。
3. **意图路由**：`ai-pm-os/references/router.md`。
4. **框架选择**：`ai-pm-os/references/framework-matrix.md`，显式标注主框架
   与辅助框架。
5. **事实层级**：`ai-pm-os/references/fact-layers.md`，输出必须标注 `Fact-Layer`。
6. **稳定性**：`ai-pm-os/references/stability-rules.md`，处理重复 / 冲突 /
   恢复 / 脏工作树 / Critical Output Contract 失败关闭。
7. **敏捷交付**：`ai-pm-os/references/agile-delivery-rules.md`，Scrum/Kanban/Hybrid
   行为规则与语义不变量。
8. **场景校验**：`ai-pm-os/scenarios/scenarios.md`，匹配 ≥1 个基准场景（含 SC-COC-01~08 关键输出契约场景）。
9. **Critical Output Contract**：`ai-pm-os/references/runtime-compliance-contracts.md`，
   6 类契约、10 字段、Pre-send Compliance Gate 8 步、双输出事务与错误成功状态禁止。
10. **失败升级**：见 SKILL.md §5；不得静默重试或越权。

## 2. 验证脚本

- `node scripts/validate-skill.js` 必退出 0。
- 删除 / 改名 `ai-pm-os/SKILL.md` 中任一必需能力标签 → 退出 1。
- 删除任一必需 reference（包括新增的 `runtime-compliance-contracts.md`）→ 退出 1。
- 场景数 < 50 → 退出 1。
- 出现平台绝对路径 → 退出 1。
- SI-01~SI-14 任一不满足 → 退出 1。
- SI-14 覆盖 6 类契约、10 字段、8 步门禁、关键语义、双输出失败关闭、错误成功状态。

## 3. 关键边界

- 不得绕过 Pending Updates 直接修改关键正式文件。
- 不得在 Scope Baseline 未批准前进入 Sprint 或拆正式 WBS。
- 不得把会议 transcript 仅作文本总结；必须提取 Action / Decision /
  Risk / Issue / Change / Pending Update。
- 不得编造无法读取的输入内容；不可读输入进入 `received-but-unreadable`。
- 不得在生成 Pending Updates 后跳过对话确认。
- 不得在脏工作树下自动 `git add` / `git commit` / `git push`。
- 不得把"一键复制""简洁""赶快"解释为 path-only 授权。
- 不得在 Pre-send Compliance Gate FAIL 时输出 `issued` / `accepted` / `complete` / `done` / `finished`。
- 不得在缺字段、缺渠道或授权不明时输出错误成功状态。

## 4. 与控制空间协作

- 控制空间 `_DEV_PROJECT_CONTROL/` 由外层 Git 忽略，独立维护 PM baseline。
- Skill 只读控制空间权威文件，不修改。
- 任何破坏性变更必须先在 `_DEV_PROJECT_CONTROL/pm-ai-reviews/` 走 PM/QC。
