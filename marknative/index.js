const { z } = require('zod');
const path = require('path');
const fs = require('fs');

module.exports = function (Plugin) {
  return class MarkNativePlugin extends Plugin {
    constructor(config = {}) {
      super();
      this.name = 'marknative';
      this.version = '1.0.0';
      this.description = 'Markdown 转图片插件 - 将 Markdown 转换为 PNG/SVG';
      this.priority = 10;
      this.marknative = null;
      this.checked = false;
    }

    async _ensureMarkNative() {
      if (this.checked) return;
      this.checked = true;
      
      try {
        this.marknative = require('marknative');
      } catch (error) {
        this.marknative = null;
        console.error('MarkNative 加载失败:', error.message);
      }
    }

    tools = {
      marknative_render: {
        description: '将 Markdown 渲染为图片（Base64 编码返回）',
        inputSchema: z.object({
          markdown: z.string().describe('Markdown 内容'),
          format: z.enum(['png', 'svg']).optional().describe('输出格式：png 或 svg，默认 png'),
          theme: z.string().optional().describe('主题：default, github, solarized, sepia, rose, dark, nord, dracula, ocean, forest'),
          singlePage: z.boolean().optional().describe('是否渲染为单张图片（默认 false）'),
          codeTheme: z.string().optional().describe('代码高亮主题（如 github-dark, nord 等）'),
        }),
        execute: async (args) => {
          try {
            await this._ensureMarkNative();
            
            if (!this.marknative) {
              return {
                success: false,
                error: 'marknative 未安装。请运行: cd .agent/plugins/marknative && npm install'
              };
            }

            const { renderMarkdown } = this.marknative;
            
            const options = {
              format: args.format || 'png',
              singlePage: args.singlePage || false
            };
            
            if (args.theme) options.theme = args.theme;
            if (args.codeTheme) options.codeHighlighting = { theme: args.codeTheme };

            const pages = await renderMarkdown(args.markdown, options);
            
            if (pages.length === 0) {
              return { success: false, error: '渲染失败，无输出' };
            }

            const page = pages[0];
            return {
              success: true,
              pageCount: pages.length,
              format: page.format,
              data: page.format === 'png' ? page.data.toString('base64') : page.data,
              isBase64: page.format === 'png',
              message: page.format === 'png' ? 'PNG 图片已生成' : 'SVG 已生成'
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      marknative_render_to_file: {
        description: '将 Markdown 渲染为图片并保存到文件',
        inputSchema: z.object({
          markdown: z.string().describe('Markdown 内容'),
          outputPath: z.string().describe('输出文件路径（如 output.png）'),
          format: z.enum(['png', 'svg']).optional().describe('输出格式，默认根据文件扩展名'),
          theme: z.string().optional().describe('主题'),
          codeTheme: z.string().optional().describe('代码高亮主题'),
        }),
        execute: async (args) => {
          try {
            await this._ensureMarkNative();
            
            if (!this.marknative) {
              return {
                success: false,
                error: 'marknative 未安装。请运行: cd .agent/plugins/marknative && npm install'
              };
            }

            const { renderMarkdown } = this.marknative;
            
            const ext = path.extname(args.outputPath).toLowerCase();
            const format = args.format || (ext === '.svg' ? 'svg' : 'png');

            const options = { format };
            if (args.theme) options.theme = args.theme;
            if (args.codeTheme) options.codeHighlighting = { theme: args.codeTheme };

            const pages = await renderMarkdown(args.markdown, options);
            
            const dir = path.dirname(args.outputPath);
            if (dir && dir !== '.' && !fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            const files = [];
            for (let i = 0; i < pages.length; i++) {
              const page = pages[i];
              const filePath = pages.length === 1 
                ? args.outputPath 
                : args.outputPath.replace(/(\.[^.]+)$/, `-${String(i + 1).padStart(2, '0')}$1`);
              
              if (page.format === 'png') {
                fs.writeFileSync(filePath, page.data);
              } else {
                fs.writeFileSync(filePath, page.data, 'utf-8');
              }
              files.push(filePath);
            }

            return {
              success: true,
              files,
              pageCount: pages.length,
              message: `已生成 ${pages.length} 页图片: ${files.join(', ')}`
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      marknative_preview: {
        description: '预览 Markdown 渲染效果（返回第一页 Base64）',
        inputSchema: z.object({
          markdown: z.string().describe('Markdown 内容'),
          theme: z.string().optional().describe('主题'),
          codeTheme: z.string().optional().describe('代码高亮主题'),
        }),
        execute: async (args) => {
          try {
            await this._ensureMarkNative();
            
            if (!this.marknative) {
              return {
                success: false,
                error: 'marknative 未安装。请运行: cd .agent/plugins/marknative && npm install'
              };
            }

            const { renderMarkdown } = this.marknative;
            
            const options = {
              format: 'png',
              singlePage: true
            };
            
            if (args.theme) options.theme = args.theme;
            if (args.codeTheme) options.codeHighlighting = { theme: args.codeTheme };

            const pages = await renderMarkdown(args.markdown, options);
            
            if (pages.length === 0) {
              return { success: false, error: '预览生成失败' };
            }

            return {
              success: true,
              preview: pages[0].data.toString('base64'),
              format: 'png'
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      marknative_get_themes: {
        description: '获取所有可用的主题列表',
        inputSchema: z.object({}),
        execute: async () => {
          return {
            success: true,
            themes: [
              { name: 'default', description: '默认主题（浅色）' },
              { name: 'github', description: 'GitHub 风格' },
              { name: 'solarized', description: 'Solarized 风格' },
              { name: 'sepia', description: '复古纸张风格' },
              { name: 'rose', description: '玫瑰粉风格' },
              { name: 'dark', description: '深色主题' },
              { name: 'nord', description: 'Nord 风格' },
              { name: 'dracula', description: 'Dracula 风格' },
              { name: 'ocean', description: '海洋风格' },
              { name: 'forest', description: '森林风格' }
            ],
            codeThemes: ['github-light', 'github-dark', 'nord', 'dracula', 'solarized-light', 'solarized-dark', 'monokai']
          };
        },
      },

      marknative_update_repo_readme: {
        description: '更新仓库 README（自动扫描所有插件并生成表格）',
        inputSchema: z.object({
          repoPath: z.string().optional().describe('仓库路径，默认为 /tmp/foliko-plugins'),
        }),
        execute: async (args, framework) => {
          try {
            const { execSync } = require('child_process');
            const repoPath = args.repoPath || '/tmp/foliko-plugins';
            
            // 检查仓库是否存在
            if (!fs.existsSync(repoPath)) {
              // 克隆仓库
              console.log('Cloning repository...');
              try {
                execSync('cd /tmp && rm -rf foliko-plugins && git clone https://github.com/chnak/foliko-plugins.git', { stdio: 'inherit' });
              } catch (e) {
                return { success: false, error: '无法克隆仓库，请确保有写权限' };
              }
            }
            
            // 扫描插件
            const pluginsDir = repoPath;
            const plugins = [];
            const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
            
            for (const entry of entries) {
              if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                const pluginPath = path.join(pluginsDir, entry.name);
                const indexPath = path.join(pluginPath, 'index.js');
                
                if (fs.existsSync(indexPath)) {
                  const content = fs.readFileSync(indexPath, 'utf-8');
                  const toolMatches = content.match(/^\s{2}(\w+):\s*\{\s*description:/gm);
                  const tools = toolMatches ? toolMatches.map(m => m.match(/\s{2}(\w+):/)[1]) : [];
                  
                  plugins.push({
                    name: entry.name,
                    tools
                  });
                }
              }
            }
            
            // 生成 README
            const pluginListTable = plugins.map(p => {
              const name = p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' ');
              return `| [\`${p.name}\`](#${p.name.toLowerCase()}) | 插件 | ✅ 可用 |`;
            }).join('\n');
            
            const pluginToolsTables = plugins.map(p => {
              const name = p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' ');
              const toolRows = p.tools.map(t => `| \`${t}\` | - |`).join('\n');
              return `### ${name}\n\n| 工具 | 描述 |\n|------|------|\n${toolRows}\n`;
            }).join('\n---\n\n');
            
            const installCommands = plugins.map(p => `folko plugin install ${p.name}`).join('\n');
            
            const readme = `# Foliko Plugins

Foliko Agent 框架的插件仓库，为 Foliko 提供扩展功能。

## 插件列表

| 插件 | 描述 | 状态 |
|------|------|------|
${pluginListTable}

---

${pluginToolsTables}

## 安装所有插件

\`\`\`bash
${installCommands}
folko reload
\`\`\`

## 许可证

Apache-2.0
`;
            
            // 写入 README
            fs.writeFileSync(path.join(repoPath, 'README.md'), readme, 'utf-8');
            
            // 提交并推送
            try {
              execSync('cd ' + repoPath + ' && git add README.md && git commit -m "docs: auto-update plugin list" && git push', { stdio: 'inherit' });
            } catch (e) {
              return {
                success: true,
                message: 'README 已更新但推送失败（可能没有写权限）',
                plugins,
                readme
              };
            }
            
            return {
              success: true,
              message: 'README 已更新并推送到 GitHub',
              plugins,
              url: 'https://github.com/chnak/foliko-plugins'
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      marknative_status: {
        description: '检查 marknative 插件状态',
        inputSchema: z.object({}),
        execute: async () => {
          await this._ensureMarkNative();
          
          return {
            success: true,
            available: this.marknative !== null,
            message: this.marknative ? 'marknative 已就绪' : 'marknative 未安装，请运行: cd .agent/plugins/marknative && npm install'
          };
        },
      },
    };

    install(framework) {
      return this;
    }

    uninstall(framework) {}
  };
};
