# AI PM OS Local Shell 项目章程

- 版本：v0.1
- 状态：Pending Human Owner Approval
- 日期：2026-06-18

## 1. 背景与目标

交付一个可复制的本地 AI 项目管理壳：用户通过 Cursor/Codex 和统一 `ai-pm-os` Skill 管理项目，Markdown 保存权威事实，JSON 驱动 React/Vite Dashboard，从而减少文档、会议纪要、To-do 和汇报的手工工作，同时保留人工审批与治理责任。

## 2. P0 核心交付物

1. 跨 Windows/macOS 的完整项目壳、规则、模板与安装说明。
2. 可手动安装/触发的统一 `ai-pm-os` Skill 源码包。
3. 完整 PM、敏捷、会议、To-do、报告和数据治理工作流。
4. Pending Updates 审批闭环与 Git 可追溯机制。
5. React/Vite Dashboard 及本地 JSON 数据同步。
6. M1 核心闭环 Demo 与 P0 基础自动验收。

## 3. M1 目标

证明“材料输入 → AI 解析 → Pending Updates → 用户审批 → Markdown 更新 → JSON 同步 → Dashboard 展示 → To-do/会议纪要/周报输出”的端到端闭环。

## 4. 主要约束

- 完成日期：TBD，待估算后批准。
- 平台：Windows 10/11、macOS、Cursor、Codex、Node.js LTS、npm、Git、Chrome/Edge。
- 本地优先不等于模型离线推理。
- 不自研 parser/OCR，不使用后台监听或云端 SaaS。
- Scope Baseline 未批准不得正式拆 WBS 或派工。

## 5. 交付模式

Hybrid：外层采用启动、规划、执行、监控、收尾及阶段门禁；内层在批准范围内采用 Sprint/Backlog 迭代。

## 6. 成功标准

- M1 的全部演示场景有可复现证据。
- P0 需求 100% 通过 PM/QC 且获得 Human Acceptance。
- Windows 与真实 macOS 环境各完成跨平台验收。
- Cursor 与 Codex 各完成一次规则一致性验证。
- 无未经批准的范围变更或基线覆盖。

## 7. 关键风险

- 产品范围广，若不分阶段可能延误。
- Agent/平台能力差异可能导致输入处理和触发体验不同。
- macOS/Cursor 实测资源若晚到，会阻塞 P0 验收。
- Markdown/JSON 双层数据可能发生不一致。

## 8. 角色

以 `00_PM_MEMORY/PM_ROLE_CONFIG.md` 为准。当前默认用户本人承担主要人工角色，Tech Owner 待指定。

## 9. 批准

- Human Owner：待批准
- 批准日期：待填写
- 批准后动作：批准 Requirements Register 和 Scope Baseline，启动正式 WBS 规划。
