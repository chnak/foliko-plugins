/**
 * 水印组件
 */

const paper = require('paper')

/**
 * 创建水印组件
 */
function createWatermark(project, canvas, params) {
  const {
    text,
    cx,
    cy,
    color = 'rgba(0,0,0,0.1)',
    fontSize = 48,
    fontFamily = 'sans-serif',
    opacity = 0.1,
    rotation = 0,
    align = 'center'
  } = params

  const elements = []

  const label = new paper.PointText({
    point: [cx, cy],
    content: text,
    fontSize: fontSize,
    fontFamily: fontFamily,
    fillColor: new paper.Color(color),
    justification: align,
    opacity: opacity
  })

  // 应用旋转
  if (rotation !== 0) {
    label.rotate(rotation, new paper.Point(cx, cy))
  }

  if (project && project.activeLayer) {
    project.activeLayer.addChild(label)
  }
  elements.push({ type: 'text', id: label.id })

  return {
    success: true,
    elements,
    type: 'watermark'
  }
}

module.exports = createWatermark
