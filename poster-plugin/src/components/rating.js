/**
 * 星级评分组件
 */

const paper = require('paper')

/**
 * 创建星级评分
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.value - 评分值 0-5
 * @param {number} args.max - 最大值，默认5
 * @param {number} args.size - 星星大小
 * @param {string} args.filledColor - 填充颜色
 * @param {string} args.emptyColor - 空心颜色
 * @param {number} args.gap - 星星间距
 */
function createRating(project, canvas, args) {
  const {
    x, y,
    value = 4,
    max = 5,
    size = 24,
    filledColor = '#fbbf24',
    emptyColor = '#e5e7eb',
    gap = 4,
  } = args

  const elements = []

  for (let i = 0; i < max; i++) {
    const starX = x + i * (size + gap)
    const filled = i < Math.floor(value)
    const partial = !filled && i < value

    // 绘制星星（使用多边形）
    const star = createStar(project, starX + size / 2, y + size / 2, size / 2, size / 4, 5)
    star.fillColor = new paper.Color(partial ? filledColor : emptyColor)
    star.opacity = partial ? value - Math.floor(value) : 1
    elements.push({ type: 'polygon', id: star.id })

    if (partial) {
      // 半星效果用填充色覆盖一半
      const halfStar = createStar(project, starX + size / 2, y + size / 2, size / 2, size / 4, 5)
      const clipPath = new paper.Path.Rectangle({
        point: [starX, y],
        size: [size / 2, size],
      })
      halfStar.fillColor = new paper.Color(filledColor)
      halfStar.opacity = 1
      elements.push({ type: 'polygon', id: halfStar.id })
    }
  }

  return {
    success: true,
    elements,
    value,
  }
}

/**
 * 创建星星形状
 */
function createStar(project, cx, cy, outerRadius, innerRadius, points) {
  const star = new paper.Path()
  const step = Math.PI / points

  for (let i = 0; i < 2 * points; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = i * step - Math.PI / 2
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    star.add(new paper.Point(x, y))
  }

  star.closed = true
  return star
}

module.exports = createRating
