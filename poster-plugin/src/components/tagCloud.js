/**
 * 标签云组件
 */

const paper = require('paper')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建标签云
 */
function createTagCloud(project, canvas, args) {
  const {
    x = 0,
    y = 0,
    tags = [],
    fontSize = 14,
    padding = 12,
    gap = 10,
    maxWidth = 400,
    fontFamily,
  } = args

  const elements = []

  // 获取字体回退链
  const tagCloudFont = getFontFallbackChain(fontFamily, tags.map(t => String(t.text || '')).join('')).join(', ')

  // 确保 tags 是数组
  if (!Array.isArray(tags) || tags.length === 0) {
    return { success: true, elements, height: 0, type: 'tagCloud' }
  }

  let currentX = x
  let currentY = y
  let rowHeight = 0

  for (const tag of tags) {
    // 确保 tag.text 是字符串
    const tagText = String(tag.text || '')
    if (!tagText) continue

    const textWidth = tagText.length * fontSize * 0.6
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
    if (project && project.activeLayer) {
      project.activeLayer.addChild(tagBg)
    }
    elements.push({ type: 'rectangle', id: tagBg.id })

    // 绘制标签文字
    const tagTextEl = new paper.PointText({
      point: [currentX + tagWidth / 2, currentY + tagHeight / 2 + fontSize / 3],
      content: tagText,
      fontSize: fontSize,
      fontFamily: tagCloudFont,
      fillColor: new paper.Color(tag.color || '#4338ca'),
      justification: 'center',
    })
    if (project && project.activeLayer) {
      project.activeLayer.addChild(tagTextEl)
    }
    elements.push({ type: 'text', id: tagTextEl.id })

    currentX += tagWidth + gap
    rowHeight = Math.max(rowHeight, tagHeight)
  }

  return {
    success: true,
    elements,
    height: currentY - y + rowHeight,
    type: 'tagCloud',
  }
}

module.exports = createTagCloud
