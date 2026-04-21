/**
 * 按钮组件
 * 支持渐变、阴影、图标
 */
const { Component } = require('../core/Component')
const { RectElement } = require('../elements/RectElement')
const { TextElement } = require('../elements/TextElement')
const { ImageElement } = require('../elements/ImageElement')

class Button extends Component {
  constructor(config = {}) {
    super({
      ...config,
      type: 'button',
      width: config.width || 'auto',
      height: config.height || 60,
    })

    this.text = config.text || '按钮'
    this.fontSize = config.fontSize || 24
    this.fontFamily = config.fontFamily
    this.color = config.color || '#ffffff'
    this.backgroundColor = config.backgroundColor || '#3b82f6'
    this.borderColor = config.borderColor
    this.borderWidth = config.borderWidth || 0
    this.radius = config.radius || 8
    this.shadow = config.shadow
    this.gradient = config.gradient
    this.icon = config.icon
    this.iconPosition = config.iconPosition || 'left'
    this.padding = config.padding || 30
    this.textAlign = 'center'
  }

  _createPaperItem(paper) {
    // 计算文字宽度
    const textStr = String(this.text || '')
    const chineseChars = (textStr.match(/[\u4e00-\u9fa5]/g) || []).length
    const otherChars = textStr.length - chineseChars
    const textWidth = chineseChars * this.fontSize * 1.0 + otherChars * this.fontSize * 0.5

    // 图标宽度
    const iconWidth = this.icon ? Math.min(this.height * 0.5, this.fontSize) + 8 : 0

    // 计算最终宽度
    this._finalWidth = typeof this.width === 'number'
      ? this.width
      : (textWidth + this.padding * 2 + iconWidth)
    this._finalHeight = this.height

    // 创建背景矩形
    const bg = new RectElement({
      x: 0,
      y: 0,
      width: this._finalWidth,
      height: this._finalHeight,
      fillColor: this.backgroundColor,
      borderColor: this.borderColor,
      borderWidth: this.borderWidth,
      borderRadius: this.radius,
      opacity: this.opacity,
    })

    return bg
  }

  initialize(paper) {
    // 初始化背景
    if (!this._bgElement) {
      this._bgElement = new RectElement({
        x: 0,
        y: 0,
        width: this._finalWidth || 200,
        height: this._finalHeight || 60,
        fillColor: this.backgroundColor,
        borderColor: this.borderColor,
        borderWidth: this.borderWidth,
        borderRadius: this.radius,
        opacity: this.opacity,
      })
    }
    this._bgElement.initialize(paper)

    // 初始化文字
    const textX = (this._finalWidth || 200) / 2
    const textY = (this._finalHeight || 60) / 2

    this._textElement = new TextElement({
      x: textX,
      y: textY,
      text: this.text,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      color: this.color,
      textAlign: 'center',
      anchor: [0.5, 0.5],
      opacity: this.opacity,
    })
    this._textElement.initialize(paper)

    // 初始化图标（如果是URL图片）
    if (this.icon && (this.icon.startsWith('http') || this.icon.startsWith('data:'))) {
      const iconSize = Math.min(this._finalHeight * 0.5, this.fontSize)
      const iconX = this.iconPosition === 'left'
        ? this.padding + iconSize / 2
        : (this._finalWidth || 200) - this.padding - iconSize / 2

      this._iconElement = new ImageElement({
        x: iconX,
        y: (this._finalHeight || 60) / 2,
        width: iconSize,
        height: iconSize,
        src: this.icon,
        anchor: [0.5, 0.5],
        opacity: this.opacity,
      })
      this._iconElement.initialize(paper)
    }
  }

  render(paper, context = {}) {
    if (!this.visible) return

    // 计算绝对位置
    const absX = this._resolvePercent(this.x, context.width)
    const absY = this._resolvePercent(this.y, context.height)

    // 更新背景位置
    if (this._bgElement && this._bgElement._paperItem) {
      this._bgElement._paperItem.position = new paper.Point(
        absX + (this._finalWidth || 200) / 2,
        absY + (this._finalHeight || 60) / 2
      )
    }

    // 更新文字位置
    if (this._textElement && this._textElement._paperItem) {
      this._textElement.x = absX + (this._finalWidth || 200) / 2
      this._textElement.y = absY + (this._finalHeight || 60) / 2
      this._textElement.render(paper, context)
    }

    // 更新图标位置
    if (this._iconElement && this._iconElement._paperItem) {
      const iconSize = Math.min(this._finalHeight * 0.5, this.fontSize)
      const iconX = this.iconPosition === 'left'
        ? absX + this.padding + iconSize / 2
        : absX + (this._finalWidth || 200) - this.padding - iconSize / 2

      this._iconElement.x = iconX
      this._iconElement.y = absY + (this._finalHeight || 60) / 2
      this._iconElement.render(paper, context)
    }
  }

  destroy() {
    if (this._bgElement) this._bgElement.destroy()
    if (this._textElement) this._textElement.destroy()
    if (this._iconElement) this._iconElement.destroy()
    super.destroy()
  }
}

module.exports = { Button }