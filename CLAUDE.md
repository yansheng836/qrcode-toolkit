# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QRCode Toolkit — 纯前端在线二维码生成器，无服务端依赖。支持多种内容类型、丰富的样式定制和 3D 立体效果。

## How to Run

Open `index.html` directly in a browser, or use a local server (e.g., VS Code Live Server) for development.

## Tech Stack

- Pure HTML/CSS/JS, no build tools
- [qrcode-generator@1.4.4](https://github.com/kazuhikoarase/qrcode-generator) via CDN (`https://unpkg.com/qrcode-generator@1.4.4/qrcode.js`)
- Global function: `qrcode(0, 'M')` — returns QR code instance with `.addData()`, `.make()`, `.getModuleCount()`, `.isDark(row, col)`

## Architecture

```
index.html          — 主页面，左右分栏布局
css/style.css       — 样式（CSS 变量实现 3 种主题切换）
js/utils.js         — 工具函数：fileToDataURL, downloadFile, debounce
js/themes.js        — 主题管理：light/dark/gradient，localStorage 持久化
js/qrcode.js        — 二维码生成封装，Canvas 逐模块绘制，支持 3D 立体效果
js/app.js           — 主控制器：内容类型切换、样式面板、实时预览、多格式导出
```

## Key Design Decisions

- CSS variables for theme switching (3 themes: light, dark, gradient)
- qrcode-generator loaded via CDN, wrapped in `generateQR(text, options)` interface
- Canvas 逐模块手动绘制（非库自带渲染），支持圆角、渐变、背景图、Logo、3D 立体
- 渐变直接作为模块的 fillStyle，不使用 `source-atop` 合成
- 3D 效果：`ctx.shadowBlur` 统一阴影 + 画家算法（侧面→顶面分离绘制）
- Export: PNG/JPG from canvas, SVG wraps raster in SVG container
- Debounced input → real-time preview updates (300ms)

## Commit Convention

提交信息描述部分使用中文：`<type>: <中文描述>`
