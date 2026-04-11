/**
 * 时间线组件
 */

const paper = require('paper')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建时间线
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
    fontFamily,
  } = args

  const elements = []

  // 获取字体回退链
  const timelineFont = getFontFallbackChain(fontFamily, items.map(i => (i.date || '') + (i.title || '') + (i.description || '')).join('')).join(', ')

  // 确保 items 是数组
  if (!Array.isArray(items) || items.length === 0) {
    return { success: true, elements, height: 0, type: 'timeline' }
  }

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
    if (project && project.activeLayer) {
      project.activeLayer.addChild(mainLine)
    }
    elements.push({ type: 'line', id: mainLine.id })
  }

  // 绘制每个项目
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item) continue

    const itemY = y + i * gap
    const isActive = item.active !== false

    // 绘制时间线点
    const dot = new paper.Path.Circle({
      center: [centerX, itemY + dotSize / 2],
      radius: dotSize / 2,
    })
    dot.fillColor = new paper.Color(isActive ? dotColor : lineColor)
    if (project && project.activeLayer) {
      project.activeLayer.addChild(dot)
    }
    elements.push({ type: 'circle', id: dot.id })

    // 绘制日期
    if (item.date) {
      const dateText = new paper.PointText({
        point: [x + 10, itemY + dotSize / 2 + 5],
        content: item.date,
        fontSize: 12,
        fontFamily: timelineFont,
        fillColor: new paper.Color('#94a3b8'),
        justification: 'left',
      })
      if (project && project.activeLayer) {
        project.activeLayer.addChild(dateText)
      }
      elements.push({ type: 'text', id: dateText.id })
    }

    // 绘制标题
    const titleText = new paper.PointText({
      point: [contentX, itemY + dotSize / 2 + 5],
      content: item.title || `Event ${i + 1}`,
      fontSize: 16,
      fontFamily: timelineFont,
      fillColor: new paper.Color(isActive ? '#1e293b' : '#94a3b8'),
      justification: 'left',
    })
    if (project && project.activeLayer) {
      project.activeLayer.addChild(titleText)
    }
    elements.push({ type: 'text', id: titleText.id })

    // 绘制描述
    if (item.description) {
      const descText = new paper.PointText({
        point: [contentX, itemY + dotSize / 2 + 28],
        content: item.description,
        fontSize: 13,
        fontFamily: timelineFont,
        fillColor: new paper.Color('#64748b'),
        justification: 'left',
      })
      if (project && project.activeLayer) {
        project.activeLayer.addChild(descText)
      }
      elements.push({ type: 'text', id: descText.id })
    }
  }

  return {
    success: true,
    elements,
    height: items.length * gap,
    type: 'timeline',
  }
}

module.exports = createTimeline
