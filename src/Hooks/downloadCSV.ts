// utils/downloadCSV.ts
export interface CSVHeader {
  label: string;
  key: string;
}

export function downloadCSV<T>(
  data: T[],
  headers: CSVHeader[],
  filename: string = "data.csv"
) {
  const csvRows: string[] = [];

  // 生成表头
  csvRows.push(headers.map(h => h.label).join(","));

  // 生成数据行
  data.forEach(row => {
    const values = headers.map(h => {
      const val = (row as any)[h.key];
      // 如果包含逗号或换行符，包裹双引号
      return typeof val === "string" && (val.includes(",") || val.includes("\n"))
        ? `"${val}"`
        : val ?? "";
    });
    csvRows.push(values.join(","));
  });

  // 拼接 CSV 内容并加 BOM 防止 Excel 中文乱码
  const csvString = "\uFEFF" + csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  // 创建临时下载链接并触发
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}