/**
 * Chip 标签组件
 */
const { Component } = require('../core/Component')
const { RectElement } = require('../elements/RectElement')
const { TextElement } = require('../elements/TextElement')

class Chip extends Component {
  constructor(config = {}) {
    super({
      ...config,
      type: 'chip',
      width: 'auto',
      height: 'auto',
    })

    this.text = config.text || ''
    this.backgroundColor = config.backgroundColor || '#e0e0e0'
    this.color = config.color || '#333333'
    this.borderColor = config.borderColor
    this.fontSize = config.fontSize || 12
    this.padding = config.padding || 12
    this.radius = config.radius || 16
    this.icon = config.icon
    this.fontFamily = config.fontFamily
  }

  _calcSize() {
    const textStr = String(this.text || '')
    const chineseChars = (textStr.match(/[\u4e00-\u9fa5]/g) || []).length
    const otherChars = textStr.length - chineseChars
    const textWidth = chineseChars * this.fontSize * 1.0 + otherChars * this.fontSize * 0.5
    const iconWidth = this.icon ? this.fontSize : 0

    this._chipWidth = this.padding * 2 + textWidth + iconWidth + 4
    this._chipHeight = this.fontSize + this.padding * 2
  }

  initialize(paper) {
    this._calcSize()

    // 背景
    this._bgElement = new RectElement({
      x: 0,
      y: 0,
      width: this._chipWidth,
      height: this._chipHeight,
      fillColor: this.backgroundColor,
      borderColor: this.borderColor,
      borderWidth: 1,
      borderRadius: this.radius,
      opacity: this.opacity,
    })
    this._bgElement.initialize(paper)

    // 图标
    if (this.icon) {
      this._iconElement = new TextElement({
        x: this.padding + this.fontSize / 2,
        y: this._chipHeight / 2,
        text: this.icon,
        fontSize: this.fontSize + 2,
        color: this.color,
        textAlign: 'center',
        anchor: [0.5, 0.5],
        opacity: this.opacity,
      })
      this._iconElement.initialize(paper)
    }

    // 文字
    const textX = this.icon
      ? this.padding + this.fontSize + 4 + this._chipWidth / 2
      : this._chipWidth / 2

    this._textElement = new TextElement({
      x: textX,
      y: this._chipHeight / 2,
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

    // 背景
    if (this._bgElement && this._bgElement._paperItem) {
      this._bgElement._paperItem.position = new paper.Point(
        absX + this._chipWidth / 2,
        absY + this._chipHeight / 2
      )
    }

    // 图标
    if (this._iconElement && this._iconElement._paperItem) {
      this._iconElement.x = absX + this.padding + this.fontSize / 2
      this._iconElement.y = absY + this._chipHeight / 2
      this._iconElement.render(paper, context)
    }

    // 文字
    if (this._textElement && this._textElement._paperItem) {
      const textX = this.icon
        ? absX + this.padding + this.fontSize + 4 + this._chipWidth / 2
        : absX + this._chipWidth / 2
      this._textElement.x = textX
      this._textElement.y = absY + this._chipHeight / 2
      this._textElement.render(paper, context)
    }
  }

  destroy() {
    if (this._bgElement) this._bgElement.destroy()
    if (this._iconElement) this._iconElement.destroy()
    if (this._textElement) this._textElement.destroy()
    super.destroy()
  }
}

module.exports = { Chip }