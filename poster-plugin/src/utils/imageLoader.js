/**
 * 图片加载工具 - 使用 canvas loadImage 加载图片（仅支持本地路径）
 */

const { loadImage } = require('canvas')
const paper = require('paper')
const fs = require('fs')
const path = require('path')

/**
 * 解析图片源（仅支持本地路径）
 * @param {string} src - 图片源
 * @returns {Promise<{path: string, type: 'local'}>}
 */
async function resolveImageSource(src) {
  if (!src) {
    throw new Error('Image source is required')
  }

  // 确保 src 是字符串
  if (typeof src !== 'string') {
    throw new Error('Image source must be a string')
  }

  // 本地路径
  let absolutePath = src
  if (!path.isAbsolute(absolutePath)) {
    absolutePath = path.join(process.cwd(), absolutePath)
  }

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`图片文件不存在: ${absolutePath}`)
  }

  return { path: absolutePath, type: 'local' }
}

/**
 * 加载图片并创建 Paper.js Raster
 * @param {paper.Project} project - Paper.js 项目
 * @param {string} src - 图片源
 * @param {Object} bounds - 边界 {x, y, width?, height?}
 * @param {number} opacity - 透明度
 * @returns {Promise<{raster: paper.Raster, cleanup: function}>}
 */
async function loadImageAsRaster(project, src, bounds = {}, opacity = 1) {
  const { x = 0, y = 0, width, height } = bounds

  // 解析图片源
  const { path: imgPath } = await resolveImageSource(src)

  // 使用 canvas loadImage 加载
  const imageData = await loadImage(imgPath)

  // 创建 Paper.js Raster
  const raster = new paper.Raster(imageData)

  // 添加到项目的活动层
  if (project && project.activeLayer) {
    project.activeLayer.addChild(raster)
  }

  // 设置位置和尺寸
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

  return { raster, cleanup: () => {} }
}

module.exports = {
  loadImageAsRaster,
  resolveImageSource,
}
