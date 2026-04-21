/**
 * 调试 - 测试组件位置
 */
const { PosterBuilder, Component, RectElement, TextElement } = require('../src/index')

async function main() {
  console.log('=== 调试组件位置 ===\n')

  const poster = new PosterBuilder({
    width: 1920,
    height: 1080,
    backgroundColor: '#1a1a1a'
  })

  const layer = poster.createLayer({ name: '测试层', zIndex: 0 })

  // 测试1: 直接添加矩形测试位置
  layer.addElement(new RectElement({
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    fillColor: '#ff0000',
    anchor: [0, 0]
  }))

  layer.addElement(new TextElement({
    x: 100,
    y: 100,
    text: '红色矩形 x=100',
    fontSize: 24,
    color: '#ffffff'
  }))

  // 测试2: 组件
  const card = new Component({
    x: 500,
    y: 300,
    width: 300,
    height: 200,
    anchor: [0.5, 0.5],
    backgroundColor: '#00ff00'
  })
  card.addText({
    text: '绿色组件 x=500',
    x: '50%',
    y: '50%',
    fontSize: 24,
    color: '#000000',
    textAlign: 'center'
  })

  layer.addElement(card)

  // 测试3: 另一个位置的组件
  const card2 = new Component({
    x: 1000,
    y: 300,
    width: 300,
    height: 200,
    anchor: [0.5, 0.5],
    backgroundColor: '#0000ff'
  })
  card2.addText({
    text: '蓝色组件 x=1000',
    x: '50%',
    y: '50%',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center'
  })

  layer.addElement(card2)

  console.log('开始渲染...')
  const output = await poster.exportPNG('poster-debug', './output')
  console.log(`✅ 已生成: ${output}`)

  poster.destroy()
}

main().catch(console.error)
