# AI PM OS Local Shell

可复制的本地 AI 项目管理壳系统。使用 Cursor 或 Codex 打开，配合统一 `ai-pm-os` Skill 进行项目管理。

## Skill 核心定位

`ai-pm-os` 是本产品的核心执行引擎，不是普通 prompt、写作助手或命令集合。
它的角色是"资深项目经理"——精通 PMP/PMBOK、PRINCE2、APM、PMO、Scrum、
Kanban、Hybrid 七类专业治理框架，能在项目生命周期的每个阶段做出可验证
的判断与处置。

Skill 必须满足：

- **专业性**：任何输出必须显式引用所选用的专业框架组合与判断依据。
- **稳定性**：同输入同状态下重复执行结果结构一致；中断后可恢复。
- **可追溯性**：每项正式更新可追溯到输入、Pending Update、批准人和 Git 证据。
- **跨 Agent 一致性**：Cursor 与 Codex 在相同 shell + 输入 + 状态下产生
  字段集 / 引用一致的结构化输出。

Skill 源码包位于 `ai-pm-os/`，包含：

- `ai-pm-os/SKILL.md`：入口、强制执行循环、能力标签、失败与升级。
- `ai-pm-os/references/`：框架适用边界、路由、事实层级、稳定性规则、
  安装与调用。
- `ai-pm-os/scenarios/scenarios.md`：22 个 Given/When/Then 行为场景。

手动安装与调用边界：

- 当前为源码骨架，未提供原生 Skill 注册；用户需将 `ai-pm-os/` 路径加入
  Cursor / Codex 的工作区或上下文。
- 调用方式：`/ai-pm-os <意图>` 或与之等价的自然语言。
- 验证：`node scripts/validate-skill.js` 与 `node scripts/check-pollution.js`。

## 当前未实现范围

以下能力在 WP-002 交付时**不**实现，列入后续工作包（WP-003~016）：

- 完整材料处理、会议 transcript、To-do、报告、敏捷数据流。
- PM Audit、Takeover 评估、Dashboard 同步、HTML PPT 生成。
- 后台监听、云服务、数据库、多人协作。
- 自动平台注册、原生安装包、第三方 PM 工具集成。

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
