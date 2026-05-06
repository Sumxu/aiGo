// 金额精度处理工具

// 转整数（避免浮点误差）
const toInt = (num: number | string) => {
  const str = num.toString();
  if (str.includes(".")) {
    const len = str.split(".")[1].length;
    return {
      int: Number(str.replace(".", "")),
      pow: len,
    };
  }
  return {
    int: Number(str),
    pow: 0,
  };
};

// 精度统一
const unifyPow = (a: any, b: any) => {
  const pow = Math.max(a.pow, b.pow);
  const ai = a.int * Math.pow(10, pow - a.pow);
  const bi = b.int * Math.pow(10, pow - b.pow);
  return { ai, bi, pow };
};

export const Calc = {
  add(a: number | string, b: number | string) {
    const na = toInt(a);
    const nb = toInt(b);
    const { ai, bi, pow } = unifyPow(na, nb);
    return (ai + bi) / Math.pow(10, pow);
  },

  sub(a: number | string, b: number | string) {
    const na = toInt(a);
    const nb = toInt(b);
    const { ai, bi, pow } = unifyPow(na, nb);
    return (ai - bi) / Math.pow(10, pow);
  },

  mul(a: number | string, b: number | string) {
    const na = toInt(a);
    const nb = toInt(b);
    return (na.int * nb.int) / Math.pow(10, na.pow + nb.pow);
  },

  div(a: number | string, b: number | string) {
    const na = toInt(a);
    const nb = toInt(b);
    return (na.int / nb.int) * Math.pow(10, nb.pow - na.pow);
  },

  // 保留 n 位小数
  toFixed(num: number | string, n = 2) {
    return Number(num).toFixed(n);
  },
};
