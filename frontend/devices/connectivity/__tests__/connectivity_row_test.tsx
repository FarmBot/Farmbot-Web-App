let mockIsMobile = false;
jest.mock("../../../screen_size", () => ({
  isMobile: () => mockIsMobile,
}));

import React from "react";
import { render } from "enzyme";
import { ConnectivityRow, StatusRowProps } from "../connectivity_row";

describe("<ConnectivityRow />", () => {
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
    const wrapper = render(<ConnectivityRow {...p} />);
    expect(wrapper.find("." + color).length).toBe(2);
  });

  it("renders saucer color: header", () => {
    const p = fakeProps();
    p.header = true;
    const wrapper = render(<ConnectivityRow {...p} />);
    expect(wrapper.find(".grey").length).toBe(1);
    ["from", "to", "last message seen"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("renders large row", () => {
    const p = fakeProps();
    p.from = "browser";
    const wrapper = render(<ConnectivityRow {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("this computer");
  });

  it("renders small row", () => {
    mockIsMobile = true;
    const p = fakeProps();
    p.from = "browser";
    const wrapper = render(<ConnectivityRow {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("this phone");
  });

  it("renders saucer connector color: firmware", () => {
    const p = fakeProps();
    p.connectionStatus = undefined;
    p.connectionName = "botFirmware";
    const wrapper = render(<ConnectivityRow {...p} />);
    expect(wrapper.find(".gray").length).toBe(1);
    expect(wrapper.find(".red").length).toBe(1);
  });

  it("renders sync status", () => {
    const p = fakeProps();
    p.syncStatus = "syncing";
    const wrapper = render(<ConnectivityRow {...p} />);
    expect(wrapper.html()).toContain("fa-spinner");
  });
});
