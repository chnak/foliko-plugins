/**
 * Markdown 转海报组件
 * 直接调用现有的海报组件函数
 */

const paper = require('paper')
const {
  addRichText,
  addRectangle,
} = require('../elements')

// 预编译正则
const CHINESE_REGEX = /[\u4e00-\u9fff]/

/**
 * Markdown 转海报组件
 * @param {Object} project - Paper.js 项目
 * @param {Object} options - 配置选项
 */
function markdownToComponents(project, options) {
  const {
    text,
    startX = 0,
    startY = 0,
    maxWidth = 600,
    defaultFontSize = 24,
    defaultColor = '#1e293b',
    defaultFontFamily,
    defaultLineHeight = 1.5,
  } = options

  if (!text) return []

  const components = []
  let currentY = startY

  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i++
      continue
    }

    // 分割线 ---
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
      components.push({
        type: 'divider',
        x: startX,
        y: currentY,
        width: maxWidth,
        color: '#e5e7eb',
        thickness: 1,
      })
      currentY += 20 + defaultFontSize * 0.5 // 分割线后间距
      i++
      continue
    }

    // 表格
    if (trimmed.startsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const l = lines[i].trim()
        if (!/^\|[\s\-:|]+\|$/.test(l)) {
          tableLines.push(l)
        }
        i++
      }

      if (tableLines.length >= 2) {
        const tableResult = createTableComponents(project, tableLines, startX, currentY, maxWidth, defaultFontSize, defaultColor, defaultFontFamily)
        components.push(...tableResult.components)
        currentY += tableResult.height + defaultFontSize * 0.8 // 表格后间距
      }
      continue
    }

    // 标题
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const content = headingMatch[2].trim()
      const headingSizes = { 1: 48, 2: 40, 3: 32, 4: 28, 5: 24, 6: 20 }
      const fontSize = headingSizes[level] || defaultFontSize

      const segments = parseInlineStylesToRichText(content, startX, currentY, maxWidth, fontSize, defaultColor, defaultFontFamily, 'bold')
      for (const seg of segments) {
        components.push(seg)
      }
      // 标题后间距（比普通行高稍大）
      currentY += fontSize * 1.6
      i++
      continue
    }

    // 引用块
    if (trimmed.startsWith('>') || lines[i].trim().startsWith('>')) {
      const quoteLines = []
      while (i < lines.length) {
        const l = lines[i].trim()
        if (l.startsWith('>')) {
          const qLine = l.replace(/^>\s?/, '').trim()
          if (qLine) quoteLines.push(qLine)
          i++
        } else {
          break
        }
      }

      if (quoteLines.length > 0) {
        const quoteText = quoteLines.join(' ')
        // 引用使用斜体
        components.push({
          type: 'richText',
          x: startX + 16,
          y: currentY,
          width: maxWidth - 32,
          text: quoteText,
          fontSize: defaultFontSize * 0.9,
          italic: true,
          color: '#64748b',
          fontFamily: defaultFontFamily,
        })
        // 引用后间距
        currentY += defaultFontSize * 0.9 * defaultLineHeight + defaultFontSize * 0.5
      }
      continue
    }

    // 无序列表
    const ulMatch = trimmed.match(/^[\-\*\+]\s+(.+)$/)
    if (ulMatch) {
      const listItems = []
      while (i < lines.length) {
        const itemMatch = lines[i].trim().match(/^[\-\*\+]\s+(.+)$/)
        if (itemMatch) {
          listItems.push(itemMatch[1].trim())
          i++
        } else {
          break
        }
      }

      for (const item of listItems) {
        components.push({
          type: 'richText',
          x: startX + 20,
          y: currentY,
          width: maxWidth - 20,
          text: '• ' + item,
          fontSize: defaultFontSize,
          color: defaultColor,
          fontFamily: defaultFontFamily,
        })
        currentY += defaultFontSize * defaultLineHeight
      }
      // 列表后间距
      currentY += defaultFontSize * 0.3
      continue
    }

    // 有序列表
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/)
    if (olMatch) {
      const listItems = []
      while (i < lines.length) {
        const itemMatch = lines[i].trim().match(/^(\d+)\.\s+(.+)$/)
        if (itemMatch) {
          listItems.push({ num: parseInt(itemMatch[1]), text: itemMatch[2].trim() })
          i++
        } else {
          break
        }
      }

      for (const item of listItems) {
        components.push({
          type: 'richText',
          x: startX + 20,
          y: currentY,
          width: maxWidth - 20,
          text: `${item.num}. ${item.text}`,
          fontSize: defaultFontSize,
          color: defaultColor,
          fontFamily: defaultFontFamily,
        })
        currentY += defaultFontSize * defaultLineHeight
      }
      // 列表后间距
      currentY += defaultFontSize * 0.3
      continue
    }

    // 代码块
    if (trimmed === '```' || trimmed.startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && lines[i].trim() !== '```') {
        codeLines.push(lines[i])
        i++
      }
      i++

      if (codeLines.length > 0) {
        components.push({
          type: 'richText',
          x: startX,
          y: currentY,
          width: maxWidth,
          text: codeLines.join('\n'),
          fontSize: defaultFontSize * 0.85,
          fontFamily: 'monospace',
          color: '#f1f5f9',
          backgroundColor: '#1e293b',
        })
        // 代码块高度 = 行数 * (字号 * 行高)
        const codeBlockHeight = codeLines.length * (defaultFontSize * 0.85 * 1.4)
        currentY += codeBlockHeight + defaultFontSize * 0.5 // 代码块后间距
      }
      continue
    }

    // 链接 [text](url) -> 显示为蓝色带下划线
    const linkMatch = trimmed.match(/\[([^\]]+)\]\([^)]+\)/)
    if (linkMatch) {
      const linkText = trimmed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      components.push({
        type: 'richText',
        x: startX,
        y: currentY,
        width: maxWidth,
        text: linkText,
        fontSize: defaultFontSize,
        color: '#3b82f6',
        underline: true,
        fontFamily: defaultFontFamily,
      })
      currentY += defaultFontSize * defaultLineHeight
      i++
      continue
    }

    // 普通段落 - 解析行内样式
    const segments = parseInlineStylesToRichText(trimmed, startX, currentY, maxWidth, defaultFontSize, defaultColor, defaultFontFamily)
    for (const seg of segments) {
      components.push(seg)
    }
    // 段落后间距（比行高稍大）
    currentY += defaultFontSize * defaultLineHeight + defaultFontSize * 0.3
    i++
  }

  return components
}

/**
 * 解析行内样式，返回 richText 配置数组
 */
function parseInlineStylesToRichText(text, x, y, maxWidth, fontSize, color, fontFamily, defaultStyle = 'normal') {
  if (!text.includes('**') && !text.includes('__') &&
      !text.includes('*') && !text.includes('_') &&
      !text.includes('`')) {
    return [{
      type: 'richText',
      x,
      y,
      width: maxWidth,
      text,
      fontSize,
      color,
      fontFamily,
      align: 'left',
    }]
  }

  // 解析文本片段
  const segments = []
  let bold = defaultStyle === 'bold'
  let italic = defaultStyle === 'italic'
  let current = ''

  const flushCurrent = () => {
    if (current) {
      segments.push({ text: current, bold, italic })
      current = ''
    }
  }

  let i = 0
  while (i < text.length) {
    // 代码 `
    if (text[i] === '`') {
      flushCurrent()
      let codeContent = ''
      i++
      const codeStart = i
      while (i < text.length && text[i] !== '`') {
        i++
      }
      if (i < text.length) {
        codeContent = text.slice(codeStart, i)
        i++
      } else {
        codeContent = '`' + text.slice(codeStart)
      }
      segments.push({ text: codeContent, bold: false, italic: false, code: true })
      continue
    }

    // 粗体 ** 或 __
    if (i < text.length - 1) {
      const twoChar = text.slice(i, i + 2)
      if (twoChar === '**' || twoChar === '__') {
        flushCurrent()
        bold = !bold
        i += 2
        continue
      }
    }

    // 斜体 * 或 _（不是 ** 或 __ 的一部分）
    const char = text[i]
    if (char === '*' || char === '_') {
      if (i + 1 < text.length && text[i + 1] === char) {
        i++
      } else {
        flushCurrent()
        italic = !italic
        i++
        continue
      }
    }

    current += char
    i++
  }

  flushCurrent()

  // 合并相邻同样式片段
  const merged = []
  for (const seg of segments) {
    if (merged.length > 0) {
      const last = merged[merged.length - 1]
      if (last.bold === seg.bold && last.italic === seg.italic && !last.code && !seg.code) {
        last.text += seg.text
        continue
      }
    }
    merged.push({ ...seg })
  }

  if (merged.length === 1 && !merged[0].bold && !merged[0].italic && !merged[0].code) {
    return [{
      type: 'richText',
      x,
      y,
      width: maxWidth,
      text: merged[0].text,
      fontSize,
      color,
      fontFamily,
      align: 'left',
    }]
  }

  // 生成 richText 配置
  const result = []
  for (const seg of merged) {
    result.push({
      type: 'richText',
      x,
      y,
      width: maxWidth,
      text: seg.text,
      fontSize: seg.code ? fontSize * 0.85 : fontSize,
      fontFamily: seg.code ? 'monospace' : fontFamily,
      color: seg.code ? '#f1f5f9' : color,
      bold: seg.bold,
      italic: seg.italic,
      backgroundColor: seg.code ? '#334155' : undefined,
      align: 'left',
    })
  }

  return result
}

/**
 * 创建表格组件
 */
function createTableComponents(project, tableLines, startX, currentY, maxWidth, defaultFontSize, defaultColor, defaultFontFamily) {
  const components = []
  const tableStartY = currentY // 记录表格起始 Y
  const headerFontSize = defaultFontSize * 0.95
  const cellFontSize = defaultFontSize * 0.9
  const cellPadding = 12
  const borderColor = '#e5e7eb'
  const headerBg = '#f8fafc'
  const cellBg = '#ffffff'

  const headers = parseTableRow(tableLines[0])
  const rows = tableLines.slice(1).map(line => parseTableRow(line))

  const colCount = headers.length
  const colWidth = Math.floor(maxWidth / colCount)
  const totalWidth = colWidth * colCount

  // 计算每行需要的高度（根据文本换行行数）
  const calcRowHeight = (text, fontSize) => {
    const maxWidth = colWidth - cellPadding * 2
    // 简单估算：中文每个占 fontSize，英文每个占 fontSize * 0.5
    let lineWidth = 0
    let lines = 1
    for (const char of text) {
      const charWidth = /[\u4e00-\u9fff]/.test(char) ? fontSize : fontSize * 0.5
      if (lineWidth + charWidth > maxWidth) {
        lines++
        lineWidth = charWidth
      } else {
        lineWidth += charWidth
      }
    }
    return Math.max(fontSize * 2.2, fontSize * 1.4 * lines)
  }

  // 表头行高
  const headerRowHeight = calcRowHeight(headers.join(''), headerFontSize) + 8

  // 表头背景
  components.push({
    type: 'rectangle',
    x: startX,
    y: currentY,
    width: totalWidth,
    height: headerRowHeight,
    fill: headerBg,
    stroke: borderColor,
  })

  // 表头文字（左对齐，自动换行）
  let cellX = startX
  for (let j = 0; j < headers.length; j++) {
    components.push({
      type: 'richText',
      x: cellX + cellPadding,
      y: currentY + cellPadding + headerFontSize,
      width: colWidth - cellPadding * 2,
      text: headers[j],
      fontSize: headerFontSize,
      fontWeight: 'bold',
      color: defaultColor,
      fontFamily: defaultFontFamily,
      align: 'left',
    })
    cellX += colWidth
  }
  currentY += headerRowHeight

  // 数据行
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    const rowBg = r % 2 === 1 ? '#f8fafc' : cellBg

    // 计算这行的最大高度（根据最多换行的单元格）
    let maxRowHeight = cellFontSize * 2.2
    for (let j = 0; j < colCount; j++) {
      const cellText = row[j] || ''
      const cellRowHeight = calcRowHeight(cellText, cellFontSize)
      maxRowHeight = Math.max(maxRowHeight, cellRowHeight)
    }
    maxRowHeight += 8 // 上下 padding

    components.push({
      type: 'rectangle',
      x: startX,
      y: currentY,
      width: totalWidth,
      height: maxRowHeight,
      fill: rowBg,
      stroke: borderColor,
    })

    cellX = startX
    for (let j = 0; j < colCount; j++) {
      const cellText = row[j] || ''
      components.push({
        type: 'richText',
        x: cellX + cellPadding,
        y: currentY + cellPadding + cellFontSize,
        width: colWidth - cellPadding * 2,
        text: cellText,
        fontSize: cellFontSize,
        color: defaultColor,
        fontFamily: defaultFontFamily,
        align: 'left',
      })
      cellX += colWidth
    }
    currentY += maxRowHeight
  }

  return {
    components,
    height: currentY - tableStartY,
  }
}

/**
 * 解析表格行
 */
function parseTableRow(line) {
  return line.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim())
}

/**
 * 直接在画布上渲染 Markdown（调用现有组件函数）
 */
function renderMarkdown(project, canvas, options) {
  const components = markdownToComponents(project, options)

  const results = []
  for (const comp of components) {
    const { type, ...args } = comp

    switch (type) {
      case 'richText':
        // richText 组件支持更多样式
        results.push(addRichText(project, args))
        break
      case 'rectangle':
        results.push(addRectangle(project, args))
        break
      case 'divider':
        // 分割线
        const dividerLine = new paper.Path.Line({
          from: [args.x, args.y],
          to: [args.x + args.width, args.y],
          strokeColor: new paper.Color(args.color || '#e5e7eb'),
          strokeWidth: args.thickness || 1,
        })
        results.push({ success: true, id: dividerLine.id, type: 'divider' })
        break
      default:
        results.push({ success: false, error: `Unknown component type: ${type}` })
    }
  }

  return results
}

module.exports = {
  markdownToComponents,
  renderMarkdown,
}
