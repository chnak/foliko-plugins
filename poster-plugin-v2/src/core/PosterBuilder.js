/**
 * 海报构建器
 * 主入口类，管理图层、组件和渲染
 */
const { Layer } = require('./Layer')
const { Component } = require('./Component')
const { BaseElement } = require('./BaseElement')
const { initFonts } = require('../fonts')

class PosterBuilder {
  constructor(config = {}) {
    // 初始化字体系统
    initFonts()

    // 画布尺寸
    this.width = config.width || 1080
    this.height = config.height || 1920

    // Paper.js 相关
    this.paper = null
    this.project = null
    this.canvas = null

    // 背景色
    this.backgroundColor = config.backgroundColor || '#ffffff'

    // 图层
    this.layers = []

    // 组件
    this.components = []

    // 预设尺寸
    this.presets = {
      poster_square: { width: 1080, height: 1080 },
      poster_a4: { width: 2480, height: 3508 },
      poster_16_9: { width: 1920, height: 1080 },
      poster_9_16: { width: 1080, height: 1920 },
      banner_1920x500: { width: 1920, height: 500 },
      social_instagram: { width: 1080, height: 1080 },
      social_story: { width: 1080, height: 1920 },
      social_facebook: { width: 1200, height: 630 }
    }
  }

  /**
   * 初始化 Paper.js
   */
  _initPaper() {
    if (this.paper) return

    // 加载 paper.js
    this.paper = require('paper')
    this.paper.setup(new this.paper.Size(this.width, this.height))
    this.project = this.paper.project
    this.canvas = this.project.view.element

    // 创建背景
    if (this.backgroundColor) {
      const bg = new this.paper.Path.Rectangle({
        point: [0, 0],
        size: [this.width, this.height],
        fillColor: this.backgroundColor
      })
      bg.sendToBack()
    }
  }

  /**
   * 使用预设尺寸
   * @param {string} presetName
   */
  usePreset(presetName) {
    const preset = this.presets[presetName]
    if (preset) {
      this.width = preset.width
      this.height = preset.height
    }
    return this
  }

  /**
   * 创建图层
   * @param {Object} config
   * @returns {Layer}
   */
  createLayer(config = {}) {
    const layer = new Layer({
      ...config,
      width: this.width,
      height: this.height,
      zIndex: config.zIndex !== undefined ? config.zIndex : this.layers.length
    })
    this.layers.push(layer)
    return layer
  }

  /**
   * 获取图层
   * @param {string} id
   */
  getLayer(id) {
    return this.layers.find(l => l.id === id)
  }

  /**
   * 创建组件
   * @param {Object} config
   * @returns {Component}
   */
  createComponent(config = {}) {
    const component = new Component({
      ...config,
      width: config.width || 200,
      height: config.height || 200
    })
    this.components.push(component)
    return component
  }

  /**
   * 添加背景
   * @param {string} color
   * @returns {PosterBuilder}
   */
  addBackground(color) {
    this.backgroundColor = color
    return this
  }

  /**
   * 初始化所有图层和组件
   */
  initialize() {
    this._initPaper()

    // 初始化图层
    for (const layer of this.layers) {
      layer.initialize(this.paper)
    }

    // 初始化组件
    for (const component of this.components) {
      if (component instanceof Component && typeof component.initialize === 'function') {
        component.initialize(this.paper)
      }
    }
  }

  /**
   * 渲染所有内容
   */
  render() {
    if (!this.project) this.initialize()

    const context = { width: this.width, height: this.height }

    // 渲染所有图层
    for (const layer of this.layers) {
      layer.render(this.paper, context)
    }

    // 渲染所有组件
    for (const component of this.components) {
      if (component instanceof Component && typeof component.render === 'function') {
        component.render(this.paper, context)
      }
    }

    // 更新视图
    this.project.view.update()
    this.project.view.draw()
  }

  /**
   * 导出为 PNG
   * @param {string} filename
   * @param {string} outputDir
   */
  async exportPNG(filename, outputDir = '.') {
    this.render()

    const path = require('path')
    const fs = require('fs')
    const fullPath = path.join(outputDir, `${filename}.png`)

    // 确保目录存在
    fs.mkdirSync(outputDir, { recursive: true })

    // 导出
    const buffer = this.toBuffer('png')
    fs.writeFileSync(fullPath, buffer)

    return fullPath
  }

  /**
   * 导出为 Buffer
   * @param {string} format - 'png' | 'jpg'
   */
  toBuffer(format = 'png') {
    if (!this.canvas) {
      throw new Error('Canvas not initialized')
    }

    // 更新视图
    this.project.view.update()
    this.project.view.draw()

    // paper.js 在 Node.js 下使用 HTMLCanvasElement，需要复制像素到 @napi-rs/canvas
    const { createCanvas } = require('canvas')
    const outputCanvas = createCanvas(this.width, this.height)
    const viewCanvas = this.canvas
    const viewCtx = viewCanvas.getContext('2d')
    const imgData = viewCtx.getImageData(0, 0, this.width, this.height)
    const ctx = outputCanvas.getContext('2d')
    ctx.putImageData(imgData, 0, 0)

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
    return outputCanvas.toBuffer(mimeType)
  }

  /**
   * 导出为 Base64
   * @param {string} format - 'png' | 'jpg'
   */
  toBase64(format = 'png') {
    const buffer = this.toBuffer(format)
    return buffer.toString('base64')
  }

  /**
   * 导出为 SVG
   * @param {string} filename
   * @param {string} outputDir
   */
  async exportSVG(filename, outputDir = '.') {
    this.render()

    const path = require('path')
    const fs = require('fs')
    const fullPath = path.join(outputDir, `${filename}.svg`)

    fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(fullPath, this.project.exportSVG({ asString: true }))

    return fullPath
  }

  /**
   * 销毁
   */
  destroy() {
    // 销毁图层
    for (const layer of this.layers) {
      layer.destroy()
    }
    this.layers = []

    // 销毁组件
    for (const component of this.components) {
      if (component instanceof Component && typeof component.destroy === 'function') {
        component.destroy()
      }
    }
    this.components = []

    // 清除项目
    if (this.project) {
      this.project.clear()
    }
  }
}

module.exports = { PosterBuilder }
