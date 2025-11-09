// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path')

let configData = null
// 读取配置文件
try {
  const fileContents = fs.readFileSync('./config.yaml', 'utf8');
  configData = yaml.load(fileContents); // 解析 YAML
} catch (e) {
  console.error('读取配置文件出错:', e);
}

module.exports = function (api) {
  api.loadSource(async store => {
    Object.keys(configData).forEach(key => {
      if (Array.isArray(configData[key])) {
        store.addMetadata(key, JSON.stringify(configData[key]))
      } else {
        store.addMetadata(key, configData[key])
      }
    })
  })

  api.createPages(({ createPage }) => {
    createPage({
      path: '/category/:tag',
      component: './src/templates/Category.vue'
    })
  })

  api.afterBuild(({ redirects }) => {
    const redirectRules = [];

    for (const rule of redirects) {
      if (rule.status === 200) {
        // 将 /category/:tag 转为 /category/* 语法（适用于 Netlify/Fleek/CF Pages）
        const from = rule.from.replace(/:[a-zA-Z0-9_]+/g, '*');
        const to = rule.to;
        redirectRules.push(`${from} ${to} 200`);
      }
    }

    // 写入 _redirects 文件到 dist 目录(解决部署的时候，动态路由404问题)
    const redirectsContent = redirectRules.join('\n');
    const outputPath = path.join(__dirname, 'dist', '_redirects');
    fs.writeFileSync(outputPath, redirectsContent, 'utf8');
  });
}
