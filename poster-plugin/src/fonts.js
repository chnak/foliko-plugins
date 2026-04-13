/**
 * 字体管理模块 - 支持多字体 fallback
 * 使用 @napi-rs/canvas 原生 API 解决中文乱码问题
 */

const path = require('path')
const fs = require('fs')
const canvas = require('canvas')
// 导入 @napi-rs/canvas 原生 API
let GlobalFonts = null
try {
  
  GlobalFonts = canvas.GlobalFonts
} catch (e) {
  console.warn('[poster] @napi-rs/canvas 未安装，字体注册可能受限')
}

// 兼容旧的 canvas API（备用）
let legacyRegisterFont = null
try {
  legacyRegisterFont = require('canvas').registerFont
} catch (e) {
  // ignore
}

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
  'SimHei': 'Microsoft YaHei',
  '黑体': 'Microsoft YaHei',
  'Hei': 'Microsoft YaHei',
  'Microsoft YaHei': 'Microsoft YaHei',
  '微软雅黑': 'Microsoft YaHei',
  'msyh': 'Microsoft YaHei',
  'Source Han Sans CN': 'Source Han Sans CN',
  '思源黑体': 'Noto Sans CJK SC',
  'Noto Sans CJK': 'Noto Sans CJK SC',
  'Noto Sans CJK SC': 'Noto Sans CJK SC',
  'Noto Sans': 'Noto Sans CJK SC',

  // 宋体系列
  'SimSun': 'SimSun',
  '宋体': 'SimSun',
  'Song': 'SimSun',
  'SimSun_GB2312': 'SimSun',
  '方正宋体': 'Noto Serif CJK SC',
  'Noto Serif CJK': 'Noto Serif CJK SC',
  'Noto Serif CJK SC': 'Noto Serif CJK SC',

  // 楷体系列
  'Kai': 'LXGW WenKai',
  '楷体': 'LXGW WenKai',
  'Kaiti': 'LXGW WenKai',
  'STKaiti': 'LXGW WenKai',
  '华文楷体': 'LXGW WenKai',
  '楷书': 'LXGW WenKai',
  'LXGW WenKai': 'LXGW WenKai',
  'LXGWWenKai': 'LXGW WenKai',
  'LXGWWenKai-Regular': 'LXGW WenKai',
  '霞鹜文楷': 'LXGW WenKai',

  // 仿宋系列
  'FangSong': 'SimSun',
  '仿宋': 'SimSun',
  'FangSong_GB2312': 'SimSun',
  '方正仿宋': 'Noto Serif CJK SC',

  // 幼圆
  'YouYuan': 'Microsoft YaHei',
  '幼圆': 'Microsoft YaHei',
  '圆体': 'Microsoft YaHei',

  // 华文系列
  'STHeiti': 'Microsoft YaHei',
  '华文黑体': 'Microsoft YaHei',
  'STSong': 'SimSun',
  '华文宋体': 'SimSun',
  'STSongti': 'SimSun',
  '华文宋体_GB2312': 'SimSun',
  'STZhongsong': 'Noto Serif CJK SC',
  '华文中宋': 'Noto Serif CJK SC',
  'STCaiyun': 'Microsoft YaHei',
  '华文彩云': 'Microsoft YaHei',
  'STXingkai': 'Microsoft YaHei',
  '华文行楷': 'Microsoft YaHei',
  'STXinwei': 'Microsoft YaHei',
  '华文新魏': 'Microsoft YaHei',
  'STLiti': 'Microsoft YaHei',
  '华文隶书': 'Microsoft YaHei',

  // 其他常见中文别名
  'sans-serif': 'Microsoft YaHei',
  'serif': 'SimSun',
  'monospace': 'Consolas',
  'PingFang': 'Microsoft YaHei',
  'PingFang SC': 'Microsoft YaHei',
  'Hiragino Sans GB': 'Microsoft YaHei',
  '冬青黑体': 'Microsoft YaHei',
  'WenQuanYi': 'Microsoft YaHei',
  '文泉驿': 'Microsoft YaHei',
  'WenQuanYi Micro Hei': 'Microsoft YaHei',
  'WenQuanYi Zen Hei': 'Microsoft YaHei',
  'AR PL': 'Microsoft YaHei',
  'AR PL UKai': 'SimSun',
}

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
 * 使用 @napi-rs/canvas 原生 API 注册字体
 */
function registerFontWithGlobalFonts(fontPath, fontFamily, options = {}) {
  if (!GlobalFonts) return false

  try {
    const absolutePath = path.resolve(fontPath)

    // 使用 registerFromPath 注册字体
    GlobalFonts.registerFromPath(absolutePath, fontFamily)

    return true
  } catch (e) {
    console.log(`[poster] GlobalFonts 注册字体失败: ${fontFamily}`, e.message)
    return false
  }
}

/**
 * 使用 legacy canvas API 注册字体（备用）
 */
function registerFontWithLegacy(fontPath, fontFamily, options = {}) {
  if (!legacyRegisterFont) return false

  try {
    legacyRegisterFont(fontPath, {
      family: fontFamily,
      weight: options.weight || 'normal',
      style: options.style || 'normal',
    })
    return true
  } catch (e) {
    console.log(`[poster] Legacy 注册字体失败: ${fontFamily}`, e.message)
    return false
  }
}

/**
 * 注册字体文件 - 双 API 策略
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

    let success = false

    // 优先使用 @napi-rs/canvas 原生 API
    if (GlobalFonts) {
      success = registerFontWithGlobalFonts(fontPath, fontFamily, options)
    }

    // 同时使用 legacy API 保持兼容性（paper.js 可能需要）
    if (!success && legacyRegisterFont) {
      success = registerFontWithLegacy(fontPath, fontFamily, options)
    }

    if (success) {
      const fontInfo = {
        name: fontFamily,
        family: fontFamily,
        path: path.resolve(fontPath),
        weight: options.weight || 'normal',
        style: options.style || 'normal',
        isDefault: false,
        isEmoji: isEmojiFont(fontFamily),
        source: options.source || 'unknown',
      }

      registeredFonts.set(fontFamily, fontInfo)
    }

    return success
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
    lower.includes('symbola') ||
    lower.includes('twemoji') ||
    lower.includes('emojione') ||
    lower.includes('joypixels') ||
    lower.includes('noto') ||
    lower.includes('apple') ||
    lower.includes('segoe ui emoji') ||
    lower.includes('twitter color emoji') ||
    lower.includes('open sans emoji')
  )
}

/**
 * 获取插件字体目录
 */
function getPluginFontsDir() {
  // 插件目录
  const pluginDir = path.join(__dirname, '..')
  const pluginFontsDir = path.join(pluginDir, 'fonts')

  // 也尝试从工作目录
  const cwdFontsDir = path.join(process.cwd(), '.agent', 'plugins', 'poster-plugin', 'fonts')

  if (fs.existsSync(pluginFontsDir)) {
    return pluginFontsDir
  }
  if (fs.existsSync(cwdFontsDir)) {
    return cwdFontsDir
  }
  return pluginFontsDir
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
      // 中文首选 - 微软雅黑
      { path: `${winDir}\\msyh.ttc`, family: 'Microsoft YaHei', weight: 'normal' },
      { path: `${winDir}\\msyhbd.ttc`, family: 'Microsoft YaHei', weight: 'bold' },
      // 备选中文字体
      { path: `${winDir}\\simhei.ttf`, family: 'SimHei', weight: 'normal' },
      { path: `${winDir}\\simsun.ttc`, family: 'SimSun', weight: 'normal' },
      { path: `${winDir}\\simkai.ttf`, family: 'KaiTi', weight: 'normal' },
      // 常用西文字体
      { path: `${winDir}\\arial.ttf`, family: 'Arial', weight: 'normal' },
      { path: `${winDir}\\ariali.ttf`, family: 'Arial', weight: 'normal', style: 'italic' },
      { path: `${winDir}\\arialbi.ttf`, family: 'Arial', weight: 'bold', style: 'italic' },
      { path: `${winDir}\\arialbd.ttf`, family: 'Arial', weight: 'bold' },
      { path: `${winDir}\\times.ttf`, family: 'Times New Roman', weight: 'normal' },
      { path: `${winDir}\\timesi.ttf`, family: 'Times New Roman', weight: 'normal', style: 'italic' },
      { path: `${winDir}\\timesbi.ttf`, family: 'Times New Roman', weight: 'bold', style: 'italic' },
      { path: `${winDir}\\timesbd.ttf`, family: 'Times New Roman', weight: 'bold' },
      { path: `${winDir}\\consola.ttf`, family: 'Consolas', weight: 'normal' },
      { path: `${winDir}\\calibri.ttf`, family: 'Calibri', weight: 'normal' },
      // Emoji 字体
      { path: `${winDir}\\seguiemj.ttf`, family: 'Segoe UI Emoji', weight: 'normal' },
    )
  } else if (isMac) {
    fonts.push(
      // macOS 中文字体
      { path: '/System/Library/Fonts/PingFang.ttc', family: 'PingFang SC', weight: 'normal' },
      { path: '/System/Library/Fonts/STHeiti Light.ttc', family: 'Heiti SC', weight: 'normal' },
      { path: '/System/Library/Fonts/STHeiti Medium.ttc', family: 'Heiti SC', weight: 'bold' },
      // Emoji
      { path: '/System/Library/Fonts/Apple Color Emoji.ttc', family: 'Apple Color Emoji', weight: 'normal' },
      // 常用西文
      { path: '/System/Library/Fonts/Helvetica.ttc', family: 'Helvetica', weight: 'normal' },
      { path: '/System/Library/Fonts/Times.ttc', family: 'Times New Roman', weight: 'normal' },
    )
  } else {
    // Linux
    fonts.push(
      // 系统 CJK 字体
      { path: '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', family: 'Noto Sans CJK SC', weight: 'normal' },
      { path: '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', family: 'Noto Sans CJK SC', weight: 'bold' },
      { path: '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc', family: 'Noto Serif CJK SC', weight: 'normal' },
      // 备选路径
      { path: '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', family: 'Noto Sans CJK SC', weight: 'normal' },
      { path: '/usr/share/fonts/truetype/chinese/NotoSansCJK-Regular.ttc', family: 'Noto Sans CJK SC', weight: 'normal' },
      // 西文字体
      { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', family: 'DejaVu Sans', weight: 'normal' },
      { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', family: 'DejaVu Sans', weight: 'bold' },
      // Emoji
      { path: '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', family: 'Noto Color Emoji', weight: 'normal' },
      { path: '/usr/share/fonts/truetype/noto/NotoEmoji-Regular.ttf', family: 'Noto Emoji', weight: 'normal' },
    )
  }

  return fonts
}

/**
 * 初始化字体
 */
function initFonts() {
  // 清空之前的字体信息
  fontInfoList = []
  registeredFonts.clear()

  // console.log('[poster] 初始化字体系统...')
  // console.log(`[poster] 平台: ${process.platform}`)

  // 1. 优先加载插件自带的字体
  const pluginFontsDir = getPluginFontsDir()
  // console.log(`[poster] 插件字体目录: ${pluginFontsDir}`)

  if (fs.existsSync(pluginFontsDir)) {
    const fontFiles = fs.readdirSync(pluginFontsDir)

    for (const file of fontFiles) {
      if (!file.endsWith('.ttf') && !file.endsWith('.otf') && !file.endsWith('.ttc')) {
        continue
      }

      const fontPath = path.join(pluginFontsDir, file)
      let fontName = path.basename(file, path.extname(file))

      // 检查是否为 Emoji 字体
      if (isEmojiFont(fontName)) {
        fontName = emojiFontMappings[fontName] || 'Noto Color Emoji'
      }

      // 特殊处理中文文件名
      if (fontName === '微软雅黑' || fontName === '微软雅黑粗体') {
        fontName = fontName.includes('粗体') ? 'Microsoft YaHei' : 'Microsoft YaHei'
      }

      const options = {
        source: 'plugin',
        weight: fontName.includes('Bold') || fontName.includes('粗体') ? 'bold' : 'normal',
      }

      if (registerFontFile(fontPath, fontName, options)) {
        // console.log(`[poster] 已注册插件字体: ${fontName} (${file})`)

        // 微软雅黑设为默认
        if ((fontName === 'Microsoft YaHei' || fontName === '微软雅黑') && options.weight === 'normal') {
          defaultFont = {
            name: 'Microsoft YaHei',
            family: 'Microsoft YaHei',
            path: fontPath,
            weight: 'normal',
            style: 'normal',
            isDefault: true,
            source: 'plugin',
          }
          // console.log(`[poster] 设为默认字体: Microsoft YaHei`)
        }

        fontInfoList.push({
          name: fontName,
          family: fontName,
          path: fontPath,
          source: 'plugin',
          isEmoji: isEmojiFont(fontName),
        })
      }
    }
  }

  // 2. 加载系统字体
  // console.log('[poster] 加载系统字体...')
  const systemFonts = getSystemFontPaths()

  for (const font of systemFonts) {
    if (registerFontFile(font.path, font.family, { weight: font.weight, style: font.style, source: 'system' })) {
      if (!fontInfoList.find(f => f.name === font.family)) {
        fontInfoList.push({
          name: font.family,
          family: font.family,
          path: font.path,
          source: 'system',
          isEmoji: isEmojiFont(font.family),
        })
      }
    }
  }

  // 3. 如果没有默认字体，尝试从系统字体中选择
  if (!defaultFont.path) {
    // 优先选择支持中文的系统字体
    const chineseFontCandidates = ['Microsoft YaHei', 'SimHei', 'PingFang SC', 'Noto Sans CJK SC', 'Source Han Sans CN']

    for (const candidate of chineseFontCandidates) {
      if (registeredFonts.has(candidate)) {
        const info = registeredFonts.get(candidate)
        defaultFont = {
          name: candidate,
          family: candidate,
          path: info.path,
          weight: 'normal',
          style: 'normal',
          isDefault: true,
          source: 'system',
        }
        // console.log(`[poster] 设为默认字体: ${candidate}`)
        break
      }
    }
  }

  // 4. 确保有回退字体
  const fallbackFonts = [
    { family: 'Arial', weight: 'normal', path: 'C:\\Windows\\Fonts\\arial.ttf' },
    { family: 'Helvetica', weight: 'normal', path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf' },
  ]

  for (const fb of fallbackFonts) {
    if (!registeredFonts.has(fb.family) && fs.existsSync(fb.path)) {
      registerFontFile(fb.path, fb.family, { weight: fb.weight, source: 'fallback' })
    }
  }

  // 5. 最终回退
  if (!registeredFonts.has('sans-serif')) {
    registeredFonts.set('sans-serif', {
      name: 'sans-serif',
      family: 'sans-serif',
      path: null,
      isDefault: false,
      source: 'fallback',
    })
  }

  if (!defaultFont.path) {
    defaultFont = {
      name: 'sans-serif',
      family: 'sans-serif',
      path: null,
      weight: 'normal',
      style: 'normal',
      isDefault: true,
      source: 'fallback',
    }
  }

  // 打印注册结果
  // console.log(`[poster] 字体注册完成，共 ${registeredFonts.size} 个字体`)
  // console.log(`[poster] 默认字体: ${defaultFont.name} (${defaultFont.source})`)

  // 打印中文字体列表
  const cjkFonts = Array.from(registeredFonts.keys()).filter(f =>
    f.includes('CJK') || f.includes('Han') || f.includes('YaHei') ||
    f.includes('Hei') || f.includes('Song') || f.includes('Kai') ||
    f.includes('Fang') || f.includes('Yuan') || f.includes('PingFang')
  )
  if (cjkFonts.length > 0) {
    // console.log(`[poster] 已注册 CJK 字体: ${cjkFonts.join(', ')}`)
  }

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
 * 返回 null 表示字体不存在（会进入回退链）
 */
function validateFont(fontFamily) {
  if (!fontFamily) return null

  // 直接匹配
  if (registeredFonts.has(fontFamily)) return fontFamily

  // 别名映射
  const mapped = chineseFontMappings[fontFamily]
  if (mapped && registeredFonts.has(mapped)) {
    return mapped
  }

  // 大小写不敏感匹配
  const lower = fontFamily.toLowerCase()
  for (const [name] of registeredFonts) {
    if (name.toLowerCase() === lower) return name
  }

  // 如果请求的是中文，尝试返回中文字体
  if (/[\u4e00-\u9fff]/.test(fontFamily) || isCommonChineseFontName(fontFamily)) {
    const chineseFonts = ['Microsoft YaHei', 'PingFang SC', 'SimHei', 'Noto Sans CJK SC']
    for (const cf of chineseFonts) {
      if (registeredFonts.has(cf)) return cf
    }
  }

  // 字体不存在，返回 null 让调用者将其加入回退链
  return null
}

/**
 * 判断是否为常见中文字体名称
 */
function isCommonChineseFontName(name) {
  if (!name) return false
  const lower = name.toLowerCase()
  const keywords = [
    'hei', 'song', 'kai', 'fang', 'yuan', '仿', '宋', '楷', '黑', '圆',
    '微软', '思源', 'noto', 'source', 'wqy', '文泉', 'pingfang', 'hiragino'
  ]
  return keywords.some(kw => lower.includes(kw.toLowerCase()))
}

/**
 * 获取已注册字体列表
 */
function listAllFonts() {
  refreshFontList()

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
 * 获取默认字体
 */
function getDefaultFont() {
  return { ...defaultFont }
}

/**
 * 获取默认字体名称
 */
function getDefaultFontFamily() {
  return defaultFont.name
}

/**
 * 获取字体 fallback 链
 * @napi-rs/canvas 支持逗号分隔的字体链
 * emoji 字体始终在末尾，确保 emoji 能正确显示
 * 不存在的字体会被加入回退链第一优先位置
 */
function getFontFallbackChain(primaryFont, text = '') {
  const chain = []

  // 如果请求的字体不存在，仍将其加入回退链第一优先（用于字体回退）
  if (primaryFont && primaryFont !== 'sans-serif' && primaryFont !== defaultFont.name) {
    const validated = validateFont(primaryFont)
    if (!validated) {
      // 字体不存在，将其加入回退链第一位置
      chain.push(primaryFont)
    }
  }

  const validated = validateFont(primaryFont || defaultFont.name)

  // 主字体（如果存在且不在链中）
  if (validated && !chain.includes(validated)) {
    chain.push(validated)
  }

  // 中文字体（如果检测到中文或 primaryFont 是中文字体）
  const hasChinese = /[\u4e00-\u9fff]/.test(text || primaryFont || '')
  const isChinesePrimary = isCommonChineseFontName(primaryFont) || isChineseFont(primaryFont)

  if (hasChinese || isChinesePrimary) {
    // 添加所有已注册的中文字体到 fallback 链
    for (const [name] of registeredFonts) {
      if (isChineseFont(name) && !chain.includes(name)) {
        chain.push(name)
      }
    }
  }

  // 如果主字体来自插件字体目录，自动添加所有其他已注册字体作为回退
  const pluginFontNames = ['msyh', 'wryh', 'PatuaOne', 'PatuaOne-Regular', 'SegUIVar', 'seguisym', 'seguiemj']
  const isPluginFont = primaryFont && pluginFontNames.some(
    pf => primaryFont.toLowerCase().includes(pf.toLowerCase())
  )
  if (isPluginFont || !primaryFont) {
    // 添加所有已注册的插件字体作为回退
    for (const [name] of registeredFonts) {
      if (!chain.includes(name) && name !== validated) {
        const isPluginSource = registeredFonts.get(name)?.source === 'plugin'
        if (isPluginSource) {
          chain.push(name)
        }
      }
    }
  }

  // 添加默认字体（如果不在链中）
  if (!chain.includes(defaultFont.name)) {
    chain.push(defaultFont.name)
  }

  // emoji 字体始终添加到末尾（确保 emoji 能显示）
  // 优先使用插件字体目录中的 emoji 字体
  const emojiFontList = ['seguiemj', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Noto Emoji', 'Symbola']
  for (const ef of emojiFontList) {
    if (!chain.includes(ef) && registeredFonts.has(ef)) {
      chain.push(ef)
      break // 只加一个 emoji 字体
    }
  }

  // 添加通用字体族作为最终回退
  const genericFallbacks = ['sans-serif', 'serif', 'monospace']
  for (const fb of genericFallbacks) {
    if (!chain.includes(fb) && registeredFonts.has(fb)) {
      chain.push(fb)
    }
  }

  return chain
}

/**
 * 判断是否为中文字体
 */
function isChineseFont(fontName) {
  if (!fontName) return false
  const lower = fontName.toLowerCase()
  // 包含中文字体关键词或是 CJK 字体
  return lower.includes('cjk') ||
         lower.includes('hei') ||
         lower.includes('song') ||
         lower.includes('kai') ||
         lower.includes('ming') ||
         lower.includes('fang') ||
         lower.includes('yuan') ||
         lower.includes('yahei') ||
         lower.includes('pingfang') ||
         /[\u4e00-\u9fff]/.test(fontName)
}

/**
 * 使用 @napi-rs/canvas 匹配字体（用于文本度量）
 */
function matchFont(text, fontFamily) {
  if (!GlobalFonts) return fontFamily || defaultFont.name

  try {
    // GlobalFonts.matchFont 可以在没有精确字体时返回最接近的匹配
    const matched = GlobalFonts.matchFont(text, fontFamily)
    return matched || fontFamily || defaultFont.name
  } catch (e) {
    return fontFamily || defaultFont.name
  }
}

/**
 * 获取所有已注册的字体家族
 */
function getFontFamilies() {
  if (GlobalFonts && GlobalFonts.families) {
    return GlobalFonts.families
  }
  return Array.from(registeredFonts.keys())
}

// 初始化
initFonts()

module.exports = {
  init: initFonts,
  registerFontFile,
  validateFont,
  listAllFonts,
  getDefaultFont,
  getDefaultFontFamily,
  getFontFallbackChain,
  getFontFamilies,
  matchFont,
  isEmojiFont,
  getRegisteredFonts: () => Array.from(registeredFonts.keys()),
}
