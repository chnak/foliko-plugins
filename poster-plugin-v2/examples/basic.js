/**
 * 基础示例 - 演示核心 API
 */
const { PosterBuilder, RectElement, CircleElement, TextElement } = require('../src/index')

async function main() {
  console.log('=== Poster Plugin V2 基础示例 ===\n')

  // 创建海报构建器
  const poster = new PosterBuilder({
    width: 1080,
    height: 1920,
    backgroundColor: '#1a1a2e'
  })

  // 创建图层
  const backgroundLayer = poster.createLayer({ name: '背景层', zIndex: 0 })
  const contentLayer = poster.createLayer({ name: '内容层', zIndex: 1 })
  const decorationLayer = poster.createLayer({ name: '装饰层', zIndex: 2 })

  // 背景层 - 装饰圆形
  backgroundLayer.addElement(new CircleElement({
    x: '80%',
    y: '10%',
    radius: 200,
    fillColor: '#00d9ff',
    opacity: 0.3
  }))

  backgroundLayer.addElement(new CircleElement({
    x: '10%',
    y: '80%',
    radius: 150,
    fillColor: '#00ff88',
    opacity: 0.2
  }))

  // 内容层 - 主标题
  contentLayer.addElement(new TextElement({
    x: '50%',
    y: '15%',
    text: 'Poster Plugin V2',
    fontSize: 80,
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    opacity: 1
  }))

  // 内容层 - 副标题
  contentLayer.addElement(new TextElement({
    x: '50%',
    y: '22%',
    text: '新一代海报制作插件',
    fontSize: 36,
    fontFamily: 'sans-serif',
    color: '#00d9ff',
    textAlign: 'center'
  }))

  // 内容层 - 卡片
  const card = new RectElement({
    x: '50%',
    y: '45%',
    width: 800,
    height: 400,
    fillColor: '#16213e',
    strokeColor: '#00d9ff',
    strokeWidth: 2,
    borderRadius: 20
  })
  contentLayer.addElement(card)

  // 内容层 - 卡片内文字
  contentLayer.addElement(new TextElement({
    x: '50%',
    y: '40%',
    text: '基于 FKbuilder 思想',
    fontSize: 32,
    fontFamily: 'sans-serif',
    color: '#ffffff',
    textAlign: 'center'
  }))

  contentLayer.addElement(new TextElement({
    x: '50%',
    y: '48%',
    text: '• Layer 图层管理\n• Component 组件复用\n• 相对坐标支持',
    fontSize: 24,
    fontFamily: 'sans-serif',
    color: '#aaaaaa',
    textAlign: 'center'
  }))

  // 装饰层 - 底部标签
  decorationLayer.addElement(new RectElement({
    x: '50%',
    y: '90%',
    width: 300,
    height: 80,
    fillColor: '#00d9ff',
    borderRadius: 40
  }))

  decorationLayer.addElement(new TextElement({
    x: '50%',
    y: '90%',
    text: '立即体验 →',
    fontSize: 28,
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    color: '#1a1a2e',
    textAlign: 'center'
  }))

  // 导出
  console.log('开始渲染...')
  const output = await poster.exportPNG('poster-basic', './output')
  console.log(`\n✅ 海报已生成: ${output}`)

  poster.destroy()
}

main().catch(console.error)
