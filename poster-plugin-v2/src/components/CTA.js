/**
 * CTA 行动号召按钮组件
 * 自动计算宽度
 */
const { Button } = require('./Button')

class CTA extends Button {
  constructor(config = {}) {
    super({
      ...config,
      type: 'cta',
      width: 'auto',
      height: config.height || 50,
      radius: config.radius || 8,
      padding: config.padding || 25,
    })

    this.backgroundColor = config.backgroundColor || '#007bff'
    this.fontSize = config.fontSize || 20
  }
}

module.exports = { CTA }