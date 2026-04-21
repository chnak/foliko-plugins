/**
 * 组件类
 * 可复用的元素组合，支持相对坐标
 */
class Component {
  constructor(config = {}) {
    this.id = config.id || `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.type = 'component'
    this.name = config.name || 'Component'

    // 组件尺寸
    this.width = config.width || 200
    this.height = config.height || 200

    // 位置
    this.x = config.x !== undefined ? config.x : '50%'
    this.y = config.y !== undefined ? config.y : '50%'

    // 样式
    this.opacity = config.opacity !== undefined ? config.opacity : 1
    this.visible = config.visible !== undefined ? config.visible : true
    this.zIndex = config.zIndex || 0

    // 元素列表
    this.elements = []

    // 背景
    this.backgroundColor = config.backgroundColor || config.background || null
    this._bgElement = null
  }

  addElement(element) {
    this.elements.push(element)
    return this
  }

  addText(config) {
    const { TextElement } = require('../elements/TextElement')
    return this.addElement(new TextElement(config))
  }

  addRect(config) {
    const { RectElement } = require('../elements/RectElement')
    return this.addElement(new RectElement(config))
  }

  addCircle(config) {
    const { CircleElement } = require('../elements/CircleElement')
    return this.addElement(new CircleElement(config))
  }

  addImage(config) {
    const { ImageElement } = require('../elements/ImageElement')
    return this.addElement(new ImageElement(config))
  }

  _resolvePercent(value, reference) {
    if (typeof value === 'string' && value.endsWith('%')) {
      return (parseFloat(value) / 100) * reference
    }
    return value !== undefined ? value : 0
  }

  initialize(paper) {
    // 创建背景
    if (this.backgroundColor) {
      const { RectElement } = require('../elements/RectElement')
      this._bgElement = new RectElement({
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
        fillColor: this.backgroundColor
      })
      this._bgElement.initialize(paper)
    }

    // 初始化子元素
    for (const element of this.elements) {
      if (element.initialize) {
        element.initialize(paper)
      }
    }
  }

  render(paper, context = {}) {
    if (!this.visible) return

    // 计算组件的绝对位置
    const absX = this._resolvePercent(this.x, context.width)
    const absY = this._resolvePercent(this.y, context.height)

    // 计算组件的绝对尺寸
    const absWidth = this._resolvePercent(this.width, context.width)
    const absHeight = this._resolvePercent(this.height, context.height)

    // 组件内部上下文（相对于组件自身）
    const innerContext = {
      width: absWidth,
      height: absHeight
    }

    // 渲染背景
    if (this._bgElement && this._bgElement._paperItem) {
      this._bgElement._paperItem.position = new paper.Point(
        absX + absWidth / 2,
        absY + absHeight / 2
      )
    }

    // 渲染子元素
    for (const element of this.elements) {
      if (!element.render) continue

      // 子元素位置是相对于组件的，加上组件的偏移
      const childX = this._resolvePercent(element.x, absWidth)
      const childY = this._resolvePercent(element.y, absHeight)

      const absoluteX = absX + childX
      const absoluteY = absY + childY

      // 创建绝对上下文
      const absoluteContext = {
        width: context.width,
        height: context.height
      }

      // 更新子元素位置
      if (element._paperItem) {
        element._paperItem.position = new paper.Point(absoluteX, absoluteY)
        element._paperItem.opacity = element.opacity * this.opacity
      }

      // 渲染子元素（传入组件尺寸作为参考）
      element.render(paper, innerContext)
    }
  }

  getElements() {
    return this.elements
  }

  destroy() {
    if (this._bgElement) {
      this._bgElement.destroy()
    }
    for (const element of this.elements) {
      if (element.destroy) {
        element.destroy()
      }
    }
    this.elements = []
  }
}

module.exports = { Component }
