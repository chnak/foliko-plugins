/**
 * 组件示例 - 测试新移植的组件
 */
const { PosterBuilder, Component, Layer, Button, Badge, Card, CTA, Chip, Avatar, Divider, Progress, Rating, Quote, Timeline, Star, RectElement, TextElement } = require('../src/index')

async function main() {
  console.log('=== Poster Plugin V2 组件示例 ===\n')

  const poster = new PosterBuilder({
    width: 1200,
    height: 900,
    backgroundColor: '#1a1a2e'
  })

  const layer = poster.createLayer({ name: '组件测试', zIndex: 0 })

  // ========== 1. Button 示例 ==========
  layer.addElement(new TextElement({
    x: 50,
    y: 50,
    text: '1. Button 按钮',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new Button({
    x: 50,
    y: 80,
    text: '主要按钮',
    backgroundColor: '#3b82f6',
    radius: 8,
    fontSize: 16,
    padding: 24,
    icon: '🚀',
    iconPosition: 'left'
  }))

  layer.addElement(new Button({
    x: 250,
    y: 80,
    text: '成功按钮',
    backgroundColor: '#22c55e',
    radius: 8,
    fontSize: 16,
    padding: 24
  }))

  layer.addElement(new Button({
    x: 420,
    y: 80,
    text: '危险按钮',
    backgroundColor: '#ef4444',
    radius: 8,
    fontSize: 16,
    padding: 24
  }))

  // ========== 2. Badge 示例 ==========
  layer.addElement(new TextElement({
    x: 50,
    y: 170,
    text: '2. Badge 徽章',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new Badge({
    x: 50,
    y: 200,
    text: '新功能',
    backgroundColor: '#3b82f6',
    radius: 4,
    padding: 12
  }))

  layer.addElement(new Badge({
    x: 150,
    y: 200,
    text: '热门',
    backgroundColor: '#ef4444',
    radius: 4,
    padding: 12
  }))

  layer.addElement(new Badge({
    x: 240,
    y: 200,
    text: '免费',
    backgroundColor: '#22c55e',
    radius: 4,
    padding: 12
  }))

  // ========== 3. Card 示例 ==========
  layer.addElement(new TextElement({
    x: 50,
    y: 260,
    text: '3. Card 卡片',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new Card({
    x: 50,
    y: 290,
    width: 200,
    height: 120,
    backgroundColor: '#2d2d3a',
    borderColor: '#404050',
    radius: 12,
    title: '产品特点',
    titleSize: 18,
    titleColor: '#ffffff',
    subtitle: '高效、简单、强大',
    subtitleSize: 14,
    subtitleColor: '#aaaaaa',
    padding: 16
  }))

  // ========== 4. CTA 示例 ==========
  layer.addElement(new TextElement({
    x: 50,
    y: 440,
    text: '4. CTA 按钮',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new CTA({
    x: 50,
    y: 470,
    text: '立即购买 →',
    backgroundColor: '#00d9ff',
    color: '#000000',
    fontSize: 18
  }))

  // ========== 5. Chip 示例 ==========
  layer.addElement(new TextElement({
    x: 50,
    y: 550,
    text: '5. Chip 标签',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new Chip({
    x: 50,
    y: 580,
    text: 'JavaScript',
    backgroundColor: '#f7df1e',
    color: '#000000',
    radius: 16,
    padding: 10
  }))

  layer.addElement(new Chip({
    x: 180,
    y: 580,
    text: 'TypeScript',
    backgroundColor: '#3178c6',
    color: '#ffffff',
    radius: 16,
    padding: 10
  }))

  layer.addElement(new Chip({
    x: 310,
    y: 580,
    text: 'Node.js',
    backgroundColor: '#339933',
    color: '#ffffff',
    radius: 16,
    padding: 10
  }))

  // ========== 6. Avatar 示例 ==========
  layer.addElement(new TextElement({
    x: 50,
    y: 650,
    text: '6. Avatar 头像',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new Avatar({
    x: 70,
    y: 700,
    size: 60,
    initials: 'John',
    backgroundColor: '#6366f1'
  }))

  layer.addElement(new Avatar({
    x: 150,
    y: 700,
    size: 60,
    initials: 'Alice',
    backgroundColor: '#22c55e'
  }))

  layer.addElement(new Avatar({
    x: 230,
    y: 700,
    size: 60,
    initials: 'Bob',
    backgroundColor: '#f59e0b'
  }))

  // ========== 7. Divider 示例 ==========
  layer.addElement(new TextElement({
    x: 500,
    y: 50,
    text: '7. Divider 分隔线',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new Divider({
    x: 500,
    y: 100,
    width: 200,
    color: '#00d9ff',
    thickness: 2,
    align: 'left'
  }))

  layer.addElement(new Divider({
    x: 500,
    y: 130,
    width: 200,
    color: '#6366f1',
    thickness: 2,
    style: 'dashed'
  }))

  // ========== 8. Progress 示例 ==========
  layer.addElement(new TextElement({
    x: 500,
    y: 170,
    text: '8. Progress 进度条',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new Progress({
    x: 500,
    y: 200,
    width: 250,
    height: 20,
    value: 75,
    trackColor: '#3a3a4a',
    fillColor: '#22c55e',
    radius: 10
  }))

  layer.addElement(new Progress({
    x: 500,
    y: 240,
    width: 250,
    height: 20,
    value: 45,
    trackColor: '#3a3a4a',
    fillColor: '#f59e0b',
    radius: 10
  }))

  // ========== 9. Rating 示例 ==========
  layer.addElement(new TextElement({
    x: 500,
    y: 290,
    text: '9. Rating 星级评分',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new Rating({
    x: 500,
    y: 330,
    value: 4,
    size: 28,
    filledColor: '#fbbf24',
    emptyColor: '#404050'
  }))

  // ========== 10. Star 示例 ==========
  layer.addElement(new TextElement({
    x: 500,
    y: 390,
    text: '10. Star 星形',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new Star({
    x: 530,
    y: 440,
    points: 5,
    outerRadius: 30,
    fillColor: '#fbbf24'
  }))

  layer.addElement(new Star({
    x: 620,
    y: 440,
    points: 6,
    outerRadius: 30,
    fillColor: '#ef4444'
  }))

  layer.addElement(new Star({
    x: 710,
    y: 440,
    points: 8,
    outerRadius: 30,
    fillColor: '#3b82f6'
  }))

  // ========== 11. Quote 示例 ==========
  layer.addElement(new TextElement({
    x: 500,
    y: 510,
    text: '11. Quote 引用',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new Quote({
    x: 500,
    y: 540,
    width: 280,
    text: '简单是成功的关键。',
    author: '李明',
    backgroundColor: '#2d2d3a',
    borderColor: '#00d9ff',
    fontSize: 16,
    padding: 16,
    radius: 8
  }))

  // ========== 12. Timeline 示例 ==========
  layer.addElement(new TextElement({
    x: 850,
    y: 50,
    text: '12. Timeline 时间线',
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold'
  }))

  layer.addElement(new Timeline({
    x: 850,
    y: 80,
    width: 300,
    dotSize: 14,
    gap: 50,
    items: [
      { date: '2024-01', title: '项目启动', description: '完成需求分析', active: true },
      { date: '2024-03', title: '开发阶段', description: '核心功能开发', active: true },
      { date: '2024-06', title: '测试阶段', description: '进行系统测试', active: false },
      { date: '2024-09', title: '正式发布', description: '产品正式上线', active: false }
    ]
  }))

  // ========== 渲染 ==========
  console.log('开始渲染...')
  const output = await poster.exportPNG('poster-components', './output')
  console.log(`\n✅ 海报已生成: ${output}`)

  poster.destroy()
}

main().catch(console.error)
