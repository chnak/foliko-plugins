/**
 * 星形组件
 * 支持多角星形
 */
const { Component } = require('../core/Component')

class Star extends Component {
  constructor(config = {}) {
    super({
      ...config,
      type: 'star',
    })

    this.points = config.points || 5
    this.outerRadius = config.outerRadius || 50
    this.innerRadius = config.innerRadius || config.outerRadius * 0.4 || 20
    this.fillColor = config.fillColor || '#fbbf24'
    this.strokeColor = config.strokeColor
    this.strokeWidth = config.strokeWidth || 1
    this.rotation = config.rotation || 0
  }

  initialize(paper) {
    // 不需要初始化子元素
  }

  render(paper, context = {}) {
    if (!this.visible) return

    const absX = this._resolvePercent(this.x, context.width)
    const absY = this._resolvePercent(this.y, context.height)

    if (this._paperItem) {
      this._paperItem.remove()
    }

    // 创建星形路径
    const path = new paper.Path()
    const angleStep = Math.PI / this.points

    for (let i = 0; i < this.points * 2; i++) {
      const radius = i % 2 === 0 ? this.outerRadius : this.innerRadius
      const angle = i * angleStep - Math.PI / 2 + (this.rotation * Math.PI / 180)
      const px = absX + radius * Math.cos(angle)
      const py = absY + radius * Math.sin(angle)

      if (i === 0) {
        path.moveTo(px, py)
      } else {
        path.lineTo(px, py)
      }
    }
    path.closePath()

    if (this.fillColor) {
      path.fillColor = new paper.Color(this.fillColor)
    }
    if (this.strokeColor) {
      path.strokeColor = new paper.Color(this.strokeColor)
      path.strokeWidth = this.strokeWidth
    }
    path.opacity = this.opacity

    this._paperItem = path
  }

  destroy() {
    if (this._paperItem) {
      this._paperItem.remove()
      this._paperItem = null
    }
    super.destroy()
  }
}

module.exports = { Star }