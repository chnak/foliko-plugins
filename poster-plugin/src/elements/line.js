/**
 * 线条元素
 */

const paper = require('paper')

/**
 * 添加线条
 */
function addLine(project, args) {
  const { x1, y1, x2, y2, stroke, strokeWidth } = args

  const line = new paper.Path.Line({
    from: [x1, y1],
    to: [x2, y2],
    strokeColor: new paper.Color(stroke || '#ffffff'),
    strokeWidth: strokeWidth || 2,
  })

  return { success: true, id: line.id, type: 'line' }
}

module.exports = addLine
