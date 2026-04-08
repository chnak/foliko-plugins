#!/usr/bin/env node

/**
 * 更新仓库 README 的脚本
 * 读取所有插件目录，生成插件列表表格
 */

const fs = require('fs');
const path = require('path');

const REPO_DIR = path.join(__dirname, '..', '..', '..');
const README_PATH = path.join(REPO_DIR, 'README.md');

// 插件信息
const plugins = [];

function getPluginInfo(pluginPath) {
  const indexPath = path.join(pluginPath, 'index.js');
  const readmePath = path.join(pluginPath, 'README.md');
  
  let name = path.basename(pluginPath);
  let description = '暂无描述';
  let tools = [];
  
  // 读取 README
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf-8');
    const descMatch = content.match(/^#\s+(.+)$/m);
    if (descMatch) {
      description = descMatch[1];
    }
  }
  
  // 读取 index.js 获取工具列表
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf-8');
    const toolMatches = content.match(/^\s{2}(\w+):\s*\{\s*description:/gm);
    if (toolMatches) {
      tools = toolMatches.map(m => m.match(/\s{2}(\w+):/)[1]);
    }
  }
  
  return { name, description, tools };
}

// 扫描插件目录
function scanPlugins() {
  const pluginsDir = path.join(REPO_DIR);
  
  if (!fs.existsSync(pluginsDir)) {
    console.error('Plugins directory not found:', pluginsDir);
    return;
  }
  
  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      const pluginPath = path.join(pluginsDir, entry.name);
      const indexPath = path.join(pluginPath, 'index.js');
      
      if (fs.existsSync(indexPath)) {
        const info = getPluginInfo(pluginPath);
        plugins.push(info);
        console.log(`Found plugin: ${info.name}`);
      }
    }
  }
}

// 生成 README 内容
function generateReadme() {
  const pluginTable = plugins.map(p => {
    const toolList = p.tools.length > 0 
      ? p.tools.map(t => `| \`${t}\` | - |`).join('\n') 
      : '| - | - |';
    
    return `## ${p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' ')}\n\n${p.description}\n\n### 工具\n\n| 工具 | 描述 |\n|------|------|\n${toolList}\n`;
  }).join('\n---\n\n');
  
  const pluginListTable = plugins.map(p => {
    const name = p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' ');
    return `| [\`${p.name}\`](#${p.name.toLowerCase()}) | ${p.description} | ✅ 可用 |`;
  }).join('\n');
  
  const pluginToolsTable = plugins.map(p => {
    return `### ${p.name}\n\n| 工具 | 描述 |\n|------|------|\n${p.tools.map(t => `| \`${t}\` | - |`).join('\n')}\n`;
  }).join('\n---\n\n');
  
  return `# Foliko Plugins

Foliko Agent 框架的插件仓库，为 Foliko 提供扩展功能。

## 插件列表

| 插件 | 描述 | 状态 |
|------|------|------|
${pluginListTable}

${pluginToolsTable}

## 安装所有插件

\`\`\`bash
${plugins.map(p => `folko plugin install ${p.name}`).join('\n')}
folko reload
\`\`\`

## 许可证

Apache-2.0
`;
}

// 主函数
function main() {
  console.log('Scanning plugins...');
  scanPlugins();
  
  console.log(`\nFound ${plugins.length} plugins`);
  
  if (plugins.length === 0) {
    console.log('No plugins found, skipping README update');
    return;
  }
  
  console.log('\nGenerating README...');
  const content = generateReadme();
  
  fs.writeFileSync(README_PATH, content, 'utf-8');
  console.log(`README updated: ${README_PATH}`);
}

main();
