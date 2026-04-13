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
  addRichText,
  addBackground,
  addSVG,
} = require('./elements')

// 字体管理
const { listAllFonts, getDefaultFont, getDefaultFontFamily, isEmojiFont } = require('./fonts')

// 布局管理
const LayoutManager = require('./layout-manager')
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
  createButton,
  createIcon,
  createQRCode,
  createFrame,
  createBubble,
  createRibbon,
  createSeal,
  createHighlightText,
  createBarcode,
} = require('./components')

// 生成唯一ID
function generateCanvasId() {
  return `canvas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

module.exports = function (Plugin) {
  return class PosterPlugin extends Plugin {
    constructor(config = {}) {
      super()
      this.name = 'poster'
      this.version = '1.2.2'
      this.description = '海报制作插件 - 支持组件化海报生成'
      this.priority = 15

      this._framework = null
      // 画布池：支持多画布并行制作
      this._canvasPool = new Map()
      // 布局池：每个画布对应一个布局管理器
      this._layoutPool = new Map()
      // 当前活跃画布ID
      this._activeCanvasId = null
    }

    /**
     * 获取或创建当前画布
     */
    _getActiveCanvas() {
      if (this._activeCanvasId) {
        const canvas = this._canvasPool.get(this._activeCanvasId)
        if (canvas) return canvas
      }
      // 如果没有活跃画布，创建一个默认的
      const id = generateCanvasId()
      const canvas = new CanvasManager()
      this._canvasPool.set(id, canvas)
      this._activeCanvasId = id
      return canvas
    }

    /**
         * 根据ID获取画布
         * @param {string} id - 画布ID
         * @returns {CanvasManager} 画布实例
         */
        _getCanvasById(id) {
          if (id) {
            const canvas = this._canvasPool.get(id)
            if (!canvas) {
              throw new Error(`Canvas not found: ${id}`)
            }
            return canvas
          }
          return this._getActiveCanvas()
        }

        /**
         * 根据画布ID获取布局管理器
         * @param {string} id - 画布ID
         * @returns {LayoutManager} 布局管理器实例
         */
        _getLayoutByCanvasId(id) {
          const layout = id ? this._layoutPool.get(id) : this._layoutPool.get(this._activeCanvasId)
          if (!layout) {
            throw new Error(`Layout not found for canvas: ${id || this._activeCanvasId}`)
          }
          return layout
        }
    
    /**
     * 创建新画布并激活
     */
    _createAndActivateCanvas() {
      const id = generateCanvasId()
      const canvas = new CanvasManager()
      const layout = new LayoutManager()  // LayoutManager 会自动获取 project
      this._canvasPool.set(id, canvas)
      this._layoutPool.set(id, layout)
      this._activeCanvasId = id
      return { id, canvas, layout }
    }

    

    // ==================== 工具定义 ====================

    tools = {
      // ==================== 画布池管理（新增） ====================

      /**
       * 创建新画布（返回画布ID）
       */
      create_poster_canvas: {
        description: '创建新画布，支持预设尺寸或自定义尺寸。每次调用创建独立的画布，支持多海报并行制作',
        inputSchema: z.object({
          preset: z.string().optional().describe('预设尺寸key'),
          width: z.number().optional().describe('自定义宽度'),
          height: z.number().optional().describe('自定义高度'),
          background: z.union([z.string(), z.object({
            image: z.string()
          })]).optional().describe('背景颜色或图片路径'),
          asNew: z.boolean().optional().describe('是否强制创建新画布（默认true）'),
        }),
        execute: async (args) => {
          try {
            // 始终创建新画布，支持并行制作
            const { id, canvas, layout } = this._createAndActivateCanvas()
            const result = await canvas.create(args)
            // 初始化布局管理器
            layout.project = canvas.getProject()
            layout.width = result.width
            layout.height = result.height
            return {
              success: true,
              id,           // 新增：返回画布ID
              ...result
            }
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
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则获取当前活跃画布'),
        }),
        execute: async (args) => {
          let canvas = this._getCanvasById(args.id)
          if (!canvas) {
              return { success: false, error: `Canvas not found: ${args.id}` }
          } else {
            canvas = this._getActiveCanvas()
          }
          
          if (!canvas.isCreated()) {
            return { success: false, error: 'No canvas created' }
          }
          const size = canvas.getSize()
          return {
            success: true,
            id: args.id || this._activeCanvasId,
            ...size,
            elementCount: canvas.getElementCount(),
          }
        },
      },

      /**
       * 切换活跃画布
       */
      use_poster_canvas: {
        description: '切换到指定画布，使其成为当前活跃画布',
        inputSchema: z.object({
          id: z.string().describe('画布ID'),
        }),
        execute: async (args) => {
          const canvas = this._getCanvasById(args.id)
          if (!canvas) {
            return { success: false, error: `Canvas not found: ${args.id}` }
          }
          this._activeCanvasId = args.id
          const size = canvas.getSize()
          return {
            success: true,
            id: args.id,
            message: 'Canvas activated',
            ...size,
            elementCount: canvas.getElementCount(),
          }
        },
      },

      /**
       * 列出所有画布
       */
      list_poster_canvases: {
        description: '列出所有已创建的画布',
        inputSchema: z.object({}),
        execute: async () => {
          const canvases = []
          for (const [id, canvas] of this._canvasPool.entries()) {
            canvases.push({
              id,
              isActive: id === this._activeCanvasId,
              isCreated: canvas.isCreated(),
              ...(canvas.isCreated() ? canvas.getSize() : {}),
              elementCount: canvas.isCreated() ? canvas.getElementCount() : 0,
            })
          }
          return {
            success: true,
            canvases,
            total: canvases.length,
            activeId: this._activeCanvasId,
          }
        },
      },

      /**
       * 销毁画布
       */
      destroy_poster_canvas: {
        description: '销毁指定画布，释放内存',
        inputSchema: z.object({
          id: z.string().optional().describe('画布ID，不填则销毁当前活跃画布'),
        }),
        execute: async (args) => {
          const targetId = args.id || this._activeCanvasId
          if (!targetId) {
            return { success: false, error: 'No canvas to destroy' }
          }
          const canvas = this._canvasPool.get(targetId)
          if (!canvas) {
            return { success: false, error: `Canvas not found: ${targetId}` }
          }
          canvas.reset()
          this._canvasPool.delete(targetId)
          // 同时删除布局管理器
          this._layoutPool.delete(targetId)

          // 如果销毁的是活跃画布，切换到其他画布
          if (targetId === this._activeCanvasId) {
            const remaining = Array.from(this._canvasPool.keys())
            this._activeCanvasId = remaining.length > 0 ? remaining[remaining.length - 1] : null
          }

          return {
            success: true,
            message: `Canvas ${id} destroyed`,
            activeId: this._activeCanvasId,
          }
        },
      },

      /**
       * 清除画布
       */
      clear_poster_canvas: {
        description: '清除画布上的所有元素',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则清除当前活跃画布'),
        }),
        execute: async (args) => {
          const canvas = this._getCanvasById(args.id)
          
          if (!canvas.isCreated()) {
            return { success: false, error: 'No canvas created' }
          }
          canvas.clear()
          // 同时清除布局管理器记录
          const layout = this._layoutPool.get(args.id || this._activeCanvasId)
          if (layout) {
            layout.clear()
          }
          return { success: true, message: 'Canvas cleared' }
        },
      },

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

      // ==================== 布局管理 ====================

      /**
       * 获取布局信息
       */
      get_poster_layout: {
        description: `获取当前画布的布局信息，包括所有元素边界、位置、重叠检测等。
使用工作流：
1. 创建画布后，定期调用检查布局问题
2. 返回的 issues 数组包含所有检测到的问题
3. recommendations 包含修复建议

返回数据结构：
- bounds: 所有元素的边界信息 [{id, type, bounds: {x, y, width, height}}]
- issues: 问题列表 [{type, elementId, message, suggestion}]
- recommendations: 修复建议列表`,
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则获取当前活跃画布'),
        }),
        execute: async (args) => {
          try {
            const canvas = this._getCanvasById(args.id)
            if (!canvas.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const layout = this._getLayoutByCanvasId(args.id)
            // 更新布局的project引用
            layout.project = canvas.getProject()
            const report = layout.generateLayoutReport()
            return {
              success: true,
              ...report
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 检测布局重叠
       */
      check_poster_overlap: {
        description: `在添加新元素前，检测是否会与现有元素重叠。
使用工作流：
1. 计算新元素的位置和尺寸
2. 调用此工具检测重叠
3. 如果 hasOverlap=true，使用 get_poster_position 获取推荐位置
4. 或调整位置/尺寸后重新检测

参数说明：
- x, y: 新元素左上角坐标
- width, height: 新元素尺寸
- margin: 元素间的最小间距（默认10px）`,
        inputSchema: z.object({
          x: z.number().describe('新元素X坐标'),
          y: z.number().describe('新元素Y坐标'),
          width: z.number().describe('新元素宽度'),
          height: z.number().describe('新元素高度'),
          margin: z.number().optional().describe('检测边距，默认10'),
          id: z.string().describe('画布ID'),
        }),
        execute: async (args) => {
          try {
            const canvas = this._getCanvasById(args.id)
            if (!canvas.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const layout = this._getLayoutByCanvasId(args.id)
            layout.project = canvas.getProject()
            const newBounds = {
              x: args.x,
              y: args.y,
              width: args.width,
              height: args.height
            }
            const result = layout.checkOverlap(newBounds, args.margin || 10)
            return {
              success: true,
              ...result
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 获取推荐位置
       */
      get_poster_position: {
        description: `根据布局提示获取新元素的推荐位置，避免重叠。
使用工作流：
1. 确定新元素的尺寸
2. 选择合适的布局提示 hint
3. 使用返回的 position 作为元素的 x, y 坐标

布局提示说明：
- below: 在所有元素下方依次排列（默认）
- center: 画布居中
- top: 在顶部元素上方
- right: 在最右边元素右侧
- left: 在最左边元素左侧
- grid: 自动网格布局
- random: 安全区域内随机位置`,
        inputSchema: z.object({
          width: z.number().describe('元素宽度'),
          height: z.number().describe('元素高度'),
          hint: z.enum(['below', 'center', 'top', 'right', 'left', 'grid', 'random']).optional().describe('布局提示'),
          margin: z.number().optional().describe('边距，默认20'),
          id: z.string().describe('画布ID'),
        }),
        execute: async (args) => {
          try {
            const canvas = this._getCanvasById(args.id)
            if (!canvas.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const layout = this._getLayoutByCanvasId(args.id)
            layout.project = canvas.getProject()
            const position = layout.getRecommendedPosition(
              args.width,
              args.height,
              args.hint || 'below',
              args.margin || 20
            )
            return {
              success: true,
              position
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 同步布局元素
       */
      sync_poster_layout: {
        description: `同步当前画布元素到布局管理器。
使用工作流：
1. 添加/删除/移动元素后调用
2. 后续的 check_overlap 和 get_position 会使用最新布局
3. 建议在批量添加元素后调用一次，而不是每添加一个元素就调用

注意：目前布局管理器直接从画布读取元素，此工具主要用于保持兼容性。`,
        inputSchema: z.object({
          id: z.string().describe('画布ID'),
        }),
        execute: async (args) => {
          try {
            const canvas = this._getCanvasById(args.id)
            if (!canvas.isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const layout = this._getLayoutByCanvasId(args.id)
            layout.project = canvas.getProject()
            // 重新获取所有元素边界
            layout.elements = [] // 清空旧记录
            const bounds = layout.getAllElementBounds()
            for (const bound of bounds) {
              layout.addElement(bound.bounds, bound.id, bound.type)
            }
            return {
              success: true,
              elementCount: bounds.length
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // ==================== 字体管理 ====================

      /**
       * 列出所有已注册的字体
       */
      list_poster_fonts: {
        description: '列出所有已注册字体的列表（包括字体名称、路径、是否默认等）',
        inputSchema: z.object({
          filter: z.enum(['all', 'emoji', 'regular']).optional().describe('字体过滤类型'),
        }),
        execute: async (args) => {
          try {
            const fontData = listAllFonts()
            
            let fonts = fontData.fonts
            let regular = fontData.regular
            let emoji = fontData.emoji
            
            // 根据过滤类型筛选
            if (args.filter === 'emoji') {
              fonts = fonts.filter(f => f.isEmoji)
              regular = []
              emoji = fonts.map(f => f.name)
            } else if (args.filter === 'regular') {
              fonts = fonts.filter(f => !f.isEmoji)
              regular = fonts.map(f => f.name)
              emoji = []
            }
            
            return {
              success: true,
              fonts,
              default: fontData.default,
              regular,
              emoji,
              total: fonts.length,
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // ==================== 基础元素 ====================

      /**
       * 添加背景
       */
      add_poster_background: {
        description: '为画布添加纯色、渐变或图片背景',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          color: z.string().optional().describe('纯色背景'),
          gradient: z.object({
            type: z.enum(['linear', 'radial']).describe('渐变类型'),
            colors: z.array(z.string()).describe('颜色数组'),
            direction: z.number().optional().describe('方向角度，默认45'),
          }).optional(),
          image: z.string().optional().describe('背景图片路径（本地路径或URL）'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return await addBackground(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addRectangle(this._getCanvasById(args.id).getProject(), args)
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addCircle(this._getCanvasById(args.id).getProject(), args)
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          x1: z.number().describe('起点X'),
          y1: z.number().describe('起点Y'),
          x2: z.number().describe('终点X'),
          y2: z.number().describe('终点Y'),
          stroke: z.string().optional().describe('线条颜色'),
          strokeWidth: z.number().optional().describe('线条宽度'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addLine(this._getCanvasById(args.id).getProject(), args)
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addPolygon(this._getCanvasById(args.id).getProject(), args)
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addText(this._getCanvasById(args.id).getProject(), args)
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addArtText(this._getCanvasById(args.id).getProject(), args)
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加富文本（支持旋转和多种样式）
       */
      add_poster_rich_text: {
        description: '添加富文本，支持旋转、描边、渐变、阴影等多种样式',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          // 位置和尺寸
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('文本区域宽度（用于自动换行）'),

          // 文本内容
          text: z.string().describe('文字内容'),

          // 字体样式
          fontSize: z.number().optional().describe('字体大小，默认48'),
          fontFamily: z.string().optional().describe('字体名称'),
          fontWeight: z.union([z.string(), z.number()]).optional().describe('字重 normal/bold 或 100-900'),
          fontStyle: z.enum(['normal', 'italic', 'oblique']).optional().describe('字体风格'),
          bold: z.boolean().optional().describe('粗体'),
          italic: z.boolean().optional().describe('斜体'),

          // 文字装饰
          underline: z.boolean().optional().describe('下划线'),
          strikethrough: z.boolean().optional().describe('删除线'),

          // 颜色
          color: z.string().optional().describe('文字颜色，默认#ffffff'),
          backgroundColor: z.string().optional().describe('文字背景色'),
          gradient: z.object({
            colors: z.array(z.string()).describe('渐变颜色数组'),
            direction: z.number().optional().describe('方向角度'),
          }).optional().describe('渐变填充'),

          // 描边
          strokeColor: z.string().optional().describe('描边颜色'),
          strokeWidth: z.number().optional().describe('描边宽度'),

          // 阴影
          shadow: z.object({
            color: z.string().optional().describe('阴影颜色'),
            blur: z.number().optional().describe('模糊度'),
            offsetX: z.number().optional().describe('X偏移'),
            offsetY: z.number().optional().describe('Y偏移'),
          }).optional(),

          // 间距
          letterSpacing: z.number().optional().describe('字间距'),
          lineSpacing: z.number().optional().describe('行间距增量'),
          lineHeight: z.number().optional().describe('行高'),

          // 对齐
          align: z.enum(['left', 'center', 'right', 'justify']).optional().describe('对齐方式'),

          // 变换
          rotation: z.number().optional().describe('旋转角度（度）'),
          scale: z.union([z.number(), z.object({
            x: z.number().optional(),
            y: z.number().optional()
          })]).optional().describe('缩放'),

          // 透明度
          opacity: z.number().optional().describe('透明度 0-1，默认1'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addRichText(this._getCanvasById(args.id).getProject(), args)
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          src: z.string().describe('图片路径或URL'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('图片宽度'),
          height: z.number().optional().describe('图片高度'),
          opacity: z.number().optional().describe('透明度 0-1'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return await addImage(this._getCanvasById(args.id).getProject(), args)
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          src: z.string().describe('SVG 文件路径或 SVG 字符串'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('宽度'),
          height: z.number().optional().describe('高度'),
          opacity: z.number().optional().describe('透明度 0-1'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return addSVG(this._getCanvasById(args.id).getProject(), args)
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          filename: z.string().describe('文件名（不含扩展名）'),
          outputDir: z.string().optional().describe('输出目录'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }

            const outputDir = args.outputDir || '.'
            const filename = `${args.filename}.svg`
            await fs.promises.mkdir(outputDir, { recursive: true })
            const filepath = path.join(outputDir, filename)

            const svg = this._getCanvasById(args.id).getProject().exportSVG({
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
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }

            const svg = this._getCanvasById(args.id).getProject().exportSVG({
              asString: true,
              bounds: 'content',
            })

            const base64 = Buffer.from(svg).toString('base64')

            return {
              success: true,
              //base64,
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createCard(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createBadge(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createCTA(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createFeature(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createFeatureGrid(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createDivider(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createAvatar(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createProgress(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createRating(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createQuote(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createStatCard(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createTagCloud(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createStepper(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createTimeline(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createListItem(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('宽度'),
          notifType: z.enum(['success', 'warning', 'error', 'info']).optional().describe('类型'),
          title: z.string().optional().describe('标题'),
          message: z.string().optional().describe('消息内容'),
          showIcon: z.boolean().optional().describe('是否显示图标'),
          radius: z.number().optional().describe('圆角半径'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createNotification(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createImageFrame(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createColumns(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createGrid(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const project = this._getCanvasById(args.id).getProject()
            const result = createStar(project, this._getCanvasById(args.id).getCanvas(), args)
            // 强制将所有子元素添加到活动层
            if (result && result.elements && project) {
              // 收集所有新创建的 item
              const allItems = project.getItems({})
              const existingIds = new Set(allItems.map(i => i.id))
              
              // 从项目的所有层中获取新添加的 item
              project.layers.forEach(layer => {
                layer.children.forEach(item => {
                  if ((item.id && !existingIds.has(item.id)) || (item.parent === layer)) {
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createArrow(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
            if (result && result.elements && this._getCanvasById(args.id).getProject()) {
              const project = this._getCanvasById(args.id).getProject()
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createProgressCircle(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
            if (result && result.elements && this._getCanvasById(args.id).getProject()) {
              const project = this._getCanvasById(args.id).getProject()
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createChip(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
            if (result && result.elements && this._getCanvasById(args.id).getProject()) {
              const project = this._getCanvasById(args.id).getProject()
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          chartType: z.enum(['bar', 'pie']).optional().describe('图表类型'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createChart(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
            if (result && result.elements && this._getCanvasById(args.id).getProject()) {
              const project = this._getCanvasById(args.id).getProject()
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createWatermark(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
            if (result && result.elements && this._getCanvasById(args.id).getProject()) {
              const project = this._getCanvasById(args.id).getProject()
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            const result = createTable(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
            if (result && result.elements && this._getCanvasById(args.id).getProject()) {
              const project = this._getCanvasById(args.id).getProject()
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
       * 添加按钮
       */
      add_poster_button: {
        description: '添加按钮组件',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('宽度，默认200'),
          height: z.number().optional().describe('高度，默认60'),
          text: z.string().optional().describe('按钮文字'),
          fontSize: z.number().optional().describe('字体大小'),
          color: z.string().optional().describe('文字颜色'),
          backgroundColor: z.string().optional().describe('背景色'),
          borderColor: z.string().optional().describe('边框颜色'),
          borderWidth: z.number().optional().describe('边框宽度'),
          radius: z.number().optional().describe('圆角'),
          shadow: z.object({
            color: z.string().optional(),
            blur: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
          }).optional(),
          gradient: z.object({
            colors: z.array(z.string()).describe('渐变颜色数组'),
          }).optional(),
          opacity: z.number().optional().describe('透明度'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return await createButton(
              this._getCanvasById(args.id).getProject(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加图标
       */
      add_poster_icon: {
        description: '添加图标（emoji或图片）',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          size: z.number().optional().describe('图标大小，默认64'),
          icon: z.string().describe('图标内容（emoji或图片URL）'),
          color: z.string().optional().describe('颜色'),
          backgroundColor: z.string().optional().describe('背景色'),
          borderColor: z.string().optional().describe('边框颜色'),
          borderWidth: z.number().optional().describe('边框宽度'),
          radius: z.number().optional().describe('圆角'),
          shadow: z.object({
            color: z.string().optional(),
            blur: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
          }).optional(),
          opacity: z.number().optional().describe('透明度'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return await createIcon(
              this._getCanvasById(args.id).getProject(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加二维码
       */
      add_poster_qrcode: {
        description: '添加二维码',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          size: z.number().optional().describe('二维码大小，默认200'),
          content: z.string().describe('二维码内容'),
          color: z.string().optional().describe('前景色'),
          backgroundColor: z.string().optional().describe('背景色'),
          logo: z.string().optional().describe('中间logo图片路径'),
          logoSize: z.number().optional().describe('logo大小'),
          opacity: z.number().optional().describe('透明度'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return await createQRCode(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加装饰边框
       */
      add_poster_frame: {
        description: '添加装饰边框',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('宽度'),
          height: z.number().describe('高度'),
          style: z.enum(['simple', 'double', 'dashed', 'dotted', 'corner', 'vintage', 'modern', 'floral']).optional().describe('边框样式'),
          color: z.string().optional().describe('边框颜色'),
          borderWidth: z.number().optional().describe('边框宽度'),
          radius: z.number().optional().describe('圆角'),
          padding: z.number().optional().describe('内边距'),
          opacity: z.number().optional().describe('透明度'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return await createFrame(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加对话气泡
       */
      add_poster_bubble: {
        description: '添加对话气泡',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('宽度，默认300'),
          height: z.number().optional().describe('高度，默认100'),
          text: z.string().describe('气泡文字'),
          fontSize: z.number().optional().describe('字体大小'),
          color: z.string().optional().describe('文字颜色'),
          backgroundColor: z.string().optional().describe('背景色'),
          borderColor: z.string().optional().describe('边框颜色'),
          borderWidth: z.number().optional().describe('边框宽度'),
          radius: z.number().optional().describe('圆角'),
          tailDirection: z.enum(['bottom', 'top', 'left', 'right']).optional().describe('尾巴方向'),
          tailPosition: z.enum(['left', 'center', 'right']).optional().describe('尾巴位置'),
          shadow: z.object({
            color: z.string().optional(),
            blur: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
          }).optional(),
          opacity: z.number().optional().describe('透明度'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return await createBubble(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加丝带
       */
      add_poster_ribbon: {
        description: '添加丝带飘带',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('宽度，默认300'),
          text: z.string().optional().describe('丝带文字'),
          fontSize: z.number().optional().describe('字体大小'),
          color: z.string().optional().describe('文字颜色'),
          backgroundColor: z.string().optional().describe('背景色'),
          borderColor: z.string().optional().describe('边框颜色'),
          borderWidth: z.number().optional().describe('边框宽度'),
          style: z.enum(['fold', 'diagonal', 'corner']).optional().describe('丝带样式'),
          shadow: z.object({
            color: z.string().optional(),
            blur: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
          }).optional(),
          opacity: z.number().optional().describe('透明度'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return await createRibbon(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加印章
       */
      add_poster_seal: {
        description: '添加印章效果',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          size: z.number().optional().describe('印章大小，默认100'),
          text: z.string().optional().describe('印章文字'),
          fontSize: z.number().optional().describe('字体大小'),
          color: z.string().optional().describe('印章颜色'),
          style: z.enum(['circle', 'square', 'star', 'hexagon']).optional().describe('印章形状'),
          borderWidth: z.number().optional().describe('边框宽度'),
          opacity: z.number().optional().describe('透明度'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return await createSeal(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加高亮文字
       */
      add_poster_highlight_text: {
        description: '添加高亮文字（荧光笔效果）',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          text: z.string().describe('文字内容'),
          fontSize: z.number().optional().describe('字体大小'),
          color: z.string().optional().describe('文字颜色'),
          highlightColor: z.string().optional().describe('高亮颜色'),
          highlightStyle: z.enum(['marker', 'underline', 'background', 'stroke', 'neon']).optional().describe('高亮样式'),
          strokeWidth: z.number().optional().describe('描边宽度'),
          shadow: z.object({
            color: z.string().optional(),
            blur: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
          }).optional(),
          opacity: z.number().optional().describe('透明度'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return await createHighlightText(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      /**
       * 添加条形码
       */
      add_poster_barcode: {
        description: '添加条形码',
        inputSchema: z.object({
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().optional().describe('宽度，默认300'),
          height: z.number().optional().describe('高度，默认100'),
          content: z.string().describe('条形码内容'),
          color: z.string().optional().describe('条形码颜色'),
          showText: z.boolean().optional().describe('是否显示文字'),
          textColor: z.string().optional().describe('文字颜色'),
          fontSize: z.number().optional().describe('字体大小'),
          opacity: z.number().optional().describe('透明度'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return await createBarcode(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args
            )
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          components: z.array(z.object({
            type: z.enum([
              'background', 'rectangle', 'circle', 'line', 'polygon',
              'text', 'artText', 'richText', 'image', 'svg', 'imageFrame',
              'columns', 'grid', 'star', 'arrow', 'progressCircle', 'chip', 'chart', 'watermark', 'table',
              'card', 'badge', 'cta', 'feature', 'featureGrid', 'divider',
              'avatar', 'progress', 'rating', 'quote', 'statCard',
              'tagCloud', 'stepper', 'timeline', 'listItem', 'notification',
              'button', 'icon', 'frame', 'bubble', 'ribbon', 'seal', 'highlightText',
            ]).describe('组件类型'),
          })).describe('组件配置数组'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }
            return createFromConfig(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
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
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }

            // 应用模板
            applyTemplate(
              this._getCanvasById(args.id).getProject(),
              this._getCanvasById(args.id).getCanvas(),
              args.template,
              args
            )

            // 导出
            const format = 'png'
            const outputDir = args.outputDir || '.'
            const filename = `${args.output}.${format}`
            await fs.promises.mkdir(outputDir, { recursive: true })
            const filepath = path.join(outputDir, filename)
            const buffer = this._getCanvasById(args.id).toBuffer(format)
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
          id: z.string().describe('画布ID，不填则使用当前活跃画布'),
          filename: z.string().describe('文件名（不含扩展名）'),
          format: z.enum(['png', 'jpg']).optional().describe('格式，默认png'),
          quality: z.number().optional().describe('JPEG质量'),
          outputDir: z.string().optional().describe('输出目录'),
        }),
        execute: async (args) => {
          try {
            if (!this._getCanvasById(args.id).isCreated()) {
              return { success: false, error: 'No canvas created' }
            }

            const format = args.format || 'png'
            const outputDir = args.outputDir || '.'
            const filename = `${args.filename}.${format}`
            await fs.promises.mkdir(outputDir, { recursive: true })
            const filepath = path.join(outputDir, filename)
            const buffer = this._getCanvasById(args.id).toBuffer(format, args.quality)
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
    //   export_poster_base64: {
    //     description: '导出画布为 Base64 编码',
    //     inputSchema: z.object({
    //       id: z.string().describe('画布ID，不填则使用当前活跃画布'),
    //       format: z.enum(['png', 'jpg']).optional().describe('格式'),
    //       quality: z.number().optional().describe('JPEG质量'),
    //     }),
    //     execute: async (args) => {
    //       try {
    //         if (!this._getCanvasById(args.id).isCreated()) {
    //           return { success: false, error: 'No canvas created' }
    //         }

    //         const format = args.format || 'png'
    //         const base64 = this._getCanvasById(args.id).toBase64(format, args.quality)
    //         const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'

    //         return {
    //           success: true,
    //           base64,
    //           format,
    //           mimeType,
    //         }
    //       } catch (err) {
    //         return { success: false, error: err.message }
    //       }
    //     },
    //   },
    // }

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


    reload(framework) {
      console.log('[poster] Reloading poster plugin')
      this._framework = framework
    }

    uninstall(framework) {
      // 重置并清理所有画布
      for (const [id, canvas] of this._canvasPool) {
        canvas.reset()
      }
      this._canvasPool.clear()
      this._layoutPool.clear()
      this._framework = null
      console.log('[poster] Poster plugin uninstalled')
    }
  }
}
