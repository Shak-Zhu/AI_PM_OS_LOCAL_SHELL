# 质量管理计划

| doc_role | instance_status | init_behavior | fact_declaration |
|---|---|---|---|
| 质量管理计划 | template | 由 Project Manager 在项目初始化时配置 | 无真实项目数据 |

- 版本：v0.1
- 状态：Draft
- 最后更新：YYYY-MM-DD

## 质量门

1. Requirement Entry Gate：字段完整、验收可测试。
2. Scope Baseline Gate：In/Out Scope、版本和批准齐全。
3. Deliverable Gate：边界、验收标准、禁止事项齐全。
4. Change Gate：变更影响分析完整、审批记录齐全。
5. Release Gate：所有质量标准通过、审批记录齐全。

## P0 自动检查

JSON schema、Markdown/JSON 一致性、目录/文件存在性、Pending Updates、Git 初始化、Dashboard build/smoke、public/data 同步。

## 缺陷等级

- Critical：数据损坏、绕过审批、基线被覆盖、核心闭环不可用。
- High：P0 主流程或跨平台验收失败。
- Medium：次要模块或展示错误，有替代路径。
- Low：不影响流程的文案/轻微视觉问题。

P0 发布条件：Critical/High/Medium 已知缺陷均为 0。
