/**
 * Business（商务专业风格）模板
 * 使用组件化方式实现
 */

const { createFromConfig } = require('../composer')

/**
 * 应用商务风格模板
 */
async function applyBusinessTemplate(project, canvas, args) {
  const { title, subtitle, background, accentColor } = args
  const cx = canvas.width / 2

  const bg = background || '#1e3a5f'
  const accent = accentColor || '#c9a227'

  const titleFontSize = Math.min(100, canvas.width / 12)
  const subtitleFontSize = Math.min(36, canvas.width / 28)

  const components = [
    // 背景
    { type: 'background', color: bg },
    
    // 顶部装饰线
    { type: 'line', x1: 100, y1: 150, x2: canvas.width - 100, y2: 150, stroke: accent, strokeWidth: 4 },
    
    // 左侧装饰条
    { type: 'rectangle', x: 80, y: 150, width: 8, height: canvas.height - 300, fill: accent },
    
    // 主标题
    {
      type: 'artText',
      text: title,
      x: cx,
      y: canvas.height / 2 - 20,
      fontSize: titleFontSize,
      gradient: { colors: ['#ffffff', '#e0e0e0'] },
      shadow: { color: 'rgba(0,0,0,0.3)', blur: 10 }
    },
    
    // 副标题
    ...(subtitle ? [{
      type: 'text',
      text: subtitle,
      x: cx,
      y: canvas.height / 2 + 60,
      fontSize: subtitleFontSize,
      color: '#cccccc',
      align: 'center'
    }] : []),
    
    // 底部装饰线
    { type: 'line', x1: 100, y1: canvas.height - 150, x2: canvas.width - 100, y2: canvas.height - 150, stroke: accent, strokeWidth: 4 }
  ]

  return await createFromConfig(project, canvas, { components })
}

module.exports = applyBusinessTemplate
