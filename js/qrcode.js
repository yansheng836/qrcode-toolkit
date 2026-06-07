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
 * @param {boolean} [options.style3d] - 3D 立体效果
 * @param {string} [options.logoImage] - Logo 图片 Data URL
 * @param {string} [options.colorDark] - 前景色
 * @param {string} [options.colorLight] - 背景色
 * @param {number} [options.size] - 尺寸（像素）
 * @returns {Promise<string>} 二维码图片 Data URL
 */
async function generateQR(text, options = {}) {
  const size = options.size || 300;
  const colorDark = options.colorDark || '#000000';
  const colorLight = options.colorLight || '#ffffff';
  const margin = 2;

  // 创建 QR 码数据
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cellSize = size / (moduleCount + margin * 2);

  // 创建 canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 绘制背景
  if (options.backgroundImage) {
    const bgImg = await loadImage(options.backgroundImage);
    ctx.drawImage(bgImg, 0, 0, size, size);
    // 轻微遮罩，让背景图可见
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.fillStyle = colorLight;
    ctx.fillRect(0, 0, size, size);
  }

  // 准备前景填充样式（渐变或纯色）
  const cornerRadius = options.cornerRadius || 0;
  const dotSize = cellSize * (1 - cornerRadius * 0.5);
  const hasBgImage = !!options.backgroundImage;
  let foregroundFill = colorDark;

  if (options.gradient && options.gradient.colorStops) {
    const gradientConfig = options.gradient;
    let gradient;
    if (gradientConfig.type === 'radial') {
      gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    } else {
      const dir = (gradientConfig.direction || 135) * Math.PI / 180;
      gradient = ctx.createLinearGradient(
        size/2 - Math.cos(dir) * size/2, size/2 - Math.sin(dir) * size/2,
        size/2 + Math.cos(dir) * size/2, size/2 + Math.sin(dir) * size/2
      );
    }
    gradientConfig.colorStops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color);
    });
    foregroundFill = gradient;
  }

  // 绘制 QR 码模块
  const style3d = options.style3d || false;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        const x = (col + margin) * cellSize;
        const y = (row + margin) * cellSize;
        const centerX = x + dotSize / 2;
        const centerY = y + dotSize / 2;
        const radius = dotSize / 2;

        // 有背景图时，给每个模块加白色底衬增加对比度
        if (hasBgImage) {
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          if (style3d || cornerRadius >= 0.8) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
          } else if (cornerRadius > 0) {
            drawRoundedRect(ctx, x, y, dotSize, dotSize, cornerRadius * cellSize * 0.3, 'rgba(255,255,255,0.6)');
          } else {
            ctx.fillRect(x, y, dotSize, dotSize);
          }
        }

        if (style3d) {
          // 3D 立体效果：球体 + 高光
          draw3dDot(ctx, centerX, centerY, radius, colorDark, options.gradient);
        } else if (cornerRadius >= 0.8) {
          // 圆点模式
          ctx.fillStyle = foregroundFill;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (cornerRadius > 0) {
          drawRoundedRect(ctx, x, y, dotSize, dotSize, cornerRadius * cellSize * 0.3, foregroundFill);
        } else {
          ctx.fillStyle = foregroundFill;
          ctx.fillRect(x, y, dotSize, dotSize);
        }
      }
    }
  }

  // Logo
  if (options.logoImage) {
    const logoImg = await loadImage(options.logoImage);
    const logoSize = size * 0.2;
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;
    const logoPadding = 4;

    // Logo 背景
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    drawRoundedRectPath(ctx, logoX - logoPadding, logoY - logoPadding, logoSize + logoPadding * 2, logoSize + logoPadding * 2, 4);
    ctx.fill();

    // Logo 图片
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
  }

  return canvas.toDataURL('image/png');
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function draw3dDot(ctx, cx, cy, radius, baseColor, gradientConfig) {
  const r = radius * 0.9;

  // 底部阴影
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = r * 0.4;
  ctx.shadowOffsetX = r * 0.15;
  ctx.shadowOffsetY = r * 0.15;

  // 球体渐变（从左上高光到右下暗部）
  const sphereGrad = ctx.createRadialGradient(
    cx - r * 0.3, cy - r * 0.3, r * 0.1,
    cx, cy, r
  );

  if (gradientConfig && gradientConfig.colorStops && gradientConfig.colorStops.length >= 2) {
    // 使用用户选择的渐变色作为基础
    const c1 = gradientConfig.colorStops[0].color;
    const c2 = gradientConfig.colorStops[1].color;
    sphereGrad.addColorStop(0, lightenColor(c1, 60));
    sphereGrad.addColorStop(0.5, c1);
    sphereGrad.addColorStop(1, c2);
  } else {
    // 默认：基于 baseColor 生成立体渐变
    sphereGrad.addColorStop(0, lightenColor(baseColor, 80));
    sphereGrad.addColorStop(0.4, baseColor);
    sphereGrad.addColorStop(1, darkenColor(baseColor, 40));
  }

  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 高光点
  const highlightGrad = ctx.createRadialGradient(
    cx - r * 0.25, cy - r * 0.25, 0,
    cx - r * 0.25, cy - r * 0.25, r * 0.5
  );
  highlightGrad.addColorStop(0, 'rgba(255,255,255,0.7)');
  highlightGrad.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0x0000FF) + Math.round(2.55 * percent));
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(2.55 * percent));
  return `rgb(${r},${g},${b})`;
}

function drawRoundedRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  drawRoundedRectPath(ctx, x, y, w, h, r);
  ctx.fill();
}

function drawRoundedRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
