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
