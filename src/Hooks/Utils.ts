import { message } from "antd";
import axios from "axios";
import {
  Wallet,
  parseUnits,
  formatUnits,
  isAddress,
  JsonRpcProvider,
  ethers,
} from "ethers";
export interface ParsedWallet {
  privateKey: string;
  address?: string;
  tag?: string;
}
export function getLastChars(str, n) {
  if (!str) return "";
  return str.slice(-n);
}
export function getLastNumber(str) {
  const match = str.match(/\d(?=\D*$)/);
  return match ? match[0] : "";
}
export function getRange(str, start, end) {
  if (!str) return "";
  return str.slice(start, end);
}
/**
 * 格式化钱包地址
 * @param addr 钱包地址
 * @param prefixLen 前缀长度，默认 7
 * @param suffixLen 后缀长度，默认 4
 * @returns 格式化后的地址，例如：0x1234567....abcd
 */
export function formatAddress(
  addr?: string,
  prefixLen = 7,
  suffixLen = 4,
): string {
  if (!addr) return "-";
  return `${addr.slice(0, prefixLen)}....${addr.slice(-suffixLen)}`;
}
/**
 * 把 allTxs 中的交易按 isBuy 分开统计
 * @param {any[][]} allTxs - 你的交易数组
 * @returns {Object} 返回买入和卖出的统计结果
 */
export function splitAmountByBuySell(allTxs) {
  let totalBuy = 0n; // 所有买入金额总和
  let totalSell = 0n; // 所有卖出金额总和

  const buyTxs = []; // 所有买入的交易对象（可用于后续使用）
  const sellTxs = []; // 所有卖出的交易对象

  const buyByAddress = new Map(); // 按地址统计买入金额
  const sellByAddress = new Map(); // 按地址统计卖出金额

  for (const tx of allTxs) {
    if (!tx || typeof tx.amount !== "bigint") continue;
    const amount = tx.amount;
    const address = tx.fromAddress || "unknown";
    if (tx.isBuy === true) {
      totalBuy += amount;
      buyTxs.push(tx);

      // 按地址统计买入
      buyByAddress.set(address, (buyByAddress.get(address) || 0n) + amount);
    } else if (tx.isBuy === false) {
      totalSell += amount;
      sellTxs.push(tx);
      // 按地址统计卖出
      sellByAddress.set(address, (sellByAddress.get(address) || 0n) + amount);
    }
  }

  return {
    // 总金额（BigInt）
    totalBuy,
    totalSell,

    // 转成字符串方便打印和显示
    totalBuyStr: totalBuy.toString(),
    totalSellStr: totalSell.toString(),

    // 所有买入/卖出的交易列表
    buyTxs,
    sellTxs,

    // 按地址统计（Map 转成普通对象）
    buyByAddress: Object.fromEntries(buyByAddress),
    sellByAddress: Object.fromEntries(sellByAddress),

    // 统计信息
    buyCount: buyTxs.length,
    sellCount: sellTxs.length,
  };
}
export const concatSign = (bigNumber: string): string => {
  // 获取当前时间戳（秒）
  const timestamp = Math.floor(Date.now() / 1000).toString();
  console.log('timestamp--',timestamp)
  // 拼接参数
  const combined = `${bigNumber}${timestamp}`;
  return combined;
};
export function sumAllAmounts(allTxs) {
  let total = 0n;
  for (const group of allTxs) {
    for (const tx of group) {
      if (tx && typeof tx.amount === "bigint") {
        total += tx.amount;
      }
    }
  }

  return total;
}
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function formatErrors(rawErrors: any[][]): any[] {
  const result: any[] = [];

  if (!rawErrors || !Array.isArray(rawErrors)) {
    return result;
  }

  rawErrors.forEach((groupErrors, groupIndex) => {
    if (!Array.isArray(groupErrors) || groupErrors.length === 0) {
      return;
    }

    groupErrors.forEach((errorItem) => {
      if (errorItem && errorItem.address && errorItem.message) {
        result.push({
          group: groupIndex + 1, // 第几组
          address: errorItem.address,
          message: errorItem.message,
          type: "余额不足", // 可根据 message 动态判断
        });
      }
    });
  });

  return result;
}
/** 全局消息通知 */
export function Totast(
  Message: string,
  type: "success" | "error" | "info" | "warning" | "loading",
) {
  switch (type) {
    case "success":
      message.success(Message);
      break;
    case "error":
      message.error(Message);
      break;
    case "info":
      message.info(Message);
      break;
    case "warning":
      message.warning(Message);
      break;
    case "loading":
      message.loading(Message);
      break;
    default:
      message.info(Message);
  }
}
/** 格式化数字为千分位，保留两位小数 */
export const formatNumber = (num: number | string): string => {
  if (num === null || num === undefined || num === "") return "0.00";
  const numberValue = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(numberValue)) return "0.00";
  return numberValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
/** 验证数字合法性（非负数） */
export function isValidNumber(str: string): boolean {
  return /^(0|[1-9]\d*)(\.\d+)?$/.test(str);
} /** 计算两个 BigNumber 的整数百分比 */
export const calcBigNumberPercentInt = (
  part: bigint,
  total: bigint,
): number => {
  if (!part || !total || total.isZero()) return 0;
  return part.mul(100).div(total).toNumber();
};
/** 获取当前语言对象 */
export const getLangObj = () => {
  const lang = localStorage.getItem("lang") ?? "zhHant";
  const langInfo: { label: string; value: string } = { label: "", value: "" };
  switch (lang) {
    case "en":
      langInfo.label = "English";
      langInfo.value = "2";
      break;
    case "zhHant":
      langInfo.label = "繁体中文";
      langInfo.value = "3";
      break;
  }
  return langInfo;
};
/** 兼容复制 */
function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {}
  document.body.removeChild(textarea);
  return success;
}
/** 复制文本到剪贴板（可选提示） */
export function copyToClipboard(text: string, message: string = "复制成功") {
  if (!text) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
      () => Totast(message, "success"),
      () => Totast("复制失败，请手动复制", "error"),
    );
  } else {
    const input = document.createElement("textarea");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand("copy")
        ? Totast(message, "success")
        : Totast("复制失败，请手动复制", "error");
    } catch {
      Totast("复制失败，请手动复制", "error");
    }
    document.body.removeChild(input);
  }
}
/** 检查是否存在有效值 */
export const checkValue = (value: any): boolean =>
  !(value === null || value === undefined || value === "");
/** 时间戳转全量时间 */
export function timestampToFull(ts: number, isMs = false) {
  const date = new Date(isMs ? ts : ts * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
/** 安全转小写 */
export function toLowerCaseSafe(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase();
}
/** 小数点截取 */
export function DecSubt(Num: number, len: number) {
  const NumString = Num.toString();
  if (NumString.indexOf(".") != -1) {
    const [Head, foot] = NumString.split(".");
    return foot.length > len ? `${Head}.${foot.substring(0, len)}` : Num;
  } else {
    return Num;
  }
}

/** 掩码处理 */
export const getMask = (value: any, char = "*", convert = false): string => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (convert === true) return str;
  const symbol = typeof convert === "string" ? convert : char;
  return symbol.repeat(str.length);
};
/** 毫秒转秒 */
export function msToSeconds(ms: number): number {
  return ms / 1000;
}

/** 检查是否是有效以太坊地址 */
export function isValidAddress(addr?: string): boolean {
  if (!addr) return false;
  try {
    return isAddress(addr);
  } catch {
    return false;
  }
}
/** 是否是合约 */
export async function isContractAddress(
  addr?: string,
  RPC_URL?: string,
): Promise<boolean> {
  if (!addr || !RPC_URL) return false;
  if (!isAddress(addr)) return false;
  try {
    const provider = new JsonRpcProvider(RPC_URL);
    const code = await provider.getCode(addr);
    return code !== "0x00";
  } catch {
    return false;
  }
}
/** 是否是7702合约 */
export async function is7702ContractAddress(
  addr?: string,
  RPC_URL?: string,
): Promise<boolean> {
  if (!addr || !RPC_URL) return false;
  if (!isAddress(addr)) return false;
  try {
    const provider = new JsonRpcProvider(RPC_URL);
    const code = await provider.getCode(addr);
    if (code === "0x" || code === "0x0") {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.log("err", err);
    return false;
  }
}
export function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(
      () => Totast("复制成功", "success"),
      () => {
        const ok = fallbackCopy(text);
        ok ? Totast("复制成功", "success") : Totast("请长按文'本复制", "info");
      },
    );
  } else {
    const ok = fallbackCopy(text);
    ok ? Totast("复制成功", "success") : Totast("请长按文本复制", "info");
  }
}
/** 最小单位转可读单位 */
export function fromWei(
  value: bigint,
  decimals: number,
  fixed = true,
  precision = 5,
): string {
  if (value === undefined || value === null) return "0";
  try {
    if (decimals == "") return "0";
    const etherValue = formatUnits(value.toString(), decimals);
    if (!fixed) return etherValue;
    if (precision === 0) return String(Math.floor(Number(etherValue)));
    return truncateDecimal(etherValue, precision);
  } catch (err) {
    console.error("fromWei 转换失败:", err);
    return "0";
  }
}
/**
 * BigInt 安全乘以小数比例（支持动态 decimals）
 * @param amount      - 原始最小单位金额 (bigint)
 * @param rate        - 要乘的比例，例如 0.00001、0.5、"1.25" 等
 * @param decimals    - 代币的实际小数位（动态传入）
 * @param extraPrecision - 额外精度（默认 10），数值越大精度越高，但计算开销稍大
 * @returns 计算后的最小单位 bigint（已向下取整）
 */
export function mulRate(
  amount: bigint,
  rate: number | string,
  decimals: number = 18,
  extraPrecision: number = 10, // 可动态调整
): bigint {
  if (amount === 0n || rate === 0 || rate === "0") return 0n;

  try {
    // 1. 把 rate 转为 BigInt，使用更高的精度防止误差
    const totalDecimals = decimals + extraPrecision;
    const rateBig = parseUnits(rate.toString(), totalDecimals);

    // 2. 执行乘法
    const multiplied = amount * rateBig;

    // 3. 除以 10^totalDecimals，得到最终最小单位结果
    const divisor = parseUnits("1", totalDecimals);
    const result = multiplied / divisor; // BigInt 自动向下取整（floor）

    return result;
  } catch (err) {
    console.error("mulRate 计算失败:", err, { amount, rate, decimals });
    return 0n;
  }
}
function truncateDecimal(value: string, decimals: number): string {
  if (!value.includes(".")) return value;
  const [integer, fraction = ""] = value.split(".");
  return `${integer}.${fraction.slice(0, decimals).padEnd(decimals, "0")}`;
}

/** 可读单位转最小单位 */
export function toWei(value: string, decimals: number): bigint {
  if (value === undefined || value === null) return 0n;
  try {
    return parseUnits(value, decimals);
  } catch (err) {
    console.error("toWei 转换失败:", err);
    return 0n;
  }
}
/**
 *
 * @returns 得到代币的精度
 */
export const getDecimals = () => {
  return 18;
};
/** 私钥验证 */
export const isValidPrivateKey = (key: string): boolean => {
  try {
    new Wallet(key);
    return true;
  } catch {
    return false;
  }
};

/** 粘贴私钥解析 */
export const parseWalletInput = (input: string): ParsedWallet[] => {
  if (!input) return [];
  return input
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const arr = line.split(/[,\t ]+/).map((v) => v.trim());
      const privateKey = arr[0];
      const tag = arr[1];
      if (!isValidPrivateKey(privateKey)) return null;
      const wallet = new Wallet(privateKey);
      return { privateKey, address: wallet.address, tag: tag || undefined };
    })
    .filter(Boolean) as ParsedWallet[];
};

interface GenerateOptions {
  count: number; // 数量
  min: number; // 每个最小值
  max?: number; // 每个最大值（可选）
  total: number; // 总和（比如 100）
  precision?: number; // 小数位（默认 2）
  smooth?: boolean; // 是否平滑（避免极端值）
}

export function generateRandomDistribution({
  count,
  min,
  max,
  total,
  precision = 2,
  smooth = true,
}: GenerateOptions): number[] {
  if (count * min > total) {
    Totast("最小值之和已经超过100%", "error");
    throw new Error("最小值之和已经超过 total");
  }

  let remaining = total - count * min;

  // 👉 生成随机权重
  let weights = Array.from({ length: count }, () =>
    smooth ? Math.random() * 0.7 + 0.3 : Math.random(),
  );

  let sumWeights = weights.reduce((a, b) => a + b, 0);

  let result = weights.map((w) => min + (w / sumWeights) * remaining);

  // 👉 如果有 max 限制，进行二次修正
  if (max !== undefined) {
    for (let i = 0; i < result.length; i++) {
      if (result[i] > max) {
        const overflow = result[i] - max;
        result[i] = max;

        // 把溢出的重新分配
        let others = result
          .map((v, idx) => (idx !== i ? idx : -1))
          .filter((idx) => idx !== -1);

        others.forEach((idx) => {
          result[idx] += overflow / others.length;
        });
      }
    }
  }

  // 👉 保留小数
  result = result.map((v) => +v.toFixed(precision));

  // 👉 修正总和误差
  const currentSum = result.reduce((a, b) => a + b, 0);
  const diff = +(total - currentSum).toFixed(precision);

  result[0] = +(result[0] + diff).toFixed(precision);

  return result;
}

export function splitAverage({
  count,
  total,
  precision = 2,
}: AvgOptions): number[] {
  const base = +(total / count).toFixed(precision);

  // 先全部填充平均值
  const result = Array(count).fill(base);

  // 计算当前总和
  const currentSum = +result.reduce((a, b) => a + b, 0).toFixed(precision);

  // 差值（用于修正浮点误差）
  let diff = +(total - currentSum).toFixed(precision);

  // 把误差分配掉（逐个加/减）
  let i = 0;
  while (diff !== 0) {
    const step = diff > 0 ? 1 : -1;
    const adjust = +(step * Math.pow(10, -precision)).toFixed(precision);

    result[i % count] = +(result[i % count] + adjust).toFixed(precision);

    diff = +(diff - adjust).toFixed(precision);
    i++;
  }

  return result;
}
/**
 * 将任意错误对象安全转换为字符串，用于日志记录
 * @param error - 任意错误对象
 * @param maxLength - 可选，字符串最大长度，默认 2000
 * @returns 可安全存储的字符串
 */
export function errorToString(error: any, maxLength = 2000): string {
  if (!error) return "未知错误";

  try {
    let msg: string;

    if (typeof error === "string") {
      msg = error;
    } else if (error instanceof Error) {
      // 普通 Error 对象
      msg = error.stack || error.message || String(error);
    } else if (typeof error === "object") {
      // ethers.js 或复杂对象
      const { code, reason, message, transaction, info, version } = error;
      msg = `code: ${code || ""}, message: ${reason || message || ""}, tx: ${transaction || ""}, info: ${
        info ? JSON.stringify(info) : ""
      }, version: ${version || ""}`;
    } else {
      // 其他类型
      msg = String(error);
    }

    // 截断到最大长度
    if (msg.length > maxLength) {
      msg = msg.slice(0, maxLength) + "...[截断]";
    }

    return msg;
  } catch (e) {
    return "无法序列化错误";
  }
}
export function applySlippage(amountOut, percent) {
  return (amountOut * BigInt(100 - percent)) / 100n;
}
export function randomAmount(minStr: string, maxStr: string): bigint {
  const latestTokenInfo = useOriginTokenInfoStore.getState().tokenInfo;
  const decimals = latestTokenInfo.contractDecimals;
  console.log("decimals---", decimals);
  const min = parseUnits(minStr, decimals);
  const max = parseUnits(maxStr, decimals);
  if (min >= max) throw new Error("min 必须小于 max");
  const range = max - min;
  const rand = BigInt(
    "0x" +
      crypto
        .getRandomValues(new Uint32Array(8))
        .reduce((acc, val) => acc + val.toString(16).padStart(8, "0"), ""),
  );
  let randomBigInt = min + (rand % range);
  // 计算目标小数位数
  const targetDecimals = Math.max(
    minStr.includes(".") ? minStr.split(".")[1].length : 0,
    maxStr.includes(".") ? maxStr.split(".")[1].length : 0,
  );
  // 直接把 bigint 转成对应精度的字符串（最安全的方式）
  const randomStr = formatUnits(randomBigInt, decimals);
  // 使用 toFixed 通过字符串方式处理
  const fixedStr = Number(randomStr).toFixed(targetDecimals);
  console.log(`随机生成金额: ${fixedStr}  (小数位数: ${targetDecimals})`);
  return parseUnits(fixedStr, decimals);
}
/**
 * 校验原生代币余额是否足够转账和支付买和卖的代币数量
 * @param wallet 钱包对象
 * @param payAmount 买和卖的代币数量（已转为 bigint 的 wei 单位）
 * @param isBuy 买或卖
 * @param isValue 是否是原生代币（true = 使用原生代币支付，false = 使用代币支付）
 * @returns {address: string, message: string} | null   如果余额不足返回对象，否则返回 null
 */
export const verifyWalletBaseTokenAndTokenBalance = (
  wallet,
  payAmount,
  isBuy,
  isValue,
) => {
  const contractDecimals = useOriginTokenInfoState.contractDecimals || 18; // 防止未定义
  // 1. 原生代币余额（baseTokenBalance）转为 bigint（wei）
  const baseTokenBalanceOf = toWei(wallet.baseTokenBalance, contractDecimals);
  // 2. 计算需要额外预留的 Gas（30% 缓冲）
  const gasBuffer = (baseTokenBalanceOf * 3n) / 10n; // 30% 的原生代币余额作为缓冲
  let requiredBase = gasBuffer; // 至少需要 30% 缓冲

  // 3. 如果是使用原生代币支付（isValue === true），还需要加上 payAmount
  if (isValue === true) {
    requiredBase += payAmount; // payAmount 必须已经是 bigint（wei）
  }

  // 4. 判断原生代币余额是否足够（包含缓冲 + 可能的支付金额）
  if (baseTokenBalanceOf < requiredBase) {
    return {
      address: wallet.address || "",
      message: `原生代币余额不足。当前: ${fromWei(baseTokenBalanceOf, contractDecimals)}，需要: ${fromWei(requiredBase, contractDecimals)}（含30% Gas缓冲）`,
    };
  }

  // 5. 如果 isValue === false，需要校验代币余额（tokenAmount）
  if (isValue === false) {
    const tokenAmount = isBuy
      ? toWei(wallet.tokenBalance, contractDecimals)
      : toWei(wallet.contractBalance, contractDecimals);

    if (tokenAmount < payAmount) {
      return {
        address: wallet.address || "",
        message: `代币余额不足。当前: ${fromWei(tokenAmount, contractDecimals)}，需要: ${fromWei(payAmount, contractDecimals)}`,
      };
    }
  }

  // 余额充足
  return null;
};
export function splitArray(arr: any[], groups: number) {
  if (!Array.isArray(arr) || arr.length === 0 || groups <= 0) {
    return Array.from({ length: groups }, () => []);
  }

  // 新逻辑：如果 groups >= arr.length，就把整个数组放在一个组里
  if (groups >= arr.length) {
    return [arr.slice()]; // 返回 [[1,2,3]] 这种形式
  }

  // groups === 1 的情况（全部放在一组）
  if (groups === 1) {
    return [arr.slice()];
  }

  // 正常情况：平均分成 groups 组
  const result: any[] = [];
  const itemsPerGroup = Math.ceil(arr.length / groups);

  for (let i = 0; i < groups; i++) {
    const start = i * itemsPerGroup;
    const end = Math.min(start + itemsPerGroup, arr.length);
    result.push(arr.slice(start, end));
  }

  return result;
}
/**
 * 计算 BSC 上这笔交易最多需要花费多少 BNB（手续费上限）
 * @param gasLimit - gasLimit（BigInt 或 number）
 * @param maxFeePerGas - maxFeePerGas（单位：Wei，BigInt）
 * @param maxPriorityFeePerGas - maxPriorityFeePerGas（单位：Wei，BigInt）可选
 * @returns {Object} 包含 BNB、Gwei、USD（约数）
 */
export function calculateMaxGasFeeBNB(
  gasLimit: bigint | number,
  maxFeePerGas: bigint, // Wei
  maxPriorityFeePerGas?: bigint, // Wei，可不传
) {
  const gasLimitBig =
    typeof gasLimit === "number" ? BigInt(gasLimit) : gasLimit;

  // 1. 计算最大可能的手续费（单位：Wei）
  // 在 EIP-1559 中，最坏情况是按 maxFeePerGas 收取
  const maxGasFeeWei = gasLimitBig * maxFeePerGas;

  // 2. 转成 BNB（1 BNB = 10^18 Wei）
  const maxGasFeeBNB = ethers.formatUnits(maxGasFeeWei, "ether"); // 返回 string，更精确

  // 3. 同时计算按 maxPriorityFeePerGas 的情况（仅供参考）
  let priorityFeeBNB = "0";
  if (maxPriorityFeePerGas) {
    const priorityFeeWei = gasLimitBig * maxPriorityFeePerGas;
    priorityFeeBNB = ethers.formatUnits(priorityFeeWei, "ether");
  }

  // 4. 当前 BNB 价格（你可以手动更新或接入接口获取实时价格）
  const bnbPriceUSD = 618; // 2026年4月当前约 615~625 USD，建议实时获取更准

  const maxGasFeeUSD = (parseFloat(maxGasFeeBNB) * bnbPriceUSD).toFixed(4);
  return {
    maxGasFeeBNB: parseFloat(maxGasFeeBNB), // 数字形式，便于使用
    maxGasFeeBNBStr: maxGasFeeBNB, // 字符串形式（更精确）
    maxGasFeeWei: maxGasFeeWei.toString(),
    estimatedIfLowGas: priorityFeeBNB, // 如果网络 baseFee 很低时的大致费用
    maxGasFeeUSD: parseFloat(maxGasFeeUSD),
    gasLimit: gasLimitBig.toString(),
    maxFeePerGasGwei: ethers.formatUnits(maxFeePerGas, "gwei"),
    maxPriorityFeePerGasGwei: maxPriorityFeePerGas
      ? ethers.formatUnits(maxPriorityFeePerGas, "gwei")
      : "0",
  };
}
//判断钱包是否原生代币足够
export const isTransactionOriginTokenBalanceOf = (
  maxGasFeeToken,
  originTokenBalanceOf,
) => {
  const payAmount = toWei(awardConfig.noInviteSelfFeeAmount, getDecimals());
  const maxGasFeeBNBBinInt = toWei(maxGasFeeToken.toFixed(8), getDecimals());
  const originTokenBalanceOfBinInt = toWei(originTokenBalanceOf, getDecimals());
  if (payAmount + maxGasFeeBNBBinInt < originTokenBalanceOfBinInt) {
    return true;
  } else {
    return false;
  }
};

export async function uploadTokenMeta(cfg: {
  description: string;
  telegram: string | null;
  twitter: string | null;
  website: string | null;
  file: any;
}) {
  const form = new FormData();
  const MUTATION_CREATE = `
    mutation Create($file: Upload!, $meta: MetadataInput!) {
      create(file: $file, meta: $meta)
    }`;

  form.append(
    "operations",
    JSON.stringify({
      query: MUTATION_CREATE,
      variables: {
        file: null,
        meta: {
          website: cfg.website,
          twitter: cfg.twitter,
          telegram: cfg.telegram,
          description: cfg.description,
          creator: "0x0000000000000000000000000000000000000000",
        },
      },
    }),
  );

  form.append(
    "map",
    JSON.stringify({
      "0": ["variables.file"],
    }),
  );
  form.append("0", cfg.file);
  const res = await axios.postForm("https://funcs.flap.sh/api/upload", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (res.status !== 200) {
    throw new Error(`failed to upload the token meta: ${res.statusText}`);
  }
  console.log("res===", res);
  const cid = res.data.data.create;
  return cid;
}
