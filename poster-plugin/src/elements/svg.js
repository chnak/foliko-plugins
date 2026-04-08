/**
 * SVG 元素
 */

const paper = require('paper')
const fs = require('fs')
const path = require('path')

/**
 * 添加 SVG
 */
async function addSVG(project, args) {
  const { src, x = 0, y = 0, width, height, opacity = 1 } = args

  // 确保 src 是字符串
  if (typeof src !== 'string') {
    return { success: false, error: 'SVG source must be a string' }
  }

  if (!src) {
    return { success: false, error: 'SVG source is required' }
  }

  let svgContent = src

  // 如果是文件路径，读取文件内容
  if (!src.startsWith('<') && !src.startsWith('<?xml')) {
    try {
      let filePath = src
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(process.cwd(), filePath)
      }
      svgContent = fs.readFileSync(filePath, 'utf8')
    } catch (e) {
      return { success: false, error: `Failed to read SVG file: ${e.message}` }
    }
  }

  // 导入 SVG 到指定项目
  let svg
  try {
    svg = project.importSVG(svgContent)
  } catch (e) {
    return { success: false, error: `Failed to import SVG: ${e.message}` }
  }

  if (!svg) {
    return { success: false, error: 'Failed to import SVG' }
  }

  // 确保 SVG 添加到活动层
  if (project && project.activeLayer && svg.parent !== project.activeLayer) {
    project.activeLayer.addChild(svg)
  }

  // 设置位置
  svg.position = new paper.Point(x, y)

  // 设置尺寸
  if (width && height) {
    const scaleX = width / svg.bounds.width
    const scaleY = height / svg.bounds.height
    svg.scale(Math.min(scaleX, scaleY), svg.bounds.center)
  } else if (width) {
    svg.scale(width / svg.bounds.width, svg.bounds.center)
  } else if (height) {
    svg.scale(height / svg.bounds.height, svg.bounds.center)
  }

  // 设置透明度
  if (opacity !== undefined) {
    svg.opacity = opacity
  }

  return {
    success: true,
    id: svg.id,
    type: 'svg',
    width: svg.bounds.width,
    height: svg.bounds.height,
  }
}

/**
 * 创建 SVG 导出
 * 
 * @param {Object} project - Paper.js 项目
 * @param {string} filename - 文件名
 * @param {string} outputDir - 输出目录
 */
function exportSVG(project, filename, outputDir = '.') {
  const svg = project.exportSVG({
    asString: true,
    bounds: 'content',
  })

  const filepath = require('path').join(outputDir, `${filename}.svg`)
  fs.writeFileSync(filepath, svg)

  return {
    success: true,
    filepath,
    filename: `${filename}.svg`,
    size: Buffer.byteLength(svg, 'utf8'),
  }
}

module.exports = { addSVG, exportSVG }
