/**
 * 徽章/标签组件
 */

const paper = require('paper')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建徽章组件
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标（居中时使用）
 * @param {number} args.y - Y坐标
 * @param {string} args.text - 徽章文字
 * @param {string} args.background - 背景色
 * @param {string} args.color - 文字颜色
 * @param {string} args.border - 边框颜色
 * @param {number} args.fontSize - 字体大小
 * @param {string} args.align - 对齐方式: left, center, right
 * @param {number} args.padding - 内边距
 * @param {number} args.radius - 圆角半径
 */
function createBadge(project, canvas, args) {
  const {
    x, y,
    text,
    background = '#007bff',
    color = '#ffffff',
    border,
    fontSize = 18,
    align = 'center',
    padding = 15,
    radius = 4,
    fontFamily,
  } = args

  const elements = []

  // 获取字体回退链
  const badgeFont = getFontFallbackChain(fontFamily, text).join(', ')

  // 计算文字宽度（估算）
  const textWidth = text.length * fontSize * 0.6
  const badgeWidth = textWidth + padding * 2
  const badgeHeight = fontSize + padding * 2

  // 计算X位置
  let badgeX = x
  if (align === 'center') {
    badgeX = x - badgeWidth / 2
  } else if (align === 'right') {
    badgeX = x - badgeWidth
  }

  // 绘制徽章背景
  const badge = new paper.Path.Rectangle({
    point: [badgeX, y],
    size: [badgeWidth, badgeHeight],
    radius: radius,
  })
  badge.fillColor = new paper.Color(background)

  if (border) {
    badge.strokeColor = new paper.Color(border)
    badge.strokeWidth = 1
  }

  elements.push({ type: 'rectangle', id: badge.id })

  // 绘制文字
  const badgeText = new paper.PointText({
    point: [badgeX + badgeWidth / 2, y + badgeHeight / 2 + fontSize / 3],
    content: text,
    fontSize: fontSize,
    fontFamily: badgeFont,
    fillColor: new paper.Color(color),
    justification: 'center',
  })
  elements.push({ type: 'text', id: badgeText.id })

  return {
    success: true,
    elements,
    width: badgeWidth,
    height: badgeHeight,
  }
}

module.exports = createBadge
