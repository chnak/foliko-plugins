/**
 * 海报制作插件
 * 基于 Paper.js 实现，支持创建海报、卡片、宣传图等
 */

const { z } = require('zod')
const path = require('path')
const fs = require('fs')

// 直接导入 paper 和 canvas
const paper = require('paper')
const { createCanvas, registerFont: registerFontFn } = require('canvas')

// 已注册的字体
const registeredFonts = new Map()

// 注册字体函数
function registerFontFile(fontPath, fontFamily, options = {}) {
  if (registeredFonts.has(fontFamily)) {
    return true
  }

  try {
    if (!fs.existsSync(fontPath)) {
      return false
    }

    registerFontFn(fontPath, {
      family: fontFamily,
      weight: options.weight || 'normal',
      style: options.style || 'normal',
    })

    registeredFonts.set(fontFamily, {
      path: fontPath,
      ...options,
    })

    return true
  } catch (e) {
    console.log(`[poster] 注册字体失败: ${fontFamily}`, e.message)
    return false
  }
}

// 系统字体路径
const systemFonts = [
  { path: 'C:\\Windows\\Fonts\\msyh.ttc', family: 'Microsoft YaHei' },
  { path: 'C:\\Windows\\Fonts\\msyhbd.ttc', family: 'Microsoft YaHei Bold', weight: 'bold' },
  { path: 'C:\\Windows\\Fonts\\simhei.ttf', family: 'SimHei' },
  { path: 'C:\\Windows\\Fonts\\simsun.ttc', family: 'SimSun' },
  { path: 'C:\\Windows\\Fonts\\Arial.ttf', family: 'Arial' },
  { path: 'C:\\Windows\\Fonts\\Times New Roman.ttf', family: 'Times New Roman' },
]

// 默认字体
let defaultFontFamily = 'Arial'

// 尝试注册系统字体
for (const font of systemFonts) {
  if (registerFontFile(font.path, font.family, { weight: font.weight })) {
    defaultFontFamily = font.family
    console.log(`[poster] 已注册系统字体: ${font.family}`)
    break
  }
}

// 如果没有找到系统字体，使用 canvas 内置字体
if (defaultFontFamily === 'Arial') {
  try {
    defaultFontFamily = 'sans-serif'
    registeredFonts.set('sans-serif', { path: null })
    console.log('[poster] 使用默认字体: sans-serif')
  } catch (e) {
    defaultFontFamily = 'Arial'
  }
}

// 预设尺寸
const PRESETS = {
  poster_a4: { width: 2480, height: 3508, name: 'A4海报 (300dpi)' },
  poster_square: { width: 2000, height: 2000, name: '方形海报' },
  poster_16_9: { width: 1920, height: 1080, name: '16:9海报' },
  banner_1920x500: { width: 1920, height: 500, name: '网站Banner' },
  banner_1200x400: { width: 1200, height: 400, name: '电商Banner' },
  banner_750x300: { width: 750, height: 300, name: '移动端Banner' },
  banner_468x60: { width: 468, height: 60, name: '小横幅' },
  social_instagram: { width: 1080, height: 1080, name: 'Instagram正方形' },
  social_story: { width: 1080, height: 1920, name: 'Instagram Story' },
  social_facebook: { width: 1200, height: 630, name: 'Facebook封面' },
  social_twitter: { width: 1600, height: 900, name: 'Twitter封面' },
  promo_900x500: { width: 900, height: 500, name: '宣传图' },
  promo_500x500: { width: 500, height: 500, name: '正方宣传图' },
}

module.exports = function (Plugin) {
  return class PosterPlugin extends Plugin {
    constructor(config = {}) {
      super()
      this.name = 'poster'
      this.version = '1.0.0'
      this.description = '海报制作插件 - 支持创建海报、卡片、宣传图、Banner等'
      this.priority = 15

      this._framework = null
      this._canvas = null
      this._paper = null
      this._project = null
      this._initialized = false
    }

    /**
     * 验证字体是否可用
     */
    _validateFont(fontFamily) {
      if (!fontFamily) return defaultFontFamily
      if (registeredFonts.has(fontFamily)) return fontFamily

      const lower = fontFamily.toLowerCase()
      for (const [name] of registeredFonts) {
        if (name.toLowerCase() === lower) return name
      }

      console.log(`[poster] 字体 "${fontFamily}" 未找到，使用默认字体: ${defaultFontFamily}`)
      return defaultFontFamily
    }

    async install(framework) {
      this._framework = framework
      console.log('[poster] Paper.js ready')
      this._initialized = true
      return this
    }

    start(framework) {
      console.log('[poster] Poster plugin started')
    }

    tools = {
      // 列出预设尺寸
      list_poster_presets: {
        description: '列出所有可用的海报/Banner预设尺寸',
        inputSchema: z.object({}),
        execute: async () => {
          return {
            success: true,
            presets: Object.entries(PRESETS).map(([key, value]) => ({
              key,
              ...value,
            })),
          }
        },
      },

      // 创建画布
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
            let width, height

            if (args.preset) {
              const preset = PRESETS[args.preset]
              if (!preset) {
                return { success: false, error: `Unknown preset: ${args.preset}` }
              }
              width = preset.width
              height = preset.height
            } else if (args.width && args.height) {
              width = args.width
              height = args.height
            } else {
              return { success: false, error: 'Must provide preset or width/height' }
            }

            this._canvas = paper.createCanvas(width, height)
            this._project = new paper.Project(this._canvas)
            this._paper = paper

            if (args.background) {
              const bg = new paper.Path.Rectangle({
                point: [0, 0],
                size: [width, height],
                fillColor: args.background,
              })
              bg.sendToBack()
            }

            return {
              success: true,
              width,
              height,
              preset: args.preset || 'custom',
              background: args.background || null,
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // 添加背景
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
            if (!this._canvas) {
              return { success: false, error: 'No canvas created' }
            }

            if (args.gradient) {
              const { type, colors, direction } = args.gradient
              const paperColors = colors.map(c => new paper.Color(c))

              if (type === 'linear') {
                const angle = (direction || 45) * Math.PI / 180
                const diagonal = Math.sqrt(this._canvas.width ** 2 + this._canvas.height ** 2)
                const start = new paper.Point(
                  this._canvas.width / 2 - Math.cos(angle) * diagonal / 2,
                  this._canvas.height / 2 - Math.sin(angle) * diagonal / 2
                )
                const stop = new paper.Point(
                  this._canvas.width / 2 + Math.cos(angle) * diagonal / 2,
                  this._canvas.height / 2 + Math.sin(angle) * diagonal / 2
                )
                this._project.activeLayer.fillColor = new paper.Color({
                  gradient: { stops: paperColors },
                  origin: start,
                  destination: stop,
                })
              } else {
                const center = new paper.Point(this._canvas.width / 2, this._canvas.height / 2)
                const radius = Math.max(this._canvas.width, this._canvas.height) / 2
                this._project.activeLayer.fillColor = new paper.Color({
                  gradient: { stops: paperColors },
                  origin: center,
                  destination: center.add(new paper.Point(radius, 0)),
                })
              }
            } else if (args.color) {
              this._project.activeLayer.fillColor = new paper.Color(args.color)
            } else {
              return { success: false, error: 'Must provide color or gradient' }
            }

            return { success: true, message: 'Background added' }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // 添加矩形
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
            if (!this._canvas) {
              return { success: false, error: 'No canvas created' }
            }

            const rect = new paper.Path.Rectangle({
              point: [args.x, args.y],
              size: [args.width, args.height],
              radius: args.radius || 0,
            })

            if (args.fill) rect.fillColor = new paper.Color(args.fill)
            if (args.stroke) {
              rect.strokeColor = new paper.Color(args.stroke)
              rect.strokeWidth = args.strokeWidth || 1
            }
            if (args.opacity !== undefined) rect.opacity = args.opacity

            return { success: true, id: rect.id }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // 添加圆形
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
            if (!this._canvas) {
              return { success: false, error: 'No canvas created' }
            }

            const circle = new paper.Path.Ellipse({
              center: [args.cx, args.cy],
              radius: [args.rx, args.ry || args.rx],
            })

            if (args.fill) circle.fillColor = new paper.Color(args.fill)
            if (args.stroke) {
              circle.strokeColor = new paper.Color(args.stroke)
              circle.strokeWidth = args.strokeWidth || 1
            }
            if (args.opacity !== undefined) circle.opacity = args.opacity

            return { success: true, id: circle.id }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // 添加文字
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
            if (!this._canvas) {
              return { success: false, error: 'No canvas created' }
            }

            const text = new paper.PointText({
              point: [args.x, args.y],
              content: args.text,
              fontSize: args.fontSize || 48,
              fontFamily: this._validateFont(args.fontFamily),
              fillColor: new paper.Color(args.color || '#ffffff'),
              justification: args.align || 'left',
            })

            if (args.shadow) {
              text.shadowColor = new paper.Color(args.shadow.color)
              text.shadowBlur = args.shadow.blur || 5
              text.shadowOffset = new paper.Point(args.shadow.offsetX || 2, args.shadow.offsetY || 2)
            }

            return { success: true, id: text.id }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // 添加艺术文字
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
            if (!this._canvas) {
              return { success: false, error: 'No canvas created' }
            }

            const text = new paper.PointText({
              point: [args.x, args.y],
              content: args.text,
              fontSize: args.fontSize || 120,
              fontFamily: this._validateFont(args.fontFamily),
              fillColor: args.gradient
                ? new paper.Color(args.gradient.colors[0])
                : new paper.Color('#ffffff'),
              justification: 'center',
            })

            if (args.gradient && args.gradient.colors.length > 0) {
              const colors = args.gradient.colors.map(c => new paper.Color(c))
              text.fillColor = new paper.Color({
                gradient: { stops: colors },
                origin: text.bounds.topLeft,
                destination: text.bounds.topRight,
              })
            }

            if (args.strokeColor) {
              text.strokeColor = new paper.Color(args.strokeColor)
              text.strokeWidth = args.strokeWidth || 2
            }

            if (args.shadow) {
              text.shadowColor = new paper.Color(args.shadow.color)
              text.shadowBlur = args.shadow.blur || 10
              text.shadowOffset = new paper.Point(args.shadow.offsetX || 3, args.shadow.offsetY || 3)
            }

            return { success: true, id: text.id }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // 添加线条
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
            if (!this._canvas) {
              return { success: false, error: 'No canvas created' }
            }

            const line = new paper.Path.Line({
              from: [args.x1, args.y1],
              to: [args.x2, args.y2],
              strokeColor: new paper.Color(args.stroke || '#ffffff'),
              strokeWidth: args.strokeWidth || 2,
            })

            return { success: true, id: line.id }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // 添加多边形
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
            if (!this._canvas) {
              return { success: false, error: 'No canvas created' }
            }

            const polygon = new paper.Path.RegularPolygon({
              center: [args.cx, args.cy],
              radius: args.radius,
              sides: args.sides,
            })

            if (args.fill) polygon.fillColor = new paper.Color(args.fill)
            if (args.stroke) {
              polygon.strokeColor = new paper.Color(args.stroke)
              polygon.strokeWidth = args.strokeWidth || 1
            }
            if (args.opacity !== undefined) polygon.opacity = args.opacity

            return { success: true, id: polygon.id }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // 添加图片
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
            if (!this._canvas) {
              return { success: false, error: 'No canvas created' }
            }

            const raster = new paper.Raster(args.src)
            raster.position = new paper.Point(args.x, args.y)

            if (args.width && args.height) {
              raster.bounds.width = args.width
              raster.bounds.height = args.height
            }

            if (args.opacity !== undefined) raster.opacity = args.opacity

            return { success: true, id: raster.id, width: raster.bounds.width, height: raster.bounds.height }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // 获取画布信息
      get_poster_canvas_info: {
        description: '获取当前画布信息',
        inputSchema: z.object({}),
        execute: async () => {
          if (!this._canvas) {
            return { success: false, error: 'No canvas created' }
          }

          return {
            success: true,
            width: this._canvas.width,
            height: this._canvas.height,
            elementCount: this._project ? this._project.activeLayer.children.length : 0,
          }
        },
      },

      // 清除画布
      clear_poster_canvas: {
        description: '清除画布上的所有元素',
        inputSchema: z.object({}),
        execute: async () => {
          if (!this._canvas) {
            return { success: false, error: 'No canvas created' }
          }

          this._project.activeLayer.removeChildren()
          return { success: true, message: 'Canvas cleared' }
        },
      },

      // 导出为文件
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
            if (!this._canvas) {
              return { success: false, error: 'No canvas created' }
            }

            const format = args.format || 'png'
            const outputDir = args.outputDir || '.'
            const filename = `${args.filename}.${format}`

            await fs.promises.mkdir(outputDir, { recursive: true })
            const filepath = path.join(outputDir, filename)

            this._project.view.update()
            this._project.view.draw()

            const buffer = this._canvas.toBuffer(`image/${format}`)
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

      // 导出为 Base64
      export_poster_base64: {
        description: '导出画布为 Base64 编码',
        inputSchema: z.object({
          format: z.enum(['png', 'jpg']).optional().describe('格式'),
          quality: z.number().optional().describe('JPEG质量'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvas) {
              return { success: false, error: 'No canvas created' }
            }

            const format = args.format || 'png'

            this._project.view.update()
            this._project.view.draw()

            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
            const dataUrl = this._canvas.toDataURL(mimeType, args.quality)

            return {
              success: true,
              base64: dataUrl,
              format,
              mimeType,
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },

      // 一键生成海报
      generate_poster: {
        description: '使用预设模板一键生成海报',
        inputSchema: z.object({
          template: z.enum(['modern', 'business', 'social', 'simple']).describe('模板类型'),
          title: z.string().describe('主标题'),
          subtitle: z.string().optional().describe('副标题'),
          background: z.string().optional().describe('背景色'),
          accentColor: z.string().optional().describe('强调色'),
          output: z.string().describe('输出文件名'),
          outputDir: z.string().optional().describe('输出目录'),
        }),
        execute: async (args) => {
          try {
            if (!this._canvas) {
              return { success: false, error: 'No canvas created' }
            }

            const bg = args.background || '#1a1a2e'
            const accent = args.accentColor || '#e94560'
            const cx = this._canvas.width / 2
            const cy = this._canvas.height / 2

            this._project.activeLayer.fillColor = new paper.Color(bg)

            switch (args.template) {
              case 'modern': {
                const circle1 = new paper.Path.Circle({
                  center: [this._canvas.width * 0.8, this._canvas.height * 0.2],
                  radius: 200,
                })
                circle1.fillColor = new paper.Color(accent)
                circle1.opacity = 0.3

                const circle2 = new paper.Path.Circle({
                  center: [this._canvas.width * 0.1, this._canvas.height * 0.8],
                  radius: 150,
                })
                circle2.fillColor = new paper.Color(accent)
                circle2.opacity = 0.2

                const title1 = new paper.PointText({
                  point: [cx, cy - 50],
                  content: args.title,
                  fontSize: 120,
                  fontFamily: defaultFontFamily,
                  fillColor: new paper.Color('#ffffff'),
                  justification: 'center',
                })

                if (args.subtitle) {
                  new paper.PointText({
                    point: [cx, cy + 50],
                    content: args.subtitle,
                    fontSize: 48,
                    fontFamily: defaultFontFamily,
                    fillColor: new paper.Color('#cccccc'),
                    justification: 'center',
                  })
                }
                break
              }

              case 'business': {
                new paper.Path.Line({
                  from: [100, 200],
                  to: [this._canvas.width - 100, 200],
                  strokeColor: new paper.Color(accent),
                  strokeWidth: 4,
                })

                const title2 = new paper.PointText({
                  point: [cx, cy],
                  content: args.title,
                  fontSize: 100,
                  fontFamily: defaultFontFamily,
                  fillColor: new paper.Color('#ffffff'),
                  justification: 'center',
                })

                if (args.subtitle) {
                  new paper.PointText({
                    point: [cx, cy + 80],
                    content: args.subtitle,
                    fontSize: 40,
                    fontFamily: defaultFontFamily,
                    fillColor: new paper.Color('#aaaaaa'),
                    justification: 'center',
                  })
                }
                break
              }

              case 'social': {
                const frameCircle = new paper.Path.Circle({
                  center: [cx, cy - 50],
                  radius: 250,
                })
                frameCircle.strokeColor = new paper.Color(accent)
                frameCircle.strokeWidth = 8
                frameCircle.fillColor = null

                new paper.PointText({
                  point: [cx, cy - 30],
                  content: args.title,
                  fontSize: 72,
                  fontFamily: defaultFontFamily,
                  fillColor: new paper.Color('#ffffff'),
                  justification: 'center',
                })

                if (args.subtitle) {
                  new paper.PointText({
                    point: [cx, cy + 40],
                    content: args.subtitle,
                    fontSize: 36,
                    fontFamily: defaultFontFamily,
                    fillColor: new paper.Color('#dddddd'),
                    justification: 'center',
                  })
                }
                break
              }

              case 'simple':
              default: {
                new paper.PointText({
                  point: [cx, cy - 20],
                  content: args.title,
                  fontSize: 100,
                  fontFamily: defaultFontFamily,
                  fillColor: new paper.Color('#ffffff'),
                  justification: 'center',
                })

                if (args.subtitle) {
                  new paper.PointText({
                    point: [cx, cy + 60],
                    content: args.subtitle,
                    fontSize: 36,
                    fontFamily: defaultFontFamily,
                    fillColor: new paper.Color('#888888'),
                    justification: 'center',
                  })
                }
                break
              }
            }

            this._project.view.update()
            this._project.view.draw()

            const format = 'png'
            const outputDir = args.outputDir || '.'
            const filename = `${args.output}.${format}`
            await fs.promises.mkdir(outputDir, { recursive: true })
            const filepath = path.join(outputDir, filename)
            const buffer = this._canvas.toBuffer('image/png')
            await fs.promises.writeFile(filepath, buffer)

            return {
              success: true,
              filepath,
              template: args.template,
              message: `Poster generated: ${filepath}`,
            }
          } catch (err) {
            return { success: false, error: err.message }
          }
        },
      },
    }

    reload(framework) {
      console.log('[poster] Reloading poster plugin')
      this._framework = framework
    }

    uninstall(framework) {
      if (this._project) {
        this._project.clear()
        this._project = null
      }
      this._canvas = null
      this._framework = null
      console.log('[poster] Poster plugin uninstalled')
    }
  }
}
