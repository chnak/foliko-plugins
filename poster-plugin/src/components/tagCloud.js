/**
 * 标签云组件
 */

const paper = require('paper')

/**
 * 创建标签云
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {Array} args.tags - 标签数组 [{text, color, bgColor}]
 * @param {number} args.fontSize - 字体大小
 * @param {number} args.padding - 标签内边距
 * @param {number} args.gap - 标签间距
 * @param {number} args.maxWidth - 最大宽度（自动换行）
 */
function createTagCloud(project, canvas, args) {
  const {
    x, y,
    tags = [],
    fontSize = 14,
    padding = 12,
    gap = 10,
    maxWidth = 400,
  } = args

  const elements = []
  let currentX = x
  let currentY = y
  let rowHeight = 0

  for (const tag of tags) {
    const textWidth = tag.text.length * fontSize * 0.6
    const tagWidth = textWidth + padding * 2
    const tagHeight = fontSize + padding * 2

    // 换行处理
    if (currentX + tagWidth > x + maxWidth && currentX > x) {
      currentX = x
      currentY += rowHeight + gap
      rowHeight = 0
    }

    // 绘制标签背景
    const tagBg = new paper.Path.Rectangle({
      point: [currentX, currentY],
      size: [tagWidth, tagHeight],
      radius: tagHeight / 2,
    })
    tagBg.fillColor = new paper.Color(tag.bgColor || '#e0e7ff')
    elements.push({ type: 'rectangle', id: tagBg.id })

    // 绘制标签文字
    const tagText = new paper.PointText({
      point: [currentX + tagWidth / 2, currentY + tagHeight / 2 + fontSize / 3],
      content: tag.text,
      fontSize: fontSize,
      fillColor: new paper.Color(tag.color || '#4338ca'),
      justification: 'center',
    })
    elements.push({ type: 'text', id: tagText.id })

    currentX += tagWidth + gap
    rowHeight = Math.max(rowHeight, tagHeight)
  }

  return {
    success: true,
    elements,
    height: rowHeight,
  }
}

module.exports = createTagCloud
