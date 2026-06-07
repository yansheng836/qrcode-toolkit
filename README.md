# QRCode Toolkit

纯前端在线二维码生成器，无服务端依赖。基于 [qrcode-generator](https://github.com/nickvdyck/qrcode-generator) 库，支持多种内容类型、丰富的样式定制和 3D 立体效果。

## 功能

- **多种内容类型** — 文本、URL、邮箱、电话、WiFi
- **样式定制** — 前景色/背景色、渐变背景、圆角、背景图片、Logo 嵌入
- **3D 立体效果** — 整体统一阴影、四方向侧面、顶面渐变高光
- **实时预览** — 输入即生成，所见即所得
- **多格式导出** — PNG、JPG、SVG
- **主题切换** — 极简白、暗色主题、渐变毛玻璃（自动记忆）

## 使用方式

直接在浏览器中打开 `index.html`，或使用本地服务器（如 VS Code Live Server）运行。

```bash
# 使用 npx 启动本地服务器
npx serve .
```

## 技术栈

- 原生 HTML / CSS / JavaScript，无构建工具
- [qrcode-generator@1.4.4](https://unpkg.com/qrcode-generator@1.4.4/qrcode.js)（CDN 引入）
- CSS 变量实现主题切换

## 项目结构

```
index.html          — 主页面（左右分栏布局）
css/style.css       — 样式（CSS 变量 + 3 种主题）
js/utils.js         — 工具函数（fileToDataURL, downloadFile, debounce）
js/themes.js        — 主题管理（light/dark/gradient，localStorage 持久化）
js/qrcode.js        — 二维码生成（Canvas 逐模块绘制，3D 立体效果）
js/app.js           — 主控制器（内容类型、样式面板、预览、导出）
```

## License

MIT
