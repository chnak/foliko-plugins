/**
 * Modern（现代科技风格）模板
 * 使用组件化方式实现
 */

const { createFromConfig } = require('../composer')

/**
 * 应用现代风格模板
 */
async function applyModernTemplate(project, canvas, args) {
  const { title, subtitle, background, accentColor } = args
  const cx = canvas.width / 2
  const cy = canvas.height / 2

  const bg = background || '#1a1a2e'
  const accent = accentColor || '#00d9ff'

  // 计算装饰圆形位置
  const circle1X = canvas.width * 0.85
  const circle1Y = canvas.height * 0.15
  const circle2X = canvas.width * 0.1
  const circle2Y = canvas.height * 0.85
  const circle3X = canvas.width * 0.9
  const circle3Y = canvas.height * 0.8

  // 计算字体大小
  const titleFontSize = Math.min(120, canvas.width / 10)
  const subtitleFontSize = Math.min(40, canvas.width / 25)

  const components = [
    // 背景
    { type: 'background', color: bg },
    
    // 装饰圆形
    { type: 'circle', cx: circle1X, cy: circle1Y, rx: 200, fill: accent, opacity: 0.2 },
    { type: 'circle', cx: circle2X, cy: circle2Y, rx: 150, fill: accent, opacity: 0.15 },
    { type: 'circle', cx: circle3X, cy: circle3Y, rx: 100, fill: '#00ff88', opacity: 0.1 },
    
    // 艺术标题
    {
      type: 'artText',
      text: title,
      x: cx,
      y: cy - 30,
      fontSize: titleFontSize,
      gradient: { colors: [accent, '#00ff88'] },
      shadow: { color: accent, blur: 20 }
    },
    
    // 副标题
    ...(subtitle ? [{
      type: 'text',
      text: subtitle,
      x: cx,
      y: cy + 80,
      fontSize: subtitleFontSize,
      color: '#aaaaaa',
      align: 'center'
    }] : []),
    
    // 分隔线
    { type: 'line', x1: cx - 200, y1: cy + 50, x2: cx + 200, y2: cy + 50, stroke: accent, strokeWidth: 2 }
  ]

  return await createFromConfig(project, canvas, { components })
}

module.exports = applyModernTemplate
