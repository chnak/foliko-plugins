/**
 * 对话气泡组件
 */

const paper = require('paper')

/**
 * 创建对话气泡
 */
function createBubble(project, args) {
  const {
    x = 0,
    y = 0,
    width = 300,
    height = 100,
    text = '',
    fontSize = 24,
    fontFamily,
    color = '#000000',
    backgroundColor = '#ffffff',
    borderColor,
    borderWidth = 1,
    radius = 20,
    tailDirection = 'bottom', // bottom, top, left, right
    tailPosition = 'left', // left, center, right
    shadow,
    opacity = 1,
  } = args

  const items = []

  // 气泡主体
  const bubbleX = tailDirection === 'left' ? x + 15 : x
  const bubbleY = tailDirection === 'top' ? y + 15 : y
  const bubbleWidth = tailDirection === 'left' ? width - 15 : width
  const bubbleHeight = tailDirection === 'top' ? height - 15 : height

  const bgOpts = {
    point: [bubbleX, bubbleY],
    size: [bubbleWidth, bubbleHeight],
    radius: radius,
  }

  if (borderColor) {
    bgOpts.strokeColor = new paper.Color(borderColor)
    bgOpts.strokeWidth = borderWidth
  }

  const bg = new paper.Path.Rectangle(bgOpts)
  bg.fillColor = new paper.Color(backgroundColor)

  if (shadow) {
    bg.shadowColor = new paper.Color(shadow.color || '#000000')
    bg.shadowBlur = shadow.blur || 10
    bg.shadowOffset = new paper.Point(shadow.offsetX || 3, shadow.offsetY || 3)
  }

  if (opacity !== 1) bg.opacity = opacity
  items.push(bg)

  // 气泡尾巴
  const tailSize = 20
  let tailX, tailY, tailRotation

  // 计算尾巴位置
  switch (tailDirection) {
    case 'bottom':
      tailY = bubbleY + bubbleHeight - 5
      if (tailPosition === 'left') tailX = bubbleX + 30
      else if (tailPosition === 'right') tailX = bubbleX + bubbleWidth - 30
      else tailX = bubbleX + bubbleWidth / 2
      tailRotation = 0
      break
    case 'top':
      tailY = bubbleY + 5
      if (tailPosition === 'left') tailX = bubbleX + 30
      else if (tailPosition === 'right') tailX = bubbleX + bubbleWidth - 30
      else tailX = bubbleX + bubbleWidth / 2
      tailRotation = 180
      break
    case 'left':
      tailX = bubbleX + 5
      if (tailPosition === 'left') tailY = bubbleY + 30
      else if (tailPosition === 'right') tailY = bubbleY + bubbleHeight - 30
      else tailY = bubbleY + bubbleHeight / 2
      tailRotation = 90
      break
    case 'right':
      tailX = bubbleX + bubbleWidth - 5
      if (tailPosition === 'left') tailY = bubbleY + 30
      else if (tailPosition === 'right') tailY = bubbleY + bubbleHeight - 30
      else tailY = bubbleY + bubbleHeight / 2
      tailRotation = 270
      break
  }

  const tail = new paper.Path()
  tail.add(new paper.Point(tailX - tailSize, tailY))
  tail.add(new paper.Point(tailX, tailY + tailSize * 0.7))
  tail.add(new paper.Point(tailX, tailY - tailSize * 0.7))
  tail.closed = true
  tail.fillColor = new paper.Color(backgroundColor)
  if (borderColor) {
    tail.strokeColor = new paper.Color(borderColor)
    tail.strokeWidth = borderWidth
  }
  tail.rotate(tailRotation, new paper.Point(tailX, tailY))

  if (opacity !== 1) tail.opacity = opacity
  items.push(tail)

  // 文字
  const padding = 25
  const textItem = new paper.PointText({
    point: [bubbleX + padding, bubbleY + bubbleHeight / 2 + fontSize / 3],
    content: text,
    fontSize,
    fontFamily: fontFamily || 'sans-serif',
    fillColor: new paper.Color(color),
    justification: tailPosition === 'left' ? 'left' : tailPosition === 'right' ? 'right' : 'center',
  })

  // 限制文字宽度
  const maxTextWidth = bubbleWidth - padding * 2
  if (textItem.bounds.width > maxTextWidth) {
    textItem.justification = 'left'
    const charsPerLine = Math.floor((text.length * maxTextWidth) / textItem.bounds.width)
    // 简单换行处理
    let lines = []
    let currentLine = ''
    for (const char of text) {
      currentLine += char
      const testText = new paper.PointText({ content: currentLine, fontSize, fontFamily: fontFamily || 'sans-serif' })
      if (testText.bounds.width > maxTextWidth) {
        lines.push(currentLine.slice(0, -1))
        currentLine = char
      }
    }
    if (currentLine) lines.push(currentLine)
    textItem.content = lines.join('\n')
  }

  if (opacity !== 1) textItem.opacity = opacity
  items.push(textItem)

  return {
    success: true,
    type: 'bubble',
    items: items.map(i => i.id),
  }
}

module.exports = createBubble
