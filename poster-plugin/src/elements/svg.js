/**
 * SVG 元素
 */

const paper = require('paper')
const fs = require('fs')

/**
 * 添加 SVG
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} args - 组件参数
 * @param {string} args.src - SVG 文件路径或 SVG 字符串
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.width - 宽度
 * @param {number} args.height - 高度
 * @param {number} args.opacity - 透明度 0-1
 */
function addSVG(project, args) {
  const { src, x, y, width, height, opacity } = args

  let svgContent = src

  // 如果是文件路径，读取文件内容
  if (!src.startsWith('<') && !src.startsWith('<?xml')) {
    try {
      svgContent = fs.readFileSync(src, 'utf8')
    } catch (e) {
      return { success: false, error: `Failed to read SVG file: ${e.message}` }
    }
  }

  // 导入 SVG
  const svg = paper.project.importSVG(svgContent)
  
  if (!svg) {
    return { success: false, error: 'Failed to import SVG' }
  }

  // 设置位置
  svg.position = new paper.Point(x, y)

  // 设置尺寸
  if (width && height) {
    svg.bounds.width = width
    svg.bounds.height = height
  } else if (width) {
    svg.scale(width / svg.bounds.width)
  } else if (height) {
    svg.scale(height / svg.bounds.height)
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
