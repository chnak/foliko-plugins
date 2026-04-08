/**
 * 表格组件
 */

const paper = require('paper')

/**
 * 创建表格组件
 */
function createTable(project, canvas, params) {
  const {
    x,
    y,
    width,
    columns,
    rows,
    rowHeight = 36,
    headerBg = '#f0f0f0',
    headerColor = '#333333',
    borderColor = '#e0e0e0',
    cellColor = '#333333',
    fontSize = 12,
    headerFontSize = 13,
    striped = true,
    stripeColor = '#fafafa'
  } = params

  const elements = []

  // 确保 columns 是数组且不为空
  if (!Array.isArray(columns) || columns.length === 0) {
    return { success: true, elements, type: 'table' }
  }

  // 确保 rows 是数组
  if (!Array.isArray(rows)) {
    rows = []
  }

  // 确保 width 有默认值
  const tableWidth = width || 400
  const totalHeight = rowHeight * (rows.length + 1)

  // 绘制外边框
  const outerBorder = new paper.Path.Rectangle({
    point: [x, y],
    size: [tableWidth, totalHeight]
  })
  outerBorder.fillColor = new paper.Color('transparent')
  outerBorder.strokeColor = new paper.Color(borderColor)
  outerBorder.strokeWidth = 1
  if (project && project.activeLayer) {
    project.activeLayer.addChild(outerBorder)
  }
  elements.push({ type: 'path', id: outerBorder.id })

  // 绘制表头背景
  const headerBgRect = new paper.Path.Rectangle({
    point: [x, y],
    size: [tableWidth, rowHeight]
  })
  headerBgRect.fillColor = new paper.Color(headerBg)
  headerBgRect.strokeColor = new paper.Color(borderColor)
  headerBgRect.strokeWidth = 0.5
  if (project && project.activeLayer) {
    project.activeLayer.addChild(headerBgRect)
  }
  elements.push({ type: 'path', id: headerBgRect.id })

  // 绘制表头
  let currentX = x
  columns.forEach((col, index) => {
    const colWidth = col.width || (tableWidth / columns.length)

    // 列分隔线
    if (index > 0) {
      const line = new paper.Path.Line({
        from: [currentX, y],
        to: [currentX, y + totalHeight]
      })
      line.strokeColor = new paper.Color(borderColor)
      line.strokeWidth = 0.5
      if (project && project.activeLayer) {
        project.activeLayer.addChild(line)
      }
      elements.push({ type: 'line', id: line.id })
    }

    // 表头文字
    const headerText = new paper.PointText({
      point: [currentX + colWidth / 2, y + rowHeight / 2 + fontSize / 3],
      content: col.title || '',
      fontSize: headerFontSize,
      fillColor: new paper.Color(headerColor),
      justification: col.align || 'center',
      fontWeight: 'bold'
    })
    if (project && project.activeLayer) {
      project.activeLayer.addChild(headerText)
    }
    elements.push({ type: 'text', id: headerText.id })

    currentX += colWidth
  })

  // 绘制数据行
  rows.forEach((row, rowIndex) => {
    const rowY = y + rowHeight * (rowIndex + 1)

    // 斑马纹背景
    if (striped && rowIndex % 2 === 1) {
      const stripeBg = new paper.Path.Rectangle({
        point: [x, rowY],
        size: [tableWidth, rowHeight]
      })
      stripeBg.fillColor = new paper.Color(stripeColor)
      stripeBg.strokeColor = new paper.Color(borderColor)
      stripeBg.strokeWidth = 0.5
      if (project && project.activeLayer) {
        project.activeLayer.addChild(stripeBg)
      }
      elements.push({ type: 'path', id: stripeBg.id })
    }

    // 行分隔线
    const rowLine = new paper.Path.Line({
      from: [x, rowY],
      to: [x + width, rowY]
    })
    rowLine.strokeColor = new paper.Color(borderColor)
    rowLine.strokeWidth = 0.5
    if (project && project.activeLayer) {
      project.activeLayer.addChild(rowLine)
    }
    elements.push({ type: 'line', id: rowLine.id })

    // 单元格
    let cellX = x
    columns.forEach((col, colIndex) => {
      const colWidth = col.width || (tableWidth / columns.length)
      const cellValue = row[colIndex] || ''
      const cellText = new paper.PointText({
        point: [cellX + colWidth / 2, rowY + rowHeight / 2 + fontSize / 3],
        content: String(cellValue),
        fontSize: fontSize,
        fillColor: new paper.Color(cellColor),
        justification: col.align || 'center'
      })
      if (project && project.activeLayer) {
        project.activeLayer.addChild(cellText)
      }
      elements.push({ type: 'text', id: cellText.id })

      cellX += colWidth
    })
  })

  return {
    success: true,
    elements,
    width: tableWidth,
    height: totalHeight,
    type: 'table'
  }
}

module.exports = createTable
