/**
 * 文字元素
 */

const paper = require('paper')
const { validateFont, getDefaultFont, getRegisteredFonts } = require('../fonts')

/**
 * 检测文本是否包含 emoji
 */
function containsEmoji(text) {
  // Emoji Unicode 范围
  const emojiRanges = [
    /\u{1F600}-\u{1F64F}/u, // 表情符号
    /\u{1F300}-\u{1F5FF}/u, // 符号和图片
    /\u{1F680}-\u{1F6FF}/u, // 交通和地图
    /\u{1F700}-\u{1F77F}/u, // 字母符号
    /\u{1F780}-\u{1F7FF}/u, // 几何符号扩展
    /\u{1F800}-\u{1F8FF}/u, // 箭头补充
    /\u{1F900}-\u{1F9FF}/u, // 表情符号补充
    /\u{1FA00}-\u{1FA6F}/u, // 棋牌符号
    /\u{1FA70}-\u{1FAFF}/u, // 装饰符号
    /\u{2600}-\u{26FF}/u,   // 杂项符号
    /\u{2700}-\u{27BF}/u,   // 装饰符号
    /[\u{1F000}-\u{1F02F}]/u, // 麻将牌
  ]

  for (const range of emojiRanges) {
    if (range.test(text)) {
      return true
    }
  }

  // 简单检测：包含常见 emoji 字符
  const simpleEmoji = /[\u{1F300}-\u{1F9FF}]/u
  return simpleEmoji.test(text)
}

/**
 * 获取适合的字体（考虑 emoji）
 */
function getFontForText(requestedFont, text) {
  const baseFont = validateFont(requestedFont) || getDefaultFont()

  // 如果文本包含 emoji，尝试使用支持 emoji 的字体
  if (containsEmoji(text)) {
    const registeredFonts = getRegisteredFonts()

    // 优先查找专门的 emoji 字体
    const emojiFont = registeredFonts.find(f =>
      f.includes('Color Emoji') ||
      f.includes('Apple Color Emoji') ||
      f.includes('Noto Emoji') ||
      f.includes('Symbola') ||
      f.includes('Segoe UI Emoji')
    )

    if (emojiFont) {
      console.log(`[poster] 检测到 emoji，使用字体: ${emojiFont}`)
      return emojiFont
    }
  }

  return baseFont
}

/**
 * 添加文字
 */
function addText(project, args) {
  const {
    text,
    x, y,
    fontSize, fontFamily, color,
    align,
    shadow,
  } = args

  const font = getFontForText(fontFamily, text)

  const textItem = new paper.PointText({
    point: [x, y],
    content: text,
    fontSize: fontSize || 48,
    fontFamily: font,
    fillColor: new paper.Color(color || '#ffffff'),
    justification: align || 'left',
  })

  if (shadow) {
    textItem.shadowColor = new paper.Color(shadow.color)
    textItem.shadowBlur = shadow.blur || 5
    textItem.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
  }

  return { success: true, id: textItem.id, type: 'text' }
}

module.exports = addText
