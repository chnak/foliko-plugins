/**
 * 按钮组件
 */

const paper = require('paper')
const { loadImageAsRaster } = require('../utils/imageLoader')

/**
 * 创建按钮
 */
async function createButton(project, args) {
  const {
    x = 0,
    y = 0,
    width = 200,
    height = 60,
    text = '按钮',
    fontSize = 24,
    fontFamily,
    color = '#ffffff',
    backgroundColor = '#3b82f6',
    borderColor,
    borderWidth = 0,
    radius = 8,
    shadow,
    gradient,
    icon,
    iconPosition = 'left',
    opacity = 1,
  } = args

  // 创建按钮背景
  const bgOptions = {
    point: [x, y],
    size: [width, height],
    radius: radius,
  }

  if (borderColor) {
    bgOptions.strokeColor = new paper.Color(borderColor)
    bgOptions.strokeWidth = borderWidth
  }

  const bg = new paper.Path.Rectangle(bgOptions)

  // 渐变或纯色填充
  if (gradient && gradient.colors && gradient.colors.length > 0) {
    const colors = gradient.colors.map(c => new paper.Color(c))
    bg.fillColor = new paper.Color({
      gradient: { stops: colors },
      origin: bg.bounds.topLeft,
      destination: bg.bounds.bottomLeft,
    })
  } else {
    bg.fillColor = new paper.Color(backgroundColor)
  }

  // 阴影
  if (shadow) {
    bg.shadowColor = new paper.Color(shadow.color || '#000000')
    bg.shadowBlur = shadow.blur || 10
    bg.shadowOffset = new paper.Point(shadow.offsetX || 0, shadow.offsetY || 4)
  }

  if (opacity !== 1) {
    bg.opacity = opacity
  }

  const items = [bg]
  let textX = x + width / 2

  // 添加图标
  if (icon) {
    const iconSize = Math.min(height * 0.5, 40)
    const iconX = iconPosition === 'left' ? x + 20 : x + width - 40 - iconSize

    if (icon.startsWith('http') || icon.startsWith('data:')) {
      // URL图片图标
      const { raster } = await loadImageAsRaster(project, icon, {
        x: iconX,
        y: y + (height - iconSize) / 2,
        width: iconSize,
        height: iconSize
      }, opacity)
      items.push(raster)
    } else {
      // Emoji 或文本图标
      const iconText = new paper.PointText({
        point: [iconX + iconSize / 2, y + height / 2 + fontSize / 3],
        content: icon,
        fontSize: iconSize,
        justification: 'center',
      })
      if (opacity !== 1) iconText.opacity = opacity
      items.push(iconText)
    }

    textX = iconPosition === 'left' ? x + width / 2 + 25 : x + width / 2 - 25
  }

  // 添加文字
  const textItem = new paper.PointText({
    point: [textX, y + height / 2 + fontSize / 3],
    content: text,
    fontSize,
    fontFamily: fontFamily || 'sans-serif',
    fillColor: new paper.Color(color),
    justification: 'center',
  })

  if (opacity !== 1) {
    textItem.opacity = opacity
  }

  items.push(textItem)

  return {
    success: true,
    type: 'button',
    items: items.map(i => i.id),
  }
}

module.exports = createButton
