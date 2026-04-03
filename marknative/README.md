# MarkNative Plugin

将 Markdown 转换为 PNG/SVG 图片的 Foliko 插件。基于 [marknative](https://github.com/liyown/marknative) 项目。

## 特性

- **原生渲染**: 不需要浏览器，使用原生 2D canvas API
- **多种格式**: 支持 PNG 和 SVG 输出
- **丰富主题**: 10 种内置主题（浅色/深色）
- **代码高亮**: 支持代码块语法高亮
- **分页支持**: 自动分页处理长文档
- **双重模式**: 支持本地运行和 Daytona 沙箱运行

## 安装依赖

### 方式一：本地安装
```bash
cd .agent/plugins/marknative
npm install
```

### 方式二：使用 Daytona 沙箱
确保已配置 Daytona 插件，插件将自动在沙箱中运行。

## 工具列表

### marknative_render
将 Markdown 渲染为图片（Base64 编码返回）

参数:
- `markdown`: Markdown 内容（必填）
- `format`: 输出格式 (png/svg)
- `theme`: 主题名称
- `singlePage`: 是否单页输出
- `codeTheme`: 代码高亮主题
- `useSandbox`: 是否强制使用沙箱执行

### marknative_render_to_file
将 Markdown 渲染为图片并保存到文件

参数:
- `markdown`: Markdown 内容（必填）
- `outputPath`: 输出文件路径（必填）
- `format`: 输出格式
- `theme`: 主题名称
- `codeTheme`: 代码高亮主题

### marknative_preview
预览渲染效果（返回第一页 Base64）

参数:
- `markdown`: Markdown 内容（必填）
- `theme`: 主题名称
- `codeTheme`: 代码高亮主题

### marknative_get_themes
获取所有可用主题和代码高亮主题列表

### marknative_status
检查插件状态

## 可用主题

| 主题 | 描述 |
|------|------|
| default | 默认主题（浅色） |
| github | GitHub 风格 |
| solarized | Solarized 风格 |
| sepia | 复古纸张风格 |
| rose | 玫瑰粉风格 |
| dark | 深色主题 |
| nord | Nord 风格 |
| dracula | Dracula 风格 |
| ocean | 海洋风格 |
| forest | 森林风格 |

## 代码高亮主题

支持 Shiki 主题：`github-light`, `github-dark`, `nord`, `dracula`, `solarized-light`, `solarized-dark`, `monokai` 等。

## 使用示例

```javascript
// 1. 检查状态
marknative_status({})

// 2. 渲染为 Base64 图片
marknative_render({
  markdown: '# Hello\n\nThis is **markdown** to image!',
  format: 'png',
  theme: 'github'
})

// 3. 保存为文件
marknative_render_to_file({
  markdown: '# Document\n\nContent here...',
  outputPath: './output.png',
  theme: 'dark'
})

// 4. 预览
marknative_preview({
  markdown: '# Preview\n\nTest content',
  theme: 'nord'
})

// 5. 获取主题列表
marknative_get_themes({})
```

## 完整示例

```javascript
// 渲染带有代码高亮的文档
marknative_render({
  markdown: `# 示例代码

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

**支持语法高亮！**
`,
  format: 'png',
  theme: 'dark',
  codeTheme: 'github-dark'
})
```

## 许可证

MIT
