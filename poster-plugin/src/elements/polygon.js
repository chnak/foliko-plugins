/**
 * 多边形元素
 */

const paper = require('paper')

/**
 * 添加多边形
 */
function addPolygon(project, args) {
  const {
    cx, cy, radius, sides,
    fill, stroke, strokeWidth, opacity,
  } = args

  const polygon = new paper.Path.RegularPolygon({
    center: [cx, cy],
    radius: radius,
    sides: sides,
  })

  if (fill) polygon.fillColor = new paper.Color(fill)
  if (stroke) {
    polygon.strokeColor = new paper.Color(stroke)
    polygon.strokeWidth = strokeWidth || 1
  }
  if (opacity !== undefined) polygon.opacity = opacity

  return { success: true, id: polygon.id, type: 'polygon' }
}

module.exports = addPolygon
