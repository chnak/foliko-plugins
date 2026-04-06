/**
 * 基础元素模块导出
 */

const addRectangle = require('./rectangle')
const addCircle = require('./circle')
const addLine = require('./line')
const addPolygon = require('./polygon')
const addImage = require('./image')
const addText = require('./text')
const addArtText = require('./artText')
const addBackground = require('./background')
const { addSVG, exportSVG } = require('./svg')

module.exports = {
  addRectangle,
  addCircle,
  addLine,
  addPolygon,
  addImage,
  addText,
  addArtText,
  addBackground,
  addSVG,
  exportSVG,
}
