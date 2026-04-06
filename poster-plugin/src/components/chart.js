/**
 * 图表组件
 */

const paper = require('paper')

/**
 * 创建图表组件
 */
function createChart(project, canvas, params) {
  const {
    type = 'bar',
    x,
    y,
    width,
    height,
    data = [],
    barColor = '#3b82f6',
    showLabels = true,
    showValues = true,
    barGap = 4
  } = params

  const elements = []

  if (type === 'bar' && data.length > 0) {
    const maxValue = Math.max(...data.map(d => d.value))
    const barCount = data.length
    const totalGap = barGap * (barCount - 1)
    const barWidth = (width - totalGap) / barCount
    const labelHeight = showLabels ? 24 : 0
    const valueHeight = showValues ? 20 : 0
    const chartHeight = height - labelHeight - valueHeight - 10

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight
      const barX = x + index * (barWidth + barGap)
      const barY = y + height - labelHeight - valueHeight - barHeight - 5
      const color = item.color || barColor

      const bar = new paper.Path.Rectangle({
        point: [barX, barY],
        size: [barWidth, barHeight],
        radius: [4, 4, 0, 0]
      })
      bar.fillColor = new paper.Color(color)
      if (project && project.activeLayer) {
        project.activeLayer.addChild(bar)
      }
      elements.push({ type: 'path', id: bar.id })

      if (showValues) {
        const valueText = new paper.PointText({
          point: [barX + barWidth / 2, barY - 8],
          content: String(item.value),
          fontSize: 12,
          fillColor: new paper.Color('#666666'),
          justification: 'center'
        })
        if (project && project.activeLayer) {
          project.activeLayer.addChild(valueText)
        }
        elements.push({ type: 'text', id: valueText.id })
      }

      if (showLabels) {
        const labelText = new paper.PointText({
          point: [barX + barWidth / 2, y + height - 8],
          content: item.label || '',
          fontSize: 11,
          fillColor: new paper.Color('#333333'),
          justification: 'center'
        })
        if (project && project.activeLayer) {
          project.activeLayer.addChild(labelText)
        }
        elements.push({ type: 'text', id: labelText.id })
      }
    })
  } else if (type === 'pie' && data.length > 0) {
    const cx = x + width / 2
    const cy = y + height / 2
    const radius = Math.min(width, height) / 2 - 10
    const total = data.reduce((sum, d) => sum + d.value, 0)
    let currentAngle = -90
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

    data.forEach((item, index) => {
      const percentage = item.value / total
      const endAngle = currentAngle + percentage * 360
      const path = new paper.Path()
      path.moveTo(cx, cy)
      path.arc([cx, cy], radius, currentAngle * Math.PI / 180, endAngle * Math.PI / 180)
      path.closePath()
      path.fillColor = new paper.Color(item.color || colors[index % colors.length])
      if (project && project.activeLayer) {
        project.activeLayer.addChild(path)
      }
      elements.push({ type: 'path', id: path.id })

      if (showLabels && percentage > 0.05) {
        const midAngle = (currentAngle + endAngle) / 2
        const midRad = midAngle * Math.PI / 180
        const labelX = cx + radius * 0.7 * Math.cos(midRad)
        const labelY = cy + radius * 0.7 * Math.sin(midRad)
        const labelText = new paper.PointText({
          point: [labelX, labelY + 4],
          content: `${Math.round(percentage * 100)}%`,
          fontSize: 11,
          fillColor: new paper.Color('#ffffff'),
          justification: 'center',
          fontWeight: 'bold'
        })
        if (project && project.activeLayer) {
          project.activeLayer.addChild(labelText)
        }
        elements.push({ type: 'text', id: labelText.id })
      }

      currentAngle = endAngle
    })
  }

  return { success: true, elements, type: 'chart' }
}

module.exports = createChart
