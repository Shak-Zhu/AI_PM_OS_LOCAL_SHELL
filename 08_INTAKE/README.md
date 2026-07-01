# 08 — Intake

> **入口说明：** 本目录是统一 Intake 的说明入口。但它不是唯一入口——用户可通过任何支持的方式提供输入材料，包括直接粘贴、文件上传、Cooper MCP、浏览器 URL 等。所有输入材料统一登记到 `00_PM_MEMORY/PM_INPUT_LOG.md`。

## 并列输入方式

本项目支持八种并列输入方式，不存在自动回退链：

| Source Type | 说明 | 备注 |
|---|---|---|
| `local_file` | 本地磁盘文件（.md, .docx, .xlsx, .pdf 等） | Agent 读取时作为文件路径传入 |
| `pasted_text` | 直接粘贴到对话的文本 | 无需文件上传，直接作为消息内容 |
| `chat_upload` | 对话界面文件上传 | 支持图片、文档等附件 |
| `transcript` | Chat Transcript 引用（上一轮对话链接） | 通过对话引用机制接入 |
| `screenshot` | 截图 / Print Screen 粘贴 | 直接粘贴或上传图片 |
| `print_pdf` | 打印为 PDF 的页面或文档 | 需用户先在浏览器中 Print→另存为 PDF，再作为本地文件传入 |
| `cooper` | Cooper MCP 读取远程文档 | 需用户在首次消息中引导 Cooper 执行只读 API |
| `browser_url` | 用户指定浏览器 URL | Agent 使用只读工具访问指定 URL |

## 并列原则

- 以上八种方式为**并列**关系，不存在自动回退。
- Cooper 读取失败后报告并停止，不自动调用浏览器。
- 浏览器读取失败后报告并停止，不自动下载、Print、截图或调用 Cooper。
- 失败时，Project Owner 在后续消息中提供替代输入方式。
- 原始远程文档内容默认不落盘（可落盘的除外），只登记 `source_locator` 和元数据。

## 登记流程

所有输入材料（无论成功或失败）均登记到：

```
00_PM_MEMORY/PM_INPUT_LOG.md
```

每条登记包含：Input ID、Batch ID、接收时间、来源类型、提供方、来源定位符、资源类型、资源 ID、读取方式、访问状态、完整性、读取范围、来源指纹、处理状态、关联 Input ID、关联更新、备注。

## 安全边界

- 不得在输入材料中保存 Token、Cookie、Bearer 认证头或密码。
- 浏览器 URL 读取为**只读**操作，不执行任何写操作。
- 登录页面、CAPTCHA、权限不足的页面应报告并停止。
- 远程读取失败不生成事实、Action、Decision 或 PU 条目。

## 子目录

- `new_materials/` — 可选的暂存区，接收用户导入的本地文件。
- `remote_sources/` — 远程来源（Cooper、浏览器 URL）的操作规则和边界说明。
