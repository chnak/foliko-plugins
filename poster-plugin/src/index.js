/**
 * Poster Plugin - 海报制作插件 (重构版)
 * 
 * 模块化架构，支持组件化海报生成
 */

const { z } = require('zod')
const path = require('path')
const fs = require('fs')

// 导入模块
const PRESETS = require('./presets')
const CanvasManager = require('./canvas')
const { createFromConfig, COMPONENT_TYPES } = require('./composer')
const { applyTemplate, getAvailableTemplates } = require('./templates')
const {
  addRectangle,
  addCircle,
  addLine,
  addPolygon,
  addImage,
  addText,
  addArtText,
  addBackground,
  addSVG,
} = require('./elements')
const {
  createCard,
  createBadge,
  createCTA,
  createFeature,
  createFeatureGrid,
  createDivider,
  createAvatar,
  createProgress,
  createRating,
  createQuote,
  createStatCard,
  createTagCloud,
  createStepper,
  createTimeline,
  createListItem,
  createNotification,
  createImageFrame,
  createColumns,
  createGrid,
  createStar,
  createArrow,
  createProgressCircle,
  createChip,
  createChart,
  createWatermark,
  createTable,
} = require('./components')

module.exports = function (Plugin) {
  return class PosterPlugin extends Plugin {
    constructor(config = {}) {
      super()
      this.name = 'poster'
      this.version = '1.1.0'
      this.description = '海报制作插件 - 支持组件化海报生成'
      this.priority = 15

      this._framework = null
      this._canvasManager = new CanvasManager()
    }

    async install(framework) {
      this._framework = framework
      console.log('[poster] Poster plugin installed (v1.1.0)')
      console.log('[poster] Components:', Object.keys(COMPONENT_TYPES).join(', '))
      return this
    }

    start(framework) {
      console.log('[poster] Poster plugin started')
    }

    // ==================== 工具定义 ====================

    all_tools = {
      // ==================== 画布管理 ====================

      /**
       * 列出预设尺寸
       */
      list_poster_presets: {
        description: '列出所有可用的海报/Banner预设尺寸',
        inputSchema: z.object({}),
        execute: async () => ({
          success: true,
          presets: Object.entries(PRESETS).map(([key, value]) => ({ key, ...value })),
        }),
      },

      /**
       * 创建画布
       */
      create_poster_canvas: {
        description: '创建新画布，支持预设尺寸或自定义尺寸',
        inputSchema: z.object({
          preset: z.string().optional().describe('预设尺寸key'),
          width: z.number().optional().describe('自定义宽度'),
          height: z.number().optional().describe('自定义高度'),
          background: z.string().optional().describe('背景颜色'),
        }),
        execute: async (args) => {
          try {
            const result = this._canvasManager.create(args)
            return { success: true, ...result }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 获取画布信息
       */
      get_poster_canvas_info: {
        description: '获取当前画布信息',
        inputSchema: z.object({}),
        execute: async () => {
          if (!this._canvasManager.isCreated()) {
            return { success: false, error: 'No canvas created' }
          }
          const size = this._canvasManager.getSize()
          return {
            success: true,
            ...size,
            elementCount: this._canvasManager.getElementCount(),
          }
        },
      },

      /**
       * 清除画布
       */
      clear_poster_canvas: {
        description: '清除画布上的所有元素',
        inputSchema: z.object({}),
        execute: async () => {
          if (!this._canvasManager.isCreated()) {
            return { success: false, error: 'No canvas created' }
          }
          this._canvasManager.clear()
          return { success: true, message: 'Canvas cleared' }
        },
      },

      // ==================== 基础元素 ====================

      /**
       * 添加背景
       */
      add_poster_background: {
        description: '为画布添加纯色或渐变背景',
        inputSchema: z.object({
          color: z.string().optional().describe('纯色背景'),
          gradient: z.object({
            type: z.enum(['linear', 'radial']).describe('渐变类型'),
            colors: z.array(z.string()).describe('颜色数组'),
            direction: z.number().optional().describe('方向角度，默认45'),
          }).optional(),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addBackground(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加矩形
       */
      add_poster_rectangle: {
        description: '在画布上添加矩形',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('宽度'),
          height: z.number().describe('高度'),
          fill: z.string().optional().describe('填充颜色'),
          stroke: z.string().optional().describe('边框颜色'),
          strokeWidth: z.number().optional().describe('边框宽度'),
          radius: z.number().optional().describe('圆角半径'),
          opacity: z.number().optional().describe('透明度 0-1'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addRectangle(this._canvasManager.getProject(), args)
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加圆形
       */
      add_poster_circle: {
        description: '在画布上添加圆形或椭圆',
        inputSchema: z.object({
          cx: z.number().describe('圆心X坐标'),
          cy: z.number().describe('圆心Y坐标'),
          rx: z.number().describe('X轴半径'),
          ry: z.number().optional().describe('Y轴半径'),
          fill: z.string().optional().describe('填充颜色'),
          stroke: z.string().optional().describe('边框颜色'),
          strokeWidth: z.number().optional().describe('边框宽度'),
          opacity: z.number().optional().describe('透明度 0-1'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addCircle(this._canvasManager.getProject(), args)
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加线条
       */
      add_poster_line: {
        description: '在画布上添加线条',
        inputSchema: z.object({
          x1: z.number().describe('起点X'),
          y1: z.number().describe('起点Y'),
          x2: z.number().describe('终点X'),
          y2: z.number().describe('终点Y'),
          stroke: z.string().optional().describe('线条颜色'),
          strokeWidth: z.number().optional().describe('线条宽度'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addLine(this._canvasManager.getProject(), args)
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加多边形
       */
      add_poster_polygon: {
        description: '在画布上添加多边形',
        inputSchema: z.object({
          cx: z.number().describe('中心X坐标'),
          cy: z.number().describe('中心Y坐标'),
          radius: z.number().describe('外接圆半径'),
          sides: z.number().describe('边数'),
          fill: z.string().optional().describe('填充颜色'),
          stroke: z.string().optional().describe('边框颜色'),
          strokeWidth: z.number().optional().describe('边框宽度'),
          opacity: z.number().optional().describe('透明度 0-1'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addPolygon(this._canvasManager.getProject(), args)
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加文字
       */
      add_poster_text: {
        description: '在画布上添加文字',
        inputSchema: z.object({
          text: z.string().describe('文字内容'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          fontSize: z.number().optional().describe('字体大小，默认48'),
          fontFamily: z.string().optional().describe('字体名称'),
          color: z.string().optional().describe('文字颜色'),
          align: z.enum(['left', 'center', 'right']).optional().describe('对齐方式'),
          shadow: z.object({
            color: z.string().describe('阴影颜色'),
            blur: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
          }).optional(),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addText(this._canvasManager.getProject(), args)
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加艺术文字
       */
      add_poster_art_text: {
        description: '添加艺术文字，支持渐变填充和描边',
        inputSchema: z.object({
          text: z.string().describe('文字内容'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          fontSize: z.number().optional().describe('字体大小，默认120'),
          fontFamily: z.string().optional().describe('字体名称'),
          gradient: z.object({
            colors: z.array(z.string()).describe('渐变颜色数组'),
            direction: z.number().optional().describe('方向角度'),
          }).optional(),
          strokeColor: z.string().optional().describe('描边颜色'),
          strokeWidth: z.number().optional().describe('描边宽度'),
          shadow: z.object({
            color: z.string().describe('阴影颜色'),
            blur: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
          }).optional(),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addArtText(this._canvasManager.getProject(), args)
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加图片
       */
      add_poster_image: {
        description: '在画布上添加图片',
        inputSchema: z.object({
          src: z.string().describe('图片路径或URL'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('图片宽度'),
          height: z.number().optional().describe('图片高度'),
          opacity: z.number().optional().describe('透明度 0-1'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addImage(this._canvasManager.getProject(), args)
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // ==================== SVG 支持 ====================

      /**
       * 导入 SVG 文件或内容
       */
      add_poster_svg: {
        description: '在画布上添加 SVG（支持文件路径或 SVG 字符串）',
        inputSchema: z.object({
          src: z.string().describe('SVG 文件路径或 SVG 字符串'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('宽度'),
          height: z.number().optional().describe('高度'),
          opacity: z.number().optional().describe('透明度 0-1'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addSVG(this._canvasManager.getProject(), args)
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 导出为 SVG 格式
       */
      export_poster_svg: {
        description: '导出画布为 SVG 格式',
        inputSchema: z.object({
          filename: z.string().describe('文件名（不含扩展名）'),
          outputDir: z.string().optional().describe('输出目录'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }

            const outputDir = args.outputDir || '.'
            const filename = `${args.filename}.svg`
            await fs.promises.mkdir(outputDir, { recursive: true })
            const filepath = path.join(outputDir, filename)

            const svg = this._canvasManager.getProject().exportSVG({
              asString: true,
              bounds: 'content',
            })

            await fs.promises.writeFile(filepath, svg)

            return {
              success: true,
              filepath,
              filename,
              format: 'svg',
              size: Buffer.byteLength(svg),
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 导出为 SVG Base64
       */
      export_poster_svg_base64: {
        description: '导出画布为 SVG Base64 编码',
        inputSchema: z.object({}),
        execute: async () => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }

            const svg = this._canvasManager.getProject().exportSVG({
              asString: true,
              bounds: 'content',
            })

            const base64 = Buffer.from(svg).toString('base64')

            return {
              success: true,
              base64,
              svg,
              mimeType: 'image/svg+xml',
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // ==================== 高级组件 ====================

      /**
       * 添加卡片组件
       */
      add_poster_card: {
        description: '添加卡片组件（带背景、标题、副标题）',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('卡片宽度'),
          height: z.number().describe('卡片高度'),
          background: z.string().optional().describe('背景色'),
          border: z.string().optional().describe('边框颜色'),
          borderWidth: z.number().optional().describe('边框宽度'),
          radius: z.number().optional().describe('圆角半径'),
          title: z.string().optional().describe('标题文字'),
          titleSize: z.number().optional().describe('标题字体大小'),
          titleColor: z.string().optional().describe('标题颜色'),
          subtitle: z.string().optional().describe('副标题'),
          subtitleSize: z.number().optional().describe('副标题字体大小'),
          subtitleColor: z.string().optional().describe('副标题颜色'),
          padding: z.number().optional().describe('内边距'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createCard(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加徽章组件
       */
      add_poster_badge: {
        description: '添加徽章/标签组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标（居中）'),
          y: z.number().describe('Y坐标'),
          text: z.string().describe('徽章文字'),
          background: z.string().optional().describe('背景色'),
          color: z.string().optional().describe('文字颜色'),
          border: z.string().optional().describe('边框颜色'),
          fontSize: z.number().optional().describe('字体大小'),
          padding: z.number().optional().describe('内边距'),
          radius: z.number().optional().describe('圆角半径'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createBadge(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加 CTA 按钮
       */
      add_poster_cta: {
        description: '添加行动号召按钮',
        inputSchema: z.object({
          x: z.number().describe('X坐标（居中）'),
          y: z.number().describe('Y坐标'),
          text: z.string().describe('按钮文字'),
          background: z.string().optional().describe('背景色'),
          color: z.string().optional().describe('文字颜色'),
          border: z.string().optional().describe('边框颜色'),
          fontSize: z.number().optional().describe('字体大小'),
          padding: z.number().optional().describe('内边距'),
          radius: z.number().optional().describe('圆角半径'),
          shadow: z.object({
            color: z.string().optional(),
            blur: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
          }).optional(),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createCTA(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加特性展示
       */
      add_poster_feature: {
        description: '添加特性展示块',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('宽度'),
          icon: z.string().optional().describe('图标 emoji'),
          title: z.string().optional().describe('标题'),
          description: z.string().optional().describe('描述'),
          iconColor: z.string().optional().describe('图标颜色'),
          titleColor: z.string().optional().describe('标题颜色'),
          descColor: z.string().optional().describe('描述颜色'),
          iconSize: z.number().optional().describe('图标大小'),
          titleSize: z.number().optional().describe('标题大小'),
          descSize: z.number().optional().describe('描述大小'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createFeature(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加特性网格
       */
      add_poster_feature_grid: {
        description: '添加特性网格布局',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          columns: z.number().optional().describe('列数，默认3'),
          itemWidth: z.number().optional().describe('每个特性宽度，默认200'),
          itemHeight: z.number().optional().describe('每个特性高度，默认120'),
          gap: z.number().optional().describe('间距，默认20'),
          items: z.array(z.object({
            icon: z.string().optional(),
            title: z.string().optional(),
            description: z.string().optional(),
            iconColor: z.string().optional(),
            titleColor: z.string().optional(),
            descColor: z.string().optional(),
          })).describe('特性数组'),
          background: z.string().optional().describe('背景色'),
          borderColor: z.string().optional().describe('边框颜色'),
          radius: z.number().optional().describe('圆角半径'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createFeatureGrid(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加分隔线
       */
      add_poster_divider: {
        description: '添加分隔线',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('宽度'),
          color: z.string().optional().describe('颜色'),
          thickness: z.number().optional().describe('厚度'),
          style: z.enum(['solid', 'dashed']).optional().describe('样式'),
          align: z.enum(['left', 'center', 'right']).optional().describe('对齐'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createDivider(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加头像
       */
      add_poster_avatar: {
        description: '添加头像组件',
        inputSchema: z.object({
          x: z.number().describe('圆心X坐标'),
          y: z.number().describe('圆心Y坐标'),
          size: z.number().optional().describe('头像大小'),
          initials: z.string().optional().describe('首字母'),
          background: z.string().optional().describe('背景色'),
          border: z.string().optional().describe('边框颜色'),
          borderWidth: z.number().optional().describe('边框宽度'),
          color: z.string().optional().describe('文字颜色'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createAvatar(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加进度条
       */
      add_poster_progress: {
        description: '添加进度条组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('进度条宽度'),
          height: z.number().optional().describe('进度条高度'),
          value: z.number().optional().describe('进度值 0-100'),
          trackColor: z.string().optional().describe('轨道颜色'),
          fillColor: z.string().optional().describe('填充颜色'),
          radius: z.number().optional().describe('圆角半径'),
          showLabel: z.boolean().optional().describe('是否显示标签'),
          label: z.string().optional().describe('标签文字'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createProgress(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加星级评分
       */
      add_poster_rating: {
        description: '添加星级评分组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          value: z.number().optional().describe('评分值 0-5'),
          max: z.number().optional().describe('最大值'),
          size: z.number().optional().describe('星星大小'),
          filledColor: z.string().optional().describe('填充颜色'),
          emptyColor: z.string().optional().describe('空心颜色'),
          gap: z.number().optional().describe('星星间距'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createRating(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加引用块
       */
      add_poster_quote: {
        description: '添加引用块组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('宽度'),
          text: z.string().describe('引用文字'),
          author: z.string().optional().describe('作者'),
          background: z.string().optional().describe('背景色'),
          borderColor: z.string().optional().describe('左边框颜色'),
          padding: z.number().optional().describe('内边距'),
          radius: z.number().optional().describe('圆角半径'),
          textColor: z.string().optional().describe('文字颜色'),
          authorColor: z.string().optional().describe('作者颜色'),
          fontSize: z.number().optional().describe('字体大小'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createQuote(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加统计卡片
       */
      add_poster_stat_card: {
        description: '添加统计卡片组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('宽度'),
          height: z.number().optional().describe('高度'),
          label: z.string().optional().describe('标签'),
          value: z.string().optional().describe('数值'),
          change: z.string().optional().describe('变化值'),
          positive: z.boolean().optional().describe('变化是否为正'),
          icon: z.string().optional().describe('图标'),
          iconColor: z.string().optional().describe('图标颜色'),
          background: z.string().optional().describe('背景色'),
          border: z.string().optional().describe('边框颜色'),
          radius: z.number().optional().describe('圆角半径'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createStatCard(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加标签云
       */
      add_poster_tag_cloud: {
        description: '添加标签云组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          tags: z.array(z.object({
            text: z.string(),
            color: z.string().optional(),
            bgColor: z.string().optional(),
          })).describe('标签数组'),
          fontSize: z.number().optional().describe('字体大小'),
          padding: z.number().optional().describe('标签内边距'),
          gap: z.number().optional().describe('标签间距'),
          maxWidth: z.number().optional().describe('最大宽度'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createTagCloud(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加步骤指示器
       */
      add_poster_stepper: {
        description: '添加步骤指示器组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('总宽度'),
          steps: z.array(z.object({
            title: z.string(),
            description: z.string().optional(),
          })).describe('步骤数组'),
          currentStep: z.number().optional().describe('当前步骤'),
          activeColor: z.string().optional().describe('激活颜色'),
          inactiveColor: z.string().optional().describe('未激活颜色'),
          completedColor: z.string().optional().describe('已完成颜色'),
          circleSize: z.number().optional().describe('圆圈大小'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createStepper(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加时间线
       */
      add_poster_timeline: {
        description: '添加时间线组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('总宽度'),
          items: z.array(z.object({
            date: z.string().optional(),
            title: z.string(),
            description: z.string().optional(),
            active: z.boolean().optional(),
          })).describe('时间线项目数组'),
          lineColor: z.string().optional().describe('线条颜色'),
          dotColor: z.string().optional().describe('点颜色'),
          dotSize: z.number().optional().describe('点大小'),
          gap: z.number().optional().describe('项目间距'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createTimeline(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加列表项
       */
      add_poster_list_item: {
        description: '添加列表项组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('宽度'),
          icon: z.string().optional().describe('图标'),
          title: z.string().optional().describe('标题'),
          description: z.string().optional().describe('描述'),
          badge: z.string().optional().describe('徽章文字'),
          badgeColor: z.string().optional().describe('徽章颜色'),
          iconColor: z.string().optional().describe('图标颜色'),
          background: z.string().optional().describe('背景色'),
          borderColor: z.string().optional().describe('边框颜色'),
          height: z.number().optional().describe('高度'),
          radius: z.number().optional().describe('圆角半径'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createListItem(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加通知提示
       */
      add_poster_notification: {
        description: '添加通知提示组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('宽度'),
          type: z.enum(['success', 'warning', 'error', 'info']).optional().describe('类型'),
          title: z.string().optional().describe('标题'),
          message: z.string().optional().describe('消息内容'),
          showIcon: z.boolean().optional().describe('是否显示图标'),
          radius: z.number().optional().describe('圆角半径'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createNotification(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加图片框组件
       */
      add_poster_image_frame: {
        description: '添加带装饰边框的图片框组件',
        inputSchema: z.object({
          src: z.string().describe('图片路径或URL'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('图片宽度'),
          height: z.number().describe('图片高度'),
          borderColor: z.string().optional().describe('边框颜色'),
          borderWidth: z.number().optional().describe('边框宽度'),
          outerColor: z.string().optional().describe('外边框颜色'),
          outerWidth: z.number().optional().describe('外边框宽度'),
          shadowBlur: z.number().optional().describe('阴影模糊'),
          shadowOffsetX: z.number().optional().describe('阴影X偏移'),
          shadowOffsetY: z.number().optional().describe('阴影Y偏移'),
          shadowColor: z.string().optional().describe('阴影颜色'),
          radius: z.number().optional().describe('圆角半径'),
          overlayColor: z.string().optional().describe('叠加颜色'),
          overlayOpacity: z.number().optional().describe('叠加透明度'),
          fit: z.enum(['cover', 'contain', 'fill']).optional().describe('图片填充方式'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createImageFrame(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加分栏布局组件
       */
      add_poster_columns: {
        description: '添加分栏布局组件（左右分栏、三栏等）',
        inputSchema: z.object({
          x: z.number().describe('起始X坐标'),
          y: z.number().describe('起始Y坐标'),
          width: z.number().describe('总宽度'),
          height: z.number().describe('总高度'),
          columns: z.number().optional().describe('列数，默认2'),
          gap: z.number().optional().describe('列间距，默认20'),
          background: z.string().optional().describe('背景色'),
          borderColor: z.string().optional().describe('边框颜色'),
          borderWidth: z.number().optional().describe('边框宽度'),
          radius: z.number().optional().describe('圆角半径'),
          direction: z.enum(['horizontal', 'vertical']).optional().describe('排列方向'),
          align: z.enum(['top', 'center', 'bottom']).optional().describe('垂直对齐'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createColumns(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加网格布局组件
       */
      add_poster_grid: {
        description: '添加网格布局组件（任意行列）',
        inputSchema: z.object({
          x: z.number().describe('起始X坐标'),
          y: z.number().describe('起始Y坐标'),
          width: z.number().describe('总宽度'),
          height: z.number().describe('总高度'),
          columns: z.number().optional().describe('列数，默认3'),
          rows: z.number().optional().describe('行数，默认2'),
          gapX: z.number().optional().describe('水平间距，默认20'),
          gapY: z.number().optional().describe('垂直间距，默认20'),
          background: z.string().optional().describe('背景色'),
          borderColor: z.string().optional().describe('边框颜色'),
          borderWidth: z.number().optional().describe('边框宽度'),
          radius: z.number().optional().describe('圆角半径'),
          direction: z.enum(['row', 'column']).optional().describe('排列方向'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createGrid(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加星形组件
       */
      add_poster_star: {
        description: '添加星形/多角形装饰',
        inputSchema: z.object({
          cx: z.number().describe('中心X坐标'),
          cy: z.number().describe('中心Y坐标'),
          points: z.number().optional().describe('星形点数，默认5'),
          innerRadius: z.number().optional().describe('内半径'),
          outerRadius: z.number().describe('外半径'),
          fill: z.string().optional().describe('填充颜色'),
          stroke: z.string().optional().describe('边框颜色'),
          strokeWidth: z.number().optional().describe('边框宽度'),
          opacity: z.number().optional().describe('透明度 0-1'),
          rotation: z.number().optional().describe('旋转角度'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const project = this._canvasManager.getProject()
            const result = createStar(project, this._canvasManager.getCanvas(), args)
            // 强制将所有子元素添加到活动层
            if (result && result.elements && project) {
              // 收集所有新创建的 item
              const allItems = project.getItems({})
              const existingIds = new Set(allItems.map(i => i.id))
              
              // 从项目的所有层中获取新添加的 item
              project.layers.forEach(layer => {
                layer.children.forEach(item => {
                  if (item.id && !existingIds.has(item.id) || item.parent === layer) {
                    if (item.parent !== project.activeLayer) {
                      project.activeLayer.addChild(item)
                    }
                  }
                })
              })
            }
            return result
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加箭头组件
       */
      add_poster_arrow: {
        description: '添加箭头指示',
        inputSchema: z.object({
          x1: z.number().describe('起点X'),
          y1: z.number().describe('起点Y'),
          x2: z.number().describe('终点X'),
          y2: z.number().describe('终点Y'),
          color: z.string().optional().describe('箭头颜色'),
          strokeWidth: z.number().optional().describe('线宽'),
          headSize: z.number().optional().describe('箭头头部大小'),
          style: z.enum(['solid', 'dashed']).optional().describe('样式'),
          direction: z.enum(['end', 'start', 'both']).optional().describe('箭头方向'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createArrow(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
            if (result && result.elements && this._canvasManager.getProject()) {
              const project = this._canvasManager.getProject()
              result.elements.forEach(el => {
                if (el.id) {
                  const item = project.getItem({ id: el.id })
                  if (item) project.activeLayer.addChild(item)
                }
              })
            }
            return result
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加环形进度条
       */
      add_poster_progress_circle: {
        description: '添加环形进度条组件',
        inputSchema: z.object({
          cx: z.number().describe('圆心X坐标'),
          cy: z.number().describe('圆心Y坐标'),
          radius: z.number().describe('圆环半径'),
          value: z.number().describe('进度值 0-100'),
          strokeWidth: z.number().optional().describe('环宽度'),
          trackColor: z.string().optional().describe('轨道颜色'),
          fillColor: z.string().optional().describe('进度颜色'),
          backgroundColor: z.string().optional().describe('背景填充色'),
          showLabel: z.boolean().optional().describe('是否显示百分比标签'),
          labelColor: z.string().optional().describe('标签颜色'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createProgressCircle(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
            if (result && result.elements && this._canvasManager.getProject()) {
              const project = this._canvasManager.getProject()
              result.elements.forEach(el => {
                if (el.id) {
                  const item = project.getItem({ id: el.id })
                  if (item) project.activeLayer.addChild(item)
                }
              })
            }
            return result
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加 Chip 标签
       */
      add_poster_chip: {
        description: '添加小型信息标签组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标（居中）'),
          y: z.number().describe('Y坐标'),
          text: z.string().describe('标签文字'),
          background: z.string().optional().describe('背景色'),
          color: z.string().optional().describe('文字颜色'),
          borderColor: z.string().optional().describe('边框颜色'),
          fontSize: z.number().optional().describe('字体大小'),
          padding: z.number().optional().describe('内边距'),
          radius: z.number().optional().describe('圆角'),
          icon: z.string().optional().describe('前置图标 emoji'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createChip(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
            if (result && result.elements && this._canvasManager.getProject()) {
              const project = this._canvasManager.getProject()
              result.elements.forEach(el => {
                if (el.id) {
                  const item = project.getItem({ id: el.id })
                  if (item) project.activeLayer.addChild(item)
                }
              })
            }
            return result
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加图表组件
       */
      add_poster_chart: {
        description: '添加图表组件（柱状图/饼图）',
        inputSchema: z.object({
          type: z.enum(['bar', 'pie']).describe('图表类型'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('宽度'),
          height: z.number().describe('高度'),
          data: z.array(z.object({
            label: z.string().describe('标签'),
            value: z.number().describe('数值'),
            color: z.string().optional().describe('颜色'),
          })).describe('数据'),
          barColor: z.string().optional().describe('默认柱状颜色'),
          showLabels: z.boolean().optional().describe('显示标签'),
          showValues: z.boolean().optional().describe('显示数值'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createChart(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
            if (result && result.elements && this._canvasManager.getProject()) {
              const project = this._canvasManager.getProject()
              result.elements.forEach(el => {
                if (el.id) {
                  const item = project.getItem({ id: el.id })
                  if (item) project.activeLayer.addChild(item)
                }
              })
            }
            return result
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加水印
       */
      add_poster_watermark: {
        description: '添加水印文字',
        inputSchema: z.object({
          text: z.string().describe('水印文字'),
          cx: z.number().describe('中心X坐标'),
          cy: z.number().describe('中心Y坐标'),
          color: z.string().optional().describe('水印颜色'),
          fontSize: z.number().optional().describe('字体大小'),
          fontFamily: z.string().optional().describe('字体'),
          opacity: z.number().optional().describe('透明度'),
          rotation: z.number().optional().describe('旋转角度'),
          align: z.enum(['left', 'center', 'right']).optional().describe('对齐方式'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createWatermark(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
            if (result && result.elements && this._canvasManager.getProject()) {
              const project = this._canvasManager.getProject()
              result.elements.forEach(el => {
                if (el.id) {
                  const item = project.getItem({ id: el.id })
                  if (item) project.activeLayer.addChild(item)
                }
              })
            }
            return result
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加表格组件
       */
      add_poster_table: {
        description: '添加表格组件',
        inputSchema: z.object({
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('表格宽度'),
          columns: z.array(z.object({
            title: z.string().describe('列标题'),
            width: z.number().optional().describe('列宽'),
            align: z.enum(['left', 'center', 'right']).optional().describe('对齐'),
          })).describe('列配置'),
          rows: z.array(z.array(z.string())).describe('行数据'),
          rowHeight: z.number().optional().describe('行高'),
          headerBg: z.string().optional().describe('表头背景色'),
          headerColor: z.string().optional().describe('表头文字色'),
          borderColor: z.string().optional().describe('边框颜色'),
          fontSize: z.number().optional().describe('字体大小'),
          striped: z.boolean().optional().describe('斑马纹'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createTable(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
            if (result && result.elements && this._canvasManager.getProject()) {
              const project = this._canvasManager.getProject()
              result.elements.forEach(el => {
                if (el.id) {
                  const item = project.getItem({ id: el.id })
                  if (item) project.activeLayer.addChild(item)
                }
              })
            }
            return result
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // ==================== 组件化海报生成 ====================

      /**
       * 组件化生成海报
       */
      compose_poster: {
        description: '使用组件配置一次性生成海报',
        inputSchema: z.object({
          components: z.array(z.object({
            type: z.enum([
              'background', 'rectangle', 'circle', 'line', 'polygon',
              'text', 'artText', 'image', 'svg', 'imageFrame',
              'columns', 'grid', 'star', 'arrow', 'progressCircle', 'chip', 'chart', 'watermark', 'table',
              'card', 'badge', 'cta', 'feature', 'featureGrid', 'divider',
              'avatar', 'progress', 'rating', 'quote', 'statCard', 
              'tagCloud', 'stepper', 'timeline', 'listItem', 'notification',
            ]).describe('组件类型'),
          })).describe('组件配置数组'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createFromConfig(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 获取可用组件类型
       */
      list_poster_components: {
        description: '列出所有可用的组件类型',
        inputSchema: z.object({}),
        execute: async () => ({
          success: true,
          components: Object.keys(COMPONENT_TYPES),
        }),
      },

      // ==================== 模板 ====================

      /**
       * 一键生成海报
       */
      generate_poster: {
        description: '使用预设模板一键生成海报',
        inputSchema: z.object({
          template: z.enum(['modern', 'business', 'social', 'simple', 'tech', 'gradient']).describe('模板类型'),
          title: z.string().describe('主标题'),
          subtitle: z.string().optional().describe('副标题'),
          background: z.string().optional().describe('背景色'),
          accentColor: z.string().optional().describe('强调色'),
          output: z.string().describe('输出文件名'),
          outputDir: z.string().optional().describe('输出目录'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }

            // 应用模板
            applyTemplate(
              this._canvasManager.getProject(),
              this._canvasManager.getCanvas(),
              args.template,
              args
            )

            // 导出
            const format = 'png'
            const outputDir = args.outputDir || '.'
            const filename = `${args.output}.${format}`
            await fs.promises.mkdir(outputDir, { recursive: true })
            const filepath = path.join(outputDir, filename)
            const buffer = this._canvasManager.toBuffer(format)
            await fs.promises.writeFile(filepath, buffer)

            return {
              success: true,
              filepath,
              template: args.template,
              size: buffer.length,
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 列出可用模板
       */
      list_poster_templates: {
        description: '列出所有可用的海报模板',
        inputSchema: z.object({}),
        execute: async () => ({
          success: true,
          templates: getAvailableTemplates(),
        }),
      },

      // ==================== 导出 ====================

      /**
       * 导出为文件
       */
      export_poster_canvas: {
        description: '导出画布为图片文件',
        inputSchema: z.object({
          filename: z.string().describe('文件名（不含扩展名）'),
          format: z.enum(['png', 'jpg']).optional().describe('格式，默认png'),
          quality: z.number().optional().describe('JPEG质量'),
          outputDir: z.string().optional().describe('输出目录'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }

            const format = args.format || 'png'
            const outputDir = args.outputDir || '.'
            const filename = `${args.filename}.${format}`
            await fs.promises.mkdir(outputDir, { recursive: true })
            const filepath = path.join(outputDir, filename)
            const buffer = this._canvasManager.toBuffer(format, args.quality)
            await fs.promises.writeFile(filepath, buffer)

            return {
              success: true,
              filepath,
              filename,
              format,
              size: buffer.length,
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 导出为 Base64
       */
      export_poster_base64: {
        description: '导出画布为 Base64 编码',
        inputSchema: z.object({
          format: z.enum(['png', 'jpg']).optional().describe('格式'),
          quality: z.number().optional().describe('JPEG质量'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvasManager.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }

            const format = args.format || 'png'
            const base64 = this._canvasManager.toBase64(format, args.quality)
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'

            return {
              success: true,
              base64,
              format,
              mimeType,
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },
    }

    install(framework){
      this._framework=framework
      Object.keys(this.all_tools).map(key=>{
        this._framework.registerTool({...this.all_tools[key],name:key})
      })
    }



    reload(framework) {
      console.log('[poster] Reloading poster plugin')
      this._framework = framework
    }

    uninstall(framework) {
      this._canvasManager.reset()
      this._framework = null
      console.log('[poster] Poster plugin uninstalled')
    }
  }
}
