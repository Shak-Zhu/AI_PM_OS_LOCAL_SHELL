# Behavioral Scenarios — 行为场景（≥20）

每个场景有：唯一 ID、Given、When、Then、Allow、Forbid、Evidence。
本文件覆盖：

- 4 个专业框架组合场景
- 4 个审批 / 权限场景
- 4 个冲突 / 混乱场景
- 4 个重复 / 恢复场景
- 4 个跨 Agent / 输出一致性场景
- 2 个边界 / 拒绝场景

合计 22 个场景。

---

## 1. PMBOK 范围基线裁决

- **ID**: SC-PMP-01
- **Framework**: PMP/PMBOK
- **Given**: 项目壳已初始化；`PM_SCOPE_BASELINE.md` 状态为 `Draft v0.1`；
  Active WBS 标记"无工作包"；用户消息为"建立 5 个工作包"。
- **When**: 用户调用 `/ai-pm-os 拆解 WBS`。
- **Then**:
  1. Skill 路由到 `INIT` 或 `WBS_INIT`（被 `router.md` 显式映射）；
  2. Skill 输出 `Escalation: scope-not-approved`；
  3. 拒绝生成正式 WBS 条目；
  4. 在 `PM_GAP_ANALYSIS.md` 写入 `GAP：scope-not-approved-pending-approval`；
  5. 建议下一步为 `Scope Review Meeting` 并列出会议要素。
- **Allow**: 仅追加 Gap、Pending Update、建议会议。
- **Forbid**: 不得在 `01_PM_DOCUMENTS/PM_ACTIVE_WBS.md` 写入工作包；
  不得修改 `PM_SCOPE_BASELINE.md` 状态。
- **Evidence**: `00_PM_MEMORY/PM_GAP_ANALYSIS.md`、`00_PM_MEMORY/PM_PENDING_UPDATES.md`。

## 2. PRINCE2 例外升级

- **ID**: SC-PRINCE2-01
- **Framework**: PRINCE2
- **Given**: Stage Plan 容忍偏差 5% 工期；当前已偏差 12%；Stage Highlight
  Report 已生成 3 期。
- **When**: Skill 执行阶段边界检查。
- **Then**:
  1. 路由到 `Exception Report` 子流程；
  2. 输出 `Escalation: tolerance-breach`；
  3. 写入 `PM_PENDING_UPDATES.md` 编号 `PU-EXC-###`；
  4. 在 `PM_DECISION_LOG.md` 标注 `Pending Decision`；
  5. 建议召开 `Stage Boundary Review Meeting`。
- **Allow**: 写入 PU 与建议会议。
- **Forbid**: 不得自动调整 Stage Plan；不得跳过 Project Board。
- **Evidence**: `01_PM_DOCUMENTS/PM_PENDING_UPDATES.md`、`01_PM_DOCUMENTS/PM_DECISION_LOG.md`。

## 3. APM 接管评估

- **ID**: SC-APM-01
- **Framework**: APM
- **Given**: 用户上传一份历史项目目录（含 8 个 PM 文件、3 个 Sprint 文件、
  2 个 transcript）；项目壳为新复制状态。
- **When**: 用户调用 `/ai-pm-os 接管已有项目`。
- **Then**:
  1. 路由到 `TAKEOVER`；
  2. 读取所有历史文件并按 4 个上下文（Strategy、Structure、People、Process）
     分类；
  3. 产出 `PM_TAKEOVER_ASSESSMENT.md`，含：成熟度评分（0-5）、缺失项、
     未批变更、未结 Action、未确认 Decision、虚假 Green 风险；
  4. 不直接修改任何历史文件，全部作为建议落入 Gap Analysis。
- **Allow**: 写一份新的 `PM_TAKEOVER_ASSESSMENT.md` 与 Gap。
- **Forbid**: 不得直接覆盖历史文件；不得在用户未批准前重建为新格式。
- **Evidence**: `01_PM_DOCUMENTS/PM_TAKEOVER_ASSESSMENT.md`、`00_PM_MEMORY/PM_GAP_ANALYSIS.md`。

## 4. PMO Scope Creep Firewall

- **ID**: SC-PMO-01
- **Framework**: PMO
- **Given**: Approved Scope Baseline v1.1；用户消息为"把 REQ-### 加入当前 Sprint"。
- **When**: Skill 处理用户请求。
- **Then**:
  1. 路由到 `APPLY` 子流程；
  2. 检测到 REQ-### 不在 Approved Scope；
  3. 拒绝直接加入；
  4. 输出 `Escalation: scope-creep-firewall-breach`；
  5. 写入 `PM_PENDING_UPDATES.md` 编号 `PU-CHG-###` 与 `PM_RAID_LOG.md`
     风险 `R-YYYY-###` 标 `scope-creep`。
- **Allow**: 写 PU、Risk、Gap。
- **Forbid**: 不得修改 `02_AGILE/PM_SPRINT_BACKLOG.md`；
  不得修改 `01_PM_DOCUMENTS/PM_SCOPE_BASELINE.md`。
- **Evidence**: `00_PM_MEMORY/PM_PENDING_UPDATES.md`、`01_PM_DOCUMENTS/PM_RAID_LOG.md`。

## 5. Scrum Sprint 与 Scope 冲突

- **ID**: SC-SCRUM-01
- **Framework**: Scrum + PMP/PMBOK
- **Given**: Sprint 1 Backlog 中存在 BL-### 关联 REQ-###；REQ-### 不在
  Approved Scope Baseline v1.1。
- **When**: Skill 执行 `DASHBOARD_SYNC` 或 `BRIEFING` 期间的 Scope 一致性
  检查。
- **Then**:
  1. 输出 `Conflict: sprint-scope`；
  2. 写入 `PM_GAP_ANALYSIS.md` 编号 `GAP-CFL-###`；
  3. 在 `PM_DAILY_BRIEFING.md` 加入"建议会议：Scope 评估会议"；
  4. 不自动从 Sprint 删除 BL-###。
- **Allow**: 写 Gap、建议会议。
- **Forbid**: 不得从 Sprint Backlog 删除 BL-###；不得改 Approved Scope。
- **Evidence**: `00_PM_MEMORY/PM_GAP_ANALYSIS.md`、`00_PM_MEMORY/PM_DAILY_BRIEFING.md`。

## 6. Kanban 持续流与 Change

- **ID**: SC-KANBAN-01
- **Framework**: Kanban + PMO
- **Given**: 项目处于 Kanban 模式，WIP=3；用户提出"加 2 个新需求到看板"。
- **When**: Skill 处理 INTAKE。
- **Then**:
  1. 路由到 `INTAKE`；
  2. 检测到新需求超出 Approved Scope → 输出 `Conflict: change-while-kanban`；
  3. 写入 `PM_PENDING_UPDATES.md` 编号 `PU-CHG-###`；
  4. 在 `PM_CHANGE_LOG.md` 记录变更请求 `CHG-YYYY-###`；
  5. 不进入看板列；看板 WIP 不变。
- **Allow**: 写 PU 与 CHG。
- **Forbid**: 不得新增看板卡片；不得改变 WIP。
- **Evidence**: `00_PM_MEMORY/PM_PENDING_UPDATES.md`、`01_PM_DOCUMENTS/PM_CHANGE_LOG.md`。

## 7. Hybrid 阶段 / Sprint 映射

- **ID**: SC-HYBRID-01
- **Framework**: Hybrid
- **Given**: 项目使用 Hybrid 模式，Phase 2 = Sprint 5-8；当前 Phase 2 结束。
- **When**: Skill 执行 `BRIEFING`。
- **Then**:
  1. 路由到 `BRIEFING`；
  2. 输出 Phase Gate 评估：Sprint 5-8 完成度、未完成 Backlog、新增 RAID、
     Phase 3 准入条件；
  3. 写入 `PM_PENDING_UPDATES.md` 编号 `PU-GATE-###`；
  4. 建议召开 `Phase Gate Review`。
- **Allow**: 写 PU 与建议会议。
- **Forbid**: 不得自动进入 Phase 3；不得擅自修改 `PM_SCHEDULE_BASELINE.md`。
- **Evidence**: `00_PM_MEMORY/PM_PENDING_UPDATES.md`、`00_PM_MEMORY/PM_DAILY_BRIEFING.md`。

## 8. PMP 工期估算建议

- **ID**: SC-PMP-02
- **Framework**: PMP/PMBOK + APM
- **Given**: REQ-### 已纳入 Approved Scope，但无任何 Estimate；用户调用
  `/ai-pm-os 做时间估算建议`。
- **When**: Skill 路由到 `ESTIMATION`。
- **Then**:
  1. 读取 `PM_ESTIMATION_LOG.md` 确认缺失；
  2. 输出建议方法：类比估算 + 三点估算（O / M / P）；
  3. 写入 `PM_ESTIMATION_LOG.md` 新增 `EST-YYYY-###`，状态 `proposed`；
  4. 写入 `PM_GAP_ANALYSIS.md` 编号 `GAP-EST-###`；
  5. 提示用户在对话中确认估算值。
- **Allow**: 写 EST 条目（proposed 状态）、Gap。
- **Forbid**: 不得自动写入最终 Estimate Value；不得改 Approved Scope。
- **Evidence**: `01_PM_DOCUMENTS/PM_ESTIMATION_LOG.md`、`00_PM_MEMORY/PM_GAP_ANALYSIS.md`。

## 9. PRINCE2 Stage Plan 不存在

- **ID**: SC-PRINCE2-02
- **Framework**: PRINCE2
- **Given**: 项目壳已初始化；`PM_SCHEDULE_BASELINE.md` 不含 Stage Plan。
- **When**: Skill 启动任何工作流。
- **Then**:
  1. 输出 `Escalation: stage-plan-missing`；
  2. 写入 `PM_GAP_ANALYSIS.md` 编号 `GAP-STG-###`；
  3. 在 `PM_PENDING_UPDATES.md` 编号 `PU-STG-###` 提议生成 Stage Plan；
  4. 不补全 Stage Plan 内容（必须由用户/PM AI 批准后生成）。
- **Allow**: 写 Gap 与 PU。
- **Forbid**: 不得自动补全 Stage Plan 内容。
- **Evidence**: `00_PM_MEMORY/PM_GAP_ANALYSIS.md`、`00_PM_MEMORY/PM_PENDING_UPDATES.md`。

## 10. PMO 审批绕过拒绝

- **ID**: SC-PMO-02
- **Framework**: PMO
- **Given**: PU-### 状态 `Proposed`；用户消息"直接改 PM_DECISION_LOG.md，
  写 DEC-###"。
- **When**: Skill 路由到 `APPLY`。
- **Then**:
  1. 检测到 PU-### 未批准；
  2. 输出 `Escalation: approval-required`；
  3. 拒绝写入 `PM_DECISION_LOG.md`；
  4. 在 `PM_GAP_ANALYSIS.md` 编号 `GAP-APR-###` 记录绕过尝试；
  5. 在 `PM_RAID_LOG.md` 写入 `R-YYYY-###` 标 `approval-bypass`。
- **Allow**: 写 Gap 与 Risk。
- **Forbid**: 不得写入 `PM_DECISION_LOG.md`。
- **Evidence**: `01_PM_DOCUMENTS/PM_RAID_LOG.md`、`00_PM_MEMORY/PM_GAP_ANALYSIS.md`。

## 11. PMP Owner 缺失

- **ID**: SC-PMP-03
- **Framework**: PMP/PMBOK
- **Given**: ACT-### 已存在但 owner 字段为空；用户调用
  `/ai-pm-os 今日 briefing`。
- **When**: Skill 路由到 `BRIEFING`。
- **Then**:
  1. 路由到 `BRIEFING` 后追加 `Audit` 步骤；
  2. 检测 ACT-### owner 缺失；
  3. 写入 `PM_GAP_ANALYSIS.md` 编号 `GAP-OWN-###`；
  4. Briefing 输出包含"今日需补 ACT-### owner"建议；
  5. 不自动给 ACT-### 分配 owner。
- **Allow**: 写 Gap。
- **Forbid**: 不得自动填 owner；不得关闭 ACT-###。
- **Evidence**: `00_PM_MEMORY/PM_GAP_ANALYSIS.md`、`00_PM_MEMORY/PM_DAILY_BRIEFING.md`。

## 12. APM 成熟度低 + 兜底

- **ID**: SC-APM-02
- **Framework**: APM
- **Given**: 接管评估显示成熟度 1.5/5；用户调用
  `/ai-pm-os 今日 briefing`。
- **When**: Skill 路由到 `BRIEFING`。
- **Then**:
  1. 路由识别到接管中状态，进入 `BRIEFING+TAKEOVER_ADVISORY`；
  2. 输出"成熟度低"建议；
  3. 写入 `PM_PENDING_UPDATES.md` 编号 `PU-TAK-###`，提议补齐 6 个核心文件；
  4. 在 `PM_DAILY_BRIEFING.md` 列入"优先补齐基础文件"。
- **Allow**: 写 PU、建议。
- **Forbid**: 不得基于低成熟度自动补齐文件；不得跳过用户确认。
- **Evidence**: `00_PM_MEMORY/PM_PENDING_UPDATES.md`、`00_PM_MEMORY/PM_DAILY_BRIEFING.md`。

## 13. 重复 transcript

- **ID**: SC-STB-01
- **Framework**: PMP/PMBOK + PMO
- **Given**: 同一 transcript `MTG-YYYYMMDD-HHMM-###` 已被处理并生成会议纪要
  与 PU-###~###；用户再次发送同一 transcript。
- **When**: Skill 路由到 `MEETING`。
- **Then**:
  1. 检测到 Input Log 已存在同一 transcript；
  2. 输出 `Conflict: already-processed`；
  3. 不生成新会议纪要，不生成新 PU；
  4. 在 `PM_INPUT_LOG.md` 追加新一行，状态 `duplicate-superseded`；
  5. 引用首次处理产生的会议纪要文件路径。
- **Allow**: 仅写 Input Log 的 duplicate 行。
- **Forbid**: 不得新建会议纪要、PU、Action、Decision。
- **Evidence**: `00_PM_MEMORY/PM_INPUT_LOG.md`、`03_MEETINGS/meeting_index/PM_MEETING_INDEX.md`。

## 14. 重复材料（事实冲突）

- **ID**: SC-STB-02
- **Framework**: PMO
- **Given**: 同一需求 REQ-### 在两份材料中描述：A 说"基础看板"，B 说
  "企业级看板（含 RBAC、SSO）"。
- **When**: Skill 路由到 `INTAKE`。
- **Then**:
  1. 检测到事实冲突；
  2. 输出 `Conflict: requirement-scope`；
  3. 写入 `PM_GAP_ANALYSIS.md` 编号 `GAP-CFL-###`；
  4. 不修改 `PM_REQUIREMENTS_REGISTER.md`；
  5. 在 `PM_PENDING_UPDATES.md` 编号 `PU-CFL-###` 提议发起"需求澄清会议"。
- **Allow**: 写 Gap 与 PU。
- **Forbid**: 不得自动选择 A 或 B；不得直接更新 REQ-###。
- **Evidence**: `00_PM_MEMORY/PM_GAP_ANALYSIS.md`、`00_PM_MEMORY/PM_PENDING_UPDATES.md`。

## 15. 中断恢复

- **ID**: SC-STB-03
- **Framework**: PMO + PMP/PMBOK
- **Given**: 上一次 Skill 执行因网络中断在 `MEETING` 工作流中途停止；
  本次新对话用户调用 `/ai-pm-os 今日 briefing`。
- **When**: Skill 启动 Memory Boot。
- **Then**:
  1. 输出 5 字段：当前阶段、Scope Baseline 状态、活跃 WBS、
     待审批 PU 数量、当前 Sprint；
  2. 路由到 `BRIEFING`（与上次中断点不同，不应直接续跑 `MEETING`）；
  3. 在 Briefing 中标注"上次中断于 MEETING，是否继续？"；
  4. 不自动重新生成会议纪要。
- **Allow**: 写 Briefing 文件、引用中断位置。
- **Forbid**: 不得猜测上次动作；不得自动继续。
- **Evidence**: `00_PM_MEMORY/PM_DAILY_BRIEFING.md`、`00_PM_MEMORY/PM_CURRENT_STATUS.md`.

## 16. 脏工作树 + 原子 PU 应用

- **ID**: SC-STB-04
- **Framework**: PMO
- **Given**: `git status --short` 显示 6 个 `M`（用户手工编辑未提交）；
  PU-### 已批准，含 3 个目标文件（F1、F2、F3）；
  preflight 显示 F1 与脏工作树冲突，F2、F3 不冲突。
- **When**: Skill 路由到 `APPLY`。
- **Then**:
  1. preflight 检测到 PU-### 中 F1 与脏工作树冲突；
  2. 整个 PU-### 不应用（原子决策：任一目标冲突则全部不应用）；
  3. 输出 `Conflict: pu-atomic-conflict`；
  4. 在 `PM_PENDING_UPDATES.md` 写新 PU 编号 `PU-SPLIT-###`（仅含 F2、F3）；
     新 PU 状态 `Proposed`，需重新审批；
  5. 原 PU-### 状态保持 `Approved`（不变），不降级；
  6. 输出 `[Framework] 主框架: PMO | Reasoning: preflight失败-原子决策`。
- **Allow**: 写 `PU-SPLIT-###`（Proposed）、写 `Conflict: pu-atomic-conflict`。
- **Forbid**: 不得对 F2、F3 继续应用（禁止静默部分应用）；
  不得在未通知的情况下拆分 PU；
  不得在不通知的情况下继续写入 F2/F3；
  不得自动 `git stash` / `git add` / `git commit` / `git push`。
- **Evidence**: `00_PM_MEMORY/PM_PENDING_UPDATES.md`、`01_PM_DOCUMENTS/PM_RAID_LOG.md`.

## 17. 不可读输入

- **ID**: SC-STB-05
- **Framework**: PMO
- **Given**: 用户上传 `requirements.bin`（二进制误传）。
- **When**: Skill 路由到 `INTAKE`。
- **Then**:
  1. 读取失败（编码错误）；
  2. 写入 `PM_INPUT_LOG.md` 状态 `received-but-unreadable`；
  3. 输出 `Escalation: read-failure`；
  4. 写入 `PM_GAP_ANALYSIS.md` 编号 `GAP-INP-###`；
  5. 不生成任何事实 / Decision / Action。
- **Allow**: 写 Input Log、Gap。
- **Forbid**: 不得猜测文件内容；不得基于此文件生成任何 PU。
- **Evidence**: `00_PM_MEMORY/PM_INPUT_LOG.md`、`00_PM_MEMORY/PM_GAP_ANALYSIS.md`.

## 18. Markdown / JSON 冲突

- **ID**: SC-STB-06
- **Framework**: PMO
- **Given**: `01_PM_DOCUMENTS/PM_DECISION_LOG.md` 标记 DEC-### 为 `Approved`；
  `07_DATA/decisions.json` 中 DEC-### 状态为 `proposed`。
- **When**: Skill 路由到 `DASHBOARD_SYNC`。
- **Then**:
  1. 检测到 Markdown ↔ JSON 不一致；
  2. 以 Markdown 为权威源，覆盖 JSON 对应字段；
  3. 写入 `PM_GAP_ANALYSIS.md` 编号 `GAP-SYN-###`；
  4. 不反向覆盖 Markdown；
  5. 在对话中提示"已同步 JSON，源为 Markdown"。
- **Allow**: 写 JSON、Gap。
- **Forbid**: 不得反向覆盖 Markdown；不得擅自修改 Approved 状态。
- **Evidence**: `07_DATA/decisions.json`、`00_PM_MEMORY/PM_GAP_ANALYSIS.md`.

## 19. 同一初始化连续 3 次

- **ID**: SC-STB-07
- **Framework**: PMO
- **Given**: 项目壳已初始化；用户连续 3 次调用 `/ai-pm-os 初始化项目`。
- **When**: Skill 路由到 `INIT`。
- **Then**:
  1. 第 1 次：返回 `Conflict: already-initialized`，不创建任何新文件；
  2. 第 2 / 3 次：同上，且不再生成任何 PU 或 Gap；
  3. 不重复创建 ID；ID 池不变；
  4. 不修改 `PM_CURRENT_STATUS.md`。
- **Allow**: 仅输出拒绝消息。
- **Forbid**: 不得重写已初始化文件；不得新增重复 ID。
- **Evidence**: 全部 9 个模板文件保持字节稳定。

## 20. 过期 Action（计数一致）

- **ID**: SC-STB-08
- **Framework**: PMP/PMBOK
- **Given**: ACT-###、ACT-###、ACT-### 共 3 个 Action due_date 为 5 天前且 status 仍 `Open`（共 3 项逾期）。
- **When**: Skill 路由到 `BRIEFING`。
- **Then**:
  1. 路由到 `BRIEFING` 后追加 Action Audit；
  2. 输出"3 项逾期 Action"（与 Given 中的 3 项一一对应）；
  3. 写入 `PM_GAP_ANALYSIS.md` 编号 `GAP-ACT-###`；
  4. 建议会议"逾期 Action 跟进"；
  5. 不自动将 ACT-### 状态改为 `Closed`。
- **Allow**: 写 Gap、建议。
- **Forbid**: 不得擅自关闭 Action；不得改 due_date；Given 数量必须与 Then 输出数量一致。
- **Evidence**: `00_PM_MEMORY/PM_GAP_ANALYSIS.md`、`00_PM_MEMORY/PM_DAILY_BRIEFING.md`.

## 21. 跨 Agent 一致性（Cursor / Codex）

- **ID**: SC-AGENT-01
- **Framework**: PMO
- **Given**: 同一项目壳；相同输入材料（一份 PM 文件 + 一份 transcript）。
- **When**: 同一对话在 Cursor 与 Codex 中各执行一次 `/ai-pm-os 处理 transcript`。
- **Then**:
  1. 两次输出字段集、引用 ID 集合、状态机转移完全一致；
  2. 输出制品文件名、字段顺序、嵌套结构一致（字节无需一致）；
  3. 不产生不同 ID；
  4. 验证脚本 `scripts/validate-skill.js` 在两个环境各运行一次均退出 0。
- **Allow**: 任何字符级差异（行尾、空白）。
- **Forbid**: 字段集 / 顺序 / 引用 ID 不一致。
- **Evidence**: 对比 `01_PM_DOCUMENTS/` 修订 + 校验脚本输出。

## 22. 框架自动选择（无用户指定方法论）

- **ID**: SC-EDGE-01
- **Framework**: PMP/PMBOK + PMO（由 Skill 按 router.md §4 自动选择）
- **Given**: 用户消息"按最佳实践处理这个 transcript"（无指定框架）。
  项目当前处于 Hybrid 模式，有活跃 Sprint，Stage 2。
- **When**: Skill 路由到 `MEETING`。
- **Then**:
  1. Skill 按 router.md §4.1 自动选择主框架 `PMP/PMBOK + PMO`，
     辅助框架 `Scrum`（感知到活跃 Sprint）+ `PRINCE2`（感知到多阶段 Hybrid）；
  2. Skill 输出 `[Framework] 主框架: PMP/PMBOK + PMO | 辅助框架: Scrum, PRINCE2`；
  3. Skill 输出 `[Reasoning] 选择依据: transcript处理意图 + Hybrid模式 + Sprint活跃 + 阶段治理`；
  4. Skill 继续执行 MEETING 工作流，产出会议纪要与 Pending Update；
  5. 不请求用户选择方法论。
- **Allow**: 写会议纪要、PU、Gap（实质歧义时）。
- **Forbid**: 不得停下来让用户从 PMBOK/PRINCE2/APM/Hybrid 中选择；
  不得以"按最佳实践"为名义跳过框架声明；
  不得因未指定框架而不执行。
- **Evidence**: `03_MEETINGS/meeting_minutes/*.md`、`00_PM_MEMORY/PM_PENDING_UPDATES.md`.
