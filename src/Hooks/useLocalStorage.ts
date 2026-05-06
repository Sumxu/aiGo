// utils/storage.ts

export const storage = {
  /**
   * 设置 localStorage
   * @param key 键名
   * @param value 值（自动 JSON.stringify）
   */
  set(key: string, value: any) {
    try {
      const val = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, val);
    } catch (err) {
      console.error("localStorage set error:", err);
    }
  },

  /**
   * 获取 localStorage
   * @param key 键名
   * @param defaultValue 默认值（如果没有值就返回）
   */
  get(key: string, defaultValue: any = null) {
    try {
      const val = localStorage.getItem(key);
      if (val === null) return defaultValue;
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    } catch (err) {
      console.error("localStorage get error:", err);
      return defaultValue;
    }
  },

  /**
   * 删除指定 key 的缓存
   * @param key 键名
   */
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("localStorage remove error:", err);
    }
  },

  /**
   * 清空所有 localStorage 缓存
   */
  clear() {
    try {
      localStorage.clear();
    } catch (err) {
      console.error("localStorage clear error:", err);
    }
  },
};
