/**
 * 文字元素
 */

const paper = require('paper')
const { validateFont, getDefaultFont } = require('../fonts')

/**
 * 添加文字
 */
function addText(project, args) {
  const {
    text,
    x, y,
    fontSize, fontFamily, color,
    align,
    shadow,
  } = args

  const textItem = new paper.PointText({
    point: [x, y],
    content: text,
    fontSize: fontSize || 48,
    fontFamily: validateFont(fontFamily) || getDefaultFont(),
    fillColor: new paper.Color(color || '#ffffff'),
    justification: align || 'left',
  })

  if (shadow) {
    textItem.shadowColor = new paper.Color(shadow.color)
    textItem.shadowBlur = shadow.blur || 5
    textItem.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
  }

  return { success: true, id: textItem.id, type: 'text' }
}

module.exports = addText
