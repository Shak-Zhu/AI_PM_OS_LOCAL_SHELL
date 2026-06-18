# RAID 日志

- 版本：v0.1
- 状态：Active
- 最后更新：2026-06-18

| ID | 类型 | 描述 | 可能性/严重度 | 影响 | Owner | Review Date | 应对/下一步 | 状态 |
|---|---|---|---|---|---|---|---|---|
| R-001 | Risk | macOS/Cursor 真实验收环境未确认 | M/H | 阻塞 P0 验收 | Human Owner | 2026-06-25 | 确认设备、账号和测试人 | Open |
| R-002 | Risk | P0 范围广且日期 TBD | H/H | 计划延误或质量压缩 | PM Owner | Scope 批准后 | 分 M1/P0、完成估算后定日期 | Open |
| R-003 | Risk | Cursor/Codex 能力和触发方式存在差异 | M/H | 制品或流程不一致 | PM Owner | M1 前 | 建立统一规则与跨端验收场景 | Open |
| R-004 | Risk | Markdown/JSON 双层数据不同步 | M/H | Dashboard 展示错误 | Tech Owner | M1 前 | Schema、主动同步、一致性检查 | Open |
| R-005 | Risk | Dirty worktree 自动提交混入用户改动 | M/H | 数据丢失或污染历史 | PM Owner | 每次提交 | 限定文件、提示和审批 | Open |
| A-001 | Assumption | 用户可提供 Cursor、Codex 和 macOS 验收条件 | 待验证 | 决定验收可执行性 | Human Owner | 2026-06-25 | 明确资源 | Open |
| A-002 | Assumption | Node.js LTS、npm、Git 可在目标平台安装 | 待验证 | 影响 Dashboard 和 Git | Tech Owner | M1 前 | 环境检查脚本 | Open |
| I-001 | Issue | Tech Owner 尚未指定 | High | 估算与技术责任缺位 | Human Owner | 2026-06-25 | 指定负责人 | Open |
| D-001 | Dependency | Human Owner 批准范围 | Critical | 解锁 WBS 和派工 | Human Owner | TBD | 审批 APR-003 | Open |
| D-002 | Dependency | 真实 macOS 环境 | External | 跨平台 P0 验收 | Human Owner | P0 验收前 | 安排测试 | Open |
