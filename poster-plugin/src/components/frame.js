/**
 * 装饰边框组件 - 多种风格
 */

const paper = require('paper')

/**
 * 创建边框
 */
function createFrame(project, args) {
  const {
    x = 0,
    y = 0,
    width = 400,
    height = 300,
    style = 'simple', // simple, double, dashed, dotted, corner, vintage, modern, floral
    color = '#000000',
    borderWidth = 2,
    radius = 0,
    padding = 0,
    opacity = 1,
  } = args

  const items = []
  const effectiveX = x + padding
  const effectiveY = y + padding
  const effectiveWidth = width - padding * 2
  const effectiveHeight = height - padding * 2

  const strokeOpts = {
    strokeColor: new paper.Color(color),
    strokeWidth: borderWidth,
  }

  switch (style) {
    case 'simple':
      // 简单矩形
      items.push(new paper.Path.Rectangle({
        point: [effectiveX, effectiveY],
        size: [effectiveWidth, effectiveHeight],
        radius: radius,
        ...strokeOpts,
      }))
      break

    case 'double':
      // 双线边框
      items.push(new paper.Path.Rectangle({
        point: [effectiveX, effectiveY],
        size: [effectiveWidth, effectiveHeight],
        radius: radius,
        ...strokeOpts,
      }))
      items.push(new paper.Path.Rectangle({
        point: [effectiveX + 8, effectiveY + 8],
        size: [effectiveWidth - 16, effectiveHeight - 16],
        radius: radius,
        ...strokeOpts,
      }))
      break

    case 'dashed':
      // 虚线边框
      const dashed = new paper.Path.Rectangle({
        point: [effectiveX, effectiveY],
        size: [effectiveWidth, effectiveHeight],
        radius: radius,
        ...strokeOpts,
      })
      dashed.dashArray = [10, 5]
      items.push(dashed)
      break

    case 'dotted':
      // 点线边框
      const dotted = new paper.Path.Rectangle({
        point: [effectiveX, effectiveY],
        size: [effectiveWidth, effectiveHeight],
        radius: radius,
        strokeColor: new paper.Color(color),
        strokeWidth: borderWidth,
        dashArray: [2, 4],
      })
      items.push(dotted)
      break

    case 'corner':
      // 四角装饰
      const cornerSize = Math.min(30, effectiveWidth / 4, effectiveHeight / 4)
      // 左上角
      items.push(new paper.Path.Line(
        [effectiveX, effectiveY + cornerSize],
        [effectiveX, effectiveY],
        { ...strokeOpts }
      ))
      items.push(new paper.Path.Line(
        [effectiveX, effectiveY],
        [effectiveX + cornerSize, effectiveY],
        { ...strokeOpts }
      ))
      // 右上角
      items.push(new paper.Path.Line(
        [effectiveX + effectiveWidth - cornerSize, effectiveY],
        [effectiveX + effectiveWidth, effectiveY],
        { ...strokeOpts }
      ))
      items.push(new paper.Path.Line(
        [effectiveX + effectiveWidth, effectiveY],
        [effectiveX + effectiveWidth, effectiveY + cornerSize],
        { ...strokeOpts }
      ))
      // 左下角
      items.push(new paper.Path.Line(
        [effectiveX, effectiveY + effectiveHeight - cornerSize],
        [effectiveX, effectiveY + effectiveHeight],
        { ...strokeOpts }
      ))
      items.push(new paper.Path.Line(
        [effectiveX, effectiveY + effectiveHeight],
        [effectiveX + cornerSize, effectiveY + effectiveHeight],
        { ...strokeOpts }
      ))
      // 右下角
      items.push(new paper.Path.Line(
        [effectiveX + effectiveWidth - cornerSize, effectiveY + effectiveHeight],
        [effectiveX + effectiveWidth, effectiveY + effectiveHeight],
        { ...strokeOpts }
      ))
      items.push(new paper.Path.Line(
        [effectiveX + effectiveWidth, effectiveY + effectiveHeight - cornerSize],
        [effectiveX + effectiveWidth, effectiveY + effectiveHeight],
        { ...strokeOpts }
      ))
      break

    case 'vintage':
      // 复古边框 - 双线+角装饰
      const vintageOuter = new paper.Path.Rectangle({
        point: [effectiveX, effectiveY],
        size: [effectiveWidth, effectiveHeight],
        ...strokeOpts,
      })
      items.push(vintageOuter)
      const vintageInner = new paper.Path.Rectangle({
        point: [effectiveX + 6, effectiveY + 6],
        size: [effectiveWidth - 12, effectiveHeight - 12],
        ...strokeOpts,
      })
      items.push(vintageInner)
      // 四角小方块
      const cornerBlockSize = 8
      const corners = [
        [effectiveX, effectiveY],
        [effectiveX + effectiveWidth - cornerBlockSize, effectiveY],
        [effectiveX, effectiveY + effectiveHeight - cornerBlockSize],
        [effectiveX + effectiveWidth - cornerBlockSize, effectiveY + effectiveHeight - cornerBlockSize],
      ]
      corners.forEach(([cx, cy]) => {
        items.push(new paper.Path.Rectangle({
          point: [cx, cy],
          size: [cornerBlockSize, cornerBlockSize],
          fillColor: new paper.Color(color),
        }))
      })
      break

    case 'modern':
      // 现代边框 - 粗细交替
      const modernPath = new paper.Path.Rectangle({
        point: [effectiveX, effectiveY],
        size: [effectiveWidth, effectiveHeight],
        radius: radius,
        ...strokeOpts,
      })
      modernPath.dashArray = [20, 5, 5, 5]
      items.push(modernPath)
      break

    case 'floral':
      // 花纹边框 - 角装饰+边线
      const floral = new paper.Path.Rectangle({
        point: [effectiveX, effectiveY],
        size: [effectiveWidth, effectiveHeight],
        ...strokeOpts,
      })
      items.push(floral)
      // 四个角的花纹
      const fCornerSize = Math.min(25, effectiveWidth / 6, effectiveHeight / 6)
      const fCorners = [
        { x: effectiveX, y: effectiveY, rotation: 0 },
        { x: effectiveX + effectiveWidth - fCornerSize, y: effectiveY, rotation: 90 },
        { x: effectiveX, y: effectiveY + effectiveHeight - fCornerSize, rotation: 270 },
        { x: effectiveX + effectiveWidth - fCornerSize, y: effectiveY + effectiveHeight - fCornerSize, rotation: 180 },
      ]
      fCorners.forEach(({ x: fx, y: fy, rotation }) => {
        const ornament = new paper.Path()
        ornament.add(new paper.Point(fx + fCornerSize / 2, fy + fCornerSize))
        ornament.add(new paper.Point(fx + fCornerSize, fy + fCornerSize / 2))
        ornament.add(new paper.Point(fx + fCornerSize, fy + fCornerSize))
        ornament.strokeColor = new paper.Color(color)
        ornament.strokeWidth = borderWidth
        ornament.rotate(rotation, new paper.Point(fx + fCornerSize, fy + fCornerSize))
        items.push(ornament)
      })
      break

    default:
      items.push(new paper.Path.Rectangle({
        point: [effectiveX, effectiveY],
        size: [effectiveWidth, effectiveHeight],
        radius: radius,
        ...strokeOpts,
      }))
  }

  // 应用透明度
  if (opacity !== 1) {
    items.forEach(item => {
      item.opacity = opacity
    })
  }

  return {
    success: true,
    type: 'frame',
    items: items.map(i => i.id),
  }
}

module.exports = createFrame
