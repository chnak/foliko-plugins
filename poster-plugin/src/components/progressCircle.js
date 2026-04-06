/**
 * 环形进度条组件
 */

const paper = require('paper')

/**
 * 创建环形进度条组件
 */
function createProgressCircle(project, canvas, params) {
  const {
    cx,
    cy,
    radius,
    value,
    strokeWidth = 10,
    trackColor = '#e5e7eb',
    fillColor = '#3b82f6',
    backgroundColor,
    showLabel = true,
    labelColor,
    startAngle = -90
  } = params

  const elements = []

  // 绘制背景圆（可选）
  if (backgroundColor) {
    const bgCircle = new paper.Path.Circle({
      center: [cx, cy],
      radius: radius + strokeWidth / 2
    })
    bgCircle.fillColor = new paper.Color(backgroundColor)
    if (project && project.activeLayer) {
      project.activeLayer.addChild(bgCircle)
    }
    elements.push({ type: 'path', id: bgCircle.id })
  }

  // 绘制轨道（背景环）
  const trackCircle = new paper.Path.Circle({
    center: [cx, cy],
    radius: radius
  })
  trackCircle.fillColor = null
  trackCircle.strokeColor = new paper.Color(trackColor)
  trackCircle.strokeWidth = strokeWidth
  if (project && project.activeLayer) {
    project.activeLayer.addChild(trackCircle)
  }
  elements.push({ type: 'path', id: trackCircle.id })

  // 绘制进度弧线
  if (value > 0 && value <= 100) {
    const percentage = value / 100
    const arcAngle = percentage * 360
    
    // 转换为弧度
    const startRad = startAngle * Math.PI / 180
    const endRad = (startAngle + arcAngle) * Math.PI / 180

    // 创建进度弧线路径
    const progressArc = new paper.Path()
    
    // 添加起点
    progressArc.moveTo(
      cx + radius * Math.cos(startRad),
      cy + radius * Math.sin(startRad)
    )
    
    // 添加弧线上的点（用多个点模拟圆弧）
    const segments = 36
    const angleStep = (endRad - startRad) / segments
    for (let i = 1; i <= segments; i++) {
      const angle = startRad + angleStep * i
      progressArc.lineTo(
        cx + radius * Math.cos(angle),
        cy + radius * Math.sin(angle)
      )
    }

    progressArc.strokeColor = new paper.Color(fillColor)
    progressArc.strokeWidth = strokeWidth
    progressArc.strokeCap = 'round'

    if (project && project.activeLayer) {
      project.activeLayer.addChild(progressArc)
    }
    elements.push({ type: 'path', id: progressArc.id })
  }

  // 绘制标签文字
  if (showLabel) {
    const textColor = labelColor || fillColor
    const fontSize = Math.min(Math.max(Math.round(radius * 0.35), 12), 48)
    const label = new paper.PointText({
      point: [cx, cy + fontSize * 0.35],
      content: `${Math.round(value)}%`,
      fontSize: fontSize,
      fillColor: new paper.Color(textColor),
      justification: 'center',
      fontWeight: 'bold'
    })
    if (project && project.activeLayer) {
      project.activeLayer.addChild(label)
    }
    elements.push({ type: 'text', id: label.id })
  }

  return {
    success: true,
    elements,
    type: 'progressCircle'
  }
}

module.exports = createProgressCircle
