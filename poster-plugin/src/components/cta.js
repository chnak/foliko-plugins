/**
 * CTA（行动号召）按钮组件
 */

const paper = require('paper')

/**
 * 创建 CTA 按钮
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标（居中）
 * @param {number} args.y - Y坐标
 * @param {string} args.text - 按钮文字
 * @param {string} args.background - 背景色
 * @param {string} args.color - 文字颜色
 * @param {string} args.border - 边框颜色
 * @param {number} args.fontSize - 字体大小
 * @param {number} args.padding - 内边距
 * @param {number} args.radius - 圆角半径
 * @param {Object} args.shadow - 阴影设置
 */
function createCTA(project, canvas, args) {
  const {
    x, y,
    text,
    background = '#007bff',
    color = '#ffffff',
    border,
    fontSize = 20,
    padding = 25,
    radius = 8,
    shadow,
  } = args

  const elements = []

  // 计算按钮尺寸
  const textWidth = text.length * fontSize * 0.7
  const btnWidth = textWidth + padding * 2
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

  if (shadow) {
    button.shadowColor = new paper.Color(shadow.color || 'rgba(0,0,0,0.3)')
    button.shadowBlur = shadow.blur || 10
    button.shadowOffset = new paper.Point(shadow.offsetX || 0, shadow.offsetY || 4)
  }

  elements.push({ type: 'rectangle', id: button.id })

  // 绘制文字
  const buttonText = new paper.PointText({
    point: [x, y + btnHeight / 2 + fontSize / 3],
    content: text,
    fontSize: fontSize,
    fillColor: new paper.Color(color),
    justification: 'center',
  })
  elements.push({ type: 'text', id: buttonText.id })

  return {
    success: true,
    elements,
    width: btnWidth,
    height: btnHeight,
  }
}

module.exports = createCTA
