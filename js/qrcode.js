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
  const depth3d = cellSize * 0.35;
  const shadowDir = { x: 1.2, y: 1.2 };

  // 3D 模式：先绘制整体阴影，再绘制方块和侧面
  if (style3d) {
    drawUnifiedShadow(ctx, qr, moduleCount, margin, cellSize, dotSize, colorDark, shadowDir, depth3d);
  }

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
          if (style3d) {
            ctx.fillRect(x, y, dotSize, dotSize);
          } else if (cornerRadius >= 0.8) {
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
          draw3dBlock(ctx, x, y, dotSize, colorDark, options.gradient, qr, moduleCount, row, col, shadowDir, depth3d);
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

function drawUnifiedShadow(ctx, qr, moduleCount, margin, cellSize, dotSize, baseColor, shadowDir, depth) {
  // 用临时 canvas 绘制整体阴影形状
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = w;
  tmpCanvas.height = h;
  const tmpCtx = tmpCanvas.getContext('2d');

  // 绘制所有暗色模块的并集（偏移到阴影方向）
  const sx = shadowDir.x * depth;
  const sy = shadowDir.y * depth;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        const x = (col + margin) * cellSize + sx;
        const y = (row + margin) * cellSize + sy;
        tmpCtx.fillRect(x, y, dotSize, dotSize);
      }
    }
  }

  // 模糊后以半透明黑色绘制
  tmpCtx.filter = 'blur(2px)';
  tmpCtx.drawImage(tmpCanvas, 0, 0);
  tmpCtx.filter = 'none';

  ctx.globalAlpha = 0.3;
  ctx.drawImage(tmpCanvas, 0, 0);
  ctx.globalAlpha = 1;
}

function draw3dBlock(ctx, x, y, size, baseColor, gradientConfig, qr, moduleCount, row, col, shadowDir, depth) {
  // 获取颜色
  let topColor = baseColor;
  if (gradientConfig && gradientConfig.colorStops && gradientConfig.colorStops.length >= 2) {
    topColor = gradientConfig.colorStops[0].color;
  }

  const rgb = hexToRgb(topColor);
  const sideColor = adjustBrightness(rgb, -40);
  const sideDarkColor = adjustBrightness(rgb, -70);
  const topLight = adjustBrightness(rgb, 20);
  const topMid = adjustBrightness(rgb, -10);

  const sx = shadowDir.x * depth;
  const sy = shadowDir.y * depth;

  // 绘制暴露边缘的侧面（整个图形的轮廓边缘）
  const hasLeft = col > 0 && qr.isDark(row, col - 1);
  const hasRight = col < moduleCount - 1 && qr.isDark(row, col + 1);
  const hasTop = row > 0 && qr.isDark(row - 1, col);
  const hasBottom = row < moduleCount - 1 && qr.isDark(row + 1, col);

  if (!hasBottom) {
    ctx.fillStyle = sideDarkColor;
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.lineTo(x + size + sx, y + size + sy);
    ctx.lineTo(x + sx, y + size + sy);
    ctx.closePath();
    ctx.fill();
  }

  if (!hasRight) {
    ctx.fillStyle = sideColor;
    ctx.beginPath();
    ctx.moveTo(x + size, y);
    ctx.lineTo(x + size + sx, y + sy);
    ctx.lineTo(x + size + sx, y + size + sy);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.fill();
  }

  if (!hasTop) {
    ctx.fillStyle = adjustBrightness(rgb, -20);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size + sx, y + sy);
    ctx.lineTo(x + sx, y + sy);
    ctx.closePath();
    ctx.fill();
  }

  if (!hasLeft) {
    ctx.fillStyle = adjustBrightness(rgb, -50);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + sx, y + sy);
    ctx.lineTo(x + sx, y + size + sy);
    ctx.lineTo(x, y + size);
    ctx.closePath();
    ctx.fill();
  }

  // 绘制顶面
  const topGrad = ctx.createLinearGradient(x, y, x + size, y + size);
  topGrad.addColorStop(0, `rgb(${topLight[0]},${topLight[1]},${topLight[2]})`);
  topGrad.addColorStop(0.5, topColor);
  topGrad.addColorStop(1, `rgb(${topMid[0]},${topMid[1]},${topMid[2]})`);
  ctx.fillStyle = topGrad;
  ctx.fillRect(x, y, size, size);

  // 顶面高光
  const highlightGrad = ctx.createLinearGradient(x, y, x + size * 0.5, y + size * 0.5);
  highlightGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
  highlightGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = highlightGrad;
  ctx.fillRect(x, y, size, size);
}

function hexToRgb(hex) {
  const num = parseInt(hex.replace('#', ''), 16);
  return [(num >> 16) & 0xFF, (num >> 8) & 0xFF, num & 0xFF];
}

function adjustBrightness(rgb, amount) {
  return [
    Math.max(0, Math.min(255, Math.round(rgb[0] + amount))),
    Math.max(0, Math.min(255, Math.round(rgb[1] + amount))),
    Math.max(0, Math.min(255, Math.round(rgb[2] + amount))),
  ];
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
