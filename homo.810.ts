interface DemolishResult {
  success: boolean;
  result: string;
}

const NumberTable = {
  2: "(8+1+0)-(8-1-0)",
  1: "(8+1+0)-(8*1+0)",
  0: "8*1*0",
  [-1]: "(8*1+0)-(8+1+0)",
};

/**
 * @description homo
 * @param {number} number
 * @returns {DemolishResult}
 */
const homo: (number: number) => DemolishResult = (() => {
  const numsReversed = Object.keys(NumberTable)
    .map((x) => +x)
    .filter((x) => x > 0);
  const getMinDiv = (num: number) => {
    for (let i = numsReversed.length | 0; i >= 0; i = (i - 1) | 0) {
      if (num >= numsReversed[i]) {
        return numsReversed[i];
      }
    }

    return null;
  };
  const isDotRegex = /\.(\d+?)0{0,}$/;
  const demolish = (num: number): DemolishResult => {
    if (num === Infinity || Number.isNaN(num) || typeof num !== "number")
      return {
        success: false,
        result: "Invalid Number",
      };

    if (num < 0) {
      const demolishRevResult = demolish(num * -1);
      if (!demolishRevResult.success) return demolishRevResult;

      return {
        success: true,
        result: `(-1)*(${demolishRevResult.result})`.replace(/\*\(1\)/g, ""),
      };
    }

    if (!Number.isInteger(num)) {
      const match = num.toFixed(16).match(isDotRegex);

      if (!match) {
        return {
          success: false,
          result: "Invalid Number",
        };
      }

      const n = match[1].length;

      const demolishDecResult = demolish(num * Math.pow(10, n));

      if (!demolishDecResult) return demolishDecResult;

      return {
        success: true,
        result: `(${demolishDecResult.result})/(10)^(${n})`,
      };
    }

    if (num in NumberTable) {
      return {
        success: true,
        result: String(num),
      };
    }

    const div = getMinDiv(num);

    if (!div) {
      return {
        success: false,
        result: "Impossible number",
      };
    }

    const demolishQuoResult = demolish(Math.floor(num / div));
    if (!demolishQuoResult.success) return demolishQuoResult;

    const demolishRemResult = demolish(num % div);
    if (!demolishRemResult.success) return demolishRemResult;

    return {
      success: true,
      result: (
        `${div}*(${demolishQuoResult.result})+` +
        `(${demolishRemResult.result})`
      ).replace(/\*\(1\)|\+\(0\)$/g, ""),
    };
  };

  const finisher = (expr: string) => {
    expr = expr
      .replace(/\d+|-1/g, (n) =>
        n in NumberTable
          ? NumberTable[Number(n) as keyof typeof NumberTable]
          : ""
      )
      .replace("^", "**");
    while (expr.match(/[\*|\/]\([^\+\-\(\)]+\)/))
      expr = expr.replace(
        /([\*|\/])\(([^\+\-\(\)]+)\)/,
        (_m, $1, $2) => $1 + $2
      );
    while (expr.match(/[\+|\-]\([^\(\)]+\)[\+|\-|\)]/))
      expr = expr.replace(
        /([\+|\-])\(([^\(\)]+)\)([\+|\-|\)])/,
        (_m, $1, $2, $3) => $1 + $2 + $3
      );
    while (expr.match(/[\+|\-]\(([^\(\)]+)\)$/))
      expr = expr.replace(/([\+|\-])\(([^\(\)]+)\)$/, (_m, $1, $2) => $1 + $2);
    if (expr.match(/^\([^\(\)]+?\)$/))
      expr = expr.replace(/^\(([^\(\)]+)\)$/, "$1");

    expr = expr.replace(/\+-/g, "-");
    return expr;
  };

  return (num: number) => {
    const demolishResult = demolish(num);

    if (demolishResult.success) {
      return {
        success: true,
        result: finisher(demolishResult.result),
      };
    } else {
      return demolishResult;
    }
  };
})();

export { homo };
