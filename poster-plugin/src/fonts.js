/**
 * 字体管理模块 - 支持多字体 fallback
 */

const path = require('path')
const fs = require('fs')
const { registerFont: registerFontFn } = require('canvas')

// 已注册的字体
const registeredFonts = new Map()

// 字体信息缓存（用于返回详细列表）
let fontInfoList = []

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
  'Symbola_hint': 'Symbola',
}

// 中文字体别名映射表 - 将请求的字体映射到实际可用的字体
const chineseFontMappings = {
  // 黑体系列
  'SimHei': 'Noto Sans CJK SC',
  '黑体': 'Noto Sans CJK SC',
  'Hei': 'Noto Sans CJK SC',
  'Microsoft YaHei': 'Microsoft YaHei',
  '微软雅黑': 'Microsoft YaHei',
  'msyh': 'Microsoft YaHei',
  'Source Han Sans CN': 'Source Han Sans CN',
  '思源黑体': 'Noto Sans CJK SC',
  'Noto Sans CJK': 'Noto Sans CJK SC',
  'Noto Sans CJK SC': 'Noto Sans CJK SC',
  'Noto Sans': 'Noto Sans CJK SC',
  
  // 宋体系列
  'SimSun': 'Noto Serif CJK SC',
  '宋体': 'Noto Serif CJK SC',
  'Song': 'Noto Serif CJK SC',
  'SimSun_GB2312': 'Noto Serif CJK SC',
  '方正宋体': 'Noto Serif CJK SC',
  'Noto Serif CJK': 'Noto Serif CJK SC',
  'Noto Serif CJK SC': 'Noto Serif CJK SC',
  
  // 楷体系列
  'Kai': 'LXGWWenKai-Regular',
  '楷体': 'LXGWWenKai-Regular',
  'Kaiti': 'LXGWWenKai-Regular',
  'STKaiti': 'LXGWWenKai-Regular',
  '华文楷体': 'LXGWWenKai-Regular',
  '楷书': 'LXGWWenKai-Regular',
  'LXGW WenKai': 'LXGWWenKai-Regular',
  'LXGWWenKai': 'LXGWWenKai-Regular',
  'LXGWWenKai-Regular': 'LXGWWenKai-Regular',  // 文件名映射
  '霞鹜文楷': 'LXGWWenKai-Regular',
  
  // 仿宋系列
  'FangSong': 'Noto Serif CJK SC',
  '仿宋': 'Noto Serif CJK SC',
  'FangSong_GB2312': 'Noto Serif CJK SC',
  '方正仿宋': 'Noto Serif CJK SC',
  
  // 幼圆
  'YouYuan': 'Noto Sans CJK SC',
  '幼圆': 'Noto Sans CJK SC',
  '圆体': 'Noto Sans CJK SC',
  
  // 华文系列
  'STHeiti': 'Noto Sans CJK SC',
  '华文黑体': 'Noto Sans CJK SC',
  'STSong': 'Noto Serif CJK SC',
  '华文宋体': 'Noto Serif CJK SC',
  'STSongti': 'Noto Serif CJK SC',
  '华文宋体_GB2312': 'Noto Serif CJK SC',
  'STZhongsong': 'Noto Serif CJK SC',
  '华文中宋': 'Noto Serif CJK SC',
  'STCaiyun': 'Noto Sans CJK SC',
  '华文彩云': 'Noto Sans CJK SC',
  'STXingkai': 'Noto Sans CJK SC',
  '华文行楷': 'Noto Sans CJK SC',
  'STXinwei': 'Noto Sans CJK SC',
  '华文新魏': 'Noto Sans CJK SC',
  'STLiti': 'Noto Sans CJK SC',
  '华文隶书': 'Noto Sans CJK SC',
  
  // 其他常见中文别名
  'sans-serif': 'Noto Sans CJK SC',
  'serif': 'Noto Serif CJK SC',
  'monospace': 'Liberation Mono',
  'PingFang': 'Noto Sans CJK SC',
  'PingFang SC': 'Noto Sans CJK SC',
  'Hiragino Sans GB': 'Noto Sans CJK SC',
  '冬青黑体': 'Noto Sans CJK SC',
  'WenQuanYi': 'Noto Sans CJK SC',
  '文泉驿': 'Noto Sans CJK SC',
  'WenQuanYi Micro Hei': 'Noto Sans CJK SC',
  'WenQuanYi Zen Hei': 'Noto Sans CJK SC',
  'AR PL': 'Noto Sans CJK SC',
  'AR PL UKai': 'Noto Serif CJK SC',
}

// 字体风格映射 - 不同字体适合不同风格
const fontStyleMappings = {
  '黑体': 'sans',
  '宋体': 'serif',
  '楷体': 'sans',
  '仿宋': 'serif',
  '幼圆': 'sans',
  '华文黑体': 'sans',
  '华文宋体': 'serif',
  '华文楷体': 'sans',
  '华文行楷': 'sans',
  '华文隶书': 'sans',
}

// 系统字体路径
const systemFonts = [
  // ===== CJK 中文字体（优先注册，支持中文） =====
  // Noto Sans CJK (思源黑体)
  { path: '/usr/share/fonts/truetype/chinese/NotoSansCJK-Regular.ttc', family: 'Noto Sans CJK SC' },
  { path: '/usr/share/fonts/truetype/chinese/NotoSansCJK-Bold.ttc', family: 'Noto Sans CJK SC Bold', weight: 'bold' },
  // Source Han Sans CN (思源黑体简体中文)
  { path: '/usr/share/fonts/truetype/chinese/SourceHanSansCN-Regular.otf', family: 'Source Han Sans CN' },
  { path: '/usr/share/fonts/truetype/chinese/SourceHanSansCN-Bold.otf', family: 'Source Han Sans CN Bold', weight: 'bold' },
  // Noto Serif CJK
  { path: '/usr/share/fonts/truetype/chinese/NotoSerifCJK-Regular.ttc', family: 'Noto Serif CJK SC' },
  { path: '/usr/share/fonts/truetype/chinese/NotoSerifCJK-Bold.ttc', family: 'Noto Serif CJK SC Bold', weight: 'bold' },
  // 备用的 Noto Sans CJK 路径
  { path: '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', family: 'Noto Sans CJK SC' },
  { path: '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc', family: 'Noto Serif CJK SC' },
  // ===== 插件目录字体（绝对路径）=====
  { path: '/app/.agent/plugins/poster-plugin/fonts/微软雅黑.ttf', family: 'Microsoft YaHei' },
  { path: '/app/.agent/plugins/poster-plugin/fonts/微软雅黑粗体.ttf', family: 'Microsoft YaHei Bold', weight: 'bold' },
  { path: '/app/.agent/plugins/poster-plugin/fonts/LXGWWenKai-Regular.ttf', family: 'LXGW WenKai' },
  { path: '/app/.agent/plugins/poster-plugin/fonts/NotoSerifCJKsc-Regular.ttc', family: 'Noto Serif CJK SC' },
  // ===== Emoji 字体 =====
  { path: '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', family: 'Noto Color Emoji' },
  { path: '/usr/share/fonts/truetype/ancient-scripts/Symbola_hint.ttf', family: 'Symbola' },
  // ===== Liberation 西文字体（包含中文支持） =====
  { path: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', family: 'Liberation Sans' },
  { path: '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', family: 'Liberation Sans Bold', weight: 'bold' },
  { path: '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf', family: 'Liberation Serif' },
  { path: '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf', family: 'Liberation Mono' },
  // ===== 其他西文字体 =====
  { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', family: 'DejaVu Sans' },
  { path: '/usr/share/fonts/truetype/freefont/FreeSans.ttf', family: 'FreeSans' },
  { path: '/usr/share/fonts/TTF/NotoSans-Regular.ttf', family: 'Noto Sans' },
  // ===== Windows 字体 =====
  { path: 'C:\\Windows\\Fonts\\msyh.ttc', family: 'Microsoft YaHei' },
  { path: 'C:\\Windows\\Fonts\\msyhbd.ttc', family: 'Microsoft YaHei Bold', weight: 'bold' },
  { path: 'C:\\Windows\\Fonts\\simhei.ttf', family: 'SimHei' },
  { path: 'C:\\Windows\\Fonts\\simsun.ttc', family: 'SimSun' },
  { path: 'C:\\Windows\\Fonts\\Arial.ttf', family: 'Arial' },
  { path: 'C:\\Windows\\Fonts\\Times New Roman.ttf', family: 'Times New Roman' },
  { path: 'C:\\Windows\\Fonts\\Consolas.ttf', family: 'Consolas' },
  { path: 'C:\\Windows\\Fonts\\Georgia.ttf', family: 'Georgia' },
  // Windows Emoji
  { path: 'C:\\Windows\\Fonts\\seguiemj.ttf', family: 'Segoe UI Emoji' },
  { path: 'C:\\Windows\\Fonts\\EmojiOne Color.ttf', family: 'EmojiOne Color' },
  { path: '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf', family: 'Noto Sans' },
  // macOS 字体
  { path: '/System/Library/Fonts/Apple Color Emoji.ttc', family: 'Apple Color Emoji' },
  { path: '/System/Library/Fonts/Supplemental/Symbola.ttf', family: 'Symbola' },
]

// 默认字体信息
let defaultFont = {
  name: 'Microsoft YaHei',
  family: 'Microsoft YaHei',
  path: null,
  weight: 'normal',
  style: 'normal',
  isDefault: true,
}

/**
 * 注册字体文件
 */
function registerFontFile(fontPath, fontFamily, options = {}) {
  if (!fontFamily) return false
  
  // 避免重复注册
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

    const fontInfo = {
      name: fontFamily,
      family: fontFamily,
      path: fontPath,
      weight: options.weight || 'normal',
      style: options.style || 'normal',
      isDefault: false,
      isEmoji: isEmojiFont(fontFamily),
      source: options.source || 'unknown',
    }
    
    registeredFonts.set(fontFamily, fontInfo)
    
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
  // 清空之前的字体信息
  fontInfoList = []
  
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
      let fontName = path.basename(file, path.extname(file))

      // 检查是否为 Emoji 字体，如果是则使用标准名称注册
      let finalFontName = fontName
      if (isEmojiFont(fontName)) {
        finalFontName = emojiFontMappings[fontName] || 'Noto Color Emoji'
      }

      // 尝试注册
      if (registerFontFile(fontPath, finalFontName, { source: 'plugin' })) {
        if (isEmojiFont(finalFontName)) {
          console.log(`[poster] 已注册插件 Emoji 字体: ${finalFontName}`)
        } else {
          // 微软雅黑设为默认字体
          if (fontName.includes('微软雅黑') && !fontName.includes('粗体')) {
            defaultFont = {
              name: finalFontName,
              family: finalFontName,
              path: fontPath,
              weight: 'normal',
              style: 'normal',
              isDefault: true,
              source: 'plugin',
            }
            console.log(`[poster] 已注册插件字体(设为默认): ${finalFontName}`)
          } else {
            console.log(`[poster] 已注册插件字体: ${finalFontName}`)
          }
        }
        
        // 添加到列表
        fontInfoList.push({
          name: finalFontName,
          family: finalFontName,
          path: fontPath,
          source: 'plugin',
          isEmoji: isEmojiFont(finalFontName),
        })
      } else {
        console.log(`[poster] 字体文件加载失败: ${file}`)
      }
    }
  }

  // 强制加载系统 CJK 字体（即使插件字体已存在）
  console.log('[poster] 正在加载系统 CJK 字体...')
  for (const font of systemFonts) {
    if (font.family.includes('CJK') || font.family.includes('Han') || font.family.includes('Noto Sans')) {
      if (registerFontFile(font.path, font.family, { weight: font.weight, source: 'system' })) {
        console.log(`[poster] 已注册系统字体: ${font.family}`)
      }
    }
  }
  
  // 如果没有注册到任何字体，再尝试系统字体
  if (!defaultFont.path) {
    for (const font of systemFonts) {
      if (registerFontFile(font.path, font.family, { weight: font.weight, source: 'system' })) {
        if (font.weight !== 'bold') {
          defaultFont = {
            name: font.family,
            family: font.family,
            path: font.path,
            weight: font.weight || 'normal',
            style: font.style || 'normal',
            isDefault: true,
            source: 'system',
          }
          console.log(`[poster] 已注册系统字体: ${font.family}`)
          break
        }
      }
    }
  }

  // 确保有默认字体
  if (!registeredFonts.has(defaultFont.name)) {
    registeredFonts.set('sans-serif', { 
      name: 'sans-serif', 
      family: 'sans-serif', 
      path: null, 
      isDefault: true,
      source: 'fallback' 
    })
    defaultFont = {
      name: 'sans-serif',
      family: 'sans-serif',
      path: null,
      isDefault: true,
      source: 'fallback',
    }
    console.log('[poster] 使用默认字体: sans-serif')
  }

  // 注册系统 emoji 字体（用于支持 emoji 渲染）
  const emojiFonts = [
    { path: 'C:\\Windows\\Fonts\\seguiemj.ttf', family: 'Segoe UI Emoji' },
    { path: 'C:\\Windows\\Fonts\\seguisym.ttf', family: 'Segoe UI Symbol' },
    { path: 'C:\\Windows\\Fonts\\seguisb.ttf', family: 'Segoe UI Symbol' },
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
    { path: '/System/Library/Fonts/Apple Color Emoji.ttc', family: 'Apple Color Emoji' },
    { path: '/System/Library/Fonts/Supplemental/Symbola.ttf', family: 'Symbola' },
  ]

  for (const font of emojiFonts) {
    if (registerFontFile(font.path, font.family, { source: 'system-emoji' })) {
      if (!fontInfoList.find(f => f.name === font.family)) {
        fontInfoList.push({
          name: font.family,
          family: font.family,
          path: font.path,
          source: 'system-emoji',
          isEmoji: true,
        })
      }
      if (font.family === 'Noto Color Emoji' && registeredFonts.has('Noto Color Emoji')) {
        break
      }
    }
  }
  
  // 刷新字体列表
  refreshFontList()
}

/**
 * 刷新字体列表缓存
 */
function refreshFontList() {
  fontInfoList = []
  for (const [name, info] of registeredFonts) {
    fontInfoList.push({
      name: name,
      family: info.family || name,
      path: info.path,
      source: info.source || 'unknown',
      isEmoji: info.isEmoji || isEmojiFont(name),
      isDefault: info.isDefault || (name === defaultFont.name),
    })
  }
}

/**
 * 验证字体是否可用 - 支持字体别名映射
 */
function validateFont(fontFamily) {
  if (!fontFamily) return defaultFont.name
  
  // 首先检查是否直接注册
  if (registeredFonts.has(fontFamily)) return fontFamily
  
  // 检查别名映射
  if (chineseFontMappings[fontFamily]) {
    const mappedFont = chineseFontMappings[fontFamily]
    // 如果映射的目标字体已注册
    if (registeredFonts.has(mappedFont)) {
      return mappedFont
    }
  }
  
  // 大小写不敏感匹配
  const lower = fontFamily.toLowerCase()
  for (const [name] of registeredFonts) {
    if (name.toLowerCase() === lower) return name
  }
  
  // 别名的模糊匹配
  for (const [alias, target] of Object.entries(chineseFontMappings)) {
    if (alias.toLowerCase() === lower && registeredFonts.has(target)) {
      return target
    }
  }
  
  // 如果请求的是中文相关字体但没有精确匹配，尝试返回合适的中文字体
  if (/[\u4e00-\u9fff]/.test(fontFamily) || isCommonChineseFontName(fontFamily)) {
    // 返回默认中文字体
    if (registeredFonts.has('Microsoft YaHei')) return 'Microsoft YaHei'
    if (registeredFonts.has('Noto Sans CJK SC')) return 'Noto Sans CJK SC'
    if (registeredFonts.has('Source Han Sans CN')) return 'Source Han Sans CN'
  }

  return defaultFont.name
}

/**
 * 判断是否为常见中文字体名称
 */
function isCommonChineseFontName(name) {
  if (!name) return false
  const lower = name.toLowerCase()
  const chineseFontKeywords = [
    'hei', 'song', 'kai', 'fang', 'yuan', '仿', '宋', '楷', '黑', '圆',
    '微软', '思源', 'noto', 'source', 'wqy', '文泉', 'pingfang', 'hiragino'
  ]
  return chineseFontKeywords.some(kw => lower.includes(kw.toLowerCase()))
}

/**
 * 获取已注册字体列表（详细信息）
 */
function listAllFonts() {
  refreshFontList()
  
  // 按类型分组
  const regularFonts = fontInfoList.filter(f => !f.isEmoji)
  const emojiFonts = fontInfoList.filter(f => f.isEmoji)
  
  return {
    success: true,
    default: defaultFont,
    fonts: fontInfoList,
    regular: regularFonts.map(f => f.name),
    emoji: emojiFonts.map(f => f.name),
    total: fontInfoList.length,
  }
}

/**
 * 获取默认字体（详细信息对象）
 */
function getDefaultFont() {
  return { ...defaultFont }
}

/**
 * 获取默认字体名称（字符串，用于兼容）
 */
function getDefaultFontFamily() {
  return defaultFont.name
}

/**
 * 获取字体 fallback 列表
 */
function getFontFallbackChain(primaryFont) {
  const chain = []
  const validated = validateFont(primaryFont)
  
  // 添加主字体
  if (validated && validated !== defaultFont.name) {
    chain.push(validated)
  }
  
  // 添加默认字体
  if (!chain.includes(defaultFont.name)) {
    chain.push(defaultFont.name)
  }
  
  // 根据是否包含中文添加中文字体
  if (primaryFont && /[\u4e00-\u9fff]/.test(primaryFont)) {
    const chineseFonts = ['Microsoft YaHei', 'SimHei', 'SimSun', 'Noto Sans CJK SC']
    for (const cf of chineseFonts) {
      if (!chain.includes(cf) && registeredFonts.has(cf)) {
        chain.push(cf)
      }
    }
  }
  
  // 添加通用字体族
  const genericFonts = ['sans-serif', 'serif', 'monospace', 'Arial', 'Helvetica']
  for (const gf of genericFonts) {
    if (!chain.includes(gf) && (registeredFonts.has(gf) || gf === 'sans-serif')) {
      chain.push(gf)
    }
  }
  
  return chain
}

// 初始化
initFonts()

module.exports = {
  registerFontFile,
  validateFont,
  listAllFonts,
  getDefaultFont,
  getDefaultFontFamily,
  getFontFallbackChain,
  isEmojiFont,
  getRegisteredFonts: () => Array.from(registeredFonts.keys()),
}
