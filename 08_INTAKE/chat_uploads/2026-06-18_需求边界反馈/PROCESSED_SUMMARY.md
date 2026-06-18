# 需求边界反馈处理摘要

- Input ID：IN-20260618-0003-001
- 原始来源：Codex attachment `pasted-text.txt`
- 原始附件路径：外部会话附件，不作为长期项目路径
- 处理日期：2026-06-18
- 状态：Processed

## 已确认口径

1. M1 是 P0 阶段性交付，不替代 P0。
2. 输入能力按 Cursor/Codex 当前 Agent Context Capability 定义，不采用格式白名单，也不自研 parser/OCR。
3. Cursor 与 Codex 都需真实验证，允许调用入口不同。
4. Windows 与真实 macOS 均进入 P0 验收。
5. `PM_ROLE_CONFIG.md` 和 `project_roles.json` 纳入 P0。
6. 初始化只可直接创建 Draft 结构，不得绕过 Pending Updates 写入批准事实。
7. Git 允许有限自动 commit，不自动 push，不混入用户修改。
8. Markdown 是权威源，`07_DATA` 是 JSON 主副本，Dashboard public/data 是展示副本。

## 应用位置

已形成 `AI_PM_OS_LOCAL_SHELL_REQUIREMENTS_ADDENDUM_V1.1.md`、CHG-002、DEC-005、REQ-008 及相关治理计划。原始附件内容若需逐字审计，应由用户重新提供或保留会话附件；本文件保存已应用的项目治理结论。
