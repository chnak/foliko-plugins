/**
 * 网格布局组件
 * 支持任意行列的网格布局
 */

const createGrid = (ctx) => ({
  /**
   * @param {Object} params
   * @param {number} params.x - 起始X坐标
   * @param {number} params.y - 起始Y坐标
   * @param {number} params.width - 总宽度
   * @param {number} params.height - 总高度
   * @param {number} [params.columns=3] - 列数
   * @param {number} [params.rows=2] - 行数
   * @param {number} [params.gapX=20] - 水平间距
   * @param {number} [params.gapY=20] - 垂直间距
   * @param {string} [params.background] - 背景色
   * @param {string} [params.borderColor] - 边框颜色
   * @param {number} [params.borderWidth] - 边框宽度
   * @param {number} [params.radius=0] - 圆角
   * @param {string} [params.direction='row'] - 排列方向: row(行优先), column(列优先)
   */
  draw({
    x,
    y,
    width,
    height,
    columns = 3,
    rows = 2,
    gapX = 20,
    gapY = 20,
    background,
    borderColor,
    borderWidth = 1,
    radius = 0,
    direction = 'row'
  }) {
    const elements = []
    
    // 计算单元格尺寸
    const totalGapX = gapX * (columns - 1)
    const totalGapY = gapY * (rows - 1)
    const cellWidth = (width - totalGapX) / columns
    const cellHeight = (height - totalGapY) / rows
    
    // 绘制背景
    if (background) {
      const bg = new ctx.Path.Rectangle({
        point: [x, y],
        size: [width, height],
        radius: radius
      })
      bg.fillColor = new ctx.Color(background)
      elements.push({ type: 'rectangle', id: bg.id })
    }
    
    // 绘制边框
    if (borderColor && borderWidth > 0) {
      const border = new ctx.Path.Rectangle({
        point: [x, y],
        size: [width, height],
        radius: radius
      })
      border.fillColor = new ctx.Color('transparent')
      border.strokeColor = new ctx.Color(borderColor)
      border.strokeWidth = borderWidth
      elements.push({ type: 'rectangle', id: border.id })
    }
    
    // 生成网格位置信息
    const cellPositions = []
    const totalCells = columns * rows
    
    for (let i = 0; i < totalCells; i++) {
      let col, row
      
      if (direction === 'row') {
        col = i % columns
        row = Math.floor(i / columns)
      } else {
        row = i % rows
        col = Math.floor(i / rows)
      }
      
      const cellX = x + col * (cellWidth + gapX)
      const cellY = y + row * (cellHeight + gapY)
      
      cellPositions.push({
        index: i,
        column: col,
        row: row,
        x: cellX,
        y: cellY,
        width: cellWidth,
        height: cellHeight,
        centerX: cellX + cellWidth / 2,
        centerY: cellY + cellHeight / 2
      })
    }
    
    // 返回网格布局信息
    return {
      success: true,
      elements,
      cellPositions,
      cellWidth,
      cellHeight,
      columns,
      rows,
      totalCells,
      totalWidth: width,
      totalHeight: height,
      type: 'grid'
    }
  }
})

module.exports = createGrid
