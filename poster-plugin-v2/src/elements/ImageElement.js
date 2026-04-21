/**
 * 图片元素
 */
const { BaseElement } = require('../core/BaseElement')

class ImageElement extends BaseElement {
  constructor(config = {}) {
    super({ ...config, type: 'image' })

    this.src = config.src || ''
    this.width = config.width || 200
    this.height = config.height || 200
    this.fit = config.fit || 'contain' // contain, cover, fill

    this._raster = null
  }

  async initialize(paper) {
    if (this._initialized) return

    if (this.src) {
      try {
        this._raster = new paper.Raster(this.src)
        await new Promise((resolve, reject) => {
          this._raster.onLoad = resolve
          this._raster.onError = reject
        })
      } catch (err) {
        console.warn(`[ImageElement] 加载图片失败: ${this.src}`, err)
      }
    }

    this._initialized = true
  }

  _createPaperItem(paper) {
    // 创建一个占位符
    const rect = new paper.Path.Rectangle({
      point: [0, 0],
      size: [this.width, this.height],
      fillColor: '#cccccc'
    })
    return rect
  }

  render(paper, context = {}) {
    if (!this.visible) return

    // 处理百分比位置
    const x = this._resolvePercent(this.x, context.width)
    const y = this._resolvePercent(this.y, context.height)

    // 处理百分比尺寸
    const width = this._resolvePercent(
      typeof this.width === 'string' ? this.width : this.width,
      context.width
    )
    const height = this._resolvePercent(
      typeof this.height === 'string' ? this.height : this.height,
      context.height
    )

    // 如果图片已加载
    if (this._raster && this._raster.loaded) {
      // 替换旧的占位符
      if (this._paperItem && !(this._paperItem instanceof paper.Raster)) {
        this._paperItem.remove()
        this._paperItem = this._raster
      }

      // 设置尺寸
      this._raster.bounds.width = width
      this._raster.bounds.height = height

      // 设置位置
      this._raster.position = new paper.Point(x, y)

      // 应用样式
      this._raster.opacity = this.opacity
      this._raster.rotation = this.rotation
      this._raster.visible = this.visible
    } else if (this._paperItem) {
      // 更新占位符
      this._paperItem.bounds.width = width
      this._paperItem.bounds.height = height
      this._paperItem.position = new paper.Point(x, y)
      this._paperItem.opacity = this.opacity
      this._paperItem.rotation = this.rotation
      this._paperItem.visible = this.visible
    }
  }

  _resolvePercent(value, reference) {
    if (typeof value === 'string' && value.endsWith('%')) {
      return (parseFloat(value) / 100) * reference
    }
    return value
  }

  destroy() {
    if (this._raster) {
      this._raster.remove()
      this._raster = null
    }
    super.destroy()
  }
}

module.exports = { ImageElement }
