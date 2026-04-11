/**
 * 图标组件 - 支持 emoji、图片图标
 */

const paper = require('paper')
const { loadImageAsRaster } = require('../utils/imageLoader')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建图标
 */
async function createIcon(project, args) {
  const {
    x = 0,
    y = 0,
    size = 64,
    icon, // emoji 或 图片URL
    color,
    backgroundColor,
    borderColor,
    borderWidth = 0,
    radius = 0,
    shadow,
    opacity = 1,
  } = args

  const items = []

  // 背景
  if (backgroundColor || borderColor) {
    const bg = new paper.Path.Rectangle({
      point: [x, y],
      size: [size, size],
      radius: radius,
    })

    if (backgroundColor) {
      bg.fillColor = new paper.Color(backgroundColor)
    }

    if (borderColor) {
      bg.strokeColor = new paper.Color(borderColor)
      bg.strokeWidth = borderWidth
    }

    if (shadow) {
      bg.shadowColor = new paper.Color(shadow.color || '#000000')
      bg.shadowBlur = shadow.blur || 5
      bg.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
    }

    if (opacity !== 1) {
      bg.opacity = opacity
    }

    items.push(bg)
  }

  // 图标内容
  if (icon) {
    // 判断是否为图片路径（本地文件、http、data URL）
    const isImagePath = icon.startsWith('http') || icon.startsWith('data:') ||
                        (icon.match(/\.(png|jpg|jpeg|gif|svg|webp|bmp)$/i) && !icon.match(/[\u4e00-\u9fa5]/))

    if (isImagePath) {
      // 图片图标 - 使用 imageLoader
      const padding = backgroundColor ? 8 : 0
      const iconSize = size - padding * 2
      const { raster } = await loadImageAsRaster(project, icon, { x: x + padding, y: y + padding, width: iconSize, height: iconSize }, opacity)
      items.push(raster)
    } else {
      // Emoji 或文字图标
      const fontSize = Math.min(size * 0.6, 64)
      const iconFont = getFontFallbackChain(null, icon).join(', ')
      const textItem = new paper.PointText({
        point: [x + size / 2, y + size / 2 + fontSize / 3],
        content: icon,
        fontSize,
        fontFamily: iconFont,
        justification: 'center',
      })
      if (color) {
        textItem.fillColor = new paper.Color(color)
      }
      if (opacity !== 1) textItem.opacity = opacity
      items.push(textItem)
    }
  }

  return {
    success: true,
    type: 'icon',
    items: items.map(i => i.id),
  }
}

module.exports = createIcon
