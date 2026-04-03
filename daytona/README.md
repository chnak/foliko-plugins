# Daytona Plugin

Daytona 云开发环境管理插件，用于在 Foliko 中创建和管理云开发环境（Sandbox）。

## 功能特性

- **沙箱管理**: 创建、启动、停止、删除沙箱环境
- **代码执行**: 在沙箱中执行 JavaScript/TypeScript 代码
- **文件操作**: 在沙箱中读写文件
- **临时沙箱**: 支持创建临时沙箱（自动清理）
- **多语言支持**: JavaScript、TypeScript、Python 等

## 安装

插件已预装，无需额外安装。

## 配置

首次使用需要配置 API 密钥：

```javascript
daytona_configure({
  apiKey: "your-daytona-api-key",
  apiUrl: "https://app.daytona.io/api", // 可选
  target: "default" // 可选
})
```

## 工具列表

### daytona_configure
配置 Daytona API 密钥和连接信息。

### daytona_create_sandbox
创建新的沙箱环境。

参数:
- `language`: 编程语言 (javascript, typescript, python)
- `name`: 沙箱名称
- `resources`: 资源配置 (cpu, memory, disk)
- `envVars`: 环境变量
- `autoStopInterval`: 自动停止间隔（分钟）

### daytona_get_sandbox
获取指定沙箱信息。

### daytona_list_sandboxes
列出所有沙箱。

### daytona_start_sandbox
启动沙箱。

### daytona_stop_sandbox
停止沙箱。

### daytona_delete_sandbox
删除沙箱。

### daytona_execute_code
在沙箱中执行代码。

### daytona_write_file
在沙箱中写入文件。

### daytona_read_file
在沙箱中读取文件。

### daytona_create_ephemeral_sandbox
创建临时沙箱（5分钟后自动删除）。

## 使用示例

```javascript
// 1. 配置 API
daytona_configure({ apiKey: "your-key" })

// 2. 创建沙箱
daytona_create_sandbox({ language: "javascript" })

// 3. 执行代码
daytona_execute_code({ code: "console.log('Hello!')" })

// 4. 读写文件
daytona_write_file({ path: "/tmp/test.js", content: "..." })
daytona_read_file({ path: "/tmp/test.js" })

// 5. 清理
daytona_delete_sandbox({ sandboxId: "sandbox-id" })
```

## 许可证

Apache-2.0
