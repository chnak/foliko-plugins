/**
 * 富文本组件 - 使用 @napi-rs/canvas 原生字体 API
 * 支持自动换行
 */

const paper = require('paper')
const {
  validateFont,
  getDefaultFontFamily,
  getFontFallbackChain,
  isEmojiFont
} = require('../fonts')

// 预编译的正则表达式常量
const CHINESE_REGEX = /[\u4e00-\u9fff]/

/**
 * 检测文本是否包含 emoji
 */
function containsEmoji(text) {
  if (!text || typeof text !== 'string') return false
  const emojiRanges = [
    /\u{1F600}-\u{1F64F}/u,
    /\u{1F300}-\u{1F5FF}/u,
    /\u{1F680}-\u{1F6FF}/u,
    /\u{1F700}-\u{1F77F}/u,
    /\u{1F780}-\u{1F7FF}/u,
    /\u{1F800}-\u{1F8FF}/u,
    /\u{1F900}-\u{1F9FF}/u,
    /\u{1FA00}-\u{1FA6F}/u,
    /\u{1FA70}-\u{1FAFF}/u,
    /\u2600-\u26FF/u,
    /\u2700-\u27BF/u,
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
 * 获取适合的字体
 */
function getFontForText(requestedFont, text) {
  const baseFont = validateFont(requestedFont) || getDefaultFontFamily()
  const chain = getFontFallbackChain(requestedFont || baseFont, text)

  if (chain.length === 1) {
    return chain[0]
  }

  return chain.join(', ')
}

/**
 * 手动实现文本自动换行
 */
function wrapText(text, maxWidth, fontSize, font, letterSpacing = 0) {
  if (!maxWidth || maxWidth <= 0) return [text]

  const tempText = new paper.PointText({
    fontSize,
    fontFamily: font,
    letterSpacing: letterSpacing,
  })

  const lines = []
  const paragraphs = text.split('\n')

  for (const paragraph of paragraphs) {
    let currentLine = ''

    // 简单字符分割
    const chars = [...paragraph]

    for (const char of chars) {
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
 */
function addRichText(project, args) {
  const {
    x = 0,
    y = 0,
    width,

    text = '',

    fontSize = 48,
    fontFamily,
    fontWeight,
    fontStyle,
    italic = false,
    bold = false,

    underline = false,
    strikethrough = false,

    color = '#ffffff',
    backgroundColor,
    gradient,

    strokeColor,
    strokeWidth = 1,

    shadow,

    letterSpacing = 0,
    lineSpacing = 0,
    lineHeight,

    align = 'left',

    rotation = 0,
    scale,

    opacity = 1,

    wrap = true,
  } = args

  const font = getFontForText(fontFamily, text)
  const effectiveFontWeight = bold ? 'bold' : (fontWeight || 'normal')
  const effectiveFontStyle = italic ? 'italic' : (fontStyle || 'normal')

  const actualLineHeight = lineHeight || (fontSize + lineSpacing)

  // 文本换行（考虑字母间距）
  let textLines = [text]
  if (wrap && width && width > 0) {
    textLines = wrapText(text, width - 10, fontSize, font, letterSpacing)
  }

  // 创建组
  const group = new paper.Group()

  // 计算每行文本的实际宽度，用于对齐调整
  const lineWidths = textLines.map(line => {
    const measureText = new paper.PointText({
      fontSize,
      fontFamily: font,
      fontWeight: effectiveFontWeight,
      fontStyle: effectiveFontStyle,
      letterSpacing: letterSpacing,
      content: line,
    })
    const w = measureText.bounds.width
    measureText.remove()
    return w
  })

  // 计算对齐后的文本x坐标
  const getTextX = (lineWidth, index) => {
    if (!width || width <= 0) return x

    if (align === 'center') {
      // 居中：文本起点 = x + (width - 文本宽度) / 2
      return x + (width - lineWidth) / 2
    } else if (align === 'right') {
      // 右对齐：文本起点 = x + width - 文本宽度
      return x + width - lineWidth
    }
    // 左对齐：文本起点 = x
    return x
  }

  // 逐行创建文本
  textLines.forEach((lineText, index) => {
    const lineY = y + fontSize + index * actualLineHeight
    const textX = getTextX(lineWidths[index], index)

    const textItem = new paper.PointText({
      point: [textX, lineY],
      content: lineText,
      fontSize,
      fontFamily: font,
      fontWeight: effectiveFontWeight,
      fontStyle: effectiveFontStyle,
      fillColor: new paper.Color(color),
      justification: 'left', // 因为我们已经手动计算了位置
    })

    if (letterSpacing !== 0) {
      textItem.letterSpacing = letterSpacing
    }

    if (underline || strikethrough) {
      textItem.decorations = []
      if (underline) textItem.decorations.push('underline')
      if (strikethrough) textItem.decorations.push('strikethrough')
    }

    if (strokeColor) {
      textItem.strokeColor = new paper.Color(strokeColor)
      textItem.strokeWidth = strokeWidth
    }

    if (shadow) {
      textItem.shadowColor = new paper.Color(shadow.color || '#000000')
      textItem.shadowBlur = shadow.blur || 5
      textItem.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
    }

    if (opacity !== 1) {
      textItem.opacity = opacity
    }

    group.addChild(textItem)
  })

  // 渐变填充
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

    group.children.forEach(child => {
      if (child.fillColor) {
        child.fillColor = null
      }
    })
  }

  // 背景色
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
    } else if (typeof scale === 'object') {
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
