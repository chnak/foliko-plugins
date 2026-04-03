const { z } = require('zod');

module.exports = function (Plugin) {
  return class DaytonaPlugin extends Plugin {
    constructor(config = {}) {
      super();
      this.name = 'daytona';
      this.version = '1.0.0';
      this.description = 'Daytona 云开发环境管理插件';
      this.priority = 10;
      this.daytona = null;
      this.currentSandbox = null;
      this.config = {};
    }

    start(framework) {
      this._framework = framework;
      this._loadConfig();
      return this;
    }

    _loadConfig() {
      try {
        const storage = this._framework.pluginManager.get('storage');
        if (storage) {
          const store = storage.getStore();
          const entry = store.get('daytona:config');
          if (entry && entry.value) {
            this.config = entry.value;
            if (this.config.apiKey) {
              const { Daytona } = require('@daytonaio/sdk');
              this.daytona = new Daytona(this.config);
            }
          }
        }
      } catch (error) {
        // 配置加载失败，忽略
      }
    }

    tools = {
      daytona_configure: {
        description: '配置 Daytona API 密钥和连接信息（配置会持久化保存）',
        inputSchema: z.object({
          apiKey: z.string().describe('Daytona API Key'),
          apiUrl: z.string().optional().describe('Daytona API URL，默认为 https://app.daytona.io/api'),
          target: z.string().optional().describe('目标区域，如 us, eu 等'),
          organizationId: z.string().optional().describe('组织 ID（JWT 认证时需要）'),
        }),
        execute: async (args, framework) => {
          try {
            const { Daytona } = require('@daytonaio/sdk');
            this.config = {
              apiKey: args.apiKey,
            };
            if (args.apiUrl) this.config.apiUrl = args.apiUrl;
            if (args.target) this.config.target = args.target;
            if (args.organizationId) this.config.organizationId = args.organizationId;

            this.daytona = new Daytona(this.config);

            const storage = framework.pluginManager.get('storage');
            if (storage) {
              storage.setDirect('daytona:config', {
                value: this.config,
                updatedAt: new Date()
              });
            }

            return {
              success: true,
              message: 'Daytona 配置已保存',
              config: {
                apiUrl: this.config.apiUrl || 'https://app.daytona.io/api',
                target: this.config.target || 'default',
                hasApiKey: true
              },
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_get_api_status: {
        description: '获取 Daytona API 配置状态',
        inputSchema: z.object({}),
        execute: async () => {
          return {
            configured: !!this.config.apiKey,
            apiUrl: this.config.apiUrl || 'https://app.daytona.io/api',
            target: this.config.target || 'default',
            hasSandbox: !!this.currentSandbox,
            sandboxId: this.currentSandbox?.id,
            sandboxState: this.currentSandbox?.state,
          };
        },
      },

      daytona_clear_api_config: {
        description: '清除已存储的 Daytona API 配置',
        inputSchema: z.object({}),
        execute: async (framework) => {
          this.daytona = null;
          this.currentSandbox = null;
          this.config = {};
          
          const storage = framework.pluginManager.get('storage');
          if (storage) {
            storage.deleteDirect('daytona:config');
          }
          
          return { success: true, message: 'Daytona 配置已清除' };
        },
      },

      daytona_test_connection: {
        description: '测试 Daytona API 连接和密钥有效性',
        inputSchema: z.object({}),
        execute: async () => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            const result = await this.daytona.list({}, 1, 1);
            return {
              success: true,
              message: '连接成功',
              totalSandboxes: result.total,
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_create_sandbox: {
        description: '创建 Daytona 沙箱环境',
        inputSchema: z.object({
          language: z.string().optional().describe('编程语言：javascript, typescript, python（默认 javascript）'),
          name: z.string().optional().describe('沙箱名称'),
          resources: z.object({
            cpu: z.number().optional().describe('CPU 核心数'),
            memory: z.number().optional().describe('内存大小（GiB）'),
            disk: z.number().optional().describe('磁盘大小（GiB）'),
          }).optional().describe('资源配置'),
          envVars: z.record(z.string()).optional().describe('环境变量'),
          ephemeral: z.boolean().optional().describe('是否临时沙箱（停止后自动删除）'),
          autoStopInterval: z.number().optional().describe('自动停止间隔（分钟，0 禁用）'),
        }),
        execute: async (args) => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            const params = {
              language: args.language || 'javascript',
              public: true,
            };
            if (args.name) params.name = args.name;
            if (args.resources) params.resources = args.resources;
            if (args.envVars) params.envVars = args.envVars;
            if (args.ephemeral !== undefined) params.ephemeral = args.ephemeral;
            if (args.autoStopInterval !== undefined) params.autoStopInterval = args.autoStopInterval;
            
            const sandbox = await this.daytona.create(params);
            this.currentSandbox = sandbox;
            
            return {
              success: true,
              sandbox: {
                id: sandbox.id,
                name: sandbox.name,
                state: sandbox.state,
                language: sandbox.language,
              },
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_get_sandbox: {
        description: '获取指定沙箱信息',
        inputSchema: z.object({
          sandboxId: z.string().describe('沙箱 ID 或名称'),
        }),
        execute: async (args) => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            const sandbox = await this.daytona.get(args.sandboxId);
            return {
              success: true,
              sandbox: {
                id: sandbox.id,
                name: sandbox.name,
                state: sandbox.state,
                language: sandbox.language,
                createdAt: sandbox.createdAt,
                public: sandbox.public,
              },
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_list_sandboxes: {
        description: '列出所有沙箱',
        inputSchema: z.object({
          labels: z.record(z.string()).optional().describe('标签过滤'),
          page: z.number().optional().describe('页码'),
          limit: z.number().optional().describe('每页数量'),
        }),
        execute: async (args) => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            const result = await this.daytona.list(args.labels, args.page, args.limit);
            return {
              success: true,
              total: result.total,
              page: result.page,
              sandboxes: result.items.map((s) => ({
                id: s.id,
                name: s.name,
                state: s.state,
                language: s.language,
                public: s.public,
              })),
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_start_sandbox: {
        description: '启动沙箱',
        inputSchema: z.object({
          sandboxId: z.string().describe('沙箱 ID 或名称'),
          timeout: z.number().optional().describe('超时时间（秒）'),
        }),
        execute: async (args) => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            const sandbox = await this.daytona.get(args.sandboxId);
            await this.daytona.start(sandbox, args.timeout || 60);
            return { success: true, message: `沙箱 ${args.sandboxId} 启动成功` };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_stop_sandbox: {
        description: '停止沙箱',
        inputSchema: z.object({
          sandboxId: z.string().describe('沙箱 ID 或名称'),
        }),
        execute: async (args) => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            const sandbox = await this.daytona.get(args.sandboxId);
            await this.daytona.stop(sandbox);
            return { success: true, message: `沙箱 ${args.sandboxId} 已停止` };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_delete_sandbox: {
        description: '删除沙箱',
        inputSchema: z.object({
          sandboxId: z.string().describe('沙箱 ID 或名称'),
          timeout: z.number().optional().describe('超时时间（秒）'),
        }),
        execute: async (args) => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            const sandbox = await this.daytona.get(args.sandboxId);
            await this.daytona.delete(sandbox, args.timeout || 60);
            if (this.currentSandbox?.id === sandbox.id) {
              this.currentSandbox = null;
            }
            return { success: true, message: `沙箱 ${args.sandboxId} 已删除` };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_execute_code: {
        description: '在沙箱中执行代码',
        inputSchema: z.object({
          code: z.string().describe('要执行的代码'),
          sandboxId: z.string().optional().describe('沙箱 ID（不填使用当前沙箱）'),
        }),
        execute: async (args) => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            let sandbox = this.currentSandbox;
            if (args.sandboxId) {
              sandbox = await this.daytona.get(args.sandboxId);
            }
            if (!sandbox) {
              return { success: false, error: '没有活动的沙箱，请先创建或指定沙箱' };
            }
            const result = await sandbox.process.executeCommand(args.code);
            return {
              success: true,
              stdout: result.result,
              stderr: result.stderr,
              exitCode: result.exitCode,
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_write_file: {
        description: '在沙箱中写入文件',
        inputSchema: z.object({
          path: z.string().describe('文件路径'),
          content: z.string().describe('文件内容'),
          sandboxId: z.string().optional().describe('沙箱 ID（不填使用当前沙箱）'),
        }),
        execute: async (args) => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            let sandbox = this.currentSandbox;
            if (args.sandboxId) {
              sandbox = await this.daytona.get(args.sandboxId);
            }
            if (!sandbox) {
              return { success: false, error: '没有活动的沙箱，请先创建或指定沙箱' };
            }
            await sandbox.fs.uploadFiles([{ source: Buffer.from(args.content), destination: args.path }]);
            return { success: true, message: `文件 ${args.path} 写入成功` };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_read_file: {
        description: '在沙箱中读取文件',
        inputSchema: z.object({
          path: z.string().describe('文件路径'),
          sandboxId: z.string().optional().describe('沙箱 ID（不填使用当前沙箱）'),
        }),
        execute: async (args) => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            let sandbox = this.currentSandbox;
            if (args.sandboxId) {
              sandbox = await this.daytona.get(args.sandboxId);
            }
            if (!sandbox) {
              return { success: false, error: '没有活动的沙箱，请先创建或指定沙箱' };
            }
            const result = await sandbox.process.executeCommand(`cat "${args.path}"`);
            return { success: true, path: args.path, content: result.result || '' };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_get_preview_url: {
        description: '获取沙箱的公开预览URL',
        inputSchema: z.object({
          sandboxId: z.string().optional().describe('沙箱 ID（不填使用当前沙箱）'),
          port: z.number().optional().describe('端口号（默认 3000）'),
          duration: z.number().optional().describe('有效期秒数（默认 7200）'),
        }),
        execute: async (args) => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            
            const sandboxId = args.sandboxId || this.currentSandbox?.id;
            if (!sandboxId) {
              return { success: false, error: '没有活动的沙箱，请先创建或指定沙箱' };
            }
            
            const sandbox = await this.daytona.get(sandboxId);
            const port = args.port || 3000;
            const duration = args.duration || 7200;
            
            // 使用 SDK 的 getSignedPreviewUrl 方法
            const preview = await sandbox.getSignedPreviewUrl(port, duration);
            
            return {
              success: true,
              url: preview.url,
              port: preview.port,
              token: preview.token,
              expiresAt: preview.expiresAt,
              sandboxId: sandbox.id,
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },

      daytona_create_ephemeral_sandbox: {
        description: '创建临时沙箱（停止后自动删除）',
        inputSchema: z.object({
          language: z.string().optional().describe('编程语言（默认 javascript）'),
          timeout: z.number().optional().describe('创建超时时间（秒，默认 60）'),
        }),
        execute: async (args) => {
          try {
            if (!this.daytona) {
              return { success: false, error: '请先调用 daytona_configure 配置 API' };
            }
            const params = {
              language: args.language || 'javascript',
              ephemeral: true,
              public: true,
              autoStopInterval: 5,
            };
            const sandbox = await this.daytona.create(params, { timeout: args.timeout || 60 });
            this.currentSandbox = sandbox;
            return {
              success: true,
              message: '临时沙箱创建成功（5分钟后自动停止并删除）',
              sandbox: {
                id: sandbox.id,
                name: sandbox.name,
                state: sandbox.state,
                language: sandbox.language,
              },
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
      },
    };

    install(framework) {
      return this;
    }

    uninstall(framework) {
      if (this.currentSandbox && this.daytona) {
        this.daytona.delete(this.currentSandbox).catch(() => {});
      }
    }
  };
};
