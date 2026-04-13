/**
 * 统计卡片组件
 */

const paper = require('paper')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建统计卡片
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.width - 宽度
 * @param {number} args.height - 高度
 * @param {string} args.label - 标签
 * @param {string} args.value - 数值
 * @param {string} args.change - 变化值（如 "+12.5%"）
 * @param {boolean} args.positive - 变化是否为正
 * @param {string} args.icon - 图标
 * @param {string} args.iconColor - 图标颜色
 * @param {string} args.background - 背景色
 * @param {string} args.border - 边框颜色
 * @param {number} args.radius - 圆角半径
 */
function createStatCard(project, canvas, args) {
  const {
    x, y,
    width = 200,
    height = 120,
    label = 'Total Users',
    value = '10,000',
    change,
    positive = true,
    icon,
    iconColor = '#6366f1',
    background = '#ffffff',
    border = '#e5e7eb',
    radius = 12,
    fontFamily,
  } = args

  const elements = []

  // 获取字体回退链
  const statFont = getFontFallbackChain(fontFamily, (label || '') + (value || '')).join(', ')

  // 计算内边距（根据卡片尺寸自适应）
  const paddingX = Math.max(16, width * 0.08)
  const contentWidth = width - paddingX * 2

  // 绘制背景
  const bg = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius,
  })
  bg.fillColor = new paper.Color(background)
  bg.strokeColor = new paper.Color(border)
  bg.strokeWidth = 1
  elements.push({ type: 'rectangle', id: bg.id })

  // 动态计算内容布局
  const hasIcon = !!icon
  const hasChange = !!change
  const iconSize = Math.min(24, height * 0.2)
  const valueSize = Math.min(28, height * 0.23)
  const labelSize = Math.min(14, height * 0.12)
  const changeSize = Math.min(14, height * 0.12)

  // 计算内容总高度
  let totalContentHeight = labelSize + valueSize
  if (hasIcon) totalContentHeight += iconSize * 0.5
  if (hasChange) totalContentHeight += changeSize

  // 计算起始Y（垂直居中）
  let currentY = y + (height - totalContentHeight) / 2

  // 绘制图标
  if (icon) {
    const iconY = currentY + iconSize * 0.7
    const iconText = new paper.PointText({
      point: [x + paddingX, iconY],
      content: icon,
      fontSize: iconSize,
      fontFamily: statFont,
      fillColor: new paper.Color(iconColor),
      justification: 'left',
    })
    elements.push({ type: 'text', id: iconText.id })
    currentY += iconSize * 0.5
  }

  // 绘制标签
  const labelY = currentY + labelSize * 0.9
  const labelText = new paper.PointText({
    point: [x + paddingX, labelY],
    content: label,
    fontSize: labelSize,
    fontFamily: statFont,
    fillColor: new paper.Color('#64748b'),
    justification: 'left',
  })
  elements.push({ type: 'text', id: labelText.id })
  currentY += labelSize * 1.3

  // 绘制数值
  const valueY = currentY + valueSize * 0.9
  const valueText = new paper.PointText({
    point: [x + paddingX, valueY],
    content: value,
    fontSize: valueSize,
    fontFamily: statFont,
    fillColor: new paper.Color('#1e293b'),
    justification: 'left',
  })
  elements.push({ type: 'text', id: valueText.id })

  // 绘制变化值
  if (change) {
    const changeY = currentY + valueSize + changeSize * 1.2
    const changeColor = positive ? '#22c55e' : '#ef4444'
    const changeIcon = positive ? '↑' : '↓'
    const changeText = new paper.PointText({
      point: [x + paddingX, changeY],
      content: `${changeIcon} ${change}`,
      fontSize: changeSize,
      fontFamily: statFont,
      fillColor: new paper.Color(changeColor),
      justification: 'left',
    })
    elements.push({ type: 'text', id: changeText.id })
  }

  return { success: true, elements }
}

module.exports = createStatCard
