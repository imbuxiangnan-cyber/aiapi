# AIAPI

AI API 代理服务器，将 GitHub Copilot、OpenCode Zen、Google Antigravity、AWS Kiro、Factory AI Droids 等 AI 服务转换为 **OpenAI** 和 **Anthropic** 兼容 API，支持与 [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview)、[opencode](https://github.com/sst/opencode) 等工具无缝集成。

---

## 目录

- [功能特点](#功能特点)
- [快速开始](#快速开始)
- [详细使用指南](#详细使用指南)
  - [GitHub Copilot 模式](#1-github-copilot-模式默认)
  - [OpenCode Zen 模式](#2-opencode-zen-模式)
  - [Google Antigravity 模式](#3-google-antigravity-模式)
  - [AWS Kiro 模式](#4-aws-kiro-模式)
  - [Factory AI Droids 模式](#5-factory-ai-droids-模式)
- [多平台轮换](#多平台轮换)
- [模型映射](#模型映射)
- [代理配置](#代理配置)
- [Claude Code 集成](#claude-code-集成)
- [opencode 集成](#opencode-集成)
- [API 端点](#api-端点)
- [命令行参考](#命令行参考)
- [Docker 部署](#docker-部署)
- [常见问题](#常见问题)

---

## 功能特点

| 功能 | 说明 |
| ---- | ---- |
| 多后端支持 | GitHub Copilot、OpenCode Zen、Google Antigravity、AWS Kiro、Factory AI Droids 五种后端可选 |
| 双协议兼容 | 同时支持 OpenAI Chat Completions API 和 Anthropic Messages API |
| 多账号池管理 | 支持多账号配置，自动轮换和故障转移 |
| Request ID 追踪 | 每个请求自动分配唯一 ID，便于日志追踪 |
| Claude Code 集成 | 一键生成 Claude Code 启动命令 (`--claude-code`) |
| 使用量监控 | Web 仪表盘实时查看 API 使用情况 |
| 自动认证 | Token 过期自动刷新，无需手动干预 |
| 速率限制 | 内置请求频率控制，避免触发限制 |
| 代理支持 | 支持 HTTP/HTTPS 代理，配置持久化 |
| Docker 支持 | 提供完整的 Docker 部署方案 |

---

## 快速开始

### 方式一：npm/npx（推荐）

```bash
# npx 直接运行（无需安装）
npx aiapi-server start
npx aiapi-server start --kiro
npx aiapi-server start --droids

# 或全局安装
npm install -g aiapi-server
aiapi start
aiapi start --kiro
```

### 方式二：源码运行

```bash
# 克隆项目
git clone https://github.com/imbuxiangnan-cyber/aiapi.git
cd aiapi

# 安装依赖
bun install

# 开发模式
bun run dev

# 生产环境
bun run start
```

服务器启动后，默认监听 `http://localhost:4141`。

---

## 详细使用指南

### 1. GitHub Copilot 模式（默认）

使用你的 GitHub Copilot 订阅访问 AI 模型。

#### 前置要求
- GitHub 账户
- 有效的 Copilot 订阅（Individual / Business / Enterprise）

#### 启动步骤

```bash
bun run start
```

**首次运行**会引导你完成 GitHub OAuth 认证：

1. 终端显示设备码，例如：`XXXX-XXXX`
2. 打开浏览器访问：https://github.com/login/device
3. 输入设备码，点击授权
4. 返回终端，等待认证完成

认证成功后，Token 会保存到本地，下次启动无需重新认证。

#### 可用模型

| 模型 | ID | 上下文长度 |
| ---- | ---- | ---- |
| Claude Sonnet 4 | `claude-sonnet-4` | 200K |
| Claude Sonnet 4.5 | `claude-sonnet-4.5` | 200K |
| GPT-4.1 | `gpt-4.1` | 1M |
| o4-mini | `o4-mini` | 200K |
| Gemini 2.5 Pro | `gemini-2.5-pro` | 1M |

---

### 2. OpenCode Zen 模式

使用 [OpenCode Zen](https://opencode.ai/zen) 的多模型 API 服务，支持 GPT-5、Claude、Gemini 等顶级编程模型。

#### 前置要求
1. 访问 https://opencode.ai/zen
2. 注册账号并创建 API Key

#### 可用模型

| 模型 | ID | 说明 |
| ---- | ---- | ---- |
| GPT-5.2 | `gpt-5.2` | OpenAI 最新模型 |
| GPT-5.1 Codex Max | `gpt-5.1-codex-max` | 代码优化版 |
| Claude Opus 4.5 | `claude-opus-4-5` | Anthropic Claude (200K) |
| Claude Sonnet 4.5 | `claude-sonnet-4-5` | Anthropic Claude (200K) |
| Gemini 3 Pro | `gemini-3-pro` | Google Gemini |
| Qwen3 Coder | `qwen3-coder` | Alibaba Qwen |
| Kimi K2 | `kimi-k2` | Moonshot |

更多模型请访问 [opencode.ai/zen](https://opencode.ai/zen)

---

### 3. Google Antigravity 模式

使用 Google Antigravity API 服务，支持 Gemini 和 Claude 模型。

#### 前置要求
- Google 账户

#### 认证方式

**方式一：API Key（推荐）**

1. 访问 https://aistudio.google.com/apikey 获取 API Key
2. 使用环境变量启动：

```bash
# Windows PowerShell
$env:GEMINI_API_KEY = "your_api_key"
bun run start

# Windows CMD
set GEMINI_API_KEY=your_api_key
bun run start
```

#### 可用模型

| 模型 | ID | 说明 |
| ---- | ---- | ---- |
| Gemini 2.5 Pro | `gemini-2.5-pro-exp-03-25` | Google Gemini |
| Gemini 2.0 Flash | `gemini-2.0-flash-exp` | 快速响应 |
| Claude Opus 4.5 | `claude-opus-4-5` | Anthropic Claude |
| Claude Sonnet 4.5 | `claude-sonnet-4-5` | Anthropic Claude |

#### 特性
- 自动 Token 刷新
- 多账户支持，自动轮换
- 配额用尽自动切换账户
- 支持 Thinking 模型（思考链输出）

---

### 4. AWS Kiro 模式

使用 AWS Kiro (CodeWhisperer) 服务访问 AI 模型。

#### 前置要求

- AWS 账户
- CodeWhisperer 访问权限

#### 启动步骤

```bash
bun run start --kiro
# 或使用别名
bun run start -k
```

**首次运行**会引导你完成 AWS 认证：
1. 选择认证方式（Social 或 IdC）
2. 按提示完成 AWS Builder ID 或 IAM Identity Center 登录
3. 认证成功后，凭证会保存到本地

#### 可用模型

| 模型 | ID | 说明 |
| ---- | ---- | ---- |
| Claude Sonnet 4 | `claude-sonnet-4-20250514` | Anthropic Claude |
| Claude 3.5 Sonnet | `claude-3-5-sonnet-20241022` | Anthropic Claude |
| Claude 3.5 Haiku | `claude-3-5-haiku-20241022` | 快速响应 |
| Amazon Nova Pro | `amazon-nova-pro-v1:0` | Amazon Nova |
| Amazon Nova Lite | `amazon-nova-lite-v1:0` | 轻量版 |

---

### 5. Factory AI Droids 模式

使用 [Factory AI Droids](https://factory.ai/) 服务访问多种 AI 模型。

#### 前置要求
1. 访问 https://factory.ai/
2. 注册账号并创建 API Key（格式：`fk-xxx`）

#### 启动步骤

```bash
bun run start --droids
# 或使用别名
bun run start -d
```

**首次运行**会提示输入 Droids API Key。

#### 可用模型

| 模型 | ID | 说明 |
| ---- | ---- | ---- |
| Claude Sonnet 4 | `claude-sonnet-4-20250514` | Anthropic Claude |
| Claude 3.5 Sonnet | `claude-3-5-sonnet-20241022` | Anthropic Claude |
| GPT-4o | `gpt-4o` | OpenAI |
| GPT-4o Mini | `gpt-4o-mini` | OpenAI 轻量版 |
| o1 | `o1` | OpenAI 推理模型 |
| o1-mini | `o1-mini` | OpenAI 推理轻量版 |
| Gemini 2.0 Flash | `gemini-2.0-flash` | Google Gemini |
| Gemini 1.5 Pro | `gemini-1.5-pro` | Google Gemini |

---

## 多平台轮换

多平台轮换功能允许你同时使用多个平台，自动在它们之间轮换请求，实现负载均衡和故障转移。

### 开启轮换

轮换功能**默认关闭**，需要手动开启。通过代码调用：

```typescript
import { enableRotation, disableRotation } from "~/lib/auto-router"

// 开启轮转，指定参与的平台
enableRotation(["kiro", "antigravity", "droids"])

// 关闭轮转
disableRotation()
```

### 工作原理

1. **轮询调度**：每次请求自动切换到下一个平台
2. **模型过滤**：只选择支持当前模型的平台
3. **故障转移**：平台失败时自动跳过

```
请求1: claude-sonnet-4-5 → kiro
请求2: claude-sonnet-4-5 → antigravity
请求3: claude-sonnet-4-5 → droids
请求4: claude-sonnet-4-5 → kiro (循环)
```

### 故障处理

```typescript
import { markPlatformFailed, resetFailedPlatforms } from "~/lib/auto-router"

// 标记平台失败（后续请求会跳过该平台）
markPlatformFailed("kiro")

// 重置所有失败状态
resetFailedPlatforms()
```

### 注意事项和限制

> **重要**：多平台轮转存在以下问题，使用前请仔细阅读。

#### 1. 上下文不连续

**问题**：每次请求可能路由到不同平台，导致对话上下文丢失。

```
用户: 请帮我写一个函数  → 平台A
AI: 好的，这是函数...
用户: 请优化这个函数    → 平台B (不知道之前写了什么函数！)
```

**解决方案**：
- 对于需要上下文的对话，使用手动映射固定到单一平台
- 或者在每次请求中包含完整的对话历史

#### 2. 模型名称不一致

**问题**：同一个模型在不同平台可能有不同的名称。

| 平台 | 模型名称 |
|------|----------|
| Copilot | `claude-sonnet-4` |
| Kiro | `CLAUDE_SONNET_4_V1_0` |
| Antigravity | `claude-sonnet-4-5` |

**解决方案**：使用[模型映射](#模型映射)功能统一模型名称。

#### 3. 响应格式差异

**问题**：不同平台返回的响应格式可能略有不同（如 token 计数、finish_reason 等）。

**影响**：某些依赖特定响应字段的客户端可能出现兼容性问题。

#### 4. 配额和限制不同

**问题**：各平台的配额、速率限制、最大 token 数等可能不同。

**建议**：
- 了解各平台的限制
- 设置合理的 `max_tokens` 值
- 监控各平台的使用量

#### 5. 适用场景

| 场景 | 是否适合轮转 | 原因 |
|------|-------------|------|
| 单次问答 | ✅ 适合 | 无上下文依赖 |
| 代码生成 | ✅ 适合 | 通常是独立任务 |
| 多轮对话 | ❌ 不适合 | 需要上下文连续 |
| Claude Code | ⚠️ 谨慎 | 部分功能依赖上下文 |

---

## 模型映射

模型映射功能统一处理不同平台之间的模型名称差异，支持自动映射和手动配置。

### 自动映射

系统内置以下自动映射功能：

#### 1. 模型别名

常用别名会自动转换为标准名称：

| 输入别名 | 标准名称 |
|----------|----------|
| `claude-4.5-opus` | `claude-opus-4-5` |
| `claude-4.5-sonnet` | `claude-sonnet-4-5` |
| `claude-3.5-sonnet` | `claude-3-5-sonnet` |
| `gpt4o` | `gpt-4o` |
| `gemini-pro` | `gemini-1.5-pro` |
| `gemini-flash` | `gemini-2.0-flash` |

#### 2. Kiro 平台自动转换

Kiro (CodeWhisperer) 使用特殊的内部格式，系统会自动转换：

```
claude-sonnet-4      → CLAUDE_SONNET_4_V1_0
claude-opus-4-5      → CLAUDE_OPUS_4_5_V1_0
claude-3-5-haiku     → CLAUDE_3_5_HAIKU_V1_0
```

#### 3. 智能平台推荐

当请求的模型在当前平台不可用时，系统会自动推荐合适的平台：

| 模型类型 | 推荐平台 |
|----------|----------|
| Claude 系列 | Kiro |
| GPT 系列 | Copilot |
| Gemini 系列 | Antigravity |
| Amazon Nova | Kiro |

### 手动配置

#### 跨平台模型映射

为同一模型在不同平台设置不同的名称：

```typescript
import { setCrossPlatformMappings } from "~/lib/model-mapper"

setCrossPlatformMappings({
  "claude-sonnet-4": {
    copilot: "claude-sonnet-4",
    kiro: "claude-sonnet-4-20250514",
    antigravity: "claude-sonnet-4-5",
  },
})
```

#### 平台到平台映射

当从一个平台切换到另一个平台时，指定模型的对应关系：

```typescript
import { addPlatformMapping } from "~/lib/model-mapper"

// 当 Kiro 的 claude-sonnet-4-5 切换到 Antigravity 时，使用 thinking 版本
addPlatformMapping("kiro", "claude-sonnet-4-5", {
  antigravity: "claude-sonnet-4-5-thinking",
})
```

### API 函数

| 函数 | 说明 |
|------|------|
| `normalizeModelName(model)` | 将别名转换为标准名称 |
| `mapModelForPlatform(model, platform)` | 获取模型在指定平台的名称 |
| `setCrossPlatformMappings(mappings)` | 设置跨平台映射 |
| `addPlatformMapping(source, model, targets)` | 添加平台到平台映射 |

---

## 代理配置

如果你需要通过代理访问网络：

```bash
# Windows PowerShell
$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
bun run start

# Windows CMD
set HTTP_PROXY=http://127.0.0.1:7890
set HTTPS_PROXY=http://127.0.0.1:7890
bun run start
```

---

## Claude Code 集成

[Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) 是 Anthropic 的 AI 编程助手。

在项目根目录创建 `.claude/settings.json`：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:4141",
    "ANTHROPIC_AUTH_TOKEN": "dummy",
    "ANTHROPIC_MODEL": "claude-sonnet-4",
    "ANTHROPIC_SMALL_FAST_MODEL": "gpt-4.1",
    "DISABLE_NON_ESSENTIAL_MODEL_CALLS": "1"
  }
}
```

然后启动服务器后，在该项目目录运行 `claude` 命令。

---

## opencode 集成

[opencode](https://github.com/sst/opencode) 是一个现代 AI 编程助手。

在项目根目录创建 `opencode.json`：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "aiapi": {
      "api": "openai-compatible",
      "name": "AIAPI",
      "options": {
        "baseURL": "http://127.0.0.1:4141/v1"
      },
      "models": {
        "claude-sonnet-4": {
          "name": "Claude Sonnet 4",
          "id": "claude-sonnet-4",
          "max_tokens": 64000,
          "profile": "coder",
          "limit": { "context": 200000 }
        }
      }
    }
  }
}
```

---

## API 端点

服务器启动后，默认监听 `http://localhost:4141`。

### OpenAI 兼容端点

| 端点 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/v1/chat/completions` | POST | 聊天补全（支持流式） |
| `/v1/models` | GET | 模型列表 |
| `/v1/embeddings` | POST | 文本嵌入（仅 Copilot） |

### Anthropic 兼容端点

| 端点 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/v1/messages` | POST | 消息 API（支持流式） |
| `/v1/messages/count_tokens` | POST | Token 计数 |

### 专用端点

| 路由前缀 | 说明 |
| ---- | ---- |
| `/copilot/v1/*` | GitHub Copilot 专用 |
| `/zen/v1/*` | OpenCode Zen 专用 |
| `/antigravity/v1/*` | Google Antigravity 专用 |
| `/kiro/v1/*` | AWS Kiro 专用 |
| `/droids/v1/*` | Factory AI Droids 专用 |

### 调用示例

```bash
# OpenAI 格式
curl http://localhost:4141/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Anthropic 格式
curl http://localhost:4141/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: dummy" \
  -d '{
    "model": "claude-sonnet-4",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 命令行参考

### 命令列表

| 命令 | 说明 |
| ---- | ---- |
| `start` | 启动 API 服务器 |
| `auth` | 仅执行 GitHub 认证流程 |
| `logout` | 清除已保存的凭证 |
| `proxy` | 配置代理设置 |
| `antigravity` | 管理 Google Antigravity 账户 |
| `check-usage` | 查看 Copilot 使用量 |
| `debug` | 显示调试信息 |

### start 命令参数

| 参数 | 别名 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| `--port` | `-p` | 4141 | 监听端口 |
| `--verbose` | `-v` | false | 详细日志 |
| `--account-type` | `-a` | individual | 账户类型 |
| `--claude-code` | `-c` | false | 生成 Claude Code 启动命令 |
| `--zen` | `-z` | false | 启用 OpenCode Zen 模式 |
| `--antigravity` | - | false | 启用 Google Antigravity 模式 |
| `--kiro` | `-k` | false | 启用 AWS Kiro 模式 |
| `--droids` | `-d` | false | 启用 Factory AI Droids 模式 |
| `--rate-limit` | `-r` | - | 请求间隔（秒） |

---

## Docker 部署

### 构建镜像

```bash
docker build -t aiapi .
```

### 运行容器

```bash
docker run -p 4141:4141 \
  -v ./data:/root/.local/share/aiapi \
  aiapi
```

### Docker Compose

```yaml
version: "3.8"
services:
  aiapi:
    build: .
    ports:
      - "4141:4141"
    volumes:
      - ./data:/root/.local/share/aiapi
    restart: unless-stopped
```

---

## 常见问题

### 数据存储位置

所有数据存储在 `~/.local/share/aiapi/` 目录下：

| 文件 | 说明 |
| ---- | ---- |
| `github_token` | GitHub Token |
| `zen-auth.json` | Zen API Key |
| `antigravity-accounts.json` | Antigravity 账户 |
| `kiro-auth.json` | Kiro 认证信息 |
| `droids-auth.json` | Droids API Key |
| `config.json` | 代理等配置 |

---

## 免责声明

> **警告**：这是 GitHub Copilot API 的逆向工程代理。**不受 GitHub 官方支持**，可能随时失效。使用风险自负。

---

## 许可证

MIT License
