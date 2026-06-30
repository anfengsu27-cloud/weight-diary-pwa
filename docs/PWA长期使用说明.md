# PWA 长期使用说明

## 部署目录

部署时使用 `src/` 目录作为网站根目录。该目录已经包含 PWA 运行所需的页面、样式、脚本、manifest、Service Worker 和图标。

## 手机安装

1. 将 `src/` 部署到支持 HTTPS 的平台，例如 GitHub Pages、Cloudflare Pages、Netlify 或 Vercel。
2. 用手机浏览器打开部署后的 HTTPS 地址。
3. 安卓 Chrome：菜单 -> 添加到主屏幕或安装应用。
4. iPhone Safari：分享 -> 添加到主屏幕。
5. 安装后至少联网打开一次，等待页面完整加载，之后可离线打开。

## 离线能力

应用会缓存以下核心文件：

- `index.html`
- `manifest.json`
- `css/style.css`
- `js/storage.js`
- `js/charts.js`
- `js/app.js`
- `assets/icons/icon.svg`

打开过一次后，即使网络不可用，也会优先使用本机缓存打开应用。

## 数据存储

体重、饮食、运动和设置数据保存在当前手机浏览器的 `localStorage` 中，不会自动上传到服务器。

请定期在应用设置页使用“导出数据”保存 JSON 备份。换手机、换浏览器、清理浏览器网站数据、卸载 PWA，都可能导致本地数据丢失。

## 长期使用建议

- 固定一个长期主网址，不要频繁更换域名或路径。
- 可以同时部署一个备用站点，但数据不会自动在两个网址之间同步。
- 每周或每月导出一次数据备份。
- 更新应用代码后，手机端重新打开一次应用，让新版 Service Worker 完成缓存。
