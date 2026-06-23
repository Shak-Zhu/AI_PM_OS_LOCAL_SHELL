# Behavioral Scenarios — 行为场景（≥60）

每个场景有：唯一 ID、Given、When、Then、Allow、Forbid、Evidence。
本文件覆盖：

- 4 个专业框架组合场景
- 4 个审批 / 权限场景
- 4 个冲突 / 混乱场景
- 4 个重复 / 恢复场景
- 4 个跨 Agent / 输出一致性场景
- 2 个边界 / 拒绝场景
- 8 个 Memory / Recovery 场景
- 8 个 Critical Output Contract 场景
- 10 个执行完整性场景（幂等、重放、检查点、部分失败恢复）

合计 60 个场景。

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



---

## 23. Scrum DoR 未满足（不得进入 Sprint）

- **ID**: SC-AGILE-DOR-01
- **Framework**: Scrum + Agile Delivery
- **Given**: Sprint Planning 进行中；US-001 状态 Ready；US-001 缺少 Acceptance Criteria（无 AC 列表），Story Point 未估算，无开发 Owner 分配。
- **When**: Skill 执行 AGILE 工作流，检测 US-001 DoR 状态。
- **Then**:
  1. Skill 输出 Gap: story-missing-ac（缺 Acceptance Criteria）+ Gap: story-missing-sp（缺 Story Point）+ Gap: story-missing-owner（缺 Owner）；
  2. Skill 不得将 US-001 标记为 committed 进入 Sprint Backlog；
  3. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-AGILE-001，记录三处缺口；
  4. Skill 建议 PO 在 US-001 满足 DoR 前不得将其纳入 committed Sprint Backlog。
- **Allow**: 写 Gap、建议 PO 补充 DoR 检查项。
- **Forbid**: 不得将 US-001 标记为 committed；不得伪造缺失字段值（自动填入 AC/SP/Owner）；不得跳过 DoR Gate。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、02_AGILE/PM_SPRINT_BACKLOG.md。

## 24. Scrum DoD 未满足（不得标记 Done）

- **ID**: SC-AGILE-DOD-01
- **Framework**: Scrum + Agile Delivery
- **Given**: Sprint 3 结束；US-005 状态为 In Review；US-005 的 DoD 检查项：AC 全部通过、Code Review 通过、集成测试通过、PO 验收。US-005 的集成测试未通过（1 个测试失败）。
- **When**: Skill 执行 AGILE 工作流，对 US-005 执行 DoD 检查。
- **Then**:
  1. Skill 检测到 US-005 DoD 未满足（集成测试失败）；
  2. Skill 输出 Gap: story-dod-incomplete；
  3. Skill 不得将 US-005 状态改为 Done；
  4. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-AGILE-002，记录未满足的 DoD 检查项；
  5. Skill 建议 US-005 退回 In Progress 并修复集成测试。
- **Allow**: 写 Gap、建议修复路径。
- **Forbid**: 不得将 US-005 标记为 Done；不得跳过 DoD 检查；不得伪造 DoD 通过记录。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、02_AGILE/PM_SPRINT_BACKLOG.md。

## 25. DoR 与 DoD 概念混淆拒绝

- **ID**: SC-AGILE-DOR-02
- **Framework**: Scrum + Agile Delivery
- **Given**: PO 说 US-002 已经在 DoR 全部通过，DoD 就不需要再检查了，直接算完成。
- **When**: Skill 执行 AGILE 工作流，检测 DoR 与 DoD 混淆。
- **Then**:
  1. Skill 输出 Escalation: dor-dod-confused；
  2. Skill 明确说明 DoR 与 DoD 用途不同（DoR = 可承诺条件；DoD = 完成条件）；
  3. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-AGILE-003，标注 DoR 不等于 DoD 概念需要澄清；
  4. Skill 拒绝将 US-002 直接标记 Done，必须重新执行完整 DoD 检查。
- **Allow**: 写 Gap、拒绝操作。
- **Forbid**: 不得以 DoR 通过为由跳过 DoD；不得混淆两个概念。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、02_AGILE/PM_SPRINT_BACKLOG.md。

## 26. 未批准 Story 进入 committed Sprint（Scope 冲突）

- **ID**: SC-AGILE-SCP-01
- **Framework**: Scrum + Agile Delivery + PMO
- **Given**: Approved Scope Baseline v1.1；Sprint 4 Backlog 中 BL-021 关联 REQ-042；REQ-042 不在 Approved Scope Baseline v1.1 中；BL-021 状态为 committed。
- **When**: Skill 执行 AGILE 或 DASHBOARD_SYNC 工作流，进行 Scope 一致性检查。
- **Then**:
  1. Skill 检测到 BL-021 与 Approved Scope 冲突；
  2. Skill 输出 Conflict: sprint-scope；
  3. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-SCP-004；
  4. Skill 在 PM_PENDING_UPDATES.md 写入 PU-CHG-###，请求变更批准将 REQ-042 纳入 Scope；
  5. Skill 在 PM_RAID_LOG.md 写入 R-2026-### 标 scope-creep；
  6. Skill 不得将 BL-021 保持在 committed 状态；必须将其转为 blocked 或待审批状态；
  7. Skill 不得从 Sprint Backlog 删除 BL-021；不得修改 Approved Scope；
  8. Skill 在 Daily Briefing 中标注 Scope 冲突，建议召开 Scope 评估会议。
- **Allow**: 写 Gap、PU、Risk、Briefing 标注；将 BL-021 转为 blocked 或待审批状态。
- **Forbid**: 不得将未批准条目保持在 committed Sprint Backlog；不得静默忽略 Scope 冲突；不得修改 Approved Scope Baseline。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、00_PM_MEMORY/PM_PENDING_UPDATES.md、01_PM_DOCUMENTS/PM_RAID_LOG.md。

## 27. Kanban WIP 超限禁止拉入

- **ID**: SC-AGILE-WIP-01
- **Framework**: Kanban + Agile Delivery
- **Given**: Kanban 看板的 In Progress 列 WIP 限制为 3；当前 In Progress 列已有 3 个 Story（US-010、US-011、US-012）；团队成员问可以再拉一个进来吗。
- **When**: Skill 执行 AGILE 工作流，检测 WIP 状态。
- **Then**:
  1. Skill 检测到 In Progress WIP = 3 = WIP 限制；
  2. Skill 输出 Constraint: wip-limit-reached；
  3. Skill 拒绝将新 Story 拉入 In Progress 列；
  4. Skill 建议优先完成当前在制的 3 个 Story（US-010/011/012）再拉入新工作；
  5. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-AGILE-005。
- **Allow**: 写 Gap、建议优先级。
- **Forbid**: 不得在 WIP 超限时拉入新 Story；不得静默忽略 WIP 限制。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、02_AGILE/PM_KANBAN_BOARD.md。

## 28. Kanban Blocked aging 升级

- **ID**: SC-AGILE-BLK-01
- **Framework**: Kanban + Agile Delivery
- **Given**: US-015 在 In Progress 列，状态 Blocked；Blocked 原因是第三方 API 文档缺失；Blocked 日期为 3 天前；US-015 Owner 为 Dev-Alice。
- **When**: Skill 执行 AGILE 工作流，检测 Blocked 状态 aging。
- **Then**:
  1. Skill 检测到 US-015 Blocked 已持续 3 个工作日（超过 1 个工作日阈值）；
  2. Skill 输出 Escalation: blocked-aging；
  3. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-AGILE-006，记录 Blocked aging 超限；
  4. Skill 在 Daily Briefing 中加入 US-015 Blocked 3 天，建议联系第三方负责人获取文档或调整 Sprint；
  5. Skill 不得将 US-015 的 Story Point 计入当前 Sprint Velocity。
- **Allow**: 写 Gap、Briefing 标注、升级建议。
- **Forbid**: 不得将 Blocked Story Point 计入 Velocity；不得静默处理 Blocked 超过 1 工作日。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、00_PM_MEMORY/PM_DAILY_BRIEFING.md。

## 29. Sprint Carry-over 禁止静默滚动

- **ID**: SC-AGILE-CARRY-01
- **Framework**: Scrum + Agile Delivery
- **Given**: Sprint 5 结束；US-020（SP=5）在 Sprint 5 内未达到 DoD（集成测试未完成）；PO 确认 US-020 业务价值仍然有效。
- **When**: Skill 执行 Sprint Review AGILE 工作流，评估 US-020 Carry-over 方案。
- **Then**:
  1. Skill 输出 Carry-over Report（US-020 | Sprint 5 | 集成测试未完成 | Sprint 6 re-commit）；
  2. Skill 必须要求 PO 显式确认 US-020 进入 Sprint 6；
  3. Skill 必须在 PM_GAP_ANALYSIS.md 写入 GAP-AGILE-007，记录 Carry-over 原因；
  4. Skill 必须要求 US-020 在 Sprint 6 中重新通过 DoR；
  5. Skill 不得将 US-020 静默滚动进 Sprint 6 Backlog；
  6. Skill 不得将 US-020 的 SP=5 计入 Sprint 5 Velocity。
- **Allow**: 写 Carry-over Report、Gap、要求 PO 确认。
- **Forbid**: 不得静默滚动 US-020；不得在 Sprint 6 未经 PO 确认重新承诺；不得将未完成 SP 计入 Velocity。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、02_AGILE/PM_SPRINT_REVIEW.md。

## 30. Story 质量缺口识别（五类全覆盖）

- **ID**: SC-AGILE-QUAL-01
- **Framework**: Scrum + Agile Delivery
- **Given**: Product Backlog 中存在 US-030；US-030 同时缺 Acceptance Criteria、缺 Story Point、缺 Owner、缺优先级（P0/P1/P2）、缺 Sprint 归属（状态为 Ready 但无 Sprint 编号）。
- **When**: Skill 执行 AGILE 工作流，对 Product Backlog 执行 Story 质量扫描。
- **Then**:
  1. Skill 识别出 US-030 的 5 类缺口：Gap: story-missing-ac、Gap: story-missing-sp、Gap: story-missing-owner、Gap: story-missing-priority、Gap: story-missing-sprint；
  2. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-AGILE-008，列明 5 类缺口；
  3. Skill 输出表格：Story ID | 缺口类型 | 建议补充人；
  4. Skill 不得伪造缺失值（不得自动填入 AC/SP/Owner/优先级/Sprint 编号）；
  5. Skill 不得将 US-030 纳入 Sprint Planning，直至所有缺口被 PO 关闭。
- **Allow**: 写 Gap、分析报告。
- **Forbid**: 不得伪造缺失字段；不得在缺口未关闭时将 US-030 纳入 Sprint。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、02_AGILE/PM_BACKLOG.md。

## 31. 框架自动选择：Kanban（无用户指定）

- **ID**: SC-AGILE-AUTO-01
- **Framework**: Scrum / Kanban / Hybrid（由 Skill 自动选择）+ Agile Delivery
- **Given**: 用户消息处理 backlog 中的新需求（无指定框架）；项目无固定 Sprint 节奏；团队采用持续涌现的维护型工作。
- **When**: Skill 路由到 AGILE 工作流。
- **Then**:
  1. Skill 按 agile-delivery-rules.md 9.2 自动选择 Kanban（感知到无固定 Sprint + 维护型工作）；
  2. Skill 输出 [Framework] 主框架: Kanban | 辅助框架: PMO | Reasoning: 无固定Sprint节奏+维护型工作+持续涌现；
  3. Skill 继续执行 Kanban 工作流；
  4. Skill 不请求用户选择 Scrum/Kanban。
- **Allow**: 写 Kanban Board 更新、Gap（如适用）。
- **Forbid**: 不得停下来让用户选方法论；不得默认 Scrum 而不说明理由。
- **Evidence**: 02_AGILE/PM_KANBAN_BOARD.md。

## 32. 框架自动选择：Scrum（感知到活跃 Sprint）

- **ID**: SC-AGILE-AUTO-02
- **Framework**: Scrum / Kanban / Hybrid（由 Skill 自动选择）+ Agile Delivery
- **Given**: 用户消息今天的 standup 要说什么（无指定框架）；项目有活跃 Sprint（Sprint 7）；团队有固定 2 周 Sprint 节奏。
- **When**: Skill 路由到 AGILE 工作流。
- **Then**:
  1. Skill 按 agile-delivery-rules.md 9.2 自动选择 Scrum（感知到活跃 Sprint + 固定节奏）；
  2. Skill 输出 [Framework] 主框架: Scrum | 辅助框架: PMO | Reasoning: 活跃Sprint(Sprint7)+固定2周节奏；
  3. Skill 继续执行 Scrum Daily Standup 建议工作流；
  4. Skill 不请求用户选择方法论。
- **Allow**: 写 Daily Standup 建议、Briefing（如适用）。
- **Forbid**: 不得停下来让用户选方法论；不得跳过框架声明。
- **Evidence**: 00_PM_MEMORY/PM_DAILY_BRIEFING.md、02_AGILE/PM_SPRINT_BACKLOG.md。

## 33. Hybrid Phase Gate + Sprint 门禁叠加

- **ID**: SC-AGILE-HYBRID-01
- **Framework**: Hybrid + Agile Delivery
- **Given**: 项目使用 Hybrid 模式；Phase 3 = Sprint 9-12；当前 Phase 3 进行中；Sprint 11 Backlog 中包含 BL-030（REQ-055，不在 Approved Scope v1.1 中）。
- **When**: Skill 执行 AGILE 工作流，进行 Phase Gate 检查和 Scope 一致性检查。
- **Then**:
  1. Skill 检测到 BL-030 与 Approved Scope 冲突；
  2. Skill 输出 Conflict: sprint-scope；
  3. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-SCP-009；
  4. Skill 在 PM_PENDING_UPDATES.md 写入 PU-CHG-###，请求 Scope 变更批准；
  5. Skill 标注 Phase 3 Gate 准入条件：Sprint Backlog 中所有条目必须已在 Approved Scope；
  6. Skill 在 PM_RAID_LOG.md 写入 R-2026-### 标 scope-creep-hybrid；
  7. Skill 不得删除 BL-030；不得修改 Approved Scope。
- **Allow**: 写 Gap、PU、Risk、Gate 标注。
- **Forbid**: 不得自动删除 BL-030；不得绕过 Phase Gate 检查。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、00_PM_MEMORY/PM_PENDING_UPDATES.md、01_PM_DOCUMENTS/PM_RAID_LOG.md。

## 34. Agile Delivery 术语缺失检测（机器可验证）

- **ID**: SC-AGILE-TERM-01
- **Framework**: Agile Delivery
- **Given**: ai-pm-os/references/agile-delivery-rules.md 存在；用户删除了文档中所有 DoR、DoD、WIP、Blocked、Carry-over 术语。
- **When**: Skill 执行 AGILE 工作流，加载 agile-delivery-rules.md 术语检查。
- **Then**:
  1. Skill 检测到 agile-delivery-rules.md 缺少核心敏捷术语；
  2. Skill 输出 Escalation: agile-terms-missing；
  3. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-AGILE-TERM-001；
  4. Skill 停止 Agile Delivery 工作流，直至术语被恢复。
- **Allow**: 写 Gap、拒绝操作。
- **Forbid**: 不得在敏捷术语缺失时继续 Agile 工作流。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md。


---

## 35. 新会话 Memory Boot（六层读取）

- **ID**: SC-MEM-01
- **Framework**: PMO + memory-and-recovery
- **Given**: 用户开启新会话；上一会话在处理 MEETING 工作流中途结束；
  Active Context 已清空；Skill 启动 Memory Boot。
- **When**: Skill 执行 Memory Boot 读取 ai-pm-os/references/memory-and-recovery.md。
- **Then**:
  1. Skill 按 memory-and-recovery.md §2 定义顺序读取 9 个 Required 文件
     （Global Rules 层 3 文件 + PM Memory 层 6 文件）；
  2. Skill 输出 5 个状态字段并标注来源：
     - 当前阶段 | source: PM_CURRENT_STATUS.md
     - Scope 状态与版本 | source: PM_SCOPE_BASELINE.md
     - 活动 WP/Sprint | source: PM_CURRENT_STATUS.md
     - 阻塞/待审批 | source: PM_PENDING_UPDATES.md + PM_GAP_ANALYSIS.md
     - 下一安全步骤 | source: router.md §1 + PM_CURRENT_STATUS.md
  3. Skill 基于 5 字段选择正确下一工作流（不依赖对话残留记忆）。
- **Allow**: 输出 Memory Recovery 格式；刷新 PM_ACTIVE_CONTEXT.md。
- **Forbid**: 不得依赖聊天窗口残留记忆；不得跳过 Memory Boot 直接执行；
  不得在 Required 文件缺失时猜测并继续。
- **Evidence**: ai-pm-os/references/memory-and-recovery.md、00_PM_MEMORY/PM_CURRENT_STATUS.md。

## 36. 上下文压缩后恢复

- **ID**: SC-MEM-02
- **Framework**: PMO + memory-and-recovery
- **Given**: Cursor/Codex 上下文窗口被压缩（超过 50 条消息截断）；
  Skill 在处理 AGILE 工作流中途失去上下文；用户重新打开会话。
- **When**: Skill 启动 Memory Boot 并执行恢复。
- **Then**:
  1. Skill 读取 PM_CURRENT_STATUS.md 和 PM_ACTIVE_CONTEXT.md；
  2. Skill 发现 pending_writes 非空，但 Active Context 无法重建完整步骤；
  3. Skill 执行 preflight：检查 pending_writes 目标文件是否已存在；
  4. Skill 判定 resume / restart / escalate：
     - 若目标文件未冲突且可读 --> resume 从第一项继续
     - 若目标文件已存在冲突 --> 输出 Conflict + Gap
     - 若无法重建 --> escalate
  5. Skill 不得猜测上一动作。
- **Allow**: 写 Conflict + Gap；写新的 PM_ACTIVE_CONTEXT.md。
- **Forbid**: 不得猜测上一动作；不得重复应用已完成的写入；
  不得自动 commit。
- **Evidence**: 00_PM_MEMORY/PM_ACTIVE_CONTEXT.md、00_PM_MEMORY/PM_GAP_ANALYSIS.md。

## 37. 缺 Required Memory 文件

- **ID**: SC-MEM-03
- **Framework**: PMO + memory-and-recovery
- **Given**: 00_PM_MEMORY/PM_DOCUMENT_REGISTRY.md 因磁盘损坏不存在；
  用户调用 /ai-pm-os 今日 briefing。
- **When**: Skill 执行 Memory Boot，读取 Required 文件列表第 7 项。
- **Then**:
  1. Skill 检测到 PM_DOCUMENT_REGISTRY.md 缺失；
  2. Skill 输出 Escalation: memory-boot-failure；
  3. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-MEM-001；
  4. Skill 停止执行本次工作流；
  5. Skill 不得猜测 PM_DOCUMENT_REGISTRY.md 内容并继续。
- **Allow**: 写 Gap；提示用户提供备份或重建。
- **Forbid**: 不得猜测缺失文件内容；不得跳过 Required 文件继续执行；
  不得在缺 Required 文件时写入正式文件。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、ai-pm-os/references/memory-and-recovery.md。

## 38. 损坏 Active Context 重建

- **ID**: SC-MEM-04
- **Framework**: PMO + memory-and-recovery
- **Given**: PM_ACTIVE_CONTEXT.md 存在但内容为乱码（编码损坏）；
  Skill 处于 AGILE 工作流执行中途。
- **When**: Skill 读取 Active Context 并尝试解析。
- **Then**:
  1. Skill 检测到 PM_ACTIVE_CONTEXT.md 无法解析（编码错误或乱码）；
  2. Skill 从 L1/L2 正式文件重建 Active Context：
     - 当前阶段 from PM_CURRENT_STATUS.md
     - Scope 状态 from PM_SCOPE_BASELINE.md
     - 活动 WP/Sprint from PM_CURRENT_STATUS.md
     - 阻塞/待审批 from PM_PENDING_UPDATES.md
  3. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-MEM-002，标注 Active Context 损坏；
  4. Skill 不得从对话记忆补全 Active Context 内容。
- **Allow**: 写 Gap；重建 PM_ACTIVE_CONTEXT.md（从 L1/L2，非对话记忆）。
- **Forbid**: 不得从对话记忆补全 Active Context；不得将损坏的 Active Context
  内容当作有效状态。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、00_PM_MEMORY/PM_ACTIVE_CONTEXT.md。

## 39. 过期上下文冲突

- **ID**: SC-MEM-05
- **Framework**: PMO + memory-and-recovery
- **Given**: PM_ACTIVE_CONTEXT.md 中记录的 active_workflow = MEETING，
  且 updated_at 为 3 天前；
  PM_CURRENT_STATUS.md 记录的当前阶段为 ACTIVE（非 MEETING）。
- **When**: Skill 读取 Active Context 并对比 Hot Memory。
- **Then**:
  1. Skill 检测到 Active Context 已过期（updated_at 超过 1 小时阈值）；
  2. Skill 检测到 active_workflow 与 PM_CURRENT_STATUS.md 不一致；
  3. Skill 以 PM_CURRENT_STATUS.md（L2）为准重建 Active Context；
  4. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-MEM-003；
  5. Skill 不得以过期的 Active Context 为准继续 MEETING 工作流。
- **Allow**: 重建 Active Context；写 Gap。
- **Forbid**: 不得以过期 Active Context 覆盖 L2 正式状态；
  不得继续执行与当前阶段不一致的工作流。
- **Evidence**: 00_PM_MEMORY/PM_ACTIVE_CONTEXT.md、00_PM_MEMORY/PM_CURRENT_STATUS.md。

## 40. 写入前中断

- **ID**: SC-MEM-06
- **Framework**: PMO + memory-and-recovery
- **Given**: Skill 在执行 INTAKE 工作流时，pending_writes 包含 3 个目标文件；
  Skill 完成了 preflight 检查，但在写入第一个文件前网络中断。
- **When**: Skill 在新会话中恢复。
- **Then**:
  1. Skill 读取 PM_ACTIVE_CONTEXT.md，发现 pending_writes = [F1, F2, F3]；
  2. Skill 执行 preflight：对 F1、F2、F3 逐一检查脏工作树冲突；
  3. 若 F1 与脏工作树冲突：
     - Skill 输出 Conflict: worktree
     - Skill 不得继续写入 F1
     - Skill 评估 F2、F3 是否可写入（基于 preflight 结果）
  4. Skill 不得重新猜测 pending_writes 内容。
- **Allow**: 写 Conflict；重建 pending_writes 清单。
- **Forbid**: 不得猜测上一写入动作；不得跳过 preflight；
  不得在脏工作树冲突时继续写入。
- **Evidence**: 00_PM_MEMORY/PM_ACTIVE_CONTEXT.md、00_PM_MEMORY/PM_GAP_ANALYSIS.md。

## 41. 写入中部分失败

- **ID**: SC-MEM-07
- **Framework**: PMO + memory-and-recovery
- **Given**: PU-### 已批准；含 3 个目标文件（F1、F2、F3）；
  Skill 成功写入 F1 和 F2，但在写入 F3 时磁盘空间不足导致失败。
- **When**: Skill 在 APPLY 工作流中执行部分失败恢复。
- **Then**:
  1. Skill 检测到 F3 写入失败（磁盘空间不足）；
  2. Skill 执行 preflight：检查 F1、F2 是否与脏工作树冲突；
  3. Skill 不得继续写入 F3；
  4. Skill 记录已写入文件（F1、F2）和失败文件（F3）；
  5. Skill 在 PM_GAP_ANALYSIS.md 写入 GAP-MEM-004；
  6. Skill 不得将 F1、F2 回滚（已成功写入）；
  7. Skill 不得自动 git commit（写入中断）。
- **Allow**: 写 Gap；输出冲突报告；建议用户解决磁盘空间后重试 F3。
- **Forbid**: 不得继续写入失败文件；不得回滚已写入文件；
  不得静默忽略部分失败；不得自动 commit。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、01_PM_DOCUMENTS/PM_RAID_LOG.md。

## 42. 审批等待恢复

- **ID**: SC-MEM-08
- **Framework**: PMO + memory-and-recovery
- **Given**: PU-### 状态为 Proposed；Skill 在请求用户批准后中断；
  新会话中，PM_ACTIVE_CONTEXT.md 记录 pending_approvals = [PU-###]；
  但 PM_PENDING_UPDATES.md 中 PU-### 仍未被批准。
- **When**: Skill 在新会话中恢复，判断下一步。
- **Then**:
  1. Skill 读取 PM_ACTIVE_CONTEXT.md 和 PM_PENDING_UPDATES.md；
  2. Skill 检测到 PU-### 在 pending_approvals 中但状态仍为 Proposed；
  3. Skill 维持当前工作流（不重复执行原工作流）；
  4. Skill 在 briefing 或 output 中提示待审批：PU-###；
  5. Skill 不得将 PU-### 状态从 Proposed 改为 Approved；
  6. Skill 不得将 pending_approvals 清空直至用户显式批准。
- **Allow**: 提示待审批 PU；维持当前工作流状态。
- **Forbid**: 不得用 Active Context 自动批准 PU；
  不得清空 pending_approvals 直至显式批准；
  不得重复执行原工作流（PU 内容不变）。
- **Evidence**: 00_PM_MEMORY/PM_PENDING_UPDATES.md、00_PM_MEMORY/PM_ACTIVE_CONTEXT.md。

## 43. Coder Work Package 双输出失败关闭

- **ID**: SC-COC-01
- **Framework**: PMO + runtime-compliance-contracts
- **Given**: PM AI 签发 WP-### 给 Coder；COC-CWP-001 契约的 `required_chat_delivery` 为 `full-body-single-codeblock`。
- **When**: Coder 在聊天中仅提供 WP-### 文件路径，未发送完整正文。
- **Then**:
  1. Pre-send Compliance Gate 第 5 步（聊天交付模式）检测到非 `full-body-single-codeblock`；
  2. Pre-send Compliance Gate 失败；Coder 不得声明 `issued`；
  3. Coder 写入 `00_PM_MEMORY/PM_GAP_ANALYSIS.md`：GAP-COC-001 `dual-output-failed`；
  4. Coder 重新发送完整 WP-### 正文于单个代码块后再次走门禁；
  5. 双渠道（文件 + 聊天）均成功后门禁 PASS，方可输出 `issued`。
- **Allow**: 写 Gap；重新发送完整正文；记录失败原因。
- **Forbid**: 不得在 chat 缺全文时输出 `issued` / `accepted` / `complete` / `done` / `finished`；
  不得跳过第 5 步或第 6 步（规范化一致性）；不得用 path-only 替代 full body。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、文件落盘路径 + 行数、聊天代码块 hash。

## 44. Rework Package QC-F 引用缺失关闭

- **ID**: SC-COC-02
- **Framework**: PMO + runtime-compliance-contracts
- **Given**: QC 报告 QC-### 包含 3 个 QC-F（QC-F-001、QC-F-002、QC-F-003）；
  PM AI 签发 WP-###-R1，但 `scope_in` 仅引用 2 个 QC-F。
- **When**: Coder 接收返工包并执行 Pre-send Compliance Gate。
- **Then**:
  1. Gate 第 3 步（必需章节完整）发现 `scope_in` 缺 QC-F 引用；
  2. Gate 失败；Coder 不得执行工作包正文；
  3. Coder 写入 Gap：GAP-COC-002 `contract-field-missing`；
  4. Coder 请求 PM AI 补齐 scope_in 中的 QC-F-### 引用后再次走门禁。
- **Allow**: 写 Gap；请求 PM AI 补齐；不执行工作包。
- **Forbid**: 不得在 QC-F 引用缺失时输出 `issued`；
  不得猜测 QC-F 含义并自行补全；不得跨过 Gate 第 3 步。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、QC-###.md 路径、WP-###-R1.md 路径。

## 45. PM/QC Report 阻断发现证据缺失关闭

- **ID**: SC-COC-03
- **Framework**: PMO + runtime-compliance-contracts
- **Given**: PM/QC 评审 WP-### 后拟写 QC 报告，阻断发现表存在 1 条 ID `QC-F-###`；
  但证据列（PM 独立证据 / 文件路径 / 退出码）为空。
- **When**: PM AI 输出 QC 报告。
- **Then**:
  1. Gate 第 3 步（必需章节完整）发现阻断发现证据列缺失；
  2. Gate 失败；PM AI 不得输出 `accepted` 或 `PM/QC Accepted：是`；
  3. PM AI 写入 Gap：GAP-COC-003 `contract-field-missing`；
  4. PM AI 补齐证据列（PM 独立执行的命令、文件路径、真实退出码）后再次走门禁。
- **Allow**: 写 Gap；补齐证据列；记录失败原因。
- **Forbid**: 不得在证据列缺失时输出 `accepted`；
  不得用"已人工核验"代替结构化证据；不得用"通过"代替"PM/QC Accepted：是"。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、PM 独立执行的命令输出、文件路径 + 行数。

## 46. Change Request 风险评估缺失关闭

- **ID**: SC-COC-04
- **Framework**: PMO + runtime-compliance-contracts
- **Given**: 用户提出 REQ-### 加入 Sprint 的变更请求；
  COC-CAR-004 契约的 `required_sections` 包含影响范围和风险评估。
- **When**: PM AI 处理该变更请求。
- **Then**:
  1. Gate 第 3 步（必需章节完整）发现请求缺影响范围和风险评估；
  2. Gate 失败；PM AI 不得输出 `approved` 或写入 Change Log；
  3. PM AI 写入 Gap：GAP-COC-004 `contract-field-missing`；
  4. PM AI 要求用户补充影响范围（Scope / WBS / RAID / Sprint）和风险 ID（R-###）后再次走门禁。
- **Allow**: 写 Gap；请求用户补齐；记录失败原因。
- **Forbid**: 不得在缺影响范围时直接写 Change Log；
  不得以"小调整"为由跳过 PU；不得在缺风险评估时输出 `approved`。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、用户原始请求、PM AI 询问消息。

## 47. Pending Update 变更前/后 diff 缺失关闭

- **ID**: SC-COC-05
- **Framework**: PMO + runtime-compliance-contracts
- **Given**: Skill 生成 PU-### 修改 `00_PM_MEMORY/PM_SCOPE_BASELINE.md`；
  COC-PUA-005 契约的 `required_sections` 包含变更前内容 / 变更后内容。
- **When**: PM AI 请求用户批准 PU-###。
- **Then**:
  1. Gate 第 3 步（必需章节完整）发现变更前/后 diff 缺失；
  2. Gate 失败；PM AI 不得输出 `pending-approval-ready`；
  3. PM AI 写入 Gap：GAP-COC-005 `contract-field-missing`；
  4. PM AI 重新计算变更前/后 hash 并写入 PU 条目后再次走门禁。
- **Allow**: 写 Gap；重新计算 hash；记录失败原因。
- **Forbid**: 不得以"按之前惯例"代替显式 diff；
  不得在缺 hash 对比时输出 `pending-approval-ready`；不得将 Proposed 状态省略为"已申请"。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、PU-### 编号、变更前/后 hash 对比。

## 48. Human Acceptance Request 失败升级路径缺失关闭

- **ID**: SC-COC-06
- **Framework**: PMO + runtime-compliance-contracts
- **Given**: WP-### + QC-### 全部通过；PM AI 拟发 Human Acceptance Request；
  COC-HAR-006 契约的 `required_sections` 包含失败升级路径。
- **When**: PM AI 输出 Human Acceptance Request。
- **Then**:
  1. Gate 第 3 步（必需章节完整）发现失败升级路径缺失；
  2. Gate 失败；PM AI 不得写入 `PM_APPROVAL_STATUS.md` Human Pending 条目；
  3. PM AI 不得输出 `human-pending`；
  4. PM AI 写入 Gap：GAP-COC-006 `contract-field-missing`；
  5. PM AI 补齐失败升级路径（L1/L2/L3/L4 触发条件）后再次走门禁。
- **Allow**: 写 Gap；补齐升级路径；记录失败原因。
- **Forbid**: 不得以"Coder+PM 通过"代替 Human 验收请求；
  不得省略失败升级路径；不得以"等待 Human 确认"代替明确验收请求。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、PM_APPROVAL_STATUS.md 路径、五层验收状态表。

## 49. "一键复制"非授权 short pointer 拒绝

- **ID**: SC-COC-07
- **Framework**: PMO + runtime-compliance-contracts
- **Given**: Human Owner 消息："把 WP-017 一键复制给我"；
  "一键复制" 不属于 path-only 授权（按 `runtime-compliance-contracts.md` §2 三种非授权表达）。
- **When**: PM AI 收到该消息并尝试 path-only 响应。
- **Then**:
  1. Pre-send Compliance Gate 第 5 步检测到 `required_chat_delivery` = `full-body-single-codeblock`，
     但消息含"一键复制"非授权表达；
  2. Gate 失败；PM AI 不得仅给路径；
  3. PM AI 不得以"已 issued"或"已发送"状态声明完成；
  4. PM AI 输出完整 WP-017 正文于单个代码块后再次走门禁。
- **Allow**: 输出完整正文于单个代码块；记录非授权表达。
- **Forbid**: 不得在非授权表达下使用 path-only；
  不得将"一键复制"解释为 short pointer 授权；
  不得跳过 Gate 第 5 步以图快。
- **Evidence**: 聊天代码块 hash、`[Delivery Gate] PASS` 证据、Human Owner 原始消息引用。

## 50. 错误成功状态禁止

- **ID**: SC-COC-08
- **Framework**: PMO + runtime-compliance-contracts
- **Given**: WP-### 的 Pre-send Compliance Gate 失败（任一步骤不通过）；
  错误成功状态包括：`issued` / `accepted` / `complete` / `done` / `finished`。
- **When**: Coder 或 PM AI 试图在 Gate FAIL 时输出上述任一状态。
- **Then**:
  1. Skill 检测到上述状态与 Gate FAIL 同时出现；
  2. Skill 立即写入 Gap：GAP-COC-008 `forbidden-success-state`；
  3. Skill 不得保留该状态声明；必须以 `[Delivery Gate] FAIL: <reason>` 替代；
  4. Skill 不得发送制品；必须先修复缺项再走门禁。
- **Allow**: 写 Gap；清除错误成功状态；记录失败原因。
- **Forbid**: 不得在 Gate FAIL 时输出 `issued` / `accepted` / `complete` / `done` / `finished`；
  不得用"已发送"等含糊表达替代；不得"乐观声明"以避免尴尬。
- **Evidence**: 00_PM_MEMORY/PM_GAP_ANALYSIS.md、Gate FAIL 原因、修复后的 Gate PASS 证据。

## 51. 精确重放：六字段匹配返回既有结果

- **ID**: SC-EI-01
- **Framework**: execution-integrity
- **Given**: 执行身份六字段（`execution_id`/`intent_type`/`source_fingerprint`/`target_set`/`approval_binding`/`last_durable_checkpoint`）与上一已 `reported` 执行完全相同；
  上一执行的 `source_fingerprint` = SHA-256(`WP-005 scope_in content`)。
- **When**: 同一六字段组合再次到达 Skill。
- **Then**:
  1. Skill 识别为精确重放（六字段完全匹配）；
  2. 不得分配新的 `execution_id`；
  3. 返回既有结果的引用（含原 `execution_id`、目标文件路径、报告时间）；
  4. 更新 `last_seen_at`，不创建新副本；
  5. 不得重复创建：PU、Action、Decision、报告、审批记录、JSON 条目。
- **Allow**: 返回既有结果引用；更新 `last_seen_at`。
- **Forbid**: 不得分配新 `execution_id`；不得创建重复副作用；
  不得通过重复写入后去重伪装幂等（重复判定必须在副作用发生前完成）；
  不得仅凭自然语言相似度判定重复。
- **Evidence**: `execution_id` 匹配记录、既有结果引用、`last_seen_at` 更新记录。

## 52. 重复材料：source_fingerprint 相同但非同一次到达

- **ID**: SC-EI-02
- **Framework**: execution-integrity
- **Given**: 同一份材料内容（`source_fingerprint` 相同）被两次传入 Skill；
  但两次的 `execution_id` 不同、`intent_type` 不同（如第一次是"处理材料"，第二次是"更新 backlog"）。
- **When**: 相同 `source_fingerprint` 的第二次到达。
- **Then**:
  1. Skill 检测到重复材料（同一内容指纹不同执行上下文）；
  2. 标记新到达为 `superseded`；
  3. 旧材料保持原 `execution_id` 记录；
  4. 新材料使用新 `execution_id`，更新 `intent_type`；
  5. 不创建新的 Action/Decision（内容相同，结论相同）。
- **Allow**: 使用新 `execution_id`；标记为 `superseded`。
- **Forbid**: 不得为相同内容生成两个不同的 Action/Decision；
  不得在两次到达间合并事实（意图不同则结论可能不同）。
- **Evidence**: 两份 `execution_id` + `source_fingerprint` 对照、旧材料 `superseded` 标记。

## 53. 批准 PU 重放：approval_binding 相同，内容未变

- **ID**: SC-EI-03
- **Framework**: execution-integrity
- **Given**: PU-### 已批准（`Approved`），`approval_binding` = `abc123`，
  `content_fingerprint` = `def456`（SHA-256 of PU content at approval time）。
- **When**: 同一 PU（`approval_binding`=`abc123`，`content_fingerprint`=`def456`）再次到达 Skill。
- **Then**:
  1. Skill 检测到 `approval_binding` 相同且 `content_fingerprint` 未变；
  2. 拒绝重新应用 PU；
  3. 返回既有应用结果引用（含原 `execution_id`、应用时间、结果）；
  4. 不得生成新的 Action/Decision/JSON 条目。
- **Allow**: 返回既有结果引用；更新 `last_seen_at`。
- **Forbid**: 不得对同一批准 PU 应用两次（at-most-once 语义）；
  不得生成重复的 Action/Decision；
  不得静默忽略重放的 PU。
- **Evidence**: `approval_binding` 匹配记录、`content_fingerprint` 验证记录、既有结果引用。

## 54. 内容变化后旧批准：新 fingerprint 必须新 PU

- **ID**: SC-EI-04
- **Framework**: execution-integrity
- **Given**: PU-### 已批准（`content_fingerprint`=`def456`）；
  Human Owner 修改了 PU 内容（SHA-256 → `ghi789`），但 PU 编号仍为 PU-###。
- **When**: Skill 收到修改内容后的 PU-###（`approval_binding`=`abc123`，`content_fingerprint`=`ghi789`）。
- **Then**:
  1. Skill 检测到 `content_fingerprint` 变化；
  2. 原 PU-###（`def456`）保持 `Approved` 状态，不变；
  3. 生成新 PU 编号 PU-###-NEW（全新编号，不继承 PU-###）；
  4. PU-###-NEW 状态为 `Proposed`，需要 Human Owner 重新审批；
  5. Skill 不得使用旧批准（`def456`）应用新内容（`ghi789`）。
- **Allow**: 生成新 PU-###-NEW；请求重新审批。
- **Forbid**: 不得用旧批准（`def456`）应用新内容；
  不得将 PU-### 的 `Approved` 状态继承到 PU-###-NEW；
  不得跳过新 PU 的审批流程。
- **Evidence**: `content_fingerprint` 变化记录、PU-### 状态保持 `Approved` 记录、PU-###-NEW 新编号分配记录。

## 55. 写入前失败：preflight 失败

- **ID**: SC-EI-05
- **Framework**: execution-integrity
- **Given**: Skill 准备对目标集合（`target_set` = [`WP-TEST.md`, `backlog.json`]）应用 PU；
  preflight 检查发现 `backlog.json` 与脏工作树冲突。
- **When**: preflight 返回任一目标冲突。
- **Then**:
  1. Skill 不进入 `writes_started`；
  2. 整个 PU 不应用（原子性：全部或不应用）；
  3. 状态保持在 `preflight_passed`；
  4. 输出 `Conflict: pu-atomic-conflict`；
  5. 写入 `PM_GAP_ANALYSIS.md`：`GAP-PU-###-pipeline-conflict`；
  6. 若可拆分，生成新 PU（如 PU-SPLIT-###）仅含无冲突目标；
  7. 新 PU 编号全新生成（不继承 PU-###）。
- **Allow**: 生成拆分 PU；请求新审批。
- **Forbid**: 不得对无冲突目标继续应用（禁止静默部分应用）；
  不得在 preflight 失败后继续写入；
  不得跳过冲突报告。
- **Evidence**: preflight 失败记录、目标冲突列表、`PM_GAP_ANALYSIS.md` Gap 写入记录、拆分 PU 生成记录。

## 56. 单文件写入后失败：部分成功进入 recovery_required

- **ID**: SC-EI-06
- **Framework**: execution-integrity
- **Given**: Skill 执行 PU-### 应用，`target_set` = [`WP-TEST.md`, `backlog.json`]；
  `WP-TEST.md` 写入成功（SHA-256 = `xxx`），`backlog.json` 写入时磁盘空间不足失败。
- **When**: 写入中部分失败（`writes_started` → 部分成功 → 部分失败）。
- **Then**:
  1. Skill 立即进入 `recovery_required` 状态；
  2. 记录五类证据：
     - `wrote_targets`：[`WP-TEST.md` + SHA-256]
     - `unwrote_targets`：[`backlog.json` + 失败原因：磁盘空间不足]
     - `last_durable_checkpoint`：[`WP-TEST.md` 的 SHA-256]
     - `next_safe_step`：[继续写入 `backlog.json` / 回滚 / 用户确认]
     - `forbidden_actions`：[禁止继续写入 `backlog.json`；禁止报告 `complete`]
  3. 不得报告 `complete` / `done` / `accepted`；
  4. 不得继续写入 `backlog.json`（可能覆盖部分成功的状态）；
  5. 不得自动回滚（需用户确认）。
- **Allow**: 进入 `recovery_required`；记录五类证据；请求用户确认回滚或继续。
- **Forbid**: 不得报告整体成功；不得继续写入；不得自动回滚；
  不得用未完成的写入作为最终报告。
- **Evidence**: 五类证据记录（固化在 Active Context）、`PM_GAP_ANALYSIS.md` Gap 记录。

## 57. Markdown 成功 JSON 失败：只能 Markdown → JSON 修复

- **ID**: SC-EI-07
- **Framework**: execution-integrity
- **Given**: WP-TEST.md 写入成功，Markdown 包含 `版本：v1.0`；
  Skill 尝试同步 `project_state.json` 时，JSON 字段 `version` 仍为旧值 `v0.9`（同步失败）。
- **When**: `writes_completed` → `sync_completed` 转换失败（Markdown 与 JSON 不一致）。
- **Then**:
  1. Skill 识别冲突字段：`project_state.json` 的 `version` 字段（当前 `v0.9`）vs `WP-TEST.md` 的 `版本：v1.0`；
  2. 以 Markdown 为权威源（`v1.0`）；
  3. 执行修复：`project_state.json` 的 `version` → `v1.0`；
  4. 记录同步操作：`Sync: Markdown → JSON | field: version | from: v0.9 → v1.0 | at: <ISO 8601>`；
  5. 验证修复后一致性；
  6. 继续 → `sync_completed` → `reported`。
- **Allow**: Markdown → JSON 修复；记录同步操作；验证一致性。
- **Forbid**: 不得用 JSON 反向覆盖 Markdown 权威源；
  不得以"JSON 更新更及时"为由将 JSON 视为权威；
  不得用 JSON 覆盖 Approved Baseline 中的任何值；
  不得跳过同步不一致报告。
- **Evidence**: 冲突字段对比记录、Markdown → JSON 修复记录、同步操作日志、一致性验证记录。

## 58. 恢复再次中断：从新检查点继续或回滚

- **ID**: SC-EI-08
- **Framework**: execution-integrity
- **Given**: Skill 执行 PU-### 时，部分失败进入 `recovery_required`（`WP-TEST.md` 已写，`backlog.json` 未写）；
  用户选择继续，Skill 尝试写入 `backlog.json` 时再次中断（用户强制关闭编辑器）。
- **When**: 在 `recovery_required` 状态下再次中断。
- **Then**:
  1. Skill 读取 Active Context，恢复当前 `pending_writes` 状态；
  2. 检查 `last_durable_checkpoint`（`WP-TEST.md` SHA-256 = `xxx`）；
  3. 识别 `backlog.json` 仍为 `unwrote_targets`；
  4. 再次进入 `recovery_required`，更新五类证据；
  5. 不得重新写入 `WP-TEST.md`（已确认成功）；
  6. Skill 输出：`恢复中断：pending_writes = [backlog.json], checkpoint = WP-TEST.md (SHA-256: xxx)`；
  7. 等待用户确认继续或回滚。
- **Allow**: 从新检查点继续（`backlog.json`）；等待用户确认。
- **Forbid**: 不得重新写入 `WP-TEST.md`（已确认成功）；
  不得在未确认情况下自动继续写入；
  不得报告整体成功。
- **Evidence**: Active Context 中更新后的五类证据、`last_durable_checkpoint` 保持 `WP-TEST.md` SHA-256。

## 59. 冲突重复：六字段不匹配但意图冲突

- **ID**: SC-EI-09
- **Framework**: execution-integrity
- **Given**: 用户 A 发送"处理材料 M1"（`intent_type`=`INTAKE`，`source_fingerprint`=SHA-256(M1)）；
  用户 B 同时发送"处理材料 M2"（`intent_type`=`INTAKE`，但 `source_fingerprint` 不同）；
  Skill 检测到两份材料对同一 Decision（"本项目应该使用 Scrum"）给出了相反的事实。
- **When**: Skill 识别到两份材料事实冲突（意图类型相同但 `target_set` 冲突）。
- **Then**:
  1. Skill 停止执行（不得自动合并）；
  2. 输出 `Conflict: fact-conflict`（4 类：事实/范围/决策/进度冲突）；
  3. 写入 `PM_GAP_ANALYSIS.md`：`GAP-CONFLICT-EI-01`；
  4. 列出冲突字段的具体值对比；
  5. 请求 L1 澄清（Human Owner 决定哪个事实优先）。
- **Allow**: 记录冲突；写入 Gap；请求 L1 澄清。
- **Forbid**: 不得将相似输入自动合并为同一事实；
  不得静默选择其中一个继续执行；
  不得依赖自然语言相似度绕过冲突检测；
  不得在冲突未解决时输出 `issued` / `accepted`。
- **Evidence**: 两份执行标识对比、冲突字段列表、`PM_GAP_ANALYSIS.md` Gap 写入记录。

## 60. 成功后重复到达：返回既有结果引用

- **ID**: SC-EI-10
- **Framework**: execution-integrity
- **Given**: Skill 成功完成 PU-### 应用并报告 `reported`（`execution_id`=`EI-TEST`）；
  `last_seen_at` = `2026-06-22T18:00:00Z`；
  30 分钟后，同一六字段组合再次到达。
- **When**: 成功执行（六字段匹配）后，同一操作再次到达。
- **Then**:
  1. Skill 识别为重复到达（六字段匹配 + 上一状态为 `reported`）；
  2. 不得创建新的 Action/Decision/JSON 条目；
  3. 返回既有结果引用：
     - `execution_id`: EI-TEST
     - `reported_at`: 2026-06-22T18:00:00Z
     - `target_set`: [WP-TEST.md, backlog.json]
     - `result`: applied successfully
  4. 更新 `last_seen_at`（不创建新记录）。
- **Allow**: 返回既有结果引用；更新 `last_seen_at`。
- **Forbid**: 不得为同一操作创建第二个 `execution_id`；
  不得生成第二个 Action/Decision/JSON 条目；
  不得将重复到达当作新工作处理。
- **Evidence**: 六字段匹配验证、既有 `execution_id` 引用、`last_seen_at` 更新记录。

---

## 61. C-01：同一对象状态冲突（Decision 矛盾）

- **ID**: SC-CHX-01
- **Framework**: PMO + conflict-and-chaos-rules
- **Given**: `PM_DECISION_LOG.md` 中 DEC-037 状态为 `Approved`；用户上传一份会议纪要，其中 DEC-037 状态被标注为 `Rejected`。
- **When**: Skill 路由到 `INTAKE`，读取两份材料进行状态对比。
- **Then**:
  1. 检测到 DEC-037 状态冲突（`Approved` vs `Rejected`）；
  2. 进入 `Conflict: state-conflict`（C-01）；
  3. 写入 `PM_GAP_ANALYSIS.md` → `GAP-CFL-061`；
  4. 两份来源均保留，注明冲突；
  5. 输出 `Escalation: state-conflict`；
  6. 请求 Human Owner 裁定 DEC-037 最终状态。
- **Allow**: 写 Gap；请求 L1 裁定；保留两份来源。
- **Forbid**: 不得自动选择其中一方；不得将冲突条目写入 Approved Baseline；
  不得输出 `issued` / `accepted` / `complete`。
- **Evidence**: `PM_DECISION_LOG.md`、`PM_INPUT_LOG.md`、`PM_GAP_ANALYSIS.md`。

---

## 62. C-02：范围 / 需求冲突（需求描述矛盾）

- **ID**: SC-CHX-02
- **Framework**: PMO + conflict-and-chaos-rules
- **Given**: `PM_REQUIREMENTS_REGISTER.md` 中 REQ-042 描述为"基础看板（5张卡片）"；用户上传一份新文档，其中 REQ-042 描述为"企业级看板（含 RBAC、SSO、审计日志）"。
- **When**: Skill 路由到 `INTAKE`，检测到 REQ-042 描述冲突。
- **Then**:
  1. 检测到 REQ-042 描述冲突（基础看板 vs 企业级看板）；
  2. 进入 `Conflict: requirement-scope`（C-02）；
  3. 写入 `PM_GAP_ANALYSIS.md` → `GAP-CFL-062`；
  4. 写入 `PM_PENDING_UPDATES.md` → `PU-CHG-062`，提议需求澄清会议；
  5. 不修改 `PM_REQUIREMENTS_REGISTER.md`；
  6. 输出 `Conflict: requirement-scope`。
- **Allow**: 写 Gap + PU；请求 L1 澄清。
- **Forbid**: 不得自动选择基础版或企业版；不得直接更新 REQ-042；
  不得将任一描述写入 Approved Baseline。
- **Evidence**: `PM_REQUIREMENTS_REGISTER.md`、`PM_GAP_ANALYSIS.md`、`PM_PENDING_UPDATES.md`。

---

## 63. C-03：审批状态冲突（Human Owner 声称未批准）

- **ID**: SC-CHX-03
- **Framework**: PMO + conflict-and-chaos-rules
- **Given**: `PM_PENDING_UPDATES.md` 中 PU-015 状态为 `Approved`（含审批时间戳）；Human Owner 声称"我没有批准过 PU-015"。
- **When**: Skill 路由到 `APPLY`，尝试应用 PU-015。
- **Then**:
  1. 检测到 PU-015 审批状态冲突（记录为 `Approved` vs Human Owner 声称未批准）；
  2. 进入 `Conflict: approval-conflict`（C-03）；
  3. 写入 `PM_GAP_ANALYSIS.md` → `GAP-CFL-063`；
  4. 写入 `PM_RAID_LOG.md` → `R-2026-063`，标 `approval-integrity-risk`；
  5. 拒绝应用 PU-015，直至冲突解决；
  6. 输出 `Escalation: approval-conflict`。
- **Allow**: 写 Gap + RAID；请求 Human Owner 提供审批证据或重新审批。
- **Forbid**: 不得在冲突未解决时应用 PU-015；不得将 Human Owner 声称作为推翻记录的依据；
  不得删除 `Approved` 记录。
- **Evidence**: `PM_PENDING_UPDATES.md`、`PM_GAP_ANALYSIS.md`、`PM_RAID_LOG.md`。

---

## 64. C-04：Markdown / JSON 事实冲突（JSON 较新但 Markdown 缺失）

- **ID**: SC-CHX-04
- **Framework**: PMO + conflict-and-chaos-rules
- **Given**: `07_DATA/project_state.json` 中 REQ-042 状态为 `In Progress`，更新时间戳为今天；`01_PM_DOCUMENTS/PM_REQUIREMENTS_REGISTER.md` 中 REQ-042 条目被用户误删（Markdown 文件中无 REQ-042 记录）。
- **When**: Skill 路由到 `DASHBOARD_SYNC`，检测到 JSON 较新但 Markdown 缺失。
- **Then**:
  1. 检测到 JSON 较新但 Markdown 缺失；
  2. 进入 `Conflict: json-without-markdown`（C-04）；
  3. 写入 `PM_GAP_ANALYSIS.md` → `GAP-SYN-064`；
  4. 不得从 JSON 重建 Markdown 事实；
  5. 不得将 JSON 的 `In Progress` 状态升为 Approved Baseline 事实；
  6. 请求 Human Owner 提供 REQ-042 的 Markdown 源文件。
- **Allow**: 写 Gap；请求 Human Owner 提供 Markdown 源。
- **Forbid**: 不得从 JSON 重建 Markdown；不得将 JSON 较新值作为正式事实；
  不得用 JSON 覆盖 Approved Baseline。
- **Evidence**: `07_DATA/project_state.json`、`PM_GAP_ANALYSIS.md`、`PM_REQUIREMENTS_REGISTER.md`。

---

## 65. M-01：缺 Owner（Issue 无 owner）

- **ID**: SC-CHX-05
- **Framework**: PMO + conflict-and-chaos-rules
- **Given**: `PM_RAID_LOG.md` 中 R-2026-042 状态为 `Issue`，`owner` 字段为空；用户调用 `/ai-pm-os 今日 briefing`。
- **When**: Skill 路由到 `BRIEFING`，执行 Action/RAID Audit。
- **Then**:
  1. 检测到 R-2026-042 owner 缺失；
  2. 写入 `PM_GAP_ANALYSIS.md` → `GAP-OWN-065`；
  3. Briefing 输出包含"需补 R-2026-042 owner"建议；
  4. 不自动给 R-2026-042 分配 owner。
- **Allow**: 写 Gap；输出 owner 缺失建议。
- **Forbid**: 不得自动填 owner；不得将无 owner 的 Issue 写成 Approved 事实；
  不得关闭 R-2026-042。
- **Evidence**: `PM_RAID_LOG.md`、`PM_GAP_ANALYSIS.md`。

---

## 66. M-02：缺 Due Date（Milestone 无日期）

- **ID**: SC-CHX-06
- **Framework**: PMO + conflict-and-chaos-rules
- **Given**: `PM_WBS_PLAN.md` 中 M-007（里程碑）存在，但 `due_date` 字段为空；用户调用 `/ai-pm-os 今日 briefing`。
- **When**: Skill 路由到 `BRIEFING`，执行 Milestone 完整性检查。
- **Then**:
  1. 检测到 M-007 due_date 缺失；
  2. 写入 `PM_GAP_ANALYSIS.md` → `GAP-DUE-066`；
  3. Briefing 输出包含"M-007 需补 due_date"建议；
  4. 不猜测 due_date；不将无日期里程碑写入 Approved Baseline。
- **Allow**: 写 Gap；输出 due_date 缺失建议。
- **Forbid**: 不得猜测日期并写入；不得将无日期里程碑作为有效 Baseline 里程碑。
- **Evidence**: `PM_WBS_PLAN.md`、`PM_GAP_ANALYSIS.md`。

---

## 67. M-03：缺来源（推断无来源标注）

- **ID**: SC-CHX-07
- **Framework**: PMO + fact-layers + conflict-and-chaos-rules
- **Given**: Skill 基于对话记忆推断某 Action 状态为 `Open`，并在对话中输出该推断结论，但无 `source:` 标注或 `Inferred:` 前缀。
- **When**: Skill 路由到 `BRIEFING`，输出推断结论。
- **Then**:
  1. 检测到推断结论无来源标注（`source:` 缺失）；
  2. 标注 `source: Unknown`；
  3. 写入 `PM_GAP_ANALYSIS.md` → `GAP-SRC-067`；
  4. 输出时添加 `Inferred:` 前缀；
  5. 不得将无来源推断作为 L1 Approved 事实。
- **Allow**: 写 Gap；添加 `Inferred:` 前缀；标注 `source: Unknown`。
- **Forbid**: 不得留空来源；不得将无来源推断升为 L1 Approved；
  不得以对话记忆作为推断来源。
- **Evidence**: `PM_GAP_ANALYSIS.md`、`PM_DAILY_BRIEFING.md`.

---

## 68. N-01/N-02：命名混乱（重复 REQ-ID）

- **ID**: SC-CHX-08
- **Framework**: PMO + naming-conventions + conflict-and-chaos-rules
- **Given**: `PM_REQUIREMENTS_REGISTER.md` 中 REQ-019 出现两次：一个描述"登录功能"，另一个描述"数据导出"。
- **When**: Skill 路由到 `INTAKE`，执行 ID 一致性扫描。
- **Then**:
  1. 检测到 REQ-019 重复（N-02：重复 ID）；
  2. 进入 `Conflict: duplicate-id`（N-02）；
  3. 写入 `PM_GAP_ANALYSIS.md` → `GAP-NAM-068`；
  4. 列出两个冲突位置（含文件路径和行号）；
  5. 拒绝基于任一 REQ-019 继续执行正式工作流；
  6. 请求 Human Owner 裁定。
- **Allow**: 写 Gap；列出冲突位置；请求 Human Owner 裁定。
- **Forbid**: 不得自动删除或合并重复 ID 条目；不得静默选择其中一个；
  不得用别名覆盖 Approved Baseline ID。
- **Evidence**: `PM_REQUIREMENTS_REGISTER.md`、`PM_GAP_ANALYSIS.md`.

---

## 69. N-04/N-05：命名混乱（路径写死 / 跨平台不安全）

- **ID**: SC-CHX-09
- **Framework**: PMO + naming-conventions + conflict-and-chaos-rules
- **Given**: 用户在输入材料中包含一个文件路径 `<WINDOWS_ABSOLUTE_PATH_EXAMPLE>`；该路径含 Windows 特有反斜杠和用户名。
- **When**: Skill 路由到 `INTAKE`，处理包含绝对路径的输入材料。
- **Then**:
  1. 检测到绝对路径写死（N-05：跨平台不安全路径）；
  2. 写入 `PM_GAP_ANALYSIS.md` → `GAP-NAM-069`；
  3. 提示将绝对路径替换为相对路径或工件名称；
  4. 不得基于该绝对路径执行文件读取；
  5. 不得在 Skill 输出中引用该绝对路径。
- **Allow**: 写 Gap；提示规范化建议。
- **Forbid**: 不得在跨平台不安全路径上执行文件操作；不得将绝对路径写入正式文件；
  不得将用户名/机器名路径引用为规范路径。
- **Evidence**: `PM_GAP_ANALYSIS.md`、`PM_INPUT_LOG.md`.

---

## 70. D-01/D-05：脏工作树写入阻断（无 Git 仓库）

- **ID**: SC-CHX-10
- **Framework**: PMO + conflict-and-chaos-rules
- **Given**: 当前工作目录不存在 `.git/`（不是 Git 仓库）；用户调用 `/ai-pm-os 初始化项目`。
- **When**: Skill 路由到 `INIT`，执行 preflight 时发现无 Git 仓库。
- **Then**:
  1. 检测到当前目录不是 Git 仓库；
  2. 进入 `preflight_blocked`（D-05：无 Git 仓库）；
  3. 输出 `Escalation: no-git-repository`；
  4. 写入 `PM_GAP_ANALYSIS.md` → `GAP-DWT-070`；
  5. 不得在无 Git 仓库时执行写入正式文件；
  6. 提示用户先执行 `git init` 建立仓库。
- **Allow**: 写 Gap；提示 `git init`。
- **Forbid**: 不得在无 Git 仓库时执行写入正式文件；不得自动执行 `git init`；
  不得跳过 preflight 检查。
- **Evidence**: `PM_GAP_ANALYSIS.md`、`PM_INPUT_LOG.md`.

## 71. 三层路由成功执行

- **ID**: SC-CMD-01
- **Framework**: PMO + command-and-approval-rules
- **Given**: 用户说"生成今日 briefing"；Skill 已完成 Memory Boot；Active Context 存在且可读。
- **When**: Skill 执行 Layer 1（Intent Classification）识别到 BRIEFING；Layer 2（Workflow Selection）选中 WF-04 BRIEFING 并确认 required_reads；Layer 3（Gate Evaluation）所有 preflight_gates 通过。
- **Then**:
  1. Layer 3 输出 `gate_passed`；
  2. Skill 进入 writes_started，生成 briefing 文件（Draft 状态）；
  3. Active Context 记录三层输出结果。
- **Allow**: 生成 Draft Briefing；更新 Active Context。
- **Forbid**: Layer 3 未通过时不得写入；不得跳过 Layer 1/2 直接进入 Layer 3。
- **Evidence**: Active Context 日志、`PM_CURRENT_STATUS.md`。

## 72. unrouted intent 失败关闭

- **ID**: SC-CMD-02
- **Framework**: PMO
- **Given**: 用户说"随便处理一下这个文件"；Skill 无法从 router.md §1 路由表中匹配任何关键词。
- **When**: Layer 1 无法将意图映射到已知工作流。
- **Then**:
  1. 输出 `Gap：unrouted intent`；
  2. 提供三选项：重新表述、从 §1 指定、PM AI 评估；
  3. 停止执行，不自行猜测。
- **Allow**: 输出 Gap；停止执行。
- **Forbid**: 自行选择一个工作流继续；输出 accepted/complete/done。
- **Evidence**: Skill 输出日志。

## 73. 多意图拆分与停止

- **ID**: SC-CMD-03
- **Framework**: PMO + PMP/PMBOK
- **Given**: 用户说"先 briefing，然后生成今日 To-do"。
- **When**: Layer 1 识别出两个意图（BRIEFING 和 TODO）；按依赖排序先执行 BRIEFING。
- **Then**:
  1. 执行 BRIEFING（子意图 1）；
  2. BRIEFING 失败时停止，不执行 TODO（子意图 2）；
  3. 输出汇总说明 BRIEFING 失败原因。
- **Allow**: 执行成功子意图；停止失败后子意图。
- **Forbid**: 跳过失败子意图继续后续；输出 accepted/complete。
- **Evidence**: Active Context 执行日志。

## 74. Scope Baseline 未批准时 INIT 阻断

- **ID**: SC-CMD-04
- **Framework**: PMO + Hybrid
- **Given**: 当前项目无 Scope Baseline 文件；用户调用 `/ai-pm-os 初始化项目`。
- **When**: INIT 工作流 preflight 检查发现无 Scope Baseline；Gate 输出 `gate_failed`。
- **Then**:
  1. 输出 `Escalation: gate-failed`；
  2. 列出缺失前置：Scope Baseline 不存在；
  3. 建议创建 Project Brief（Draft）作为第一步；
  4. 不得直接生成 Approved Scope Baseline。
- **Allow**: 建议创建 Draft Project Brief。
- **Forbid**: 直接生成 Approved Scope Baseline；跳过 preflight。
- **Evidence**: Skill 输出日志、`PM_GAP_ANALYSIS.md`。

## 75. PU 审批缺失阻断 APPLY

- **ID**: SC-CMD-05
- **Framework**: PMO + PMP/PMBOK
- **Given**: `PM_PENDING_UPDATES.md` 中存在一条 Proposed PU（PU-XXX）；用户要求 Skill "直接把这个更新落地"。
- **When**: APPLY 工作流检测到 PU 状态为 Proposed（未批准）；Gate 输出 `approval_required`。
- **Then**:
  1. 输出 `Escalation: approval-required`；
  2. 列出需要 Human Owner 批准；
  3. 不得写入正式文件；
  4. 等待 Human Owner 审批。
- **Allow**: 输出审批请求；记录到 PM_PENDING_UPDATES.md。
- **Forbid**: 跳过审批直接写入 Approved Baseline；直接标记为 Applied。
- **Evidence**: `PM_PENDING_UPDATES.md`、`PM_APPROVAL_STATUS.md`。

## 76. 角色权限不足阻断变更批准

- **ID**: SC-CMD-06
- **Framework**: PMO
- **Given**: 用户提出 Scope Baseline 变更（重大变更，跨基线）；Skill 当前默认角色配置中无 Sponsor Approver 签署。
- **When**: 变更涉及跨基线写入，需要 Sponsor Approver + Human Owner 双签；当前角色配置缺少 Sponsor Approver。
- **Then**:
  1. 输出 `Escalation: role-insufficient`；
  2. 列出所需角色：Sponsor Approver + Human Owner；
  3. 不得跳过角色权限执行变更；
  4. 提示更新 `PM_ROLE_CONFIG.md`。
- **Allow**: 输出 Gap；记录变更请求到 PM_PENDING_UPDATES.md。
- **Forbid**: 未经授权角色批准写入 Approved Baseline；跳过角色检查。
- **Evidence**: `PM_ROLE_CONFIG.md`、`PM_PENDING_UPDATES.md`。

## 77. COC 路由缺失 contract_id 失败关闭

- **ID**: SC-CMD-07
- **Framework**: PMO + runtime-compliance-contracts
- **Given**: 用户提出变更 Scope Baseline；Skill 识别为 APPLY 工作流并命中 COC-CAR-004。
- **When**: Layer 2 返回了 `workflow_id = APPLY` 但未返回 `contract_id`；Layer 3 Pre-send Compliance Gate 检测到缺少 contract_id。
- **Then**:
  1. Gate 返回 `Escalation: coc-missing-workflow-or-contract`；
  2. 阻断关键输出发送；
  3. 不得输出 `issued` / `accepted` / `complete`。
- **Allow**: 输出 Escalation；停止发送。
- **Forbid**: 缺少 contract_id 时发送关键输出；绕过 Pre-send Gate。
- **Evidence**: Skill 输出日志、Active Context。

## 78. 脏工作树阻断 APPLY

- **ID**: SC-CMD-08
- **Framework**: PMO + command-and-approval-rules
- **Given**: Git 工作树存在未提交变更（dirty）；用户要求应用已批准的 PU。
- **When**: APPLY 工作流检测到 Git dirty 且操作涉及跨基线写入；Gate 输出 `blocked_by_dirty_worktree`。
- **Then**:
  1. 输出 `Escalation: blocked-by-dirty-worktree`；
  2. 进入 `preflight_blocked` 状态；
  3. 提示用户先 `git add` + `git commit` 或 checkpoint；
  4. 不得在脏工作树时执行跨基线写入。
- **Allow**: 提示用户清理工作树；记录阻塞状态。
- **Forbid**: 在脏工作树时执行写入；自动执行 `git stash`/`git reset`。
- **Evidence**: Git 状态、`PM_GAP_ANALYSIS.md`。

## 79. 审批状态非法转换：Rejected → Applied 禁止

- **ID**: SC-CMD-09
- **Framework**: PMO + command-and-approval-rules
- **Given**: `PM_PENDING_UPDATES.md` 中 PU-XXX 状态为 Rejected；用户要求"重新应用这个更新"。
- **When**: APPLY 工作流尝试将 Rejected PU 标记为 Applied；审批状态机检测到禁止的转换（Rejected → Applied）。
- **Then**:
  1. 输出 `Escalation: illegal-state-transition`；
  2. 列出禁止的转换：Rejected → Applied；
  3. 列出允许的替代：Rejected → Proposed（重新起草）或 Superseded；
  4. 不得将 Rejected PU 标记为 Applied。
- **Allow**: 建议重新起草（Rejected → Proposed）；记录禁止尝试。
- **Forbid**: Rejected → Applied 转换；跳过状态机检查。
- **Evidence**: `PM_PENDING_UPDATES.md`、Skill 输出日志。

## 80. 个人默认角色配置：单人模式通过

- **ID**: SC-CMD-10
- **Framework**: PMO + command-and-approval-rules
- **Given**: 用户是唯一人员；`PM_ROLE_CONFIG.md` 配置单人模式：Human Owner + PM Owner + PM Reviewer + Sponsor Approver 由同一人承担。
- **When**: Skill 执行初始化（INIT）并验证角色配置；角色配置支持未来拆分（未写死)。
- **Then**:
  1. 接受单人角色配置作为当前有效配置；
  2. 所有审批路径均指向同一人；
  3. 角色配置文件中保留可拆分字段（future_split_supported = true）；
  4. INIT 成功生成 Project Brief（Draft）。
- **Allow**: 单人角色配置通过 preflight；保留未来拆分能力。
- **Forbid**: 将单人配置写死为永久状态；移除 future_split_supported 字段。
- **Evidence**: `PM_ROLE_CONFIG.md`、`07_DATA/project_roles.json`.
