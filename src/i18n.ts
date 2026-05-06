// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import En from "./Lang/En.json";
import ZhHant from "./Lang/zhHant.json";
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: En },
    zhHant: { translation: ZhHant },
  },
  lng: window.localStorage.getItem("lang") ?? "zhHant", // 设置默认语言
  fallbackLng: "zhHant", // 找不到语言时回退用中文
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
