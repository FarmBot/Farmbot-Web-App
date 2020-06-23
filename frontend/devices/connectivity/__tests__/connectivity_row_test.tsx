import * as React from "react";
import { render } from "enzyme";
import { ConnectivityRow } from "../connectivity_row";

describe("<ConnectivityRow/>", () => {
  function expectCSS(color: string, givenStatus: boolean | undefined) {
    const el = render(<ConnectivityRow
      connectionStatus={givenStatus} from="A" to="B" />);
    expect(el.find("." + color).length).toBe(2);
  }

  it("renders saucer color: error", () => {
    expectCSS("red", false);
  });

  it("renders saucer color: unknown", () => {
    expectCSS("gray", undefined);
  });

  it("renders saucer color: ok", () => {
    expectCSS("green", true);
  });

  it("renders saucer color: header", () => {
    const wrapper = render(<ConnectivityRow from="from" to="to" header={true} />);
    expect(wrapper.find(".grey").length).toBe(1);
    ["from", "to", "last message seen"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("renders large row", () => {
    const wrapper = render(<ConnectivityRow from="browser" to="to" />);
    expect(wrapper.text().toLowerCase()).toContain("this computer");
  });

  it("renders small row", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 400,
      configurable: true
    });
    const wrapper = render(<ConnectivityRow from="browser" to="to" />);
    expect(wrapper.text().toLowerCase()).toContain("this phone");
  });

  it("renders saucer connector color: firmware", () => {
    const el = render(<ConnectivityRow
      from="A" to="B"
      connectionStatus={undefined}
      connectionName="botFirmware" />);
    expect(el.find(".gray").length).toBe(1);
    expect(el.find(".red").length).toBe(1);
  });
});
