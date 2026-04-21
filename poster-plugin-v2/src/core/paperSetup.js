/**
 * Paper.js Node.js 环境初始化
 */
const paper = require('paper')

let initialized = false
let paperScope = null

function setupPaper(width, height) {
  if (initialized && paperScope) {
    return paperScope
  }

  // 使用 canvas 模块创建画布
  const { createCanvas } = require('canvas')
  const canvas = createCanvas(width, height)

  // 设置 paper.js
  paper.setup(canvas)
  paperScope = paper
  initialized = true

  return paper
}

function getPaper() {
  if (!initialized) {
    throw new Error('Paper.js 未初始化，请先调用 setupPaper(width, height)')
  }
  return paperScope
}

module.exports = { setupPaper, getPaper }
