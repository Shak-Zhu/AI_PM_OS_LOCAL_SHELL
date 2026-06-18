# AI PM OS Local Shell

本项目是一个本地化、可复制、以 Cursor/Codex 为入口的 AI 项目管理壳。当前处于启动与规划阶段，尚未进入产品代码实现。

## 当前状态

- 需求基线：Pending Human Owner Approval
- Scope Baseline：Draft / Not Approved
- 正式 WBS：未生成
- Coder Work Package：未签发
- 计划完成日期：TBD

## 权威入口

1. `REQUIREMENTS_BASELINE_INDEX.md`
2. `00_PM_MEMORY/PM_MEMORY_INDEX.md`
3. `00_PM_MEMORY/PM_CURRENT_STATUS.md`
4. `01_PM_DOCUMENTS/PM_PROJECT_BRIEF.md`
5. `01_PM_DOCUMENTS/PM_SCOPE_BASELINE.md`

## 平台目标

P0 支持 Windows 10/11 和 macOS，支持 Cursor 与 Codex 本地工作流。项目内部使用相对路径，跨平台脚本优先采用 Node.js。

## 隐私边界

项目文件默认保存在本地，但 Cursor/Codex 是否把输入发送至模型服务，取决于所使用的平台、账号和隐私设置。本项目不承诺离线模型推理。

## Dashboard 约定

未来实现阶段统一使用：

```bash
cd 06_DASHBOARD
npm install
npm run dev
```

默认地址：`http://localhost:5173`
