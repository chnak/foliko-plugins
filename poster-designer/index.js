/**
 * Poster Designer Plugin - 基于 Paper.js 的海报/Banner 设计插件
 * 支持绘制形状、文本、图片、渐变等元素
 */
const { z } = require('zod');
const paper = require('paper');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

// 获取插件目录下的 fonts 文件夹路径
const pluginFontsDir = path.join(__dirname, 'fonts');

// 已注册的字体
const registeredFonts = new Map();

// 注册字体函数
function registerFontFile(fontPath, fontFamily, options = {}) {
  if (registeredFonts.has(fontFamily)) {
    return true;
  }

  try {
    if (!fs.existsSync(fontPath)) {
      return false;
    }

    registerFont(fontPath, {
      family: fontFamily,
      weight: options.weight || 'normal',
      style: options.style || 'normal',
    });

    registeredFonts.set(fontFamily, {
      path: fontPath,
      ...options,
    });

    return true;
  } catch (e) {
    console.log(`[poster-designer] 注册字体失败: ${fontFamily}`, e.message);
    return false;
  }
}

// 本地字体配置
const localFonts = [
  {
    path: path.join(pluginFontsDir, '微软雅黑.ttf'),
    family: 'Microsoft YaHei',
    aliases: ['Microsoft YaHei', 'microsoftyahei', '微软雅黑'],
    default: true  // 标记为默认字体
  },
  {
    path: path.join(pluginFontsDir, '微软雅黑粗体.ttf'),
    family: 'Microsoft YaHei Bold',
    weight: 'bold',
    aliases: ['Microsoft YaHei Bold', 'microsoftyahei Bold', '微软雅黑粗体', 'MicrosoftYaHei-Bold']
  },
  {
    path: path.join(pluginFontsDir, 'PatuaOne-Regular.ttf'),
    family: 'Patua One',
    aliases: ['PatuaOne', 'patuaone', 'Patua One']
  },
];

// 注册本地字体
let defaultFontFamily = 'Arial';
for (const font of localFonts) {
  if (registerFontFile(font.path, font.family, { weight: font.weight })) {
    // 注册别名
    if (font.aliases) {
      for (const alias of font.aliases) {
        try {
          registerFont(alias, { family: alias, weight: font.weight || 'normal' });
          registeredFonts.set(alias, { path: font.path, weight: font.weight });
        } catch (e) {
          // 忽略别名注册失败
        }
      }
    }
    // 如果标记为默认字体，设置默认字体
    if (font.default) {
      defaultFontFamily = font.family;
    }
    console.log(`[poster-designer] 已注册本地字体: ${font.family}`);
  }
}

// 如果没有本地字体，尝试系统字体
if (defaultFontFamily === 'Arial') {
  for (const font of systemFonts) {
    if (fs.existsSync(font.path)) {
      if (registerFontFamily(font.path, font.family)) {
        defaultFontFamily = font.family;
        console.log(`[poster-designer] 已注册系统字体: ${font.family}`);
        break;
      }
    }
  }
}

module.exports = function (Plugin) {
  return class PosterDesignerPlugin extends Plugin {
    constructor(config = {}) {
      super();
      this.name = 'poster-designer';
      this.version = '1.0.0';
      this.description = '海报/Banner 设计插件 - 基于 Paper.js 实现矢量绘图';
      this.priority = 10;

      // 存储画布实例
      this.canvases = new Map();
    }

    // 验证字体是否可用，无效时返回默认字体
    _validateFont(fontFamily) {
      if (!fontFamily) return defaultFontFamily;
      if (registeredFonts.has(fontFamily)) return fontFamily;
      // 检查别名（不区分大小写）
      const lower = fontFamily.toLowerCase();
      for (const [name, info] of registeredFonts) {
        if (name.toLowerCase() === lower) return name;
      }
      console.log(`[poster-designer] 字体 "${fontFamily}" 未注册，使用默认字体: ${defaultFontFamily}`);
      return defaultFontFamily;
    }

    tools = {
      // 创建画布
      create_canvas: {
        description: '创建新的海报画布',
        inputSchema: z.object({
          width: z.number().describe('画布宽度(px)').default(800),
          height: z.number().describe('画布高度(px)').default(600),
          name: z.string().describe('画布标识名称').default('default'),
          background: z.string().describe('背景颜色，支持 hex/rgb/rgba').default('#ffffff'),
        }),
        execute: async (args) => {
          const { width, height, name, background } = args;

          // 创建 canvas 并使用 paper.setup 初始化
          this.canvas = paper.createCanvas(width, height);
          paper.setup(this.canvas);

          // 创建背景
          const bg = new paper.Path.Rectangle({
            point: [0, 0],
            size: [width, height],
            fillColor: background
          });
          bg.sendToBack();

          // 存储画布信息
          this.canvases.set(name, {
            canvas: this.canvas,
            paper,
            width,
            height,
            items: []
          });

          return {
            success: true,
            message: `画布 "${name}" 创建成功 (${width}x${height})`,
            name,
            width,
            height
          };
        },
      },

      // 绘制矩形
      draw_rectangle: {
        description: '在画布上绘制矩形',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('宽度'),
          height: z.number().describe('高度'),
          fill: z.string().describe('填充颜色').optional(),
          stroke: z.string().describe('边框颜色').optional(),
          strokeWidth: z.number().describe('边框宽度').optional(),
          radius: z.number().describe('圆角半径').optional(),
          opacity: z.number().describe('透明度 0-1').optional(),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const { x, y, width, height, fill, stroke, strokeWidth, radius, opacity } = args;
          
          let rect;
          if (radius && radius > 0) {
            rect = new paper.Path.Rectangle({
              point: [x, y],
              size: [width, height],
              radius: radius
            });
          } else {
            rect = new paper.Path.Rectangle({
              point: [x, y],
              size: [width, height]
            });
          }
          
          if (fill) rect.fillColor = fill;
          if (stroke) {
            rect.strokeColor = stroke;
            rect.strokeWidth = strokeWidth || 1;
          }
          if (opacity !== undefined) rect.opacity = opacity;
          
          ctx.items.push(rect);
          
          return {
            success: true,
            message: `矩形绘制成功`,
            id: rect.id
          };
        },
      },

      // 绘制圆形
      draw_circle: {
        description: '在画布上绘制圆形或椭圆',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          centerX: z.number().describe('圆心X坐标'),
          centerY: z.number().describe('圆心Y坐标'),
          radius: z.number().describe('半径'),
          fill: z.string().describe('填充颜色').optional(),
          stroke: z.string().describe('边框颜色').optional(),
          strokeWidth: z.number().describe('边框宽度').optional(),
          opacity: z.number().describe('透明度 0-1').optional(),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const { centerX, centerY, radius, fill, stroke, strokeWidth, opacity } = args;
          
          const circle = new paper.Path.Circle({
            center: [centerX, centerY],
            radius: radius
          });
          
          if (fill) circle.fillColor = fill;
          if (stroke) {
            circle.strokeColor = stroke;
            circle.strokeWidth = strokeWidth || 1;
          }
          if (opacity !== undefined) circle.opacity = opacity;
          
          ctx.items.push(circle);
          
          return {
            success: true,
            message: `圆形绘制成功`,
            id: circle.id
          };
        },
      },

      // 绘制椭圆
      draw_ellipse: {
        description: '在画布上绘制椭圆',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('宽度'),
          height: z.number().describe('高度'),
          fill: z.string().describe('填充颜色').optional(),
          stroke: z.string().describe('边框颜色').optional(),
          strokeWidth: z.number().describe('边框宽度').optional(),
          opacity: z.number().describe('透明度 0-1').optional(),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const { x, y, width, height, fill, stroke, strokeWidth, opacity } = args;
          
          const ellipse = new paper.Path.Ellipse({
            point: [x, y],
            size: [width, height]
          });
          
          if (fill) ellipse.fillColor = fill;
          if (stroke) {
            ellipse.strokeColor = stroke;
            ellipse.strokeWidth = strokeWidth || 1;
          }
          if (opacity !== undefined) ellipse.opacity = opacity;
          
          ctx.items.push(ellipse);
          
          return {
            success: true,
            message: `椭圆绘制成功`,
            id: ellipse.id
          };
        },
      },

      // 绘制线条
      draw_line: {
        description: '在画布上绘制线条',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          x1: z.number().describe('起点X坐标'),
          y1: z.number().describe('起点Y坐标'),
          x2: z.number().describe('终点X坐标'),
          y2: z.number().describe('终点Y坐标'),
          stroke: z.string().describe('线条颜色').default('#000000'),
          strokeWidth: z.number().describe('线条宽度').default(1),
          dashArray: z.array(z.number()).describe('虚线数组').optional(),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const { x1, y1, x2, y2, stroke, strokeWidth, dashArray } = args;
          
          const line = new paper.Path.Line({
            from: [x1, y1],
            to: [x2, y2]
          });
          
          line.strokeColor = stroke;
          line.strokeWidth = strokeWidth;
          if (dashArray) line.dashArray = dashArray;
          
          ctx.items.push(line);
          
          return {
            success: true,
            message: `线条绘制成功`,
            id: line.id
          };
        },
      },

      // 绘制多边形
      draw_polygon: {
        description: '在画布上绘制多边形',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          centerX: z.number().describe('中心X坐标'),
          centerY: z.number().describe('中心Y坐标'),
          radius: z.number().describe('外接圆半径'),
          sides: z.number().describe('边数，最小3'),
          fill: z.string().describe('填充颜色').optional(),
          stroke: z.string().describe('边框颜色').optional(),
          strokeWidth: z.number().describe('边框宽度').optional(),
          rotation: z.number().describe('旋转角度').optional(),
          opacity: z.number().describe('透明度 0-1').optional(),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const { centerX, centerY, radius, sides, fill, stroke, strokeWidth, rotation, opacity } = args;
          
          const polygon = new paper.Path.RegularPolygon({
            center: [centerX, centerY],
            sides: Math.max(3, sides),
            radius: radius
          });
          
          if (rotation) polygon.rotate(rotation);
          if (fill) polygon.fillColor = fill;
          if (stroke) {
            polygon.strokeColor = stroke;
            polygon.strokeWidth = strokeWidth || 1;
          }
          if (opacity !== undefined) polygon.opacity = opacity;
          
          ctx.items.push(polygon);
          
          return {
            success: true,
            message: `${sides}边形绘制成功`,
            id: polygon.id
          };
        },
      },

      // 添加文本
      add_text: {
        description: '在画布上添加文本',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          text: z.string().describe('文本内容'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标（基线位置）'),
          fontSize: z.number().describe('字体大小').default(24),
          fontFamily: z.string().describe('字体名称').default(defaultFontFamily),
          fill: z.string().describe('文字颜色').default('#000000'),
          align: z.enum(['left', 'center', 'right']).describe('对齐方式').default('left'),
          bold: z.boolean().describe('是否加粗').default(false),
          italic: z.boolean().describe('是否斜体').default(false),
          opacity: z.number().describe('透明度 0-1').optional(),
          autoAdjust: z.boolean().describe('当位置被占用时自动调整').default(true),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }

          let { text, x, y, fontSize, fontFamily, fill, align, bold, italic, opacity, autoAdjust } = args;

          // 应用默认值（当直接调用 execute 时需要）
          autoAdjust = autoAdjust !== undefined ? autoAdjust : true;

          // 获取所有现有文本项用于碰撞检测
          const getTextItems = () => paper.project.activeLayer.children.filter(item =>
            item instanceof paper.PointText ||
            (item instanceof paper.Group && item.children.some(c => c instanceof paper.PointText))
          );

          // 检测文本项是否与现有项重叠
          const checkOverlap = (bounds) => {
            const items = getTextItems();
            for (const item of items) {
              if (item.bounds.intersects(bounds) || item.bounds.contains(bounds)) {
                return true;
              }
            }
            return false;
          };

          // 如果启用自动调整，找到不重叠的位置
          if (autoAdjust) {
            const lineHeight = fontSize * 1.5;
            const maxAttempts = 20;
            let attempts = 0;
            const testBounds = new paper.Rectangle(x - 5, y - fontSize, 200, fontSize * 1.5);

            while (checkOverlap(testBounds) && attempts < maxAttempts) {
              y += lineHeight;
              testBounds.y = y - fontSize;
              attempts++;
            }
          }

          const textItem = new paper.PointText({
            point: [x, y],
            content: text,
            fontSize: fontSize,
            fontFamily: this._validateFont(fontFamily),
            fillColor: fill,
            justification: align
          });

          if (bold) textItem.fontWeight = 'bold';
          if (italic) textItem.fontStyle = 'italic';
          if (opacity !== undefined) textItem.opacity = opacity;

          ctx.items.push(textItem);

          return {
            success: true,
            message: `文本添加成功`,
            id: textItem.id,
            bounds: textItem.bounds,
            adjusted: autoAdjust && textItem.point.y !== args.y
          };
        },
      },

      // 添加多行文本框
      add_text_box: {
        description: '添加支持换行的文本框',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          text: z.string().describe('文本内容（支持换行）'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标（第一行基线位置）'),
          width: z.number().describe('文本框宽度'),
          fontSize: z.number().describe('字体大小').default(18),
          fontFamily: z.string().describe('字体名称').default(defaultFontFamily),
          fill: z.string().describe('文字颜色').default('#000000'),
          align: z.enum(['left', 'center', 'right']).describe('对齐方式').default('left'),
          lineHeight: z.number().describe('行高').optional(),
          bold: z.boolean().describe('是否加粗').default(false),
          opacity: z.number().describe('透明度 0-1').optional(),
          autoAdjust: z.boolean().describe('当位置被占用时自动调整').default(true),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }

          let { text, x, y, width, fontSize, fontFamily, fill, align, lineHeight, bold, opacity, autoAdjust } = args;

          // 应用默认值（当直接调用 execute 时需要）
          autoAdjust = autoAdjust !== undefined ? autoAdjust : true;

          if (!text || typeof text !== 'string') {
            return { success: false, error: 'text 参数无效或为空' };
          }

          const textBox = new paper.Group();
          const lines = text.split('\n');
          const actualLineHeight = lineHeight || Math.max(Math.round(fontSize * 1.8), 28);
          const totalHeight = lines.length * actualLineHeight;

          // 获取所有现有文本项
          const getTextItems = () => paper.project.activeLayer.children.filter(item =>
            item instanceof paper.PointText ||
            (item instanceof paper.Group && item.children.some(c => c instanceof paper.PointText))
          );

          // 检测是否重叠
          const checkOverlap = (rect) => {
            const items = getTextItems();
            for (const item of items) {
              if (item.bounds.intersects(rect) || item.bounds.contains(rect)) {
                return true;
              }
            }
            return false;
          };

          // 如果启用自动调整，找到不重叠的位置
          if (autoAdjust) {
            const maxAttempts = 20;
            let attempts = 0;
            const testRect = new paper.Rectangle(x, y - fontSize, width || 200, totalHeight);

            while (checkOverlap(testRect) && attempts < maxAttempts) {
              y += actualLineHeight;
              testRect.y = y - fontSize;
              attempts++;
            }
          }

          lines.forEach((line, index) => {
            const lineText = new paper.PointText({
              point: [x, y + index * actualLineHeight],
              content: line,
              fontSize: fontSize,
              fontFamily: this._validateFont(fontFamily),
              fillColor: fill,
              justification: align
            });

            if (bold) lineText.fontWeight = 'bold';
            if (opacity !== undefined) lineText.opacity = opacity;

            textBox.addChild(lineText);
          });

          ctx.items.push(textBox);

          return {
            success: true,
            message: `文本框添加成功`,
            id: textBox.id,
            lineCount: lines.length,
            bounds: textBox.bounds,
            adjusted: autoAdjust && textBox.bounds.y !== args.y - fontSize
          };
        },
      },

      // 自动排列文本项（检测并解决重叠）
      arrange_text_items: {
        description: '自动排列画布上的文本项，解决重叠问题',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          spacing: z.number().describe('文本项之间的最小间距(px)').default(10),
          direction: z.enum(['vertical', 'horizontal', 'grid']).describe('排列方向').default('vertical'),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }

          const { spacing, direction } = args;

          // 获取所有文本类型的项（PointText 和 Group）
          const textItems = paper.project.activeLayer.children.filter(item =>
            item instanceof paper.PointText ||
            (item instanceof paper.Group && item.children.some(c => c instanceof paper.PointText))
          );

          if (textItems.length === 0) {
            return { success: true, message: '没有找到需要排列的文本项', arranged: 0 };
          }

          // 按 y 坐标（然后 x）排序
          textItems.sort((a, b) => {
            const aY = a.bounds.y;
            const bY = b.bounds.y;
            if (Math.abs(aY - bY) < 20) {
              return a.bounds.x - b.bounds.x;
            }
            return aY - bY;
          });

          let arranged = 0;
          const canvasWidth = ctx.width;

          if (direction === 'vertical') {
            // 垂直排列：按行分组，每行从左到右
            const rows = [];
            let currentRow = [textItems[0]];
            let currentRowY = textItems[0].bounds.y;

            for (let i = 1; i < textItems.length; i++) {
              const item = textItems[i];
              // 如果与当前行高差小于一行高度，放入同一行
              if (Math.abs(item.bounds.y - currentRowY) < 30) {
                currentRow.push(item);
              } else {
                rows.push(currentRow);
                currentRow = [item];
                currentRowY = item.bounds.y;
              }
            }
            rows.push(currentRow);

            // 排列每行的元素
            for (const row of rows) {
              let x = spacing;
              for (const item of row) {
                if (item.bounds.x !== x) {
                  item.position.x = x + item.bounds.width / 2;
                  arranged++;
                }
                x += item.bounds.width + spacing;
              }
            }
          } else if (direction === 'horizontal') {
            // 水平排列：从上到下
            let y = spacing + 50; // 留出顶部空间
            for (const item of textItems) {
              item.position.y = y + item.bounds.height / 2;
              y += item.bounds.height + spacing;
              arranged++;
            }
          } else {
            // grid 排列：网格布局
            const cols = Math.ceil(Math.sqrt(textItems.length));
            const colWidth = canvasWidth / cols;
            textItems.forEach((item, i) => {
              const col = i % cols;
              const row = Math.floor(i / cols);
              item.position.x = col * colWidth + item.bounds.width / 2 + spacing;
              item.position.y = row * 50 + spacing + 50;
              arranged++;
            });
          }

          return {
            success: true,
            message: `已排列 ${arranged} 个文本项`,
            arranged,
            direction
          };
        },
      },

      // 列出可用字体
      list_fonts: {
        description: '列出所有已注册的字体',
        inputSchema: z.object({}),
        execute: async () => {
          const fonts = Array.from(registeredFonts.entries()).map(([name, info]) => ({
            name,
            path: info.path,
            weight: info.weight || 'normal',
            style: info.style || 'normal'
          }));

          return {
            success: true,
            fonts,
            defaultFont: defaultFontFamily,
            total: fonts.length
          };
        },
      },

      // 绘制渐变矩形
      draw_gradient_rect: {
        description: '绘制带渐变的矩形',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('宽度'),
          height: z.number().describe('高度'),
          colors: z.array(z.string()).describe('渐变色值数组，至少2个'),
          type: z.enum(['linear', 'radial']).describe('渐变类型').default('linear'),
          direction: z.enum(['horizontal', 'vertical', 'diagonal']).describe('渐变方向').default('vertical'),
          radius: z.number().describe('圆角半径').optional(),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const { x, y, width, height, colors, type, direction, radius } = args;
          
          // 创建渐变
          let gradient;
          if (type === 'linear') {
            let origin, destination;
            switch (direction) {
              case 'horizontal':
                origin = [x, y + height / 2];
                destination = [x + width, y + height / 2];
                break;
              case 'vertical':
                origin = [x + width / 2, y];
                destination = [x + width / 2, y + height];
                break;
              case 'diagonal':
              default:
                origin = [x, y];
                destination = [x + width, y + height];
            }
            gradient = new paper.Gradient();
            gradient.origin = new paper.Point(origin[0], origin[1]);
            gradient.destination = new paper.Point(destination[0], destination[1]);
          } else {
            gradient = new paper.Gradient();
            gradient.origin = new paper.Point(x + width / 2, y + height / 2);
            gradient.destination = new paper.Point(x + width / 2 + (radius || Math.max(width, height) / 2), y + height / 2);
            gradient.radial = true;
          }
          
          // 添加颜色停点
          gradient.stops = colors.map((color, index) => {
            const offset = colors.length > 1 ? index / (colors.length - 1) : 0;
            return new paper.GradientStop(color, offset);
          });
          
          // 创建矩形
          let rect;
          if (radius && radius > 0) {
            rect = new paper.Path.Rectangle({
              point: [x, y],
              size: [width, height],
              radius: radius
            });
          } else {
            rect = new paper.Path.Rectangle({
              point: [x, y],
              size: [width, height]
            });
          }
          
          rect.fillColor = gradient;
          
          ctx.items.push(rect);
          
          return {
            success: true,
            message: `渐变矩形绘制成功`,
            id: rect.id
          };
        },
      },

      // 绘制渐变圆形
      draw_gradient_circle: {
        description: '绘制带渐变的圆形',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          centerX: z.number().describe('圆心X坐标'),
          centerY: z.number().describe('圆心Y坐标'),
          radius: z.number().describe('半径'),
          colors: z.array(z.string()).describe('渐变色值数组'),
          type: z.enum(['radial']).describe('渐变类型').default('radial'),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const { centerX, centerY, radius, colors } = args;
          
          // 创建径向渐变
          const gradient = new paper.Gradient();
          gradient.origin = new paper.Point(centerX, centerY);
          gradient.destination = new paper.Point(centerX + radius, centerY);
          gradient.radial = true;
          
          gradient.stops = colors.map((color, index) => {
            const offset = colors.length > 1 ? index / (colors.length - 1) : 0;
            return new paper.GradientStop(color, offset);
          });
          
          const circle = new paper.Path.Circle({
            center: [centerX, centerY],
            radius: radius
          });
          
          circle.fillColor = gradient;
          
          ctx.items.push(circle);
          
          return {
            success: true,
            message: `渐变圆形绘制成功`,
            id: circle.id
          };
        },
      },

      // 加载图片
      load_image: {
        description: '加载本地图片到画布',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          path: z.string().describe('本地图片文件路径（支持绝对路径和相对路径）'),
          x: z.number().describe('X坐标'),
          y: z.number().describe('Y坐标'),
          width: z.number().describe('显示宽度').optional(),
          height: z.number().describe('显示高度').optional(),
          opacity: z.number().describe('透明度 0-1').optional(),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }

          const { path: filePath, x, y, width, height, opacity } = args;

          try {
            const fs = require('fs');
            const path = require('path');

            // 转换为绝对路径
            let absolutePath = filePath;
            if (!path.isAbsolute(absolutePath)) {
              absolutePath = path.join(process.cwd(), absolutePath);
            }

            // 检查文件是否存在
            if (!fs.existsSync(absolutePath)) {
              return { success: false, error: `文件不存在: ${absolutePath}` };
            }

            // 读取文件并转为 Base64
            const buffer = fs.readFileSync(absolutePath);
            const ext = path.extname(absolutePath).toLowerCase();
            const mimeTypes = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.webp': 'image/webp',
              '.bmp': 'image/bmp'
            };
            const mimeType = mimeTypes[ext] || 'image/png';
            const imageUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

            const raster = new paper.Raster(imageUrl);

            raster.onLoad = () => {
              if (width && height) {
                raster.bounds = new paper.Rectangle(x, y, width, height);
              } else if (width) {
                const scale = width / raster.width;
                raster.bounds = new paper.Rectangle(x, y, width, raster.height * scale);
              } else if (height) {
                const scale = height / raster.height;
                raster.bounds = new paper.Rectangle(x, y, raster.width * scale, height);
              } else {
                raster.position = new paper.Point(x, y);
              }

              if (opacity !== undefined) raster.opacity = opacity;
            };

            ctx.items.push(raster);

            return {
              success: true,
              message: `图片加载成功`,
              id: raster.id,
              originalWidth: raster.width,
              originalHeight: raster.height
            };
          } catch (error) {
            return {
              success: false,
              error: `图片加载失败: ${error.message}`
            };
          }
        },
      },

      // 添加阴影
      add_shadow: {
        description: '为图形添加阴影效果',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          itemId: z.number().describe('图形ID'),
          color: z.string().describe('阴影颜色').default('rgba(0,0,0,0.3)'),
          offset: z.array(z.number()).describe('阴影偏移 [x, y]').default([5, 5]),
          blur: z.number().describe('模糊半径').default(10),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const item = paper.project.activeLayer.children.find(c => c.id === args.itemId);
          if (!item) {
            return { success: false, error: `找不到ID为 ${args.itemId} 的图形` };
          }
          
          item.shadowColor = new paper.Color(args.color);
          item.shadowOffset = new paper.Point(args.offset[0], args.offset[1]);
          item.shadowBlur = args.blur;
          
          return {
            success: true,
            message: `阴影添加成功`
          };
        },
      },

      // 组合元素
      group_items: {
        description: '将多个图形组合在一起',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          itemIds: z.array(z.number()).describe('要组合的图形ID数组'),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const items = args.itemIds
            .map(id => paper.project.activeLayer.children.find(c => c.id === id))
            .filter(Boolean);
          
          if (items.length < 2) {
            return { success: false, error: '至少需要2个图形才能组合' };
          }
          
          const group = new paper.Group(items);
          ctx.items.push(group);
          
          return {
            success: true,
            message: `成功组合 ${items.length} 个图形`,
            id: group.id
          };
        },
      },

      // 取消组合
      ungroup_items: {
        description: '取消图形组合',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          groupId: z.number().describe('组合的ID'),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const group = paper.project.activeLayer.children.find(c => c.id === args.groupId);
          if (!group || !(group instanceof paper.Group)) {
            return { success: false, error: `找不到ID为 ${args.groupId} 的组合` };
          }
          
          group.ungroup();
          
          return {
            success: true,
            message: '组合已取消'
          };
        },
      },

      // 旋转元素
      rotate_item: {
        description: '旋转图形',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          itemId: z.number().describe('图形ID'),
          angle: z.number().describe('旋转角度（度）'),
          centerX: z.number().describe('旋转中心X').optional(),
          centerY: z.number().describe('旋转中心Y').optional(),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const item = paper.project.activeLayer.children.find(c => c.id === args.itemId);
          if (!item) {
            return { success: false, error: `找不到ID为 ${args.itemId} 的图形` };
          }
          
          if (args.centerX !== undefined && args.centerY !== undefined) {
            item.rotate(args.angle, new paper.Point(args.centerX, args.centerY));
          } else {
            item.rotate(args.angle);
          }
          
          return {
            success: true,
            message: `图形旋转 ${args.angle} 度`
          };
        },
      },

      // 缩放元素
      scale_item: {
        description: '缩放图形',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          itemId: z.number().describe('图形ID'),
          scaleX: z.number().describe('X轴缩放比例'),
          scaleY: z.number().describe('Y轴缩放比例'),
          centerX: z.number().describe('缩放中心X').optional(),
          centerY: z.number().describe('缩放中心Y').optional(),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const item = paper.project.activeLayer.children.find(c => c.id === args.itemId);
          if (!item) {
            return { success: false, error: `找不到ID为 ${args.itemId} 的图形` };
          }
          
          if (args.centerX !== undefined && args.centerY !== undefined) {
            item.scale(args.scaleX, args.scaleY, new paper.Point(args.centerX, args.centerY));
          } else {
            item.scale(args.scaleX, args.scaleY);
          }
          
          return {
            success: true,
            message: `图形缩放成功`
          };
        },
      },

      // 移动元素层级
      bring_to_front: {
        description: '将图形移到最前面',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          itemId: z.number().describe('图形ID'),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const item = paper.project.activeLayer.children.find(c => c.id === args.itemId);
          if (!item) {
            return { success: false, error: `找不到ID为 ${args.itemId} 的图形` };
          }
          
          item.bringToFront();
          
          return { success: true, message: '图形已移到最前面' };
        },
      },

      send_to_back: {
        description: '将图形移到最后面',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          itemId: z.number().describe('图形ID'),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const item = paper.project.activeLayer.children.find(c => c.id === args.itemId);
          if (!item) {
            return { success: false, error: `找不到ID为 ${args.itemId} 的图形` };
          }
          
          item.sendToBack();
          
          return { success: true, message: '图形已移到最后面' };
        },
      },

      // 复制元素
      clone_item: {
        description: '复制图形',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          itemId: z.number().describe('要复制的图形ID'),
          offsetX: z.number().describe('X轴偏移').default(10),
          offsetY: z.number().describe('Y轴偏移').default(10),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const item = paper.project.activeLayer.children.find(c => c.id === args.itemId);
          if (!item) {
            return { success: false, error: `找不到ID为 ${args.itemId} 的图形` };
          }
          
          const clone = item.clone();
          clone.position.x += args.offsetX;
          clone.position.y += args.offsetY;
          ctx.items.push(clone);
          
          return {
            success: true,
            message: '图形复制成功',
            id: clone.id
          };
        },
      },

      // 删除元素
      delete_item: {
        description: '删除图形',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          itemId: z.number().describe('图形ID'),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const item = paper.project.activeLayer.children.find(c => c.id === args.itemId);
          if (!item) {
            return { success: false, error: `找不到ID为 ${args.itemId} 的图形` };
          }
          
          item.remove();
          
          return { success: true, message: '图形已删除' };
        },
      },

      // 导出画布
      export_canvas: {
        description: '导出画布为图片文件',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          format: z.enum(['png', 'jpg', 'svg']).describe('导出格式').default('png'),
          filename: z.string().describe('文件名（不含扩展名）').optional(),
          directory: z.string().describe('保存目录').default('./'),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }

          const { format, filename, directory } = args;

          try {
            // 确保内容已渲染到画布
            paper.view.update();
            paper.view.draw();

            const fullFilename = `${filename || `canvas-${args.canvas}-${Date.now()}`}.${format}`;
            const fullPath = path.resolve(directory || './', fullFilename);

            if (format === 'svg') {
              const svg = paper.project.exportSVG({ asString: true });
              fs.writeFileSync(fullPath, svg, 'utf8');
            } else {
              const stream = format === 'png'
                ? ctx.canvas.pngStream()
                : ctx.canvas.jpegStream({ quality: 0.9 });

              const chunks = await new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(chunks));
                stream.on('error', reject);
              });

              const buffer = Buffer.concat(chunks);
              fs.writeFileSync(fullPath, buffer);
            }

            return {
              success: true,
              message: `画布已保存: ${fullPath}`,
              path: fullPath,
              width: ctx.width,
              height: ctx.height
            };
          } catch (error) {
            return { success: false, error: `导出失败: ${error.message}` };
          }
        },
      },

      // 保存画布到文件
      save_canvas_to_file: {
        description: '保存画布到本地文件',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
          filename: z.string().describe('文件名（不含扩展名）'),
          format: z.enum(['png', 'jpg', 'svg']).describe('导出格式').default('png'),
          directory: z.string().describe('保存目录').default('./'),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }

          const { format, filename, directory } = args;
          const fullFilename = `${filename}.${format}`;

          // 使用 Node.js 保存文件
          const fs = require('fs');
          const path = require('path');
          const fullPath = path.join(directory, fullFilename);

          try {
            // 确保内容已渲染到画布
            paper.view.update();
            paper.view.draw();

            if (format === 'svg') {
              // SVG 导出
              const svg = paper.project.exportSVG({ asString: true });
              fs.writeFileSync(fullPath, svg, 'utf8');
            } else {
              // PNG/JPG 使用流式导出
              const stream = format === 'png'
                ? ctx.canvas.pngStream()
                : ctx.canvas.jpegStream({ quality: 0.9 });

              const chunks = [];

              await new Promise((resolve, reject) => {
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', resolve);
                stream.on('error', reject);
              });

              const buffer = Buffer.concat(chunks);
              fs.writeFileSync(fullPath, buffer);
            }

            return {
              success: true,
              message: `文件保存成功: ${fullPath}`,
              path: fullPath
            };
          } catch (error) {
            return { success: false, error: `保存失败: ${error.message}` };
          }
        },
      },

      // 列出画布元素
      list_canvas_items: {
        description: '列出画布上的所有元素',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          const items = paper.project.activeLayer.children
            .filter(item => item.className !== 'Path' || item.fillColor !== '#ffffff')
            .map(item => ({
              id: item.id,
              type: item.className,
              name: item.name || item.className,
              position: { x: item.position.x, y: item.position.y },
              bounds: {
                x: item.bounds.x,
                y: item.bounds.y,
                width: item.bounds.width,
                height: item.bounds.height
              }
            }));
          
          return {
            success: true,
            items: items,
            count: items.length
          };
        },
      },

      // 删除画布
      delete_canvas: {
        description: '删除画布并释放资源',
        inputSchema: z.object({
          canvas: z.string().describe('画布名称').default('default'),
        }),
        execute: async (args) => {
          const ctx = this.canvases.get(args.canvas);
          if (!ctx) {
            return { success: false, error: `画布 "${args.canvas}" 不存在` };
          }
          
          // 清理 canvas
          if (ctx.canvas && ctx.canvas.parentNode) {
            ctx.canvas.parentNode.removeChild(ctx.canvas);
          }
          
          // 清空 Paper.js 项目
          paper.project.clear();
          
          this.canvases.delete(args.canvas);
          
          return {
            success: true,
            message: `画布 "${args.canvas}" 已删除`
          };
        },
      },

      // 创建模板海报
      create_template: {
        description: '创建预设的精美海报模板',
        inputSchema: z.object({
          name: z.string().describe('画布标识名称').default('default'),
          template: z.enum([
            'gradient-banner',    // 渐变 banner
            'minimal-card',       // 简约卡片
            'gradient-circle',   // 渐变圆形背景
            'split-diagonal',    // 对角分割
            'mesh-gradient',     // 网格渐变
            'neon-glow',         // 霓虹发光
            'soft-blur',         // 柔和模糊背景
            'geometric-pattern'  // 几何图案
          ]).describe('模板类型'),
          width: z.number().describe('画布宽度(px)').default(800),
          height: z.number().describe('画布高度(px)').default(600),
        }),
        execute: async (args) => {
          const { name, template, width, height } = args;

          // 创建 canvas
          this.canvas = paper.createCanvas(width, height);
          paper.setup(this.canvas);

          // 存储画布信息
          this.canvases.set(name, {
            canvas: this.canvas,
            paper,
            width,
            height,
            items: []
          });

          let templateName = '';
          let bgColor = '#ffffff';

          try {
            switch (template) {
              case 'gradient-banner':
                templateName = '渐变 Banner';
                this.createGradientBanner(width, height);
                break;

              case 'minimal-card':
                templateName = '简约卡片';
                this.createMinimalCard(width, height);
                break;

              case 'gradient-circle':
                templateName = '渐变圆形背景';
                this.createGradientCircle(width, height);
                break;

              case 'split-diagonal':
                templateName = '对角分割';
                this.createSplitDiagonal(width, height);
                break;

              case 'mesh-gradient':
                templateName = '网格渐变';
                this.createMeshGradient(width, height);
                break;

              case 'neon-glow':
                templateName = '霓虹发光';
                this.createNeonGlow(width, height);
                break;

              case 'soft-blur':
                templateName = '柔和模糊背景';
                this.createSoftBlur(width, height);
                break;

              case 'geometric-pattern':
                templateName = '几何图案';
                this.createGeometricPattern(width, height);
                break;

              default:
                this.createGradientBanner(width, height);
            }

            paper.view.update();

            return {
              success: true,
              message: `模板 "${templateName}" 创建成功 (${width}x${height})`,
              name,
              template: templateName,
              width,
              height
            };
          } catch (error) {
            return { success: false, error: `创建模板失败: ${error.message}` };
          }
        },
      },

      // ========== 布局系统 ==========
      create_layout: {
        description: '创建布局容器',
        inputSchema: z.object({
          name: z.string().describe('布局名称'),
          width: z.number().describe('布局宽度'),
          height: z.number().describe('布局高度'),
          gridCols: z.number().describe('网格列数').default(12),
          gridGap: z.number().describe('网格间距').default(10),
          background: z.string().describe('背景颜色').default('#ffffff'),
          padding: z.number().describe('内边距').default(20),
        }),
        execute: async (args) => this.create_layout(args),
      },
      add_element: {
        description: '添加元素到布局（支持约束定位和网格定位）',
        inputSchema: z.object({
          layout: z.string().describe('布局名称'),
          type: z.enum(['text', 'image', 'rect', 'circle', 'line']).describe('元素类型'),
          content: z.string().describe('文本内容或图片路径').optional(),
          gridPosition: z.object({
            col: z.number().describe('起始列 (1-based)').default(1),
            row: z.number().describe('起始行').default(1),
            colSpan: z.number().describe('跨列数').default(12),
            rowSpan: z.number().describe('跨行数').default(1),
          }).optional(),
          constraint: z.object({
            x: z.union([z.number(), z.string()]).describe('X坐标或百分比').optional(),
            y: z.union([z.number(), z.string()]).describe('Y坐标或百分比').optional(),
            centerX: z.boolean().describe('水平居中').default(false),
            centerY: z.boolean().describe('垂直居中').default(false),
            width: z.union([z.number(), z.string()]).describe('宽度或百分比').optional(),
            height: z.union([z.number(), z.string()]).describe('高度或百分比').optional(),
            right: z.union([z.number(), z.string()]).describe('距右侧').optional(),
            bottom: z.union([z.number(), z.string()]).describe('距底部').optional(),
          }).optional(),
          style: z.object({
            fontSize: z.number().describe('字体大小').optional(),
            fontFamily: z.string().describe('字体').optional(),
            color: z.string().describe('颜色').default('#000000'),
            backgroundColor: z.string().describe('背景色').optional(),
            opacity: z.number().describe('透明度').optional(),
            align: z.enum(['left', 'center', 'right']).describe('对齐').default('center'),
            lineHeight: z.number().describe('行高').optional(),
            bold: z.boolean().describe('加粗').default(false),
            borderRadius: z.number().describe('圆角').optional(),
          }).optional(),
          zone: z.enum(['header', 'main', 'footer', 'custom']).describe('布局区域').optional(),
        }),
        execute: async (args) => this.add_element(args),
      },
      get_layout: {
        description: '获取布局信息',
        inputSchema: z.object({ name: z.string().describe('布局名称') }),
        execute: async (args) => this.get_layout(args),
      },
      list_layouts: {
        description: '列出所有布局',
        inputSchema: z.object({}),
        execute: async (args) => this.list_layouts(args),
      },
      delete_layout: {
        description: '删除布局',
        inputSchema: z.object({ name: z.string().describe('布局名称') }),
        execute: async (args) => this.delete_layout(args),
      },
      render_layout: {
        description: '渲染布局并保存到文件',
        inputSchema: z.object({
          name: z.string().describe('布局名称'),
          format: z.enum(['png', 'jpg']).describe('格式').default('png'),
          filename: z.string().describe('文件名（不含扩展名）').optional(),
          directory: z.string().describe('保存目录').default('./'),
        }),
        execute: async (args) => this.render_layout(args),
      },
    };

    // ========== 模板生成函数 ==========

    // 渐变 Banner
    createGradientBanner(width, height) {
      const gradient = new paper.Gradient();
      gradient.origin = new paper.Point(0, 0);
      gradient.destination = new paper.Point(width, height);
      gradient.stops = [
        new paper.GradientStop('#667eea', 0),
        new paper.GradientStop('#764ba2', 0.5),
        new paper.GradientStop('#f093fb', 1)
      ];

      const bg = new paper.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: gradient
      });
      bg.sendToBack();
    }

    // 简约卡片
    createMinimalCard(width, height) {
      // 白色背景
      const bg = new paper.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: '#f8f9fa'
      });
      bg.sendToBack();

      // 顶部装饰线
      const line = new paper.Path.Rectangle({
        point: [0, 0],
        size: [width, 8],
        fillColor: '#343a40'
      });

      // 中央圆形装饰
      const circle = new paper.Path.Circle({
        center: [width / 2, height / 2],
        radius: Math.min(width, height) * 0.3
      });
      circle.fillColor = '#e9ecef';

      // 内圆
      const innerCircle = new paper.Path.Circle({
        center: [width / 2, height / 2],
        radius: Math.min(width, height) * 0.25
      });
      innerCircle.fillColor = '#ffffff';
    }

    // 渐变圆形背景
    createGradientCircle(width, height) {
      // 深色背景
      const bg = new paper.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: '#1a1a2e'
      });
      bg.sendToBack();

      // 大渐变圆
      const gradient = new paper.Gradient();
      gradient.origin = new paper.Point(width * 0.3, height * 0.3);
      gradient.destination = new paper.Point(width * 0.7, height * 0.7);
      gradient.stops = [
        new paper.GradientStop('#ff6b6b', 0),
        new paper.GradientStop('#4ecdc4', 0.5),
        new paper.GradientStop('#45b7d1', 1)
      ];

      const circle = new paper.Path.Circle({
        center: [width / 2, height / 2],
        radius: Math.min(width, height) * 0.45
      });
      circle.fillColor = gradient;

      // 光晕效果
      const glow = new paper.Path.Circle({
        center: [width * 0.4, height * 0.4],
        radius: Math.min(width, height) * 0.2
      });
      glow.fillColor = '#ffffff';
      glow.opacity = 0.1;
    }

    // 对角分割
    createSplitDiagonal(width, height) {
      // 左上 - 紫蓝渐变
      const gradient1 = new paper.Gradient();
      gradient1.origin = new paper.Point(0, 0);
      gradient1.destination = new paper.Point(width, height);
      gradient1.stops = [
        new paper.GradientStop('#8E2DE2', 0),
        new paper.GradientStop('#4A00E0', 1)
      ];

      const bg1 = new paper.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: gradient1
      });
      bg1.sendToBack();

      // 右下三角形叠加
      const triangle = new paper.Path.RegularPolygon({
        center: [width, height],
        sides: 3,
        radius: Math.sqrt(width * width + height * height) * 0.7,
        rotation: 180
      });
      triangle.fillColor = '#00C9FF';

      // 装饰圆
      const circle1 = new paper.Path.Circle({
        center: [width * 0.8, height * 0.3],
        radius: 40
      });
      circle1.fillColor = '#ffffff';
      circle1.opacity = 0.2;

      const circle2 = new paper.Path.Circle({
        center: [width * 0.2, height * 0.7],
        radius: 60
      });
      circle2.fillColor = '#ffffff';
      circle2.opacity = 0.1;
    }

    // 网格渐变
    createMeshGradient(width, height) {
      // 深色背景
      const bg = new paper.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: '#0f0f23'
      });
      bg.sendToBack();

      // 创建网格渐变效果
      const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1', '#5f27cd'];
      const cellWidth = width / 3;
      const cellHeight = height / 2;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          const colorIndex = (i + j * 3) % colors.length;
          const rect = new paper.Path.Rectangle({
            point: [i * cellWidth, j * cellHeight],
            size: [cellWidth + 1, cellHeight + 1]
          });
          rect.fillColor = colors[colorIndex];
          rect.opacity = 0.6;
        }
      }

      // 叠加模糊圆
      const circles = [
        { x: 0.2, y: 0.3, r: 80, c: '#ff6b6b', o: 0.3 },
        { x: 0.7, y: 0.2, r: 100, c: '#48dbfb', o: 0.3 },
        { x: 0.5, y: 0.7, r: 120, c: '#feca57', o: 0.25 },
        { x: 0.8, y: 0.8, r: 90, c: '#ff9ff3', o: 0.3 },
      ];

      for (const c of circles) {
        const circle = new paper.Path.Circle({
          center: [width * c.x, height * c.y],
          radius: c.r
        });
        circle.fillColor = c.c;
        circle.opacity = c.o;
      }
    }

    // 霓虹发光
    createNeonGlow(width, height) {
      // 黑色背景
      const bg = new paper.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: '#0a0a0a'
      });
      bg.sendToBack();

      // 霓虹线条
      const neonColors = ['#ff00ff', '#00ffff', '#ff0080', '#8000ff'];
      for (let i = 0; i < 4; i++) {
        const y = height * 0.2 + i * (height * 0.2);
        const line = new paper.Path.Rectangle({
          point: [0, y],
          size: [width, 3]
        });
        line.fillColor = neonColors[i];
        line.shadowColor = neonColors[i];
        line.shadowBlur = 20;
      }

      // 中心发光圆
      const centerGlow = new paper.Path.Circle({
        center: [width / 2, height / 2],
        radius: 80
      });
      const glowGradient = new paper.Gradient();
      glowGradient.origin = new paper.Point(width / 2 - 80, height / 2);
      glowGradient.destination = new paper.Point(width / 2 + 80, height / 2);
      glowGradient.stops = [
        new paper.GradientStop('#ff00ff', 0),
        new paper.GradientStop('#00ffff', 1)
      ];
      centerGlow.fillColor = glowGradient;
      centerGlow.shadowColor = '#ff00ff';
      centerGlow.shadowBlur = 40;
    }

    // 柔和模糊背景
    createSoftBlur(width, height) {
      // 柔和渐变背景
      const bg = new paper.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: '#fdf2f8'
      });
      bg.sendToBack();

      // 柔和彩色圆
      const softColors = [
        { x: 0.2, y: 0.3, r: 120, c: '#f472b6' },
        { x: 0.8, y: 0.4, r: 100, c: '#818cf8' },
        { x: 0.3, y: 0.7, r: 140, c: '#fbbf24' },
        { x: 0.7, y: 0.8, r: 110, c: '#34d399' },
      ];

      for (const c of softColors) {
        const circle = new paper.Path.Circle({
          center: [width * c.x, height * c.y],
          radius: c.r
        });
        circle.fillColor = c.c;
        circle.opacity = 0.5;
      }
    }

    // 几何图案
    createGeometricPattern(width, height) {
      // 深色背景
      const bg = new paper.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: '#1e1e2e'
      });
      bg.sendToBack();

      // 几何图案
      const shapes = [];
      const patternColors = ['#89b4fa', '#f38ba8', '#a6e3a1', '#fab387', '#cba6f7'];

      // 六边形网格
      const hexSize = 40;
      for (let row = -1; row < height / hexSize + 1; row++) {
        for (let col = -1; col < width / hexSize + 1; col++) {
          const x = col * hexSize * 1.5;
          const y = row * hexSize * Math.sqrt(3) + (col % 2 === 0 ? 0 : hexSize * Math.sqrt(3) / 2);

          const hex = new paper.Path.RegularPolygon({
            center: [x, y],
            sides: 6,
            radius: hexSize * 0.5
          });
          hex.fillColor = patternColors[(row + col) % patternColors.length];
          hex.opacity = 0.3;
        }
      }

      // 叠加装饰圆
      const circle = new paper.Path.Circle({
        center: [width * 0.75, height * 0.25],
        radius: 60
      });
      circle.fillColor = '#f38ba8';
      circle.opacity = 0.4;
    }

    install(framework) {
      this._framework = framework;

      // 动态注册本地字体
      for (const font of localFonts) {
        registerFontFile(font.path, font.family, { weight: font.weight });
        // 注册别名
        if (font.aliases) {
          for (const alias of font.aliases) {
            try {
              registerFont(font.path, { family: alias, weight: font.weight || 'normal' });
            } catch (e) {
              // 忽略别名注册失败
            }
          }
        }
      }

      return this;
    }

    uninstall(framework) {
      // 清理所有画布
      for (const [name, ctx] of this.canvases) {
        if (ctx.canvas && ctx.canvas.parentNode) {
          ctx.canvas.parentNode.removeChild(ctx.canvas);
        }
      }
      this.canvases.clear();

      // 清理布局
      if (this.layouts) {
        this.layouts.clear();
      }
    }

    // ========== 布局系统 ==========

    // 布局系统状态
    layouts = new Map();

    // 解析百分比或数值
    _parseValue(value, base) {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.endsWith('%')) {
        return base * parseFloat(value) / 100;
      }
      return parseFloat(value) || 0;
    }

    // 创建布局容器
    create_layout(args) {
      const { name, width, height, gridCols, gridGap, background, padding } = args;

      // 创建画布
      this.canvas = paper.createCanvas(width, height);
      paper.setup(this.canvas);

      // 创建背景
      const bg = new paper.Path.Rectangle({
        point: [0, 0],
        size: [width, height],
        fillColor: background
      });
      bg.sendToBack();

      // 存储布局信息
      const layout = {
        name,
        width,
        height,
        gridCols,
        gridGap,
        padding,
        background,
        elements: [],
        canvas: this.canvas
      };

      this.layouts.set(name, layout);
      this.canvases.set(name, {
        canvas: this.canvas,
        paper,
        width,
        height,
        items: []
      });

      // 创建默认区域
      const headerHeight = Math.round(height * 0.15);
      const footerHeight = Math.round(height * 0.1);

      layout.zones = {
        header: { y: 0, height: headerHeight },
        main: { y: headerHeight, height: height - headerHeight - footerHeight },
        footer: { y: height - footerHeight, height: footerHeight }
      };

      return {
        success: true,
        message: `布局 "${name}" 创建成功 (${width}x${height})`,
        name,
        width,
        height,
        gridCols,
        zones: Object.keys(layout.zones)
      };
    }

    // 添加元素到布局
    add_element(args) {
      const { layout: layoutName, type, content, gridPosition, constraint, style, zone } = args;

      const layout = this.layouts.get(layoutName);
      if (!layout) {
        return { success: false, error: `布局 "${layoutName}" 不存在` };
      }

      const ctx = this.canvases.get(layoutName);
      if (!ctx) {
        return { success: false, error: `画布 "${layoutName}" 不存在` };
      }

      const { width: canvasWidth, height: canvasHeight } = layout;
      const padding = layout.padding;

      let x = padding;
      let y = padding;
      let elementWidth, elementHeight;

      if (gridPosition) {
        const colWidth = (canvasWidth - padding * 2 - layout.gridGap * (layout.gridCols - 1)) / layout.gridCols;
        const rowHeight = 50;

        x = padding + (gridPosition.col - 1) * (colWidth + layout.gridGap);
        y = padding + (gridPosition.row - 1) * (rowHeight + layout.gridGap);
        elementWidth = gridPosition.colSpan * colWidth + (gridPosition.colSpan - 1) * layout.gridGap;
        elementHeight = gridPosition.rowSpan * rowHeight + (gridPosition.rowSpan - 1) * layout.gridGap;
      } else if (constraint) {
        if (constraint.centerX) {
          elementWidth = constraint.width ? this._parseValue(constraint.width, canvasWidth) : canvasWidth * 0.8;
          x = (canvasWidth - elementWidth) / 2;
        } else if (constraint.right !== undefined) {
          elementWidth = constraint.width ? this._parseValue(constraint.width, canvasWidth) : canvasWidth * 0.5;
          x = canvasWidth - this._parseValue(constraint.right, canvasWidth) - elementWidth;
        } else {
          x = constraint.x !== undefined ? this._parseValue(constraint.x, canvasWidth) : padding;
          elementWidth = constraint.width ? this._parseValue(constraint.width, canvasWidth) : canvasWidth - x - padding;
        }

        if (constraint.centerY) {
          elementHeight = constraint.height ? this._parseValue(constraint.height, canvasHeight) : canvasHeight * 0.1;
          y = (canvasHeight - elementHeight) / 2;
        } else if (constraint.bottom !== undefined) {
          elementHeight = constraint.height ? this._parseValue(constraint.height, canvasHeight) : canvasHeight * 0.1;
          y = canvasHeight - this._parseValue(constraint.bottom, canvasHeight) - elementHeight;
        } else {
          y = constraint.y !== undefined ? this._parseValue(constraint.y, canvasHeight) : padding;
          elementHeight = constraint.height ? this._parseValue(constraint.height, canvasHeight) : canvasHeight * 0.1;
        }

        if (zone && layout.zones && layout.zones[zone]) {
          y += layout.zones[zone].y;
        }
      } else if (zone && layout.zones && layout.zones[zone]) {
        const zoneInfo = layout.zones[zone];
        y = zoneInfo.y + padding;
        elementWidth = canvasWidth - padding * 2;
        elementHeight = zoneInfo.height - padding * 2;
      } else {
        elementWidth = canvasWidth - padding * 2;
        elementHeight = 50;
      }

      let item;
      const defaultStyle = {
        fontSize: 24,
        fontFamily: defaultFontFamily,
        color: '#000000',
        align: 'center',
        ...style
      };

      try {
        if (type === 'text') {
          item = new paper.PointText({
            point: [x + elementWidth / 2, y + elementHeight / 2 + defaultStyle.fontSize / 3],
            content: content || '',
            fontSize: defaultStyle.fontSize,
            fontFamily: this._validateFont(defaultStyle.fontFamily),
            fillColor: defaultStyle.color,
            justification: defaultStyle.align
          });

          if (defaultStyle.bold) item.fontWeight = 'bold';

        } else if (type === 'image') {
          let imagePath = content;
          if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('data:')) {
            if (!path.isAbsolute(imagePath)) {
              imagePath = path.join(process.cwd(), imagePath);
            }
            if (fs.existsSync(imagePath)) {
              const buffer = fs.readFileSync(imagePath);
              const ext = path.extname(imagePath).toLowerCase();
              const mimeTypes = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
              const mimeType = mimeTypes[ext] || 'image/png';
              imagePath = `data:${mimeType};base64,${buffer.toString('base64')}`;
            }
          }

          item = new paper.Raster(imagePath);
          item.onLoad = () => {
            if (elementWidth && elementHeight) {
              item.bounds = new paper.Rectangle(x, y, elementWidth, elementHeight);
            } else if (elementWidth) {
              const scale = elementWidth / item.width;
              item.bounds = new paper.Rectangle(x, y, elementWidth, item.height * scale);
            } else {
              item.position = new paper.Point(x + item.width / 2, y + item.height / 2);
            }
          };

        } else if (type === 'rect') {
          item = new paper.Path.Rectangle({
            point: [x, y],
            size: [elementWidth, elementHeight],
            fillColor: defaultStyle.backgroundColor || '#f0f0f0',
            strokeColor: defaultStyle.color,
            strokeWidth: 1
          });
          if (defaultStyle.borderRadius) item.radius = defaultStyle.borderRadius;

        } else if (type === 'circle') {
          const radius = Math.min(elementWidth, elementHeight) / 2;
          item = new paper.Path.Circle({
            center: [x + elementWidth / 2, y + elementHeight / 2],
            radius: radius,
            fillColor: defaultStyle.backgroundColor || '#f0f0f0',
            strokeColor: defaultStyle.color,
            strokeWidth: 1
          });

        } else if (type === 'line') {
          item = new paper.Path.Line({
            from: [x, y],
            to: [x + elementWidth, y + elementHeight],
            strokeColor: defaultStyle.color || '#000000',
            strokeWidth: defaultStyle.fontSize || 2
          });
        }

        if (item && defaultStyle.opacity !== undefined) item.opacity = defaultStyle.opacity;

        layout.elements.push(item);
        ctx.items.push(item);

        return {
          success: true,
          message: `${type} 元素添加成功`,
          id: item.id,
          bounds: item.bounds,
          position: { x, y },
          size: { width: elementWidth, height: elementHeight }
        };

      } catch (error) {
        return { success: false, error: `创建元素失败: ${error.message}` };
      }
    }

    // 获取布局信息
    get_layout(args) {
      const layout = this.layouts.get(args.name);
      if (!layout) return { success: false, error: `布局 "${args.name}" 不存在` };

      return {
        success: true,
        name: layout.name,
        width: layout.width,
        height: layout.height,
        gridCols: layout.gridCols,
        zones: Object.keys(layout.zones),
        elementCount: layout.elements.length
      };
    }

    // 列出所有布局
    list_layouts(args) {
      const layouts = Array.from(this.layouts.values()).map(l => ({
        name: l.name, width: l.width, height: l.height, elementCount: l.elements.length
      }));
      return { success: true, layouts, total: layouts.length };
    }

    // 删除布局
    delete_layout(args) {
      if (!this.layouts.has(args.name)) return { success: false, error: `布局 "${args.name}" 不存在` };
      this.layouts.delete(args.name);
      this.canvases.delete(args.name);
      return { success: true, message: `布局 "${args.name}" 已删除` };
    }

    // 渲染布局
    render_layout(args) {
      const layout = this.layouts.get(args.name);
      if (!layout) return { success: false, error: `布局 "${args.name}" 不存在` };

      try {
        paper.view.update();
        paper.view.draw();

        const canvas = layout.canvas;
        const format = args.format || 'png';
        const stream = format === 'jpg' ? canvas.jpegStream({ quality: 0.9 }) : canvas.pngStream();
        const chunks = [];

        return new Promise((resolve, reject) => {
          stream.on('data', chunk => chunks.push(chunk));
          stream.on('end', () => {
            const buffer = Buffer.concat(chunks);

            // 保存到文件
            const filename = args.filename || `layout-${args.name}-${Date.now()}`;
            const fullFilename = `${filename}.${format}`;
            const fullPath = path.resolve(args.directory || './', fullFilename);
            fs.writeFileSync(fullPath, buffer);

            resolve({
              success: true,
              message: `布局已保存: ${fullPath}`,
              path: fullPath,
              width: layout.width,
              height: layout.height,
              size: buffer.length
            });
          });
          stream.on('error', reject);
        });
      } catch (error) {
        return { success: false, error: `渲染失败: ${error.message}` };
      }
    }
  };
};
