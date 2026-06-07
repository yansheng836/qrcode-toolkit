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
