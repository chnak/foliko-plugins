/**
 * 特性网格组件
 */

const paper = require('paper')

/**
 * 创建特性网格
 */
function createFeatureGrid(project, canvas, args) {
  const {
    x, y,
    columns = 3,
    itemWidth = 200,
    itemHeight = 120,
    gap = 20,
    items = [],
    background = '#1a1a2e',
    borderColor = '#00d9ff',
    radius = 8,
  } = args

  const elements = []

  // 确保 items 是数组
  if (!Array.isArray(items)) {
    items = []
  }

  const rows = items.length > 0 ? Math.ceil(items.length / columns) : 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const col = i % columns
    const row = Math.floor(i / columns)

    const itemX = x + col * (itemWidth + gap)
    const itemY = y + row * (itemHeight + gap)

    // 绘制每个特性的背景
    const bg = new paper.Path.Rectangle({
      point: [itemX, itemY],
      size: [itemWidth, itemHeight],
      radius: radius,
    })
    bg.fillColor = new paper.Color(background)
    bg.strokeColor = new paper.Color(borderColor)
    bg.strokeWidth = 0.5
    bg.opacity = 0.8
    if (project && project.activeLayer) {
      project.activeLayer.addChild(bg)
    }
    elements.push({ type: 'rectangle', id: bg.id })

    const padding = 15
    let itemYOffset = itemY + padding

    // 绘制图标
    if (item.icon) {
      const iconText = new paper.PointText({
        point: [itemX + padding, itemYOffset + 24],
        content: item.icon,
        fontSize: 28,
        fillColor: new paper.Color(item.iconColor || '#00ff88'),
        justification: 'left',
      })
      if (project && project.activeLayer) {
        project.activeLayer.addChild(iconText)
      }
      elements.push({ type: 'text', id: iconText.id })
      itemYOffset += 35
    }

    // 绘制标题
    if (item.title) {
      const titleText = new paper.PointText({
        point: [itemX + padding, itemYOffset + 18],
        content: item.title,
        fontSize: 16,
        fillColor: new paper.Color(item.titleColor || '#ffffff'),
        justification: 'left',
      })
      if (project && project.activeLayer) {
        project.activeLayer.addChild(titleText)
      }
      elements.push({ type: 'text', id: titleText.id })
      itemYOffset += 22
    }

    // 绘制描述
    if (item.description) {
      const descText = new paper.PointText({
        point: [itemX + padding, itemYOffset + 14],
        content: item.description,
        fontSize: 12,
        fillColor: new paper.Color(item.descColor || '#888888'),
        justification: 'left',
      })
      if (project && project.activeLayer) {
        project.activeLayer.addChild(descText)
      }
      elements.push({ type: 'text', id: descText.id })
    }
  }

  return {
    success: true,
    elements,
    width: columns * itemWidth + Math.max(0, columns - 1) * gap,
    height: rows * itemHeight + Math.max(0, rows - 1) * gap,
    rows,
    cols: columns,
    type: 'featureGrid',
  }
}

module.exports = createFeatureGrid
