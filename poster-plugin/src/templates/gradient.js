/**
 * Gradient（渐变风格）模板
 */

const { createFromConfig } = require('../composer')

/**
 * 应用渐变风格模板
 */
async function applyGradientTemplate(project, canvas, args) {
  const { title, subtitle, background, accentColor } = args
  const cx = canvas.width / 2
  const cy = canvas.height / 2

  const bg = background || '#667eea'
  const accent = accentColor || '#764ba2'

  const titleFontSize = Math.min(120, canvas.width / 10)

  const components = [
    // 渐变背景
    {
      type: 'background',
      gradient: {
        type: 'radial',
        colors: [bg, accent, '#1a1a2e']
      }
    },
    
    // 装饰圆形
    { type: 'circle', cx: canvas.width * 0.2, cy: canvas.height * 0.2, rx: 100, fill: '#ffffff', opacity: 0.1 },
    { type: 'circle', cx: canvas.width * 0.8, cy: canvas.height * 0.7, rx: 150, fill: '#ffffff', opacity: 0.08 },
    { type: 'circle', cx: canvas.width * 0.5, cy: canvas.height * 0.9, rx: 200, fill: '#000000', opacity: 0.2 },
    
    // 主标题
    {
      type: 'artText',
      text: title,
      x: cx,
      y: cy - 20,
      fontSize: titleFontSize,
      gradient: { colors: ['#ffffff', '#e0e0e0'] },
      shadow: { color: 'rgba(0,0,0,0.5)', blur: 20 }
    },
    
    // 副标题
    ...(subtitle ? [{
      type: 'text',
      text: subtitle,
      x: cx,
      y: cy + 80,
      fontSize: 36,
      color: '#ffffff',
      align: 'center'
    }] : []),
    
    // 底部装饰线
    { type: 'line', x1: cx - 150, y1: cy + 150, x2: cx + 150, y2: cy + 150, stroke: '#ffffff', strokeWidth: 2, opacity: 0.5 }
  ]

  return await createFromConfig(project, canvas, { components })
}

module.exports = applyGradientTemplate
