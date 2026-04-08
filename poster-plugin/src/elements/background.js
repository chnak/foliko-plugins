/**
 * 背景元素
 */

const paper = require('paper')
const { loadImageAsRaster } = require('../utils/imageLoader')

/**
 * 添加背景（支持纯色、渐变或图片）
 */
async function addBackground(project, canvas, args) {
  const { color, gradient, image } = args

  if (image) {
    const { raster } = await loadImageAsRaster(project, image, { x: 0, y: 0 })

    raster.onLoad = () => {
      // 计算缩放比例，使图片覆盖整个画布（cover 模式）
      const canvasRatio = canvas.width / canvas.height
      const imageRatio = raster.width / raster.height

      let scaledWidth, scaledHeight, offsetX, offsetY

      if (imageRatio > canvasRatio) {
        // 图片更宽，以高度为基准缩放
        scaledHeight = canvas.height
        scaledWidth = raster.width * (canvas.height / raster.height)
        offsetX = (canvas.width - scaledWidth) / 2
        offsetY = 0
      } else {
        // 图片更高，以宽度为基准缩放
        scaledWidth = canvas.width
        scaledHeight = raster.height * (canvas.width / raster.width)
        offsetX = 0
        offsetY = (canvas.height - scaledHeight) / 2
      }

      raster.bounds = new paper.Rectangle(offsetX, offsetY, scaledWidth, scaledHeight)
      raster.sendToBack()
    }

    return { success: true, message: 'Background image added' }
  }

  if (gradient) {
    const { type, colors, direction } = gradient
    const paperColors = colors.map(c => new paper.Color(c))

    if (type === 'linear') {
      const angle = (direction || 45) * Math.PI / 180
      const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2)
      const start = new paper.Point(
        canvas.width / 2 - Math.cos(angle) * diagonal / 2,
        canvas.height / 2 - Math.sin(angle) * diagonal / 2
      )
      const stop = new paper.Point(
        canvas.width / 2 + Math.cos(angle) * diagonal / 2,
        canvas.height / 2 + Math.sin(angle) * diagonal / 2
      )
      project.activeLayer.fillColor = new paper.Color({
        gradient: { stops: paperColors },
        origin: start,
        destination: stop,
      })
    } else {
      // radial
      const center = new paper.Point(canvas.width / 2, canvas.height / 2)
      const radius = Math.max(canvas.width, canvas.height) / 2
      project.activeLayer.fillColor = new paper.Color({
        gradient: { stops: paperColors },
        origin: center,
        destination: center.add(new paper.Point(radius, 0)),
      })
    }
  } else if (color) {
    project.activeLayer.fillColor = new paper.Color(color)
  } else {
    throw new Error('Must provide color, gradient, or image')
  }

  return { success: true, message: 'Background added' }
}

module.exports = addBackground
