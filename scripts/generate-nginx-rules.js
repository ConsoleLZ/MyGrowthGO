const fs = require('fs');
const path = require('path');

const redirectsPath = path.join(__dirname, '../dist/_redirects');
const nginxOutputPath = path.join(__dirname, '../dist/nginx-dynamic-routes.conf');

if (!fs.existsSync(redirectsPath)) {
    console.warn('⚠️ _redirects 文件不存在，跳过 Nginx 规则生成');
    return;
}

const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
const lines = redirectsContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const nginxRules = [];

for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 3) continue;

    const from = parts[0];      // e.g. /category/*
    const to = parts[1];        // e.g. /category/_tag.html
    const status = parts[2];    // e.g. 200

    if (status !== '200') continue; // 只处理重写规则

    // 将 /category/* 转为 /category/
    if (from.endsWith('/*')) {
        const prefix = from.slice(0, -2); // 去掉 /*
        nginxRules.push(`  location ${prefix}/ {\n    try_files $uri $uri/ ${to};\n  }`);
    }
}

if (nginxRules.length > 0) {
    const config = nginxRules.join('\n\n') + '\n';
    fs.writeFileSync(nginxOutputPath, config);
    console.log('✅ 已生成 Nginx 动态路由配置:', nginxOutputPath);
} else {
    console.log('ℹ️ 无有效重写规则可转换为 Nginx 配置');
}