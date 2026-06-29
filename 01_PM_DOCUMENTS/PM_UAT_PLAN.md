# UAT 计划

| doc_role | instance_status | init_behavior | fact_declaration |
|---|---|---|---|
| UAT 计划 | template | 由 Project Manager 在项目初始化时配置 | 无真实项目数据 |

- 版本：v0.1
- 状态：Draft
- 最后更新：YYYY-MM-DD

> 本文件在项目初始化后由 ai-pm-os Skill 生成。UAT Owner 默认为用户本人，可在 `PM_ROLE_CONFIG.md` 中重新配置。

## UAT 角色

| 角色 | 默认负责人 | 说明 |
|---|---|---|
| UAT Owner | 用户本人 | UAT 最终确认 |
| Project Manager | 用户本人（暂定） | 测试协调 |

## UAT 策略

1. **入口条件**：相关功能完成后进入 UAT
2. **验收方式**：手动验证 + 自动检查脚本
3. **证据要求**：每条验收标准必须记录通过/失败证据
4. **问题处理**：UAT 缺陷进入 Issue Log，优先级由 UAT Owner 决定

## UAT 阶段说明

| 阶段 | 说明 |
|---|
| UAT Planning | 确认 UAT 场景、验收标准和测试数据 |
| UAT Execution | 执行验收测试，记录结果 |
| UAT Sign-off | 所有验收标准通过后，由 UAT Owner 签字确认 |

详细 UAT 场景由 ai-pm-os Skill 在项目初始化时生成。
