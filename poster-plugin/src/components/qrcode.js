/**
 * 二维码组件 - 本地生成
 */

const paper = require('paper')
const QRCode = require('qrcode')

/**
 * 创建二维码
 * @param {paper.Project} project - paper.js 项目
 * @param {Object} args - 参数
 */
async function createQRCode(project, args) {
  const {
    x = 0,
    y = 0,
    size = 200,
    content = '',
    color = '#000000',
    backgroundColor = '#ffffff',
    logo,
    logoSize,
    opacity = 1,
  } = args

  try {
    // 生成 QR 码图片
    const qrDataUrl = await QRCode.toDataURL(content, {
      width: size,
      margin: 2,
      color: {
        dark: color,
        light: backgroundColor,
      },
    })

    // 使用 imageLoader 加载
    const { loadImageAsRaster } = require('../utils/imageLoader')
    const { raster } = await loadImageAsRaster(project, qrDataUrl, { x, y, width: size, height: size }, opacity)
    const items = [raster]

    // 添加logo
    if (logo) {
      try {
        const ls = logoSize || size * 0.2
        const { raster: logoRaster } = await loadImageAsRaster(project, logo, {
          x: x + (size - ls) / 2,
          y: y + (size - ls) / 2,
          width: ls,
          height: ls
        }, opacity)

        // 添加白色背景
        const logoBg = new paper.Path.Rectangle({
          point: [x + (size - ls) / 2 - 5, y + (size - ls) / 2 - 5],
          size: [ls + 10, ls + 10],
          fillColor: new paper.Color(backgroundColor),
          radius: 4,
        })
        logoBg.sendToBack()
        items.push(logoRaster)
      } catch (logoErr) {
        // logo 加载失败不影响二维码主体
        console.warn('QR code logo load failed:', logoErr.message)
      }
    }

    return {
      success: true,
      type: 'qrcode',
      items: items.map(i => i.id),
    }
  } catch (err) {
    return {
      success: false,
      error: `Failed to generate QR code: ${err.message}`,
    }
  }
}

module.exports = createQRCode
