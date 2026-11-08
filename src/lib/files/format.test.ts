import { describe, expect, it } from "vitest";
import { formatSize, pluralFiles, summarizeFolder } from "./format";

const MB = 1024 * 1024;

describe("formatSize", () => {
  it("uses a comma decimal separator and one decimal", () => {
    expect(formatSize(0.1 * MB)).toBe("0,1 MB");
    expect(formatSize(18.44 * MB)).toBe("18,4 MB");
  });
  it("switches to KB below 0,1 MB", () => {
    expect(formatSize(45 * 1024)).toBe("45 KB");
    expect(formatSize(1536)).toBe("2 KB");
  });
  it("uses bytes below 1 KB", () => {
    expect(formatSize(0)).toBe("0 B");
    expect(formatSize(512)).toBe("512 B");
  });
});

describe("pluralFiles", () => {
  it("is singular for one and plural otherwise", () => {
    expect(pluralFiles(1)).toBe("1 archivo");
    expect(pluralFiles(0)).toBe("0 archivos");
    expect(pluralFiles(3)).toBe("3 archivos");
  });
});

describe("summarizeFolder", () => {
  it("says the folder is empty", () => {
    expect(summarizeFolder([])).toBe("Carpeta vacía");
  });
  it("summarizes count and total size", () => {
    expect(summarizeFolder([{ size: 0.1 * MB }])).toBe("1 archivo · 0,1 MB");
    expect(summarizeFolder([{ size: 1 * MB }, { size: 2.5 * MB }])).toBe("2 archivos · 3,5 MB");
  });
});
