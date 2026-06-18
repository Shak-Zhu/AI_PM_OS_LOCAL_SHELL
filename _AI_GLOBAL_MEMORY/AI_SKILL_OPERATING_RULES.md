# ai-pm-os Skill 操作规则

- 版本：v0.1
- 状态：Draft
- 最后更新：2026-06-18

每次执行必须完成 Memory Boot、识别意图、读取必要文件、生成制品、验证门检查、更新项目记忆和输出下一步。Skill 不自研 parser/OCR；它处理当前 Cursor/Codex 上下文可读材料。正式更新后主动同步 JSON；P0 不使用后台监听。生成 Pending Updates 后必须立即请求用户确认。
