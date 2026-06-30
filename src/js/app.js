/**
 * 体重日记 - 主控制器 v1.3
 */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const el = {
    main: $("#appMain"), title: $("#viewTitle"),
    nav: $$(".nav-item"), views: $$(".view"), app: $("#app"),
    headerDate: $("#headerDate"), settingsGear: $("#settingsGear"),

    greeting: $("#greeting"), dashSub: $("#dashSub"),
    todayWeight: $("#todayWeightDisplay"),
    todayWeightRecordList: $("#todayWeightRecordList"),
    weightDiff: $("#weightDiff"), totalLost: $("#totalLost"),
    quickWeightInput: $("#quickWeightInput"),
    quickWeightTime: $("#quickWeightTime"), quickWeightBtn: $("#quickWeightBtn"),
    statDays: $("#statDays"), statLowest: $("#statLowest"),
    statCalIn: $("#statCalIn"), statCalOut: $("#statCalOut"),
    calBalance: $("#calBalance"),
    recentEntries: $("#recentEntries"),
    progressRingWeight: $("#progressRingWeight"),

    weightDate: $("#weightDate"), weightTime: $("#weightTime"),
    weightValue: $("#weightValue"), weightNotes: $("#weightNotes"),
    weightSubmit: $("#weightSubmit"), weightList: $("#weightList"),
    weightCount: $("#weightCount"),

    dietDate: $("#dietDate"), dietTime: $("#dietTime"),
    dietMealType: $("#dietMealType"), dietFood: $("#dietFood"),
    dietWeight: $("#dietWeight"), dietCalories: $("#dietCalories"),
    dietCalorieHint: $("#dietCalorieHint"), dietNotes: $("#dietNotes"),
    dietSubmit: $("#dietSubmit"), dietList: $("#dietList"),
    dietCount: $("#dietCount"),

    exDate: $("#exDate"), exTime: $("#exTime"), exType: $("#exType"),
    exDuration: $("#exDuration"), exCalories: $("#exCalories"),
    exCalGroup: $("#exCalGroup"), exNotes: $("#exNotes"),
    exSubmit: $("#exSubmit"), exList: $("#exList"), exCount: $("#exCount"),

    weightChart: $("#weightChart"), calChart: $("#calChart"),
    ringWeightProgress: $("#ringWeightProgress"),
    ringCalProgress: $("#ringCalProgress"),
    weightPeriodTabs: $$("#weightPeriodTabs .period-tab"),
    calPeriodTabs: $$("#calPeriodTabs .period-tab"),

    setTargetWeight: $("#setTargetWeight"), setStartWeight: $("#setStartWeight"),
    setHeight: $("#setHeight"), setCalTarget: $("#setCalTarget"),
    setName: $("#setName"), bgTheme: $("#bgTheme"),
    bgUploadBtn: $("#bgUploadBtn"), bgClearBtn: $("#bgClearBtn"),
    bgFileInput: $("#bgFileInput"), bgImagePreview: $("#bgImagePreview"),
    settingsSave: $("#settingsSave"),
    exportBtn: $("#exportBtn"), importBtn: $("#importBtn"),
    importFile: $("#importFile"), clearBtn: $("#clearBtn"),
  };

  let currentView = "viewDashboard";
  let editWeightId = null, editExId = null, editDietId = null;

  const foodCaloriesPer100g = [
    { keywords: ["苹果", "apple"], kcal: 52 },
    { keywords: ["香蕉", "banana"], kcal: 89 },
    { keywords: ["橙子", "橘子", "orange"], kcal: 47 },
    { keywords: ["梨"], kcal: 57 },
    { keywords: ["葡萄"], kcal: 69 },
    { keywords: ["草莓"], kcal: 32 },
    { keywords: ["西瓜"], kcal: 30 },
    { keywords: ["米饭", "白米饭"], kcal: 116 },
    { keywords: ["馒头"], kcal: 223 },
    { keywords: ["面包", "吐司"], kcal: 265 },
    { keywords: ["面条", "面"], kcal: 110 },
    { keywords: ["鸡蛋", "蛋"], kcal: 143 },
    { keywords: ["牛奶"], kcal: 54 },
    { keywords: ["酸奶"], kcal: 72 },
    { keywords: ["鸡胸肉"], kcal: 133 },
    { keywords: ["鸡腿"], kcal: 181 },
    { keywords: ["牛肉"], kcal: 125 },
    { keywords: ["猪肉"], kcal: 143 },
    { keywords: ["鱼"], kcal: 110 },
    { keywords: ["虾"], kcal: 93 },
    { keywords: ["豆腐"], kcal: 84 },
    { keywords: ["土豆", "马铃薯"], kcal: 81 },
    { keywords: ["红薯", "地瓜"], kcal: 86 },
    { keywords: ["玉米"], kcal: 112 },
    { keywords: ["黄瓜"], kcal: 16 },
    { keywords: ["西红柿", "番茄"], kcal: 18 },
    { keywords: ["生菜"], kcal: 15 },
    { keywords: ["西兰花"], kcal: 34 },
    { keywords: ["胡萝卜"], kcal: 41 },
    { keywords: ["花生"], kcal: 567 },
    { keywords: ["核桃"], kcal: 654 }
  ];

  function now() { return new Date(); }
  function today() { return now().toISOString().slice(0, 10); }
  function currentTime() { return now().toTimeString().slice(0, 5); }

  function showToast(msg) {
    const old = document.querySelector(".toast");
    if (old) old.remove();
    const div = document.createElement("div");
    div.className = "toast";
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => { div.classList.add("hide"); setTimeout(() => div.remove(), 300); }, 2000);
  }

  function formatDate(d) {
    const parts = d.split("-");
    return parts[0] + "年" + parseInt(parts[1]) + "月" + parseInt(parts[2]) + "日";
  }

  function findFoodCalorie(foodName) {
    const name = foodName.trim().toLowerCase();
    if (!name) return null;
    return foodCaloriesPer100g.find((item) =>
      item.keywords.some((keyword) => name.includes(keyword.toLowerCase()))
    ) || null;
  }

  function confirmDialog(msg, cb) {
    const tpl = document.getElementById("modalTemplate");
    const clone = tpl.content.cloneNode(true);
    const overlay = clone.querySelector(".modal-overlay");
    overlay.querySelector("#modalTitle").textContent = "确认操作";
    overlay.querySelector("#modalBody").innerHTML = `<p style="font-size:14px;color:#6B7280;margin-bottom:16px">${msg}</p>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" style="flex:1" id="modalCancel">取消</button>
        <button class="btn btn-primary" style="flex:1;background:#FF6B6B" id="modalConfirm">确认</button>
      </div>`;
    document.body.appendChild(clone);
    const ov = document.querySelector(".modal-overlay:last-child");
    ov.querySelector("#modalCancel").onclick = () => ov.remove();
    ov.querySelector("#modalConfirm").onclick = () => { ov.remove(); cb(); };
  }

  /** 应用背景主题 */
  function applyBgTheme(theme) {
    el.app.classList.remove("theme-default", "theme-dark", "theme-gradient1", "theme-gradient2", "theme-gradient3", "theme-gradient4");
    if (theme && theme !== "default") el.app.classList.add("theme-" + theme);
  }

  /** 应用背景图片 */
  function applyBgImage(dataUrl) {
    el.app.classList.remove("has-bg-image");
    if (dataUrl) {
      el.app.style.setProperty("--bg-image-url", "url(" + dataUrl + ")");
      el.app.classList.add("has-bg-image");
      if (el.bgImagePreview) {
        el.bgImagePreview.style.backgroundImage = "url(" + dataUrl + ")";
        el.bgImagePreview.textContent = "";
      }
    } else {
      el.app.style.removeProperty("--bg-image-url");
      if (el.bgImagePreview) {
        el.bgImagePreview.style.backgroundImage = "";
        el.bgImagePreview.textContent = "暂无图片";
      }
    }
  }

  // ---- Navigation ----
  function switchView(viewId) {
    currentView = viewId;
    el.views.forEach((v) => v.classList.toggle("active", v.id === viewId));
    el.nav.forEach((n) => n.classList.toggle("active", n.dataset.view === viewId));
    const titles = {
      viewDashboard: "首页", viewWeight: "体重", viewDiet: "饮食",
      viewExercise: "运动", viewTrends: "趋势", viewSettings: "设置"
    };
    el.title.textContent = titles[viewId] || "体重日记";
    refreshView(viewId);
  }

  el.nav.forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  // 设置齿轮按钮
  el.settingsGear.addEventListener("click", () => switchView("viewSettings"));

  function refreshView(viewId) {
    switch (viewId) {
      case "viewDashboard": renderDashboard(); break;
      case "viewWeight": renderWeightList(); break;
      case "viewDiet": renderDietList(); break;
      case "viewExercise": renderExList(); break;
      case "viewTrends": renderTrends(); break;
      case "viewSettings": loadSettings(); break;
    }
  }

  // ==================== DASHBOARD ====================
  function renderDashboard() {
    const h = now().getHours();
    const settings = DB.getSettings();
    const name = settings.name || "";
    const greet = h < 6 ? "夜深了" : h < 12 ? "早上好" : h < 18 ? "下午好" : "晚上好";
    el.greeting.textContent = greet + (name ? ", " + name : "") + " 👋";
    el.dashSub.textContent = h < 6 ? "早点休息，明天继续加油！" : "今天也要加油！";
    el.headerDate.textContent = formatDate(today());

    // 今日热量结余
    const todayFoodCal = DB.getDayFoodCalories(today());
    const todayExCal = DB.getDayExerciseCalories(today());
    const balance = todayFoodCal - todayExCal;
    el.statCalIn.textContent = todayFoodCal;
    el.statCalOut.textContent = todayExCal;
    el.calBalance.textContent = (balance > 0 ? "+" : "") + balance + " kcal";
    el.calBalance.className = balance > 0 ? "cal-balance positive" : balance < 0 ? "cal-balance negative" : "cal-balance zero";

    // 今日所有体重
    const todayWeights = DB.getTodayWeights();
    if (todayWeights.length > 0) {
      el.todayWeight.textContent = todayWeights[0].weight.toFixed(1);
      el.todayWeightRecordList.innerHTML = todayWeights.map((w) =>
        `<div class="entry-item" style="margin-bottom:4px;padding:6px 8px;box-shadow:none;border:1px solid var(--border)">
          <div class="entry-icon green" style="width:28px;height:28px">⚖️</div>
          <div class="entry-body"><div class="title">${w.weight.toFixed(1)} kg</div>
          <div class="subtitle">${w.time || "00:00"}${w.notes ? " · " + w.notes : ""}</div></div>
        </div>`
      ).join("");
    } else {
      el.todayWeight.textContent = "--";
      el.todayWeightRecordList.innerHTML = '<div class="text-muted" style="font-size:12px;margin-bottom:8px">今天还没称重</div>';
    }

    // 体重进度
    const weights = DB.getWeights();
    const targetW = settings.targetWeight;
    const startW = settings.startWeight;
    const firstW = weights.length > 0 ? weights[weights.length - 1].weight : startW;
    const lastW = weights.length > 0 ? weights[0].weight : startW;
    const totalLost = firstW - lastW;

    if (todayWeights.length > 0) {
      const diff = todayWeights[0].weight - targetW;
      el.weightDiff.textContent = (diff > 0 ? "+" : "") + diff.toFixed(1) + " kg";
      el.weightDiff.className = "change " + (diff <= 0 ? "down" : "up");
    } else {
      el.weightDiff.textContent = "今天还没称";
      el.weightDiff.className = "change";
      el.weightDiff.style.color = "var(--text-muted)";
    }
    if (totalLost > 0) {
      el.totalLost.textContent = "-" + totalLost.toFixed(1) + " kg";
      el.totalLost.className = "change down";
    } else if (totalLost < 0) {
      el.totalLost.textContent = "+" + Math.abs(totalLost).toFixed(1) + " kg";
      el.totalLost.className = "change up";
    } else { el.totalLost.textContent = "--"; el.totalLost.className = "change"; }

    const progressPct = startW !== targetW ? (firstW - lastW) / (firstW - targetW) * 100 : 0;
    Charts.drawProgressRing(el.progressRingWeight,
      Math.max(0, progressPct), 100, targetW ? "目标 " + targetW + "kg" : "");

    el.statDays.textContent = weights.length;
    el.statLowest.textContent = weights.length > 0
      ? Math.min(...weights.map((w) => w.weight)).toFixed(1) + "kg" : "--";

    // 混合最近记录
    const mixed = [
      ...weights.slice(0, 5).map((w) => ({ ...w, _type: "weight" })),
      ...DB.getDiets().slice(0, 5).map((d) => ({ ...d, _type: "diet" })),
      ...DB.getExercises().slice(0, 5).map((e) => ({ ...e, _type: "exercise" }))
    ].sort((a, b) => {
      const c = b.date.localeCompare(a.date);
      if (c !== 0) return c;
      return (b.time || "00:00").localeCompare(a.time || "00:00");
    }).slice(0, 5);

    if (mixed.length === 0) {
      el.recentEntries.innerHTML = '<div class="empty-state"><p>还没有记录，开始今天的第一条吧！</p></div>';
    } else {
      el.recentEntries.innerHTML = '<div class="entry-list">' + mixed.map((item) => {
        if (item._type === "weight") {
          return `<div class="entry-item">
            <div class="entry-icon green">⚖️</div>
            <div class="entry-body"><div class="title">${item.weight.toFixed(1)} kg</div>
            <div class="subtitle">${formatDate(item.date)} ${item.time || "00:00"}${item.notes ? " · " + item.notes : ""}</div></div>
            <div class="entry-value">${item.weight.toFixed(1)} kg</div>
          </div>`;
        }
        if (item._type === "diet") {
          return `<div class="entry-item">
            <div class="entry-icon orange">🍽️</div>
            <div class="entry-body"><div class="title">${item.foodName} <span style="font-weight:400;font-size:12px;color:var(--text-secondary)">${item.mealTypeName}</span></div>
            <div class="subtitle">${formatDate(item.date)} ${item.time || ""}${item.weightGrams ? " · " + item.weightGrams + "g" : ""}${item.notes ? " · " + item.notes : ""}</div></div>
            <div class="entry-value red">${item.calories} kcal</div>
          </div>`;
        }
        return `<div class="entry-item">
          <div class="entry-icon red">🏃</div>
          <div class="entry-body"><div class="title">${item.typeName}</div>
          <div class="subtitle">${formatDate(item.date)} ${item.time || ""} · ${item.duration} 分钟${item.notes ? " · " + item.notes : ""}</div></div>
          <div class="entry-value red">${item.calories} kcal</div>
        </div>`;
      }).join("") + '</div>';
    }
  }

  // 快速记体重
  el.quickWeightBtn.addEventListener("click", () => {
    const val = parseFloat(el.quickWeightInput.value);
    if (!val || val < 20 || val > 250) { showToast("请输入有效体重 (20-250kg)"); return; }
    const t = el.quickWeightTime.value || currentTime();
    DB.addWeight({ date: today(), time: t, weight: val });
    showToast("已记录 " + val.toFixed(1) + " kg (" + t + ")");
    el.quickWeightInput.value = "";
    renderDashboard();
  });

  // ==================== WEIGHT ====================
  el.weightDate.value = today(); el.weightTime.value = currentTime();
  el.weightSubmit.addEventListener("click", () => {
    const date = el.weightDate.value, t = el.weightTime.value || currentTime();
    const val = parseFloat(el.weightValue.value);
    if (!date || !val) { showToast("请填写日期、时间和体重"); return; }
    if (editWeightId) {
      DB.updateWeight(editWeightId, { date, time: t, weight: val, notes: el.weightNotes.value });
      showToast("已更新");
      editWeightId = null; el.weightSubmit.textContent = "保存记录";
    } else {
      DB.addWeight({ date, time: t, weight: val, notes: el.weightNotes.value });
      showToast("已保存");
    }
    el.weightValue.value = ""; el.weightNotes.value = "";
    renderWeightList();
  });

  function renderWeightList() {
    const list = DB.getWeights();
    el.weightCount.textContent = "共 " + list.length + " 条";
    if (list.length === 0) {
      el.weightList.innerHTML = '<div class="empty-state"><p>暂无体重记录</p></div>'; return;
    }
    el.weightList.innerHTML = list.map((w) =>
      `<div class="entry-item">
        <div class="entry-icon green">⚖️</div>
        <div class="entry-body"><div class="title">${w.weight.toFixed(1)} kg</div>
        <div class="subtitle">${formatDate(w.date)} ${w.time || "00:00"}${w.notes ? " · " + w.notes : ""}</div></div>
        <button class="btn-icon" data-wedit="${w.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg></button>
        <button class="btn-icon" data-wdel="${w.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
      </div>`
    ).join("");
    el.weightList.querySelectorAll("[data-wedit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = DB.getWeights().find((w) => w.id === btn.dataset.wedit);
        if (!item) return;
        editWeightId = item.id;
        el.weightDate.value = item.date; el.weightTime.value = item.time || "00:00";
        el.weightValue.value = item.weight; el.weightNotes.value = item.notes || "";
        el.weightSubmit.textContent = "更新记录"; el.main.scrollTop = 0;
      });
    });
    el.weightList.querySelectorAll("[data-wdel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        confirmDialog("确定删除这条记录？", () => {
          DB.deleteWeight(btn.dataset.wdel); renderWeightList(); showToast("已删除");
        });
      });
    });
    const cb = el.weightList.parentElement.querySelector(".cancel-edit");
    if (cb) cb.remove();
    if (editWeightId) {
      const c = document.createElement("button");
      c.className = "btn btn-secondary btn-sm mt-8 cancel-edit";
      c.textContent = "取消编辑"; c.style = "width:100%";
      c.addEventListener("click", () => {
        editWeightId = null; el.weightValue.value = ""; el.weightNotes.value = "";
        el.weightSubmit.textContent = "保存记录"; c.remove();
      });
      el.weightList.parentElement.appendChild(c);
    }
  }

  // ==================== DIET ====================
  DB.mealTypes.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id; opt.textContent = m.name;
    el.dietMealType.appendChild(opt);
  });
  el.dietDate.value = today(); el.dietTime.value = currentTime();

  function updateDietCalorieEstimate(shouldFillCalories = true) {
    const foodName = el.dietFood.value.trim();
    const weight = parseFloat(el.dietWeight.value) || 0;
    const food = findFoodCalorie(foodName);
    if (!foodName && !weight) {
      el.dietCalorieHint.textContent = "输入食物和重量后自动预估";
      el.dietCalorieHint.className = "calorie-estimate";
      return;
    }
    if (!food) {
      el.dietCalorieHint.textContent = "暂未收录该食物，可手动填写热量";
      el.dietCalorieHint.className = "calorie-estimate muted";
      return;
    }
    if (!weight) {
      el.dietCalorieHint.textContent = "已识别：" + food.keywords[0] + "，请输入重量";
      el.dietCalorieHint.className = "calorie-estimate";
      return;
    }
    const calories = Math.round(food.kcal * weight / 100);
    if (shouldFillCalories) el.dietCalories.value = calories;
    el.dietCalorieHint.textContent = food.keywords[0] + "约 " + food.kcal + " kcal/100g，预估 " + calories + " kcal";
    el.dietCalorieHint.className = "calorie-estimate active";
  }

  el.dietFood.addEventListener("input", updateDietCalorieEstimate);
  el.dietWeight.addEventListener("input", updateDietCalorieEstimate);

  el.dietSubmit.addEventListener("click", () => {
    const date = el.dietDate.value, t = el.dietTime.value || currentTime();
    const mealType = el.dietMealType.value;
    const mealTypeName = el.dietMealType.options[el.dietMealType.selectedIndex].text;
    const foodName = el.dietFood.value.trim();
    const weightGrams = parseFloat(el.dietWeight.value) || 0;
    const calories = parseInt(el.dietCalories.value) || 0;
    const notes = el.dietNotes.value.trim();
    if (!date || !foodName) { showToast("请填写日期和食物名称"); return; }
    if (editDietId) {
      DB.updateDiet(editDietId, { date, time: t, mealType, mealTypeName, foodName, weightGrams, calories, notes });
      showToast("已更新");
      editDietId = null; el.dietSubmit.textContent = "保存记录";
    } else {
      DB.addDiet({ date, time: t, mealType, mealTypeName, foodName, weightGrams, calories, notes });
      showToast("已保存");
    }
    el.dietFood.value = ""; el.dietWeight.value = ""; el.dietCalories.value = ""; el.dietNotes.value = "";
    updateDietCalorieEstimate();
    renderDietList();
  });

  function renderDietList() {
    const list = DB.getDiets();
    el.dietCount.textContent = "共 " + list.length + " 条";
    if (list.length === 0) {
      el.dietList.innerHTML = '<div class="empty-state"><p>暂无饮食记录</p></div>'; return;
    }
    el.dietList.innerHTML = list.map((d) =>
      `<div class="entry-item">
        <div class="entry-icon orange">🍽️</div>
        <div class="entry-body"><div class="title">${d.foodName} <span style="font-weight:400;font-size:12px;color:var(--text-secondary)">${d.mealTypeName}</span></div>
        <div class="subtitle">${formatDate(d.date)} ${d.time || ""}${d.weightGrams ? " · " + d.weightGrams + "g" : ""}${d.notes ? " · " + d.notes : ""}</div></div>
        <div class="entry-value red">${d.calories} kcal</div>
        <button class="btn-icon" data-dedit="${d.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg></button>
        <button class="btn-icon" data-ddel="${d.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
      </div>`
    ).join("");
    el.dietList.querySelectorAll("[data-dedit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = DB.getDiets().find((d) => d.id === btn.dataset.dedit);
        if (!item) return;
        editDietId = item.id;
        el.dietDate.value = item.date; el.dietTime.value = item.time || "00:00";
        el.dietMealType.value = item.mealType;
        el.dietFood.value = item.foodName; el.dietWeight.value = item.weightGrams || "";
        el.dietCalories.value = item.calories;
        el.dietNotes.value = item.notes || "";
        updateDietCalorieEstimate(false);
        el.dietSubmit.textContent = "更新记录"; el.main.scrollTop = 0;
      });
    });
    el.dietList.querySelectorAll("[data-ddel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        confirmDialog("确定删除这条记录？", () => {
          DB.deleteDiet(btn.dataset.ddel); renderDietList(); showToast("已删除");
        });
      });
    });
    const cb = el.dietList.parentElement.querySelector(".cancel-edit");
    if (cb) cb.remove();
    if (editDietId) {
      const c = document.createElement("button");
      c.className = "btn btn-secondary btn-sm mt-8 cancel-edit";
      c.textContent = "取消编辑"; c.style = "width:100%";
      c.addEventListener("click", () => {
        editDietId = null; el.dietFood.value = ""; el.dietWeight.value = ""; el.dietCalories.value = "";
        el.dietNotes.value = ""; el.dietSubmit.textContent = "保存记录"; c.remove();
        updateDietCalorieEstimate();
      });
      el.dietList.parentElement.appendChild(c);
    }
  }

  // ==================== EXERCISE ====================
  DB.exerciseTypes.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id; opt.textContent = t.name;
    el.exType.appendChild(opt);
  });
  el.exDate.value = today(); el.exTime.value = currentTime();

  el.exType.addEventListener("change", () => {
    if (el.exType.value === "custom") {
      el.exCalories.readOnly = false; el.exCalories.placeholder = "手动输入"; el.exCalories.value = "";
    } else {
      el.exCalories.readOnly = true; el.exCalories.placeholder = "自动计算"; el.exCalories.value = "";
      updateCalPreview();
    }
  });
  el.exDuration.addEventListener("input", updateCalPreview);

  function updateCalPreview() {
    const typeId = el.exType.value;
    if (typeId === "custom") return;
    const t = DB.exerciseTypes.find((et) => et.id === typeId);
    if (!t || !t.met) { el.exCalories.value = ""; return; }
    const dur = parseInt(el.exDuration.value) || 0;
    const settings = DB.getSettings();
    const cal = Math.round(t.met * (settings.startWeight || 70) * (dur / 60));
    el.exCalories.value = cal > 0 ? cal : "";
  }

  el.exSubmit.addEventListener("click", () => {
    const date = el.exDate.value, t = el.exTime.value || currentTime();
    const typeId = el.exType.value;
    const typeName = el.exType.options[el.exType.selectedIndex].text;
    const duration = parseInt(el.exDuration.value) || 0;
    const notes = el.exNotes.value;
    let calories = parseInt(el.exCalories.value) || 0;
    if (!date || !duration) { showToast("请填写日期和时长"); return; }
    if (typeId === "custom" && !calories) { showToast("请填写消耗热量"); return; }
    if (editExId) {
      DB.updateExercise(editExId, { date, time: t, typeId, typeName, duration, calories, notes });
      showToast("已更新"); editExId = null; el.exSubmit.textContent = "保存记录";
    } else {
      DB.addExercise({ date, time: t, typeId, typeName, duration, calories, notes });
      showToast("已保存");
    }
    el.exDuration.value = ""; el.exCalories.value = ""; el.exNotes.value = "";
    renderExList();
  });

  function renderExList() {
    const list = DB.getExercises();
    el.exCount.textContent = "共 " + list.length + " 条";
    if (list.length === 0) {
      el.exList.innerHTML = '<div class="empty-state"><p>暂无运动记录</p></div>'; return;
    }
    el.exList.innerHTML = list.map((e) =>
      `<div class="entry-item">
        <div class="entry-icon red">🏃</div>
        <div class="entry-body"><div class="title">${e.typeName}</div>
        <div class="subtitle">${formatDate(e.date)} ${e.time || ""} · ${e.duration} 分钟${e.notes ? " · " + e.notes : ""}</div></div>
        <div style="text-align:right;flex-shrink:0"><div class="entry-value red" style="margin-bottom:2px">${e.calories} kcal</div><div class="text-muted">${e.duration}min</div></div>
        <button class="btn-icon" data-eedit="${e.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg></button>
        <button class="btn-icon" data-edel="${e.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
      </div>`
    ).join("");
    el.exList.querySelectorAll("[data-eedit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = DB.getExercises().find((e) => e.id === btn.dataset.eedit);
        if (!item) return;
        editExId = item.id;
        el.exDate.value = item.date; el.exTime.value = item.time || "00:00";
        el.exType.value = item.typeId; el.exDuration.value = item.duration;
        el.exCalories.value = item.calories; el.exNotes.value = item.notes || "";
        el.exSubmit.textContent = "更新记录"; el.main.scrollTop = 0;
        if (item.typeId === "custom") el.exCalories.readOnly = false;
        el.exType.dispatchEvent(new Event("change"));
      });
    });
    el.exList.querySelectorAll("[data-edel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        confirmDialog("确定删除这条记录？", () => {
          DB.deleteExercise(btn.dataset.edel); renderExList(); showToast("已删除");
        });
      });
    });
    const cb = el.exList.parentElement.querySelector(".cancel-edit");
    if (cb) cb.remove();
    if (editExId) {
      const c = document.createElement("button");
      c.className = "btn btn-secondary btn-sm mt-8 cancel-edit";
      c.textContent = "取消编辑"; c.style = "width:100%";
      c.addEventListener("click", () => {
        editExId = null; el.exDuration.value = ""; el.exCalories.value = "";
        el.exNotes.value = ""; el.exSubmit.textContent = "保存记录"; c.remove();
      });
      el.exList.parentElement.appendChild(c);
    }
  }

  // ==================== TRENDS ====================
  let weightPeriod = "7d", calPeriod = "7d";
  el.weightPeriodTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      el.weightPeriodTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active"); weightPeriod = tab.dataset.period; renderWeightChart();
    });
  });
  el.calPeriodTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      el.calPeriodTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active"); calPeriod = tab.dataset.period; renderCalChart();
    });
  });
  function renderTrends() { renderWeightChart(); renderCalChart(); renderProgressRings(); }
  function renderWeightChart() { Charts.drawWeightChart(el.weightChart, DB.getWeights().reverse(), weightPeriod); }
  function renderCalChart() { Charts.drawCalorieChart(el.calChart, DB.getExercises().reverse(), calPeriod); }
  function renderProgressRings() {
    const s = DB.getSettings(), w = DB.getWeights();
    const lastW = w.length > 0 ? w[0].weight : s.startWeight;
    const totalToLose = s.startWeight - s.targetWeight;
    const lost = s.startWeight - lastW;
    const pct = totalToLose > 0 ? (lost / totalToLose) * 100 : 0;
    Charts.drawProgressRing(el.ringWeightProgress, Math.max(0, pct), 100, "已减 " + lost.toFixed(1) + "kg");
    const tc = DB.getDayExerciseCalories(today());
    const ct = s.dailyCalorieTarget || 500;
    Charts.drawProgressRing(el.ringCalProgress, tc, ct, tc + " / " + ct + " kcal");
  }

  // ==================== SETTINGS ====================
  function loadSettings() {
    const s = DB.getSettings();
    el.setTargetWeight.value = s.targetWeight;
    el.setStartWeight.value = s.startWeight;
    el.setHeight.value = s.height;
    el.setCalTarget.value = s.dailyCalorieTarget;
    el.setName.value = s.name || "";
    el.bgTheme.value = s.bgTheme || "default";
    applyBgImage(s.bgImage);
  }

  el.settingsSave.addEventListener("click", () => {
    const target = parseFloat(el.setTargetWeight.value);
    const start = parseFloat(el.setStartWeight.value);
    const height = parseInt(el.setHeight.value);
    const cal = parseInt(el.setCalTarget.value);
    const name = el.setName.value.trim();
    const bgTheme = el.bgTheme.value;
    if (!target || !start || !height) { showToast("请填写必要目标数据"); return; }
    const s = DB.getSettings();
    DB.saveSettings({ targetWeight: target, startWeight: start, height, dailyCalorieTarget: cal || 500, name, bgTheme, bgImage: s.bgImage });
    applyBgTheme(bgTheme);
    showToast("设置已保存");
    loadSettings();
    if (currentView === "viewDashboard") renderDashboard();
  });

  // 背景主题下拉实时切换
  el.bgTheme.addEventListener("change", () => {
    const s = DB.getSettings();
    if (s.bgTheme !== el.bgTheme.value) {
      applyBgTheme(el.bgTheme.value);
    }
  });

  // 背景图片上传
  el.bgUploadBtn.addEventListener("click", () => el.bgFileInput.click());
  el.bgFileInput.addEventListener("change", () => {
    const file = el.bgFileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const s = DB.getSettings();
      DB.saveSettings({ ...s, bgImage: dataUrl });
      applyBgImage(dataUrl);
      el.bgTheme.value = "default";
      applyBgTheme("default");
      showToast("背景图片已设置");
    };
    reader.readAsDataURL(file);
    el.bgFileInput.value = "";
  });

  // 清除背景图片
  el.bgClearBtn.addEventListener("click", () => {
    const s = DB.getSettings();
    DB.saveSettings({ ...s, bgImage: null });
    applyBgImage(null);
    showToast("背景图片已清除");
  });

  // 导出
  el.exportBtn.addEventListener("click", () => {
    const data = DB.exportAll();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "体重日记_备份_" + today() + ".json";
    a.click(); URL.revokeObjectURL(url); showToast("数据已导出");
  });

  el.importBtn.addEventListener("click", () => el.importFile.click());
  el.importFile.addEventListener("change", () => {
    const file = el.importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (DB.importAll(e.target.result)) {
        showToast("数据已导入"); refreshView(currentView);
      } else { showToast("导入失败，请检查文件格式"); }
    };
    reader.readAsText(file); el.importFile.value = "";
  });

  el.clearBtn.addEventListener("click", () => {
    confirmDialog("确定要清除所有数据吗？此操作不可恢复！", () => {
      localStorage.clear(); showToast("所有数据已清除"); refreshView(currentView);
    });
  });

  // ==================== INIT ====================
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  const initSettings = DB.getSettings();
  if (initSettings.bgTheme) applyBgTheme(initSettings.bgTheme);
  if (initSettings.bgImage) applyBgImage(initSettings.bgImage);

  switchView("viewDashboard");
})();
