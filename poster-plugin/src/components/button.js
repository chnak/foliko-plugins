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
    width: customWidth,  // 重命名为 customWidth
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
    padding = 30,  // 内边距
  } = args

  // 使用字符数估算文本宽度（参考 CTA 组件的方式）
  const textStr = String(text || '')
  const chineseChars = (textStr.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherChars = textStr.length - chineseChars
  // 中文约1.0倍，英文/数字约0.5倍字体大小
  const textWidth = chineseChars * fontSize * 1.0 + otherChars * fontSize * 0.5

  // 图标宽度
  const iconWidth = icon ? Math.min(height * 0.5, fontSize) + 8 : 0

  // 计算最终宽度：如果没有指定宽度，则根据内容计算
  const finalWidth = customWidth || (textWidth + padding * 2 + iconWidth)

  // 创建按钮背景
  const bg = new paper.Path.Rectangle({
    point: [x, y],
    size: [finalWidth, height],
    radius: radius,
  })

  // 边框
  if (borderColor) {
    bg.strokeColor = new paper.Color(borderColor)
    bg.strokeWidth = borderWidth
  }

  // 渐变或纯色填充
  if (gradient && gradient.colors && gradient.colors.length > 1) {
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
  if (shadow && typeof shadow === 'object') {
    try {
      if (shadow.color) bg.shadowColor = new paper.Color(shadow.color)
      bg.shadowBlur = shadow.blur || 10
      bg.shadowOffset = new paper.Point(shadow.offsetX || 0, shadow.offsetY || 4)
    } catch (e) {
      // 忽略阴影错误
    }
  }

  if (opacity !== 1) {
    bg.opacity = opacity
  }

  if (project && project.activeLayer) {
    project.activeLayer.addChild(bg)
  }

  const elements = [{ type: 'rectangle', id: bg.id }]

  // 文字居中 x 坐标
  const textX = x + finalWidth / 2

  // 添加图标
  if (icon) {
    const iconSize = Math.min(height * 0.5, fontSize)
    const iconY = y + height / 2 + iconSize / 3

    if (icon.startsWith('http') || icon.startsWith('data:')) {
      // URL图片图标
      const iconX = iconPosition === 'left' 
        ? x + padding 
        : x + finalWidth - padding - iconSize
      
      const { raster } = await loadImageAsRaster(project, icon, {
        x: iconX,
        y: y + (height - iconSize) / 2,
        width: iconSize,
        height: iconSize
      }, opacity)
      
      if (project && project.activeLayer) {
        project.activeLayer.addChild(raster)
      }
      elements.push({ type: 'raster', id: raster.id })
    } else {
      // Emoji 或文本图标
      const iconX = iconPosition === 'left' 
        ? x + padding + iconSize / 2 
        : x + finalWidth - padding - iconSize / 2
      
      const iconText = new paper.PointText({
        point: [iconX, iconY],
        content: icon,
        fontSize: iconSize,
        justification: 'center',
      })
      if (opacity !== 1) iconText.opacity = opacity
      
      if (project && project.activeLayer) {
        project.activeLayer.addChild(iconText)
      }
      elements.push({ type: 'text', id: iconText.id })
    }
  }

  // 添加文字
  const textY = y + height / 2 + fontSize / 3
  const buttonText = new paper.PointText({
    point: [textX, textY],
    content: textStr,
    fontSize: fontSize,
    fontFamily: fontFamily || 'sans-serif',
    fillColor: new paper.Color(color),
    justification: 'center',
  })

  if (opacity !== 1) {
    buttonText.opacity = opacity
  }

  if (project && project.activeLayer) {
    project.activeLayer.addChild(buttonText)
  }
  elements.push({ type: 'text', id: buttonText.id })

  return {
    success: true,
    type: 'button',
    elements,
    width: finalWidth,
    height: height,
  }
}

module.exports = createButton
