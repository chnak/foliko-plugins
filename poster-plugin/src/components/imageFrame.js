/**
 * 图片框组件 - 带装饰边框的图片
 * 使用 Paper.js API 实现
 */

const paper = require('paper')

/**
 * 创建图片框组件
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} params - 组件参数
 */
function createImageFrame(project, canvas, params) {
  // 参数验证
  if (!project) {
    return { success: false, error: 'Project is required' }
  }
  if (!canvas) {
    return { success: false, error: 'Canvas is required' }
  }
  if (!params || typeof params !== 'object') {
    return { success: false, error: 'Params must be an object' }
  }
  if (typeof params.src !== 'string') {
    return { success: false, error: 'src must be a string' }
  }
  if (typeof params.x !== 'number' || typeof params.y !== 'number') {
    return { success: false, error: 'x and y must be numbers' }
  }
  if (typeof params.width !== 'number' || typeof params.height !== 'number') {
    return { success: false, error: 'width and height must be numbers' }
  }

  const {
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
  } = params

  const elements = []

  // 辅助函数：创建圆角矩形路径
  function createRoundedRectPath(x, y, w, h, r) {
    const rect = new paper.Path.Rectangle({
      point: [x, y],
      size: [w, h],
      radius: r
    })
    return rect
  }

  // 绘制阴影
  if (shadowBlur > 0) {
    // 使用 Paper.js 的 shadow 功能
    // 注意：Paper.js 对阴影支持有限，这里使用简单实现
  }

  // 绘制外边框（装饰层）
  if (outerWidth > 0) {
    const outerRect = createRoundedRectPath(
      x - outerWidth, 
      y - outerWidth, 
      width + outerWidth * 2, 
      height + outerWidth * 2, 
      radius + outerWidth
    )
    outerRect.fillColor = new paper.Color(outerColor)
    if (project && project.activeLayer) {
      project.activeLayer.addChild(outerRect)
    }
    elements.push({ type: 'path', id: outerRect.id })
  }

  // 绘制内边框
  if (borderWidth > 0) {
    const borderRect = createRoundedRectPath(
      x - borderWidth, 
      y - borderWidth, 
      width + borderWidth * 2, 
      height + borderWidth * 2, 
      radius + borderWidth
    )
    borderRect.fillColor = new paper.Color(borderColor)
    if (project && project.activeLayer) {
      project.activeLayer.addChild(borderRect)
    }
    elements.push({ type: 'path', id: borderRect.id })
  }

  // 创建图片容器（裁剪区域）
  const clipRect = createRoundedRectPath(x, y, width, height, radius)
  
  // 创建裁剪组
  const clipGroup = new paper.Group()
  clipGroup.addChild(clipRect)
  
  if (project && project.activeLayer) {
    project.activeLayer.addChild(clipGroup)
  }
  elements.push({ type: 'group', id: clipGroup.id })

  // 加载并添加图片
  loadImageAsync(src).then((loadedRaster) => {
    if (!loadedRaster) return

    // loadedRaster 已经是 Raster 对象
    const imgWidth = loadedRaster.width
    const imgHeight = loadedRaster.height
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

    loadedRaster.bounds = new paper.Rectangle(drawX, drawY, drawW, drawH)
    
    // 应用裁剪
    loadedRaster.clipped = true
    loadedRaster.clipMask = clipRect
    
    if (project && project.activeLayer) {
      // 将图片添加到裁剪组
      clipGroup.addChild(loadedRaster)
    }
  })

  // 叠加颜色
  if (overlayColor && overlayOpacity > 0) {
    const overlayRect = createRoundedRectPath(x, y, width, height, radius)
    overlayRect.fillColor = new paper.Color(overlayColor)
    overlayRect.fillColor.alpha = overlayOpacity
    if (project && project.activeLayer) {
      project.activeLayer.addChild(overlayRect)
    }
    elements.push({ type: 'path', id: overlayRect.id })
  }

  return {
    success: true,
    elements,
    width: width,
    height: height,
    type: 'imageFrame'
  }
}

// 异步加载图片
function loadImageAsync(src) {
  return new Promise((resolve, reject) => {
    try {
      // 尝试作为 URL 加载
      const raster = new paper.Raster(src)
      
      raster.onLoad = () => {
        // Paper.js Raster 本身就可以使用，不需要 .image
        resolve(raster)
      }
      
      raster.onError = () => {
        // 尝试作为本地文件
        const fs = require('fs')
        const path = require('path')
        
        if (fs.existsSync(src)) {
          const data = fs.readFileSync(src)
          const base64 = data.toString('base64')
          const ext = path.extname(src).slice(1).toLowerCase()
          const mimeType = ext === 'jpg' ? 'jpeg' : ext
          const dataUrl = `data:image/${mimeType};base64,${base64}`
          
          const raster2 = new paper.Raster(dataUrl)
          raster2.onLoad = () => {
            resolve(raster2)
          }
          raster2.onError = () => {
            reject(new Error(`Failed to load image as local file: ${src}`))
          }
        } else {
          reject(new Error(`Image not found and not a valid URL: ${src}`))
        }
      }
    } catch (e) {
      reject(new Error(`Failed to load image: ${e.message}`))
    }
  })
}

module.exports = createImageFrame
