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
  const depth3d = cellSize * 0.4;

  if (style3d) {
    draw3dQR(ctx, qr, moduleCount, margin, cellSize, dotSize, colorDark, options.gradient, depth3d, hasBgImage);
  } else {
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          const x = (col + margin) * cellSize;
          const y = (row + margin) * cellSize;
          const centerX = x + dotSize / 2;
          const centerY = y + dotSize / 2;
          const radius = dotSize / 2;

          if (hasBgImage) {
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            if (cornerRadius >= 0.8) {
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
              ctx.fill();
            } else if (cornerRadius > 0) {
              drawRoundedRect(ctx, x, y, dotSize, dotSize, cornerRadius * cellSize * 0.3, 'rgba(255,255,255,0.6)');
            } else {
              ctx.fillRect(x, y, dotSize, dotSize);
            }
          }

          if (cornerRadius >= 0.8) {
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

function draw3dQR(ctx, qr, moduleCount, margin, cellSize, dotSize, baseColor, gradientConfig, depth, hasBgImage) {
  // 获取主色
  let topColor = baseColor;
  if (gradientConfig && gradientConfig.colorStops && gradientConfig.colorStops.length >= 2) {
    topColor = gradientConfig.colorStops[0].color;
  }
  const rgb = hexToRgb(topColor);

  // 侧面颜色（4个方向不同亮度模拟光照）
  const sideBottom = adjustBrightness(rgb, -60);
  const sideRight = adjustBrightness(rgb, -40);
  const sideTop = adjustBrightness(rgb, -15);
  const sideLeft = adjustBrightness(rgb, -50);
  const topLight = adjustBrightness(rgb, 20);
  const topMid = adjustBrightness(rgb, -10);

  // 阴影偏移
  const sx = depth * 1.0;
  const sy = depth * 1.0;

  // 第一步：用 ctx.shadowBlur 绘制整体统一阴影
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = depth * 1.5;
  ctx.shadowOffsetX = sx;
  ctx.shadowOffsetY = sy;
  ctx.fillStyle = topColor;
  ctx.beginPath();
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        const x = (col + margin) * cellSize;
        const y = (row + margin) * cellSize;
        ctx.rect(x, y, dotSize, dotSize);
      }
    }
  }
  ctx.fill();
  ctx.restore();

  // 第二步：绘制所有侧面（先侧面后顶面，画家算法）
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qr.isDark(row, col)) continue;
      const x = (col + margin) * cellSize;
      const y = (row + margin) * cellSize;
      const hasLeft = col > 0 && qr.isDark(row, col - 1);
      const hasRight = col < moduleCount - 1 && qr.isDark(row, col + 1);
      const hasTop = row > 0 && qr.isDark(row - 1, col);
      const hasBottom = row < moduleCount - 1 && qr.isDark(row + 1, col);

      // 底面（最暗）
      if (!hasBottom) {
        const grad = ctx.createLinearGradient(x, y + dotSize, x, y + dotSize + sy);
        grad.addColorStop(0, `rgb(${sideBottom[0]},${sideBottom[1]},${sideBottom[2]})`);
        grad.addColorStop(1, `rgb(${adjustBrightness(rgb, -80).join(',')})`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x, y + dotSize);
        ctx.lineTo(x + dotSize, y + dotSize);
        ctx.lineTo(x + dotSize + sx, y + dotSize + sy);
        ctx.lineTo(x + sx, y + dotSize + sy);
        ctx.closePath();
        ctx.fill();
      }

      // 右面（中等暗）
      if (!hasRight) {
        const grad = ctx.createLinearGradient(x + dotSize, y, x + dotSize + sx, y);
        grad.addColorStop(0, `rgb(${sideRight[0]},${sideRight[1]},${sideRight[2]})`);
        grad.addColorStop(1, `rgb(${adjustBrightness(rgb, -65).join(',')})`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x + dotSize, y);
        ctx.lineTo(x + dotSize + sx, y + sy);
        ctx.lineTo(x + dotSize + sx, y + dotSize + sy);
        ctx.lineTo(x + dotSize, y + dotSize);
        ctx.closePath();
        ctx.fill();
      }

      // 顶面（较亮，光照面）
      if (!hasTop) {
        ctx.fillStyle = `rgb(${sideTop[0]},${sideTop[1]},${sideTop[2]})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dotSize, y);
        ctx.lineTo(x + dotSize + sx, y + sy);
        ctx.lineTo(x + sx, y + sy);
        ctx.closePath();
        ctx.fill();
      }

      // 左面（较暗）
      if (!hasLeft) {
        ctx.fillStyle = `rgb(${sideLeft[0]},${sideLeft[1]},${sideLeft[2]})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + sx, y + sy);
        ctx.lineTo(x + sx, y + dotSize + sy);
        ctx.lineTo(x, y + dotSize);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // 第三步：绘制所有顶面（覆盖在侧面之上）
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qr.isDark(row, col)) continue;
      const x = (col + margin) * cellSize;
      const y = (row + margin) * cellSize;

      // 背景图白色底衬
      if (hasBgImage) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(x, y, dotSize, dotSize);
      }

      // 顶面渐变（左上亮，右下暗）
      const topGrad = ctx.createLinearGradient(x, y, x + dotSize, y + dotSize);
      topGrad.addColorStop(0, `rgb(${topLight[0]},${topLight[1]},${topLight[2]})`);
      topGrad.addColorStop(0.5, topColor);
      topGrad.addColorStop(1, `rgb(${topMid[0]},${topMid[1]},${topMid[2]})`);
      ctx.fillStyle = topGrad;
      ctx.fillRect(x, y, dotSize, dotSize);

      // 高光（左上角）
      const hl = ctx.createLinearGradient(x, y, x + dotSize * 0.6, y + dotSize * 0.6);
      hl.addColorStop(0, 'rgba(255,255,255,0.18)');
      hl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hl;
      ctx.fillRect(x, y, dotSize, dotSize);

      // 顶面边缘描边（增强立体感）
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x + 0.25, y + 0.25, dotSize - 0.5, dotSize - 0.5);
    }
  }
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
