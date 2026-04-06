/**
 * 步骤指示器组件
 */

const paper = require('paper')

/**
 * 创建步骤指示器
 * 
 * @param {Object} project - Paper.js 项目
 * @param {Object} canvas - 画布对象
 * @param {Object} args - 组件参数
 * @param {number} args.x - X坐标
 * @param {number} args.y - Y坐标
 * @param {number} args.width - 总宽度
 * @param {Array} args.steps - 步骤数组 [{title, description}]
 * @param {number} args.currentStep - 当前步骤（从0开始）
 * @param {string} args.activeColor - 激活颜色
 * @param {string} args.inactiveColor - 未激活颜色
 * @param {string} args.completedColor - 已完成颜色
 * @param {number} args.circleSize - 圆圈大小
 */
function createStepper(project, canvas, args) {
  const {
    x, y,
    width = 600,
    steps = [],
    currentStep = 0,
    activeColor = '#6366f1',
    inactiveColor = '#e5e7eb',
    completedColor = '#22c55e',
    circleSize = 40,
  } = args

  const elements = []
  const stepWidth = steps.length > 1 ? width / (steps.length - 1) : width
  const lineY = y + circleSize / 2

  // 绘制连接线
  if (steps.length > 1) {
    const line = new paper.Path.Line({
      from: [x + circleSize / 2, lineY],
      to: [x + width - circleSize / 2, lineY],
      strokeColor: new paper.Color(inactiveColor),
      strokeWidth: 2,
    })
    elements.push({ type: 'line', id: line.id })

    // 绘制已完成部分的覆盖线
    if (currentStep > 0) {
      const completedLine = new paper.Path.Line({
        from: [x + circleSize / 2, lineY],
        to: [x + circleSize / 2 + (currentStep) * stepWidth, lineY],
        strokeColor: new paper.Color(completedColor),
        strokeWidth: 2,
      })
      elements.push({ type: 'line', id: completedLine.id })
    }
  }

  // 绘制每个步骤
  for (let i = 0; i < steps.length; i++) {
    const stepX = steps.length > 1 ? x + i * stepWidth : x
    const step = steps[i]
    let color = inactiveColor

    if (i < currentStep) {
      color = completedColor
    } else if (i === currentStep) {
      color = activeColor
    }

    // 绘制圆圈
    const circle = new paper.Path.Circle({
      center: [stepX + circleSize / 2, lineY],
      radius: circleSize / 2,
    })
    circle.fillColor = new paper.Color(color)
    elements.push({ type: 'circle', id: circle.id })

    // 绘制步骤编号或勾选
    const icon = i < currentStep ? '✓' : String(i + 1)
    const iconText = new paper.PointText({
      point: [stepX + circleSize / 2, lineY + circleSize / 6],
      content: icon,
      fontSize: 16,
      fillColor: new paper.Color('#ffffff'),
      justification: 'center',
    })
    elements.push({ type: 'text', id: iconText.id })

    // 绘制标题
    const titleText = new paper.PointText({
      point: [stepX + circleSize / 2, y + circleSize + 20],
      content: step.title || `Step ${i + 1}`,
      fontSize: 14,
      fillColor: new paper.Color(i <= currentStep ? '#1e293b' : '#94a3b8'),
      justification: 'center',
    })
    elements.push({ type: 'text', id: titleText.id })

    // 绘制描述
    if (step.description) {
      const descText = new paper.PointText({
        point: [stepX + circleSize / 2, y + circleSize + 38],
        content: step.description,
        fontSize: 11,
        fillColor: new paper.Color('#94a3b8'),
        justification: 'center',
      })
      elements.push({ type: 'text', id: descText.id })
    }
  }

  return { success: true, elements }
}

module.exports = createStepper
