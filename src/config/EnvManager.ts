// src/config/EnvManager.ts
import EnvConfigProvider from "./EnvConfigProvider";
import type EnvConfig from "./EnvConfigProvider";
/**
 * EnvManager: 环境配置访问类（纯静态版）
 *
 * ✅ 自动判断 dev / prod
 * ✅ 仅从 EnvConfigProvider 读取配置
 * 🚫 不再从 import.meta.env 或 .env 文件读取覆盖
 */
class EnvManager {
  /** 自动判定当前模式 */
  private static readonly mode: "development" | "production" = (() => {
    const meta =
      (typeof import.meta !== "undefined"
        ? (import.meta as any).env
        : undefined) || {};
    const envMode =
      meta.MODE ||
      meta.VITE_MODE ||
      (typeof process !== "undefined"
        ? process.env?.VITE_MODE || process.env?.NODE_ENV
        : undefined) ||
      "development";
    return String(envMode).includes("prod") ? "production" : "development";
  })();

  /** 根据模式获取配置 */
  private static readonly config: Readonly<EnvConfig> =
    EnvManager.mode === "development"
      ? EnvConfigProvider.getDevConfig()
      : EnvConfigProvider.getProdConfig();
  // === 公共访问器 ===
  static get modeName(): "development" | "production" {
    return EnvManager.mode;
  }

  static get isDev(): boolean {
    return EnvManager.mode === "development";
  }

  static get isProd(): boolean {
    return EnvManager.mode === "production";
  }
  static get chainId(): string {
    return EnvManager.config.chainId;
  }
  static get configAll(): Readonly<EnvConfig> {
    return EnvManager.config;
  }
  static get SwapRouter(): string {
    return EnvManager.config.SwapRouter;
  }
  static get multiCallToken(): string {
    return EnvManager.config.multiCallToken;
  }
  static get contractUsdt(): string {
    return EnvManager.config.contractUsdt;
  }
  static get AIgoToken(): string {
    return EnvManager.config.AIgoToken;
  }
  static get AigoPredictionContest(): string {
    return EnvManager.config.AigoPredictionContest;
  }
  static get rpcUrl(): string {
    return EnvManager.config.rpcUrl;
  }

  static get blockExplorerUrls(): string {
    return EnvManager.config.blockExplorerUrls;
  }

  static get chainName(): string {
    return EnvManager.config.chainName;
  }
  static get apiBase(): string {
    return EnvManager.config.apiBase;
  }
  /** 调试打印（仅开发环境） */
  static print(): void {
    console.log("EnvManager.isProd==", EnvManager.isProd);
    if (EnvManager.isProd) return;
    console.log("🌍 EnvManager.mode:", EnvManager.mode);
    console.log("🌍 EnvManager.config:", EnvManager.config);
    console.table(EnvManager.config);
  }
}
export default EnvManager;
