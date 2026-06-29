# AI PM OS Local Shell — M1 Release Checklist

面向使用者的完整克隆、改名、初始化、Skill 安装和日常操作说明见
`USER_GUIDE.md`。

| 字段 | 内容 |
|---|---|
| 版本 | M1（WP-021 修复版） |
| 日期 | 2026-06-28 |
| 状态 | Ready for Installation |

---

## 1. M1 本地使用前提条件

- Node.js >= 18.x（建议使用 LTS）
- 操作系统：Windows 10+ / macOS 12+ / Ubuntu 20.04+
- Git（用于版本管理，非必需）

---

## 2. Windows 启动步骤

### 2.1 完整安装（本地复制）

```powershell
# 1. 克隆或复制整个项目目录
# 2. 进入项目根目录
cd <PROJECT_ROOT>

# 3. 验证安装（推荐 P0 strict 模式）
node scripts/verify-release.js --strict

# 4. 启动 Dashboard（如需要）
cd 06_DASHBOARD
npm install
npm run sync:data
npm run smoke
npm run dev
```

### 2.2 Skill 独立安装（仅 ai-pm-os/）

```powershell
# 1. 复制 ai-pm-os/ 目录到目标位置

# 2. 验证 Skill 包
cd <TARGET_DIR>
node ai-pm-os/scripts/validate-skill.js
# 期望输出：RESULT: PASS - ai-pm-os Skill is well-formed.
# 退出码：0
```

---

## 3. macOS 启动步骤

> **注意**：以下步骤尚未在 macOS 环境真实执行验证。
> 状态标记：`not executed in this environment`。
> 如需在 macOS 上使用，请在 macOS 终端中执行并验证。

### 3.1 完整安装（本地复制）

```bash
# 1. 克隆或复制整个项目目录
# 2. 进入项目根目录
cd <PROJECT_ROOT>

# 3. 验证安装（推荐 P0 strict 模式）
node scripts/verify-release.js --strict

# 4. 启动 Dashboard（如需要）
cd 06_DASHBOARD
npm install
npm run sync:data
npm run smoke
npm run dev
```

### 3.2 Skill 独立安装（仅 ai-pm-os/）

```bash
# 1. 复制 ai-pm-os/ 目录到目标位置

# 2. 验证 Skill 包
cd <TARGET_DIR>
node ai-pm-os/scripts/validate-skill.js
# 期望输出：RESULT: PASS - ai-pm-os Skill is well-formed.
# 退出码：0
```

---

## 4. Dashboard 启动方式

```bash
# 进入 Dashboard 目录
cd 06_DASHBOARD

# 安装依赖（首次）
npm install

# 同步数据
npm run sync:data

# 运行冒烟测试
npm run smoke

# 开发模式
npm run dev

# 生产构建
npm run build
```

**数据同步说明**：
- `sync:data` 将 `07_DATA/` 中的 JSON 文件同步到 `06_DASHBOARD/public/data/`
- `smoke` 运行冒烟测试验证数据完整性
- `build` 构建生产版本

---

## 5. Skill 安装方式

### 5.1 方式一：本地复制（全量安装）

复制整个项目目录到目标位置。包含：

- `ai-pm-os/` — Skill 包
- `scripts/` — 仓库 QA 适配器（check-pollution.js 等）
- `AGENTS.md` — Agent 治理适配层
- `_AI_GLOBAL_MEMORY/` — 全局记忆适配层
- `00_PM_MEMORY/` — 项目 Memory 数据
- `01_PM_DOCUMENTS/` — 项目文档
- `06_DASHBOARD/` — Dashboard
- `07_DATA/` — 数据同步层

**验证**：

```bash
node scripts/verify-release.js --strict
# 期望：RESULT: PASS（P0 强验收入口）

node scripts/check-pollution.js
# 期望：RESULT: PASS - Product shell is clean.

node scripts/validate-data.js
# 期望：RESULT: PASS - All data contracts valid.
```

### 5.2 方式二：Git URL agent-assisted 安装（仅 ai-pm-os/）

将 `ai-pm-os/` 目录作为独立 Skill 包安装。

**安装步骤**：

1. 将 `ai-pm-os/` 目录（或其所在的独立 Git Repository）配置为 Skill 安装源
2. 在 Cursor/Codex 的 skill 索引中添加 `ai-pm-os/SKILL.md` 路径
3. 使用 `/ai-pm-os` 前缀或等价的自然语言意图调用

**验证**：

```bash
node ai-pm-os/scripts/validate-skill.js
# 期望：RESULT: PASS - ai-pm-os Skill is well-formed.
# 退出码：0
```

**独立模式说明**：
验证器会自动检测执行环境：
- **完整宿主模式**：检测到 `AGENTS.md` 和 `_AI_GLOBAL_MEMORY/` 后，运行全部检查
- **隔离包模式**（仅 `ai-pm-os/` 复制）：宿主文件缺失时自动切换，跳过宿主集成检查，输出 `ISOLATED`，仍退出 0

**仓库级 QA**：
Git URL 安装后，以下命令需要用户额外复制根目录 `scripts/`：
- `scripts/check-pollution.js` — 完整项目壳污染检查
- `scripts/validate-data.js` — JSON 数据验证

---

## 6. 发布边界

以下文件/目录**不得**包含在发布复制物中：

| 排除项 | 说明 |
|---|---|
| `.git/` | Git 版本控制目录 |
| `node_modules/` | 依赖包（各项目独立安装） |
| `dist/` | 构建产物（Dashboard） |
| `06_DASHBOARD/public/data/` | Dashboard 数据（运行时生成） |
| `*.log` | 日志文件 |
| `.DS_Store` | macOS 系统文件 |
| `Thumbs.db` | Windows 系统文件 |

**验证发布边界**：

```bash
node scripts/verify-release.js --strict
# Check 4 会验证复制物中不包含上述排除项
```

---

## 7. P0 Governance Evidence Gate

> **重要说明**：本 Gate 不替代 macOS 真实环境验证，不关闭 REQ-029。

### 7.1 验证 P0 治理证据

```bash
node scripts/verify-governance.js
# 期望：RESULT: PASS，退出码 0
```

### 7.2 覆盖的需求

| 需求 | 说明 |
|---|---|
| REQ-004 | Markdown 权威项目文件 |
| REQ-005 | Pending Updates 审批机制 |
| REQ-006 | 角色配置与可拆分审批 |
| REQ-007 | 统一命名与 ID 系统 |
| REQ-008 | 输入材料登记与归档 |
| REQ-028 | Git checkpoint 与可追溯提交 |

### 7.3 REQ-029 状态

> **REQ-029 not closed** — macOS 真实环境验证尚未执行。

---

## 8. 验证命令参考

| 命令 | 期望结果 |
|---|---|
| `node scripts/verify-governance.js` | RESULT: PASS |
| `node scripts/verify-release.js --strict` | RESULT: PASS |
| `node ai-pm-os/scripts/validate-skill.js` | RESULT: PASS |
| `node scripts/validate-skill.js` | RESULT: PASS |
| `node scripts/check-pollution.js` | RESULT: PASS |
| `node scripts/validate-data.js` | RESULT: PASS |
| `node scripts/sync-data.js` | RESULT: PASS |
| `node scripts/audit-data-consistency.js` | RESULT: PASS |
| `git diff -- 07_DATA/` | 空（无变更） |

---

## 9. 故障排除

### 9.1 Dashboard 构建失败

```bash
cd 06_DASHBOARD
rm -rf node_modules dist
npm install
npm run build
```

### 9.2 Skill 验证失败

```bash
# 检查 Node.js 版本
node --version  # 需 >= 18.x

# 重新验证
node ai-pm-os/scripts/validate-skill.js
```

### 9.3 数据验证失败

```bash
# 检查 07_DATA/ 文件
node scripts/validate-data.js

# 重新同步
node scripts/sync-data.js
```

---

## 9. 文件清单

| 文件 | 用途 |
|---|---|
| `ai-pm-os/SKILL.md` | Skill 主入口 |
| `ai-pm-os/PACKAGE_MANIFEST.md` | 包边界与依赖契约 |
| `ai-pm-os/references/install-and-invoke.md` | 安装与调用详细说明 |
| `ai-pm-os/scripts/validate-skill.js` | 包内验证入口（零依赖） |
| `scripts/verify-governance.js` | P0 治理验证脚本 |
| `scripts/verify-release.js` | 发布验证脚本 |
| `scripts/check-pollution.js` | 仓库污染检查 |
| `RELEASE_CHECKLIST.md` | 本文件 |
