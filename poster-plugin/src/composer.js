/**
 * 海报组件化生成器
 *
 * 支持 JSON 配置驱动，一次调用生成完整海报
 */

const paper = require('paper')

// 导入新组件
const createButton = require('./components/button')
const createIcon = require('./components/icon')
const createQRCode = require('./components/qrcode')
const createFrame = require('./components/frame')
const createBubble = require('./components/bubble')
const createRibbon = require('./components/ribbon')
const createSeal = require('./components/seal')
const createHighlightText = require('./components/highlightText')
const createBarcode = require('./components/barcode')
const createQuote = require('./components/quote')
const { loadImageAsRaster } = require('./utils/imageLoader')

// 组件包装函数
async function createButtonComponent(project, canvas, args) {
  return await createButton(project, args)
}
async function createIconComponent(project, canvas, args) {
  return await createIcon(project, args)
}
async function createQRCodeComponent(project, canvas, args) {
  return await createQRCode(project, args)
}
async function createFrameComponent(project, canvas, args) {
  return await createFrame(project, args)
}
async function createBubbleComponent(project, canvas, args) {
  return await createBubble(project, args)
}
async function createRibbonComponent(project, canvas, args) {
  return await createRibbon(project, args)
}
async function createSealComponent(project, canvas, args) {
  return await createSeal(project, args)
}
async function createHighlightTextComponent(project, canvas, args) {
  return await createHighlightText(project, args)
}
async function createBarcodeComponent(project, canvas, args) {
  return await createBarcode(project, args)
}
async function createQuoteComponentWrapper(project, canvas, args) {
  return await createQuote(project, canvas, args)
}

/**
 * 辅助函数：将元素添加到活跃层
 */
function addToLayer(project, element) {
  if (project && project.activeLayer && element) {
    if (element.insert) {
      project.activeLayer.addChild(element)
    }
  }
}

/**
 * 辅助函数：批量添加元素到活跃层
 */
function addAllToLayer(project, elements) {
  if (project && project.activeLayer && elements) {
    elements.forEach(el => {
      if (el.id && el.type) {
        const item = project.getItem({ id: el.id })
        if (item) project.activeLayer.addChild(item)
      }
    })
  }
}

/**
 * 组件类型注册表
 */
const COMPONENT_TYPES = {
  // 基础元素
  background: 'background',
  rectangle: 'rectangle',
  circle: 'circle',
  line: 'line',
  polygon: 'polygon',
  text: 'text',
  artText: 'artText',
  image: 'image',
  svg: 'svg',
  imageFrame: 'imageFrame',
  // 布局组件
  columns: 'columns',
  grid: 'grid',
  // 装饰组件
  star: 'star',
  arrow: 'arrow',
  progressCircle: 'progressCircle',
  chip: 'chip',
  chart: 'chart',
  watermark: 'watermark',
  table: 'table',
  // 高级组件
  card: 'card',
  badge: 'badge',
  cta: 'cta',
  feature: 'feature',
  featureGrid: 'featureGrid',
  divider: 'divider',
  avatar: 'avatar',
  progress: 'progress',
  rating: 'rating',
  quote: 'quote',
  statCard: 'statCard',
  tagCloud: 'tagCloud',
  stepper: 'stepper',
  timeline: 'timeline',
  listItem: 'listItem',
  notification: 'notification',
  // 设计组件
  button: 'button',
  icon: 'icon',
  qrcode: 'qrcode',
  frame: 'frame',
  bubble: 'bubble',
  ribbon: 'ribbon',
  seal: 'seal',
  highlightText: 'highlightText',
  barcode: 'barcode',
}

/**
 * 从配置创建海报
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} config - 海报配置
 * @returns {Object} 创建结果
 */
async function createFromConfig(project, canvas, config) {
  const { components = [] } = config
  const results = []

  for (const component of components) {
    const result = await createComponent(project, canvas, component)
    results.push(result)
  }

  // 将所有创建的元素添加到活动层
  if (project && project.activeLayer) {
    project.activeLayer.addChildren(project.layers.flatMap(l => l.children))
  }

  return {
    success: true,
    componentCount: results.length,
    results,
  }
}

/**
 * 根据配置创建单个组件
 */
async function createComponent(project, canvas, config) {
  const { type, ...args } = config

  switch (type) {
    // 基础元素
    case 'background':
      return await createBackgroundElement(project, canvas, args)
    case 'rectangle':
      return createRectangleElement(project, args)
    case 'circle':
      return createCircleElement(project, args)
    case 'line':
      return createLineElement(project, args)
    case 'polygon':
      return createPolygonElement(project, args)
    case 'text':
      return createTextElement(project, args)
    case 'artText':
      return await createArtTextElement(project, args)
    case 'richText':
      return await createRichTextElement(project, args)
    case 'image':
      return await createImageElement(project, args)
    case 'svg':
      return await createSVGElement(project, args)
    case 'imageFrame':
      return await createImageFrameComponent(project, canvas, args)
    case 'columns':
      return await createColumnsComponent(project, canvas, args)
    case 'grid':
      return await createGridComponent(project, canvas, args)

    // 装饰组件
    case 'star':
      return await createStarComponent(project, canvas, args)
    case 'arrow':
      return await createArrowComponent(project, canvas, args)
    case 'progressCircle':
      return await createProgressCircleComponent(project, canvas, args)
    case 'chip':
      return await createChipComponent(project, canvas, args)
    case 'chart':
      return await createChartComponent(project, canvas, args)
    case 'watermark':
      return await createWatermarkComponent(project, canvas, args)
    case 'table':
      return await createTableComponent(project, canvas, args)

    // 高级组件
    case 'card':
      return await createCardComponent(project, canvas, args)
    case 'badge':
      return await createBadgeComponent(project, canvas, args)
    case 'cta':
      return await createCTAComponent(project, canvas, args)
    case 'feature':
      return await createFeatureComponent(project, canvas, args)
    case 'featureGrid':
      return await createFeatureGridComponent(project, canvas, args)
    case 'divider':
      return await createDividerComponent(project, canvas, args)
    case 'avatar':
      return await createAvatarComponent(project, canvas, args)
    case 'progress':
      return await createProgressComponent(project, canvas, args)
    case 'rating':
      return await createRatingComponent(project, canvas, args)
    case 'quote':
      return await createQuoteComponentWrapper(project, canvas, args)
    case 'statCard':
      return await createStatCardComponent(project, canvas, args)
    case 'tagCloud':
      return await createTagCloudComponent(project, canvas, args)
    case 'stepper':
      return await createStepperComponent(project, canvas, args)
    case 'timeline':
      return await createTimelineComponent(project, canvas, args)
    case 'listItem':
      return await createListItemComponent(project, canvas, args)
    case 'notification':
      return await createNotificationComponent(project, canvas, args)

    // 设计组件
    case 'button':
      return await createButtonComponent(project, canvas, args)
    case 'icon':
      return await createIconComponent(project, canvas, args)
    case 'qrcode':
      return await createQRCodeComponent(project, canvas, args)
    case 'frame':
      return await createFrameComponent(project, canvas, args)
    case 'bubble':
      return await createBubbleComponent(project, canvas, args)
    case 'ribbon':
      return await createRibbonComponent(project, canvas, args)
    case 'seal':
      return await createSealComponent(project, canvas, args)
    case 'highlightText':
      return await createHighlightTextComponent(project, canvas, args)
    case 'barcode':
      return createBarcodeComponent(project, canvas, args)

    default:
      return { success: false, error: `Unknown component type: ${type}` }
  }
}

// ============= 基础元素创建函数 =============

function createBackgroundElement(project, canvas, { color, gradient, image }) {
  if (image) {
    const fs = require('fs')
    const path = require('path')

    // 确保 image 是字符串
    if (typeof image !== 'string') {
      return { success: false, error: 'Background image must be a string' }
    }

    // 本地文件路径
    let absolutePath = image
    if (!path.isAbsolute(absolutePath)) {
      absolutePath = path.join(process.cwd(), absolutePath)
    }

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`背景图片文件不存在: ${absolutePath}`)
    }

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

    // 添加到项目活动层
    if (project && project.activeLayer) {
      project.activeLayer.addChild(raster)
    }

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
  } else if (gradient) {
    const paperColors = gradient.colors.map(c => new paper.Color(c))
    const { type, direction } = gradient

    if (type === 'linear') {
      const angle = (direction || 45) * Math.PI / 180
      const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const start = new paper.Point(
        centerX - Math.cos(angle) * diagonal / 2,
        centerY - Math.sin(angle) * diagonal / 2
      )
      const stop = new paper.Point(
        centerX + Math.cos(angle) * diagonal / 2,
        centerY + Math.sin(angle) * diagonal / 2
      )
      project.activeLayer.fillColor = new paper.Color({
        gradient: { stops: paperColors },
        origin: start,
        destination: stop,
      })
    } else {
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
  }

  return { success: true, type: 'background' }
}

function createRectangleElement(project, { x, y, width, height, fill, stroke, strokeWidth, radius, opacity }) {
  const rect = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius || 0,
  })

  if (fill) rect.fillColor = new paper.Color(fill)
  if (stroke) {
    rect.strokeColor = new paper.Color(stroke)
    rect.strokeWidth = strokeWidth || 1
  }
  if (opacity !== undefined) rect.opacity = opacity

  if (project && project.activeLayer) {
    project.activeLayer.addChild(rect)
  }

  return { success: true, id: rect.id, type: 'rectangle' }
}

function createCircleElement(project, { x, y, cx, cy, radius, rx, ry, fill, stroke, strokeWidth, opacity }) {
  // 兼容 x, y, radius 或 cx, cy, rx, ry 格式
  const centerX = cx || x
  const centerY = cy || y
  const radiusX = rx || radius || 30
  const radiusY = ry || radius || 30

  const circle = new paper.Path.Ellipse({
    center: [centerX, centerY],
    radius: [radiusX, radiusY],
  })

  if (fill) circle.fillColor = new paper.Color(fill)
  if (stroke) {
    circle.strokeColor = new paper.Color(stroke)
    circle.strokeWidth = strokeWidth || 1
  }
  if (opacity !== undefined) circle.opacity = opacity

  if (project && project.activeLayer) {
    project.activeLayer.addChild(circle)
  }

  return { success: true, id: circle.id, type: 'circle' }
}

function createLineElement(project, { x1, y1, x2, y2, stroke, strokeWidth }) {
  const line = new paper.Path.Line({
    from: [x1, y1],
    to: [x2, y2],
    strokeColor: new paper.Color(stroke || '#ffffff'),
    strokeWidth: strokeWidth || 2,
  })

  if (project && project.activeLayer) {
    project.activeLayer.addChild(line)
  }

  return { success: true, id: line.id, type: 'line' }
}

function createPolygonElement(project, { cx, cy, radius, sides, fill, stroke, strokeWidth, opacity }) {
  const polygon = new paper.Path.RegularPolygon({
    center: [cx, cy],
    radius: radius,
    sides: sides,
  })

  if (fill) polygon.fillColor = new paper.Color(fill)
  if (stroke) {
    polygon.strokeColor = new paper.Color(stroke)
    polygon.strokeWidth = strokeWidth || 1
  }
  if (opacity !== undefined) polygon.opacity = opacity

  if (project && project.activeLayer) {
    project.activeLayer.addChild(polygon)
  }

  return { success: true, id: polygon.id, type: 'polygon' }
}

function createTextElement(project, { text, x, y, fontSize, fontFamily, color, align, shadow }) {
  const { validateFont, getDefaultFontFamily, getFontFallbackChain } = require('./fonts')

  const fontSizeVal = fontSize || 48
  const textColor = color || '#ffffff'
  const alignment = align || 'left'

  // 计算文字宽度用于居中/右对齐
  let offsetX = 0
  if (alignment === 'center' || alignment === 'right') {
    // 估算文字宽度：中文约 1.0 倍字体大小，英文约 0.5 倍
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const otherChars = text.length - chineseChars
    const textWidth = chineseChars * fontSizeVal * 1.0 + otherChars * fontSizeVal * 0.5

    if (alignment === 'center') {
      offsetX = -textWidth / 2
    } else if (alignment === 'right') {
      offsetX = -textWidth
    }
  }

  // 获取字体链（支持 @napi-rs/canvas 字体回退）
  const chain = getFontFallbackChain(fontFamily, text)
  const finalFontFamily = chain.length === 1 ? chain[0] : chain.join(', ')

  const textItem = new paper.PointText({
    point: [x + offsetX, y],
    content: text,
    fontSize: fontSizeVal,
    fontFamily: finalFontFamily,
    fillColor: new paper.Color(textColor),
    justification: alignment,
  })

  if (shadow) {
    textItem.shadowColor = new paper.Color(shadow.color)
    textItem.shadowBlur = shadow.blur || 5
    textItem.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
  }

  if (project && project.activeLayer) {
    project.activeLayer.addChild(textItem)
  }

  return { success: true, id: textItem.id, type: 'text' }
}

function createArtTextElement(project, { text, x, y, fontSize, fontFamily, gradient, strokeColor, strokeWidth, shadow }) {
  const { getFontFallbackChain } = require('./fonts')

  // 获取字体链
  const chain = getFontFallbackChain(fontFamily, text)
  const finalFont = chain.length === 1 ? chain[0] : chain.join(', ')

  const textItem = new paper.PointText({
    point: [x, y],
    content: text,
    fontSize: fontSize || 120,
    fontFamily: finalFont,
    fillColor: gradient ? new paper.Color(gradient.colors[0]) : new paper.Color('#ffffff'),
    justification: 'center',
  })

  if (gradient && gradient.colors.length > 0) {
    const colors = gradient.colors.map(c => new paper.Color(c))
    textItem.fillColor = new paper.Color({
      gradient: { stops: colors },
      origin: textItem.bounds.topLeft,
      destination: textItem.bounds.topRight,
    })
  }

  if (strokeColor) {
    textItem.strokeColor = new paper.Color(strokeColor)
    textItem.strokeWidth = strokeWidth || 2
  }

  if (shadow) {
    textItem.shadowColor = new paper.Color(shadow.color)
    textItem.shadowBlur = shadow.blur || 10
    textItem.shadowOffset = new paper.Point(shadow.offsetX || 3, shadow.offsetY || 3)
  }

  if (project && project.activeLayer) {
    project.activeLayer.addChild(textItem)
  }

  return { success: true, id: textItem.id, type: 'artText' }
}

async function createImageElement(project, { src, x = 0, y = 0, width, height, opacity = 1 }) {
  try {
    const { raster } = await loadImageAsRaster(project, src, { x, y, width, height }, opacity)

    return {
      success: true,
      id: raster.id,
      type: 'image',
    }
  } catch (err) {
    return { success: false, error: `Failed to load image: ${err.message}` }
  }
}

/**
 * 创建富文本元素（支持多行文本和自动换行）
 */
function createRichTextElement(project, {
  x = 0,
  y = 0,
  width,
  text = '',
  fontSize = 48,
  fontFamily = 'sans-serif',
  color = '#ffffff',
  align = 'left',
  lineHeight = fontSize * 1.4,
  letterSpacing = 0,
  opacity = 1,
  rotation = 0,
  shadow = null,
}) {
  const { getFontFallbackChain } = require('./fonts')

  // 获取字体链
  const chain = getFontFallbackChain(fontFamily, text)
  const finalFontFamily = chain.length === 1 ? chain[0] : chain.join(', ')

  // 估算字符宽度（中文约等于 fontSize，英文约等于 fontSize * 0.5）
  const getCharWidth = (char) => {
    return /[\u4e00-\u9fa5]/.test(char) ? fontSize : fontSize * 0.5
  }

  // 计算文本宽度
  const calcTextWidth = (str) => {
    let width = 0
    for (const char of str) {
      width += getCharWidth(char)
    }
    return width + (str.length - 1) * letterSpacing
  }

  // 处理自动换行
  const lines = []
  if (width) {
    const paragraphs = text.split('\n')
    for (const paragraph of paragraphs) {
      if (!paragraph) {
        lines.push('')
        continue
      }
      let currentLine = ''
      let currentWidth = 0
      for (const char of paragraph) {
        const charWidth = getCharWidth(char) + letterSpacing
        if (currentWidth + charWidth > width && currentLine) {
          lines.push(currentLine)
          currentLine = char
          currentWidth = charWidth
        } else {
          currentLine += char
          currentWidth += charWidth
        }
      }
      if (currentLine) {
        lines.push(currentLine)
      }
    }
  } else {
    lines.push(text)
  }

  // 创建文本元素组
  const group = new paper.Group()
  const textItems = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineY = y + i * lineHeight

    // 计算对齐偏移
    let offsetX = 0
    if (align === 'center' && width) {
      offsetX = (width - calcTextWidth(line)) / 2
    } else if (align === 'right' && width) {
      offsetX = width - calcTextWidth(line)
    }

    const textItem = new paper.PointText({
      point: [x + offsetX, lineY + fontSize],
      content: line,
      fontSize: fontSize,
      fontFamily: finalFontFamily,
      fillColor: new paper.Color(color),
      justification: align,
    })

    if (letterSpacing !== 0) {
      textItem.letterSpacing = letterSpacing
    }

    if (opacity !== 1) {
      textItem.opacity = opacity
    }

    if (rotation !== 0) {
      textItem.rotate(rotation, new paper.Point(x, y))
    }

    if (shadow) {
      textItem.shadowColor = new paper.Color(shadow.color || 'rgba(0,0,0,0.5)')
      textItem.shadowBlur = shadow.blur || 5
      textItem.shadowOffset = new paper.Point(shadow.offsetX || 2, shadow.offsetY || 2)
    }

    textItems.push(textItem)
    group.addChild(textItem)
  }

  // 添加到项目
  if (project && project.activeLayer) {
    project.activeLayer.addChild(group)
  }

  return {
    success: true,
    id: group.id,
    type: 'richText',
    lines: lines.length,
    height: lines.length * lineHeight,
  }
}

const fs = require('fs')

async function createSVGElement(project, { src, x = 0, y = 0, width, height, opacity = 1 }) {
  const fs = require('fs')
  const path = require('path')

  // 确保 src 是字符串
  if (typeof src !== 'string') {
    return { success: false, error: 'SVG source must be a string' }
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

// ============= 高级组件创建函数 =============

function createCardComponent(project, canvas, {
  x, y, width, height,
  background, border, borderWidth, radius,
  title, titleSize, titleColor,
  subtitle, subtitleSize, subtitleColor,
  padding = 20,
}) {
  const elements = []

  // 卡片背景
  const card = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius || 0,
  })
  card.fillColor = new paper.Color(background || '#ffffff')
  if (border) {
    card.strokeColor = new paper.Color(border)
    card.strokeWidth = borderWidth || 1
  }
  elements.push({ type: 'rectangle', id: card.id })

  // 标题
  if (title) {
    const titleText = new paper.PointText({
      point: [x + padding, y + padding + (titleSize || 24)],
      content: title,
      fontSize: titleSize || 24,
      fillColor: new paper.Color(titleColor || '#000000'),
      justification: 'left',
    })
    elements.push({ type: 'text', id: titleText.id })
  }

  // 副标题
  if (subtitle) {
    const subY = title ? y + padding + (titleSize || 24) + (subtitleSize || 16) + 10 : y + padding
    const subtitleText = new paper.PointText({
      point: [x + padding, subY],
      content: subtitle,
      fontSize: subtitleSize || 16,
      fillColor: new paper.Color(subtitleColor || '#666666'),
      justification: 'left',
    })
    elements.push({ type: 'text', id: subtitleText.id })
  }

  return { success: true, elements, type: 'card' }
}

function createBadgeComponent(project, canvas, {
  x, y, text,
  background = '#007bff', color = '#ffffff',
  border, fontSize = 18, padding = 15, radius = 4,
}) {
  const textWidth = text.length * fontSize * 0.6
  const badgeWidth = textWidth + padding * 2
  const badgeHeight = fontSize + padding * 2
  const badgeX = x - badgeWidth / 2

  const badge = new paper.Path.Rectangle({
    point: [badgeX, y],
    size: [badgeWidth, badgeHeight],
    radius: radius,
  })
  badge.fillColor = new paper.Color(background)
  if (border) badge.strokeColor = new paper.Color(border)

  const badgeText = new paper.PointText({
    point: [x, y + badgeHeight / 2 + fontSize / 3],
    content: text,
    fontSize: fontSize,
    fillColor: new paper.Color(color),
    justification: 'center',
  })

  return { success: true, elements: [{ type: 'rectangle', id: badge.id }, { type: 'text', id: badgeText.id }], type: 'badge' }
}

function createCTAComponent(project, canvas, {
  x, y, text,
  background = '#007bff', color = '#ffffff',
  border, fontSize = 20, padding = 25, radius = 8, shadow,
  width: customWidth,
}) {
  // 确保 text 是字符串
  const textStr = String(text || '')
  // 使用更准确的字符宽度估算：中文约1.0，英文约0.5
  const chineseChars = (textStr.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherChars = textStr.length - chineseChars
  const textWidth = chineseChars * fontSize * 1.0 + otherChars * fontSize * 0.5
  const btnWidth = customWidth || (textWidth + padding * 2)
  const btnHeight = fontSize + padding * 2
  const btnX = x - btnWidth / 2

  const button = new paper.Path.Rectangle({
    point: [btnX, y],
    size: [btnWidth, btnHeight],
    radius: radius,
  })
  button.fillColor = new paper.Color(background)
  if (border) button.strokeColor = new paper.Color(border)

  if (shadow) {
    button.shadowColor = new paper.Color(shadow.color || 'rgba(0,0,0,0.3)')
    button.shadowBlur = shadow.blur || 10
    button.shadowOffset = new paper.Point(shadow.offsetX || 0, shadow.offsetY || 4)
  }

  const buttonText = new paper.PointText({
    point: [x, y + btnHeight / 2 + fontSize / 3],
    content: textStr,
    fontSize: fontSize,
    fillColor: new paper.Color(color),
    justification: 'center',
  })

  // 添加到项目
  if (project && project.activeLayer) {
    project.activeLayer.addChild(button)
    project.activeLayer.addChild(buttonText)
  }

  return { success: true, elements: [{ type: 'rectangle', id: button.id }, { type: 'text', id: buttonText.id }], type: 'cta' }
}

function createFeatureComponent(project, canvas, {
  x, y, width,
  icon, title, description,
  iconColor = '#007bff', titleColor = '#ffffff', descColor = '#aaaaaa',
  iconSize = 32, titleSize = 20, descSize = 14,
}) {
  const elements = []
  const padding = 15
  let currentY = y

  if (icon) {
    elements.push(new paper.PointText({
      point: [x + padding, currentY + iconSize],
      content: icon,
      fontSize: iconSize,
      fillColor: new paper.Color(iconColor),
      justification: 'left',
    }))
    currentY += iconSize + 5
  }

  if (title) {
    elements.push(new paper.PointText({
      point: [x + padding, currentY + titleSize],
      content: title,
      fontSize: titleSize,
      fillColor: new paper.Color(titleColor),
      justification: 'left',
    }))
    currentY += titleSize + 5
  }

  if (description) {
    elements.push(new paper.PointText({
      point: [x + padding, currentY + descSize],
      content: description,
      fontSize: descSize,
      fillColor: new paper.Color(descColor),
      justification: 'left',
    }))
  }

  return { success: true, elements, type: 'feature' }
}

function createFeatureGridComponent(project, canvas, {
  x, y,
  columns = 3, itemWidth = 200, itemHeight = 120, gap = 20,
  items = [],
  background = '#1a1a2e', borderColor = '#00d9ff', radius = 8,
}) {
  const elements = []

  // 确保 items 是数组
  if (!Array.isArray(items)) {
    items = []
  }

  const rows = items.length > 0 ? Math.ceil(items.length / columns) : 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const col = i % columns
    const row = Math.floor(i / columns)
    const itemX = x + col * (itemWidth + gap)
    const itemY = y + row * (itemHeight + gap)

    const bg = new paper.Path.Rectangle({
      point: [itemX, itemY],
      size: [itemWidth, itemHeight],
      radius: radius,
    })
    bg.fillColor = new paper.Color(background)
    bg.strokeColor = new paper.Color(borderColor)
    bg.strokeWidth = 0.5
    bg.opacity = 0.8
    elements.push(bg)

    // 添加到项目
    if (project && project.activeLayer) {
      project.activeLayer.addChild(bg)
    }

    const padding = 15
    let offsetY = itemY + padding

    if (item.icon) {
      const iconText = new paper.PointText({
        point: [itemX + padding, offsetY + 24],
        content: item.icon,
        fontSize: 28,
        fillColor: new paper.Color(item.iconColor || '#00ff88'),
        justification: 'left',
      })
      elements.push(iconText)
      if (project && project.activeLayer) {
        project.activeLayer.addChild(iconText)
      }
      offsetY += 35
    }

    if (item.title) {
      const titleText = new paper.PointText({
        point: [itemX + padding, offsetY + 18],
        content: item.title,
        fontSize: 16,
        fillColor: new paper.Color(item.titleColor || '#ffffff'),
        justification: 'left',
      })
      elements.push(titleText)
      if (project && project.activeLayer) {
        project.activeLayer.addChild(titleText)
      }
      offsetY += 22
    }

    if (item.description) {
      const descText = new paper.PointText({
        point: [itemX + padding, offsetY + 14],
        content: item.description,
        fontSize: 12,
        fillColor: new paper.Color(item.descColor || '#888888'),
        justification: 'left',
      })
      elements.push(descText)
      if (project && project.activeLayer) {
        project.activeLayer.addChild(descText)
      }
    }
  }

  return {
    success: true,
    elements,
    type: 'featureGrid',
    width: columns * itemWidth + (columns - 1) * gap,
    height: rows * itemHeight + Math.max(0, rows - 1) * gap,
    rows,
    cols: columns,
  }
}

function createDividerComponent(project, canvas, {
  x, y, width, color = '#00d9ff', thickness = 1, style = 'solid', align = 'center',
}) {
  let startX = x
  let endX = x + width

  if (align === 'center') {
    startX = x - width / 2
    endX = x + width / 2
  } else if (align === 'right') {
    startX = x - width
    endX = x
  }

  const line = new paper.Path.Line({
    from: [startX, y],
    to: [endX, y],
    strokeColor: new paper.Color(color),
    strokeWidth: thickness,
  })

  if (style === 'dashed') line.dashArray = [10, 5]

  return { success: true, id: line.id, type: 'divider' }
}

module.exports = {
  createFromConfig,
  createComponent,
  COMPONENT_TYPES,
}


// ============= 新增组件创建函数 =============

function createAvatarComponent(project, canvas, { x, y, size = 80, initials, background = '#6366f1', border, borderWidth = 0, color = '#ffffff' }) {
  const elements = []
  const radius = size / 2

  const circle = new paper.Path.Circle({
    center: [x, y],
    radius: radius,
  })
  circle.fillColor = new paper.Color(background)
  if (border) {
    circle.strokeColor = new paper.Color(border)
    circle.strokeWidth = borderWidth
  }
  elements.push({ type: 'circle', id: circle.id })

  if (initials) {
    const text = new paper.PointText({
      point: [x, y + size / 6],
      content: initials.charAt(0).toUpperCase(),
      fontSize: size * 0.4,
      fillColor: new paper.Color(color),
      justification: 'center',
    })
    elements.push({ type: 'text', id: text.id })
  }

  return { success: true, elements, type: 'avatar', size }
}

function createProgressComponent(project, canvas, { x, y, width = 300, height = 20, value = 50, trackColor = '#e0e0e0', fillColor = '#6366f1', radius = 10, showLabel = false, label }) {
  const elements = []

  const track = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius,
  })
  track.fillColor = new paper.Color(trackColor)
  elements.push({ type: 'rectangle', id: track.id })

  const progressWidth = (value / 100) * width
  if (progressWidth > 0) {
    const fill = new paper.Path.Rectangle({
      point: [x, y],
      size: [progressWidth, height],
      radius: radius,
    })
    fill.fillColor = new paper.Color(fillColor)
    elements.push({ type: 'rectangle', id: fill.id })
  }

  if (showLabel && label) {
    const labelText = new paper.PointText({
      point: [x + width / 2, y - 8],
      content: label,
      fontSize: 14,
      fillColor: new paper.Color('#666666'),
      justification: 'center',
    })
    elements.push({ type: 'text', id: labelText.id })
  }

  return { success: true, elements, value }
}

function createRatingComponent(project, canvas, { x, y, value = 4, max = 5, size = 24, filledColor = '#fbbf24', emptyColor = '#e5e7eb', gap = 4 }) {
  const elements = []

  for (let i = 0; i < max; i++) {
    const starX = x + i * (size + gap)
    const filled = i < Math.floor(value)

    const star = new paper.Path.Star({
      center: [starX + size / 2, y + size / 2],
      points: 5,
      radius1: size / 4,
      radius2: size / 2,
    })
    star.fillColor = new paper.Color(filled ? filledColor : emptyColor)
    elements.push({ type: 'polygon', id: star.id })
  }

  return { success: true, elements, value }
}

function createQuoteComponent(project, canvas, { x, y, width = 400, text, author, background = '#f8fafc', borderColor = '#6366f1', borderWidth = 4, padding = 20, radius = 8, textColor = '#1e293b', authorColor = '#64748b', fontSize = 18 }) {
  const elements = []
  const lineHeight = 22

  const bg = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, author ? 80 + fontSize * 2 : 40 + fontSize * 1.5],
    radius: radius,
  })
  bg.fillColor = new paper.Color(background)
  elements.push({ type: 'rectangle', id: bg.id })

  const border = new paper.Path.Rectangle({
    point: [x, y],
    size: [borderWidth, author ? 80 + fontSize * 2 : 40 + fontSize * 1.5],
  })
  border.fillColor = new paper.Color(borderColor)
  elements.push({ type: 'rectangle', id: border.id })

  const quoteMark = new paper.PointText({
    point: [x + padding + 10, y + padding + fontSize],
    content: '"',
    fontSize: fontSize * 2,
    fillColor: new paper.Color(borderColor),
    justification: 'left',
  })
  elements.push({ type: 'text', id: quoteMark.id })

  const quoteText = new paper.PointText({
    point: [x + padding + 30, y + padding + fontSize * 1.5],
    content: text,
    fontSize: fontSize,
    fillColor: new paper.Color(textColor),
    justification: 'left',
  })
  elements.push({ type: 'text', id: quoteText.id })

  if (author) {
    const authorText = new paper.PointText({
      point: [x + padding, y + padding + fontSize * 2.5 + 10],
      content: `— ${author}`,
      fontSize: fontSize * 0.8,
      fillColor: new paper.Color(authorColor),
      justification: 'left',
    })
    elements.push({ type: 'text', id: authorText.id })
  }

  return { success: true, elements, type: 'quote' }
}

function createStatCardComponent(project, canvas, { x, y, width = 200, height = 120, label = 'Total', value = '0', change, positive = true, icon, iconColor = '#6366f1', background = '#ffffff', border = '#e5e7eb', radius = 12 }) {
  const elements = []

  const bg = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius,
  })
  bg.fillColor = new paper.Color(background)
  bg.strokeColor = new paper.Color(border)
  bg.strokeWidth = 1
  elements.push({ type: 'rectangle', id: bg.id })

  if (icon) {
    elements.push(new paper.PointText({
      point: [x + 20, y + 35],
      content: icon,
      fontSize: 24,
      fillColor: new paper.Color(iconColor),
      justification: 'left',
    }))
  }

  elements.push(new paper.PointText({
    point: [x + 20, y + 50 + (icon ? 10 : 0)],
    content: label,
    fontSize: 14,
    fillColor: new paper.Color('#64748b'),
    justification: 'left',
  }))

  elements.push(new paper.PointText({
    point: [x + 20, y + 75 + (icon ? 10 : 0)],
    content: value,
    fontSize: 28,
    fillColor: new paper.Color('#1e293b'),
    justification: 'left',
  }))

  if (change) {
    const changeColor = positive ? '#22c55e' : '#ef4444'
    const changeIcon = positive ? '↑' : '↓'
    elements.push(new paper.PointText({
      point: [x + 20, y + 95 + (icon ? 10 : 0)],
      content: `${changeIcon} ${change}`,
      fontSize: 14,
      fillColor: new paper.Color(changeColor),
      justification: 'left',
    }))
  }

  return { success: true, elements, type: 'statCard' }
}

function createTagCloudComponent(project, canvas, { x, y, tags = [], fontSize = 14, padding = 12, gap = 10, maxWidth = 400 }) {
  const elements = []

  // 确保 tags 是数组
  if (!Array.isArray(tags) || tags.length === 0) {
    return { success: true, elements: [], type: 'tagCloud', height: 0 }
  }

  let currentX = x
  let currentY = y
  let rowHeight = 0

  for (const tag of tags) {
    // 确保 tag.text 是字符串
    const tagText = String(tag.text || '')
    if (!tagText) continue

    const textWidth = tagText.length * fontSize * 0.6
    const tagWidth = textWidth + padding * 2
    const tagHeight = fontSize + padding * 2

    if (currentX + tagWidth > x + maxWidth && currentX > x) {
      currentX = x
      currentY += rowHeight + gap
      rowHeight = 0
    }

    const tagBg = new paper.Path.Rectangle({
      point: [currentX, currentY],
      size: [tagWidth, tagHeight],
      radius: tagHeight / 2,
    })
    tagBg.fillColor = new paper.Color(tag.bgColor || '#e0e7ff')
    elements.push({ type: 'rectangle', id: tagBg.id })

    // 添加到项目
    if (project && project.activeLayer) {
      project.activeLayer.addChild(tagBg)
    }

    const tagTextEl = new paper.PointText({
      point: [currentX + tagWidth / 2, currentY + tagHeight / 2 + fontSize / 3],
      content: tagText,
      fontSize: fontSize,
      fillColor: new paper.Color(tag.color || '#4338ca'),
      justification: 'center',
    })
    elements.push(tagTextEl)
    if (project && project.activeLayer) {
      project.activeLayer.addChild(tagTextEl)
    }

    currentX += tagWidth + gap
    rowHeight = Math.max(rowHeight, tagHeight)
  }

  return { success: true, elements, type: 'tagCloud', height: rowHeight }
}

function createStepperComponent(project, canvas, { x, y, width = 600, steps = [], currentStep = 0, activeColor = '#6366f1', inactiveColor = '#e5e7eb', completedColor = '#22c55e', circleSize = 40 }) {
  const elements = []
  const stepWidth = steps.length > 1 ? width / (steps.length - 1) : width
  const lineY = y + circleSize / 2

  if (steps.length > 1) {
    elements.push({
      type: 'line',
      id: new paper.Path.Line({
        from: [x + circleSize / 2, lineY],
        to: [x + width - circleSize / 2, lineY],
        strokeColor: new paper.Color(inactiveColor),
        strokeWidth: 2,
      }).id
    })
  }

  for (let i = 0; i < steps.length; i++) {
    const stepX = steps.length > 1 ? x + i * stepWidth : x
    let color = inactiveColor
    if (i < currentStep) color = completedColor
    else if (i === currentStep) color = activeColor

    const circle = new paper.Path.Circle({
      center: [stepX + circleSize / 2, lineY],
      radius: circleSize / 2,
    })
    circle.fillColor = new paper.Color(color)
    elements.push({ type: 'circle', id: circle.id })

    const icon = i < currentStep ? '✓' : String(i + 1)
    elements.push(new paper.PointText({
      point: [stepX + circleSize / 2, lineY + circleSize / 6],
      content: icon,
      fontSize: 16,
      fillColor: new paper.Color('#ffffff'),
      justification: 'center',
    }))

    elements.push(new paper.PointText({
      point: [stepX + circleSize / 2, y + circleSize + 20],
      content: steps[i].title || `Step ${i + 1}`,
      fontSize: 14,
      fillColor: new paper.Color(i <= currentStep ? '#1e293b' : '#94a3b8'),
      justification: 'center',
    }))

    if (steps[i].description) {
      elements.push(new paper.PointText({
        point: [stepX + circleSize / 2, y + circleSize + 38],
        content: steps[i].description,
        fontSize: 11,
        fillColor: new paper.Color('#94a3b8'),
        justification: 'center',
      }))
    }
  }

  return { success: true, elements, type: 'stepper' }
}

function createTimelineComponent(project, canvas, { x, y, width = 500, items = [], lineColor = '#e2e8f0', dotColor = '#6366f1', dotSize = 16, gap = 60 }) {
  const elements = []

  // 确保 items 是数组
  if (!Array.isArray(items) || items.length === 0) {
    return { success: true, elements: [], type: 'timeline', height: 0 }
  }

  const centerX = x + 80
  const contentX = x + 120

  if (items.length > 1) {
    const mainLine = new paper.Path.Line({
      from: [centerX, y + dotSize / 2],
      to: [centerX, y + (items.length - 1) * gap + dotSize / 2],
      strokeColor: new paper.Color(lineColor),
      strokeWidth: 2,
    })
    elements.push({ type: 'line', id: mainLine.id })
    if (project && project.activeLayer) {
      project.activeLayer.addChild(mainLine)
    }
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item) continue

    const itemY = y + i * gap
    const isActive = item.active !== false

    const dot = new paper.Path.Circle({
      center: [centerX, itemY + dotSize / 2],
      radius: dotSize / 2,
    })
    dot.fillColor = new paper.Color(isActive ? dotColor : lineColor)
    elements.push({ type: 'circle', id: dot.id })
    if (project && project.activeLayer) {
      project.activeLayer.addChild(dot)
    }

    if (item.date) {
      const dateText = new paper.PointText({
        point: [x + 10, itemY + dotSize / 2 + 5],
        content: item.date,
        fontSize: 12,
        fillColor: new paper.Color('#94a3b8'),
        justification: 'left',
      })
      elements.push(dateText)
      if (project && project.activeLayer) {
        project.activeLayer.addChild(dateText)
      }
    }

    const titleText = new paper.PointText({
      point: [contentX, itemY + dotSize / 2 + 5],
      content: item.title || `Event ${i + 1}`,
      fontSize: 16,
      fillColor: new paper.Color(isActive ? '#1e293b' : '#94a3b8'),
      justification: 'left',
    })
    elements.push(titleText)
    if (project && project.activeLayer) {
      project.activeLayer.addChild(titleText)
    }

    if (item.description) {
      const descText = new paper.PointText({
        point: [contentX, itemY + dotSize / 2 + 28],
        content: item.description,
        fontSize: 13,
        fillColor: new paper.Color('#64748b'),
        justification: 'left',
      })
      elements.push(descText)
      if (project && project.activeLayer) {
        project.activeLayer.addChild(descText)
      }
    }
  }

  return { success: true, elements, type: 'timeline', height: items.length * gap }
}

function createListItemComponent(project, canvas, { x = 0, y = 0, width = 400, icon = '→', title, description, badge, badgeColor = '#6366f1', iconColor = '#6366f1', background = '#ffffff', borderColor = '#e5e7eb', height = 60, radius = 8 }) {
  const elements = []

  // 添加到项目活动层
  const addToProject = (item) => {
    if (project && project.activeLayer) {
      project.activeLayer.addChild(item)
    }
    elements.push(item)
  }

  const bg = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius,
  })
  bg.fillColor = new paper.Color(background)
  bg.strokeColor = new paper.Color(borderColor)
  bg.strokeWidth = 1
  addToProject(bg)

  const iconText = new paper.PointText({
    point: [x + 15, y + height / 2 + 6],
    content: icon,
    fontSize: 20,
    fillColor: new paper.Color(iconColor),
    justification: 'center',
  })
  addToProject(iconText)

  const titleText = new paper.PointText({
    point: [x + 50, y + height / 2 - 5],
    content: title || 'List Item',
    fontSize: 16,
    fillColor: new paper.Color('#1e293b'),
    justification: 'left',
  })
  addToProject(titleText)

  if (description) {
    const descText = new paper.PointText({
      point: [x + 50, y + height / 2 + 15],
      content: description,
      fontSize: 12,
      fillColor: new paper.Color('#64748b'),
      justification: 'left',
    })
    addToProject(descText)
  }

  if (badge) {
    const badgeWidth = badge.length * 10 + 20
    const badgeX = x + width - badgeWidth - 15
    const badgeY = y + (height - 24) / 2

    const badgeRect = new paper.Path.Rectangle({
      point: [badgeX, badgeY],
      size: [badgeWidth, 24],
      radius: 12,
    })
    badgeRect.fillColor = new paper.Color(badgeColor)
    addToProject(badgeRect)

    const badgeText = new paper.PointText({
      point: [badgeX + badgeWidth / 2, badgeY + 16],
      content: badge,
      fontSize: 12,
      fillColor: new paper.Color('#ffffff'),
      justification: 'center',
    })
    addToProject(badgeText)
  }

  return { success: true, elements, type: 'listItem' }
}

function createNotificationComponent(project, canvas, { x, y, width = 360, type = 'info', title, message, showIcon = true, radius = 12 }) {
  const config = {
    success: { icon: '✓', bgColor: '#dcfce7', iconColor: '#22c55e', borderColor: '#22c55e' },
    warning: { icon: '⚠', bgColor: '#fef9c3', iconColor: '#eab308', borderColor: '#eab308' },
    error: { icon: '✕', bgColor: '#fee2e2', iconColor: '#ef4444', borderColor: '#ef4444' },
    info: { icon: 'ℹ', bgColor: '#dbeafe', iconColor: '#3b82f6', borderColor: '#3b82f6' },
  }

  const c = config[type] || config.info
  const padding = 16
  const lineHeight = 22
  const iconSize = 24
  const height = padding * 2 + (title ? lineHeight + 8 : 0) + (message ? lineHeight : 0)
  const elements = []

  const bg = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius,
  })
  bg.fillColor = new paper.Color(c.bgColor)
  bg.strokeColor = new paper.Color(c.borderColor)
  bg.strokeWidth = 1
  elements.push({ type: 'rectangle', id: bg.id })

  if (showIcon) {
    elements.push(new paper.PointText({
      point: [x + padding + iconSize / 2, y + padding + iconSize / 2 + 6],
      content: c.icon,
      fontSize: iconSize,
      fillColor: new paper.Color(c.iconColor),
      justification: 'center',
    }))
  }

  const textX = showIcon ? x + padding + iconSize + 12 : x + padding
  let currentY = y + padding

  if (title) {
    elements.push(new paper.PointText({
      point: [textX, currentY + 18],
      content: title,
      fontSize: 16,
      fillColor: new paper.Color('#1e293b'),
      justification: 'left',
    }))
    currentY += lineHeight + 8
  }

  if (message) {
    elements.push(new paper.PointText({
      point: [textX, currentY + 16],
      content: message,
      fontSize: 14,
      fillColor: new paper.Color('#475569'),
      justification: 'left',
    }))
  }

  return { success: true, elements, type: 'notification' }
}

/**
 * 创建图片框组件
 */
async function createImageFrameComponent(project, canvas, {
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
}) {
  const elements = []

  // 绘制外边框（装饰层）
  if (outerWidth > 0) {
    const outerBg = new paper.Path.Rectangle({
      point: [x - outerWidth, y - outerWidth],
      size: [width + outerWidth * 2, height + outerWidth * 2],
      radius: radius + outerWidth
    })
    outerBg.fillColor = new paper.Color(outerColor)
    elements.push({ type: 'rectangle', id: outerBg.id })
  }

  // 绘制内边框
  if (borderWidth > 0) {
    const innerBg = new paper.Path.Rectangle({
      point: [x - borderWidth, y - borderWidth],
      size: [width + borderWidth * 2, height + borderWidth * 2],
      radius: radius + borderWidth
    })
    innerBg.fillColor = new paper.Color(borderColor)
    elements.push({ type: 'rectangle', id: innerBg.id })
  }

  // 加载并绘制图片
  const image = await _loadImage(src)
  const imgWidth = image.width
  const imgHeight = image.height
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

  // 创建裁剪区域
  const clipPath = new paper.Path.Rectangle({
    point: [x, y],
    size: [width, height],
    radius: radius
  })

  // 添加阴影
  if (shadowBlur > 0) {
    const shadowRect = new paper.Path.Rectangle({
      point: [x + shadowOffsetX, y + shadowOffsetY],
      size: [width, height],
      radius: radius
    })
    shadowRect.fillColor = new paper.Color(shadowColor)
    shadowRect.opacity = shadowBlur / 50
    shadowRect.shadowColor = new paper.Color(shadowColor)
    shadowRect.shadowBlur = shadowBlur
    elements.push({ type: 'rectangle', id: shadowRect.id })
  }

  // 绘制图片
  const raster = new paper.Raster({
    source: src,
    position: [drawX + drawW / 2, drawY + drawH / 2]
  })

  await new Promise((resolve) => {
    raster.onLoad = resolve
  })

  raster.size = new paper.Size(drawW, drawH)
  raster.position = new paper.Point(drawX + drawW / 2, drawY + drawH / 2)

  // 应用裁剪
  clipPath.clipMask = true

  elements.push({ type: 'raster', id: raster.id })

  // 叠加颜色
  if (overlayColor && overlayOpacity > 0) {
    const overlay = new paper.Path.Rectangle({
      point: [x, y],
      size: [width, height],
      radius: radius
    })
    overlay.fillColor = new paper.Color(overlayColor)
    overlay.opacity = overlayOpacity
    elements.push({ type: 'rectangle', id: overlay.id })
  }

  return { success: true, elements, type: 'imageFrame' }
}

// 辅助函数：加载图片
async function _loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      if (src.startsWith('data:')) {
        img.src = src
      } else {
        reject(new Error(`Failed to load image: ${src}`))
      }
    }
    img.src = src
  })
}

/**
 * 创建分栏布局组件
 */
function createColumnsComponent(project, canvas, {
  x,
  y,
  width,
  height,
  columns = 2,
  gap = 20,
  background,
  borderColor,
  borderWidth = 1,
  radius = 0,
  direction = 'horizontal',
  align = 'top'
}) {
  const elements = []
  
  // 计算每列宽度
  const totalGap = gap * (columns - 1)
  const columnWidth = (width - totalGap) / columns
  
  // 绘制背景
  if (background) {
    const bg = new paper.Path.Rectangle({
      point: [x, y],
      size: [width, height],
      radius: radius
    })
    bg.fillColor = new paper.Color(background)
    elements.push({ type: 'rectangle', id: bg.id })
  }
  
  // 绘制边框
  if (borderColor && borderWidth > 0) {
    const border = new paper.Path.Rectangle({
      point: [x, y],
      size: [width, height],
      radius: radius
    })
    border.fillColor = new paper.Color('transparent')
    border.strokeColor = new paper.Color(borderColor)
    border.strokeWidth = borderWidth
    elements.push({ type: 'rectangle', id: border.id })
  }
  
  // 生成分割线
  for (let i = 1; i < columns; i++) {
    const lineX = x + columnWidth * i + gap * (i - 1) + gap / 2
    const line = new paper.Path.Line({
      from: [lineX, y + 20],
      to: [lineX, y + height - 20]
    })
    line.strokeColor = new paper.Color('#e0e0e0')
    line.strokeWidth = 1
    elements.push({ type: 'line', id: line.id })
  }
  
  // 返回列位置信息
  const columnPositions = []
  for (let i = 0; i < columns; i++) {
    const colX = x + (columnWidth + gap) * i
    const colY = align === 'center' ? y + (height - height) / 2 : align === 'bottom' ? y + height - height : y
    
    columnPositions.push({
      index: i,
      x: colX,
      y: colY,
      width: columnWidth,
      height: height,
      centerX: colX + columnWidth / 2,
      centerY: colY + height / 2
    })
  }
  
  return {
    success: true,
    elements,
    columnPositions,
    columnWidth,
    totalWidth: width,
    totalHeight: height,
    type: 'columns'
  }
}

/**
 * 创建网格布局组件
 */
function createGridComponent(project, canvas, {
  x,
  y,
  width,
  height,
  columns = 3,
  rows = 2,
  gapX = 20,
  gapY = 20,
  background,
  borderColor,
  borderWidth = 1,
  radius = 0,
  direction = 'row'
}) {
  const elements = []
  
  // 计算单元格尺寸
  const totalGapX = gapX * (columns - 1)
  const totalGapY = gapY * (rows - 1)
  const cellWidth = (width - totalGapX) / columns
  const cellHeight = (height - totalGapY) / rows
  
  // 绘制背景
  if (background) {
    const bg = new paper.Path.Rectangle({
      point: [x, y],
      size: [width, height],
      radius: radius
    })
    bg.fillColor = new paper.Color(background)
    elements.push({ type: 'rectangle', id: bg.id })
  }
  
  // 绘制边框
  if (borderColor && borderWidth > 0) {
    const border = new paper.Path.Rectangle({
      point: [x, y],
      size: [width, height],
      radius: radius
    })
    border.fillColor = new paper.Color('transparent')
    border.strokeColor = new paper.Color(borderColor)
    border.strokeWidth = borderWidth
    elements.push({ type: 'rectangle', id: border.id })
  }
  
  // 生成网格线（可选，这里不绘制让用户自己控制）
  
  // 生成网格位置信息
  const cellPositions = []
  const totalCells = columns * rows
  
  for (let i = 0; i < totalCells; i++) {
    let col, row
    
    if (direction === 'row') {
      col = i % columns
      row = Math.floor(i / columns)
    } else {
      row = i % rows
      col = Math.floor(i / rows)
    }
    
    const cellX = x + col * (cellWidth + gapX)
    const cellY = y + row * (cellHeight + gapY)
    
    cellPositions.push({
      index: i,
      column: col,
      row: row,
      x: cellX,
      y: cellY,
      width: cellWidth,
      height: cellHeight,
      centerX: cellX + cellWidth / 2,
      centerY: cellY + cellHeight / 2
    })
  }
  
  // 返回网格布局信息
  return {
    success: true,
    elements,
    cellPositions,
    cellWidth,
    cellHeight,
    columns,
    rows,
    totalCells,
    totalWidth: width,
    totalHeight: height,
    type: 'grid'
  }
}


/**
 * 创建星形组件
 */
function createStarComponent(project, canvas, {
  cx, cy, points = 5, innerRadius, outerRadius,
  fill, stroke, strokeWidth = 1, opacity = 1, rotation = 0
}) {
  const actualInnerRadius = innerRadius || outerRadius * 0.4
  const path = new paper.Path()
  const angleStep = Math.PI / points

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : actualInnerRadius
    const angle = i * angleStep - Math.PI / 2 + (rotation * Math.PI / 180)
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    if (i === 0) path.moveTo(x, y)
    else path.lineTo(x, y)
  }
  path.closePath()

  if (fill) path.fillColor = new paper.Color(fill)
  if (stroke) { path.strokeColor = new paper.Color(stroke); path.strokeWidth = strokeWidth }
  path.opacity = opacity
  if (project && project.activeLayer) project.activeLayer.addChild(path)

  return { success: true, elements: [{ type: 'path', id: path.id }], type: 'star' }
}

/**
 * 创建箭头组件
 */
function createArrowComponent(project, canvas, {
  x1, y1, x2, y2, color = '#333333', strokeWidth = 2, headSize = 12, style = 'solid', direction = 'end'
}) {
  const elements = []
  const angle = Math.atan2(y2 - y1, x2 - x1)

  const line = new paper.Path.Line({ from: [x1, y1], to: [x2, y2] })
  line.strokeColor = new paper.Color(color)
  line.strokeWidth = strokeWidth
  if (style === 'dashed') line.dashArray = [10, 5]
  elements.push({ type: 'line', id: line.id })

  if (direction === 'end' || direction === 'both') {
    const arrowHead = new paper.Path()
    arrowHead.moveTo(x2, y2)
    arrowHead.lineTo(x2 + headSize * Math.cos(angle + Math.PI * 0.8), y2 + headSize * Math.sin(angle + Math.PI * 0.8))
    arrowHead.moveTo(x2, y2)
    arrowHead.lineTo(x2 + headSize * Math.cos(angle - Math.PI * 0.8), y2 + headSize * Math.sin(angle - Math.PI * 0.8))
    arrowHead.strokeColor = new paper.Color(color)
    arrowHead.strokeWidth = strokeWidth
    arrowHead.strokeCap = 'round'
    elements.push({ type: 'path', id: arrowHead.id })
  }

  if (direction === 'start' || direction === 'both') {
    const startAngle = angle + Math.PI
    const arrowHead = new paper.Path()
    arrowHead.moveTo(x1, y1)
    arrowHead.lineTo(x1 + headSize * Math.cos(startAngle + Math.PI * 0.8), y1 + headSize * Math.sin(startAngle + Math.PI * 0.8))
    arrowHead.moveTo(x1, y1)
    arrowHead.lineTo(x1 + headSize * Math.cos(startAngle - Math.PI * 0.8), y1 + headSize * Math.sin(startAngle - Math.PI * 0.8))
    arrowHead.strokeColor = new paper.Color(color)
    arrowHead.strokeWidth = strokeWidth
    arrowHead.strokeCap = 'round'
    elements.push({ type: 'path', id: arrowHead.id })
  }

  return { success: true, elements, type: 'arrow' }
}

/**
 * 创建环形进度条组件
 */
function createProgressCircleComponent(project, canvas, {
  cx, cy, radius, value, strokeWidth = 10, trackColor = '#e0e0e0',
  fillColor = '#3b82f6', backgroundColor, showLabel = true, labelColor, startAngle = -90
}) {
  const elements = []

  if (backgroundColor) {
    const bgCircle = new paper.Path.Circle({ center: [cx, cy], radius: radius })
    bgCircle.fillColor = new paper.Color(backgroundColor)
    elements.push({ type: 'path', id: bgCircle.id })
  }

  const trackCircle = new paper.Path.Circle({ center: [cx, cy], radius: radius })
  trackCircle.fillColor = new paper.Color('transparent')
  trackCircle.strokeColor = new paper.Color(trackColor)
  trackCircle.strokeWidth = strokeWidth
  elements.push({ type: 'path', id: trackCircle.id })

  if (value > 0) {
    const endAngle = startAngle + (value / 100) * 360
    const startRad = startAngle * Math.PI / 180
    const endRad = endAngle * Math.PI / 180

    const arc = new paper.Path()
    arc.moveTo(cx + radius * Math.cos(startRad), cy + radius * Math.sin(startRad))
    arc.arcTo([cx, cy], radius, endRad - startRad)
    arc.strokeColor = new paper.Color(fillColor)
    arc.strokeWidth = strokeWidth
    arc.strokeCap = 'round'
    elements.push({ type: 'path', id: arc.id })
  }

  if (showLabel) {
    const textColor = labelColor || fillColor
    const label = new paper.PointText({
      point: [cx, cy + 6],
      content: `${Math.round(value)}%`,
      fontSize: radius * 0.4,
      fillColor: new paper.Color(textColor),
      justification: 'center',
      fontWeight: 'bold'
    })
    elements.push({ type: 'text', id: label.id })
  }

  return { success: true, elements, type: 'progressCircle' }
}

/**
 * 创建 Chip 标签组件
 */
function createChipComponent(project, canvas, {
  x, y, text, background = '#e0e0e0', color = '#333333', borderColor,
  fontSize = 12, padding = 12, radius = 16, icon
}) {
  const elements = []
  const textWidth = text.length * fontSize * 0.6
  const iconWidth = icon ? fontSize : 0
  const totalWidth = padding * 2 + textWidth + iconWidth + 4
  const height = fontSize + padding * 2
  const rectX = x - totalWidth / 2
  const rectY = y - height / 2

  const bg = new paper.Path.Rectangle({ point: [rectX, rectY], size: [totalWidth, height], radius: radius })
  bg.fillColor = new paper.Color(background)
  if (borderColor) { bg.strokeColor = new paper.Color(borderColor); bg.strokeWidth = 1 }
  elements.push({ type: 'path', id: bg.id })

  if (icon) {
    const iconText = new paper.PointText({
      point: [rectX + padding + iconWidth / 2, y + fontSize / 3],
      content: icon,
      fontSize: fontSize + 2,
      fillColor: new paper.Color(color),
      justification: 'center'
    })
    elements.push({ type: 'text', id: iconText.id })
  }

  const textX = icon ? rectX + padding + iconWidth + 4 + textWidth / 2 : x
  const label = new paper.PointText({
    point: [textX, y + fontSize / 3],
    content: text,
    fontSize: fontSize,
    fillColor: new paper.Color(color),
    justification: 'center'
  })
  elements.push({ type: 'text', id: label.id })

  return { success: true, elements, width: totalWidth, height, type: 'chip' }
}

/**
 * 创建图表组件
 */
function createChartComponent(project, canvas, {
  type = 'bar', x, y, width, height, data = [], barColor = '#3b82f6',
  showLabels = true, showValues = true, barGap = 4
}) {
  const elements = []

  if (type === 'bar' && data.length > 0) {
    const maxValue = Math.max(...data.map(d => d.value))
    const barCount = data.length
    const totalGap = barGap * (barCount - 1)
    const barWidth = (width - totalGap) / barCount
    const labelHeight = showLabels ? 24 : 0
    const valueHeight = showValues ? 20 : 0
    const chartHeight = height - labelHeight - valueHeight - 10

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight
      const barX = x + index * (barWidth + barGap)
      const barY = y + height - labelHeight - valueHeight - barHeight - 5
      const color = item.color || barColor

      const bar = new paper.Path.Rectangle({
        point: [barX, barY],
        size: [barWidth, barHeight],
        radius: [4, 4, 0, 0]
      })
      bar.fillColor = new paper.Color(color)
      elements.push({ type: 'path', id: bar.id })

      if (showValues) {
        const valueText = new paper.PointText({
          point: [barX + barWidth / 2, barY - 8],
          content: String(item.value),
          fontSize: 12,
          fillColor: new paper.Color('#666666'),
          justification: 'center'
        })
        elements.push({ type: 'text', id: valueText.id })
      }

      if (showLabels) {
        const labelText = new paper.PointText({
          point: [barX + barWidth / 2, y + height - 8],
          content: item.label || '',
          fontSize: 11,
          fillColor: new paper.Color('#333333'),
          justification: 'center'
        })
        elements.push({ type: 'text', id: labelText.id })
      }
    })
  } else if (type === 'pie' && data.length > 0) {
    const cx = x + width / 2
    const cy = y + height / 2
    const radius = Math.min(width, height) / 2 - 10
    const total = data.reduce((sum, d) => sum + d.value, 0)
    let currentAngle = -90
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

    data.forEach((item, index) => {
      const percentage = item.value / total
      const endAngle = currentAngle + percentage * 360
      const path = new paper.Path()
      path.moveTo(cx, cy)
      path.arc([cx, cy], radius, currentAngle * Math.PI / 180, endAngle * Math.PI / 180)
      path.closePath()
      path.fillColor = new paper.Color(item.color || colors[index % colors.length])
      elements.push({ type: 'path', id: path.id })

      if (showLabels && percentage > 0.05) {
        const midAngle = (currentAngle + endAngle) / 2
        const midRad = midAngle * Math.PI / 180
        const labelX = cx + radius * 0.7 * Math.cos(midRad)
        const labelY = cy + radius * 0.7 * Math.sin(midRad)
        const labelText = new paper.PointText({
          point: [labelX, labelY + 4],
          content: `${Math.round(percentage * 100)}%`,
          fontSize: 11,
          fillColor: new paper.Color('#ffffff'),
          justification: 'center',
          fontWeight: 'bold'
        })
        elements.push({ type: 'text', id: labelText.id })
      }

      currentAngle = endAngle
    })
  }

  return { success: true, elements, type: 'chart' }
}

/**
 * 创建水印组件
 */
function createWatermarkComponent(project, canvas, {
  text, cx, cy, color = 'rgba(0,0,0,0.1)', fontSize = 48,
  fontFamily = 'sans-serif', opacity = 0.1, rotation = 0, align = 'center'
}) {
  const { getFontFallbackChain } = require('./fonts')

  // 获取字体链
  const chain = getFontFallbackChain(fontFamily, text)
  const finalFont = chain.length === 1 ? chain[0] : chain.join(', ')

  const label = new paper.PointText({
    point: [cx, cy],
    content: text,
    fontSize: fontSize,
    fontFamily: finalFont,
    fillColor: new paper.Color(color),
    justification: align,
    opacity: opacity
  })

  if (rotation !== 0) {
    label.rotate(rotation, new paper.Point(cx, cy))
  }

  return { success: true, elements: [{ type: 'text', id: label.id }], type: 'watermark' }
}

/**
 * 创建表格组件
 */
function createTableComponent(project, canvas, {
  x, y, width, columns = [], rows = [], rowHeight = 36,
  headerBg = '#f0f0f0', headerColor = '#333333', borderColor = '#e0e0e0',
  cellColor = '#333333', fontSize = 12, headerFontSize = 13, striped = true, stripeColor = '#fafafa'
}) {
  const elements = []
  // 确保 columns 是数组
  if (!Array.isArray(columns) || columns.length === 0) {
    return { success: true, elements, type: 'table' }
  }
  // 确保 rows 是数组
  if (!Array.isArray(rows)) {
    rows = []
  }

  const totalHeight = rowHeight * (rows.length + 1)

  const outerBorder = new paper.Path.Rectangle({ point: [x, y], size: [width, totalHeight] })
  outerBorder.fillColor = new paper.Color('transparent')
  outerBorder.strokeColor = new paper.Color(borderColor)
  outerBorder.strokeWidth = 1
  elements.push({ type: 'path', id: outerBorder.id })

  const headerBgRect = new paper.Path.Rectangle({ point: [x, y], size: [width, rowHeight] })
  headerBgRect.fillColor = new paper.Color(headerBg)
  headerBgRect.strokeColor = new paper.Color(borderColor)
  headerBgRect.strokeWidth = 0.5
  elements.push({ type: 'path', id: headerBgRect.id })

  let currentX = x
  columns.forEach((col, index) => {
    const colWidth = col.width || (width / columns.length)
    if (index > 0) {
      const line = new paper.Path.Line({ from: [currentX, y], to: [currentX, y + totalHeight] })
      line.strokeColor = new paper.Color(borderColor)
      line.strokeWidth = 0.5
      elements.push({ type: 'line', id: line.id })
    }
    const headerText = new paper.PointText({
      point: [currentX + colWidth / 2, y + rowHeight / 2 + fontSize / 3],
      content: col.title || '',
      fontSize: headerFontSize,
      fillColor: new paper.Color(headerColor),
      justification: col.align || 'center',
      fontWeight: 'bold'
    })
    elements.push({ type: 'text', id: headerText.id })
    currentX += colWidth
  })

  rows.forEach((row, rowIndex) => {
    const rowY = y + rowHeight * (rowIndex + 1)
    if (striped && rowIndex % 2 === 1) {
      const stripeBg = new paper.Path.Rectangle({ point: [x, rowY], size: [width, rowHeight] })
      stripeBg.fillColor = new paper.Color(stripeColor)
      stripeBg.strokeColor = new paper.Color(borderColor)
      stripeBg.strokeWidth = 0.5
      elements.push({ type: 'path', id: stripeBg.id })
    }
    const rowLine = new paper.Path.Line({ from: [x, rowY], to: [x + width, rowY] })
    rowLine.strokeColor = new paper.Color(borderColor)
    rowLine.strokeWidth = 0.5
    elements.push({ type: 'line', id: rowLine.id })

    let cellX = x
    columns.forEach((col, colIndex) => {
      const colWidth = col.width || (width / columns.length)
      const cellValue = row[colIndex] || ''
      const cellText = new paper.PointText({
        point: [cellX + colWidth / 2, rowY + rowHeight / 2 + fontSize / 3],
        content: String(cellValue),
        fontSize: fontSize,
        fillColor: new paper.Color(cellColor),
        justification: col.align || 'center'
      })
      elements.push({ type: 'text', id: cellText.id })
      cellX += colWidth
    })
  })

  return { success: true, elements, width, height: totalHeight, type: 'table' }
}
