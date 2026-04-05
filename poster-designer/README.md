# Poster Designer Plugin

海报/Banner 设计插件 - 基于 Paper.js 实现矢量绘图的强大工具

## 特性

- 🎨 **矢量绘图** - 基于 Paper.js，支持高质量矢量图形
- 📝 **丰富文本** - 支持单行文本和多行文本框
- 🖼️ **图片支持** - 加载本地图片到画布
- 🌈 **渐变效果** - 支持线性渐变和径向渐变
- 🎯 **图层管理** - 轻松调整元素前后层级
- ✂️ **图形变换** - 旋转、缩放、组合/取消组合
- 📐 **预设模板** - 提供多种精美海报模板

## 安装

插件已随 Foliko Agent 自动安装。确保在 `.agent/plugins/poster-designer` 目录下有完整的插件文件。

## 快速开始

```javascript
// 1. 创建画布
await ext_call({
  plugin: "poster-designer",
  tool: "create_canvas",
  args: { name: "my-poster", width: 800, height: 600, background: "#ffffff" }
});

// 2. 绘制形状
await ext_call({
  plugin: "poster-designer",
  tool: "draw_rectangle",
  args: { canvas: "my-poster", x: 50, y: 50, width: 700, height: 500, fill: "#f0f0f0" }
});

// 3. 添加文字
await ext_call({
  plugin: "poster-designer",
  tool: "add_text",
  args: { canvas: "my-poster", text: "Hello World!", x: 400, y: 300, fontSize: 48, fill: "#333333" }
});

// 4. 导出图片
await ext_call({
  plugin: "poster-designer",
  tool: "export_canvas",
  args: { canvas: "my-poster", format: "png", filename: "my-poster" }
});
```

## API 参考

### 画布操作

#### create_canvas
创建新的海报画布。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| width | number | 800 | 画布宽度(px) |
| height | number | 600 | 画布高度(px) |
| name | string | "default" | 画布标识名称 |
| background | string | "#ffffff" | 背景颜色，支持 hex/rgb/rgba |

#### export_canvas
导出画布为图片文件。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| canvas | string | "default" | 画布名称 |
| format | string | "png" | 导出格式：png, jpg, svg |
| filename | string | - | 文件名（不含扩展名） |
| directory | string | "./" | 保存目录 |

#### save_canvas_to_file
保存画布到本地文件（功能同 export_canvas）。

#### delete_canvas
删除画布并释放资源。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| canvas | string | "default" | 画布名称 |

#### list_canvas_items
列出画布上的所有元素。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| canvas | string | "default" | 画布名称 |

---

### 形状绘制

#### draw_rectangle
绘制矩形。

| 参数 | 类型 | 描述 |
|------|------|------|
| x | number | X坐标 |
| y | number | Y坐标 |
| width | number | 宽度 |
| height | number | 高度 |
| fill | string | 填充颜色（可选） |
| stroke | string | 边框颜色（可选） |
| strokeWidth | number | 边框宽度（可选） |
| radius | number | 圆角半径（可选） |
| opacity | number | 透明度 0-1（可选） |

#### draw_circle
绘制圆形或椭圆。

| 参数 | 类型 | 描述 |
|------|------|------|
| centerX | number | 圆心X坐标 |
| centerY | number | 圆心Y坐标 |
| radius | number | 半径 |
| fill | string | 填充颜色（可选） |
| stroke | string | 边框颜色（可选） |
| strokeWidth | number | 边框宽度（可选） |
| opacity | number | 透明度 0-1（可选） |

#### draw_ellipse
绘制椭圆。

| 参数 | 类型 | 描述 |
|------|------|------|
| x | number | X坐标 |
| y | number | Y坐标 |
| width | number | 宽度 |
| height | number | 高度 |
| fill | string | 填充颜色（可选） |
| stroke | string | 边框颜色（可选） |
| strokeWidth | number | 边框宽度（可选） |
| opacity | number | 透明度 0-1（可选） |

#### draw_line
绘制线条。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| x1 | number | - | 起点X坐标 |
| y1 | number | - | 起点Y坐标 |
| x2 | number | - | 终点X坐标 |
| y2 | number | - | 终点Y坐标 |
| stroke | string | "#000000" | 线条颜色 |
| strokeWidth | number | 1 | 线条宽度 |
| dashArray | number[] | - | 虚线数组（可选） |

#### draw_polygon
绘制正多边形。

| 参数 | 类型 | 描述 |
|------|------|------|
| centerX | number | 中心X坐标 |
| centerY | number | 中心Y坐标 |
| radius | number | 外接圆半径 |
| sides | number | 边数，最小3 |
| fill | string | 填充颜色（可选） |
| stroke | string | 边框颜色（可选） |
| strokeWidth | number | 边框宽度（可选） |
| rotation | number | 旋转角度（可选） |
| opacity | number | 透明度 0-1（可选） |

---

### 渐变效果

#### draw_gradient_rect
绘制带渐变的矩形。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| x | number | - | X坐标 |
| y | number | - | Y坐标 |
| width | number | - | 宽度 |
| height | number | - | 高度 |
| colors | string[] | - | 渐变色值数组（至少2个） |
| type | string | "linear" | 渐变类型：linear, radial |
| direction | string | "vertical" | 渐变方向：horizontal, vertical, diagonal |
| radius | number | - | 圆角半径（可选） |

#### draw_gradient_circle
绘制带渐变的圆形。

| 参数 | 类型 | 描述 |
|------|------|------|
| centerX | number | 圆心X坐标 |
| centerY | number | 圆心Y坐标 |
| radius | number | 半径 |
| colors | string[] | 渐变色值数组 |

---

### 文本操作

#### add_text
添加单行文本。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| text | string | - | 文本内容 |
| x | number | - | X坐标 |
| y | number | - | Y坐标（基线位置） |
| fontSize | number | 24 | 字体大小 |
| fontFamily | string | Microsoft YaHei | 字体名称 |
| fill | string | "#000000" | 文字颜色 |
| align | string | "left" | 对齐方式：left, center, right |
| bold | boolean | false | 是否加粗 |
| italic | boolean | false | 是否斜体 |
| opacity | number | - | 透明度 0-1（可选） |
| autoAdjust | boolean | true | 当位置被占用时自动调整 |

#### add_text_box
添加支持换行的文本框。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| text | string | - | 文本内容（支持换行） |
| x | number | - | X坐标 |
| y | number | - | Y坐标（第一行基线位置） |
| width | number | - | 文本框宽度 |
| fontSize | number | 18 | 字体大小 |
| fontFamily | string | Microsoft YaHei | 字体名称 |
| fill | string | "#000000" | 文字颜色 |
| align | string | "left" | 对齐方式：left, center, right |
| lineHeight | number | - | 行高（可选） |
| bold | boolean | false | 是否加粗 |
| opacity | number | - | 透明度 0-1（可选） |
| autoAdjust | boolean | true | 当位置被占用时自动调整 |

#### arrange_text_items
自动排列画布上的文本项，解决重叠问题。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| spacing | number | 10 | 文本项之间的最小间距(px) |
| direction | string | "vertical" | 排列方向：vertical, horizontal, grid |

#### list_fonts
列出所有已注册的字体。

---

### 图片操作

#### load_image
加载本地图片到画布。

| 参数 | 类型 | 描述 |
|------|------|------|
| path | string | 本地图片文件路径（支持绝对路径和相对路径） |
| x | number | X坐标 |
| y | number | Y坐标 |
| width | number | 显示宽度（可选） |
| height | number | 显示高度（可选） |
| opacity | number | 透明度 0-1（可选） |

---

### 图形变换

#### add_shadow
为图形添加阴影效果。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| itemId | number | - | 图形ID |
| color | string | "rgba(0,0,0,0.3)" | 阴影颜色 |
| offset | number[] | [5, 5] | 阴影偏移 [x, y] |
| blur | number | 10 | 模糊半径 |

#### group_items
将多个图形组合在一起。

| 参数 | 类型 | 描述 |
|------|------|------|
| itemIds | number[] | 要组合的图形ID数组 |

#### ungroup_items
取消图形组合。

| 参数 | 类型 | 描述 |
|------|------|------|
| groupId | number | 组合的ID |

#### rotate_item
旋转图形。

| 参数 | 类型 | 描述 |
|------|------|------|
| itemId | number | 图形ID |
| angle | number | 旋转角度（度） |
| centerX | number | 旋转中心X（可选） |
| centerY | number | 旋转中心Y（可选） |

#### scale_item
缩放图形。

| 参数 | 类型 | 描述 |
|------|------|------|
| itemId | number | 图形ID |
| scaleX | number | X轴缩放比例 |
| scaleY | number | Y轴缩放比例 |
| centerX | number | 缩放中心X（可选） |
| centerY | number | 缩放中心Y（可选） |

#### bring_to_front
将图形移到最前面。

| 参数 | 类型 | 描述 |
|------|------|------|
| itemId | number | 图形ID |

#### send_to_back
将图形移到最后面。

| 参数 | 类型 | 描述 |
|------|------|------|
| itemId | number | 图形ID |

#### clone_item
复制图形。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| itemId | number | - | 要复制的图形ID |
| offsetX | number | 10 | X轴偏移 |
| offsetY | number | 10 | Y轴偏移 |

#### delete_item
删除图形。

| 参数 | 类型 | 描述 |
|------|------|------|
| itemId | number | 图形ID |

---

### 预设模板

#### create_template
创建预设的精美海报模板。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| name | string | "default" | 画布标识名称 |
| template | string | - | 模板类型 |
| width | number | 800 | 画布宽度(px) |
| height | number | 600 | 画布高度(px) |

**可用模板类型：**
- `gradient-banner` - 渐变横幅
- `minimal-card` - 简约卡片
- `gradient-circle` - 渐变圆形
- `split-diagonal` - 分割对角线
- `mesh-gradient` - 网格渐变
- `neon-glow` - 霓虹发光
- `soft-blur` - 柔和模糊
- `geometric-pattern` - 几何图案

---

### 布局系统

#### create_layout
创建布局容器。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| name | string | - | 布局名称 |
| width | number | - | 布局宽度 |
| height | number | - | 布局高度 |
| gridCols | number | 12 | 网格列数 |
| gridGap | number | 10 | 网格间距 |
| background | string | "#ffffff" | 背景颜色 |
| padding | number | 20 | 内边距 |

#### add_element
添加元素到布局。

| 参数 | 类型 | 描述 |
|------|------|------|
| layout | string | 布局名称 |
| type | string | 元素类型：text, image, rect, circle, line |
| content | string | 文本内容或图片路径 |
| gridPosition | object | 网格定位（可选） |
| constraint | object | 约束定位（可选） |
| style | object | 样式配置（可选） |
| zone | string | 布局区域：header, main, footer, custom（可选） |

#### get_layout
获取布局信息。

#### list_layouts
列出所有布局。

#### delete_layout
删除布局。

#### render_layout
渲染布局并保存到文件。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| name | string | - | 布局名称 |
| format | string | "png" | 格式：png, jpg |
| filename | string | - | 文件名（可选） |
| directory | string | "./" | 保存目录 |

---

## 可用字体

插件内置以下字体：

| 字体名称 | 别名 |
|----------|------|
| Microsoft YaHei | 微软雅黑, microsoftyahei |
| Microsoft YaHei Bold | 微软雅黑粗体, Microsoft YaHei Bold |
| Patua One | PatuaOne, patuaone |

---

## 使用示例

### 创建渐变背景海报

```javascript
// 创建画布
await ext_call({
  plugin: "poster-designer",
  tool: "create_canvas",
  args: { name: "gradient-poster", width: 1200, height: 630, background: "#1a1a2e" }
});

// 添加渐变背景
await ext_call({
  plugin: "poster-designer",
  tool: "draw_gradient_rect",
  args: {
    canvas: "gradient-poster",
    x: 0, y: 0, width: 1200, height: 630,
    colors: ["#667eea", "#764ba2"],
    direction: "diagonal"
  }
});

// 添加标题文字
await ext_call({
  plugin: "poster-designer",
  tool: "add_text",
  args: {
    canvas: "gradient-poster",
    text: "Welcome to Our Platform",
    x: 600, y: 300,
    fontSize: 64,
    fill: "#ffffff",
    align: "center"
  }
});

// 添加副标题
await ext_call({
  plugin: "poster-designer",
  tool: "add_text_box",
  args: {
    canvas: "gradient-poster",
    text: "Discover amazing features\nand endless possibilities",
    x: 600, y: 400,
    width: 600,
    fontSize: 24,
    fill: "#e0e0e0",
    align: "center"
  }
});

// 导出
await ext_call({
  plugin: "poster-designer",
  tool: "export_canvas",
  args: { canvas: "gradient-poster", format: "png", filename: "welcome-poster" }
});
```

### 使用预设模板

```javascript
// 创建渐变横幅模板
await ext_call({
  plugin: "poster-designer",
  tool: "create_template",
  args: { name: "banner", template: "gradient-banner", width: 1200, height: 300 }
});

// 添加文字
await ext_call({
  plugin: "poster-designer",
  tool: "add_text",
  args: { canvas: "banner", text: "Special Offer!", x: 600, y: 150, fontSize: 48, fill: "#ffffff", align: "center" }
});

// 导出
await ext_call({
  plugin: "poster-designer",
  tool: "export_canvas",
  args: { canvas: "banner", filename: "banner-offer" }
});
```

---

## 依赖

- `paper` - Paper.js 矢量图形库
- `canvas` - Canvas 绑定
- `fontkit` - 字体解析
- `jsdom` - DOM 环境

## License

MIT
