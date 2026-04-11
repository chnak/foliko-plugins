/**
 * 文字元素 - 使用 @napi-rs/canvas 原生字体 API
 */

const paper = require('paper')
const {
  validateFont,
  getDefaultFontFamily,
  getFontFallbackChain,
  matchFont,
  isEmojiFont
} = require('../fonts')

// 预编译的正则表达式常量
const CHINESE_REGEX = /[\u4e00-\u9fff]/

/**
 * 检测文本是否包含 emoji
 */
function containsEmoji(text) {
  if (!text || typeof text !== 'string') return false

  // 使用 Unicode 属性转义检测 emoji
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
    /\u2600-\u26FF/u,       // 杂项符号
    /\u2700-\u27BF/u,       // 装饰符号
  ]

  for (const range of emojiRanges) {
    if (range.test(text)) return true
  }

  return false
}

/**
 * 检测文本是否包含中文
 */
function containsChinese(text) {
  if (!text || typeof text !== 'string') return false
  return CHINESE_REGEX.test(text)
}

/**
 * 获取适合的字体（考虑 emoji 和中文）
 */
function getFontForText(requestedFont, text) {
  // 获取验证后的字体
  const baseFont = validateFont(requestedFont) || getDefaultFontFamily()

  // 获取字体 fallback 链
  const chain = getFontFallbackChain(requestedFont || baseFont, text)

  // 对于 @napi-rs/canvas，逗号分隔的字体链应该能正常工作
  // 如果只有一个字体，就直接返回
  if (chain.length === 1) {
    return chain[0]
  }

  // 返回字体链（逗号分隔）
  return chain.join(', ')
}

/**
 * 添加文字
 */
function addText(project, args) {
  const {
    text,
    x, y,
    fontSize,
    fontFamily,
    color,
    align,
    shadow,
  } = args

  // 获取适合的字体
  const font = getFontForText(fontFamily, text)

  // 创建文本元素
  const textItem = new paper.PointText({
    point: [x, y],
    content: text,
    fontSize: fontSize || 48,
    fontFamily: font,
    fillColor: new paper.Color(color || '#ffffff'),
    justification: align || 'left',
  })

  // 添加阴影
  if (shadow) {
    textItem.shadowColor = new paper.Color(shadow.color || '#000000')
    textItem.shadowBlur = shadow.blur || 5
    textItem.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
  }

  return {
    success: true,
    id: textItem.id,
    type: 'text',
    font: font
  }
}

module.exports = addText
