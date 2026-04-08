/**
 * 印章组件 - 印章效果
 */

const paper = require('paper')

/**
 * 创建印章
 */
function createSeal(project, args) {
  const {
    x = 0,
    y = 0,
    size = 100,
    text = '印章',
    fontSize = 24,
    fontFamily,
    color = '#e74c3c',
    borderColor,
    style = 'circle', // circle, square, star, hexagon
    borderWidth = 3,
    opacity = 1,
  } = args

  const items = []
  const centerX = x + size / 2
  const centerY = y + size / 2

  // 印章边框
  let border
  switch (style) {
    case 'circle':
      border = new paper.Path.Circle({
        center: [centerX, centerY],
        radius: size / 2 - borderWidth,
      })
      break
    case 'square':
      const squareSize = size - borderWidth * 2
      border = new paper.Path.Rectangle({
        point: [x + borderWidth, y + borderWidth],
        size: [squareSize, squareSize],
        radius: 4,
      })
      break
    case 'star':
      border = createStarPath(centerX, centerY, size / 2 - borderWidth, size / 2 - borderWidth - 10, 5)
      break
    case 'hexagon':
      border = createPolygonPath(centerX, centerY, size / 2 - borderWidth, 6)
      break
    default:
      border = new paper.Path.Circle({
        center: [centerX, centerY],
        radius: size / 2 - borderWidth,
      })
  }

  border.strokeColor = new paper.Color(color)
  border.strokeWidth = borderWidth
  border.fillColor = null
  if (opacity !== 1) border.opacity = opacity
  items.push(border)

  // 内边框
  const innerBorder = border.clone()
  innerBorder.scale(0.85, 0.85, new paper.Point(centerX, centerY))
  innerBorder.strokeWidth = 1
  if (opacity !== 1) innerBorder.opacity = opacity
  items.push(innerBorder)

  // 文字
  const textItem = new paper.PointText({
    point: [centerX, centerY + fontSize / 3],
    content: text,
    fontSize,
    fontFamily: fontFamily || 'serif',
    fillColor: new paper.Color(color),
    justification: 'center',
  })

  if (opacity !== 1) textItem.opacity = opacity
  items.push(textItem)

  // 顶部文字（如果适用）
  const topText = new paper.PointText({
    point: [centerX, centerY - size / 4],
    content: '★',
    fontSize: 16,
    fontFamily: fontFamily || 'serif',
    fillColor: new paper.Color(color),
    justification: 'center',
  })
  if (opacity !== 1) topText.opacity = opacity
  items.push(topText)

  // 底部星星装饰
  const bottomStar = new paper.PointText({
    point: [centerX, centerY + size / 3],
    content: '★ ★ ★',
    fontSize: 12,
    fontFamily: fontFamily || 'serif',
    fillColor: new paper.Color(color),
    justification: 'center',
    letterSpacing: 8,
  })
  if (opacity !== 1) bottomStar.opacity = opacity
  items.push(bottomStar)

  return {
    success: true,
    type: 'seal',
    items: items.map(i => i.id),
  }
}

/**
 * 创建五角星路径
 */
function createStarPath(cx, cy, outerR, innerR, points) {
  const path = new paper.Path()
  const angleStep = Math.PI / points

  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = i * angleStep - Math.PI / 2
    path.add(new paper.Point(cx + r * Math.cos(angle), cy + r * Math.sin(angle)))
  }
  path.closed = true
  return path
}

/**
 * 创建多边形路径
 */
function createPolygonPath(cx, cy, radius, sides) {
  const path = new paper.Path()
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI / sides) - Math.PI / 2
    path.add(new paper.Point(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)))
  }
  path.closed = true
  return path
}

module.exports = createSeal
