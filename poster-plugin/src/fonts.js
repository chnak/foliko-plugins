/**
 * 字体管理模块
 */

const path = require('path')
const fs = require('fs')
const { registerFont: registerFontFn } = require('canvas')

// 已注册的字体
const registeredFonts = new Map()

// Emoji 字体名称映射（用于统一识别）
const emojiFontMappings = {
  'NotoColorEmoji': 'Noto Color Emoji',
  'NotoColorEmoji-Regular': 'Noto Color Emoji',
  'Noto Emoji': 'Noto Emoji',
  'NotoEmoji-Regular': 'Noto Emoji',
  'Apple Color Emoji': 'Apple Color Emoji',
  'Segoe UI Emoji': 'Segoe UI Emoji',
  'SegoeUI Emoji': 'Segoe UI Emoji',
  'Symbola': 'Symbola',
}

// 系统字体路径
const systemFonts = [
  // Windows 字体
  { path: 'C:\\Windows\\Fonts\\msyh.ttc', family: 'Microsoft YaHei' },
  { path: 'C:\\Windows\\Fonts\\msyhbd.ttc', family: 'Microsoft YaHei Bold', weight: 'bold' },
  { path: 'C:\\Windows\\Fonts\\simhei.ttf', family: 'SimHei' },
  { path: 'C:\\Windows\\Fonts\\simsun.ttc', family: 'SimSun' },
  { path: 'C:\\Windows\\Fonts\\Arial.ttf', family: 'Arial' },
  { path: 'C:\\Windows\\Fonts\\Times New Roman.ttf', family: 'Times New Roman' },
  { path: 'C:\\Windows\\Fonts\\Consolas.ttf', family: 'Consolas' },
  { path: 'C:\\Windows\\Fonts\\Georgia.ttf', family: 'Georgia' },
  // Windows Emoji 字体
  { path: 'C:\\Windows\\Fonts\\seguiemj.ttf', family: 'Segoe UI Emoji' },
  { path: 'C:\\Windows\\Fonts\\seguisym.ttf', family: 'Segoe UI Symbol' },
  { path: 'C:\\Windows\\Fonts\\seguisb.ttf', family: 'Segoe UI Symbol' },
  { path: 'C:\\Windows\\Fonts\\EmojiOne Color.ttf', family: 'EmojiOne Color' },
  // Linux emoji 字体（扩展搜索路径）
  { path: '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
  { path: '/usr/share/fonts/truetype/noto/NotoEmoji-Regular.ttf', family: 'Noto Emoji' },
  { path: '/usr/share/fonts/opentype/noto/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
  { path: '/usr/share/fonts/google-noto-cursive/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
  { path: '/usr/share/fonts/google-noto-emoji/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
  { path: '/usr/share/fonts/noto-fonts/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
  { path: '/usr/share/fonts/TTF/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
  { path: '/usr/share/fonts/truetype/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
  { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', family: 'DejaVu Sans' },
  { path: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', family: 'Liberation Sans' },
  { path: '/usr/share/fonts/truetype/freefont/FreeSans.ttf', family: 'FreeSans' },
  { path: '/usr/share/fonts/TTF/NotoSans-Regular.ttf', family: 'Noto Sans' },
  { path: '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf', family: 'Noto Sans' },
  // macOS 字体
  { path: '/System/Library/Fonts/Apple Color Emoji.ttc', family: 'Apple Color Emoji' },
  { path: '/System/Library/Fonts/Supplemental/Symbola.ttf', family: 'Symbola' },
]

// 默认字体
let defaultFontFamily = '微软雅黑'

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
 * 判断是否为 Emoji 字体
 */
function isEmojiFont(fontName) {
  if (!fontName) return false
  const lower = fontName.toLowerCase()
  return (
    lower.includes('emoji') ||
    lower.includes('color') ||
    lower.includes('symbola')
  )
}

/**
 * 初始化字体
 */
function initFonts() {
  // 插件字体目录
  const pluginFontsDir = path.join(__dirname, '..', 'fonts')

  // 优先加载插件自带的字体
  if (fs.existsSync(pluginFontsDir)) {
    const fontFiles = fs.readdirSync(pluginFontsDir)
    for (const file of fontFiles) {
      if (!file.endsWith('.ttf') && !file.endsWith('.otf') && !file.endsWith('.ttc')) {
        continue
      }
      const fontPath = path.join(pluginFontsDir, file)
      const fontName = path.basename(file, path.extname(file))

      // 检查是否为 Emoji 字体，如果是则使用标准名称注册
      let finalFontName = fontName
      if (isEmojiFont(fontName)) {
        // 尝试映射到标准名称
        finalFontName = emojiFontMappings[fontName] || 'Noto Color Emoji'
      }

      // 尝试注册
      if (registerFontFile(fontPath, finalFontName)) {
        if (isEmojiFont(finalFontName)) {
          console.log(`[poster] 已注册插件 Emoji 字体: ${finalFontName}`)
        } else {
          // 微软雅黑设为默认字体
          if (fontName.includes('微软雅黑') && !fontName.includes('粗体')) {
            defaultFontFamily = finalFontName
            console.log(`[poster] 已注册插件字体(设为默认): ${finalFontName}`)
          } else if (!defaultFontFamily || defaultFontFamily === 'sans-serif') {
            defaultFontFamily = finalFontName
            console.log(`[poster] 已注册插件字体: ${finalFontName}`)
          }
        }
      }
    }
  }

  // 如果没有注册到插件字体，再尝试系统字体
  if (!defaultFontFamily || defaultFontFamily === 'sans-serif') {
    for (const font of systemFonts) {
      if (registerFontFile(font.path, font.family, { weight: font.weight })) {
        if (font.weight !== 'bold') {
          defaultFontFamily = font.family
          console.log(`[poster] 已注册系统字体: ${font.family}`)
          break
        }
      }
    }
  }

  // 确保有默认字体
  if (!registeredFonts.has(defaultFontFamily)) {
    registeredFonts.set('sans-serif', { path: null })
    console.log('[poster] 使用默认字体: sans-serif')
  }

  // 注册系统 emoji 字体（用于支持 emoji 渲染）
  const emojiFonts = [
    // Windows Emoji 字体（优先）
    { path: 'C:\\Windows\\Fonts\\seguiemj.ttf', family: 'Segoe UI Emoji' },
    { path: 'C:\\Windows\\Fonts\\seguisym.ttf', family: 'Segoe UI Symbol' },
    { path: 'C:\\Windows\\Fonts\\seguisb.ttf', family: 'Segoe UI Symbol' },
    // Linux
    { path: '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
    { path: '/usr/share/fonts/opentype/noto/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
    { path: '/usr/share/fonts/google-noto-emoji/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
    { path: '/usr/share/fonts/google-noto-cursive/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
    { path: '/usr/share/fonts/noto-fonts/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
    { path: '/usr/share/fonts/TTF/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
    { path: '/usr/share/fonts/truetype/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
    { path: '/usr/share/fonts/truetype/noto/NotoEmoji-Regular.ttf', family: 'Noto Emoji' },
    { path: '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf', family: 'Noto Sans' },
    { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', family: 'DejaVu Sans' },
    { path: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', family: 'Liberation Sans' },
    { path: '/usr/share/fonts/truetype/freefont/FreeSans.ttf', family: 'FreeSans' },
    // macOS
    { path: '/System/Library/Fonts/Apple Color Emoji.ttc', family: 'Apple Color Emoji' },
    { path: '/System/Library/Fonts/Supplemental/Symbola.ttf', family: 'Symbola' },
  ]

  for (const font of emojiFonts) {
    if (registerFontFile(font.path, font.family)) {
      // 只在还没注册过 Noto Color Emoji 时打印
      if (!registeredFonts.has('Noto Color Emoji') || font.family === 'Noto Color Emoji') {
        console.log(`[poster] 已注册 emoji 字体: ${font.family}`)
      }
      // 一旦找到 Noto Color Emoji 就停止
      if (font.family === 'Noto Color Emoji' && registeredFonts.has('Noto Color Emoji')) {
        break
      }
    }
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
