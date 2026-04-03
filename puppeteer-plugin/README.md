# puppeteer-plugin

Puppeteer 网页自动化操作插件，支持浏览器控制、页面操作、元素交互、Session 管理。

## 功能特性

- 🌐 浏览器管理：启动/关闭浏览器实例
- 📄 页面操作：打开页面、导航、截图、获取页面结构
- 🖱️ 元素交互：查找、点击、输入文本、悬停、按键模拟
- 🍪 Cookie 管理：获取、设置、清除 Cookie
- 💾 Session 管理：保存/恢复/删除浏览器会话状态
- ⏱️ 等待控制：元素等待、网络空闲等待

## 工具列表

### 浏览器控制
| 工具 | 说明 |
|------|------|
| `browser_launch` | 启动 Puppeteer 浏览器实例 |
| `browser_close` | 关闭浏览器实例 |
| `browser_status` | 获取当前浏览器状态 |

### 页面操作
| 工具 | 说明 |
|------|------|
| `page_open` | 打开新页面或导航到 URL |
| `page_navigate` | 页面导航（前进、后退、刷新） |
| `page_screenshot` | 对页面进行截图 |
| `page_html` | 获取页面 HTML 内容 |
| `page_structure` | 获取页面关键结构信息（推荐） |
| `page_close` | 关闭指定页面 |

### 元素交互
| 工具 | 说明 |
|------|------|
| `element_find` | 查找页面元素 |
| `element_find_all` | 查找所有匹配的元素 |
| `element_click` | 点击页面元素 |
| `element_type` | 向输入框输入文本 |
| `element_hover` | 鼠标悬停到元素 |
| `element_press` | 模拟键盘按键 |
| `element_wait` | 等待元素出现或消失 |

### Cookie 管理
| 工具 | 说明 |
|------|------|
| `cookie_get` | 获取页面 Cookie |
| `cookie_set` | 设置 Cookie |
| `cookie_clear` | 清除 Cookie |

### Session 管理
| 工具 | 说明 |
|------|------|
| `session_save` | 保存当前浏览器会话状态 |
| `session_load` | 加载并恢复浏览器会话状态 |
| `session_list` | 列出所有保存的 Session |
| `session_delete` | 删除指定的 Session |

### 其他
| 工具 | 说明 |
|------|------|
| `js_execute` | 在页面中执行 JavaScript 代码 |
| `wait` | 等待指定时间 |
| `wait_network_idle` | 等待网络空闲 |

## 安装

```bash
npx skills add puppeteer-plugin -a openclaw -y
```

## 使用示例

### 启动浏览器并打开网页

```javascript
// 启动浏览器
await ext_call({
  plugin: "puppeteer",
  tool: "browser_launch",
  args: {}
});

// 打开网页
await ext_call({
  plugin: "puppeteer",
  tool: "page_open",
  args: { url: "https://example.com" }
});

// 截图
await ext_call({
  plugin: "puppeteer",
  tool: "page_screenshot",
  args: { path: "screenshot.png" }
});
```

### 元素交互

```javascript
// 查找并点击按钮
await ext_call({
  plugin: "puppeteer",
  tool: "element_click",
  args: { selector: "button.submit" }
});

// 输入文本
await ext_call({
  plugin: "puppeteer",
  tool: "element_type",
  args: { selector: "input[name='username']", text: "myuser" }
});
```

### Session 管理

```javascript
// 保存当前会话
await ext_call({
  plugin: "puppeteer",
  tool: "session_save",
  args: { sessionId: "my-session" }
});

// 恢复会话
await ext_call({
  plugin: "puppeteer",
  tool: "session_load",
  args: { sessionId: "my-session" }
});
```

## 注意事项

1. **无图片识别能力**：该插件没有识别图片的能力，截图只能保存
2. **需要 Chromium**：Puppeteer 需要本地安装 Chromium 浏览器
3. **Session 恢复**：加载 Session 时会自动恢复 Cookie 和浏览器状态

## 依赖

- puppeteer-core: ^24.40.0

## 版本

- v1.0.0
