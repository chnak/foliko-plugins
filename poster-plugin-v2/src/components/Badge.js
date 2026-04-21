/**
 * 徽章/标签组件
 */
const { Component } = require('../core/Component')
const { RectElement } = require('../elements/RectElement')
const { TextElement } = require('../elements/TextElement')

class Badge extends Component {
  constructor(config = {}) {
    super({
      ...config,
      type: 'badge',
      width: 'auto',
      height: 'auto',
    })

    this.text = config.text || ''
    this.backgroundColor = config.backgroundColor || '#007bff'
    this.color = config.color || '#ffffff'
    this.borderColor = config.borderColor
    this.fontSize = config.fontSize || 18
    this.padding = config.padding || 15
    this.radius = config.radius || 4
    this.fontFamily = config.fontFamily
  }

  _calcSize() {
    const textStr = String(this.text || '')
    const chineseChars = (textStr.match(/[\u4e00-\u9fa5]/g) || []).length
    const otherChars = textStr.length - chineseChars
    const textWidth = chineseChars * this.fontSize * 1.0 + otherChars * this.fontSize * 0.5

    this._badgeWidth = textWidth + this.padding * 2
    this._badgeHeight = this.fontSize + this.padding * 2
  }

  initialize(paper) {
    this._calcSize()

    // 背景
    this._bgElement = new RectElement({
      x: 0,
      y: 0,
      width: this._badgeWidth,
      height: this._badgeHeight,
      fillColor: this.backgroundColor,
      borderColor: this.borderColor,
      borderWidth: 1,
      borderRadius: this.radius,
      opacity: this.opacity,
    })
    this._bgElement.initialize(paper)

    // 文字
    this._textElement = new TextElement({
      x: this._badgeWidth / 2,
      y: this._badgeHeight / 2,
      text: this.text,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      color: this.color,
      textAlign: 'center',
      anchor: [0.5, 0.5],
      opacity: this.opacity,
    })
    this._textElement.initialize(paper)
  }

  render(paper, context = {}) {
    if (!this.visible) return

    const absX = this._resolvePercent(this.x, context.width)
    const absY = this._resolvePercent(this.y, context.height)

    // 背景位置
    if (this._bgElement && this._bgElement._paperItem) {
      this._bgElement._paperItem.position = new paper.Point(
        absX + this._badgeWidth / 2,
        absY + this._badgeHeight / 2
      )
    }

    // 文字位置
    if (this._textElement && this._textElement._paperItem) {
      this._textElement.x = absX + this._badgeWidth / 2
      this._textElement.y = absY + this._badgeHeight / 2
      this._textElement.render(paper, context)
    }
  }

  destroy() {
    if (this._bgElement) this._bgElement.destroy()
    if (this._textElement) this._textElement.destroy()
    super.destroy()
  }
}

module.exports = { Badge }