/**
 * 时间线组件
 */

const paper = require('paper')

/**
 * 创建时间线
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.width - 总宽度
 * @param {Array} args.items - 时间线项目 [{date, title, description}]
 * @param {string} args.lineColor - 线条颜色
 * @param {string} args.dotColor - 点颜色
 * @param {string} args.activeColor - 激活颜色
 * @param {number} args.dotSize - 点大小
 */
function createTimeline(project, canvas, args) {
  const {
    x, y,
    width = 500,
    items = [],
    lineColor = '#e2e8f0',
    dotColor = '#6366f1',
    activeColor = '#22c55e',
    dotSize = 16,
    gap = 60,
  } = args

  const elements = []
  const centerX = x + 80
  const contentX = x + 120

  // 绘制主线
  if (items.length > 1) {
    const mainLine = new paper.Path.Line({
      from: [centerX, y + dotSize / 2],
      to: [centerX, y + (items.length - 1) * gap + dotSize / 2],
      strokeColor: new paper.Color(lineColor),
      strokeWidth: 2,
    })
    elements.push({ type: 'line', id: mainLine.id })
  }

  // 绘制每个项目
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const itemY = y + i * gap
    const isActive = item.active !== false

    // 绘制时间线点
    const dot = new paper.Path.Circle({
      center: [centerX, itemY + dotSize / 2],
      radius: dotSize / 2,
    })
    dot.fillColor = new paper.Color(isActive ? dotColor : lineColor)
    elements.push({ type: 'circle', id: dot.id })

    // 绘制日期
    if (item.date) {
      const dateText = new paper.PointText({
        point: [x + 10, itemY + dotSize / 2 + 5],
        content: item.date,
        fontSize: 12,
        fillColor: new paper.Color('#94a3b8'),
        justification: 'left',
      })
      elements.push({ type: 'text', id: dateText.id })
    }

    // 绘制标题
    const titleText = new paper.PointText({
      point: [contentX, itemY + dotSize / 2 + 5],
      content: item.title || `Event ${i + 1}`,
      fontSize: 16,
      fillColor: new paper.Color(isActive ? '#1e293b' : '#94a3b8'),
      justification: 'left',
    })
    elements.push({ type: 'text', id: titleText.id })

    // 绘制描述
    if (item.description) {
      const descText = new paper.PointText({
        point: [contentX, itemY + dotSize / 2 + 28],
        content: item.description,
        fontSize: 13,
        fillColor: new paper.Color('#64748b'),
        justification: 'left',
      })
      elements.push({ type: 'text', id: descText.id })
    }
  }

  return {
    success: true,
    elements,
    height: items.length * gap,
  }
}

module.exports = createTimeline
