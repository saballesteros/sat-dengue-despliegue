type Summary = {
  total: number;
  confirmed: number;
  rejected: number;
  municipalities: number;
  last: string;
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && (c === "," || c === "\n")) {
      row.push(field.trim());
      field = "";
      if (c === "\n") {
        rows.push(row);
        row = [];
      }
    } else if (c !== "\r") field += c;
  }
  if (quoted) throw new Error("CSV con comillas sin cerrar.");
  if (field || row.length) {
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

export function summarizeCsv(text: string): Summary {
  const rows = parseCsv(text.replace(/^\uFEFF/, ""));
  const headers = (rows.shift() ?? []).map((s) => s.toLowerCase());
  const columns = ["municipality_code", "ini_sin", "confirmados"].map((s) => headers.indexOf(s));
  if (columns.some((i) => i < 0))
    throw new Error("Faltan columnas: municipality_code, INI_SIN y confirmados.");
  let confirmed = 0,
    rejected = 0,
    last = "";
  const municipalities = new Set<string>();
  for (const row of rows) {
    if (row.every((v) => !v)) continue;
    const [code = "", date = "", value = ""] = columns.map((i) => row[i] ?? "");
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
    if (
      !/^\d{5}$/.test(code) ||
      !parsed ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date ||
      !["0", "1"].includes(value)
    ) {
      rejected++;
      continue;
    }
    if (value === "1") {
      confirmed++;
      municipalities.add(code);
      last = last > date.slice(0, 7) ? last : date.slice(0, 7);
    }
  }
  return {
    total: rows.filter((r) => r.some(Boolean)).length,
    confirmed,
    rejected,
    municipalities: municipalities.size,
    last,
  };
}
