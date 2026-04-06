/**
 * Social（社交媒体风格）模板
 * 使用组件化方式实现
 */

const { createFromConfig } = require('../composer')

/**
 * 应用社交媒体风格模板
 */
async function applySocialTemplate(project, canvas, args) {
  const { title, subtitle, background, accentColor } = args
  const cx = canvas.width / 2
  const cy = canvas.height / 2

  const bg = background || '#2d3436'
  const accent = accentColor || '#e84393'

  const titleFontSize = Math.min(72, canvas.width / 14)
  const subtitleFontSize = Math.min(32, canvas.width / 30)
  const frameRadius = Math.min(250, canvas.width / 3)

  const components = [
    // 背景
    { type: 'background', color: bg },
    
    // 中心圆形边框
    { type: 'circle', cx: cx, cy: cy - 50, rx: frameRadius, stroke: accent, strokeWidth: 6, fill: 'transparent' },
    { type: 'circle', cx: cx, cy: cy - 50, rx: frameRadius - 20, stroke: accent, strokeWidth: 1, opacity: 0.5, fill: 'transparent' },
    
    // 主标题
    {
      type: 'artText',
      text: title,
      x: cx,
      y: cy - 30,
      fontSize: titleFontSize,
      gradient: { colors: ['#ffffff', '#e0e0e0'] },
      shadow: { color: accent, blur: 15 }
    },
    
    // 副标题
    ...(subtitle ? [{
      type: 'text',
      text: subtitle,
      x: cx,
      y: cy + 40,
      fontSize: subtitleFontSize,
      color: '#dddddd',
      align: 'center'
    }] : []),
    
    // 底部装饰点
    { type: 'circle', cx: cx - 30, cy: cy + 120, rx: 5, fill: accent, opacity: 0.5 },
    { type: 'circle', cx: cx, cy: cy + 120, rx: 5, fill: accent, opacity: 0.7 },
    { type: 'circle', cx: cx + 30, cy: cy + 120, rx: 5, fill: accent, opacity: 0.9 }
  ]

  return await createFromConfig(project, canvas, { components })
}

module.exports = applySocialTemplate
