/**
 * 基础元素类
 * 所有元素的基类，定义通用属性和方法
 */
class BaseElement {
  constructor(config = {}) {
    // 基础属性
    this.id = config.id || `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.type = config.type || 'base'

    // 位置（相对于父容器，支持百分比）
    this.x = config.x !== undefined ? config.x : 0
    this.y = config.y !== undefined ? config.y : 0

    // 尺寸
    this.width = config.width
    this.height = config.height

    // 锚点 [0-1, 0-1]，默认左上角
    this.anchor = config.anchor || [0, 0]

    // 样式
    this.opacity = config.opacity !== undefined ? config.opacity : 1
    this.rotation = config.rotation || 0
    this.visible = config.visible !== undefined ? config.visible : true

    // 层级
    this.zIndex = config.zIndex !== undefined ? config.zIndex : 0

    // 缓存
    this._paperItem = null
    this._initialized = false
    this._paper = null
  }

  /**
   * 初始化元素（创建 Paper.js 项目）
   * @param {paper.PaperScope} paper - Paper.js 作用域
   */
  initialize(paper) {
    if (this._initialized) return
    this._paper = paper
    this._paperItem = this._createPaperItem(paper)
    this._initialized = true
  }

  /**
   * 创建 Paper.js 项目（子类重写）
   * @param {paper.PaperScope} paper
   */
  _createPaperItem(paper) {
    return null
  }

  /**
   * 渲染元素
   * @param {paper.PaperScope} paper
   * @param {Object} context - 渲染上下文
   */
  render(paper, context = {}) {
    if (!this.visible) return
    if (!this._initialized) this.initialize(paper)
    if (!this._paperItem) return

    // 更新位置（支持百分比）
    const absoluteX = this._resolvePercent(this.x, context.width)
    const absoluteY = this._resolvePercent(this.y, context.height)

    this._paperItem.position = new paper.Point(absoluteX, absoluteY)
    this._paperItem.opacity = this.opacity
    this._paperItem.rotation = this.rotation
    this._paperItem.visible = this.visible
  }

  /**
   * 解析百分比值
   */
  _resolvePercent(value, reference) {
    if (typeof value === 'string' && value.endsWith('%')) {
      return (parseFloat(value) / 100) * reference
    }
    return value
  }

  /**
   * 获取元素的绝对位置
   */
  getAbsolutePosition(context) {
    return {
      x: this._resolvePercent(this.x, context.width),
      y: this._resolvePercent(this.y, context.height)
    }
  }

  /**
   * 销毁元素
   */
  destroy() {
    if (this._paperItem) {
      this._paperItem.remove()
      this._paperItem = null
    }
    this._initialized = false
  }
}

module.exports = { BaseElement }
