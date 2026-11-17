import { describe, expect, it, vi } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { resolve } from "node:path";
import { loadPackage, parseFile, rank } from "./demo-inference";

const sample = resolve("../../datos/202510_ejemplo.xlsx");
const model = resolve("../../pipeline/data/demo/package.json");
describe("demostración mensual", () => {
  it("acepta códigos de residencia y fechas colombianas", () => {
    const csv =
      "COD_DPTO_R,COD_MUN_R,INI_SIN,confirmados\n50,001,8/10/2025 12:00:00,1\n50,001,2025-02-30,1\n";
    const upload = parseFile(new TextEncoder().encode(csv).buffer);
    expect(upload.last).toBe("2025-10");
    expect(upload.confirmed).toBe(1);
    expect(upload.rejected).toBe(1);
    expect(upload.counts.get("50001:2025-10")).toBe(1);
  });
  it.skipIf(!existsSync(sample) || !existsSync(model))(
    "procesa el ejemplo local con el modelo local",
    () => {
      const bytes = readFileSync(sample);
      const upload = parseFile(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      );
      const pkg = JSON.parse(readFileSync(model, "utf8")).payload;
      const result = rank(pkg, upload);
      expect(upload.total).toBe(231);
      expect(upload.last).toBe("2025-10");
      expect(result.some((r) => r.probability !== null)).toBe(true);
      expect(
        result.every((r) => r.probability === null || (r.probability >= 0 && r.probability <= 1)),
      ).toBe(true);
    },
  );
  it.skipIf(!existsSync(model))("verifica la integridad del paquete local", async () => {
    vi.stubGlobal("crypto", webcrypto);
    const text = readFileSync(model, "utf8");
    const file = { text: async () => text } as File;
    expect((await loadPackage(file)).metadata.kind).toBe("synthetic");
    await expect(
      loadPackage({ text: async () => text.replace('"horizon":2', '"horizon":1') } as File),
    ).rejects.toThrow();
    vi.unstubAllGlobals();
  });
});
