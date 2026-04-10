/**
 * 分栏布局组件
 * 支持左右分栏、三栏、四栏等多种布局
 */

const paper = require('paper')

/**
 * 创建分栏布局组件
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} params - 组件参数
 * @param {number} params.x - 起始X坐标
 * @param {number} params.y - 起始Y坐标
 * @param {number} params.width - 总宽度
 * @param {number} params.height - 总高度
 * @param {number} [params.columns=2] - 列数
 * @param {number} [params.gap=20] - 列间距
 * @param {string} [params.background] - 背景色
 * @param {string} [params.borderColor] - 边框颜色
 * @param {number} [params.borderWidth] - 边框宽度
 * @param {number} [params.radius=0] - 圆角
 * @param {Array} [params.items] - 列内容配置 [{widthRatio, content}]
 * @param {string} [params.direction='horizontal'] - 排列方向: horizontal, vertical
 * @param {string} [params.align='top'] - 垂直对齐: top, center, bottom
 */
function createColumns(project, canvas, params) {
  const {
    x,
    y,
    width,
    height,
    columns = 2,
    gap = 20,
    background,
    borderColor,
    borderWidth = 1,
    radius = 0,
    direction = 'horizontal',
    align = 'top'
  } = params

  const elements = []
  
  // 计算每列宽度
  const totalGap = gap * (columns - 1)
  const columnWidth = (width - totalGap) / columns
  
  // 绘制背景
  if (background) {
    const bg = new paper.Path.Rectangle({
      point: [x, y],
      size: [width, height],
      radius: radius
    })
    bg.fillColor = new paper.Color(background)
    if (project && project.activeLayer) {
      project.activeLayer.addChild(bg)
    }
    elements.push({ type: 'rectangle', id: bg.id })
  }
  
  // 绘制边框
  if (borderColor && borderWidth > 0) {
    const border = new paper.Path.Rectangle({
      point: [x, y],
      size: [width, height],
      radius: radius
    })
    border.fillColor = new paper.Color('transparent')
    border.strokeColor = new paper.Color(borderColor)
    border.strokeWidth = borderWidth
    if (project && project.activeLayer) {
      project.activeLayer.addChild(border)
    }
    elements.push({ type: 'rectangle', id: border.id })
  }
  
  // 生成分割线
  for (let i = 1; i < columns; i++) {
    const lineX = x + columnWidth * i + gap * (i - 1) + gap / 2
    const line = new paper.Path.Line({
      from: [lineX, y + 20],
      to: [lineX, y + height - 20]
    })
    line.strokeColor = new paper.Color('#e0e0e0')
    line.strokeWidth = 1
    if (project && project.activeLayer) {
      project.activeLayer.addChild(line)
    }
    elements.push({ type: 'line', id: line.id })
  }
  
  // 返回列位置信息
  const columnPositions = []
  for (let i = 0; i < columns; i++) {
    const colX = x + (columnWidth + gap) * i
    const colY = align === 'center' ? y + (height - height) / 2 : align === 'bottom' ? y + height - height : y
    
    columnPositions.push({
      index: i,
      x: colX,
      y: colY,
      width: columnWidth,
      height: height
    })
  }
  
  return {
    success: true,
    elements,
    columnPositions,
    columnWidth,
    totalWidth: width,
    totalHeight: height,
    type: 'columns'
  }
}

module.exports = createColumns
