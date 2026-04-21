/**
 * 进度条组件
 */
const { Component } = require('../core/Component')
const { RectElement } = require('../elements/RectElement')
const { TextElement } = require('../elements/TextElement')

class Progress extends Component {
  constructor(config = {}) {
    super({
      ...config,
      type: 'progress',
    })

    this.width = config.width || 300
    this.height = config.height || 20
    this.value = config.value !== undefined ? config.value : 50
    this.trackColor = config.trackColor || '#e0e0e0'
    this.fillColor = config.fillColor || '#6366f1'
    this.radius = config.radius || 10
    this.showLabel = config.showLabel || false
    this.label = config.label
    this.fontFamily = config.fontFamily
  }

  initialize(paper) {
    // 轨道背景
    this._trackElement = new RectElement({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      fillColor: this.trackColor,
      borderRadius: this.radius,
      opacity: this.opacity,
    })
    this._trackElement.initialize(paper)

    // 进度填充
    const progressWidth = (this.value / 100) * this.width
    this._fillElement = new RectElement({
      x: 0,
      y: 0,
      width: progressWidth,
      height: this.height,
      fillColor: this.fillColor,
      borderRadius: this.radius,
      opacity: this.opacity,
    })
    this._fillElement.initialize(paper)

    // 标签
    if (this.showLabel && this.label) {
      this._labelElement = new TextElement({
        x: this.width / 2,
        y: -10,
        text: this.label,
        fontSize: 14,
        fontFamily: this.fontFamily,
        color: '#666666',
        textAlign: 'center',
        opacity: this.opacity,
      })
      this._labelElement.initialize(paper)
    }
  }

  render(paper, context = {}) {
    if (!this.visible) return

    const absX = this._resolvePercent(this.x, context.width)
    const absY = this._resolvePercent(this.y, context.height)

    // 轨道
    if (this._trackElement && this._trackElement._paperItem) {
      this._trackElement._paperItem.position = new paper.Point(
        absX + this.width / 2,
        absY + this.height / 2
      )
    }

    // 进度
    if (this._fillElement && this._fillElement._paperItem) {
      const progressWidth = (this.value / 100) * this.width
      this._fillElement.width = progressWidth
      this._fillElement._paperItem.bounds.width = progressWidth
      this._fillElement._paperItem.position = new paper.Point(
        absX + progressWidth / 2,
        absY + this.height / 2
      )
    }

    // 标签
    if (this._labelElement && this._labelElement._paperItem) {
      this._labelElement.x = absX + this.width / 2
      this._labelElement.y = absY - 10
      this._labelElement.render(paper, context)
    }
  }

  destroy() {
    if (this._trackElement) this._trackElement.destroy()
    if (this._fillElement) this._fillElement.destroy()
    if (this._labelElement) this._labelElement.destroy()
    super.destroy()
  }
}

module.exports = { Progress }