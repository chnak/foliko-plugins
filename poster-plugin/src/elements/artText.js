/**
 * 艺术文字元素 - 使用 @napi-rs/canvas 原生字体 API
 */

const paper = require('paper')
const {
  validateFont,
  getDefaultFontFamily,
  getFontFallbackChain
} = require('../fonts')

/**
 * 添加艺术文字
 */
function addArtText(project, args) {
  const {
    text,
    x, y,
    fontSize,
    fontFamily,
    gradient,
    strokeColor,
    strokeWidth,
    shadow,
  } = args

  // 获取字体
  const baseFont = validateFont(fontFamily) || getDefaultFontFamily()
  const chain = getFontFallbackChain(fontFamily || baseFont, text)
  const font = chain.length === 1 ? chain[0] : chain.join(', ')

  const textItem = new paper.PointText({
    point: [x, y],
    content: text,
    fontSize: fontSize || 120,
    fontFamily: font,
    fillColor: gradient
      ? new paper.Color(gradient.colors[0])
      : new paper.Color('#ffffff'),
    justification: 'center',
  })

  // 渐变填充
  if (gradient && gradient.colors.length > 0) {
    const colors = gradient.colors.map(c => new paper.Color(c))
    textItem.fillColor = new paper.Color({
      gradient: { stops: colors },
      origin: textItem.bounds.topLeft,
      destination: textItem.bounds.topRight,
    })
  }

  // 描边
  if (strokeColor) {
    textItem.strokeColor = new paper.Color(strokeColor)
    textItem.strokeWidth = strokeWidth || 2
  }

  // 阴影
  if (shadow) {
    textItem.shadowColor = new paper.Color(shadow.color || '#000000')
    textItem.shadowBlur = shadow.blur || 10
    textItem.shadowOffset = new paper.Point(shadow.offsetX || 3, shadow.offsetY || 3)
  }

  return { success: true, id: textItem.id, type: 'artText' }
}

module.exports = addArtText
