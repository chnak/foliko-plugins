/**
 * 分隔线组件
 */

const paper = require('paper')

/**
 * 创建分隔线
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.width - 宽度
 * @param {string} args.color - 颜色
 * @param {number} args.thickness - 厚度
 * @param {string} args.style - 样式: solid, dashed
 * @param {string} args.align - 对齐: left, center, right
 */
function createDivider(project, canvas, args) {
  const {
    x, y, width,
    color = '#00d9ff',
    thickness = 1,
    style = 'solid',
    align = 'center',
  } = args

  let startX = x
  let endX = x + width

  if (align === 'center') {
    startX = x - width / 2
    endX = x + width / 2
  } else if (align === 'right') {
    startX = x - width
    endX = x
  }

  const line = new paper.Path.Line({
    from: [startX, y],
    to: [endX, y],
    strokeColor: new paper.Color(color),
    strokeWidth: thickness,
  })

  if (style === 'dashed') {
    line.dashArray = [10, 5]
  }

  return { success: true, id: line.id, type: 'line' }
}

module.exports = createDivider
