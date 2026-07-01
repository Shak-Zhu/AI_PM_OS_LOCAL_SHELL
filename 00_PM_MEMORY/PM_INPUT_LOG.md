# 项目输入日志

| doc_role | instance_status | init_behavior | fact_declaration |
|---|---|---|---|
| Project Record Template | template | 由 ai-pm-os Skill 在每次接收输入时记录 | 无真实项目数据 |

- 版本：v1.0
- 状态：Active
- 最后更新：YYYY-MM-DD

> 本文件记录所有进入项目的材料，包括对话上传、本地文件、Transcript、Cooper MCP、浏览器 URL 等。所有输入均登记到此表，不得跳过。

## 不可读输入处理规则

- 不可读输入（文件损坏、无权访问、格式不支持等）登记时 `access_status` 填 `unreadable`，
  `processing_status` 填 `received-but-unreadable`，不得虚构、推测或替换内容。
- 不得将无法确认的输入内容标记为已读或已处理。
- 缺失关键字段（owner、due_date、scope impact 等）的输入标记 `completeness: incomplete`，
  不生成 Decision。

## 输入日志条目

| input_id | batch_id | received_at | source_type | provider | source_locator | resource_type | resource_id | retrieval_method | access_status | completeness | read_scope | source_fingerprint | processing_status | related_input_id | related_updates | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
