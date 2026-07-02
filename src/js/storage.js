/**
 * 数据存储模块
 * 使用 localStorage 持久化所有数据
 */
const DB = {
  _ns: "weight_diary_",

  _get(key) { return localStorage.getItem(this._ns + key); },
  _set(key, val) { localStorage.setItem(this._ns + key, JSON.stringify(val)); },

  /** 默认设置 */
  _defaults: {
    targetWeight: 65,
    startWeight: 80,
    height: 175,
    dailyCalorieTarget: 500,
    name: "",
    bgTheme: "default",
    bgImage: null
  },

  /** 饮食分类 */
  mealTypes: [
    { id: "breakfast", name: "早餐" },
    { id: "lunch",     name: "午餐" },
    { id: "dinner",    name: "晚餐" },
    { id: "snack",     name: "加餐" }
  ],

  /** 运动类型列表（含 MET 值） */
  exerciseTypes: [
    { id: "walking_slow",  name: "散步",       met: 2.5 },
    { id: "walking",       name: "快走",       met: 3.5 },
    { id: "running",       name: "跑步",       met: 8 },
    { id: "cycling",       name: "骑行",       met: 7 },
    { id: "swimming",      name: "游泳",       met: 6 },
    { id: "yoga",          name: "瑜伽",       met: 2.5 },
    { id: "strength",      name: "力量训练",   met: 5 },
    { id: "jump_rope",     name: "跳绳",       met: 10 },
    { id: "hiit",          name: "HIIT",       met: 8 },
    { id: "dancing",       name: "跳舞",       met: 4.5 },
    { id: "badminton",     name: "羽毛球",     met: 5.5 },
    { id: "basketball",    name: "篮球",       met: 6 },
    { id: "custom",        name: "自定义运动", met: null }
  ],

  /** 获取所有设置 */
  getSettings() {
    const raw = this._get("settings");
    return raw ? JSON.parse(raw) : { ...this._defaults };
  },

  /** 保存设置 */
  saveSettings(s) {
    this._set("settings", { ...this._defaults, ...s });
  },

  /** ===== 体重记录 ===== */

  /** 获取所有体重记录（按日期降序，同日内按时间降序） */
  getWeights() {
    const raw = this._get("weights");
    const list = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => {
      const c = b.date.localeCompare(a.date);
      if (c !== 0) return c;
      return (b.time || "00:00").localeCompare(a.time || "00:00");
    });
  },

  /** 添加体重记录 */
  addWeight(entry) {
    const list = this.getWeights().reverse();
    const id = "w" + Date.now();
    const now = new Date();
    const time = entry.time || now.toTimeString().slice(0, 5);
    list.push({ id, date: entry.date, time, weight: entry.weight, notes: entry.notes || "" });
    this._set("weights", list);
    return id;
  },

  /** 删除体重记录 */
  deleteWeight(id) {
    const list = this.getWeights().reverse();
    this._set("weights", list.filter((e) => e.id !== id));
  },

  /** 更新体重记录 */
  updateWeight(id, data) {
    const list = this.getWeights().reverse();
    const idx = list.findIndex((e) => e.id === id);
    if (idx > -1) { Object.assign(list[idx], data); this._set("weights", list); }
  },

  /** 获取今天的所有体重记录 */
  getTodayWeights() {
    const today = new Date().toISOString().slice(0, 10);
    return this.getWeights().filter((e) => e.date === today);
  },

  /** 获取今天的最新一条体重记录 */
  getTodayWeight() {
    return this.getTodayWeights()[0] || null;
  },

  /** ===== 运动记录 ===== */

  /** 获取所有运动记录（按日期降序，同日内按时间降序） */
  getExercises() {
    const raw = this._get("exercises");
    const list = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => {
      const c = b.date.localeCompare(a.date);
      if (c !== 0) return c;
      return (b.time || "00:00").localeCompare(a.time || "00:00");
    });
  },

  /** 添加运动记录（自动计算卡路里） */
  addExercise(entry) {
    const list = this.getExercises().reverse();
    const settings = this.getSettings();
    const id = "e" + Date.now();
    let calories = entry.calories || 0;
    if (!calories && entry.typeId !== "custom") {
      const t = this.exerciseTypes.find((et) => et.id === entry.typeId);
      if (t && t.met) {
        const weight = settings.startWeight || 70;
        calories = Math.round(t.met * weight * (entry.duration / 60));
      }
    }
    const now = new Date();
    const time = entry.time || now.toTimeString().slice(0, 5);
    list.push({
      id, date: entry.date, time,
      typeId: entry.typeId, typeName: entry.typeName,
      duration: entry.duration, calories,
      notes: entry.notes || ""
    });
    this._set("exercises", list);
    return id;
  },

  /** 删除运动记录 */
  deleteExercise(id) {
    const list = this.getExercises().reverse();
    this._set("exercises", list.filter((e) => e.id !== id));
  },

  /** 更新运动记录 */
  updateExercise(id, data) {
    const list = this.getExercises().reverse();
    const idx = list.findIndex((e) => e.id === id);
    if (idx > -1) {
      if ((!data.calories || data.calories <= 0) && data.typeId && data.typeId !== "custom") {
        const settings = this.getSettings();
        const t = this.exerciseTypes.find((et) => et.id === data.typeId);
        if (t && t.met) {
          data.calories = Math.round(t.met * settings.startWeight * (data.duration / 60));
        }
      }
      Object.assign(list[idx], data);
      this._set("exercises", list);
    }
  },

  /** 获取某日运动总卡路里 */
  getDayExerciseCalories(date) {
    return this.getExercises()
      .filter((e) => e.date === date)
      .reduce((sum, e) => sum + e.calories, 0);
  },

  /** ===== 饮食记录 ===== */

  /** 获取所有饮食记录（按日期降序，同日内按时间降序） */
  getDiets() {
    const raw = this._get("diets");
    const list = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => {
      const c = b.date.localeCompare(a.date);
      if (c !== 0) return c;
      return (b.time || "00:00").localeCompare(a.time || "00:00");
    });
  },

  /** 添加饮食记录 */
  addDiet(entry) {
    const list = this.getDiets().reverse();
    const id = "d" + Date.now();
    const now = new Date();
    const time = entry.time || now.toTimeString().slice(0, 5);
    list.push({
      id, date: entry.date, time,
      mealType: entry.mealType,
      mealTypeName: entry.mealTypeName,
      foodName: entry.foodName,
      weightGrams: entry.weightGrams || 0,
      calories: entry.calories || 0,
      notes: entry.notes || ""
    });
    this._set("diets", list);
    return id;
  },

  /** 删除饮食记录 */
  deleteDiet(id) {
    const list = this.getDiets().reverse();
    this._set("diets", list.filter((e) => e.id !== id));
  },

  /** 更新饮食记录 */
  updateDiet(id, data) {
    const list = this.getDiets().reverse();
    const idx = list.findIndex((e) => e.id === id);
    if (idx > -1) { Object.assign(list[idx], data); this._set("diets", list); }
  },

  /** 获取某日饮食总卡路里 */
  getDayFoodCalories(date) {
    return this.getDiets()
      .filter((e) => e.date === date)
      .reduce((sum, e) => sum + e.calories, 0);
  },

  /** 获取某日热量结余（摄入 - 消耗） */
  getDayCalorieBalance(date) {
    return this.getDayFoodCalories(date) - this.getDayExerciseCalories(date);
  },

  /** 导出全部数据为 JSON */
  exportAll() {
    return JSON.stringify({
      settings: this.getSettings(),
      weights: this.getWeights(),
      exercises: this.getExercises(),
      diets: this.getDiets(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  },

  /** 从 JSON 导入数据 */
  importAll(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) this.saveSettings(data.settings);
      if (data.weights) this._set("weights", data.weights);
      if (data.exercises) this._set("exercises", data.exercises);
      if (data.diets) this._set("diets", data.diets);
      return true;
    } catch { return false; }
  }
};
