/**
 * 分隔线组件
 */
const { Component } = require('../core/Component')

class Divider extends Component {
  constructor(config = {}) {
    super({
      ...config,
      type: 'divider',
      width: config.width || 300,
      height: config.thickness || 1,
    })

    this.color = config.color || '#00d9ff'
    this.thickness = config.thickness || 1
    this.style = config.style || 'solid'
    this.align = config.align || 'center'
  }

  initialize(paper) {
    // 分隔线不需要额外初始化
  }

  render(paper, context = {}) {
    if (!this.visible) return

    const absX = this._resolvePercent(this.x, context.width)
    const absY = this._resolvePercent(this.y, context.height)

    let startX = absX
    if (this.align === 'center') {
      startX = absX - this.width / 2
    } else if (this.align === 'right') {
      startX = absX - this.width
    }

    if (this._paperItem) {
      this._paperItem.remove()
    }

    this._paperItem = new paper.Path.Line({
      from: [startX, absY],
      to: [startX + this.width, absY],
      strokeColor: new paper.Color(this.color),
      strokeWidth: this.thickness,
    })

    if (this.style === 'dashed') {
      this._paperItem.dashArray = [10, 5]
    }
  }

  destroy() {
    if (this._paperItem) {
      this._paperItem.remove()
      this._paperItem = null
    }
    super.destroy()
  }
}

module.exports = { Divider }