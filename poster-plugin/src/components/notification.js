/**
 * 通知/提示组件
 */

const paper = require('paper')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建通知提示
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.width - 宽度
 * @param {string} args.type - 类型: success, warning, error, info
 * @param {string} args.title - 标题
 * @param {string} args.message - 消息内容
 * @param {boolean} args.showIcon - 是否显示图标
 * @param {number} args.radius - 圆角半径
 */
function createNotification(project, canvas, args) {
  const {
    x, y,
    width = 360,
    type = 'info',
    title,
    message,
    showIcon = true,
    radius = 12,
    fontFamily,
  } = args

  // 获取字体回退链
  const notifFont = getFontFallbackChain(fontFamily, (title || '') + (message || '')).join(', ')

  // 类型配置
  const config = {
    success: {
      icon: '✓',
      bgColor: '#dcfce7',
      iconColor: '#22c55e',
      borderColor: '#22c55e',
    },
    warning: {
      icon: '⚠',
      bgColor: '#fef9c3',
      iconColor: '#eab308',
      borderColor: '#eab308',
    },
    error: {
      icon: '✕',
      bgColor: '#fee2e2',
      iconColor: '#ef4444',
      borderColor: '#ef4444',
    },
    info: {
      icon: 'ℹ',
      bgColor: '#dbeafe',
      iconColor: '#3b82f6',
      borderColor: '#3b82f6',
    },
  }

  const c = config[type] || config.info
  const padding = 16
  const lineHeight = 22
  const iconSize = 24
  const height = padding * 2 + (title ? lineHeight + 8 : 0) + (message ? lineHeight : 0)

  const elements = []

  // 绘制背景
  const bg = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius,
  })
  bg.fillColor = new paper.Color(c.bgColor)
  bg.strokeColor = new paper.Color(c.borderColor)
  bg.strokeWidth = 1
  elements.push({ type: 'rectangle', id: bg.id })

  // 绘制图标
  if (showIcon) {
    const iconText = new paper.PointText({
      point: [x + padding + iconSize / 2, y + padding + iconSize / 2 + 6],
      content: c.icon,
      fontSize: iconSize,
      fontFamily: notifFont,
      fillColor: new paper.Color(c.iconColor),
      justification: 'center',
    })
    elements.push({ type: 'text', id: iconText.id })
  }

  const textX = showIcon ? x + padding + iconSize + 12 : x + padding
  let currentY = y + padding

  // 绘制标题
  if (title) {
    const titleText = new paper.PointText({
      point: [textX, currentY + 18],
      content: title,
      fontSize: 16,
      fontFamily: notifFont,
      fillColor: new paper.Color('#1e293b'),
      justification: 'left',
    })
    elements.push({ type: 'text', id: titleText.id })
    currentY += lineHeight + 8
  }

  // 绘制消息
  if (message) {
    const msgText = new paper.PointText({
      point: [textX, currentY + 16],
      content: message,
      fontSize: 14,
      fontFamily: notifFont,
      fillColor: new paper.Color('#475569'),
      justification: 'left',
    })
    elements.push({ type: 'text', id: msgText.id })
  }

  return { success: true, elements }
}

module.exports = createNotification
