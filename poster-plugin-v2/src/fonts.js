/**
 * 字体管理模块 - 支持字体回退链
 * 使用 @napi-rs/canvas 原生 API
 */

const path = require('path')
const fs = require('fs')
const canvas = require('canvas')

// @napi-rs/canvas 原生 API
let GlobalFonts = null
try {
  GlobalFonts = canvas.GlobalFonts
} catch (e) {
  console.warn('[poster-v2] @napi-rs/canvas 未安装，字体注册可能受限')
}

// 已注册的字体
const registeredFonts = new Map()

// 默认字体
let defaultFontName = 'Arial'

// 中文字体检测
function isChineseFont(fontName) {
  if (!fontName) return false
  const lower = fontName.toLowerCase()
  return (
    lower.includes('cjk') ||
    lower.includes('hei') ||
    lower.includes('song') ||
    lower.includes('kai') ||
    lower.includes('ming') ||
    lower.includes('fang') ||
    lower.includes('yuan') ||
    lower.includes('yahei') ||
    lower.includes('pingfang') ||
    /[\u4e00-\u9fff]/.test(fontName)
  )
}

// 中文字体别名映射
const chineseFontMappings = {
  'SimHei': 'Microsoft YaHei',
  '黑体': 'Microsoft YaHei',
  'Hei': 'Microsoft YaHei',
  'Microsoft YaHei': 'Microsoft YaHei',
  '微软雅黑': 'Microsoft YaHei',
  'msyh': 'Microsoft YaHei',
  'SimSun': 'SimSun',
  '宋体': 'SimSun',
  'sans-serif': 'Microsoft YaHei',
  'serif': 'SimSun',
  'monospace': 'Consolas',
}

/**
 * 注册字体文件
 */
function registerFontFile(fontPath, fontFamily) {
  if (!fontFamily || !fs.existsSync(fontPath)) return false

  // 避免重复注册
  if (registeredFonts.has(fontFamily)) return true

  try {
    if (GlobalFonts) {
      GlobalFonts.registerFromPath(path.resolve(fontPath), fontFamily)
    }
    registeredFonts.set(fontFamily, { path: fontPath })
    return true
  } catch (e) {
    console.warn(`[poster-v2] 注册字体失败: ${fontFamily}`, e.message)
    return false
  }
}

/**
 * 获取系统字体路径
 */
function getSystemFontPaths() {
  const isWin = process.platform === 'win32'
  const isMac = process.platform === 'darwin'

  const fonts = []

  if (isWin) {
    const winDir = 'C:\\Windows\\Fonts'
    fonts.push(
      // 中文首选
      { path: `${winDir}\\msyh.ttc`, family: 'Microsoft YaHei' },
      // 备选中文字体
      { path: `${winDir}\\simhei.ttf`, family: 'SimHei' },
      { path: `${winDir}\\simsun.ttc`, family: 'SimSun' },
      // 常用西文字体
      { path: `${winDir}\\arial.ttf`, family: 'Arial' },
      { path: `${winDir}\\times.ttf`, family: 'Times New Roman' },
      { path: `${winDir}\\consola.ttf`, family: 'Consolas' },
      // Emoji
      { path: `${winDir}\\seguiemj.ttf`, family: 'Segoe UI Emoji' },
    )
  } else if (isMac) {
    fonts.push(
      { path: '/System/Library/Fonts/PingFang.ttc', family: 'PingFang SC' },
      { path: '/System/Library/Fonts/Apple Color Emoji.ttc', family: 'Apple Color Emoji' },
      { path: '/System/Library/Fonts/Helvetica.ttc', family: 'Helvetica' },
    )
  } else {
    // Linux
    fonts.push(
      { path: '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', family: 'Noto Sans CJK SC' },
      { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', family: 'DejaVu Sans' },
      { path: '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
    )
  }

  return fonts
}

/**
 * 初始化字体系统
 */
function initFonts() {
  // 注册系统字体
  const systemFonts = getSystemFontPaths()
  for (const font of systemFonts) {
    registerFontFile(font.path, font.family)
  }

  // 如果没有字体，注册基本字体
  if (registeredFonts.size === 0) {
    registeredFonts.set('sans-serif', { path: null })
    registeredFonts.set('serif', { path: null })
    registeredFonts.set('monospace', { path: null })
  }

  // 设置默认字体
  if (registeredFonts.has('Microsoft YaHei')) {
    defaultFontName = 'Microsoft YaHei'
  } else if (registeredFonts.has('Arial')) {
    defaultFontName = 'Arial'
  }

  console.log(`[poster-v2] 字体系统初始化完成，默认字体: ${defaultFontName}`)
}

/**
 * 获取字体回退链
 * @param {string} primaryFont - 主字体
 * @param {string} text - 文本内容（用于检测是否包含中文）
 * @returns {string} 逗号分隔的字体链
 */
function getFontFallbackChain(primaryFont, text = '') {
  const chain = []

  // 如果指定了主字体且存在
  if (primaryFont) {
    // 映射别名
    const mapped = chineseFontMappings[primaryFont] || primaryFont
    if (registeredFonts.has(mapped) && !chain.includes(mapped)) {
      chain.push(mapped)
    } else if (!chain.includes(primaryFont)) {
      chain.push(primaryFont)
    }
  }

  // 检测是否包含中文
  const hasChinese = /[\u4e00-\u9fff]/.test(text || '')

  // 如果有中文或主字体是中文，添加中文字体
  if (hasChinese) {
    for (const [name] of registeredFonts) {
      if (isChineseFont(name) && !chain.includes(name)) {
        chain.push(name)
      }
    }
  }

  // 添加所有已注册字体
  for (const [name] of registeredFonts) {
    if (!chain.includes(name)) {
      chain.push(name)
    }
  }

  // 添加通用字体族
  if (!chain.includes('sans-serif')) chain.push('sans-serif')
  if (!chain.includes('serif')) chain.push('serif')

  return chain.join(', ')
}

/**
 * 获取默认字体
 */
function getDefaultFontFamily() {
  return defaultFontName
}

// 初始化
initFonts()

module.exports = {
  initFonts,
  registerFontFile,
  getFontFallbackChain,
  getDefaultFontFamily,
  isChineseFont,
  registeredFonts,
}
