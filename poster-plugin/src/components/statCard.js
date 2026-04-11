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

  // 绘制图标
  if (icon) {
    const iconText = new paper.PointText({
      point: [x + 20, y + 35],
      content: icon,
      fontSize: 24,
      fontFamily: statFont,
      fillColor: new paper.Color(iconColor),
      justification: 'left',
    })
    elements.push({ type: 'text', id: iconText.id })
  }

  // 绘制标签
  const labelText = new paper.PointText({
    point: [x + 20, y + 50 + (icon ? 10 : 0)],
    content: label,
    fontSize: 14,
    fontFamily: statFont,
    fillColor: new paper.Color('#64748b'),
    justification: 'left',
  })
  elements.push({ type: 'text', id: labelText.id })

  // 绘制数值
  const valueText = new paper.PointText({
    point: [x + 20, y + 75 + (icon ? 10 : 0)],
    content: value,
    fontSize: 28,
    fontFamily: statFont,
    fillColor: new paper.Color('#1e293b'),
    justification: 'left',
  })
  elements.push({ type: 'text', id: valueText.id })

  // 绘制变化值
  if (change) {
    const changeColor = positive ? '#22c55e' : '#ef4444'
    const changeIcon = positive ? '↑' : '↓'
    const changeText = new paper.PointText({
      point: [x + 20, y + 95 + (icon ? 10 : 0)],
      content: `${changeIcon} ${change}`,
      fontSize: 14,
      fontFamily: statFont,
      fillColor: new paper.Color(changeColor),
      justification: 'left',
    })
    elements.push({ type: 'text', id: changeText.id })
  }

  return { success: true, elements }
}

module.exports = createStatCard
