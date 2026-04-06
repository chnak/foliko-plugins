/**
 * 画布管理模块
 */

const paper = require('paper')
const PRESETS = require('./presets')

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
  create({ preset, width, height, background }) {
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

    this._canvas = paper.createCanvas(w, h)
    this._project = new paper.Project(this._canvas)
    // 确保活动层存在
    if (!paper.project || !paper.project.activeLayer) {
      paper.setup(this._canvas)
    }
    this._paper = paper
    this._width = w
    this._height = h

    // 添加背景
    if (background) {
      const bg = new paper.Path.Rectangle({
        point: [0, 0],
        size: [w, h],
        fillColor: background,
      })
      bg.sendToBack()
    }

    return {
      width: w,
      height: h,
      preset: preset || 'custom',
      background: background || null,
    }
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

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
    return this._canvas.toBuffer(mimeType, quality)
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

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
    return this._canvas.toDataURL(mimeType, quality)
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
    this._canvas = null
    this._project = null
    this._paper = null
    this._width = 0
    this._height = 0
  }
}

module.exports = CanvasManager
