import * as React from "react";
import { render } from "enzyme";
import { ConnectivityRow } from "../connectivity_row";

describe("<ConnectivityRow/>", () => {
  function expectCSS(color: string, givenStatus: boolean | undefined) {
    const el = render(<ConnectivityRow
      connectionStatus={givenStatus} from="A" to="B" />);
    expect(el.find("." + color).length).toBe(2);
  }

  it("renders saucer colors", () => {
    expectCSS("red", false);
    expectCSS("grey", undefined);
    expectCSS("green", true);
  });
});
