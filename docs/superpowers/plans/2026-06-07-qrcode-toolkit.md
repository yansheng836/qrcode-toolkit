# QRCode Toolkit 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个纯前端二维码生成器，支持多种内容类型、样式定制和实时预览。

**Architecture:** 原生 HTML/CSS/JS 单页应用，左右分栏布局。awesome-qr 通过 CDN 引入，所有逻辑拆分为 4 个 JS 模块（app.js、qrcode.js、themes.js、utils.js），通过全局变量暴露接口。

**Tech Stack:** HTML5、CSS3（CSS 变量）、ES6+ JavaScript、awesome-qr@2.1.0（CDN）

---

## 文件结构

```
qrcode-toolkit/
├── index.html              # 主页面：HTML 结构 + 内联 script 引入模块
├── css/
│   └── style.css           # 全局样式 + 主题 CSS 变量 + 布局 + 组件样式
├── js/
│   ├── utils.js            # 工具函数：fileToDataURL、downloadFile、debounce
│   ├── themes.js           # 主题管理：3 套主题、切换逻辑、localStorage 持久化
│   ├── qrcode.js           # 二维码生成封装：统一 awesome-qr 接口
│   └── app.js              # 主控制器：事件绑定、输入收集、预览更新、导出
└── .gitignore              # 忽略 .superpowers/ 目录
```

---

### Task 1: 项目脚手架

**Files:**
- Create: `.gitignore`
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/utils.js`（空文件）
- Create: `js/themes.js`（空文件）
- Create: `js/qrcode.js`（空文件）
- Create: `js/app.js`（空文件）

- [ ] **Step 1: 创建 .gitignore**

```gitignore
.superpowers/
```

- [ ] **Step 2: 创建 index.html 骨架**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QRCode Toolkit</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app">
    <!-- 后续 Task 填充 -->
  </div>
  <script src="https://unpkg.com/awesome-qr@2.1.0/dist/awesome-qr.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/themes.js"></script>
  <script src="js/qrcode.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: 创建 css/style.css 骨架**

```css
/* 主题变量将在 Task 3 填充 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}
```

- [ ] **Step 4: 创建空 JS 文件**

创建 `js/utils.js`、`js/themes.js`、`js/qrcode.js`、`js/app.js`，每个文件头部加一行注释说明用途。

- [ ] **Step 5: 验证项目结构**

在 VS Code 中打开项目，用 Live Server 打开 `index.html`，确认页面空白无报错。

- [ ] **Step 6: 提交**

```bash
git add .gitignore index.html css/style.css js/
git commit -m "feat: 项目脚手架搭建"
```

---

### Task 2: 工具函数模块

**Files:**
- Modify: `js/utils.js`

- [ ] **Step 1: 实现 utils.js**

```js
// js/utils.js

/**
 * 文件转 Data URL
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 触发浏览器下载
 * @param {string} dataURL - Data URL 或 Blob URL
 * @param {string} filename - 下载文件名
 */
function downloadFile(dataURL, filename) {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * 防抖函数
 * @param {Function} fn
 * @param {number} ms - 延迟毫秒数
 * @returns {Function}
 */
function debounce(fn, ms = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}
```

- [ ] **Step 2: 验证**

在浏览器控制台中测试：
- `typeof fileToDataURL` → `"function"`
- `typeof downloadFile` → `"function"`
- `typeof debounce` → `"function"`

- [ ] **Step 3: 提交**

```bash
git add js/utils.js
git commit -m "feat: 添加工具函数模块"
```

---

### Task 3: 主题系统

**Files:**
- Modify: `js/themes.js`
- Modify: `css/style.css`

- [ ] **Step 1: 实现 themes.js**

```js
// js/themes.js

const THEMES = {
  light: {
    name: '极简白',
    vars: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f9fafb',
      '--text-primary': '#111827',
      '--text-secondary': '#6b7280',
      '--border-color': '#e5e7eb',
      '--accent-color': '#3b82f6',
      '--card-bg': '#ffffff',
      '--card-shadow': '0 1px 3px rgba(0,0,0,0.1)',
    }
  },
  dark: {
    name: '暗色主题',
    vars: {
      '--bg-primary': '#1a1a2e',
      '--bg-secondary': '#16213e',
      '--text-primary': '#e2e8f0',
      '--text-secondary': '#94a3b8',
      '--border-color': '#334155',
      '--accent-color': '#60a5fa',
      '--card-bg': '#1e293b',
      '--card-shadow': '0 1px 3px rgba(0,0,0,0.3)',
    }
  },
  gradient: {
    name: '渐变毛玻璃',
    vars: {
      '--bg-primary': 'linear-gradient(135deg, #667eea, #764ba2)',
      '--bg-secondary': 'rgba(255, 255, 255, 0.1)',
      '--text-primary': '#ffffff',
      '--text-secondary': 'rgba(255, 255, 255, 0.8)',
      '--border-color': 'rgba(255, 255, 255, 0.2)',
      '--accent-color': '#a78bfa',
      '--card-bg': 'rgba(255, 255, 255, 0.1)',
      '--card-shadow': '0 4px 30px rgba(0, 0, 0, 0.1)',
    }
  }
};

const THEME_STORAGE_KEY = 'qrcode-toolkit-theme';

/**
 * 应用主题
 * @param {string} themeName - 'light' | 'dark' | 'gradient'
 */
function setTheme(themeName) {
  const theme = THEMES[themeName];
  if (!theme) return;

  const root = document.documentElement;
  root.setAttribute('data-theme', themeName);
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // 渐变主题需要特殊处理 body 背景
  if (themeName === 'gradient') {
    document.body.style.background = theme.vars['--bg-primary'];
  } else {
    document.body.style.background = '';
  }

  localStorage.setItem(THEME_STORAGE_KEY, themeName);
}

/**
 * 获取当前主题名称
 * @returns {string}
 */
function getCurrentTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
}

/**
 * 初始化主题（页面加载时调用）
 */
function initTheme() {
  setTheme(getCurrentTheme());
}
```

- [ ] **Step 2: 添加 CSS 变量默认值**

在 `css/style.css` 顶部添加：

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --accent-color: #3b82f6;
  --card-bg: #ffffff;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  transition: background 0.3s ease, color 0.3s ease;
}
```

- [ ] **Step 3: 在 index.html 中初始化主题**

在 `</body>` 前、`app.js` 之后添加：

```html
<script>
  initTheme();
</script>
```

- [ ] **Step 4: 验证**

用 Live Server 打开，控制台执行：
- `setTheme('dark')` → 背景变深色
- `setTheme('gradient')` → 渐变背景
- `setTheme('light')` → 恢复白色
- 刷新页面后主题保持

- [ ] **Step 5: 提交**

```bash
git add js/themes.js css/style.css index.html
git commit -m "feat: 主题系统实现"
```

---

### Task 4: 二维码生成封装

**Files:**
- Modify: `js/qrcode.js`

- [ ] **Step 1: 实现 qrcode.js**

```js
// js/qrcode.js

/**
 * 生成二维码
 * @param {string} text - 二维码内容
 * @param {Object} options - 配置项
 * @param {string} [options.backgroundImage] - 背景图片 Data URL
 * @param {Object} [options.gradient] - 渐变配置
 * @param {string} [options.gradient.type] - 'linear' | 'radial'
 * @param {Array} [options.gradient.colorStops] - [{offset, color}]
 * @param {number} [options.gradient.direction] - 角度（线性渐变）
 * @param {number} [options.cornerRadius] - 圆角 0-1
 * @param {string} [options.logoImage] - Logo 图片 Data URL
 * @param {string} [options.colorDark] - 前景色
 * @param {string} [options.colorLight] - 背景色
 * @param {number} [options.size] - 尺寸（像素）
 * @returns {Promise<string>} 二维码图片 Data URL
 */
async function generateQR(text, options = {}) {
  const config = {
    text: text,
    size: options.size || 300,
    colorDark: options.colorDark || '#000000',
    colorLight: options.colorLight || '#ffffff',
    correctLevel: AwesomeQR.CorrectLevel.M,
  };

  // 背景图片
  if (options.backgroundImage) {
    config.backgroundImage = options.backgroundImage;
  }

  // 圆角
  if (options.cornerRadius !== undefined) {
    config.cornerRadius = options.cornerRadius;
  }

  // Logo
  if (options.logoImage) {
    config.logoImage = options.logoImage;
    config.logoScale = 0.2;
    config.logoMargin = 4;
    config.logoCornerRadius = 4;
  }

  // 渐变背景：通过 canvas 后处理实现
  const gradientConfig = options.gradient && options.gradient.colorStops ? options.gradient : null;
  if (gradientConfig) {
    config.autoColor = false;
  }

  return new Promise((resolve, reject) => {
    try {
      const qr = new AwesomeQR(config);
      qr.draw().then(canvas => {
        if (gradientConfig) {
          // 在 canvas 上叠加渐变背景
          const ctx = canvas.getContext('2d');
          const w = canvas.width;
          const h = canvas.height;
          let gradient;
          if (gradientConfig.type === 'radial') {
            gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
          } else {
            const dir = (gradientConfig.direction || 135) * Math.PI / 180;
            gradient = ctx.createLinearGradient(
              w/2 - Math.cos(dir) * w/2, h/2 - Math.sin(dir) * h/2,
              w/2 + Math.cos(dir) * w/2, h/2 + Math.sin(dir) * h/2
            );
          }
          gradientConfig.colorStops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
          });
          // 仅在二维码模块区域应用渐变（保留透明区域）
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, w, h);
          ctx.globalCompositeOperation = 'source-over';
        }
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      }).catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}
```

> **awesome-qr 浏览器 API：** 通过 `<script>` 标签引入后全局变量为 `AwesomeQR`，使用 `new AwesomeQR(config).draw()` 返回 Promise<Canvas>，再调用 `canvas.toDataURL()` 获取图片。

- [ ] **Step 2: 验证**

在浏览器控制台测试：

```js
generateQR('https://example.com').then(url => {
  const img = document.createElement('img');
  img.src = url;
  document.body.appendChild(img);
});
```

确认能生成二维码图片。

- [ ] **Step 3: 提交**

```bash
git add js/qrcode.js
git commit -m "feat: 二维码生成封装"
```

---

### Task 5: 页面布局

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

- [ ] **Step 1: 构建 HTML 结构**

```html
<body>
  <header class="header">
    <h1 class="header-title">QRCode Toolkit</h1>
    <div class="header-actions">
      <button class="theme-btn" data-theme="light" title="极简白">
        <span class="theme-icon">☀</span>
      </button>
      <button class="theme-btn" data-theme="dark" title="暗色主题">
        <span class="theme-icon">🌙</span>
      </button>
      <button class="theme-btn" data-theme="gradient" title="渐变毛玻璃">
        <span class="theme-icon">🎨</span>
      </button>
    </div>
  </header>

  <main class="main">
    <aside class="panel">
      <!-- 内容输入区 - Task 6 填充 -->
      <section class="panel-section">
        <h2 class="section-title">内容</h2>
        <div id="content-area"></div>
      </section>

      <!-- 样式设置区 - Task 7 填充 -->
      <section class="panel-section">
        <h2 class="section-title">样式</h2>
        <div id="style-area"></div>
      </section>

      <!-- 导出区 - Task 9 填充 -->
      <section class="panel-section">
        <h2 class="section-title">导出</h2>
        <div id="export-area"></div>
      </section>
    </aside>

    <div class="preview">
      <div class="preview-card">
        <div id="qr-preview" class="qr-container">
          <p class="qr-placeholder">输入内容后自动生成二维码</p>
        </div>
      </div>
    </div>
  </main>

  <!-- 保留 Task 1 中的 script 引入标签 -->
  <script src="https://unpkg.com/awesome-qr@2.1.0/dist/awesome-qr.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/themes.js"></script>
  <script src="js/qrcode.js"></script>
  <script src="js/app.js"></script>
  <script>initTheme();</script>
</body>
```

- [ ] **Step 2: 实现布局 CSS**

```css
/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.theme-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.theme-btn:hover {
  border-color: var(--accent-color);
}

.theme-btn.active {
  border-color: var(--accent-color);
  background: var(--accent-color);
  color: white;
}

/* Main layout */
.main {
  display: flex;
  min-height: calc(100vh - 57px);
}

.panel {
  width: 360px;
  min-width: 360px;
  padding: 20px;
  background: var(--card-bg);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.preview-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 32px;
  box-shadow: var(--card-shadow);
}

.qr-container {
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
}

.qr-container img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}

.qr-placeholder {
  color: var(--text-secondary);
  font-size: 14px;
  text-align: center;
}
```

- [ ] **Step 3: 验证**

用 Live Server 打开，确认：
- 左右分栏布局正确
- Header 显示标题和主题切换按钮
- 右侧预览区居中显示占位文字

- [ ] **Step 4: 提交**

```bash
git add index.html css/style.css
git commit -m "feat: 页面左右分栏布局"
```

---

### Task 6: 内容类型输入

**Files:**
- Modify: `js/app.js`
- Modify: `css/style.css`

- [ ] **Step 1: 实现内容类型切换和输入表单**

在 `app.js` 中：

```js
// js/app.js

const CONTENT_TYPES = [
  { id: 'text', label: '文本', placeholder: '输入文本内容' },
  { id: 'url', label: 'URL', placeholder: 'https://example.com' },
  { id: 'email', label: '邮箱', placeholder: 'user@example.com' },
  { id: 'phone', label: '电话', placeholder: '+86 13800138000' },
  { id: 'wifi', label: 'WiFi', placeholder: '' },
];

let currentContentType = 'text';

/**
 * 初始化内容输入区
 */
function initContentArea() {
  const area = document.getElementById('content-area');

  // 类型切换标签
  const tabs = document.createElement('div');
  tabs.className = 'tabs';
  CONTENT_TYPES.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (type.id === currentContentType ? ' active' : '');
    btn.textContent = type.label;
    btn.dataset.type = type.id;
    btn.addEventListener('click', () => switchContentType(type.id));
    tabs.appendChild(btn);
  });
  area.appendChild(tabs);

  // 输入表单容器
  const formContainer = document.createElement('div');
  formContainer.id = 'input-form';
  area.appendChild(formContainer);

  renderInputForm(currentContentType);
}

/**
 * 切换内容类型
 */
function switchContentType(typeId) {
  currentContentType = typeId;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === typeId);
  });
  renderInputForm(typeId);
  updatePreview();
}

/**
 * 渲染输入表单
 */
function renderInputForm(typeId) {
  const container = document.getElementById('input-form');
  container.innerHTML = '';

  if (typeId === 'wifi') {
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label">SSID（网络名称）</label>
        <input class="form-input" id="wifi-ssid" placeholder="WiFi 名称">
      </div>
      <div class="form-group">
        <label class="form-label">密码</label>
        <input class="form-input" id="wifi-password" type="password" placeholder="WiFi 密码">
      </div>
      <div class="form-group">
        <label class="form-label">加密类型</label>
        <select class="form-select" id="wifi-encryption">
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">无密码</option>
        </select>
      </div>
    `;
  } else {
    const type = CONTENT_TYPES.find(t => t.id === typeId);
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label">${type.label}</label>
        <input class="form-input" id="text-input" placeholder="${type.placeholder}">
      </div>
    `;
  }
}

/**
 * 获取当前输入的内容文本
 */
function getInputText() {
  if (currentContentType === 'wifi') {
    const ssid = document.getElementById('wifi-ssid')?.value || '';
    const password = document.getElementById('wifi-password')?.value || '';
    const encryption = document.getElementById('wifi-encryption')?.value || 'WPA';
    if (!ssid) return '';
    return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
  }
  return document.getElementById('text-input')?.value || '';
}
```

- [ ] **Step 2: 添加表单样式**

在 `css/style.css` 中添加：

```css
/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: var(--accent-color);
}

.tab-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

/* Form elements */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input,
.form-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--accent-color);
}
```

- [ ] **Step 3: 验证**

用 Live Server 打开，确认：
- 5 个内容类型标签可点击切换
- 文本/URL/邮箱/电话显示单行输入框
- WiFi 显示 3 个字段（SSID、密码、加密类型）

- [ ] **Step 4: 提交**

```bash
git add js/app.js css/style.css
git commit -m "feat: 内容类型输入切换"
```

---

### Task 7: 样式控制面板

**Files:**
- Modify: `js/app.js`
- Modify: `css/style.css`

- [ ] **Step 1: 实现样式控制 UI**

在 `app.js` 中添加：

```js
let currentOptions = {
  backgroundImage: null,
  gradient: null,
  cornerRadius: 0,
  logoImage: null,
  colorDark: '#000000',
  colorLight: '#ffffff',
};

function initStyleArea() {
  const area = document.getElementById('style-area');
  area.innerHTML = `
    <div class="form-group">
      <label class="form-label">前景色</label>
      <div class="color-input-wrap">
        <input type="color" id="color-dark" class="color-input" value="#000000">
        <span class="color-value" id="color-dark-value">#000000</span>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">背景色</label>
      <div class="color-input-wrap">
        <input type="color" id="color-light" class="color-input" value="#ffffff">
        <span class="color-value" id="color-light-value">#ffffff</span>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">圆角 (<span id="radius-value">0</span>%)</label>
      <input type="range" id="corner-radius" class="range-input" min="0" max="100" value="0">
    </div>

    <div class="form-group">
      <label class="form-label">背景图片</label>
      <div class="file-upload">
        <input type="file" id="bg-image" accept="image/*" class="file-input">
        <button class="file-btn" id="bg-image-btn">选择图片</button>
        <button class="file-btn file-btn-clear" id="bg-image-clear" style="display:none">清除</button>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">渐变背景</label>
      <div class="gradient-controls">
        <select id="gradient-type" class="form-select">
          <option value="">无</option>
          <option value="linear">线性渐变</option>
          <option value="radial">径向渐变</option>
        </select>
        <div id="gradient-options" style="display:none">
          <div class="gradient-stop">
            <input type="color" id="gradient-color1" class="color-input" value="#667eea">
            <input type="color" id="gradient-color2" class="color-input" value="#764ba2">
          </div>
          <div id="gradient-direction-wrap">
            <label class="form-label">方向 (<span id="gradient-dir-value">135</span>°)</label>
            <input type="range" id="gradient-direction" class="range-input" min="0" max="360" value="135">
          </div>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Logo 图片</label>
      <div class="file-upload">
        <input type="file" id="logo-image" accept="image/*" class="file-input">
        <button class="file-btn" id="logo-image-btn">选择图片</button>
        <button class="file-btn file-btn-clear" id="logo-image-clear" style="display:none">清除</button>
      </div>
    </div>
  `;

  bindStyleEvents();
}

function bindStyleEvents() {
  // 前景色
  document.getElementById('color-dark').addEventListener('input', (e) => {
    currentOptions.colorDark = e.target.value;
    document.getElementById('color-dark-value').textContent = e.target.value;
  });

  // 背景色
  document.getElementById('color-light').addEventListener('input', (e) => {
    currentOptions.colorLight = e.target.value;
    document.getElementById('color-light-value').textContent = e.target.value;
  });

  // 圆角
  document.getElementById('corner-radius').addEventListener('input', (e) => {
    currentOptions.cornerRadius = parseInt(e.target.value) / 100;
    document.getElementById('radius-value').textContent = e.target.value;
  });

  // 背景图片
  document.getElementById('bg-image').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      currentOptions.backgroundImage = await fileToDataURL(file);
      document.getElementById('bg-image-clear').style.display = '';
      updatePreview();
    }
  });
  document.getElementById('bg-image-btn').addEventListener('click', () => {
    document.getElementById('bg-image').click();
  });
  document.getElementById('bg-image-clear').addEventListener('click', () => {
    currentOptions.backgroundImage = null;
    document.getElementById('bg-image').value = '';
    document.getElementById('bg-image-clear').style.display = 'none';
    updatePreview();
  });

  // 渐变
  document.getElementById('gradient-type').addEventListener('change', (e) => {
    const type = e.target.value;
    document.getElementById('gradient-options').style.display = type ? '' : 'none';
    document.getElementById('gradient-direction-wrap').style.display = type === 'linear' ? '' : 'none';
    if (type) {
      currentOptions.gradient = {
        type,
        colorStops: [
          { offset: 0, color: document.getElementById('gradient-color1').value },
          { offset: 1, color: document.getElementById('gradient-color2').value },
        ],
        direction: parseInt(document.getElementById('gradient-direction').value),
      };
    } else {
      currentOptions.gradient = null;
    }
    updatePreview();
  });

  document.getElementById('gradient-color1').addEventListener('input', (e) => {
    if (currentOptions.gradient) {
      currentOptions.gradient.colorStops[0].color = e.target.value;
      updatePreview();
    }
  });

  document.getElementById('gradient-color2').addEventListener('input', (e) => {
    if (currentOptions.gradient) {
      currentOptions.gradient.colorStops[1].color = e.target.value;
      updatePreview();
    }
  });

  document.getElementById('gradient-direction').addEventListener('input', (e) => {
    document.getElementById('gradient-dir-value').textContent = e.target.value;
    if (currentOptions.gradient) {
      currentOptions.gradient.direction = parseInt(e.target.value);
      updatePreview();
    }
  });

  // Logo
  document.getElementById('logo-image').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      currentOptions.logoImage = await fileToDataURL(file);
      document.getElementById('logo-image-clear').style.display = '';
      updatePreview();
    }
  });
  document.getElementById('logo-image-btn').addEventListener('click', () => {
    document.getElementById('logo-image').click();
  });
  document.getElementById('logo-image-clear').addEventListener('click', () => {
    currentOptions.logoImage = null;
    document.getElementById('logo-image').value = '';
    document.getElementById('logo-image-clear').style.display = 'none';
    updatePreview();
  });
}
```

- [ ] **Step 2: 添加样式控制 CSS**

```css
/* Color input */
.color-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.color-value {
  font-size: 13px;
  font-family: monospace;
  color: var(--text-secondary);
}

/* Range input */
.range-input {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border-color);
  border-radius: 3px;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent-color);
  border-radius: 50%;
  cursor: pointer;
}

/* File upload */
.file-upload {
  display: flex;
  gap: 8px;
}

.file-input {
  display: none;
}

.file-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-btn:hover {
  border-color: var(--accent-color);
}

.file-btn-clear {
  color: #ef4444;
  border-color: #fecaca;
}

.file-btn-clear:hover {
  background: #fef2f2;
}

/* Gradient controls */
.gradient-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gradient-stop {
  display: flex;
  gap: 8px;
}
```

- [ ] **Step 3: 验证**

用 Live Server 打开，确认：
- 颜色选择器可正常选择前景色/背景色
- 圆角滑块可拖动
- 背景图片/Logo 可上传和清除
- 渐变类型切换正常，颜色和方向可调

- [ ] **Step 4: 提交**

```bash
git add js/app.js css/style.css
git commit -m "feat: 样式控制面板"
```

---

### Task 8: 实时预览

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 实现预览更新逻辑**

在 `app.js` 中添加：

```js
const debouncedUpdate = debounce(updatePreview, 300);

async function updatePreview() {
  const text = getInputText();
  const previewEl = document.getElementById('qr-preview');

  if (!text) {
    previewEl.innerHTML = '<p class="qr-placeholder">输入内容后自动生成二维码</p>';
    return;
  }

  try {
    const dataURL = await generateQR(text, currentOptions);
    previewEl.innerHTML = `<img src="${dataURL}" alt="QR Code">`;
  } catch (err) {
    previewEl.innerHTML = `<p class="qr-placeholder" style="color:#ef4444">生成失败: ${err.message}</p>`;
  }
}

function initPreview() {
  // 监听所有输入变化
  document.getElementById('content-area').addEventListener('input', debouncedUpdate);
  document.getElementById('style-area').addEventListener('input', debouncedUpdate);
  document.getElementById('style-area').addEventListener('change', debouncedUpdate);
}
```

- [ ] **Step 2: 在初始化中串联**

在 `app.js` 底部添加初始化函数：

```js
function init() {
  initContentArea();
  initStyleArea();
  initPreview();
  initThemeButtons();
}

function initThemeButtons() {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.theme);
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  // 标记当前主题按钮
  const current = getCurrentTheme();
  document.querySelector(`.theme-btn[data-theme="${current}"]`)?.classList.add('active');
}

document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Step 3: 验证**

用 Live Server 打开，确认：
- 输入文本后 300ms 内自动生成二维码
- 修改任何样式参数后预览立即更新
- 清空输入后预览恢复占位文字

- [ ] **Step 4: 提交**

```bash
git add js/app.js
git commit -m "feat: 实时预览功能"
```

---

### Task 9: 导出功能

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 实现导出区**

在 `app.js` 中添加：

```js
function initExportArea() {
  const area = document.getElementById('export-area');
  area.innerHTML = `
    <div class="export-buttons">
      <button class="export-btn" data-format="png">导出 PNG</button>
      <button class="export-btn" data-format="jpg">导出 JPG</button>
      <button class="export-btn" data-format="svg">导出 SVG</button>
    </div>
  `;

  area.addEventListener('click', async (e) => {
    const btn = e.target.closest('.export-btn');
    if (!btn) return;

    const format = btn.dataset.format;
    const text = getInputText();
    if (!text) return;

    try {
      const dataURL = await generateQR(text, currentOptions);

      if (format === 'svg') {
        // 将 canvas 结果嵌入 SVG 包装器
        const svgDataURL = canvasToSVG(dataURL, 300, 300);
        downloadFile(svgDataURL, 'qrcode.svg');
      } else if (format === 'jpg') {
        // 转为 JPG（白色背景）
        const jpgDataURL = await convertToJPG(dataURL);
        downloadFile(jpgDataURL, 'qrcode.jpg');
      } else {
        downloadFile(dataURL, 'qrcode.png');
      }
    } catch (err) {
      alert('导出失败: ' + err.message);
    }
  });
}

function canvasToSVG(pngDataURL, width, height) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <image href="${pngDataURL}" width="${width}" height="${height}"/>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

function convertToJPG(pngDataURL) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 300);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = pngDataURL;
  });
}
```

- [ ] **Step 2: 添加导出按钮样式**

```css
.export-buttons {
  display: flex;
  gap: 8px;
}

.export-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--accent-color);
  border-radius: 6px;
  background: transparent;
  color: var(--accent-color);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover {
  background: var(--accent-color);
  color: white;
}
```

- [ ] **Step 3: 在 init() 中添加 initExportArea()**

```js
function init() {
  initContentArea();
  initStyleArea();
  initExportArea();
  initPreview();
  initThemeButtons();
}
```

- [ ] **Step 4: 验证**

用 Live Server 打开，确认：
- 输入内容生成二维码后，点击导出按钮可下载
- PNG/JPG/SVG 三种格式都能正常下载和打开

- [ ] **Step 5: 提交**

```bash
git add js/app.js css/style.css
git commit -m "feat: 导出功能（PNG/JPG/SVG）"
```

---

### Task 10: 收尾打磨

**Files:**
- Modify: `css/style.css`
- Modify: `index.html`
- Modify: `CLAUDE.md`

- [ ] **Step 1: 添加响应式适配**

```css
@media (max-width: 768px) {
  .main {
    flex-direction: column;
  }

  .panel {
    width: 100%;
    min-width: unset;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .preview {
    padding: 20px;
  }
}
```

- [ ] **Step 2: 渐变主题特殊样式**

```css
[data-theme="gradient"] .panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

[data-theme="gradient"] .preview-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}
```

- [ ] **Step 3: 更新 CLAUDE.md**

更新 CLAUDE.md 添加构建/运行命令。

- [ ] **Step 4: 完整功能测试**

用 Live Server 打开，测试所有功能：
- 5 种内容类型切换和输入
- 前景色/背景色修改
- 圆角滑块
- 背景图片上传/清除
- 渐变背景配置
- Logo 上传/清除
- 实时预览
- 3 种格式导出
- 3 种主题切换 + 刷新保持
- 移动端响应式

- [ ] **Step 5: 最终提交**

```bash
git add -A
git commit -m "feat: 响应式适配和主题打磨"
```
