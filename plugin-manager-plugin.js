/**
 * PluginManagerPlugin - 插件管理工具
 * 提供远程插件的列表、发布和安装功能
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Plugin } = require('../src/core/plugin-base');
const { logger } = require('../src/utils/logger');
const { z } = require('zod');

// 从共享配置加载
const { DEFAULT_REPO, shouldIgnore } = require('../cli/src/utils/plugin-config');

const log = logger.child('PluginManagerPlugin');

/**
 * 递归复制目录（带过滤）
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (shouldIgnore(entry.name)) {
      log.debug(`Ignoring: ${entry.name}`);
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 执行 Git 命令
 */
function gitCommand(args, cwd) {
  try {
    return execSync(`git ${args}`, { cwd, encoding: 'utf-8', stdio: 'pipe' });
  } catch (err) {
    return err.stdout || err.stderr || '';
  }
}

/**
 * 解析 Git URL 获取信息
 */
function parseGitUrl(url) {
  const patterns = [
    /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/,
    /^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  }
  return null;
}

class PluginManagerPlugin extends Plugin {
  constructor(config = {}) {
    super();
    this.name = 'plugin_manager';
    this.version = '1.0.0';
    this.description = '管理远程插件：列表、发布、安装';
    this._repo = config.repo || process.env.FOLIKO_PLUGIN_REPO || DEFAULT_REPO;
    this.system = true;
  }

  install(framework) {
    this._framework = framework;
    return this;
  }

  start(framework) {
    // 1. plugin_list - 列出远程仓库插件
    framework.registerTool({
      name: 'plugin_list',
      description: '列出远程插件仓库中所有可用的插件',
      inputSchema: z.object({
        repo: z.string().optional().describe('插件仓库 URL，默认为 https://github.com/chnak/foliko-plugins.git'),
      }),
      execute: async (args) => {
        const repo = args.repo || this._repo;
        return this._listPlugins(repo);
      }
    });

    // 2. plugin_publish - 发布本地插件到远程仓库
    framework.registerTool({
      name: 'plugin_publish',
      description: '将本地插件发布到远程 Git 仓库（需要仓库写权限）',
      inputSchema: z.object({
        name: z.string().describe('插件名称，如 puppeteer-plugin'),
        repo: z.string().optional().describe('插件仓库 URL'),
      }),
      execute: async (args) => {
        const { name, repo } = args;
        const targetRepo = repo || this._repo;
        return this._publishPlugin(name, targetRepo);
      }
    });

    // 3. plugin_install - 从远程仓库安装插件到本地
    framework.registerTool({
      name: 'plugin_install',
      description: '从远程 Git 仓库安装插件到本地 .agent/plugins 目录',
      inputSchema: z.object({
        name: z.string().describe('插件名称，如 puppeteer-plugin'),
        repo: z.string().optional().describe('插件仓库 URL'),
      }),
      execute: async (args) => {
        const { name, repo } = args;
        const targetRepo = repo || this._repo;
        return this._installPlugin(name, targetRepo);
      }
    });

    return this;
  }

  /**
   * 列出远程仓库的插件
   */
  async _listPlugins(repo) {
    try {
      log.info(`Listing plugins from ${repo}...`);

      const repoInfo = parseGitUrl(repo);
      if (!repoInfo) {
        return { success: false, error: 'Invalid repository URL' };
      }

      // 使用 GitHub API 获取仓库内容
      const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: `Repository not found: ${repo}` };
        }
        return { success: false, error: `GitHub API error: ${response.status}` };
      }

      const contents = await response.json();

      if (!Array.isArray(contents) || contents.length === 0) {
        return { success: true, plugins: [], message: 'No plugins found in repository' };
      }

      const plugins = [];

      for (const item of contents) {
        if (item.type === 'dir') {
          // 获取 README 描述
          let description = '-';
          try {
            const readmeUrl = `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/main/${item.name}/README.md`;
            const readmeResp = await fetch(readmeUrl);
            if (readmeResp.ok) {
              const readmeText = await readmeResp.text();
              const lines = readmeText.split('\n').filter(l => l.trim());
              if (lines.length > 1) {
                description = lines.slice(1).join(' ').slice(0, 100);
              }
            }
          } catch (e) {}

          plugins.push({
            name: item.name,
            type: 'directory',
            description,
          });
        } else if (item.type === 'file' && item.name.endsWith('.js')) {
          const name = item.name.replace('.js', '');
          plugins.push({
            name,
            type: 'file',
            description: '(root file)',
          });
        }
      }

      return {
        success: true,
        plugins,
        repo,
        count: plugins.length,
      };

    } catch (err) {
      log.error(`List plugins failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * 发布插件到远程仓库
   */
  async _publishPlugin(pluginName, repo) {
    const pluginsDir = path.resolve(process.cwd(), '.agent', 'plugins');
    const localPluginsDir = path.resolve(process.cwd(), 'plugins');

    // 确定插件目录
    let actualPluginsDir = pluginsDir;
    if (!fs.existsSync(pluginsDir)) {
      if (fs.existsSync(localPluginsDir)) {
        actualPluginsDir = localPluginsDir;
      } else {
        return { success: false, error: `Plugins directory not found` };
      }
    }

    const pluginPath = path.join(actualPluginsDir, `${pluginName}.js`);
    const pluginSourceDir = path.join(actualPluginsDir, pluginName);

    // 检查插件是否存在
    if (!fs.existsSync(pluginPath) && !fs.existsSync(pluginSourceDir)) {
      return {
        success: false,
        error: `Plugin "${pluginName}" not found`,
        available: fs.readdirSync(actualPluginsDir).filter(f => {
          if (f.endsWith('.js')) return true;
          const fullPath = path.join(actualPluginsDir, f);
          return fs.statSync(fullPath).isDirectory();
        }),
      };
    }

    const tmpDir = path.join(require('os').tmpdir(), `foliko-plugin-publish-${Date.now()}`);

    try {
      log.info(`Publishing plugin "${pluginName}" to ${repo}...`);

      // 克隆仓库
      fs.mkdirSync(tmpDir, { recursive: true });

      let isNewRepo = false;
      try {
        gitCommand(`clone ${repo} "${tmpDir}" --depth 1`, process.cwd());
      } catch (err) {
        log.info('Initializing new repository...');
        fs.mkdirSync(tmpDir, { recursive: true });
        gitCommand('init', tmpDir);
        gitCommand(`remote add origin ${repo}`, tmpDir);
        isNewRepo = true;
      }

      // 创建插件目录
      const pluginDir = path.join(tmpDir, pluginName);
      fs.mkdirSync(pluginDir, { recursive: true });

      // 复制插件
      let pluginContent = null;
      if (fs.existsSync(pluginSourceDir) && fs.statSync(pluginSourceDir).isDirectory()) {
        log.info('Copying plugin directory...');
        copyDirRecursive(pluginSourceDir, pluginDir);

        const mainJsPath = path.join(pluginSourceDir, `${pluginName}.js`);
        if (fs.existsSync(mainJsPath)) {
          pluginContent = fs.readFileSync(mainJsPath, 'utf-8');
        }
      } else {
        log.info('Copying plugin file...');
        pluginContent = fs.readFileSync(pluginPath, 'utf-8');
        const targetPath = path.join(pluginDir, `${pluginName}.js`);
        fs.writeFileSync(targetPath, pluginContent);

        const configPath = path.join(actualPluginsDir, `${pluginName}.json`);
        if (fs.existsSync(configPath)) {
          fs.copyFileSync(configPath, path.join(pluginDir, `${pluginName}.json`));
        }
      }

      // 创建 README.md
      const readmePath = path.join(pluginDir, 'README.md');
      if (!fs.existsSync(readmePath)) {
        const descMatch = pluginContent?.match(/\*\*Description\*\*:\s*(.+)/) ||
                         pluginContent?.match(/description[:\s]+(.+)/i);
        const desc = descMatch ? descMatch[1] : `Foliko plugin: ${pluginName}`;
        fs.writeFileSync(readmePath, `# ${pluginName}\n\n${desc}\n`);
      }

      // Git 提交和推送
      gitCommand('add .', tmpDir);

      const status = gitCommand('status --porcelain', tmpDir);
      if (!status.trim()) {
        return {
          success: true,
          message: `No changes to commit for plugin "${pluginName}"`,
          repo,
        };
      }

      gitCommand(`commit -m "Add/update plugin: ${pluginName}"`, tmpDir);
      gitCommand(`push ${isNewRepo ? '-u' : ''} origin main`, tmpDir);

      log.info(`Plugin "${pluginName}" published successfully!`);

      return {
        success: true,
        message: `Plugin "${pluginName}" published successfully`,
        repo,
        path: `${pluginName}/${pluginName}.js`,
      };

    } catch (err) {
      log.error(`Publish failed: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  /**
   * 从远程仓库安装插件
   */
  async _installPlugin(pluginName, repo) {
    const localPluginsDir = path.resolve(process.cwd(), '.agent', 'plugins');
    const tmpDir = path.join(require('os').tmpdir(), `foliko-plugin-install-${Date.now()}`);

    try {
      log.info(`Installing plugin "${pluginName}" from ${repo}...`);

      // 克隆仓库
      fs.mkdirSync(tmpDir, { recursive: true });
      gitCommand(`clone ${repo} "${tmpDir}" --depth 1`, process.cwd());

      // 查找插件
      const pluginDir = path.join(tmpDir, pluginName);
      let sourcePath;

      if (fs.existsSync(pluginDir) && fs.statSync(pluginDir).isDirectory()) {
        sourcePath = path.join(pluginDir, `${pluginName}.js`);
      } else {
        sourcePath = path.join(tmpDir, `${pluginName}.js`);
      }

      if (!fs.existsSync(sourcePath)) {
        // 列出可用插件
        const available = fs.readdirSync(tmpDir).filter(f => {
          const fullPath = path.join(tmpDir, f);
          return fs.statSync(fullPath).isDirectory();
        });

        return {
          success: false,
          error: `Plugin "${pluginName}" not found in repository`,
          available,
        };
      }

      // 确保本地目录存在
      if (!fs.existsSync(localPluginsDir)) {
        fs.mkdirSync(localPluginsDir, { recursive: true });
      }

      // 复制插件到本地
      const targetDir = path.join(localPluginsDir, pluginName);
      fs.mkdirSync(targetDir, { recursive: true });

      // 复制目录内容
      copyDirRecursive(path.dirname(sourcePath), targetDir);

      // 如果是单文件插件，复制主文件
      if (!fs.existsSync(path.join(targetDir, `${pluginName}.js`))) {
        fs.copyFileSync(sourcePath, path.join(targetDir, `${pluginName}.js`));
      }

      log.info(`Plugin "${pluginName}" installed to ${targetDir}`);

      return {
        success: true,
        message: `Plugin "${pluginName}" installed successfully`,
        path: targetDir,
      };

    } catch (err) {
      log.error(`Install failed: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}

module.exports = PluginManagerPlugin;
