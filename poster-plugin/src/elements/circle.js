/**
 * 圆形/椭圆元素
 */

const paper = require('paper')

/**
 * 添加圆形或椭圆
 */
function addCircle(project, args) {
  const {
    cx, cy, rx, ry,
    fill, stroke, strokeWidth, opacity,
  } = args

  const circle = new paper.Path.Ellipse({
    center: [cx, cy],
    radius: [rx, ry || rx],
  })

  if (fill) circle.fillColor = new paper.Color(fill)
  if (stroke) {
    circle.strokeColor = new paper.Color(stroke)
    circle.strokeWidth = strokeWidth || 1
  }
  if (opacity !== undefined) circle.opacity = opacity

  return { success: true, id: circle.id, type: 'circle' }
}

module.exports = addCircle
