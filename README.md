# Foliko Plugins

Foliko Agent 框架的插件仓库，为 Foliko 提供扩展功能。

## 插件列表

| 插件 | 描述 | 状态 |
|------|------|------|
| [marknative](#marknative) | Markdown 转 PNG/SVG 图片，原生渲染 | ✅ 可用 |
| [daytona](#daytona) | 云开发环境管理（沙箱） | ✅ 可用 |
| [puppeteer-plugin](#puppeteer) | 浏览器自动化 | 🔧 开发中 |

---

## MarkNative

**Markdown 转图片插件** - 将 Markdown 渲染为 PNG/SVG 图片，不需要浏览器，原生渲染。

### 安装

```bash
folko plugin install marknative
```

### 工具

| 工具 | 描述 |
|------|------|
| `marknative_render` | 渲染为 Base64 图片 |
| `marknative_render_to_file` | 保存为图片文件 |
| `marknative_preview` | 预览渲染效果 |
| `marknative_get_themes` | 获取主题列表 |

### 可用主题

| 主题 | 描述 |
|------|------|
| `default` | 默认主题（浅色） |
| `github` | GitHub 风格 |
| `solarized` | Solarized 风格 |
| `sepia` | 复古纸张风格 |
| `rose` | 玫瑰粉风格 |
| `dark` | 深色主题 |
| `nord` | Nord 风格 |
| `dracula` | Dracula 风格 |
| `ocean` | 海洋风格 |
| `forest` | 森林风格 |

### 代码高亮主题

`github-light`, `github-dark`, `nord`, `dracula`, `solarized-light`, `monokai` 等

### 示例

```javascript
// 渲染为 Base64 图片
marknative_render({
  markdown: '# Hello\n\nThis is **markdown** to image!',
  format: 'png',
  theme: 'nord'
})

// 保存为文件
marknative_render_to_file({
  markdown: '# Document',
  outputPath: './output.png',
  theme: 'dark',
  codeTheme: 'github-dark'
})
```

---

## Daytona

**云开发环境管理插件** - 在 Foliko 中创建和管理 Daytona 云开发环境（沙箱）。

### 安装

```bash
folko plugin install daytona
```

### 工具

| 工具 | 描述 |
|------|------|
| `daytona_configure` | 配置 API 密钥 |
| `daytona_create_sandbox` | 创建沙箱 |
| `daytona_list_sandboxes` | 列出沙箱 |
| `daytona_start_sandbox` | 启动沙箱 |
| `daytona_stop_sandbox` | 停止沙箱 |
| `daytona_delete_sandbox` | 删除沙箱 |
| `daytona_execute_code` | 执行代码 |
| `daytona_write_file` | 写入文件 |
| `daytona_read_file` | 读取文件 |

### 示例

```javascript
// 配置 API
daytona_configure({ apiKey: "your-api-key" })

// 创建沙箱
daytona_create_sandbox({ language: "javascript" })

// 执行代码
daytona_execute_code({ code: "console.log('Hello!')" })
```

---

## Puppeteer

**浏览器自动化插件** - 基于 Puppeteer 的网页自动化工具。

### 安装

```bash
folko plugin install puppeteer-plugin
```

### 工具

| 工具 | 描述 |
|------|------|
| `puppeteer_navigate` | 打开网页 |
| `puppeteer_screenshot` | 截图 |
| `puppeteer_click` | 点击元素 |
| `puppeteer_fill` | 填写表单 |

### 示例

```javascript
// 打开网页
puppeteer_navigate({ url: 'https://example.com' })

// 截图
puppeteer_screenshot({ path: './screenshot.png' })
```

---

## 安装所有插件

```bash
folko plugin install marknative
folko plugin install daytona
folko plugin install puppeteer-plugin
folko reload
```

## 手动安装

```bash
# 克隆仓库
git clone https://github.com/chnak/foliko-plugins.git

# 复制插件到本地
cp -r daytona ~/.agent/plugins/
cp -r marknative ~/.agent/plugins/
cp -r puppeteer-plugin ~/.agent/plugins/

# 重载插件
folko reload
```

## 许可证

Apache-2.0
