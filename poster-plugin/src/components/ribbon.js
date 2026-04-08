/**
 * 丝带/飘带组件
 */

const paper = require('paper')

/**
 * 创建丝带
 */
function createRibbon(project, args) {
  const {
    x = 0,
    y = 0,
    width = 300,
    text = '',
    fontSize = 28,
    fontFamily,
    color = '#ffffff',
    backgroundColor = '#e74c3c',
    borderColor,
    borderWidth = 2,
    shadow,
    position = 'top', // top, bottom, left, right
    style = 'fold', // fold, diagonal, corner
    opacity = 1,
  } = args

  const items = []

  if (style === 'diagonal') {
    // 对角丝带
    const diagonalLength = Math.sqrt(width ** 2 + 60 ** 2)
    const angle = Math.atan2(60, width) * 180 / Math.PI

    const ribbon = new paper.Path.Rectangle({
      point: [x, y],
      size: [diagonalLength, 60],
      radius: 4,
      fillColor: new paper.Color(backgroundColor),
    })
    ribbon.rotate(angle, new paper.Point(x, y))

    if (borderColor) {
      ribbon.strokeColor = new paper.Color(borderColor)
      ribbon.strokeWidth = borderWidth
    }

    if (shadow) {
      ribbon.shadowColor = new paper.Color(shadow.color || '#000000')
      ribbon.shadowBlur = shadow.blur || 8
      ribbon.shadowOffset = new paper.Point(shadow.offsetX || 3, shadow.offsetY || 3)
    }

    if (opacity !== 1) ribbon.opacity = opacity
    items.push(ribbon)

    // 文字
    const textItem = new paper.PointText({
      point: [x + diagonalLength / 2, y + 60 / 2 + fontSize / 3],
      content: text,
      fontSize,
      fontFamily: fontFamily || 'sans-serif',
      fillColor: new paper.Color(color),
      justification: 'center',
    })
    textItem.rotate(angle, new paper.Point(x + diagonalLength / 2, y + 60 / 2))

    if (opacity !== 1) textItem.opacity = opacity
    items.push(textItem)

  } else if (style === 'corner') {
    // 角落丝带
    const ribbonWidth = width
    const ribbonHeight = 50

    // 主丝带
    const ribbon = new paper.Path.Rectangle({
      point: [x, y],
      size: [ribbonWidth, ribbonHeight],
      fillColor: new paper.Color(backgroundColor),
    })

    if (borderColor) {
      ribbon.strokeColor = new paper.Color(borderColor)
      ribbon.strokeWidth = borderWidth
    }

    if (shadow) {
      ribbon.shadowColor = new paper.Color(shadow.color || '#000000')
      ribbon.shadowBlur = shadow.blur || 8
      ribbon.shadowOffset = new paper.Point(shadow.offsetX || 3, shadow.offsetY || 3)
    }

    if (opacity !== 1) ribbon.opacity = opacity
    items.push(ribbon)

    // 折叠部分
    const foldSize = 20
    const fold = new paper.Path()
    fold.add(new paper.Point(x, y + ribbonHeight))
    fold.add(new paper.Point(x, y + ribbonHeight + foldSize))
    fold.add(new paper.Point(x + foldSize, y + ribbonHeight))
    fold.closed = true
    fold.fillColor = new paper.Color(backgroundColor).multiply(0.8)

    if (borderColor) {
      fold.strokeColor = new paper.Color(borderColor)
      fold.strokeWidth = borderWidth
    }

    if (opacity !== 1) fold.opacity = opacity
    items.push(fold)

    // 文字
    const textItem = new paper.PointText({
      point: [x + ribbonWidth / 2, y + ribbonHeight / 2 + fontSize / 3],
      content: text,
      fontSize,
      fontFamily: fontFamily || 'sans-serif',
      fillColor: new paper.Color(color),
      justification: 'center',
    })

    if (opacity !== 1) textItem.opacity = opacity
    items.push(textItem)

  } else {
    // 折叠丝带 (默认)
    const ribbonHeight = 50

    // 主丝带
    const ribbon = new paper.Path.Rectangle({
      point: [x, y],
      size: [width, ribbonHeight],
      fillColor: new paper.Color(backgroundColor),
    })

    if (borderColor) {
      ribbon.strokeColor = new paper.Color(borderColor)
      ribbon.strokeWidth = borderWidth
    }

    if (shadow) {
      ribbon.shadowColor = new paper.Color(shadow.color || '#000000')
      ribbon.shadowBlur = shadow.blur || 8
      ribbon.shadowOffset = new paper.Point(shadow.offsetX || 3, shadow.offsetY || 3)
    }

    if (opacity !== 1) ribbon.opacity = opacity
    items.push(ribbon)

    // 左右折叠三角
    const foldSize = 15
    const leftFold = new paper.Path()
    leftFold.add(new paper.Point(x, y))
    leftFold.add(new paper.Point(x - foldSize, y - foldSize))
    leftFold.add(new paper.Point(x, y - foldSize))
    leftFold.closed = true
    leftFold.fillColor = new paper.Color(backgroundColor).multiply(0.8)
    if (opacity !== 1) leftFold.opacity = opacity
    items.push(leftFold)

    const rightFold = new paper.Path()
    rightFold.add(new paper.Point(x + width, y))
    rightFold.add(new paper.Point(x + width + foldSize, y - foldSize))
    rightFold.add(new paper.Point(x + width, y - foldSize))
    rightFold.closed = true
    rightFold.fillColor = new paper.Color(backgroundColor).multiply(0.8)
    if (opacity !== 1) rightFold.opacity = opacity
    items.push(rightFold)

    // 文字
    const textItem = new paper.PointText({
      point: [x + width / 2, y + ribbonHeight / 2 + fontSize / 3],
      content: text,
      fontSize,
      fontFamily: fontFamily || 'sans-serif',
      fillColor: new paper.Color(color),
      justification: 'center',
    })

    if (opacity !== 1) textItem.opacity = opacity
    items.push(textItem)
  }

  return {
    success: true,
    type: 'ribbon',
    items: items.map(i => i.id),
  }
}

module.exports = createRibbon
