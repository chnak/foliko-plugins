/**
 * 圆形元素
 */
const { BaseElement } = require('../core/BaseElement')

class CircleElement extends BaseElement {
  constructor(config = {}) {
    super({ ...config, type: 'circle' })

    this.radius = config.radius || config.r || 50

    // 样式
    this.fillColor = config.fillColor || null
    this.strokeColor = config.strokeColor || null
    this.strokeWidth = config.strokeWidth || 0
  }

  _createPaperItem(paper) {
    const circle = new paper.Path.Circle({
      center: [0, 0],
      radius: this.radius
    })

    if (this.fillColor) {
      circle.fillColor = this.fillColor
    }
    if (this.strokeColor) {
      circle.strokeColor = this.strokeColor
      circle.strokeWidth = this.strokeWidth
    }

    return circle
  }

  render(paper, context = {}) {
    if (!this.visible) return
    if (!this._initialized) this.initialize(paper)
    if (!this._paperItem) return

    // 解析半径
    const radius = this._resolvePercent(this.radius, context.width)

    // 解析位置
    const x = this._resolvePercent(this.x, context.width)
    const y = this._resolvePercent(this.y, context.height)

    // 更新尺寸
    this._paperItem.bounds.width = radius * 2
    this._paperItem.bounds.height = radius * 2

    // 设置位置
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

module.exports = { CircleElement }
