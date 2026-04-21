/**
 * 卡片组件
 * 支持标题+副标题，自动换行
 */
const { Component } = require('../core/Component')
const { RectElement } = require('../elements/RectElement')
const { TextElement } = require('../elements/TextElement')

class Card extends Component {
  constructor(config = {}) {
    super({
      ...config,
      type: 'card',
    })

    this.backgroundColor = config.backgroundColor || config.background || '#ffffff'
    this.borderColor = config.borderColor || config.border
    this.borderWidth = config.borderWidth || config.borderWidth || 1
    this.radius = config.radius || 0

    // 标题
    this.title = config.title
    this.titleSize = config.titleSize || config.fontSize || 24
    this.titleColor = config.titleColor || '#000000'
    this.fontFamily = config.fontFamily

    // 副标题
    this.subtitle = config.subtitle
    this.subtitleSize = config.subtitleSize || 16
    this.subtitleColor = config.subtitleColor || '#666666'

    // 内边距
    this._padding = config.padding || 20

    // 文本自适应
    this._autoFit = config.autoFit !== false  // 默认开启自动适配
  }

  /**
   * 文本自动换行
   */
  _wrapText(paper, text, maxWidth, fontSize, fontFamily) {
    if (!maxWidth || maxWidth <= 0) return [text]

    const tempText = new paper.PointText({
      fontSize,
      fontFamily: fontFamily || 'sans-serif',
    })

    const lines = []
    const paragraphs = text.split('\n')

    for (const paragraph of paragraphs) {
      let currentLine = ''
      let i = 0

      while (i < paragraph.length) {
        const char = paragraph[i]
        const testLine = currentLine + char
        tempText.content = testLine

        if (tempText.bounds.width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine)
          currentLine = char
        } else {
          currentLine = testLine
        }
        i++
      }

      if (currentLine.length > 0) {
        lines.push(currentLine)
      }
    }

    tempText.remove()
    return lines
  }

  initialize(paper) {
    this._paper = paper

    // 计算可用宽度
    const maxTextWidth = this.width - this._padding * 2

    // 标题换行
    let titleLines = []
    if (this.title) {
      titleLines = this._wrapText(paper, this.title, maxTextWidth, this.titleSize, this.fontFamily)
    }

    // 副标题换行
    let subtitleLines = []
    if (this.subtitle) {
      subtitleLines = this._wrapText(paper, this.subtitle, maxTextWidth, this.subtitleSize, this.fontFamily)
    }

    // 计算行高
    const titleLineHeight = this.titleSize * 1.3
    const subtitleLineHeight = this.subtitleSize * 1.3

    // 计算内容高度
    const titleHeight = titleLines.length * titleLineHeight
    const subtitleHeight = subtitleLines.length * subtitleLineHeight
    const contentHeight = titleHeight + (this.title && this.subtitle ? 8 : 0) + subtitleHeight

    // 计算最小高度（如果内容不足，用内容高度填充）
    const minHeight = this._padding * 2 + Math.max(contentHeight, this.height - this._padding * 2)
    this._actualHeight = Math.max(this.height, minHeight)

    // 背景
    this._bgElement = new RectElement({
      x: 0,
      y: 0,
      width: this.width,
      height: this._actualHeight,
      fillColor: this.backgroundColor,
      borderColor: this.borderColor,
      borderWidth: this.borderWidth,
      borderRadius: this.radius,
      opacity: this.opacity,
    })
    this._bgElement.initialize(paper)

    // 存储换行后的文本行
    this._titleLines = titleLines
    this._subtitleLines = subtitleLines

    // 标题文本元素
    this._titleElements = []
    for (let i = 0; i < titleLines.length; i++) {
      const el = new TextElement({
        x: this._padding,
        y: this._padding + this.titleSize + i * titleLineHeight,
        text: titleLines[i],
        fontSize: this.titleSize,
        fontFamily: this.fontFamily,
        color: this.titleColor,
        textAlign: 'left',
        opacity: this.opacity,
      })
      el.initialize(paper)
      this._titleElements.push(el)
    }

    // 副标题文本元素
    this._subtitleElements = []
    const subtitleStartY = this._padding + titleHeight + (this.title && this.subtitle ? 8 : 0)

    for (let i = 0; i < subtitleLines.length; i++) {
      const el = new TextElement({
        x: this._padding,
        y: subtitleStartY + this.subtitleSize + i * subtitleLineHeight,
        text: subtitleLines[i],
        fontSize: this.subtitleSize,
        fontFamily: this.fontFamily,
        color: this.subtitleColor,
        textAlign: 'left',
        opacity: this.opacity,
      })
      el.initialize(paper)
      this._subtitleElements.push(el)
    }
  }

  render(paper, context = {}) {
    if (!this.visible) return

    const absX = this._resolvePercent(this.x, context.width)
    const absY = this._resolvePercent(this.y, context.height)

    // 背景
    if (this._bgElement && this._bgElement._paperItem) {
      this._bgElement._paperItem.position = new paper.Point(
        absX + this.width / 2,
        absY + this._actualHeight / 2
      )
    }

    // 标题
    for (let i = 0; i < this._titleElements.length; i++) {
      const el = this._titleElements[i]
      if (el && el._paperItem) {
        el.x = absX + this._padding
        el.y = absY + this._padding + this.titleSize + i * this.titleSize * 1.3
        el.render(paper, context)
      }
    }

    // 副标题
    const titleHeight = this._titleLines.length * this.titleSize * 1.3
    const subtitleStartY = this._padding + titleHeight + (this.title && this.subtitle ? 8 : 0)

    for (let i = 0; i < this._subtitleElements.length; i++) {
      const el = this._subtitleElements[i]
      if (el && el._paperItem) {
        el.x = absX + this._padding
        el.y = absY + subtitleStartY + this.subtitleSize + i * this.subtitleSize * 1.3
        el.render(paper, context)
      }
    }
  }

  destroy() {
    if (this._bgElement) this._bgElement.destroy()
    for (const el of this._titleElements) {
      if (el) el.destroy()
    }
    for (const el of this._subtitleElements) {
      if (el) el.destroy()
    }
    this._titleElements = []
    this._subtitleElements = []
    super.destroy()
  }
}

module.exports = { Card }