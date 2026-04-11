/**
 * 引用块组件 - 支持自动换行
 */

const paper = require('paper')
const { getFontFallbackChain } = require('../fonts')

/**
 * 手动实现文本自动换行
 */
function wrapText(text, maxWidth, fontSize, font) {
  if (!maxWidth || maxWidth <= 0) return [text]
  
  const tempText = new paper.PointText({
    fontSize,
    fontFamily: font,
  })
  
  const lines = []
  const paragraphs = text.split('\n')
  
  for (let p = 0; p < paragraphs.length; p++) {
    let currentLine = ''
    const paragraph = paragraphs[p]
    let i = 0
    
    while (i < paragraph.length) {
      // 尝试获取下一个字符
      let char = paragraph[i]
      let testLine = currentLine + char
      
      tempText.content = testLine
      let testWidth = tempText.bounds.width
      
      // 如果加上下一个字符超过宽度
      if (testWidth > maxWidth && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = char
      } else {
        currentLine = testLine
      }
      i++
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine)
    }
  }
  
  tempText.remove()
  return lines
}

/**
 * 创建引用块
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.width - 宽度
 * @param {string} args.text - 引用文字
 * @param {string} args.author - 作者
 * @param {string} args.background - 背景色
 * @param {string} args.borderColor - 左边框颜色
 * @param {number} args.borderWidth - 左边框宽度
 * @param {number} args.padding - 内边距
 * @param {number} args.radius - 圆角半径
 * @param {string} args.textColor - 文字颜色
 * @param {string} args.authorColor - 作者颜色
 * @param {number} args.fontSize - 字体大小
 */
function createQuote(project, canvas, args) {
  const {
    x, y,
    width = 400,
    text,
    author,
    background = '#f8fafc',
    borderColor = '#6366f1',
    borderWidth = 4,
    padding = 20,
    radius = 8,
    textColor = '#1e293b',
    authorColor = '#64748b',
    fontSize = 18,
    fontFamily,
  } = args

  // 获取字体回退链
  const quoteFont = getFontFallbackChain(fontFamily, text || '').join(', ')

  const elements = []
  
  // 计算文本换行
  const textPadding = padding + 30 // 左边距 + 引号宽度
  const maxTextWidth = width - textPadding - padding
  const textLines = wrapText(text, maxTextWidth, fontSize, quoteFont)
  const lineHeight = fontSize * 1.5
  const textBlockHeight = textLines.length * lineHeight
  
  // 计算背景高度
  const authorHeight = author ? fontSize * 1.5 : 0
  const totalHeight = padding * 2 + textBlockHeight + authorHeight
  const minHeight = 80
  const finalHeight = Math.max(totalHeight, minHeight)

  // 绘制背景
  const bg = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, finalHeight],
    radius: radius,
  })
  bg.fillColor = new paper.Color(background)
  elements.push({ type: 'rectangle', id: bg.id })

  // 绘制左边框
  const border = new paper.Path.Rectangle({
    point: [x, y],
    size: [borderWidth, finalHeight],
  })
  border.fillColor = new paper.Color(borderColor)
  elements.push({ type: 'rectangle', id: border.id })

  // 绘制引用符号
  const quoteMark = new paper.PointText({
    point: [x + padding + 10, y + padding + fontSize],
    content: '"',
    fontSize: fontSize * 2,
    fontFamily: quoteFont,
    fillColor: new paper.Color(borderColor),
    justification: 'left',
  })
  elements.push({ type: 'text', id: quoteMark.id })

  // 绘制引用文字（多行）
  textLines.forEach((line, index) => {
    const lineY = y + padding + fontSize + index * lineHeight
    const quoteText = new paper.PointText({
      point: [x + padding + 30, lineY],
      content: line,
      fontSize: fontSize,
      fontFamily: quoteFont,
      fillColor: new paper.Color(textColor),
      justification: 'left',
    })
    elements.push({ type: 'text', id: quoteText.id })
  })

  // 绘制作者
  if (author) {
    const authorY = y + padding + textBlockHeight + fontSize * 1.3
    const authorFont = getFontFallbackChain(fontFamily, author).join(', ')
    const authorText = new paper.PointText({
      point: [x + padding, authorY],
      content: `— ${author}`,
      fontSize: fontSize * 0.85,
      fontFamily: authorFont,
      fillColor: new paper.Color(authorColor),
      justification: 'left',
    })
    elements.push({ type: 'text', id: authorText.id })
  }

  return { success: true, elements }
}

module.exports = createQuote
