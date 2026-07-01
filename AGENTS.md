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
9. `00_PM_MEMORY/PM_ACTIVE_CONTEXT.md`

## 六层 Memory 权威层级

完整定义见 `ai-pm-os/references/memory-and-recovery.md`。优先级顺序：

1. **Approved Baseline (L1)** — 最高权威；只读；不得覆盖
2. **Formal Markdown Hot Memory (L2)** — 次高；Skill 读写
3. **Approved Pending Update 记录 (L3)** — 中；执行后转 L1/L2
4. **Active Context (L4)** — 低；会话级；不得覆盖 L1/L2/L3
5. **Pending / Gap (L5)** — 低；追踪待确认事项
6. **Git Evidence (L6)** — 参考；只读

**禁止**：Active Context 覆盖 Approved Baseline；禁止依赖对话记忆恢复事实。

## Skill 入口

`ai-pm-os` Skill 的权威源码位于项目根目录的 `ai-pm-os/`。在执行 Skill
之前，必须：

1. 读取 `ai-pm-os/SKILL.md` 了解执行循环与失败升级。
2. 读取 `ai-pm-os/references/memory-and-recovery.md` 了解 Memory Boot 与恢复协议；
   包含 `REQUIRED_MEMORY_BOOT_FILES` 定义的 9 个必需文件及 3 Global + 6 PM Memory 数量口径。
3. 读取 `ai-pm-os/references/framework-matrix.md` 选用合适的专业框架组合。
4. 读取 `ai-pm-os/references/router.md` 完成意图路由与前置门检查。
5. 读取 `ai-pm-os/references/fact-layers.md` 标注事实层级。
6. 读取 `ai-pm-os/references/stability-rules.md` 处理重复 / 冲突 / 恢复 / 脏工作树。
7. 读取 `ai-pm-os/references/agile-delivery-rules.md` 执行敏捷交付治理。
8. 读取 `ai-pm-os/scenarios/scenarios.md` 校验行为与基准场景一致。
9. 读取 `ai-pm-os/references/runtime-compliance-contracts.md` 处理关键输出契约与 Pre-send Compliance Gate；
   6 类审批（Scope Baseline / Pending Update / Change / Major Decision / Milestone-Release / UAT）必须满足 11 字段 + 来源校验；
   `one-click-copy = 完整正文单代码块`；不得依赖聊天记忆替代正式规则。

## Cooper Helper Bootstrap

Cooper helper 是可选的 Cooper MCP 集成组件。在 Memory Boot 后、正常意图路由前，
检查 helper 是否已安装：

- **自动触发**：首次调用 ai-pm-os 时，在 Memory Boot 完成后自动运行：
  ```
  node ai-pm-os/scripts/bootstrap-cooper-helper.js
  ```
- 已安装 → 永久跳过（状态 `installed`），不调用 runner。
- 未安装且无 deferred/unavailable 状态 → 只允许固定安装命令之一：
  - `d-skills add cooper-mcp-helper`
  - `npx --yes --registry=http://npm.intra.xiaojukeji.com d-skills@latest add cooper-mcp-helper`
- deferred/unavailable → 非阻塞，正常 Skill 工作流继续，不自动重试。
- 成功安装后要求重启 Cursor/Codex，再引导配置和验证。
- **重试**：只有用户明确说"重试 Cooper 安装"时，才运行：
  ```
  node ai-pm-os/scripts/bootstrap-cooper-helper.js --retry
  ```
- bootstrap 非 0 或 unavailable 不得阻断本次正常项目管理请求。

详见 `ai-pm-os/references/cooper-helper-bootstrap.md`。

## 统一 Remote Intake

本产品支持八种并列输入方式，不是自动回退链：

| 方式 | 说明 |
|---|---|
| `local_file` | 本地文件 |
| `pasted_text` | 直接粘贴文本 |
| `chat_upload` | 对话界面文件上传 |
| `transcript` | 上一轮 Chat Transcript 引用 |
| `screenshot` | 截图粘贴 |
| `print_pdf` | 用户 Print 的 PDF 文件 |
| `cooper` | Cooper MCP 读取（需首次安装引导） |
| `browser_url` | 用户指定浏览器 URL |

详细行为契约见 `ai-pm-os/references/remote-intake-rules.md`。

不得越过上述文件直接猜测 Skill 行为；不得删除或弱化 `ai-pm-os/` 中
任何强制条目。Skill 内核破坏时 `scripts/validate-skill.js` 必退出非 0。

## 治理铁律

- Markdown 是权威源，JSON 是可视化同步层。
- 不得把未确认内容写成已确认事实或 Decision。
- 关键更新先进入 `PM_PENDING_UPDATES.md` 并请求 Project Owner 批准。
- Scope Baseline 未批准前，不得创建正式 WBS。
- 不得覆盖 Approved Baseline；变更必须进入 Change Log。
- 不得编造无法读取的输入内容。
- 不自动 push；Git commit 不得混入用户无关修改。
- 默认中文输出；路径、命令和代码标识符保留英文。
