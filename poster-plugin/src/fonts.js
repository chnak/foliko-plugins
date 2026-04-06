/**
 * 字体管理模块
 */

const path = require('path')
const fs = require('fs')
const { registerFont: registerFontFn } = require('canvas')

// 已注册的字体
const registeredFonts = new Map()

// 系统字体路径
const systemFonts = [
  { path: 'C:\\Windows\\Fonts\\msyh.ttc', family: 'Microsoft YaHei' },
  { path: 'C:\\Windows\\Fonts\\msyhbd.ttc', family: 'Microsoft YaHei Bold', weight: 'bold' },
  { path: 'C:\\Windows\\Fonts\\simhei.ttf', family: 'SimHei' },
  { path: 'C:\\Windows\\Fonts\\simsun.ttc', family: 'SimSun' },
  { path: 'C:\\Windows\\Fonts\\Arial.ttf', family: 'Arial' },
  { path: 'C:\\Windows\\Fonts\\Times New Roman.ttf', family: 'Times New Roman' },
  { path: 'C:\\Windows\\Fonts\\Consolas.ttf', family: 'Consolas' },
  { path: 'C:\\Windows\\Fonts\\Georgia.ttf', family: 'Georgia' },
]

// 默认字体
let defaultFontFamily = 'sans-serif'

/**
 * 注册字体文件
 */
function registerFontFile(fontPath, fontFamily, options = {}) {
  if (registeredFonts.has(fontFamily)) {
    return true
  }

  try {
    if (!fs.existsSync(fontPath)) {
      return false
    }

    registerFontFn(fontPath, {
      family: fontFamily,
      weight: options.weight || 'normal',
      style: options.style || 'normal',
    })

    registeredFonts.set(fontFamily, {
      path: fontPath,
      ...options,
    })

    return true
  } catch (e) {
    console.log(`[poster] 注册字体失败: ${fontFamily}`, e.message)
    return false
  }
}

/**
 * 初始化字体
 */
function initFonts() {
  // 优先尝试注册系统字体
  for (const font of systemFonts) {
    if (registerFontFile(font.path, font.family, { weight: font.weight })) {
      if (font.weight !== 'bold') {
        defaultFontFamily = font.family
        console.log(`[poster] 已注册系统字体: ${font.family}`)
        break
      }
    }
  }

  // 确保有默认字体
  if (!registeredFonts.has(defaultFontFamily)) {
    registeredFonts.set('sans-serif', { path: null })
    console.log('[poster] 使用默认字体: sans-serif')
  }
}

/**
 * 验证字体是否可用
 */
function validateFont(fontFamily) {
  if (!fontFamily) return defaultFontFamily
  if (registeredFonts.has(fontFamily)) return fontFamily

  const lower = fontFamily.toLowerCase()
  for (const [name] of registeredFonts) {
    if (name.toLowerCase() === lower) return name
  }

  //console.log(`[poster] 字体 "${fontFamily}" 未找到，使用默认字体: ${defaultFontFamily}`)
  return defaultFontFamily
}

/**
 * 获取已注册字体列表
 */
function getRegisteredFonts() {
  return Array.from(registeredFonts.keys())
}

/**
 * 获取默认字体
 */
function getDefaultFont() {
  return defaultFontFamily
}

// 初始化
initFonts()

module.exports = {
  registerFontFile,
  validateFont,
  getRegisteredFonts,
  getDefaultFont,
}
