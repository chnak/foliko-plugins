/**
 * 文本元素
 */
const { BaseElement } = require('../core/BaseElement')
const { getFontFallbackChain, getDefaultFontFamily } = require('../fonts')

class TextElement extends BaseElement {
  constructor(config = {}) {
    super({ ...config, type: 'text' })

    this.text = config.text || ''
    this.fontSize = config.fontSize || 32
    this.fontFamily = config.fontFamily || getDefaultFontFamily()
    this.fontWeight = config.fontWeight || 'normal'
    this.color = config.color || '#000000'
    this.textAlign = config.textAlign || 'left'
  }

  _createPaperItem(paper) {
    const fontChain = getFontFallbackChain(this.fontFamily, this.text)

    const text = new paper.PointText({
      point: [0, 0],
      content: this.text,
      fontSize: this.fontSize,
      fontFamily: fontChain,
      fontWeight: this.fontWeight,
      fillColor: this.color,
      justification: this.textAlign
    })

    return text
  }

  render(paper, context = {}) {
    if (!this.visible) return
    if (!this._initialized) this.initialize(paper)
    if (!this._paperItem) return

    // 解析位置
    const x = this._resolvePercent(this.x, context.width)
    const y = this._resolvePercent(this.y, context.height)

    // 解析字体大小
    const fontSize = this._resolvePercent(this.fontSize, context.height)

    // 根据对齐方式设置位置
    // point是文本基线的起始点（left对齐时），position是中心点
    if (this.textAlign === 'center') {
      this._paperItem.position = new paper.Point(x, y)
    } else {
      this._paperItem.point = new paper.Point(x, y)
    }

    this._paperItem.fontSize = fontSize

    // 更新字体回退链
    const fontChain = getFontFallbackChain(this.fontFamily, this.text)
    this._paperItem.fontFamily = fontChain

    // 更新文本
    this._paperItem.content = this.text

    // 应用样式
    this._paperItem.opacity = this.opacity
    this._paperItem.rotation = this.rotation
    this._paperItem.visible = this.visible
  }

  _resolvePercent(value, reference) {
    if (typeof value === 'string' && value.endsWith('%')) {
      return (parseFloat(value) / 100) * reference
    }
    return value
  }
}

module.exports = { TextElement }
