# 项目审批状态

| doc_role | instance_status | init_behavior | fact_declaration |
|---|---|---|---|
| 审批状态记录 | template | 由 Project Owner 批准后填充 | 实际条目由 Project Owner 转达 |

- 版本：v0.1
- 状态：Active
- 最后更新：YYYY-MM-DD

> 本文件由 ai-pm-os Skill 在项目初始化时生成。实际审批条目在 Pending Updates 获得 Project Owner 批准后填入。

## 审批规则

- Scope Baseline 批准前不得生成正式 WBS。
- Pending Updates 必须由 Project Owner 明确批准后才能应用。
- 任何 Approved Baseline 状态必须由 Project Owner 明确批准后写入。

## 待填充审批条目

初始化后，审批条目格式如下：

| Approval ID | 对象 | 版本 | 所需审批人 | 当前状态 | 影响 |
|---|---|---|---|---|---|
| APR-### | `PM_PROJECT_BRIEF.md` | v0.1 | Project Owner / PM Reviewer | Pending Review | 未批准前不建立正式范围基线 |
| ... | ... | ... | ... | ... | ... |
