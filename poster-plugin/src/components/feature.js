/**
 * 特性展示组件
 */

const paper = require('paper')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建特性展示块
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.width - 总宽度
 * @param {string} args.icon - 图标（emoji）
 * @param {string} args.title - 标题
 * @param {string} args.description - 描述
 * @param {string} args.iconColor - 图标颜色
 * @param {string} args.titleColor - 标题颜色
 * @param {string} args.descColor - 描述颜色
 * @param {number} args.iconSize - 图标大小
 * @param {number} args.titleSize - 标题大小
 * @param {number} args.descSize - 描述大小
 */
function createFeature(project, canvas, args) {
  const {
    x, y, width,
    icon,
    title,
    description,
    iconColor = '#007bff',
    titleColor = '#ffffff',
    descColor = '#aaaaaa',
    iconSize = 32,
    titleSize = 20,
    descSize = 14,
    fontFamily,
  } = args

  const elements = []

  // 获取字体回退链
  const featureFont = getFontFallbackChain(fontFamily, (icon || '') + (title || '') + (description || '')).join(', ')

  const padding = 15
  let currentY = y

  // 绘制图标
  if (icon) {
    const iconText = new paper.PointText({
      point: [x + padding, currentY + iconSize],
      content: icon,
      fontSize: iconSize,
      fontFamily: featureFont,
      fillColor: new paper.Color(iconColor),
      justification: 'left',
    })
    elements.push({ type: 'text', id: iconText.id })
  }

  // 绘制标题
  if (title) {
    currentY += icon ? iconSize + 5 : 0
    const titleText = new paper.PointText({
      point: [x + padding, currentY + titleSize],
      content: title,
      fontSize: titleSize,
      fontFamily: featureFont,
      fillColor: new paper.Color(titleColor),
      justification: 'left',
    })
    elements.push({ type: 'text', id: titleText.id })
  }

  // 绘制描述
  if (description) {
    currentY += title ? titleSize + 5 : 0
    const descText = new paper.PointText({
      point: [x + padding, currentY + descSize],
      content: description,
      fontSize: descSize,
      fontFamily: featureFont,
      fillColor: new paper.Color(descColor),
      justification: 'left',
    })
    elements.push({ type: 'text', id: descText.id })
  }

  return { success: true, elements }
}

module.exports = createFeature
