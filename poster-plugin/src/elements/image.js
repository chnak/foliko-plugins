/**
 * 图片元素
 */

const paper = require('paper')
const fs = require('fs')
const path = require('path')

/**
 * 添加图片（支持本地路径、URL、Base64）
 */
function addImage(project, args) {
  const { src, x, y, width, height, opacity } = args

  try {
    // 转换为绝对路径
    let absolutePath = src
    if (!path.isAbsolute(absolutePath)) {
      absolutePath = path.join(process.cwd(), absolutePath)
    }

    // 检查文件是否存在
    if (!fs.existsSync(absolutePath)) {
      return { success: false, error: `文件不存在: ${absolutePath}` }
    }

    // 读取文件并转为 Base64
    const buffer = fs.readFileSync(absolutePath)
    const ext = path.extname(absolutePath).toLowerCase()
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp'
    }
    const mimeType = mimeTypes[ext] || 'image/png'
    const imageUrl = `data:${mimeType};base64,${buffer.toString('base64')}`

    const raster = new paper.Raster(imageUrl)

    // 等待图片加载完成
    raster.onLoad = () => {
      if (width && height) {
        raster.bounds = new paper.Rectangle(x, y, width, height)
      } else if (width) {
        const scale = width / raster.width
        raster.bounds = new paper.Rectangle(x, y, width, raster.height * scale)
      } else if (height) {
        const scale = height / raster.height
        raster.bounds = new paper.Rectangle(x, y, raster.width * scale, height)
      } else {
        raster.position = new paper.Point(x, y)
      }

      if (opacity !== undefined) raster.opacity = opacity
    }

    return {
      success: true,
      id: raster.id,
      type: 'image',
      path: absolutePath,
    }
  } catch (err) {
    return { success: false, error: `Failed to load image: ${err.message}` }
  }
}

module.exports = addImage
