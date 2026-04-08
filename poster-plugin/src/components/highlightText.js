/**
 * 高亮文字组件 - 荧光笔效果
 */

const paper = require('paper')

/**
 * 创建高亮文字
 */
function createHighlightText(project, args) {
  const {
    x = 0,
    y = 0,
    text = '',
    fontSize = 48,
    fontFamily,
    color = '#000000',
    highlightColor = '#ffff00',
    highlightStyle = 'marker', // marker, underline, background, stroke
    highlightWidth = 20,
    strokeWidth = 2,
    shadow,
    opacity = 1,
  } = args

  const items = []

  // 创建文字以获取尺寸
  const textItem = new paper.PointText({
    point: [x, y + fontSize],
    content: text,
    fontSize,
    fontFamily: fontFamily || 'sans-serif',
    fillColor: new paper.Color(color),
    justification: 'left',
  })

  const textBounds = textItem.bounds

  // 根据样式添加高亮
  switch (highlightStyle) {
    case 'marker':
      // 荧光笔效果 - 倾斜的矩形
      const markerHeight = fontSize * 0.8
      const marker = new paper.Path.Rectangle({
        point: [textBounds.x - 5, textBounds.y + fontSize * 0.3],
        size: [textBounds.width + 10, markerHeight],
      })
      marker.fillColor = new paper.Color(highlightColor)
      marker.opacity = 0.5
      marker.rotate(-5, marker.bounds.center)
      if (shadow) {
        marker.shadowColor = new paper.Color(shadow.color || '#000000')
        marker.shadowBlur = shadow.blur || 5
        marker.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
      }
      if (opacity !== 1) marker.opacity *= opacity
      items.push(marker)
      break

    case 'underline':
      // 下划线
      const underlineY = textBounds.y + fontSize + 5
      const underline = new paper.Path.Line(
        [textBounds.x, underlineY],
        [textBounds.x + textBounds.width, underlineY]
      )
      underline.strokeColor = new paper.Color(highlightColor)
      underline.strokeWidth = highlightWidth
      underline.strokeCap = 'round'
      if (shadow) {
        underline.shadowColor = new paper.Color(shadow.color || '#000000')
        underline.shadowBlur = shadow.blur || 5
        underline.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
      }
      if (opacity !== 1) underline.opacity = opacity
      items.push(underline)
      break

    case 'background':
      // 背景色块
      const padding = 8
      const bg = new paper.Path.Rectangle({
        point: [textBounds.x - padding, textBounds.y - 5],
        size: [textBounds.width + padding * 2, fontSize + 10],
        radius: 4,
      })
      bg.fillColor = new paper.Color(highlightColor)
      bg.opacity = 0.6
      if (shadow) {
        bg.shadowColor = new paper.Color(shadow.color || '#000000')
        bg.shadowBlur = shadow.blur || 5
        bg.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
      }
      if (opacity !== 1) bg.opacity *= opacity
      items.push(bg)
      break

    case 'stroke':
      // 描边效果
      textItem.strokeColor = new paper.Color(highlightColor)
      textItem.strokeWidth = strokeWidth
      if (shadow) {
        textItem.shadowColor = new paper.Color(shadow.color || '#000000')
        textItem.shadowBlur = shadow.blur || 5
        textItem.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
      }
      if (opacity !== 1) textItem.opacity = opacity
      items.push(textItem)
      break

    case 'neon':
      // 霓虹效果
      textItem.strokeColor = new paper.Color(highlightColor)
      textItem.strokeWidth = strokeWidth * 2
      const neonClone = textItem.clone()
      neonClone.strokeWidth = strokeWidth * 4
      neonClone.strokeColor = new paper.Color(highlightColor)
      neonClone.fillColor = null
      neonClone.opacity = 0.3
      if (opacity !== 1) {
        textItem.opacity = opacity
        neonClone.opacity *= opacity
      }
      items.push(neonClone)
      items.push(textItem)
      break
  }

  // 如果不是 stroke 样式，需要重新添加文字
  if (highlightStyle !== 'stroke' && highlightStyle !== 'neon') {
    if (opacity !== 1) textItem.opacity = opacity
    items.push(textItem)
  }

  return {
    success: true,
    type: 'highlightText',
    items: items.map(i => i.id),
    bounds: textBounds,
  }
}

module.exports = createHighlightText
