/**
 * 星形组件 - 支持多角星形
 */

const paper = require('paper')

/**
 * 创建星形组件
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} params - 组件参数
 */
function createStar(project, canvas, params) {
  const {
    cx,
    cy,
    points = 5,
    innerRadius,
    outerRadius,
    fill,
    stroke,
    strokeWidth = 1,
    opacity = 1,
    rotation = 0
  } = params

  // 计算内半径
  const actualInnerRadius = innerRadius || outerRadius * 0.4

  // 创建星形路径
  const path = new paper.Path()
  const angleStep = Math.PI / points

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : actualInnerRadius
    const angle = i * angleStep - Math.PI / 2 + (rotation * Math.PI / 180)
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)

    if (i === 0) {
      path.moveTo(x, y)
    } else {
      path.lineTo(x, y)
    }
  }
  path.closePath()

  // 设置样式
  if (fill) {
    path.fillColor = new paper.Color(fill)
  }
  if (stroke) {
    path.strokeColor = new paper.Color(stroke)
    path.strokeWidth = strokeWidth
  }
  path.opacity = opacity

  // 关键：将元素添加到活动层
  if (project && project.activeLayer) {
    project.activeLayer.addChild(path)
  }

  return {
    success: true,
    elements: [{ type: 'path', id: path.id }],
    type: 'star'
  }
}

module.exports = createStar
