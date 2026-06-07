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
