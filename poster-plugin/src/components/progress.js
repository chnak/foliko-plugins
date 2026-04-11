/**
 * 进度条组件
 */

const paper = require('paper')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建进度条
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.width - 进度条宽度
 * @param {number} args.height - 进度条高度
 * @param {number} args.value - 进度值 0-100
 * @param {string} args.trackColor - 轨道颜色
 * @param {string} args.fillColor - 填充颜色
 * @param {number} args.radius - 圆角半径
 * @param {boolean} args.showLabel - 是否显示标签
 * @param {string} args.label - 标签文字
 */
function createProgress(project, canvas, args) {
  const {
    x, y,
    width = 300,
    height = 20,
    value = 50,
    trackColor = '#e0e0e0',
    fillColor = '#6366f1',
    radius = 10,
    showLabel = false,
    label,
    fontFamily,
  } = args

  const elements = []

  // 获取字体回退链
  const progressFont = getFontFallbackChain(fontFamily, label || '').join(', ')

  // 绘制轨道
  const track = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius,
  })
  track.fillColor = new paper.Color(trackColor)
  elements.push({ type: 'rectangle', id: track.id })

  // 绘制进度
  const progressWidth = (value / 100) * width
  if (progressWidth > 0) {
    const fill = new paper.Path.Rectangle({
      point: [x, y],
      size: [progressWidth, height],
      radius: radius,
    })
    fill.fillColor = new paper.Color(fillColor)
    elements.push({ type: 'rectangle', id: fill.id })
  }

  // 显示标签
  if (showLabel && label) {
    const labelText = new paper.PointText({
      point: [x + width / 2, y - 8],
      content: label,
      fontSize: 14,
      fontFamily: progressFont,
      fillColor: new paper.Color('#666666'),
      justification: 'center',
    })
    elements.push({ type: 'text', id: labelText.id })
  }

  return {
    success: true,
    type: 'progress',
    id: track.id,
    elements,
    value,
  }
}

module.exports = createProgress
