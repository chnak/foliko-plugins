/**
 * 富文本组件 - 支持旋转和多种文本样式
 */

const paper = require('paper')
const { validateFont, getDefaultFont, getRegisteredFonts } = require('../fonts')

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
  const baseFont = validateFont(requestedFont) || getDefaultFont()
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

  // 创建文本项
  const textItem = new paper.PointText({
    point: [x, y + fontSize],
    content: text,
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

  // 行高
  if (lineHeight) {
    textItem.leading = lineHeight
  } else if (lineSpacing !== 0) {
    textItem.leading = fontSize + lineSpacing
  }

  // 下划线和删除线 - 使用字符样式
  if (underline || strikethrough) {
    textItem.decorations = []
    if (underline) textItem.decorations.push('underline')
    if (strikethrough) textItem.decorations.push('strikethrough')
  }

  // 渐变填充
  if (gradient && gradient.colors && gradient.colors.length > 0) {
    const colors = gradient.colors.map(c => new paper.Color(c))
    const bounds = textItem.bounds
    if (gradient.direction !== undefined) {
      // 自定义方向
      const angle = gradient.direction * Math.PI / 180
      const diagonal = Math.sqrt(bounds.width ** 2 + bounds.height ** 2)
      textItem.fillColor = new paper.Color({
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
      // 水平渐变
      textItem.fillColor = new paper.Color({
        gradient: { stops: colors },
        origin: bounds.topLeft,
        destination: bounds.topRight,
      })
    }
  }

  // 背景色 - 创建背景矩形
  let bgRect = null
  if (backgroundColor) {
    const padding = 10
    bgRect = new paper.Path.Rectangle({
      point: [textItem.bounds.left - padding, textItem.bounds.top - padding],
      size: [textItem.bounds.width + padding * 2, textItem.bounds.height + padding * 2],
      fillColor: new paper.Color(backgroundColor),
      radius: 4,
    })
    bgRect.sendToBack()
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
    if (bgRect) bgRect.opacity = opacity
  }

  // 旋转
  if (rotation !== 0) {
    textItem.rotate(rotation, new paper.Point(x, y + fontSize))
    if (bgRect) bgRect.rotate(rotation, bgRect.bounds.center)
  }

  // 缩放
  if (scale !== undefined) {
    if (typeof scale === 'number') {
      textItem.scale(scale, scale, new paper.Point(x, y + fontSize))
      if (bgRect) bgRect.scale(scale, scale, bgRect.bounds.center)
    } else if (typeof scale === 'object' && (scale.x !== undefined || scale.y !== undefined)) {
      const sx = scale.x || 1
      const sy = scale.y || sx
      textItem.scale(sx, sy, new paper.Point(x, y + fontSize))
      if (bgRect) bgRect.scale(sx, sy, bgRect.bounds.center)
    }
  }

  return {
    success: true,
    id: textItem.id,
    type: 'richText',
    bounds: {
      x: textItem.bounds.x,
      y: textItem.bounds.y,
      width: textItem.bounds.width,
      height: textItem.bounds.height,
    }
  }
}

module.exports = addRichText
