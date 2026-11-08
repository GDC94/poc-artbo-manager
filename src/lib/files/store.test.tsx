// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = new Map<string, unknown>();
const setSpy = vi.fn();
vi.mock("idb-keyval", () => ({
  get: async (k: string) => db.get(k),
  set: async (k: string, v: unknown) => {
    setSpy(k, v);
    db.set(k, v);
  },
  del: async (k: string) => void db.delete(k),
}));

import { FILES_CHANGED_EVENT, filesKey, LEGACY_FILES_KEY } from "./persistence";
import { FilesProvider, useFiles } from "./store";

const stored = (id: string, status?: string) => ({
  id,
  name: `${id}.png`,
  size: 1,
  type: "image/png",
  addedAt: 1,
  blob: new Blob(["x"]),
  ...(status ? { status } : {}),
});

function Probe() {
  const { state, addFiles, setFileStatus, setFileComment } = useFiles();
  const files = state.folders.logos ?? [];
  return (
    <div>
      <p data-testid="hydrated">{String(state.hydrated)}</p>
      <ul>
        {files.map((f) => (
          <li key={f.id}>{`${f.id}:${f.status}`}</li>
        ))}
      </ul>
      <button onClick={() => addFiles("logos", [new File(["x"], "n.png", { type: "image/png" })])}>add</button>
      <button onClick={() => setFileStatus("logos", "a", "approved")}>approve-a</button>
      <button onClick={() => setFileComment("logos", "a", "Falta fondo")}>comment-a</button>
      <button onClick={() => setFileStatus("logos", "nope", "approved")}>approve-unknown</button>
    </div>
  );
}

const mount = (props: Partial<React.ComponentProps<typeof FilesProvider>> = {}) =>
  render(
    <FilesProvider ownerId="p-01" {...props}>
      <Probe />
    </FilesProvider>,
  );

const hydrated = () => waitFor(() => expect(screen.getByTestId("hydrated").textContent).toBe("true"));

describe("FilesProvider", () => {
  beforeEach(() => {
    db.clear();
    setSpy.mockClear();
  });
  afterEach(cleanup);

  it("starts uploads as pending by default", async () => {
    mount();
    await hydrated();
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByRole("listitem").textContent).toMatch(/:pending$/);
  });

  it("starts uploads as approved when the provider says so", async () => {
    mount({ initialFileStatus: "approved" });
    await hydrated();
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByRole("listitem").textContent).toMatch(/:approved$/);
  });

  it("does not write anything before the user changes something", async () => {
    db.set(filesKey("p-01"), { logos: [stored("a")] });
    mount();
    await hydrated();
    await act(async () => {});
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("persists a decision, and a freshly mounted provider reads it", async () => {
    db.set(filesKey("p-01"), { logos: [stored("a")] });
    const admin = mount();
    await hydrated();
    fireEvent.click(screen.getByText("approve-a"));
    await waitFor(() => expect(setSpy).toHaveBeenCalledTimes(1));
    admin.unmount();

    mount();
    expect(await screen.findByText("a:approved")).toBeTruthy();
  });

  it("stamps the decision time and announces the write once it resolves", async () => {
    db.set(filesKey("p-01"), { logos: [stored("a")] });
    const changed = vi.fn();
    window.addEventListener(FILES_CHANGED_EVENT, changed);
    mount();
    await hydrated();
    fireEvent.click(screen.getByText("approve-a"));
    await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
    window.removeEventListener(FILES_CHANGED_EVENT, changed);
    const saved = (db.get(filesKey("p-01")) as { logos: { reviewedAt?: number }[] }).logos[0];
    expect(typeof saved.reviewedAt).toBe("number");
  });

  it("persists a comment with its timestamp", async () => {
    db.set(filesKey("p-01"), { logos: [stored("a")] });
    mount();
    await hydrated();
    fireEvent.click(screen.getByText("comment-a"));
    await waitFor(() => expect(setSpy).toHaveBeenCalledTimes(1));
    const saved = (db.get(filesKey("p-01")) as { logos: { comment?: string; commentedAt?: number }[] }).logos[0];
    expect(saved.comment).toBe("Falta fondo");
    expect(typeof saved.commentedAt).toBe("number");
  });

  it("does not announce anything when nothing was written", async () => {
    db.set(filesKey("p-01"), { logos: [stored("a")] });
    const changed = vi.fn();
    window.addEventListener(FILES_CHANGED_EVENT, changed);
    mount();
    await hydrated();
    await act(async () => {});
    window.removeEventListener(FILES_CHANGED_EVENT, changed);
    expect(changed).not.toHaveBeenCalled();
  });

  it("ignores a decision for an unknown file without writing", async () => {
    db.set(filesKey("p-01"), { logos: [stored("a")] });
    mount();
    await hydrated();
    fireEvent.click(screen.getByText("approve-unknown"));
    await act(async () => {});
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("migrates the legacy key for the participant provider", async () => {
    db.set(LEGACY_FILES_KEY, { logos: [stored("a", "approved")] });
    mount({ migrateLegacy: true });
    expect(await screen.findByText("a:pending")).toBeTruthy();
    expect(db.has(LEGACY_FILES_KEY)).toBe(false);
  });

  it("re-reads on window focus without writing back", async () => {
    db.set(filesKey("p-01"), { logos: [stored("a")] });
    mount();
    expect(await screen.findByText("a:pending")).toBeTruthy();

    db.set(filesKey("p-01"), { logos: [stored("a", "rejected")] });
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(await screen.findByText("a:rejected")).toBeTruthy();
    await act(async () => {});
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("re-reads when the tab becomes visible", async () => {
    db.set(filesKey("p-01"), { logos: [stored("a")] });
    mount();
    await screen.findByText("a:pending");
    db.set(filesKey("p-01"), { logos: [stored("a", "approved")] });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(await screen.findByText("a:approved")).toBeTruthy();
  });

  it("does not let a stale re-read clobber an edit made while it was in flight", async () => {
    db.set(filesKey("p-01"), { logos: [stored("a")] });
    mount();
    await screen.findByText("a:pending");
    db.set(filesKey("p-01"), { logos: [stored("a", "rejected")] });
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      fireEvent.click(screen.getByText("approve-a"));
    });
    await waitFor(() => expect(setSpy).toHaveBeenCalled());
    expect(screen.getByText("a:approved")).toBeTruthy();
    expect((db.get(filesKey("p-01")) as { logos: { status: string }[] }).logos[0].status).toBe("approved");
  });
});
