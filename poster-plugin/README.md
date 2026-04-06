# Poster Plugin - 海报制作插件

基于 Paper.js 的海报/Banner 设计插件，支持创建海报、卡片、宣传图等。

## 安装依赖

插件需要 `paper` 和 `canvas` 依赖：

```bash
npm install paper canvas
```

## 功能特性

### 预设尺寸

| Key | 尺寸 | 名称 |
|-----|------|------|
| `poster_a4` | 2480×3508 | A4海报 (300dpi) |
| `poster_square` | 2000×2000 | 方形海报 |
| `poster_16_9` | 1920×1080 | 16:9海报 |
| `banner_1920x500` | 1920×500 | 网站Banner |
| `banner_1200x400` | 1200×400 | 电商Banner |
| `banner_750x300` | 750×300 | 移动端Banner |
| `banner_468x60` | 468×60 | 小横幅 |
| `social_instagram` | 1080×1080 | Instagram正方形 |
| `social_story` | 1080×1920 | Instagram Story |
| `social_facebook` | 1200×630 | Facebook封面 |
| `social_twitter` | 1600×900 | Twitter封面 |
| `promo_900x500` | 900×500 | 宣传图 |
| `promo_500x500` | 500×500 | 正方宣传图 |

### 工具列表

| 工具 | 描述 |
|------|------|
| `list_poster_presets` | 列出所有预设尺寸 |
| `create_poster_canvas` | 创建新画布 |
| `add_poster_background` | 添加纯色/渐变背景 |
| `add_poster_rectangle` | 添加矩形 |
| `add_poster_circle` | 添加圆形/椭圆 |
| `add_poster_line` | 添加线条 |
| `add_poster_polygon` | 添加多边形 |
| `add_poster_text` | 添加文字 |
| `add_poster_art_text` | 添加艺术文字（渐变/描边） |
| `add_poster_image` | 添加图片 |
| `get_poster_canvas_info` | 获取画布信息 |
| `clear_poster_canvas` | 清除画布 |
| `export_poster_canvas` | 导出为图片文件 |
| `export_poster_base64` | 导出为 Base64 |
| `generate_poster` | 一键生成海报（4种模板） |

## 使用方法

### 1. 创建画布

```javascript
// 使用预设尺寸
await agent.chat('使用 poster_square 创建一个 2000x2000 的画布')

// 自定义尺寸
await agent.chat('创建一个 1920x1080 的画布，背景色 #1a1a2e')
```

### 2. 添加元素

```javascript
// 添加渐变背景
await agent.chat('添加从 #667eea 到 #764ba2 的线性渐变背景')

// 添加矩形
await agent.chat('在 (100, 100) 位置添加一个 300x200 的红色矩形，圆角 20')

// 添加圆形
await agent.chat('在圆心 (500, 500) 位置添加一个半径 80 的青色圆形')

// 添加文字
await agent.chat('在 (540, 540) 添加文字 "FOLIKO AI"，字体大小 60，白色，居中显示')

// 添加艺术文字（渐变+描边）
await agent.chat('添加艺术文字 "现代海报设计"，使用红到粉渐变，白色描边')

// 添加图片
await agent.chat('在 (200, 200) 位置添加图片 /path/to/logo.png')
```

### 3. 导出

```javascript
// 导出为文件
await agent.chat('导出画布为 my-poster.png')

// 导出为 Base64
await agent.chat('导出画布为 Base64 格式')
```

### 4. 一键生成海报

```javascript
// 使用现代风格模板
await agent.chat('使用 modern 模板生成海报，标题 "FOLIKO"，副标题 "智能助手新体验"')

// 使用商务风格
await agent.chat('使用 business 模板生成海报，标题 "企业宣传"')

// 使用社交风格
await agent.chat('使用 social 模板生成海报，标题 "社交媒体"')

// 使用简约风格
await agent.chat('使用 simple 模板生成海报，标题 "极简风格"')
```

## 模板预览

### modern（现代风格）
- 特点：几何装饰元素，大标题居中，渐变强调色
- 适用：科技产品、活动宣传

### business（商务风格）
- 特点：简洁线条，专业配色，稳重排版
- 适用：企业宣传、商务推广

### social（社交风格）
- 特点：圆形框架，居中头像效果，活力配色
- 适用：社交媒体头像、个人品牌

### simple（简约风格）
- 特点：纯色背景，大留白，简洁文字
- 适用：极简主义、文艺风格

## 字体

插件自动注册系统字体（Windows 优先使用微软雅黑），如果未找到系统字体则使用默认字体。

可通过 `fontFamily` 参数指定字体名称。

## 示例

完整示例：

```javascript
// 创建画布
create_poster_canvas({ preset: 'poster_square' })

// 添加渐变背景
add_poster_background({
  gradient: {
    type: 'linear',
    colors: ['#667eea', '#764ba2'],
    direction: 135
  }
})

// 添加装饰圆形
add_poster_circle({
  cx: 1600, cy: 400, rx: 200,
  fill: '#e94560', opacity: 0.3
})

// 添加主标题
add_poster_text({
  text: 'FOLIKO AI',
  x: 1000, y: 1000,
  fontSize: 120,
  color: '#ffffff',
  align: 'center',
  shadow: {
    color: 'rgba(0,0,0,0.5)',
    blur: 10,
    offsetX: 2, offsetY: 2
  }
})

// 添加副标题
add_poster_text({
  text: '智能助手新体验',
  x: 1000, y: 1100,
  fontSize: 48,
  color: '#cccccc',
  align: 'center'
})

// 导出
export_poster_canvas({
  filename: 'foliko-poster',
  outputDir: './output'
})
```
