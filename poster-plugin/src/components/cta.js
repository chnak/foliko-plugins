/**
 * CTA（行动号召）按钮组件
 */

const paper = require('paper')

/**
 * 创建 CTA 按钮
 */
function createCTA(project, canvas, args) {
  const {
    x = 0, y = 0,
    text = '',
    background = '#007bff',
    color = '#ffffff',
    border,
    fontSize = 20,
    padding = 25,
    radius = 8,
    shadow,
    width: customWidth,
  } = args

  const elements = []

  // 确保 text 是字符串
  const textStr = String(text || '')
  // 使用更准确的字符宽度估算：中文约1.0，英文约0.5
  const chineseChars = (textStr.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherChars = textStr.length - chineseChars
  const textWidth = chineseChars * fontSize * 1.0 + otherChars * fontSize * 0.5
  const btnWidth = customWidth || (textWidth + padding * 2)
  const btnHeight = fontSize + padding * 2

  const btnX = x - btnWidth / 2

  // 绘制按钮背景
  const button = new paper.Path.Rectangle({
    point: [btnX, y],
    size: [btnWidth, btnHeight],
    radius: radius,
  })
  button.fillColor = new paper.Color(background)

  if (border) {
    button.strokeColor = new paper.Color(border)
    button.strokeWidth = 1
  }

  if (shadow && typeof shadow === 'object') {
    try {
      if (shadow.color) button.shadowColor = new paper.Color(shadow.color)
      button.shadowBlur = shadow.blur || 10
      button.shadowOffset = new paper.Point(shadow.offsetX || 0, shadow.offsetY || 4)
    } catch (e) {
      // 忽略阴影错误
    }
  }

  if (project && project.activeLayer) {
    project.activeLayer.addChild(button)
  }
  elements.push({ type: 'rectangle', id: button.id })

  // 绘制文字
  const buttonText = new paper.PointText({
    point: [x, y + btnHeight / 2 + fontSize / 3],
    content: textStr,
    fontSize: fontSize,
    fillColor: new paper.Color(color),
    justification: 'center',
  })
  if (project && project.activeLayer) {
    project.activeLayer.addChild(buttonText)
  }
  elements.push({ type: 'text', id: buttonText.id })

  return {
    success: true,
    elements,
    width: btnWidth,
    height: btnHeight,
    type: 'cta',
  }
}

module.exports = createCTA
