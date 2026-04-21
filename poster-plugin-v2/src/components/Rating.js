/**
 * 星级评分组件
 */
const { Component } = require('../core/Component')

class Rating extends Component {
  constructor(config = {}) {
    super({
      ...config,
      type: 'rating',
    })

    this.value = config.value || 4
    this.max = config.max || 5
    this.size = config.size || 24
    this.filledColor = config.filledColor || '#fbbf24'
    this.emptyColor = config.emptyColor || '#e5e7eb'
    this.gap = config.gap || 4
  }

  initialize(paper) {
    this._stars = []
  }

  render(paper, context = {}) {
    if (!this.visible) return

    const absX = this._resolvePercent(this.x, context.width)
    const absY = this._resolvePercent(this.y, context.height)

    // 清理旧星星
    for (const star of this._stars) {
      if (star._paperItem) {
        star._paperItem.remove()
      }
    }
    this._stars = []

    for (let i = 0; i < this.max; i++) {
      const starX = absX + i * (this.size + this.gap)
      const filled = i < Math.floor(this.value)
      const partial = !filled && i < this.value

      // 创建星星路径
      const star = this._createStar(paper, starX, absY, this.size, filled, partial)
      this._stars.push(star)
    }
  }

  _createStar(paper, x, y, size, filled, partial) {
    const outerRadius = size / 2
    const innerRadius = size / 4
    const points = 5

    const path = new paper.Path()
    const angleStep = Math.PI / points

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = i * angleStep - Math.PI / 2
      const px = x + size / 2 + radius * Math.cos(angle)
      const py = y + size / 2 + radius * Math.sin(angle)

      if (i === 0) {
        path.moveTo(px, py)
      } else {
        path.lineTo(px, py)
      }
    }
    path.closePath()

    path.fillColor = new paper.Color(partial ? this.filledColor : (filled ? this.filledColor : this.emptyColor))
    path.opacity = partial ? this.value - Math.floor(this.value) : 1

    return { _paperItem: path }
  }

  destroy() {
    for (const star of this._stars) {
      if (star._paperItem) {
        star._paperItem.remove()
      }
    }
    this._stars = []
    super.destroy()
  }
}

module.exports = { Rating }