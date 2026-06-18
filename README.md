# AI PM OS Local Shell

可复制的本地 AI 项目管理壳系统。使用 Cursor 或 Codex 打开，配合统一 `ai-pm-os` Skill 进行项目管理。

## 核心形态

用户复制一个本地项目壳文件夹，用 Cursor 或 Codex 打开，通过统一 Skill 调用 AI。AI 根据项目材料、会议 Transcript、日报素材、To-do 完成情况等内容，自动创建、更新、维护项目管理文件，并同步本地 JSON 数据，使 React/Vite Dashboard 自动展示项目状态。

## 目录结构

```
PROJECT_NAME/
├── _AI_GLOBAL_MEMORY/      # AI 全局记忆（工作规则与偏好）
├── 00_PM_MEMORY/           # 项目运行记忆
├── 01_PM_DOCUMENTS/        # 项目管理文档
├── 02_AGILE/               # 敏捷文档
├── 03_MEETINGS/            # 会议管理
├── 04_TODO/                # To-do 管理
├── 05_REPORTS/             # 报告归档
├── 06_DASHBOARD/           # React/Vite Dashboard（开发后启用）
├── 07_DATA/                # JSON 数据主副本
├── 08_INTAKE/              # 材料输入归档
├── 09_ARCHIVE/             # 归档
├── AGENTS.md               # Agent 启动规则
└── README.md
```

## 平台目标

P0 支持 Windows 10/11 和 macOS，支持 Cursor 与 Codex 本地工作流。项目内部使用相对路径，跨平台脚本优先采用 Node.js。

## 隐私边界

项目文件默认保存在本地，但 Cursor/Codex 是否把输入发送至模型服务，取决于所使用的平台、账号和隐私配置。本项目不承诺离线模型推理。

## 启动使用

```bash
cd PROJECT_NAME
# 使用 Cursor 或 Codex 打开
# 调用 ai-pm-os Skill
```

详细使用说明在 `_AI_GLOBAL_MEMORY/AI_SKILL_OPERATING_RULES.md`。
