/**
 * Chip 标签组件
 */

const paper = require('paper')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建 Chip 标签组件
 */
function createChip(project, canvas, params) {
  const {
    x,
    y,
    text,
    background = '#e0e0e0',
    color = '#333333',
    borderColor,
    fontSize = 12,
    padding = 12,
    radius = 16,
    icon,
    fontFamily,
  } = params

  const elements = []

  // 获取字体回退链
  const chipFont = getFontFallbackChain(fontFamily, text).join(', ')

  // 计算尺寸
  const textWidth = text.length * fontSize * 0.6
  const iconWidth = icon ? fontSize : 0
  const totalWidth = padding * 2 + textWidth + iconWidth + 4
  const height = fontSize + padding * 2
  const rectX = x - totalWidth / 2
  const rectY = y - height / 2

  // 绘制背景
  const bg = new paper.Path.Rectangle({
    point: [rectX, rectY],
    size: [totalWidth, height],
    radius: radius
  })
  bg.fillColor = new paper.Color(background)
  if (borderColor) {
    bg.strokeColor = new paper.Color(borderColor)
    bg.strokeWidth = 1
  }
  if (project && project.activeLayer) {
    project.activeLayer.addChild(bg)
  }
  elements.push({ type: 'path', id: bg.id })

  // 绘制图标
  if (icon) {
    const iconText = new paper.PointText({
      point: [rectX + padding + iconWidth / 2, y + fontSize / 3],
      content: icon,
      fontSize: fontSize + 2,
      fontFamily: chipFont,
      fillColor: new paper.Color(color),
      justification: 'center'
    })
    if (project && project.activeLayer) {
      project.activeLayer.addChild(iconText)
    }
    elements.push({ type: 'text', id: iconText.id })
  }

  // 绘制文字
  const textX = icon ? rectX + padding + iconWidth + 4 + textWidth / 2 : x
  const label = new paper.PointText({
    point: [textX, y + fontSize / 3],
    content: text,
    fontSize: fontSize,
    fontFamily: chipFont,
    fillColor: new paper.Color(color),
    justification: 'center'
  })
  if (project && project.activeLayer) {
    project.activeLayer.addChild(label)
  }
  elements.push({ type: 'text', id: label.id })

  return {
    success: true,
    elements,
    width: totalWidth,
    height,
    type: 'chip'
  }
}

module.exports = createChip
