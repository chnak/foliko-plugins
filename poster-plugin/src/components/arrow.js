/**
 * 箭头组件
 */

const paper = require('paper')

/**
 * 创建箭头组件
 */
function createArrow(project, canvas, params) {
  const {
    x1, y1, x2, y2,
    color = '#333333',
    strokeWidth = 2,
    headSize = 12,
    style = 'solid',
    direction = 'end'
  } = params

  const elements = []

  // 创建主线
  const line = new paper.Path.Line({
    from: [x1, y1],
    to: [x2, y2]
  })
  line.strokeColor = new paper.Color(color)
  line.strokeWidth = strokeWidth
  if (style === 'dashed') {
    line.dashArray = [10, 5]
  }
  
  if (project && project.activeLayer) {
    project.activeLayer.addChild(line)
  }
  elements.push({ type: 'line', id: line.id })

  // 创建箭头头部
  function createArrowHead(x, y, angle) {
    const path = new paper.Path()
    const angle1 = angle + Math.PI * 0.8
    const angle2 = angle - Math.PI * 0.8

    path.moveTo(x, y)
    path.lineTo(
      x + headSize * Math.cos(angle1),
      y + headSize * Math.sin(angle1)
    )
    path.moveTo(x, y)
    path.lineTo(
      x + headSize * Math.cos(angle2),
      y + headSize * Math.sin(angle2)
    )

    path.strokeColor = new paper.Color(color)
    path.strokeWidth = strokeWidth
    path.strokeCap = 'round'

    if (project && project.activeLayer) {
      project.activeLayer.addChild(path)
    }
    return path
  }

  const angle = Math.atan2(y2 - y1, x2 - x1)

  if (direction === 'end' || direction === 'both') {
    const head = createArrowHead(x2, y2, angle)
    elements.push({ type: 'path', id: head.id })
  }

  if (direction === 'start' || direction === 'both') {
    const head = createArrowHead(x1, y1, angle + Math.PI)
    elements.push({ type: 'path', id: head.id })
  }

  return {
    success: true,
    elements,
    type: 'arrow'
  }
}

module.exports = createArrow
