/**
 * 时间线组件
 */
const { Component } = require('../core/Component')
const { CircleElement } = require('../elements/CircleElement')
const { TextElement } = require('../elements/TextElement')

class Timeline extends Component {
  constructor(config = {}) {
    super({
      ...config,
      type: 'timeline',
    })

    this.width = config.width || 500
    this.items = config.items || []
    this.lineColor = config.lineColor || '#e2e8f0'
    this.dotColor = config.dotColor || '#6366f1'
    this.activeColor = config.activeColor || '#22c55e'
    this.dotSize = config.dotSize || 16
    this.gap = config.gap || 60
    this.fontFamily = config.fontFamily
  }

  initialize(paper) {
    this._paper = paper
    this._dotElements = []
    this._dateElements = []
    this._titleElements = []
    this._descElements = []
  }

  render(paper, context = {}) {
    if (!this.visible) return

    const absX = this._resolvePercent(this.x, context.width)
    const absY = this._resolvePercent(this.y, context.height)

    // 清理旧元素
    this._cleanup()

    if (!this.items || this.items.length === 0) return

    const centerX = absX + 80
    const contentX = absX + 120

    // 主线
    if (this.items.length > 1) {
      this._lineItem = new paper.Path.Line({
        from: [centerX, absY + this.dotSize / 2],
        to: [centerX, absY + (this.items.length - 1) * this.gap + this.dotSize / 2],
        strokeColor: new paper.Color(this.lineColor),
        strokeWidth: 2,
      })
    }

    // 绘制每个项目
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]
      if (!item) continue

      const itemY = absY + i * this.gap
      const isActive = item.active !== false

      // 圆点
      const dot = new CircleElement({
        x: centerX,
        y: itemY + this.dotSize / 2,
        radius: this.dotSize / 2,
        fillColor: isActive ? this.dotColor : this.lineColor,
        opacity: this.opacity,
      })
      dot.initialize(paper)
      dot.render(paper, context)
      this._dotElements.push(dot)

      // 日期
      if (item.date) {
        const dateEl = new TextElement({
          x: absX + 10,
          y: itemY + this.dotSize / 2 + 5,
          text: item.date,
          fontSize: 12,
          fontFamily: this.fontFamily,
          color: '#94a3b8',
          textAlign: 'left',
          opacity: this.opacity,
        })
        dateEl.initialize(paper)
        dateEl.render(paper, context)
        this._dateElements.push(dateEl)
      }

      // 标题
      const titleEl = new TextElement({
        x: contentX,
        y: itemY + this.dotSize / 2 + 5,
        text: item.title || `Event ${i + 1}`,
        fontSize: 16,
        fontFamily: this.fontFamily,
        color: isActive ? '#1e293b' : '#94a3b8',
        textAlign: 'left',
        opacity: this.opacity,
      })
      titleEl.initialize(paper)
      titleEl.render(paper, context)
      this._titleElements.push(titleEl)

      // 描述
      if (item.description) {
        const descEl = new TextElement({
          x: contentX,
          y: itemY + this.dotSize / 2 + 28,
          text: item.description,
          fontSize: 13,
          fontFamily: this.fontFamily,
          color: '#64748b',
          textAlign: 'left',
          opacity: this.opacity,
        })
        descEl.initialize(paper)
        descEl.render(paper, context)
        this._descElements.push(descEl)
      }
    }
  }

  _cleanup() {
    if (this._lineItem) {
      this._lineItem.remove()
      this._lineItem = null
    }
    for (const el of this._dotElements) {
      if (el) el.destroy()
    }
    for (const el of this._dateElements) {
      if (el) el.destroy()
    }
    for (const el of this._titleElements) {
      if (el) el.destroy()
    }
    for (const el of this._descElements) {
      if (el) el.destroy()
    }
    this._dotElements = []
    this._dateElements = []
    this._titleElements = []
    this._descElements = []
  }

  destroy() {
    this._cleanup()
    super.destroy()
  }
}

module.exports = { Timeline }