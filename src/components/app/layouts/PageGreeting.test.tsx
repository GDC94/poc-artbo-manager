// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AdminProvider } from "@/lib/admin/store";

import { PageGreeting } from "./PageGreeting";

describe("PageGreeting", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("greets the admin participant the viewer is anchored to", () => {
    render(
      <AdminProvider>
        <PageGreeting subtitle="x" />
      </AdminProvider>,
    );
    expect(screen.getByText("Hola Valentina,")).toBeTruthy();
  });

  it("uses the explicit name when one is passed", () => {
    render(
      <AdminProvider>
        <PageGreeting subtitle="x" name="Admin" />
      </AdminProvider>,
    );
    expect(screen.getByText("Hola Admin,")).toBeTruthy();
  });
});
