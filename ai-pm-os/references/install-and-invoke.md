# Install & Invoke — 安装与调用

`ai-pm-os` Skill 的最低限度安装与调用方式。本节假定用户已复制项目壳
并使用 Cursor 或 Codex 打开工作目录。

## 1. 文件布局

```text
<PROJECT_ROOT>/
├── ai-pm-os/
│   ├── SKILL.md
│   ├── references/
│   │   ├── framework-matrix.md
│   │   ├── router.md
│   │   ├── fact-layers.md
│   │   ├── stability-rules.md
│   │   └── install-and-invoke.md
│   └── scenarios/
│       └── scenarios.md
├── scripts/
│   └── validate-skill.js
├── _AI_GLOBAL_MEMORY/
├── 00_PM_MEMORY/
├── 01_PM_DOCUMENTS/
├── 02_AGILE/
├── 03_MEETINGS/
├── 04_TODO/
├── 05_REPORTS/
├── 06_DASHBOARD/        # WP-014 实现后才启用
├── 07_DATA/
├── 08_INTAKE/
├── 09_ARCHIVE/
├── AGENTS.md
├── README.md
└── PRODUCT_SHELL_MANIFEST.md
```

## 2. Cursor 安装

1. 在 Cursor 中打开项目根目录。
2. Cursor 应当自动发现 `ai-pm-os/SKILL.md`（取决于版本与配置）。
3. 在 Agent 对话框使用 `/ai-pm-os` 前缀或自然语言意图。
4. 若 Cursor 未自动发现，将 `ai-pm-os/` 路径加入 Cursor Agent 的
   工作区 / 上下文路径。
5. 验证：在对话框输入 `/ai-pm-os 今日 briefing`，
   期待输出引用了 `PM_CURRENT_STATUS.md` 等文件。

## 3. Codex 安装

1. 在 Codex 中打开项目根目录。
2. 将 `ai-pm-os/SKILL.md` 路径加入 Codex 的 skill 索引（取决于平台与版本）。
3. 调用方式同 Cursor。
4. 验证同 Cursor。

## 4. 最低必要调用

- **Memory Boot** 验证：`/ai-pm-os 今日 briefing` 必须输出当前阶段、Scope
  Baseline 状态、待审批数量三个字段。
- **路由验证**：`/ai-pm-os 初始化项目` 在未初始化项目上必须返回
  `INIT` 工作流，并在已初始化项目上进入 `Conflict: already-initialized`
  而不重复创建。
- **稳定性验证**：`scripts/validate-skill.js` 在干净 shell 上退出 0。

## 5. 验证命令

```bash
node scripts/validate-skill.js
node scripts/check-pollution.js
node --check scripts/validate-skill.js
```

任一失败：禁止投入实际项目使用。

## 6. 平台说明

- 脚本均使用 Node.js 标准库 `fs` / `path`，可运行于 Windows / macOS / Linux。
- 禁止在 Skill 文件中写死绝对路径（包括用户目录、用户名）。
- `_DEV_PROJECT_CONTROL/` 由外层 Git 忽略；Skill 不参与其 Git 操作。

## 7. 升级与维护

- 修改 `ai-pm-os/**` 后必须同步更新 `scripts/validate-skill.js` 的必查列表
  与 `scenarios/scenarios.md` 的对应场景。
- 不得在未更新验证脚本与场景的情况下向用户宣传"已升级"。
- 任何破坏性变更必须先在 `_DEV_PROJECT_CONTROL/pm-ai-reviews/` 走 PM/QC。

## 8. 与控制空间协作

- Skill 的权威规则只读于控制空间 `_DEV_PROJECT_CONTROL/` 中的
  `PM_SKILL_CAPABILITY_BASELINE.md` 与 `PM_SCOPE_BASELINE.md`。
- Skill 不得直接修改控制空间任何文件。
- 控制空间在 `WP-002-RESULT.md` 之外不接受 Cursor 修改。
