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
    expectCSS("yellow", undefined);
  });

  it("renders saucer color: ok", () => {
    expectCSS("green", true);
  });

  it("renders saucer color: header", () => {
    const el = render(<ConnectivityRow from="from" to="to" header={true} />);
    expect(el.find(".grey").length).toBe(1);
  });

  it("renders saucer connector color: firmware", () => {
    const el = render(<ConnectivityRow
      from="A" to="B"
      connectionStatus={undefined}
      connectionName="botFirmware" />);
    expect(el.find(".yellow").length).toBe(1);
    expect(el.find(".red").length).toBe(1);
  });
});
