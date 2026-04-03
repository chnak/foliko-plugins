# Foliko Plugins

Foliko Agent 框架的插件仓库，为 Foliko 提供扩展功能。

## 插件列表

### 📝 MarkNative
**Markdown 转图片插件**

将 Markdown 渲染为 PNG/SVG 图片，不需要浏览器，原生渲染。

- **安装**: `foliko plugin install marknative`
- **特性**: 
  - 原生渲染，无需 Chromium
  - PNG 和 SVG 输出
  - 10 种内置主题
  - 代码语法高亮
  - 自动分页

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
  theme: 'dark'
})
```

### ☁️ Daytona
**云开发环境管理插件**

在 Foliko 中创建和管理 Daytona 云开发环境（沙箱）。

- **安装**: `foliko plugin install daytona`
- **特性**:
  - 沙箱管理（创建、启动、停止、删除）
  - 代码执行（JavaScript/TypeScript/Python）
  - 文件操作
  - 临时沙箱（自动清理）

```javascript
// 配置 API
daytona_configure({ apiKey: "your-api-key" })

// 创建沙箱
daytona_create_sandbox({ language: "javascript" })

// 执行代码
daytona_execute_code({ code: "console.log('Hello!')" })
```

### 🌐 Puppeteer
**浏览器自动化插件**

基于 Puppeteer 的网页自动化工具。

- **安装**: `foliko plugin install puppeteer-plugin`
- **特性**:
  - 打开网页
  - 截图
  - 填写表单
  - 点击按钮
  - 执行自定义脚本

```javascript
// 打开网页
puppeteer_navigate({ url: 'https://example.com' })

// 截图
puppeteer_screenshot({ path: './screenshot.png' })
```

## 安装所有插件

```bash
foliko plugin install daytona
foliko plugin install marknative
foliko plugin install puppeteer-plugin
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
foliko reload
```

## 许可证

Apache-2.0
