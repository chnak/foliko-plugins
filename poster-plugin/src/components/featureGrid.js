/**
 * 特性网格组件
 */

const paper = require('paper')

/**
 * 创建特性网格
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.columns - 列数
 * @param {number} args.itemWidth - 每个特性宽度
 * @param {number} args.itemHeight - 每个特性高度
 * @param {number} args.gap - 间距
 * @param {Array} args.items - 特性数组 [{icon, title, description}]
 * @param {string} args.background - 背景色
 * @param {string} args.borderColor - 边框颜色
 * @param {number} args.radius - 圆角半径
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
  const rows = Math.ceil(items.length / columns)

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
      elements.push({ type: 'text', id: descText.id })
    }
  }

  return {
    success: true,
    elements,
    width: columns * itemWidth + (columns - 1) * gap,
    height: rows * itemHeight + (rows - 1) * gap,
    rows,
    cols: columns,
  }
}

module.exports = createFeatureGrid
