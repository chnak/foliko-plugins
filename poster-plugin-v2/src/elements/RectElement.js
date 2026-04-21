/**
 * 矩形元素
 */
const { BaseElement } = require('../core/BaseElement')

class RectElement extends BaseElement {
  constructor(config = {}) {
    super({ ...config, type: 'rect' })

    this.width = config.width || 200
    this.height = config.height || 100

    // 样式
    this.fillColor = config.fillColor || config.bgcolor || null
    this.strokeColor = config.strokeColor || config.borderColor || null
    this.strokeWidth = config.strokeWidth || config.borderWidth || 0
    this.borderRadius = config.borderRadius || config.radius || 0
  }

  _createPaperItem(paper) {
    const rect = new paper.Path.Rectangle({
      point: [0, 0],
      size: [this.width, this.height],
      radius: this.borderRadius
    })

    if (this.fillColor) {
      rect.fillColor = this.fillColor
    }
    if (this.strokeColor) {
      rect.strokeColor = this.strokeColor
      rect.strokeWidth = this.strokeWidth
    }

    return rect
  }

  render(paper, context = {}) {
    if (!this.visible) return
    if (!this._initialized) this.initialize(paper)
    if (!this._paperItem) return

    // 解析位置
    const x = this._resolvePercent(this.x, context.width)
    const y = this._resolvePercent(this.y, context.height)

    // 解析尺寸
    const width = this._resolvePercent(this.width, context.width)
    const height = this._resolvePercent(this.height, context.height)

    // 更新尺寸
    this._paperItem.bounds.width = width
    this._paperItem.bounds.height = height

    // 设置位置（矩形中心点）
    this._paperItem.position = new paper.Point(x, y)

    // 应用样式
    this._paperItem.opacity = this.opacity
    this._paperItem.rotation = this.rotation
    this._paperItem.visible = this.visible
  }

  _resolvePercent(value, reference) {
    if (typeof value === 'string' && value.endsWith('%')) {
      return (parseFloat(value) / 100) * reference
    }
    return value
  }
}

module.exports = { RectElement }
