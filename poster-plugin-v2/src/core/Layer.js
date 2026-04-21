/**
 * 图层类
 * 类似 FKbuilder 的 Track，管理一组元素
 */
const { BaseElement } = require('./BaseElement')

class Layer {
  constructor(config = {}) {
    this.id = config.id || `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.name = config.name || 'Layer'

    // 尺寸（继承自 Canvas）
    this.width = config.width || 1920
    this.height = config.height || 1080

    // 层级
    this.zIndex = config.zIndex !== undefined ? config.zIndex : 0

    // 元素列表
    this.elements = []
  }

  /**
   * 添加元素（BaseElement 或有 initialize/render 方法的对象）
   * @param {BaseElement|Object} element
   * @returns {Layer} 返回自身支持链式调用
   */
  addElement(element) {
    if (element && typeof element.initialize === 'function' && typeof element.render === 'function') {
      element.parent = this
      this.elements.push(element)
    }
    return this
  }

  /**
   * 移除元素
   * @param {Object|string} element - 元素或元素 ID
   */
  removeElement(element) {
    const id = typeof element === 'string' ? element : element.id
    this.elements = this.elements.filter(el => el.id !== id)
  }

  /**
   * 获取元素
   * @param {string} id
   */
  getElement(id) {
    return this.elements.find(el => el.id === id)
  }

  /**
   * 初始化所有元素
   * @param {paper.PaperScope} paper
   */
  initialize(paper) {
    for (const element of this.elements) {
      if (element.initialize) {
        element.initialize(paper)
      }
    }
  }

  /**
   * 渲染所有元素
   * @param {paper.PaperScope} paper
   * @param {Object} context
   */
  render(paper, context = {}) {
    // 按 zIndex 排序
    const sorted = [...this.elements].sort((a, b) => a.zIndex - b.zIndex)
    for (const element of sorted) {
      if (element.render) {
        element.render(paper, context)
      }
    }
  }

  /**
   * 销毁所有元素
   */
  destroy() {
    for (const element of this.elements) {
      if (element.destroy) {
        element.destroy()
      }
    }
    this.elements = []
  }
}

module.exports = { Layer }
