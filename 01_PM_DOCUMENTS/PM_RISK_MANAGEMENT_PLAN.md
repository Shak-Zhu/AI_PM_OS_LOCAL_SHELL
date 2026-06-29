# 风险管理计划

| doc_role | instance_status | init_behavior | fact_declaration |
|---|---|---|---|
| Project Document Template | template | 由 Project Manager 在风险规划时填充 | 无真实项目数据 |

- 版本：v0.1
- 状态：Draft
- 最后更新：YYYY-MM-DD

## 风险评估

风险按 Probability 与 Impact 的 High/Medium/Low 评定；High Risk 必须指定 Owner 并定期复核，触发范围、日期、质量或平台验收容差时立即上报 Project Owner。

## 风险管理流程

1. 识别：所有风险必须记录到 `01_PM_DOCUMENTS/PM_RAID_LOG.md`
2. 评估：分析 Probability、Impact 和 Severity
3. 应对：制定 Mitigation、Contingency 或 Accept 策略
4. 监控：定期复核并更新状态
5. 升级：High Risk 无 Owner 或超过 Review Date 自动升级

所有 Open 风险必须有 Owner、Review Date、应对策略和 Next Step。风险成为事实后转为 Issue，不删除原记录。

## 风险等级

| 等级 | 说明 | 复核频率 |
|---|---|---|
| High | 影响进度/质量/平台验收 | 至少每周 |
| Medium | 影响成本/资源 | 至少每 Sprint |
| Low | 影响有限 | 按需 |
