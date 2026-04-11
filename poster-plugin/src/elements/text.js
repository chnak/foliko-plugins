/**
 * 文字元素 - 支持多字体 fallback
 */

const paper = require('paper')
const { validateFont, getDefaultFont, getDefaultFontFamily, getFontFallbackChain, isEmojiFont } = require('../fonts')

/**
 * 检测文本是否包含 emoji
 */
function containsEmoji(text) {
  if (!text || typeof text !== 'string') return false
  
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
    /\u2600-\u26FF/u,   // 杂项符号
    /\u2700-\u27BF/u,   // 装饰符号
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
 * 检测文本是否包含中文
 */
function containsChinese(text) {
  if (!text || typeof text !== 'string') return false
  return /[\u4e00-\u9fff]/.test(text)
}

/**
 * 获取适合的字体（考虑 emoji 和中文）
 */
function getFontForText(requestedFont, text) {
  // 获取验证后的字体
  const baseFont = validateFont(requestedFont) || getDefaultFontFamily()
  
  // 如果文本包含 emoji，尝试使用支持 emoji 的字体
  if (containsEmoji(text)) {
    const chain = getFontFallbackChain(baseFont)
    
    // 创建一个混合字体链：emoji 字体优先，然后是主字体，然后是回退
    const emojiFonts = ['Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Symbola', 'Noto Emoji']
    
    for (const ef of emojiFonts) {
      if (!chain.includes(ef)) {
        chain.unshift(ef) // emoji 字体放到最前面
      }
    }
    
    console.log(`[poster] 检测到 emoji，字体链: ${chain.join(' > ')}`)
    return chain.join(', ') // Paper.js 支持逗号分隔的字体链
  }
  
  // 如果文本包含中文
  if (containsChinese(text)) {
    const chain = getFontFallbackChain(baseFont)
    
    // 中文字体优先级调整
    const chineseFonts = ['Microsoft YaHei', 'SimHei', 'SimSun', 'Noto Sans CJK SC']
    const adjustedChain = []
    
    // 先加中文字体
    for (const cf of chineseFonts) {
      if (chain.includes(cf)) {
        const idx = chain.indexOf(cf)
        chain.splice(idx, 1)
        adjustedChain.push(cf)
      }
    }
    
    // 再加原链
    adjustedChain.push(...chain)
    
    // 最后加主字体（确保它在中文回退之后）
    if (!adjustedChain.includes(baseFont)) {
      adjustedChain.unshift(baseFont)
    }
    
    console.log(`[poster] 检测到中文，字体链: ${adjustedChain.join(' > ')}`)
    return adjustedChain.join(', ')
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

  // 获取适合的字体（支持多字体 fallback）
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

  return { success: true, id: textItem.id, type: 'text', font: font }
}

module.exports = addText
