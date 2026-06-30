# AI PM OS Local Shell

AI PM OS Local Shell 是一个可复制、可重命名、可本地运行的 AI 项目管理壳。
使用 Cursor 或 Codex 打开项目目录，由统一的 `ai-pm-os` Skill 维护 Markdown
项目文件、JSON 数据、敏捷对象、报告和本地 Dashboard。

## 当前发布状态

- M1 / P0：31/31 完成；当前批准基线下全部 P0 需求均已验收。
- Windows、Cursor、Codex、Skill 隔离包、JSON、Dashboard 和 Git 发布流程已验证。
- macOS 保持跨平台设计，但尚未进行真实设备验证；该项列入 P1 `REQ-036`。
- 后续 P1/P2 能力不属于当前 M1 完成范围。

**当前验证命令：**
```bash
node scripts/verify-release.js --strict
node scripts/verify-governance.js
node ai-pm-os/scripts/validate-skill.js
node scripts/validate-data.js
node scripts/check-pollution.js
```
全部退出码为 `0` 才可作为干净壳投入新项目。

## 三个核心组成

1. `ai-pm-os/`：完整、自包含的 AI PM Skill。
2. 项目壳目录：Markdown、JSON、敏捷、会议、To-do、报告和材料归档结构。
3. `06_DASHBOARD/`：本地 React/Vite 项目管理 Dashboard。

## 快速开始

**Windows PowerShell：**

```powershell
git clone https://github.com/Shak-Zhu/AI_PM_OS_LOCAL_SHELL.git My_New_Project
Set-Location My_New_Project
npm install --prefix 06_DASHBOARD
node scripts/verify-release.js --strict
```

**macOS / Linux Bash：**

```bash
git clone https://github.com/Shak-Zhu/AI_PM_OS_LOCAL_SHELL.git My_New_Project
cd My_New_Project
npm install --prefix 06_DASHBOARD
node scripts/verify-release.js --strict
```

然后使用 Cursor 或 Codex 打开 `My_New_Project`，要求 Agent 读取 `AGENTS.md`
并使用 `ai-pm-os` 初始化项目。

完整的克隆、改名、初始化、日常使用、Dashboard、Git、独立 Skill 仓库安装和故障排除说明：

**[USER_GUIDE.md](USER_GUIDE.md)**

排版版使用手册：

**[AI_PM_OS_Local_Shell_User_Guide.pdf](AI_PM_OS_Local_Shell_User_Guide.pdf)**

## 关键边界

- Markdown 是项目事实权威源，JSON 是同步和展示层。
- 未批准更新先进入 `PM_PENDING_UPDATES.md`。
- 不自动 push，不自动把未确认内容写成正式 Decision 或 Approved Baseline。

## 验证

```bash
node scripts/verify-release.js --strict
node scripts/verify-governance.js
node ai-pm-os/scripts/validate-skill.js
node scripts/validate-data.js
node scripts/check-pollution.js
```

全部命令退出码为 `0` 才可作为干净壳投入新项目。
