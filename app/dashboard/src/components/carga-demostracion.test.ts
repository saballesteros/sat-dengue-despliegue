import { describe, expect, it } from "vitest";
import { summarizeCsv } from "@/lib/demo-summary";

describe("carga CSV", () => {
  it("resume confirmados y rechaza códigos y fechas inválidas", () => {
    const csv =
      "municipality_code,INI_SIN,confirmados\n50001,2025-10-01,1\n123,2025-10-01,1\n73001,2025-02-30,1\n73001,2025-10-03,0\n";
    expect(summarizeCsv(csv)).toEqual({
      total: 4,
      confirmed: 1,
      rejected: 2,
      municipalities: 1,
      last: "2025-10",
    });
  });

  it("rechaza archivos sin las columnas requeridas", () => {
    expect(() => summarizeCsv("municipality_code,INI_SIN\n50001,2025-10-01")).toThrow();
  });
});
