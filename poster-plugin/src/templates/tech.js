/**
 * Tech（科技感）模板
 */

const { createFromConfig } = require('../composer')

/**
 * 应用科技风格模板
 */
async function applyTechTemplate(project, canvas, args) {
  const { title, subtitle, background, accentColor } = args
  const cx = canvas.width / 2
  const cy = canvas.height / 2

  const bg = background || '#0a0a0a'
  const accent = accentColor || '#00ff00'

  const titleFontSize = Math.min(100, canvas.width / 12)
  const subtitleFontSize = Math.min(32, canvas.width / 28)

  // 计算网格位置
  const gridItems = []
  const cols = 5
  const rows = 3
  const gridWidth = canvas.width * 0.8
  const gridHeight = canvas.height * 0.3
  const cellWidth = gridWidth / cols
  const cellHeight = gridHeight / rows
  const gridX = (canvas.width - gridWidth) / 2
  const gridY = canvas.height * 0.7

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      gridItems.push({
        type: 'rectangle',
        x: gridX + i * cellWidth,
        y: gridY + j * cellHeight,
        width: cellWidth - 10,
        height: cellHeight - 10,
        stroke: accent,
        strokeWidth: 0.5,
        opacity: 0.3
      })
    }
  }

  const components = [
    // 背景
    { type: 'background', color: bg },
    
    // 顶部装饰线
    { type: 'line', x1: 0, y1: 50, x2: canvas.width * 0.3, y2: 50, stroke: accent, strokeWidth: 2 },
    { type: 'line', x1: canvas.width * 0.7, y1: 50, x2: canvas.width, y2: 50, stroke: accent, strokeWidth: 2 },
    
    // 主标题（霓虹效果）
    {
      type: 'artText',
      text: title,
      x: cx,
      y: cy,
      fontSize: titleFontSize,
      gradient: { colors: [accent, '#00ffff'] },
      shadow: { color: accent, blur: 30 }
    },
    
    // 副标题
    ...(subtitle ? [{
      type: 'text',
      text: subtitle,
      x: cx,
      y: cy + 80,
      fontSize: subtitleFontSize,
      color: '#888888',
      align: 'center'
    }] : []),
    
    // 网格装饰
    ...gridItems
  ]

  return await createFromConfig(project, canvas, { components })
}

module.exports = applyTechTemplate
