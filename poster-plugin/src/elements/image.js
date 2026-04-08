/**
 * 图片元素
 */

const paper = require('paper')
const { loadImageAsRaster } = require('../utils/imageLoader')

/**
 * 添加图片（支持本地路径、URL、Base64）
 */
async function addImage(project, args) {
  const { src, x, y, width, height, opacity } = args

  try {
    const { raster } = await loadImageAsRaster(project, src, { x, y, width, height }, opacity)

    return {
      success: true,
      id: raster.id,
      type: 'image',
      path: src,
    }
  } catch (err) {
    return { success: false, error: `Failed to load image: ${err.message}` }
  }
}

module.exports = addImage
