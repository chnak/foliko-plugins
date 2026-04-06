/**
 * 头像组件
 */

const paper = require('paper')

/**
 * 创建头像
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - 圆心X坐标
 * @param {number} args.y - 圆心Y坐标
 * @param {number} args.size - 头像大小
 * @param {string} args.src - 图片路径（可选，不提供则显示首字母）
 * @param {string} args.initials - 首字母（无图片时显示）
 * @param {string} args.background - 背景色
 * @param {string} args.border - 边框颜色
 * @param {number} args.borderWidth - 边框宽度
 * @param {string} args.color - 文字颜色
 */
function createAvatar(project, canvas, args) {
  const {
    x, y,
    size = 80,
    src,
    initials,
    background = '#6366f1',
    border,
    borderWidth = 0,
    color = '#ffffff',
  } = args

  const elements = []
  const radius = size / 2

  // 绘制圆形背景
  const circle = new paper.Path.Circle({
    center: [x, y],
    radius: radius,
  })
  circle.fillColor = new paper.Color(background)

  if (border) {
    circle.strokeColor = new paper.Color(border)
    circle.strokeWidth = borderWidth
  }

  elements.push({ type: 'circle', id: circle.id })

  // 如果没有图片，显示首字母
  if (!src && initials) {
    const text = new paper.PointText({
      point: [x, y + size / 6],
      content: initials.charAt(0).toUpperCase(),
      fontSize: size * 0.4,
      fillColor: new paper.Color(color),
      justification: 'center',
    })
    elements.push({ type: 'text', id: text.id })
  }

  return {
    success: true,
    elements,
    size,
  }
}

module.exports = createAvatar
