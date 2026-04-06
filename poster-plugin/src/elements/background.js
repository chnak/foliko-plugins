/**
 * 背景元素
 */

const paper = require('paper')

/**
 * 添加背景
 */
function addBackground(project, canvas, args) {
  const { color, gradient } = args

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
    throw new Error('Must provide color or gradient')
  }

  return { success: true, message: 'Background added' }
}

module.exports = addBackground
