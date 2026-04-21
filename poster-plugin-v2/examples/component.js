/**
 * 组件示例 - 演示 Component 可复用组件
 */
const { PosterBuilder, Component, Layer, RectElement, TextElement } = require('../src/index')

async function main() {
  console.log('=== Poster Plugin V2 组件示例 ===\n')

  // 创建海报构建器
  const poster = new PosterBuilder({
    width: 1920,
    height: 1080,
    backgroundColor: '#0f0f23'
  })

  // 创建图层
  const contentLayer = poster.createLayer({ name: '内容层', zIndex: 1 })

  // 定义一个可复用的卡片组件
  function createFeatureCard(config) {
    const card = new Component({
      width: 350,
      height: 280,
      x: config.x,
      y: config.y,
      anchor: [0.5, 0.5]
    })

    // 背景矩形
    const bg = new RectElement({
      x: '50%',
      y: '50%',
      width: '100%',
      height: '100%',
      anchor: [0.5, 0.5],
      fillColor: config.bgColor || '#1e3a5f',
      borderRadius: 20
    })
    card.addElement(bg)

    // 标题
    const title = new TextElement({
      text: config.title || '标题',
      x: '50%',
      y: '40%',
      fontSize: 32,
      fontFamily: 'Microsoft YaHei',
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center'
    })
    card.addElement(title)

    // 描述
    const desc = new TextElement({
      text: config.desc || '描述文字',
      x: '50%',
      y: '60%',
      fontSize: 18,
      fontFamily: 'Microsoft YaHei',
      color: '#aaaaaa',
      textAlign: 'center'
    })
    card.addElement(desc)

    return card
  }

  // 使用组件工厂创建多个特性卡片
  const features = [
    { x: 400, y: 400, title: '组件化设计', desc: '可复用组件，一处定义多处使用', bgColor: '#1e3a5f' },
    { x: 960, y: 400, title: '层级管理', desc: 'Layer/Component 清晰分层', bgColor: '#2d1b4e' },
    { x: 1520, y: 400, title: '精准定位', desc: '相对坐标，百分比支持', bgColor: '#1b4e2d' }
  ]

  for (const f of features) {
    const card = createFeatureCard(f)
    contentLayer.addElement(card)
  }

  // 导出
  console.log('开始渲染...')
  const output = await poster.exportPNG('poster-component', './output')
  console.log(`\n✅ 海报已生成: ${output}`)

  poster.destroy()
}

main().catch(console.error)
