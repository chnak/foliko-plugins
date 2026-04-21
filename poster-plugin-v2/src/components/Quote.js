/**
 * 引用块组件
 * 支持自动换行
 */
const { Component } = require('../core/Component')
const { RectElement } = require('../elements/RectElement')
const { TextElement } = require('../elements/TextElement')

class Quote extends Component {
  constructor(config = {}) {
    super({
      ...config,
      type: 'quote',
    })

    this.width = config.width || 400
    this.text = config.text || ''
    this.author = config.author
    this.backgroundColor = config.backgroundColor || '#f8fafc'
    this.borderColor = config.borderColor || '#6366f1'
    this.borderWidth = config.borderWidth || 4
    this.padding = config.padding || 20
    this.radius = config.radius || 8
    this.textColor = config.textColor || '#1e293b'
    this.authorColor = config.authorColor || '#64748b'
    this.fontSize = config.fontSize || 18
    this.fontFamily = config.fontFamily
  }

  _wrapText(paper, text, maxWidth) {
    if (!maxWidth || maxWidth <= 0) return [text]

    const tempText = new paper.PointText({
      fontSize: this.fontSize,
      fontFamily: this.fontFamily || 'sans-serif',
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

    // 文字换行计算
    const textPadding = this.padding + 30
    const maxTextWidth = this.width - textPadding - this.padding
    this._textLines = this._wrapText(paper, this.text, maxTextWidth)

    const lineHeight = this.fontSize * 1.5
    const textBlockHeight = this._textLines.length * lineHeight
    const authorHeight = this.author ? this.fontSize * 1.5 : 0
    const totalHeight = this.padding * 2 + textBlockHeight + authorHeight

    this._totalHeight = Math.max(totalHeight, 80)

    // 背景
    this._bgElement = new RectElement({
      x: 0,
      y: 0,
      width: this.width,
      height: this._totalHeight,
      fillColor: this.backgroundColor,
      borderRadius: this.radius,
      opacity: this.opacity,
    })
    this._bgElement.initialize(paper)

    // 左边框
    this._borderElement = new RectElement({
      x: 0,
      y: 0,
      width: this.borderWidth,
      height: this._totalHeight,
      fillColor: this.borderColor,
      opacity: this.opacity,
    })
    this._borderElement.initialize(paper)

    // 引号
    this._quoteMarkElement = new TextElement({
      x: this.padding + 10,
      y: this.padding + this.fontSize,
      text: '"',
      fontSize: this.fontSize * 2,
      fontFamily: this.fontFamily,
      color: this.borderColor,
      textAlign: 'left',
      opacity: this.opacity,
    })
    this._quoteMarkElement.initialize(paper)

    // 引用文字
    this._textElements = []
    const textStartY = this.padding + this.fontSize

    for (let i = 0; i < this._textLines.length; i++) {
      const textEl = new TextElement({
        x: this.padding + 30,
        y: textStartY + i * lineHeight,
        text: this._textLines[i],
        fontSize: this.fontSize,
        fontFamily: this.fontFamily,
        color: this.textColor,
        textAlign: 'left',
        opacity: this.opacity,
      })
      textEl.initialize(paper)
      this._textElements.push(textEl)
    }

    // 作者
    if (this.author) {
      const authorY = this.padding + textBlockHeight + this.fontSize * 1.3
      this._authorElement = new TextElement({
        x: this.padding,
        y: authorY,
        text: `— ${this.author}`,
        fontSize: this.fontSize * 0.85,
        fontFamily: this.fontFamily,
        color: this.authorColor,
        textAlign: 'left',
        opacity: this.opacity,
      })
      this._authorElement.initialize(paper)
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
        absY + this._totalHeight / 2
      )
    }

    // 左边框
    if (this._borderElement && this._borderElement._paperItem) {
      this._borderElement._paperItem.position = new paper.Point(
        absX + this.borderWidth / 2,
        absY + this._totalHeight / 2
      )
    }

    // 引号
    if (this._quoteMarkElement && this._quoteMarkElement._paperItem) {
      this._quoteMarkElement.x = absX + this.padding + 10
      this._quoteMarkElement.y = absY + this.padding + this.fontSize
      this._quoteMarkElement.render(paper, context)
    }

    // 引用文字
    const lineHeight = this.fontSize * 1.5
    const textStartY = this.padding + this.fontSize

    for (let i = 0; i < this._textElements.length; i++) {
      const textEl = this._textElements[i]
      if (textEl && textEl._paperItem) {
        textEl.x = absX + this.padding + 30
        textEl.y = absY + textStartY + i * lineHeight
        textEl.render(paper, context)
      }
    }

    // 作者
    if (this._authorElement && this._authorElement._paperItem) {
      const textBlockHeight = this._textLines.length * lineHeight
      const authorY = absY + this.padding + textBlockHeight + this.fontSize * 1.3
      this._authorElement.x = absX + this.padding
      this._authorElement.y = authorY
      this._authorElement.render(paper, context)
    }
  }

  destroy() {
    if (this._bgElement) this._bgElement.destroy()
    if (this._borderElement) this._borderElement.destroy()
    if (this._quoteMarkElement) this._quoteMarkElement.destroy()
    for (const el of this._textElements) {
      if (el) el.destroy()
    }
    if (this._authorElement) this._authorElement.destroy()
    super.destroy()
  }
}

module.exports = { Quote }