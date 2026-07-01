# 08/Intake — Remote Sources

本目录定义 Cooper MCP 和浏览器 URL 两种远程来源的操作规则。

## Cooper MCP

### 失败即停

Cooper MCP 读取失败后，必须报告失败并停止继续读取，不自动调用浏览器。

具体要求：Cooper 失败后不得切换到其他输入方式，由用户在后续消息中提供替代方案。

### 成功处理

Cooper 读取成功时，登记 `source_locator` 为 Cooper API 端点，`retrieval_method` 为 `cooper`，`access_status` 为 `success`。

## 浏览器 URL

### 失败即停

浏览器 URL 读取失败后，必须报告失败并停止读取，不自动下载或调用 Cooper。

具体要求：浏览器失败后不得切换到其他输入方式，由用户在后续消息中提供替代方案。

### 只读边界

浏览器读取仅为只读操作。Agent 不得在读取过程中执行登录、搜索、点击或内容修改操作。

### 多 URL 独立处理

支持用户在同一条消息中提供多个 URL。处理规则：

1. 每个 URL 独立分配 Input ID（`IN-001`、`IN-002` 等）。
2. 逐项报告读取结果。
3. 单项失败不阻断其余 URL。
4. 单项失败不触发自动重试或回退。

### 安全边界

- URL 必须由用户显式指定。
- 登录页面、CAPTCHA 页面必须报告并停止。
- Token、Cookie、Bearer 认证参数不得出现在 URL 中。
