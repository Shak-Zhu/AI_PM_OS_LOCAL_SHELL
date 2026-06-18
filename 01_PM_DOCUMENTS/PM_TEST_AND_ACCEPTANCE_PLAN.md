# 测试与验收计划

- 版本：v0.1
- 状态：Draft
- 最后更新：2026-06-18

## P0 必测场景

1. 初始化项目壳。
2. 生成核心 PM 文件。
3. 生成核心敏捷文件。
4. 处理材料并生成 Pending Updates。
5. 在对话中请求审批。
6. 应用已批准 Pending Updates。
7. Markdown 同步 JSON。
8. Dashboard build/start smoke。
9. Dashboard 核心模块展示。
10. transcript → 纪要、Action/Decision 摘要、PU。
11. 生成今日 To-do。
12. 生成日报 Markdown/HTML。
13. 生成周报 Markdown/HTML/HTML PPT。
14. 基础 PM Audit。
15. 基础 Gap Analysis。

## 平台矩阵

| 平台 | Agent | 浏览器 | 要求 |
|---|---|---|---|
| Windows 10/11 | Cursor | Chrome/Edge | 真实运行 |
| Windows 10/11 | Codex | Chrome/Edge | 真实运行 |
| macOS | Cursor | Chrome | 真实运行 |
| macOS | Codex | Chrome | 真实运行 |

实际验收必须记录 OS、Agent、Node.js、npm、浏览器版本和测试证据路径。
