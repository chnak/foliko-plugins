/**
 * 列表项组件
 */

const paper = require('paper')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建列表项
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.width - 宽度
 * @param {string} args.icon - 图标
 * @param {string} args.title - 标题
 * @param {string} args.description - 描述
 * @param {string} args.badge - 徽章文字
 * @param {string} args.badgeColor - 徽章颜色
 * @param {string} args.iconColor - 图标颜色
 * @param {string} args.background - 背景色
 * @param {string} args.borderColor - 边框颜色
 * @param {number} args.height - 高度
 * @param {number} args.radius - 圆角半径
 */
function createListItem(project, canvas, args) {
  const {
    x = 0,
    y = 0,
    width = 400,
    icon = '→',
    title,
    description,
    badge,
    badgeColor = '#6366f1',
    iconColor = '#6366f1',
    background = '#ffffff',
    borderColor = '#e5e7eb',
    height = 60,
    radius = 8,
    fontFamily,
  } = args

  const elements = []

  // 获取字体回退链
  const listFont = getFontFallbackChain(fontFamily, (icon || '') + (title || '') + (description || '') + (badge || '')).join(', ')

  // 绘制背景
  const bg = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius,
  })
  bg.fillColor = new paper.Color(background)
  bg.strokeColor = new paper.Color(borderColor)
  bg.strokeWidth = 1
  elements.push({ type: 'rectangle', id: bg.id })

  // 绘制图标
  const iconText = new paper.PointText({
    point: [x + 15, y + height / 2 + 6],
    content: icon,
    fontSize: 20,
    fontFamily: listFont,
    fillColor: new paper.Color(iconColor),
    justification: 'center',
  })
  elements.push({ type: 'text', id: iconText.id })

  // 绘制标题
  const titleText = new paper.PointText({
    point: [x + 50, y + height / 2 - 5],
    content: title || 'List Item',
    fontSize: 16,
    fontFamily: listFont,
    fillColor: new paper.Color('#1e293b'),
    justification: 'left',
  })
  elements.push({ type: 'text', id: titleText.id })

  // 绘制描述
  if (description) {
    const descText = new paper.PointText({
      point: [x + 50, y + height / 2 + 15],
      content: description,
      fontSize: 12,
      fontFamily: listFont,
      fillColor: new paper.Color('#64748b'),
      justification: 'left',
    })
    elements.push({ type: 'text', id: descText.id })
  }

  // 绘制徽章
  if (badge) {
    const badgeWidth = badge.length * 10 + 20
    const badgeX = x + width - badgeWidth - 15
    const badgeY = y + (height - 24) / 2

    const badgeBg = new paper.Path.Rectangle({
      point: [badgeX, badgeY],
      size: [badgeWidth, 24],
      radius: 12,
    })
    badgeBg.fillColor = new paper.Color(badgeColor)
    elements.push({ type: 'rectangle', id: badgeBg.id })

    const badgeText = new paper.PointText({
      point: [badgeX + badgeWidth / 2, badgeY + 16],
      content: badge,
      fontSize: 12,
      fontFamily: listFont,
      fillColor: new paper.Color('#ffffff'),
      justification: 'center',
    })
    elements.push({ type: 'text', id: badgeText.id })
  }

  return { success: true, elements, type: 'listItem' }
}

/**
 * 创建列表（多个列表项）
 */
function createList(project, canvas, args) {
  const {
    x = 0, y = 0,
    items = [],
    gap = 10,
    width = 400,
    ...rest
  } = args

  const elements = []
  let currentY = y

  for (const item of items) {
    const result = createListItem(project, canvas, {
      x, y: currentY, width, ...item, ...rest,
    })
    elements.push(...result.elements)
    currentY += 60 + gap
  }

  return {
    success: true,
    elements,
    height: currentY - y,
    type: 'list',
  }
}

module.exports = { createListItem, createList }
