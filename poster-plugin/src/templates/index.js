/**
 * 模板模块导出
 */

const applyModernTemplate = require('./modern')
const applyBusinessTemplate = require('./business')
const applySocialTemplate = require('./social')
const applySimpleTemplate = require('./simple')
const applyTechTemplate = require('./tech')
const applyGradientTemplate = require('./gradient')

const TEMPLATES = {
  modern: applyModernTemplate,
  business: applyBusinessTemplate,
  social: applySocialTemplate,
  simple: applySimpleTemplate,
  tech: applyTechTemplate,
  gradient: applyGradientTemplate,
}

/**
 * 应用模板
 */
async function applyTemplate(project, canvas, templateName, args) {
  const templateFn = TEMPLATES[templateName]
  if (!templateFn) {
    throw new Error(`Unknown template: ${templateName}. Available: ${Object.keys(TEMPLATES).join(', ')}`)
  }
  return await templateFn(project, canvas, args)
}

/**
 * 获取可用模板列表
 */
function getAvailableTemplates() {
  return Object.keys(TEMPLATES)
}

module.exports = {
  applyTemplate,
  getAvailableTemplates,
  TEMPLATES,
}
