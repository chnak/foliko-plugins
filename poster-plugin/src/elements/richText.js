/**
 * 富文本组件 - 支持旋转和多种文本样式
 * 支持自动换行
 */

const paper = require('paper')
const { validateFont, getDefaultFontFamily, getRegisteredFonts } = require('../fonts')

/**
 * 检测文本是否包含 emoji
 */
function containsEmoji(text) {
  if (!text || typeof text !== 'string') return false
  const emojiRanges = [
    /\u{1F600}-\u{1F64F}/u, /\u{1F300}-\u{1F5FF}/u, /\u{1F680}-\u{1F6FF}/u,
    /\u{1F700}-\u{1F77F}/u, /\u{1F780}-\u{1F7FF}/u, /\u{1F800}-\u{1F8FF}/u,
    /\u{1F900}-\u{1F9FF}/u, /\u{1FA00}-\u{1FA6F}/u, /\u{1FA70}-\u{1FAFF}/u,
    /\u{2600}-\u{26FF}/u, /\u{2700}-\u{27BF}/u,
  ]
  for (const range of emojiRanges) {
    if (range.test(text)) return true
  }
  return /[\u{1F300}-\u{1F9FF}]/u.test(text)
}

/**
 * 获取适合的字体（考虑 emoji）
 */
function getFontForText(requestedFont, text) {
  const baseFont = validateFont(requestedFont) || getDefaultFontFamily()
  if (containsEmoji(text)) {
    const registeredFonts = getRegisteredFonts()
    const emojiFont = registeredFonts.find(f => {
      if (!f) return false
      const lower = f.toLowerCase()
      return lower.includes('color emoji') || lower.includes('noto emoji') ||
             lower.includes('segoe ui emoji') || lower.includes('symbola') || lower.includes('emoji')
    })
    if (emojiFont) return emojiFont
  }
  return baseFont
}

/**
 * 手动实现文本自动换行
 * @param {string} text - 原始文本
 * @param {number} maxWidth - 最大宽度
 * @param {number} fontSize - 字体大小
 * @param {string} font - 字体名称
 * @param {number} letterSpacing - 字母间距
 * @returns {string[]} 换行后的行数组
 */
function wrapText(text, maxWidth, fontSize, font, letterSpacing = 0) {
  if (!maxWidth || maxWidth <= 0) return [text]
  
  // 创建临时文本用于测量宽度
  const tempText = new paper.PointText({
    fontSize,
    fontFamily: font,
  })
  if (letterSpacing !== 0) {
    tempText.letterSpacing = letterSpacing
  }
  
  const lines = []
  const paragraphs = text.split('\n')
  
  for (let p = 0; p < paragraphs.length; p++) {
    let currentLine = ''
    const paragraph = paragraphs[p]
    
    // 按字符分割（处理中英文混合）
    const chars = []
    // 使用简单的字符分割方法
    for (let i = 0; i < paragraph.length; i++) {
      chars.push(paragraph[i])
    }
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i]
      const testLine = currentLine + char
      
      tempText.content = testLine
      const testWidth = tempText.bounds.width
      
      if (testWidth > maxWidth && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = char
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine)
    }
  }
  
  tempText.remove()
  return lines
}

/**
 * 添加富文本
 * @param {paper.Project} project - Paper.js 项目
 * @param {Object} args - 参数
 * @returns {Object} 结果
 */
function addRichText(project, args) {
  const {
    // 位置和尺寸
    x = 0,
    y = 0,
    width,           // 文本区域宽度（用于自动换行）

    // 文本内容
    text = '',

    // 字体样式
    fontSize = 48,
    fontFamily,
    fontWeight,       // normal, bold, 100-900
    fontStyle,       // normal, italic, oblique
    italic = false,
    bold = false,

    // 文字装饰
    underline = false,
    strikethrough = false,

    // 颜色
    color = '#ffffff',
    backgroundColor,  // 文字背景色
    gradient,        // { colors: ['#fff', '#000'], direction: 0 }

    // 描边
    strokeColor,
    strokeWidth = 1,

    // 阴影
    shadow,          // { color: '#000', blur: 5, offsetX: 2, offsetY: 2 }

    // 间距
    letterSpacing = 0,
    lineSpacing = 0, // 行间距增量
    lineHeight,      // 行高

    // 对齐
    align = 'left',  // left, center, right, justify

    // 变换
    rotation = 0,    // 旋转角度（度）
    scale,

    // 透明度
    opacity = 1,

    // 换行
    wrap = true,     // 是否自动换行
  } = args

  const font = getFontForText(fontFamily, text)
  const effectiveFontWeight = bold ? 'bold' : (fontWeight || 'normal')
  const effectiveFontStyle = italic ? 'italic' : (fontStyle || 'normal')

  // 计算实际行高
  const actualLineHeight = lineHeight || (fontSize + lineSpacing)
  
  // 如果需要换行且指定了宽度
  let textLines = [text]
  if (wrap && width && width > 0) {
    textLines = wrapText(text, width - 10, fontSize, font, letterSpacing)
  }

  // 计算总高度
  const totalHeight = textLines.length * actualLineHeight

  // 创建组来容纳所有文本行
  const group = new paper.Group()

  // 逐行创建文本
  textLines.forEach((lineText, index) => {
    const lineY = y + fontSize + index * actualLineHeight
    
    const textItem = new paper.PointText({
      point: [x, lineY],
      content: lineText,
      fontSize,
      fontFamily: font,
      fontWeight: effectiveFontWeight,
      fontStyle: effectiveFontStyle,
      fillColor: new paper.Color(color),
      justification: align,
    })

    // 字母间距
    if (letterSpacing !== 0) {
      textItem.letterSpacing = letterSpacing
    }

    // 下划线和删除线
    if (underline || strikethrough) {
      textItem.decorations = []
      if (underline) textItem.decorations.push('underline')
      if (strikethrough) textItem.decorations.push('strikethrough')
    }

    // 描边
    if (strokeColor) {
      textItem.strokeColor = new paper.Color(strokeColor)
      textItem.strokeWidth = strokeWidth
    }

    // 阴影
    if (shadow) {
      textItem.shadowColor = new paper.Color(shadow.color || '#000000')
      textItem.shadowBlur = shadow.blur || 5
      textItem.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
    }

    // 透明度
    if (opacity !== 1) {
      textItem.opacity = opacity
    }

    group.addChild(textItem)
  })

  // 渐变填充（应用到所有行）
  if (gradient && gradient.colors && gradient.colors.length > 0) {
    const colors = gradient.colors.map(c => new paper.Color(c))
    const bounds = group.bounds
    if (gradient.direction !== undefined) {
      const angle = gradient.direction * Math.PI / 180
      const diagonal = Math.sqrt(bounds.width ** 2 + bounds.height ** 2)
      group.fillColor = new paper.Color({
        gradient: { stops: colors },
        origin: new paper.Point(
          bounds.center.x - Math.cos(angle) * diagonal / 2,
          bounds.center.y - Math.sin(angle) * diagonal / 2
        ),
        destination: new paper.Point(
          bounds.center.x + Math.cos(angle) * diagonal / 2,
          bounds.center.y + Math.sin(angle) * diagonal / 2
        ),
      })
    } else {
      group.fillColor = new paper.Color({
        gradient: { stops: colors },
        origin: bounds.topLeft,
        destination: bounds.topRight,
      })
    }
    // 清除子元素的单独颜色
    group.children.forEach(child => {
      if (child.fillColor) {
        child.fillColor = null
      }
    })
  }

  // 背景色 - 创建背景矩形
  let bgRect = null
  if (backgroundColor) {
    const padding = 10
    bgRect = new paper.Path.Rectangle({
      point: [group.bounds.left - padding, group.bounds.top - padding],
      size: [group.bounds.width + padding * 2, group.bounds.height + padding * 2],
      fillColor: new paper.Color(backgroundColor),
      radius: 4,
    })
    bgRect.sendToBack()
  }

  // 旋转
  if (rotation !== 0) {
    group.rotate(rotation, new paper.Point(x, y + fontSize))
    if (bgRect) bgRect.rotate(rotation, bgRect.bounds.center)
  }

  // 缩放
  if (scale !== undefined) {
    if (typeof scale === 'number') {
      group.scale(scale, scale, new paper.Point(x, y + fontSize))
      if (bgRect) bgRect.scale(scale, scale, bgRect.bounds.center)
    } else if (typeof scale === 'object' && (scale.x !== undefined || scale.y !== undefined)) {
      const sx = scale.x || 1
      const sy = scale.y || sx
      group.scale(sx, sy, new paper.Point(x, y + fontSize))
      if (bgRect) bgRect.scale(sx, sy, bgRect.bounds.center)
    }
  }

  return {
    success: true,
    id: group.id,
    type: 'richText',
    bounds: {
      x: group.bounds.x,
      y: group.bounds.y,
      width: group.bounds.width,
      height: group.bounds.height,
    }
  }
}

module.exports = addRichText
