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
          if (cornerRadius >= 0.8) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
          } else if (cornerRadius > 0 && !style3d) {
            drawRoundedRect(ctx, x, y, dotSize, dotSize, cornerRadius * cellSize * 0.3, 'rgba(255,255,255,0.6)');
          } else {
            ctx.fillRect(x, y, dotSize, dotSize);
          }
        }

        if (style3d) {
          // 3D 立体方块效果
          draw3dBlock(ctx, x, y, dotSize, colorDark, options.gradient);
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

function draw3dBlock(ctx, x, y, size, baseColor, gradientConfig) {
  // 3D 方块参数
  const depth = size * 0.25; // 侧面深度
  const gap = size * 0.05;   // 方块间距

  // 实际绘制尺寸（留出间距）
  const w = size - gap;
  const h = size - gap;

  // 获取颜色
  let topColor = baseColor;
  let sideColor, sideDarkColor;

  if (gradientConfig && gradientConfig.colorStops && gradientConfig.colorStops.length >= 2) {
    topColor = gradientConfig.colorStops[0].color;
    sideColor = darkenColor(topColor, 25);
    sideDarkColor = darkenColor(topColor, 45);
  } else {
    sideColor = darkenColor(baseColor, 25);
    sideDarkColor = darkenColor(baseColor, 45);
  }

  const bx = x + gap / 2;
  const by = y + gap / 2;

  // 1. 绘制底部阴影（投影）
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.moveTo(bx + depth + 2, by + h + 2);
  ctx.lineTo(bx + w + 2, by + h + 2);
  ctx.lineTo(bx + w + 2, by + h - depth + 2);
  ctx.lineTo(bx + w - depth + 2, by + h + 2);
  ctx.closePath();
  ctx.fill();

  // 2. 绘制右侧面（中等深度）
  ctx.fillStyle = sideColor;
  ctx.beginPath();
  ctx.moveTo(bx + w, by + depth);
  ctx.lineTo(bx + w, by + h);
  ctx.lineTo(bx + w - depth, by + h);
  ctx.lineTo(bx + w - depth, by + depth + depth);
  ctx.closePath();
  ctx.fill();

  // 3. 绘制底侧面（最深）
  ctx.fillStyle = sideDarkColor;
  ctx.beginPath();
  ctx.moveTo(bx + depth, by + h);
  ctx.lineTo(bx + w - depth, by + h);
  ctx.lineTo(bx + w, by + h - depth);
  ctx.lineTo(bx + depth + depth, by + h - depth);
  ctx.closePath();
  ctx.fill();

  // 4. 绘制顶面（主色 + 高光渐变）
  const topGrad = ctx.createLinearGradient(bx, by, bx + w, by + h);
  topGrad.addColorStop(0, lightenColor(topColor, 20));
  topGrad.addColorStop(0.5, topColor);
  topGrad.addColorStop(1, darkenColor(topColor, 10));

  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + w, by);
  ctx.lineTo(bx + w, by + h - depth);
  ctx.lineTo(bx + w - depth, by + h);
  ctx.lineTo(bx + depth, by + h);
  ctx.lineTo(bx, by + h - depth);
  ctx.closePath();
  ctx.fill();

  // 5. 顶面高光（左上角亮光）
  const highlightGrad = ctx.createLinearGradient(bx, by, bx + w * 0.5, by + h * 0.5);
  highlightGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
  highlightGrad.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + w, by);
  ctx.lineTo(bx + w, by + h - depth);
  ctx.lineTo(bx + w - depth, by + h);
  ctx.lineTo(bx + depth, by + h);
  ctx.lineTo(bx, by + h - depth);
  ctx.closePath();
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
