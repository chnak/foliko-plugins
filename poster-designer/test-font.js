// 测试字体注册
const createPlugin = require('./index.js');
class MockPlugin { constructor() { this.canvases = new Map(); } }
const PosterPlugin = createPlugin(MockPlugin);
const poster = new PosterPlugin();
const tools = poster.tools;

(async () => {
  const result = await tools.list_fonts.execute({});
  console.log('Registered fonts:', JSON.stringify(result, null, 2));
})();
