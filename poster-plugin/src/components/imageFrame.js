/**
 * 图片框组件 - 带装饰边框的图片
 */
const createImageFrame = (ctx) => ({
  /**
   * @param {Object} params
   * @param {string} params.src - 图片路径或URL
   * @param {number} params.x - X坐标
   * @param {number} params.y - Y坐标
   * @param {number} params.width - 图片宽度
   * @param {number} params.height - 图片高度
   * @param {string} [params.borderColor='#ffffff'] - 边框颜色
   * @param {number} [params.borderWidth=3] - 边框宽度
   * @param {string} [params.outerColor='#1a1a2e'] - 外边框颜色
   * @param {number} [params.outerWidth=6] - 外边框宽度
   * @param {number} [params.shadowBlur=0] - 阴影模糊
   * @param {number} [params.shadowOffsetX=0] - 阴影X偏移
   * @param {number} [params.shadowOffsetY=0] - 阴影Y偏移
   * @param {string} [params.shadowColor='rgba(0,0,0,0.3)'] - 阴影颜色
   * @param {number} [params.radius=0] - 圆角半径
   * @param {string} [params.overlayColor] - 叠加颜色
   * @param {number} [params.overlayOpacity=0] - 叠加透明度
   * @param {string} [params.fit='cover'] - 图片填充方式: cover, contain, fill
   */
  async draw({
    src,
    x,
    y,
    width,
    height,
    borderColor = '#ffffff',
    borderWidth = 3,
    outerColor = '#1a1a2e',
    outerWidth = 6,
    shadowBlur = 0,
    shadowOffsetX = 0,
    shadowOffsetY = 0,
    shadowColor = 'rgba(0,0,0,0.3)',
    radius = 0,
    overlayColor,
    overlayOpacity = 0,
    fit = 'cover'
  }) {
    // 绘制外边框（装饰层）
    if (outerWidth > 0) {
      ctx.fillStyle = outerColor
      await _roundRect(ctx, x - outerWidth, y - outerWidth, width + outerWidth * 2, height + outerWidth * 2, radius + outerWidth)
      ctx.fill()
    }

    // 绘制内边框
    if (borderWidth > 0) {
      ctx.fillStyle = borderColor
      await _roundRect(ctx, x - borderWidth, y - borderWidth, width + borderWidth * 2, height + borderWidth * 2, radius + borderWidth)
      ctx.fill()
    }

    // 绘制阴影
    if (shadowBlur > 0) {
      ctx.shadowColor = shadowColor
      ctx.shadowBlur = shadowBlur
      ctx.shadowOffsetX = shadowOffsetX
      ctx.shadowOffsetY = shadowOffsetY
    }

    // 加载并绘制图片
    const image = await _loadImage(src)
    const imgWidth = image.width
    const imgHeight = image.height
    const imgRatio = imgWidth / imgHeight
    const boxRatio = width / height

    let drawX = x, drawY = y, drawW = width, drawH = height

    if (fit === 'cover') {
      if (imgRatio > boxRatio) {
        drawH = height
        drawW = height * imgRatio
        drawX = x - (drawW - width) / 2
      } else {
        drawW = width
        drawH = width / imgRatio
        drawY = y - (drawH - height) / 2
      }
    } else if (fit === 'contain') {
      if (imgRatio > boxRatio) {
        drawW = width
        drawH = width / imgRatio
        drawY = y + (height - drawH) / 2
      } else {
        drawH = height
        drawW = height * imgRatio
        drawX = x + (width - drawW) / 2
      }
    }

    // 裁剪并绘制图片
    ctx.save()
    await _roundRect(ctx, x, y, width, height, radius)
    ctx.clip()
    ctx.drawImage(image, drawX, drawY, drawW, drawH)
    ctx.restore()

    // 重置阴影
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // 叠加颜色
    if (overlayColor && overlayOpacity > 0) {
      ctx.fillStyle = overlayColor
      ctx.globalAlpha = overlayOpacity
      await _roundRect(ctx, x, y, width, height, radius)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }
})

// 辅助函数：圆角矩形
async function _roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// 辅助函数：加载图片
async function _loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => {
      // 尝试 data URL 格式
      if (src.startsWith('data:')) {
        img.src = src
      } else {
        reject(new Error(`Failed to load image: ${src}`))
      }
    }
    img.src = src
  })
}

module.exports = createImageFrame
