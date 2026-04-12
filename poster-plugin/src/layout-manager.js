/**
 * 布局管理器 - 检测和避免元素重叠
 */

class LayoutManager {
  constructor(project, canvasSize) {
    this.project = project || null
    this.width = canvasSize?.width || 0
    this.height = canvasSize?.height || 0
    this.elements = [] // 存储已添加元素的边界信息
  }

  /**
   * 获取画布上的所有元素边界
   */
  getAllElementBounds() {
    if (!this.project || !this.project.activeLayer) {
      return []
    }

    const bounds = []
    const children = this.project.activeLayer.children

    for (const child of children) {
      if (child.bounds) {
        bounds.push({
          id: child.id || `element_${bounds.length}`,
          type: child.className,
          bounds: {
            x: child.bounds.x,
            y: child.bounds.y,
            width: child.bounds.width,
            height: child.bounds.height,
            right: child.bounds.x + child.bounds.width,
            bottom: child.bounds.y + child.bounds.height
          },
          // 额外属性
          name: child.name || null,
          opacity: child.opacity
        })
      }
    }

    return bounds
  }

  /**
   * 检测两个边界是否重叠
   */
  isOverlapping(bounds1, bounds2, margin = 0) {
    return !(
      bounds1.right + margin <= bounds2.x ||
      bounds2.right + margin <= bounds1.x ||
      bounds1.bottom + margin <= bounds2.y ||
      bounds2.bottom + margin <= bounds1.y
    )
  }

  /**
   * 检测新元素是否与现有元素重叠
   */
  checkOverlap(newBounds, margin = 10) {
    const overlaps = []
    const bounds = this.getAllElementBounds()

    for (const element of bounds) {
      if (this.isOverlapping(newBounds, element.bounds, margin)) {
        overlaps.push({
          elementId: element.id,
          type: element.type,
          bounds: element.bounds,
          overlapArea: this.calculateOverlapArea(newBounds, element.bounds)
        })
      }
    }

    return {
      hasOverlap: overlaps.length > 0,
      overlaps
    }
  }

  /**
   * 计算重叠面积
   */
  calculateOverlapArea(bounds1, bounds2) {
    const x1 = Math.max(bounds1.x, bounds2.x)
    const y1 = Math.max(bounds1.y, bounds2.y)
    const x2 = Math.min(bounds1.right, bounds2.right)
    const y2 = Math.min(bounds1.bottom, bounds2.bottom)

    if (x1 >= x2 || y1 >= y2) return 0

    return (x2 - x1) * (y2 - y1)
  }

  /**
   * 添加元素到布局管理器
   */
  addElement(bounds, id, type) {
    this.elements.push({
      id,
      type,
      bounds: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        right: bounds.x + bounds.width,
        bottom: bounds.y + bounds.height
      }
    })
  }

  /**
   * 获取下一个可用位置 - 向下排列
   */
  getNextPositionBelow(startY, height, margin = 20) {
    // 找到所有元素的底部边界
    let maxBottom = startY
    const bounds = this.getAllElementBounds()

    for (const element of bounds) {
      if (element.bounds.bottom > maxBottom) {
        maxBottom = element.bounds.bottom
      }
    }

    return {
      x: 40, // 默认左边距
      y: maxBottom + margin
    }
  }

  /**
   * 获取网格对齐位置
   */
  getGridPosition(column, row, cellWidth, cellHeight, gap = 20, startX = 40, startY = 60) {
    return {
      x: startX + column * (cellWidth + gap),
      y: startY + row * (cellHeight + gap)
    }
  }

  /**
   * 获取安全区域内的随机位置
   */
  getRandomPosition(width, height, margin = 40) {
    const maxX = this.width - width - margin
    const maxY = this.height - height - margin

    return {
      x: margin + Math.random() * (maxX - margin),
      y: margin + Math.random() * (maxY - margin)
    }
  }

  /**
   * 获取推荐位置 - 基于布局提示
   */
  getRecommendedPosition(width, height, layoutHint = 'below', margin = 20) {
    const bounds = this.getAllElementBounds()
    let recommended = { x: 40, y: 60 }

    switch (layoutHint) {
      case 'center':
        recommended = {
          x: (this.width - width) / 2,
          y: (this.height - height) / 2
        }
        break

      case 'below':
        recommended = this.getNextPositionBelow(60, height, margin)
        break

      case 'top':
        // 找最顶部的元素
        let minTop = this.height
        for (const el of bounds) {
          if (el.bounds.y < minTop) {
            minTop = el.bounds.y
          }
        }
        recommended = {
          x: 40,
          y: Math.max(60, minTop - height - margin)
        }
        break

      case 'right':
        // 找最右边的元素
        let maxRight = 0
        for (const el of bounds) {
          if (el.bounds.right > maxRight) {
            maxRight = el.bounds.right
          }
        }
        recommended = {
          x: maxRight + margin,
          y: 60
        }
        break

      case 'left':
        // 找最左边的元素
        let minLeft = this.width
        for (const el of bounds) {
          if (el.bounds.x < minLeft) {
            minLeft = el.bounds.x
          }
        }
        recommended = {
          x: Math.max(40, minLeft - width - margin),
          y: 60
        }
        break

      case 'grid':
        // 自动计算网格位置
        recommended = this.calculateGridPosition(width, height, margin)
        break

      default:
        recommended = this.getNextPositionBelow(60, height, margin)
    }

    // 确保位置在画布范围内
    recommended.x = Math.max(0, Math.min(recommended.x, this.width - width))
    recommended.y = Math.max(0, Math.min(recommended.y, this.height - height))

    return recommended
  }

  /**
   * 计算自动网格位置
   */
  calculateGridPosition(width, height, gap = 20) {
    const margin = 40
    const availableWidth = this.width - 2 * margin
    const columns = Math.floor((availableWidth + gap) / (width + gap))

    if (columns <= 0) {
      return this.getNextPositionBelow(60, height, gap)
    }

    // 找到最后一个元素
    const bounds = this.getAllElementBounds()
    let maxBottom = 60

    for (const el of bounds) {
      if (el.bounds.bottom > maxBottom) {
        maxBottom = el.bounds.bottom
      }
    }

    // 找到当前行的最后一个元素
    let rowMaxRight = margin
    for (const el of bounds) {
      if (Math.abs(el.bounds.y - maxBottom) < height) {
        if (el.bounds.right > rowMaxRight) {
          rowMaxRight = el.bounds.right
        }
      }
    }

    // 计算新位置
    let x = rowMaxRight + gap
    let y = maxBottom - height

    // 如果超出边界，换行
    if (x + width > this.width - margin) {
      x = margin
      y = maxBottom + gap
    }

    return { x, y }
  }

  /**
   * 检测布局问题并提供建议
   */
  detectLayoutIssues() {
    const bounds = this.getAllElementBounds()
    const issues = []

    // 检查超出边界
    for (const el of bounds) {
      if (el.bounds.x < 0 || el.bounds.y < 0) {
        issues.push({
          type: 'out_of_bounds',
          elementId: el.id,
          message: `元素 ${el.id} 超出画布边界`,
          suggestion: '调整位置到画布范围内'
        })
      }

      if (el.bounds.right > this.width || el.bounds.bottom > this.height) {
        issues.push({
          type: 'out_of_bounds',
          elementId: el.id,
          message: `元素 ${el.id} 超出画布边界`,
          suggestion: '调整位置到画布范围内'
        })
      }
    }

    // 检查重叠
    for (let i = 0; i < bounds.length; i++) {
      for (let j = i + 1; j < bounds.length; j++) {
        if (this.isOverlapping(bounds[i].bounds, bounds[j].bounds)) {
          issues.push({
            type: 'overlap',
            elementId1: bounds[i].id,
            elementId2: bounds[j].id,
            message: `元素 ${bounds[i].id} 和 ${bounds[j].id} 存在重叠`,
            suggestion: '调整其中一个元素的位置'
          })
        }
      }
    }

    // 检查间距过小
    for (const el1 of bounds) {
      for (const el2 of bounds) {
        if (el1.id === el2.id) continue

        const distance = Math.min(
          Math.abs(el1.bounds.right - el2.bounds.x),
          Math.abs(el2.bounds.right - el1.bounds.x),
          Math.abs(el1.bounds.bottom - el2.bounds.y),
          Math.abs(el2.bounds.bottom - el1.bounds.y)
        )

        if (distance > 0 && distance < 5) {
          issues.push({
            type: 'too_close',
            elementId1: el1.id,
            elementId2: el2.id,
            message: `元素 ${el1.id} 和 ${el2.id} 间距过小 (${distance}px)`,
            suggestion: '建议增加间距到至少 20px'
          })
        }
      }
    }

    return {
      hasIssues: issues.length > 0,
      issues,
      summary: issues.length === 0
        ? '布局良好，无明显问题'
        : `发现 ${issues.length} 个布局问题`
    }
  }

  /**
   * 生成布局报告
   */
  generateLayoutReport() {
    const bounds = this.getAllElementBounds()
    const issues = this.detectLayoutIssues()

    // 计算使用率
    let usedArea = 0
    for (const el of bounds) {
      usedArea += el.bounds.width * el.bounds.height
    }
    const canvasArea = this.width * this.height
    const usagePercent = ((usedArea / canvasArea) * 100).toFixed(2)

    return {
      canvas: {
        width: this.width,
        height: this.height,
        area: canvasArea
      },
      elements: {
        count: bounds.length,
        totalArea: usedArea,
        usagePercent
      },
      bounds,
      issues,
      recommendations: this.generateRecommendations(bounds, issues)
    }
  }

  /**
   * 生成布局建议
   */
  generateRecommendations(bounds, issues) {
    const recommendations = []

    if (bounds.length === 0) {
      recommendations.push('画布为空，建议添加背景和主要元素')
      return recommendations
    }

    // 分析当前布局
    const xPositions = bounds.map(b => b.bounds.x)
    const yPositions = bounds.map(b => b.bounds.y)

    const minX = Math.min(...xPositions)
    const maxX = Math.max(...bounds.map(b => b.bounds.right))
    const minY = Math.min(...yPositions)
    const maxY = Math.max(...bounds.map(b => b.bounds.bottom))

    // 检查是否对齐
    if (bounds.length > 1) {
      const xValues = [...new Set(xPositions.map(x => Math.round(x / 10) * 10))]
      const yValues = [...new Set(yPositions.map(y => Math.round(y / 10) * 10))]

      if (xValues.length > 3) {
        recommendations.push('水平对齐较乱，建议使用网格布局')
      }
      if (yValues.length > 3) {
        recommendations.push('垂直对齐较乱，建议使用统一的间距')
      }
    }

    // 检查边距
    if (minX < 20) {
      recommendations.push('左侧边距过小，建议保持至少 40px')
    }
    if (maxX > this.width - 20) {
      recommendations.push('右侧边距过小，建议保持至少 40px')
    }
    if (minY < 40) {
      recommendations.push('顶部边距过小，建议保持至少 60px')
    }
    if (maxY > this.height - 20) {
      recommendations.push('底部边距过小，建议保持至少 40px')
    }

    // 问题建议
    for (const issue of issues.issues) {
      if (issue.suggestion) {
        recommendations.push(issue.suggestion)
      }
    }

    return recommendations
  }

  /**
   * 清除布局记录
   */
  clear() {
    this.elements = []
  }
}

module.exports = LayoutManager
