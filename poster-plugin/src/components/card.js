/**
 * 卡片组件
 */

const paper = require('paper')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建卡片组件
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - 卡片X坐标
 * @param {number} args.y - 卡片Y坐标
 * @param {number} args.width - 卡片宽度
 * @param {number} args.height - 卡片高度
 * @param {string} args.background - 背景色
 * @param {string} args.border - 边框颜色
 * @param {number} args.borderWidth - 边框宽度
 * @param {number} args.radius - 圆角半径
 * @param {string} args.title - 标题文字
 * @param {number} args.titleSize - 标题字体大小
 * @param {string} args.titleColor - 标题颜色
 * @param {string} args.subtitle - 副标题
 * @param {number} args.subtitleSize - 副标题字体大小
 * @param {string} args.subtitleColor - 副标题颜色
 * @param {number} args.padding - 内边距
 */
function createCard(project, canvas, args) {
  const {
    x, y, width, height,
    background, border, borderWidth, radius,
    title, titleSize, titleColor,
    subtitle, subtitleSize, subtitleColor,
    padding = 20,
    fontFamily,
  } = args

  const elements = []

  // 获取字体回退链
  const cardFont = getFontFallbackChain(fontFamily, (title || '') + (subtitle || '')).join(', ')

  // 绘制卡片背景
  const card = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius || 0,
  })

  if (background) {
    card.fillColor = new paper.Color(background)
  } else {
    card.fillColor = new paper.Color('#ffffff')
  }

  if (border) {
    card.strokeColor = new paper.Color(border)
    card.strokeWidth = borderWidth || 1
  }

  elements.push({ type: 'rectangle', id: card.id })

  // 绘制标题
  if (title) {
    const titleText = new paper.PointText({
      point: [x + padding, y + padding + (titleSize || 24)],
      content: title,
      fontSize: titleSize || 24,
      fontFamily: cardFont,
      fillColor: new paper.Color(titleColor || '#000000'),
      justification: 'left',
    })
    elements.push({ type: 'text', id: titleText.id })
  }

  // 绘制副标题
  if (subtitle) {
    const titleHeight = title ? (titleSize || 24) + padding : padding
    const subtitleText = new paper.PointText({
      point: [x + padding, y + titleHeight + (subtitleSize || 16) + 10],
      content: subtitle,
      fontSize: subtitleSize || 16,
      fontFamily: cardFont,
      fillColor: new paper.Color(subtitleColor || '#666666'),
      justification: 'left',
    })
    elements.push({ type: 'text', id: subtitleText.id })
  }

  return {
    success: true,
    type: 'card',
    id: card.id,
    elements,
  }
}

module.exports = createCard
