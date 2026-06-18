# JSON 数据契约计划

- 版本：v0.1
- 状态：Draft
- 最后更新：YYYY-MM-DD

## 权威关系

- Markdown：项目事实权威源。
- `07_DATA/*.json`：结构化主副本。
- `06_DASHBOARD/public/data/*.json`：展示副本。

## Schema 最低要求

每个数据文件必须定义 `$schema`/schema version、字段类型、required、enum、nullable、日期格式、ID pattern 和附加字段策略。实现阶段为 26 个需求规定文件及 `project_roles.json` 建立 schema。

## 一致性键

关键 ID、状态、版本、审批状态、数量、日期、Owner、关联关系和文件路径必须一致。同步失败必须返回非零状态并保留 Markdown 不变。
