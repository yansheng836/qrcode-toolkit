# QRCode Toolkit - 设计文档

## 概述

QRCode Toolkit 是一个纯前端、无服务端的在线二维码生成器。基于 awesome-qr 库，提供丰富的样式定制能力和实时预览体验。

## 目标用户

开源项目，面向需要快速生成美化二维码的开发者和普通用户。

## 技术栈

- 原生 HTML/CSS/JS，无构建工具
- awesome-qr 通过 CDN 引入（固定版本：`https://unpkg.com/awesome-qr@2.1.0`）
- 直接打开 HTML 文件或使用本地服务器运行

## 功能需求

### 核心功能

1. **多种内容类型**
   - 纯文本
   - URL 链接
   - 邮箱地址
   - 电话号码
   - WiFi 配置（SSID + 密码 + 加密类型：WPA/WPA2/WEP/无）

2. **样式定制**
   - 上传背景图片作为二维码背景
   - 渐变背景配置（线性/径向，2-3 个色标，方向选择）
   - 圆角度数调整（滑块控制）
   - 前景色/背景色自定义
   - Logo 嵌入（居中显示）

3. **实时预览**
   - 任何参数变更立即刷新预览
   - 预览区显示在右侧

4. **导出**
   - 支持 PNG、JPG 两种格式（直接从 canvas 导出）
   - SVG 格式：将 canvas 渲染结果嵌入 SVG 包装器中导出
   - 一键下载

### 附加功能

5. **主题切换**
   - 极简白（默认）
   - 暗色主题
   - 渐变毛玻璃
   - localStorage 记忆用户偏好

## 架构设计

### 文件结构

```
qrcode-toolkit/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式（含主题 CSS 变量）
├── js/
│   ├── app.js          # 主逻辑：输入监听、事件绑定、导出
│   ├── qrcode.js       # 二维码生成封装：统一 awesome-qr 接口
│   ├── themes.js       # 主题管理：切换逻辑 + localStorage
│   └── utils.js        # 工具函数：文件读取、下载等
└── assets/             # 空目录，运行时存放用户上传图片
```

### 模块职责

#### qrcode.js

封装 awesome-qr 库，提供简洁接口：

```js
/**
 * 生成二维码
 * @param {string} text - 二维码内容
 * @param {Object} options - 配置项
 * @param {string} options.backgroundImage - 背景图片 Data URL
 * @param {Object} options.gradient - 渐变配置 { type: 'linear'|'radial', colorStops: [{offset, color}], direction?: number }
 * @param {number} options.cornerRadius - 圆角 0-1
 * @param {string} options.logoImage - Logo 图片 Data URL
 * @param {string} options.colorDark - 前景色
 * @param {string} options.colorLight - 背景色
 * @returns {Promise<string>} 二维码图片 Data URL
 */
async function generateQR(text, options) { ... }
```

#### app.js

主控制器：

- 监听所有输入控件的 change/input 事件
- 收集当前配置，调用 `generateQR()`
- 将结果更新到预览区
- 处理文件上传（背景图、Logo）→ 转为 Data URL
- 处理导出按钮点击 → 触发下载

#### themes.js

主题管理：

- 定义主题 CSS 变量
- `setTheme(name)` 切换主题
- 初始化时读取 localStorage，无则用默认主题

#### utils.js

工具函数：

- `fileToDataURL(file)` — 文件转 Data URL
- `downloadFile(dataURL, filename)` — 触发浏览器下载
- `debounce(fn, ms)` — 防抖函数

### UI 布局

左右分栏布局：

- **左侧控制面板**（约 35% 宽度）
  - 顶部：内容类型选择（文本/URL/邮箱/电话/WiFi）
  - 中部：内容输入区（根据类型切换表单）
  - 下部：样式设置（背景图、渐变、圆角、Logo、颜色）
  - 底部：导出按钮组（PNG/SVG/JPG）

- **右侧预览区**（约 65% 宽度）
  - 居中显示二维码预览
  - 实时更新

### 主题实现

使用 CSS 变量实现主题切换：

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --accent-color: #3b82f6;
}

[data-theme="dark"] {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --accent-color: #60a5fa;
}

[data-theme="gradient"] {
  --bg-primary: linear-gradient(135deg, #667eea, #764ba2);
  --bg-secondary: rgba(255, 255, 255, 0.1);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.8);
  --border-color: rgba(255, 255, 255, 0.2);
  --accent-color: #a78bfa;
}
```

## 开发约束

- 无构建工具，纯静态文件
- 通过本地服务器开发（如 VS Code Live Server）
- CDN 引入 awesome-qr（unpkg，固定版本 2.1.0）
- 不引入其他框架或库
