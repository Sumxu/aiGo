/**
 * 获取移动端安全区域顶部高度（状态栏/刘海屏）
 * 兼容 iOS 刘海屏、部分安卓安全区、电脑浏览器返回 0
 */
export function getSafeAreaTop(): number {
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

  const isIOS = /iP(hone|od|ad)/.test(ua);
  const isAndroid = /Android/.test(ua);

  // 非移动端直接返回 0
  if (!isIOS && !isAndroid) return 0;

  // 尝试获取 CSS 变量 --safe-area-inset-top
  const safeAreaValue = getComputedStyle(document.documentElement)
    .getPropertyValue('--safe-area-inset-top')
    .trim();

  // 如果值存在，去掉单位并返回整数
  if (safeAreaValue) {
    const value = parseInt(safeAreaValue.replace('px', ''), 10);
    if (!isNaN(value)) return value;
  }

  // iOS 默认状态栏高度约为 20px（非刘海屏）或 44px（刘海屏）
  if (isIOS) {
    return 44; // 可以根据实际需求调整
  }

  // 安卓默认状态栏高度约为 24px
  if (isAndroid) {
    return 24;
  }
  // fallback
  return 0;
}
