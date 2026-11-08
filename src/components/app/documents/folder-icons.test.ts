import { Camera, Folder } from "lucide-react";
import { describe, expect, it } from "vitest";

import { getFolderIcon } from "./folder-icons";

describe("getFolderIcon", () => {
  it("returns the known icon for a seed folder", () => {
    expect(getFolderIcon("imagenes")).toBe(Camera);
  });
  it("falls back to the generic folder icon", () => {
    expect(getFolderIcon("contratos")).toBe(Folder);
  });
});
