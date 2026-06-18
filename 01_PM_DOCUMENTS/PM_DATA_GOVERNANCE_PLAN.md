# 数据与配置治理计划

- 版本：v0.1
- 状态：Draft
- 最后更新：YYYY-MM-DD

- Markdown 是权威源；`07_DATA/` 是 JSON 主副本；`06_DASHBOARD/public/data/` 是展示副本。
- JSON Schema 必须定义类型、required、enum、nullable 和日期格式。
- 同步比较关键 ID、状态、版本、审批、数量、日期、Owner、关系和路径。
- 冲突时保留 Markdown，重新生成 JSON，并记录同步结果。
- 项目内只使用相对路径；不得保存用户机器绝对路径。
- 所有输入均写入 Input Log；不可读项必须保留状态和后续动作。
