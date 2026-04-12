/**
 * 画布管理模块
 */

const paper = require('paper')
const PRESETS = require('./presets')
const fonts = require('./fonts')
const fs = require('fs')
const path = require('path')

/**
 * 画布管理器类
 */
class CanvasManager {
  constructor() {
    this._canvas = null
    this._project = null
    this._paper = null
    this._width = 0
    this._height = 0
  }

  /**
   * 创建画布
   */
  async create({ preset, width, height, background }) {
    let w, h

    if (preset) {
      const presetConfig = PRESETS[preset]
      if (!presetConfig) {
        throw new Error(`Unknown preset: ${preset}. Available: ${Object.keys(PRESETS).join(', ')}`)
      }
      w = presetConfig.width
      h = presetConfig.height
    } else if (width && height) {
      w = width
      h = height
    } else {
      throw new Error('Must provide preset or width/height')
    }

    // 使用 @napi-rs/canvas 创建画布
    const { createCanvas: createNodeCanvas } = require('canvas')
    this._canvas = createNodeCanvas(w, h)
    
    // 初始化 paper.js 项目
    this._project = new paper.Project(this._canvas)
    this._paper = paper
    this._width = w
    this._height = h

    // 初始化字体系统
    if (typeof fonts.init === 'function') {
      fonts.init()
    } else if (typeof fonts.initFonts === 'function') {
      fonts.initFonts()
    }

    // 添加背景
    if (background) {
      if (typeof background === 'string' && path.isAbsolute(background)) {
        // 背景是绝对路径图片
        await this._addBackgroundImage(background, w, h)
      } else if (typeof background === 'object' && background.image) {
        // 背景是对象形式 { image: 'path' }
        await this._addBackgroundImage(background.image, w, h)
      } else {
        // 背景是颜色
        const bg = new paper.Path.Rectangle({
          point: [0, 0],
          size: [w, h],
          fillColor: background,
        })
        bg.sendToBack()
      }
    }

    return {
      width: w,
      height: h,
      preset: preset || 'custom',
      background: background || null,
    }
  }

  /**
   * 添加背景图片
   */
  async _addBackgroundImage(imageSrc, w, h) {
    // 防止路径遍历攻击
    if (imageSrc.includes('..')) {
      throw new Error('Invalid path: directory traversal not allowed')
    }

    // 本地文件路径
    let absolutePath = imageSrc
    if (!path.isAbsolute(absolutePath)) {
      absolutePath = path.join(process.cwd(), absolutePath)
    }

    // 确保解析后的路径在允许范围内
    const resolvedPath = path.resolve(absolutePath)
    const cwd = path.resolve(process.cwd())
    if (!resolvedPath.startsWith(cwd)) {
      throw new Error('Invalid path: access outside working directory not allowed')
    }

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`背景图片文件不存在: ${absolutePath}`)
    }

    // 使用 loadImage 获取图片数据
    const { loadImage } = require('canvas')
    const imageData = await loadImage(absolutePath)

    // 创建 Paper.js Raster
    const raster = new paper.Raster(imageData)

    // 等待 raster 加载完成
    await new Promise((resolve) => {
      if (raster.loaded) {
        resolve()
      } else {
        raster.onLoad = resolve
      }
    })

    // 计算 cover 模式缩放
    const canvasRatio = w / h
    const imageRatio = raster.width / raster.height

    let scaledWidth, scaledHeight, offsetX, offsetY

    if (imageRatio > canvasRatio) {
      scaledHeight = h
      scaledWidth = raster.width * (h / raster.height)
      offsetX = (w - scaledWidth) / 2
      offsetY = 0
    } else {
      scaledWidth = w
      scaledHeight = raster.height * (w / raster.width)
      offsetX = 0
      offsetY = (h - scaledHeight) / 2
    }

    raster.bounds = new paper.Rectangle(offsetX, offsetY, scaledWidth, scaledHeight)
    raster.sendToBack()
  }

  /**
   * 获取画布
   */
  getCanvas() {
    return this._canvas
  }

  /**
   * 获取 Paper.js 项目
   */
  getProject() {
    return this._project
  }

  /**
   * 获取画布尺寸
   */
  getSize() {
    return { width: this._width, height: this._height }
  }

  /**
   * 获取中心点
   */
  getCenter() {
    return { x: this._width / 2, y: this._height / 2 }
  }

  /**
   * 清除画布
   */
  clear() {
    if (this._project) {
      this._project.activeLayer.removeChildren()
    }
  }

  /**
   * 获取元素数量
   */
  getElementCount() {
    return this._project ? this._project.activeLayer.children.length : 0
  }

  /**
   * 导出为 Buffer
   */
  toBuffer(format = 'png', quality) {
    if (!this._canvas) {
      throw new Error('No canvas created')
    }

    this._project.view.update()
    this._project.view.draw()

    // 使用 paper.js 的 exportImage 方法导出
    const image = this._project.exportImage({
      asString: false,
      format: format === 'jpg' ? 'jpeg' : 'png',
    })
    
    return image
  }

  /**
   * 导出为 Base64
   */
  toBase64(format = 'png', quality) {
    if (!this._canvas) {
      throw new Error('No canvas created')
    }

    this._project.view.update()
    this._project.view.draw()

    // 使用 paper.js 的 exportImage 方法导出为 base64
    const image = this._project.exportImage({
      asString: true,
      format: format === 'jpg' ? 'jpeg' : 'png',
    })
    
    return image
  }

  /**
   * 检查画布是否已创建
   */
  isCreated() {
    return this._canvas !== null
  }

  /**
   * 重置画布
   */
  reset() {
    // 清理 Paper.js 项目
    if (this._project) {
      this._project.clear()
    }
    this._canvas = null
    this._project = null
    this._paper = null
    this._width = 0
    this._height = 0
  }
}

module.exports = CanvasManager
