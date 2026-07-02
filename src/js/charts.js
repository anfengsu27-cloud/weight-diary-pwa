/**
 * 图表模块
 * 纯 Canvas 绘制，无外部依赖
 */
const Charts = {
  _dpr: Math.min(window.devicePixelRatio || 1, 2),

  /** 绘制体重趋势图 */
  drawWeightChart(canvas, data, period) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.parentElement.getBoundingClientRect();
    const W = rect.width;
    const H = 220;
    canvas.width = W * this._dpr;
    canvas.height = H * this._dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(this._dpr, this._dpr);

    const pad = { top: 20, right: 16, bottom: 36, left: 48 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    if (!data || data.length < 1) {
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("暂无体重数据", W / 2, H / 2);
      return;
    }

    // 限制数据范围
    const now = new Date();
    const cutoff = new Date(now);
    if (period === "7d") cutoff.setDate(now.getDate() - 7);
    else if (period === "30d") cutoff.setDate(now.getDate() - 30);
    else cutoff.setFullYear(now.getFullYear() - 5);

    const dayMinMap = {};
    data.filter((d) => new Date(d.date) >= cutoff).forEach((d) => {
      if (!dayMinMap[d.date] || d.weight < dayMinMap[d.date].weight) {
        dayMinMap[d.date] = { date: d.date, weight: d.weight };
      }
    });
    const filtered = Object.values(dayMinMap).sort((a, b) => a.date.localeCompare(b.date));

    if (filtered.length < 1) {
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("该时间段无数据", W / 2, H / 2);
      return;
    }

    const weights = filtered.map((d) => d.weight);
    const minW = Math.floor(Math.min(...weights) - 1);
    const maxW = Math.ceil(Math.max(...weights) + 1);
    const range = maxW - minW || 1;

    // 网格线
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch * i) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText((maxW - (range * i) / 4).toFixed(1), pad.left - 6, y + 4);
    }

    // 数据点
    const xStep = cw / Math.max(filtered.length - 1, 1);
    const points = filtered.map((d, i) => ({
      x: pad.left + i * xStep,
      y: pad.top + ch - ((d.weight - minW) / range) * ch
    }));

    // 填充渐变区域
    const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
    grad.addColorStop(0, "rgba(0, 191, 166, 0.2)");
    grad.addColorStop(1, "rgba(0, 191, 166, 0.01)");
    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.top + ch);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // 折线
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = "#00BFA6";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // 圆点和数值
    points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#00BFA6";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 191, 166, 0.25)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#1A1A2E";
      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(filtered[i].weight.toFixed(1), p.x, p.y - 10);
    });

    // 日期标签（最多显示 6 个）
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "center";
    const labelCount = Math.min(filtered.length, 6);
    const labelStep = filtered.length / labelCount;
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.round(i * labelStep);
      if (idx < filtered.length) {
        const d = filtered[idx].date.slice(5);
        ctx.fillText(d, points[idx].x, H - 8);
      }
    }
  },

  /** 绘制运动热量柱状图 */
  drawCalorieChart(canvas, exercises, period) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.parentElement.getBoundingClientRect();
    const W = rect.width;
    const H = 200;
    canvas.width = W * this._dpr;
    canvas.height = H * this._dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(this._dpr, this._dpr);

    const pad = { top: 20, right: 16, bottom: 36, left: 48 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    if (!exercises || exercises.length < 1) {
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("暂无运动数据", W / 2, H / 2);
      return;
    }

    // 按天聚合
    const now = new Date();
    const cutoff = new Date(now);
    if (period === "7d") cutoff.setDate(now.getDate() - 7);
    else if (period === "30d") cutoff.setDate(now.getDate() - 30);
    else cutoff.setFullYear(now.getFullYear() - 5);

    const dayMap = {};
    exercises
      .filter((e) => new Date(e.date) >= cutoff)
      .forEach((e) => {
        dayMap[e.date] = (dayMap[e.date] || 0) + e.calories;
      });

    const days = Object.keys(dayMap).sort();
    if (days.length < 1) {
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("该时间段无数据", W / 2, H / 2);
      return;
    }

    const maxCal = Math.max(...Object.values(dayMap), 100);

    // 网格线
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = pad.top + (ch * i) / 3;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(maxCal - (maxCal * i) / 3), pad.left - 6, y + 4);
    }

    const xStep = cw / Math.max(days.length - 1, 1);
    const points = days.map((date, i) => ({
      date,
      val: dayMap[date],
      x: pad.left + i * xStep,
      y: pad.top + ch - (dayMap[date] / maxCal) * ch
    }));

    const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
    grad.addColorStop(0, "rgba(255, 107, 107, 0.18)");
    grad.addColorStop(1, "rgba(255, 107, 107, 0.01)");
    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.top + ch);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.strokeStyle = "#FF6B6B";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#FF6B6B";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 107, 107, 0.25)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#FF6B6B";
      ctx.font = "9px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.val + "kcal", p.x, p.y - 10);

      ctx.fillStyle = "#9CA3AF";
      ctx.font = "9px system-ui, sans-serif";
      ctx.fillText(p.date.slice(5), p.x, H - 8);
    });
  },

  /** 绘制进度环 */
  drawProgressRing(canvas, current, target, label) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 120;
    canvas.width = size * this._dpr;
    canvas.height = size * this._dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(this._dpr, this._dpr);

    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const r = 44;
    const lineW = 8;
    const pct = target > 0 ? Math.min(current / target, 1) : 0;

    // 背景环
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = lineW;
    ctx.stroke();

    // 进度环
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.strokeStyle = pct >= 1 ? "#10B981" : "#00BFA6";
    ctx.lineWidth = lineW;
    ctx.lineCap = "round";
    ctx.stroke();

    // 文字
    ctx.fillStyle = "#1A1A2E";
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(pct * 100) + "%", cx, cy - 6);

    if (label) {
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "10px system-ui, sans-serif";
      ctx.fillText(label, cx, cy + 18);
    }
  }
};

// 为旧浏览器添加 roundRect polyfill
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    const radii = Array.isArray(r) ? r : [r, r, r, r];
    this.moveTo(x + radii[0], y);
    this.lineTo(x + w - radii[1], y);
    this.quadraticCurveTo(x + w, y, x + w, y + radii[1]);
    this.lineTo(x + w, y + h - radii[2]);
    this.quadraticCurveTo(x + w, y + h, x + w - radii[2], y + h);
    this.lineTo(x + radii[3], y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - radii[3]);
    this.lineTo(x, y + radii[0]);
    this.quadraticCurveTo(x, y, x + radii[0], y);
    this.closePath();
  };
}
