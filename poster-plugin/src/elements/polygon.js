/**
 * 多边形元素
 */

const paper = require('paper')

/**
 * 添加多边形
 * 支持两种模式：
 * 1. 规则多边形: cx, cy, radius, sides
 * 2. 自定义多边形: points 数组 [[x1,y1], [x2,y2], ...]
 */
function addPolygon(project, args) {
  const {
    cx, cy, radius, sides,
    points,
    fill, stroke, strokeWidth, opacity,
    x = 0, y = 0,
  } = args

  let polygon

  if (points && Array.isArray(points)) {
    // 使用自定义点创建多边形
    // 每个点应该是 [relativeX, relativeY]，相对于 x, y 偏移
    const pathData = points.map((pt, i) => {
      const px = (Array.isArray(pt) ? pt[0] : pt) + x
      const py = (Array.isArray(pt) ? pt[1] : 0) + y
      return i === 0 ? [px, py] : [px, py]
    })

    polygon = new paper.Path({
      segments: pathData,
      closed: true,
    })
  } else if (cx !== undefined && cy !== undefined) {
    // 使用中心点和半径创建规则多边形
    polygon = new paper.Path.RegularPolygon({
      center: [cx, cy],
      radius: radius || 100,
      sides: sides || 6,
    })
  } else {
    throw new Error('Polygon requires either points array or cx/cy coordinates')
  }

  if (fill) {
    polygon.fillColor = new paper.Color(fill)
  } else {
    polygon.fillColor = null
  }
  
  if (stroke) {
    polygon.strokeColor = new paper.Color(stroke)
    polygon.strokeWidth = strokeWidth || 1
  }
  
  if (opacity !== undefined) polygon.opacity = opacity

  return { success: true, id: polygon.id, type: 'polygon' }
}

module.exports = addPolygon
