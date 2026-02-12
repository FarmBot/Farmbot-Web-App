import React from "react";
import { render } from "@testing-library/react";
import { ConnectivityRow, StatusRowProps } from "../connectivity_row";

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
};

describe("<ConnectivityRow />", () => {
  beforeEach(() => setWindowWidth(1000));

  const fakeProps = (): StatusRowProps => ({
    from: "from",
    to: "to",
  });

  it.each<[string, string, boolean | undefined]>([
    ["error", "red", false],
    ["unknown", "gray", undefined],
    ["ok", "green", true],
  ])("renders saucer color: %s", (_status, color, connectionStatus) => {
    const p = fakeProps();
    p.connectionStatus = connectionStatus;
    const { container } = render(<ConnectivityRow {...p} />);
    expect(container.querySelectorAll("." + color).length).toBe(2);
  });

  it("renders saucer color: header", () => {
    const p = fakeProps();
    p.header = true;
    const { container } = render(<ConnectivityRow {...p} />);
    expect(container.querySelectorAll(".grey").length).toBe(1);
    ["from", "to", "last message seen"].map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string));
  });

  it("renders large row", () => {
    const p = fakeProps();
    p.from = "browser";
    const { container } = render(<ConnectivityRow {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("this computer");
  });

  it("renders small row", () => {
    setWindowWidth(400);
    const p = fakeProps();
    p.from = "browser";
    const { container } = render(<ConnectivityRow {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("this phone");
  });

  it("renders saucer connector color: firmware", () => {
    const p = fakeProps();
    p.connectionStatus = undefined;
    p.connectionName = "botFirmware";
    const { container } = render(<ConnectivityRow {...p} />);
    expect(container.querySelectorAll(".gray").length).toBe(1);
    expect(container.querySelectorAll(".red").length).toBe(1);
  });

  it("renders sync status", () => {
    const p = fakeProps();
    p.syncStatus = "syncing";
    const { container } = render(<ConnectivityRow {...p} />);
    expect(container.innerHTML).toContain("fa-spinner");
  });
});
