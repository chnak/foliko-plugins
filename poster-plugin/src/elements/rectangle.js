/**
 * 矩形元素
 */

const paper = require('paper')

/**
 * 添加矩形
 */
function addRectangle(project, args) {
  const {
    x, y, width, height,
    fill, stroke, strokeWidth, radius, opacity,
  } = args

  const rect = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius || 0,
  })

  if (fill) rect.fillColor = new paper.Color(fill)
  if (stroke) {
    rect.strokeColor = new paper.Color(stroke)
    rect.strokeWidth = strokeWidth || 1
  }
  if (opacity !== undefined) rect.opacity = opacity

  return { success: true, id: rect.id, type: 'rectangle' }
}

module.exports = addRectangle
