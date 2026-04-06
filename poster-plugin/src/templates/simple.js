/**
 * Simple（简约留白风格）模板
 * 使用组件化方式实现
 */

const { createFromConfig } = require('../composer')

/**
 * 应用简约风格模板
 */
async function applySimpleTemplate(project, canvas, args) {
  const { title, subtitle, background, accentColor } = args
  const cx = canvas.width / 2
  const cy = canvas.height / 2

  const bg = background || '#f5f5f5'
  const accent = accentColor || '#333333'

  const titleFontSize = Math.min(100, canvas.width / 12)
  const subtitleFontSize = Math.min(36, canvas.width / 28)

  const components = [
    // 背景
    { type: 'background', color: bg },
    
    // 装饰线条
    { type: 'line', x1: cx - 100, y1: cy - 80, x2: cx + 100, y2: cy - 80, stroke: accent, strokeWidth: 1 },
    
    // 主标题
    {
      type: 'artText',
      text: title,
      x: cx,
      y: cy - 20,
      fontSize: titleFontSize,
      gradient: { colors: [accent, '#666666'] },
      shadow: { color: 'rgba(0,0,0,0.1)', blur: 5 }
    },
    
    // 副标题
    ...(subtitle ? [{
      type: 'text',
      text: subtitle,
      x: cx,
      y: cy + 60,
      fontSize: subtitleFontSize,
      color: '#666666',
      align: 'center'
    }] : []),
    
    // 装饰线条
    { type: 'line', x1: cx - 100, y1: cy + 100, x2: cx + 100, y2: cy + 100, stroke: accent, strokeWidth: 1 }
  ]

  return await createFromConfig(project, canvas, { components })
}

module.exports = applySimpleTemplate
