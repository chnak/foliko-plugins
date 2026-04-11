/**
 * 条形码组件 - 静态图片
 */

const paper = require('paper')
const { loadImageAsRaster, downloadImage } = require('../utils/imageLoader')
const { getFontFallbackChain, validateFont } = require('../fonts')

/**
 * 创建条形码
 */
async function createBarcode(project, args) {
  const {
    x = 0,
    y = 0,
    width = 300,
    height = 100,
    content = '1234567890',
    showText = true,
    textColor = '#000000',
    fontSize = 16,
    opacity = 1,
  } = args

  // 内容太短或像URL，回退到简单条形码
  if (content.length < 8 || content.startsWith('http')) {
    return createSimpleBarcode(project, { x, y, width, height, content, showText, textColor, fontSize, opacity })
  }

  try {
    const barcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${width}x${height}&data=${encodeURIComponent(content)}&format=png`
    const { raster } = await loadImageAsRaster(project, barcodeUrl, { x, y, width, height }, opacity)
    const items = [raster]

    // 文字
    if (showText) {
      const barcodeFont = getFontFallbackChain('monospace', content).join(', ')
      const textItem = new paper.PointText({
        point: [x + width / 2, y + height + fontSize + 5],
        content: content,
        fontSize,
        fontFamily: barcodeFont,
        fillColor: new paper.Color(textColor),
        justification: 'center',
      })
      if (opacity !== 1) textItem.opacity = opacity
      items.push(textItem)
    }

    return {
      success: true,
      type: 'barcode',
      items: items.map(i => i.id),
    }
  } catch (err) {
    // 回退到简单条形码
    return createSimpleBarcode(project, { x, y, width, height, content, showText, textColor, fontSize, opacity })
  }
}

/**
 * 创建简单的条形码（使用线条绘制）
 */
function createSimpleBarcode(project, args) {
  const {
    x = 0,
    y = 0,
    width = 300,
    height = 80,
    content = '123456',
    color = '#000000',
    showText = true,
    textColor = '#000000',
    fontSize = 14,
    opacity = 1,
  } = args

  const items = []
  const barHeight = showText ? height - 25 : height
  const barWidth = width / (content.length * 15)

  // 生成简单的条形图案
  for (let i = 0; i < content.length; i++) {
    const charCode = content.charCodeAt(i)
    const density = (charCode % 3) + 1

    for (let d = 0; d < density; d++) {
      const isWide = (charCode + d) % 2 === 0
      const barW = isWide ? barWidth * 2 : barWidth

      const bar = new paper.Path.Rectangle({
        point: [x + (i * density + d) * barWidth, y],
        size: [barW * 0.8, barHeight],
        fillColor: new paper.Color(color),
      })
      if (opacity !== 1) bar.opacity = opacity
      items.push(bar)
    }
  }

  // 文字
  if (showText) {
    const simpleBarcodeFont = getFontFallbackChain('monospace', content).join(', ')
    const textItem = new paper.PointText({
      point: [x + width / 2, y + barHeight + fontSize + 3],
      content: content,
      fontSize,
      fontFamily: simpleBarcodeFont,
      fillColor: new paper.Color(textColor),
      justification: 'center',
    })
    if (opacity !== 1) textItem.opacity = opacity
    items.push(textItem)
  }

  return {
    success: true,
    type: 'barcode',
    items: items.map(i => i.id),
  }
}

module.exports = createBarcode
