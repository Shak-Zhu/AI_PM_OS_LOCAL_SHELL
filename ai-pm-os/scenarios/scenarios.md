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
  4. Skill 在 PM_PENDING_UPDATES.md 写入 PU-CHG-005，请求变更批准将 REQ-042 纳入 Scope；
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
  4. Skill 在 PM_PENDING_UPDATES.md 写入 PU-CHG-009，请求 Scope 变更批准；
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
