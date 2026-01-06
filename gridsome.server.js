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
}
