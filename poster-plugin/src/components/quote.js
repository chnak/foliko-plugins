/**
 * 引用块组件
 */

const paper = require('paper')

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
  } = args

  const elements = []

  // 绘制背景
  const bg = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, author ? 80 + fontSize * 2 : 40 + fontSize * 1.5],
    radius: radius,
  })
  bg.fillColor = new paper.Color(background)
  elements.push({ type: 'rectangle', id: bg.id })

  // 绘制左边框
  const border = new paper.Path.Rectangle({
    point: [x, y],
    size: [borderWidth, author ? 80 + fontSize * 2 : 40 + fontSize * 1.5],
  })
  border.fillColor = new paper.Color(borderColor)
  elements.push({ type: 'rectangle', id: border.id })

  // 绘制引用符号
  const quoteMark = new paper.PointText({
    point: [x + padding + 10, y + padding + fontSize],
    content: '"',
    fontSize: fontSize * 2,
    fillColor: new paper.Color(borderColor),
    justification: 'left',
  })
  elements.push({ type: 'text', id: quoteMark.id })

  // 绘制引用文字
  const quoteText = new paper.PointText({
    point: [x + padding + 30, y + padding + fontSize * 1.5],
    content: text,
    fontSize: fontSize,
    fillColor: new paper.Color(textColor),
    justification: 'left',
  })
  elements.push({ type: 'text', id: quoteText.id })

  // 绘制作者
  if (author) {
    const authorText = new paper.PointText({
      point: [x + padding, y + padding + fontSize * 2.5 + 10],
      content: `— ${author}`,
      fontSize: fontSize * 0.8,
      fillColor: new paper.Color(authorColor),
      justification: 'left',
    })
    elements.push({ type: 'text', id: authorText.id })
  }

  return { success: true, elements }
}

module.exports = createQuote
