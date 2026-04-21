/**
 * 布局示例 - 演示层级和相对坐标
 */
const { PosterBuilder, Component, Layer, RectElement, CircleElement, TextElement } = require('../src/index')

async function main() {
  console.log('=== Poster Plugin V2 布局示例 ===\n')

  const poster = new PosterBuilder({
    width: 1920,
    height: 1080,
    backgroundColor: '#0a0a0f'
  })

  // ========== 层级1: 背景装饰 ==========
  const bgLayer = poster.createLayer({ name: '背景装饰', zIndex: 0 })

  // 大型渐变圆
  bgLayer.addElement(new CircleElement({
    x: '80%',
    y: '20%',
    radius: 400,
    fillColor: '#00d9ff',
    opacity: 0.1
  }))

  bgLayer.addElement(new CircleElement({
    x: '10%',
    y: '80%',
    radius: 300,
    fillColor: '#a855f7',
    opacity: 0.1
  }))

  // ========== 层级2: 主内容 ==========
  const mainLayer = poster.createLayer({ name: '主内容', zIndex: 1 })

  // 中心卡片（使用 RectElement 作为背景）
  const centerCard = new RectElement({
    x: '50%',
    y: '50%',
    width: 1200,
    height: 700,
    anchor: [0.5, 0.5],
    fillColor: '#15151a',
    strokeColor: '#333',
    strokeWidth: 1
  })
  mainLayer.addElement(centerCard)

  // 顶部标题栏
  const titleBar = new RectElement({
    x: '50%',
    y: '15%',
    width: 1200,
    height: 100,
    anchor: [0.5, 0.5],
    fillColor: '#1a1a2e'
  })
  mainLayer.addElement(titleBar)

  mainLayer.addElement(new TextElement({
    text: '🎯 产品特性',
    x: '50%',
    y: '15%',
    fontSize: 48,
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center'
  }))

  // 功能网格（6个卡片）
  const features = [
    { icon: '🚀', title: '高性能' },
    { icon: '🧩', title: '模块化' },
    { icon: '📱', title: '响应式' },
    { icon: '🎨', title: '丰富样式' },
    { icon: '⚡', title: '易于使用' },
    { icon: '🔧', title: '可配置' }
  ]

  features.forEach((f, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const baseX = 320 + col * 400
    const baseY = 300 + row * 200

    // 卡片背景
    mainLayer.addElement(new RectElement({
      x: baseX,
      y: baseY,
      width: 350,
      height: 160,
      anchor: [0.5, 0.5],
      fillColor: '#1e1e28',
      borderRadius: 16
    }))

    // 图标
    mainLayer.addElement(new TextElement({
      text: f.icon,
      x: baseX,
      y: baseY - 30,
      fontSize: 48,
      textAlign: 'center'
    }))

    // 标题
    mainLayer.addElement(new TextElement({
      text: f.title,
      x: baseX,
      y: baseY + 30,
      fontSize: 24,
      fontFamily: 'Microsoft YaHei',
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center'
    }))
  })

  // ========== 层级3: 底部 CTA ==========
  const ctaLayer = poster.createLayer({ name: 'CTA', zIndex: 2 })

  ctaLayer.addElement(new RectElement({
    x: '50%',
    y: '92%',
    width: 300,
    height: 80,
    anchor: [0.5, 0.5],
    fillColor: '#00d9ff',
    borderRadius: 40
  }))

  ctaLayer.addElement(new TextElement({
    text: '立即使用 →',
    x: '50%',
    y: '92%',
    fontSize: 28,
    fontFamily: 'Microsoft YaHei',
    fontWeight: 'bold',
    color: '#0a0a0f',
    textAlign: 'center'
  }))

  // ========== 渲染并导出 ==========
  console.log('开始渲染...')
  console.log(`画布尺寸: ${poster.width} x ${poster.height}`)
  console.log(`图层数量: ${poster.layers.length}`)

  const output = await poster.exportPNG('poster-layout', './output')
  console.log(`\n✅ 海报已生成: ${output}`)

  poster.destroy()
}

main().catch(console.error)
