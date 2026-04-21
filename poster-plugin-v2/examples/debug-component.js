/**
 * 调试 - 详细检查组件位置
 */
const { PosterBuilder, Component, RectElement, TextElement } = require('../src/index')

async function main() {
  console.log('=== 调试组件位置详情 ===\n')

  const poster = new PosterBuilder({
    width: 1920,
    height: 1080,
    backgroundColor: '#333333'
  })

  const layer = poster.createLayer({ name: '测试层', zIndex: 0 })

  // 添加网格参考线（用于对齐）
  // 画布中心 x=960
  layer.addElement(new RectElement({
    x: 960,
    y: 540,
    width: 10,
    height: 1080,
    fillColor: '#ff0000',
    opacity: 0.3
  }))
  layer.addElement(new TextElement({
    x: 960,
    y: 100,
    text: 'x=960 中心线',
    fontSize: 20,
    color: '#ff0000'
  }))

  // 测试1: 绝对像素位置的组件
  const card1 = new Component({
    x: 400,
    y: 300,
    width: 200,
    height: 150,
    anchor: [0.5, 0.5],
    backgroundColor: '#00ff00'
  })
  card1.addText({
    text: 'x=400 绿色',
    x: '50%',
    y: '50%',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center'
  })

  // 测试2: 居中组件
  const card2 = new Component({
    x: '50%',
    y: 300,
    width: 200,
    height: 150,
    anchor: [0.5, 0.5],
    backgroundColor: '#0088ff'
  })
  card2.addText({
    text: 'x=50% 蓝色',
    x: '50%',
    y: '50%',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center'
  })

  // 测试3: 绝对像素位置的组件
  const card3 = new Component({
    x: 1520,
    y: 300,
    width: 200,
    height: 150,
    anchor: [0.5, 0.5],
    backgroundColor: '#ff8800'
  })
  card3.addText({
    text: 'x=1520 橙色',
    x: '50%',
    y: '50%',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center'
  })

  console.log('Card1: x=400, y=300, width=200, height=150')
  console.log('Card2: x=50%, y=300, width=200, height=150')
  console.log('Card3: x=1520, y=300, width=200, height=150')

  layer.addElement(card1)
  layer.addElement(card2)
  layer.addElement(card3)

  console.log('开始渲染...')
  const output = await poster.exportPNG('poster-debug-component', './output')
  console.log(`✅ 已生成: ${output}`)

  poster.destroy()
}

main().catch(console.error)
