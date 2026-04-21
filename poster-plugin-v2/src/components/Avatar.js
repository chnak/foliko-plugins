/**
 * 头像组件
 */
const { Component } = require('../core/Component')
const { CircleElement } = require('../elements/CircleElement')
const { TextElement } = require('../elements/TextElement')

class Avatar extends Component {
  constructor(config = {}) {
    super({
      ...config,
      type: 'avatar',
      width: config.size || 80,
      height: config.size || 80,
    })

    this.size = config.size || 80
    this.src = config.src
    this.initials = config.initials
    this.backgroundColor = config.backgroundColor || '#6366f1'
    this.borderColor = config.borderColor
    this.borderWidth = config.borderWidth || 0
    this.color = config.color || '#ffffff'
    this.fontFamily = config.fontFamily
  }

  initialize(paper) {
    // 圆形背景
    this._bgElement = new CircleElement({
      x: 0,
      y: 0,
      radius: this.size / 2,
      fillColor: this.backgroundColor,
      strokeColor: this.borderColor,
      strokeWidth: this.borderWidth,
      opacity: this.opacity,
    })
    this._bgElement.initialize(paper)

    // 首字母
    if (!this.src && this.initials) {
      this._textElement = new TextElement({
        x: 0,
        y: this.size * 0.15,
        text: this.initials.charAt(0).toUpperCase(),
        fontSize: this.size * 0.4,
        fontFamily: this.fontFamily,
        color: this.color,
        textAlign: 'center',
        anchor: [0.5, 0.5],
        opacity: this.opacity,
      })
      this._textElement.initialize(paper)
    }
  }

  render(paper, context = {}) {
    if (!this.visible) return

    const absX = this._resolvePercent(this.x, context.width)
    const absY = this._resolvePercent(this.y, context.height)

    // 圆形背景
    if (this._bgElement && this._bgElement._paperItem) {
      this._bgElement._paperItem.position = new paper.Point(absX, absY)
    }

    // 首字母 - 使用 fontSize/3 偏移实现视觉居中
    if (this._textElement && this._textElement._paperItem) {
      const fontSize = this.size * 0.4
      this._textElement.x = absX
      this._textElement.y = absY + fontSize / 3
      this._textElement.render(paper, context)
    }
  }

  destroy() {
    if (this._bgElement) this._bgElement.destroy()
    if (this._textElement) this._textElement.destroy()
    super.destroy()
  }
}

module.exports = { Avatar }