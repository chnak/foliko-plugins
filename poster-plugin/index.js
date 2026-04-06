/**
 * Poster Plugin - 海报制作插件
 * 
 * 模块化架构，支持组件化海报生成
 * 
 * 使用方法：
 * 1. 基础元素：add_poster_rectangle, add_poster_circle, add_poster_text 等
 * 2. 高级组件：add_poster_card, add_poster_badge, add_poster_cta 等
 * 3. 组件化生成：compose_poster - 通过配置 JSON 一次性生成海报
 * 4. 模板生成：generate_poster - 一键使用预设模板
 */

module.exports = require('./src/index.js')
