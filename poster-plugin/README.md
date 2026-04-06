# Poster Plugin - 海报制作插件

基于 Paper.js 的海报/Banner 设计插件，支持**组件化**海报生成。

## 功能特性

- **预设尺寸**：20+ 常用尺寸（海报、Banner、社交媒体）
- **基础元素**：矩形、圆形、线条、多边形、图片、文字、艺术文字、图片框
- **布局组件**：分栏布局、网格布局
- **装饰组件**：星形、箭头、环形进度条、标签、图表、水印、表格
- **高级组件**：卡片、徽章、CTA按钮、特性展示、特性网格、分隔线、头像、进度条、评分、引用、统计卡、标签云、步骤条、时间线、列表项、通知
- **组件化生成**：通过 JSON 配置一次性生成完整海报
- **模板系统**：modern、business、social、simple、tech、gradient 六种预设模板

## 工具列表（共 35 个组件）

### 画布管理
| 工具 | 描述 |
|------|------|
| `list_poster_presets` | 列出所有预设尺寸 |
| `create_poster_canvas` | 创建新画布 |
| `get_poster_canvas_info` | 获取画布信息 |
| `clear_poster_canvas` | 清除画布 |
| `export_poster_canvas` | 导出为 PNG 文件 |
| `export_poster_svg` | 导出为 SVG 矢量图 |
| `export_poster_base64` | 导出为 Base64 |

### 基础元素 (10)
| 工具 | 描述 |
|------|------|
| `add_poster_background` | 添加纯色/渐变背景 |
| `add_poster_rectangle` | 添加矩形 |
| `add_poster_circle` | 添加圆形/椭圆 |
| `add_poster_line` | 添加线条 |
| `add_poster_polygon` | 添加多边形 |
| `add_poster_text` | 添加文字 |
| `add_poster_art_text` | 添加艺术文字（渐变/描边） |
| `add_poster_image` | 添加图片 |
| `add_poster_svg` | 添加 SVG 矢量图 |
| `add_poster_image_frame` | 添加图片框（带装饰边框） |

### 布局组件 (2)
| 工具 | 描述 |
|------|------|
| `add_poster_columns` | 分栏布局（左右分栏、多栏） |
| `add_poster_grid` | 网格布局（任意行列） |

### 装饰组件 (7)
| 工具 | 描述 |
|------|------|
| `add_poster_star` | 星形/多角形装饰 |
| `add_poster_arrow` | 箭头指示 |
| `add_poster_progress_circle` | 环形进度条 |
| `add_poster_chip` | 小型标签 |
| `add_poster_chart` | 图表（柱状图、饼图） |
| `add_poster_watermark` | 水印文字 |
| `add_poster_table` | 数据表格 |

### 高级组件 (16)
| 工具 | 描述 |
|------|------|
| `add_poster_card` | 卡片组件 |
| `add_poster_badge` | 徽章/标签 |
| `add_poster_cta` | CTA 行动号召按钮 |
| `add_poster_feature` | 特性展示块 |
| `add_poster_feature_grid` | 特性网格布局 |
| `add_poster_divider` | 分隔线 |
| `add_poster_avatar` | 用户头像 |
| `add_poster_progress` | 线性进度条 |
| `add_poster_rating` | 星级评分 |
| `add_poster_quote` | 引用块 |
| `add_poster_stat_card` | 统计卡片 |
| `add_poster_tag_cloud` | 标签云 |
| `add_poster_stepper` | 步骤指示器 |
| `add_poster_timeline` | 时间线 |
| `add_poster_list_item` | 列表项 |
| `add_poster_notification` | 通知提示 |

### 组件化生成 & 模板
| 工具 | 描述 |
|------|------|
| `compose_poster` | 使用组件配置生成海报 |
| `list_poster_components` | 列出可用组件类型 |
| `generate_poster` | 一键生成海报（6种模板） |
| `list_poster_templates` | 列出可用模板 |

## 预设尺寸

| Key | 尺寸 | 名称 |
|-----|------|------|
| `poster_a4` | 2480×3508 | A4海报 (300dpi) |
| `poster_square` | 2000×2000 | 方形海报 |
| `poster_16_9` | 1920×1080 | 16:9海报 |
| `poster_9_16` | 1080×1920 | 9:16竖版海报 |
| `banner_1920x500` | 1920×500 | 网站Banner |
| `banner_twitter` | 1500×500 | Twitter封面 |
| `social_instagram` | 1080×1080 | Instagram正方形 |
| `social_story` | 1080×1920 | Instagram Story |
| `social_facebook` | 1200×630 | Facebook封面 |
| `social_linkedin` | 1200×627 | LinkedIn封面 |
| `social_youtube` | 2560×1440 | YouTube封面 |

## 使用示例

### 1. 组件化生成（推荐）

```javascript
compose_poster({
  components: [
    // 背景
    { type: 'background', color: '#1a1a2e' },
    
    // 装饰圆形
    { type: 'circle', cx: 1600, cy: 200, rx: 200, fill: '#00d9ff', opacity: 0.3 },
    
    // 星形装饰
    { type: 'star', cx: 200, cy: 200, points: 5, outerRadius: 60, fill: '#fbbf24' },
    
    // 主标题
    { type: 'artText', text: 'VB-Agent', x: 960, y: 400, fontSize: 120, 
      gradient: { colors: ['#00d9ff', '#00ff88'] } },
    
    // 环形进度条
    { type: 'progressCircle', cx: 400, cy: 600, radius: 80, value: 85, 
      strokeWidth: 15, fillColor: '#3b82f6', showLabel: true },
    { type: 'progressCircle', cx: 700, cy: 600, radius: 80, value: 92, 
      strokeWidth: 15, fillColor: '#10b981', showLabel: true },
    
    // 图表
    { type: 'chart', type: 'bar', x: 1100, y: 450, width: 400, height: 250,
      data: [
        { label: '一月', value: 120, color: '#3b82f6' },
        { label: '二月', value: 90, color: '#10b981' },
        { label: '三月', value: 150, color: '#f59e0b' }
      ],
      showLabels: true, showValues: true },
    
    // 数据表格
    { type: 'table', x: 100, y: 700, width: 800,
      columns: [
        { title: '功能', width: 300, align: 'left' },
        { title: '状态', width: 200 },
        { title: '价格', width: 150 }
      ],
      rows: [
        ['智能对话', '可用', '免费'],
        ['图片生成', '可用', '$29'],
        ['代码助手', 'Beta', '免费']
      ],
      headerBg: '#1e293b', headerColor: '#ffffff', striped: true },
    
    // 标签
    { type: 'chip', x: 400, y: 850, text: 'AI驱动', background: '#3b82f6', color: '#ffffff' },
    { type: 'chip', x: 550, y: 850, text: '开源', background: '#10b981', color: '#ffffff' },
    
    // 水印
    { type: 'watermark', text: 'VB-Agent', cx: 960, cy: 1000, fontSize: 200, 
      color: 'rgba(255,255,255,0.03)', rotation: -15 },
    
    // CTA 按钮
    { type: 'cta', x: 960, y: 950, text: '立即体验 →', 
      background: '#00d9ff', color: '#0a0a0f', fontSize: 24, radius: 30 }
  ]
})
export_poster_canvas({ filename: 'my-poster', outputDir: '.' })
```

### 2. 基础使用

```javascript
// 创建画布
create_poster_canvas({ preset: 'poster_square', background: '#1a1a2e' })

// 添加元素
add_poster_circle({ cx: 500, cy: 500, rx: 100, fill: '#00d9ff' })
add_poster_text({ text: 'Hello Foliko', x: 500, y: 600, fontSize: 48, color: '#ffffff', align: 'center' })

// 导出
export_poster_canvas({ filename: 'my-poster' })
```

## 新增组件详解

### 星形 (star)
```javascript
add_poster_star({
  cx: 200, cy: 200,           // 中心坐标
  points: 5,                    // 星形点数
  outerRadius: 60,              // 外半径
  fill: '#fbbf24',            // 填充颜色
  rotation: 0                   // 旋转角度
})
```

### 环形进度条 (progressCircle)
```javascript
add_poster_progress_circle({
  cx: 200, cy: 200,           // 圆心坐标
  radius: 80,                  // 圆环半径
  value: 75,                  // 进度值 0-100
  strokeWidth: 15,             // 环宽度
  trackColor: '#e5e7eb',       // 轨道颜色
  fillColor: '#3b82f6',       // 进度颜色
  backgroundColor: '#ffffff',  // 背景填充
  showLabel: true              // 显示百分比
})
```

### 图表 (chart)
```javascript
// 柱状图
add_poster_chart({
  type: 'bar',                 // bar 或 pie
  x: 100, y: 300,
  width: 500, height: 250,
  data: [
    { label: '一月', value: 120, color: '#3b82f6' },
    { label: '二月', value: 90, color: '#10b981' }
  ],
  showLabels: true,
  showValues: true
})

// 饼图
add_poster_chart({
  type: 'pie',
  x: 700, y: 300,
  width: 250, height: 250,
  data: [
    { label: 'A', value: 45, color: '#3b82f6' },
    { label: 'B', value: 35, color: '#10b981' },
    { label: 'C', value: 20, color: '#f59e0b' }
  ],
  showLabels: true
})
```

### 表格 (table)
```javascript
add_poster_table({
  x: 100, y: 400,
  width: 800,
  columns: [
    { title: '功能', width: 300, align: 'left' },
    { title: '状态', width: 200 }
  ],
  rows: [
    ['智能对话', '可用'],
    ['代码助手', 'Beta']
  ],
  headerBg: '#1e293b',
  headerColor: '#ffffff',
  striped: true
})
```

### 标签 (chip)
```javascript
add_poster_chip({
  x: 200, y: 300,
  text: 'NEW',                    // 标签文字
  background: '#ef4444',         // 背景色
  color: '#ffffff',               // 文字颜色
  fontSize: 14,
  radius: 16,                    // 圆角
  icon: '⭐'                     // 前置图标（可选）
})
```

## 项目结构

```
poster-plugin/
├── index.js              # 插件入口
├── package.json          # 包配置
├── README.md            # 文档
├── src/
│   ├── index.js          # 主模块
│   ├── canvas.js         # 画布管理器
│   ├── presets.js        # 预设尺寸
│   ├── fonts.js          # 字体管理
│   ├── composer.js       # 组件化生成器
│   ├── elements/         # 基础元素
│   ├── components/       # 高级组件
│   └── templates/        # 模板
└── fonts/              # 字体文件
```

## 更新日志

### v1.2.0
- 新增布局组件：columns（分栏）、grid（网格）
- 新增装饰组件：star（星形）、arrow（箭头）、progressCircle（环形进度条）
- 新增 chip（标签）、chart（图表）、watermark（水印）、table（表格）
- 新增 imageFrame（图片框）
- 组件总数达到 **35 个**
- 模板新增 tech（科技）、gradient（渐变）
- 修复环形进度条绘制逻辑

### v1.1.0
- 重构为模块化架构
- 新增组件化海报生成（compose_poster）
- 新增高级组件：card, badge, cta, feature, featureGrid, divider
- 新增组件：avatar, progress, rating, quote, statCard, tagCloud, stepper, timeline, listItem, notification
