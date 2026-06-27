# P0 Governance Evidence Matrix

| 字段 | 内容 |
|---|---|
| 版本 | v1.3 |
| 日期 | 2026-06-27 |
| 状态 | Active |
| 对应需求 | REQ-004、REQ-005、REQ-006、REQ-007、REQ-008、REQ-028 |

> **重要说明**：本矩阵区分**规则存在性证据**（静态契约验证）和**行为正确性证据**（动态运行验证）。verify-governance.js 提供规则存在性验证。行为验证引用已有工作包的动态测试证据。

---

## 1. REQ-004 — Markdown 权威项目文件

| 项目 | 内容 |
|---|---|
| **验收标准** | 冲突测试中以 Markdown 修复 JSON，且不反向覆盖基线 |
| **Evidence Type** | 规则存在性证据 |
| **Evidence File** | `ai-pm-os/references/json-sync-and-audit-rules.md` |
| **Rule/Script** | §1 Authority Direction: Markdown → JSON；JSON → Markdown Forbidden |
| **Validation Command** | `node scripts/verify-governance.js` (checkREQ004) |
| **Status** | PASS — 三项子规则全部验证通过 |
| **Behavioral Evidence** | REQ-004 的冲突修复行为已由 WP-006（冲突治理）Human Accepted，commit `9aa1d3e`；WP-013（Markdown→JSON 同步）Human Accepted，commit `e13204c` |
| **Known Gap** | 无规则性 Gap；行为 Gap 由对应功能 WP 处理 |

---

## 2. REQ-005 — Pending Updates 审批机制

| 项目 | 内容 |
|---|---|
| **验收标准** | 新材料产生 PU；未批准前正式文件不变；批准后状态可追踪 |
| **Evidence Type** | 规则存在性证据 |
| **Evidence File** | `00_PM_MEMORY/PM_PENDING_UPDATES.md` |
| **Rule/Script** | 包含 Proposed、Approved、Rejected、Applied 四状态；强制规则：未经批准不得直接应用 |
| **Validation Command** | `node scripts/verify-governance.js` (checkREQ005) |
| **Status** | PASS — 四状态 + 强制审批规则全部验证通过 |
| **Behavioral Evidence** | PU 生成和应用行为已由 WP-008（材料处理、审批工作流）Human Accepted，commit `c0a3b5b`；WP-011（同步）Human Accepted，commit `e20ab35` |
| **Known Gap** | 无规则性 Gap；PU 模板状态行为已由功能 WP 验证 |

---

## 3. REQ-006 — 角色配置与可拆分审批

| 项目 | 内容 |
|---|---|
| **验收标准** | `PM_ROLE_CONFIG.md` 与 `project_roles.json` 存在且默认/可选角色完整 |
| **Evidence Type** | 规则存在性证据 |
| **Evidence File 1** | `00_PM_MEMORY/PM_ROLE_CONFIG.md` |
| **Evidence File 2** | `07_DATA/project_roles.json` |
| **Rule/Script** | 全部 9 个角色存在；可拆分审批规则；project_roles.json 有意义内容（非空对象） |
| **Validation Command** | `node scripts/verify-governance.js` (checkREQ006) |
| **Status** | PASS — 9 角色 + 可拆分规则 + 有效 JSON 全部验证通过 |
| **Behavioral Evidence** | 角色配置初始化已由 WP-008（项目初始化）Human Accepted，commit `c0a3b5b` |
| **Known Gap** | 无规则性 Gap |

---

## 4. REQ-007 — 统一命名与 ID 系统

| 项目 | 内容 |
|---|---|
| **验收标准** | 自动检查对规定文档、报告和对象 ID 无违规项 |
| **Evidence Type** | 规则存在性证据 |
| **Evidence File** | `_AI_GLOBAL_MEMORY/AI_NAMING_CONVENTIONS.md` |
| **Rule/Script** | 全部 12 个核心 ID 前缀存在：REQ-、R-、A-、I-、D-、ACT-、DEC-、CHG-、PU-、BL-、US-、MTG- |
| **Validation Command** | `node scripts/verify-governance.js` (checkREQ007) |
| **Status** | PASS — 全部 12 个前缀验证通过 |
| **Behavioral Evidence** | 命名违规检测已由 WP-006（冲突治理）Human Accepted，commit `9aa1d3e` |
| **Known Gap** | 无规则性 Gap；动态违规检测行为由功能 WP 验证 |

---

## 5. REQ-008 — 输入材料登记与归档

| 项目 | 内容 |
|---|---|
| **验收标准** | 可读/不可读输入均进入 Input Log；不可读项不生成虚构内容 |
| **Evidence Type** | 规则存在性证据 |
| **Evidence File** | `00_PM_MEMORY/PM_INPUT_LOG.md` |
| **Rule/Script** | Input Log 表结构存在；不可读输入处理规则存在 |
| **Validation Command** | `node scripts/verify-governance.js` (checkREQ008) |
| **Status** | PASS — 结构 + 不可读规则全部验证通过 |
| **Behavioral Evidence** | 输入处理已由 WP-008（材料处理）Human Accepted，commit `c0a3b5b` |
| **Known Gap** | 无规则性 Gap |

---

## 6. REQ-028 — Git checkpoint 与可追溯提交

| 项目 | 内容 |
|---|---|
| **验收标准** | 干净/dirty 两类场景均不混入无关修改且不自动 push |
| **Evidence Type** | 规则存在性证据 + 行为证据 |
| **Evidence File 1** | `.git/` |
| **Evidence File 2** | `scripts/check-pollution.js` |
| **Evidence File 3** | `scripts/verify-release.js` |
| **Evidence File 4** | `ai-pm-os/references/conflict-and-chaos-rules.md`（dirty worktree 规则） |
| **Rule/Script** | Git 已初始化且有有效 commit；dirty worktree 规则存在；两个 QA 脚本存在；verify-governance.js 验证无自动 git add/commit/push |
| **Validation Command** | `node scripts/verify-governance.js` (checkREQ028 + checkNoAutoGitOps) |
| **Status** | PASS — Git 初始化、commit 有效性、dirty worktree 规则、QA 脚本、无自动 Git 操作全部验证通过 |
| **Behavioral Evidence** | WP-006（冲突、脏工作树治理）已 Human Accepted，commit `9aa1d3e`；SC-CHX-10（冲突追踪）、SC-STB-04（稳定性dirty worktree）、SI-24（语义脏工作树场景）已验证 |
| **Known Gap** | 无 |

---

## 7. 验证脚本汇总

| 脚本 | 功能 | 退出码 |
|---|---|---|
| `node scripts/verify-governance.js` | P0 治理规则存在性验证 | 0 = PASS, 1 = FAIL |
| `node scripts/check-pollution.js` | 产品壳污染检查 | 0 = PASS, 1 = FAIL |
| `node scripts/verify-release.js` | 发布边界与复制验证 | 0 = PASS, 1 = FAIL |

---

## 8. 证据分类说明

| 证据类型 | 说明 | 验证方式 |
|---|---|---|
| **规则存在性** | 治理契约文件、字段、结构存在 | `verify-governance.js` 静态验证 |
| **行为正确性** | 工作流执行正确、状态变化符合预期 | 对应功能 WP 动态验证 |

---

## 9. 与 REQ-029 的关系

> **REQ-029（Windows/macOS 跨平台）不通过本证据矩阵收口。**
>
> REQ-029 需要在 macOS 真实环境中执行完整验证，包括：
> - macOS 上复制项目壳
> - 在 macOS 运行 Skill 验证
> - 在 macOS 运行 JSON 同步
> - 在 macOS 启动 Dashboard
> - 在 macOS 运行 Git 回滚测试
>
> 本文件仅验证治理类需求的静态规则完整性，不替代 REQ-029 的 macOS 实测要求。
