jest.mock("../../css/_index.scss");

import * as React from "react";
import { Wow } from "../index";

describe("<Wow/>", () => {
  it("toggles server options", () => {
    let x = new Wow();
    x.props = {};
    x.setState({});
    expect(x.state.hideServerSettings).toBeFalsy();
    x.toggleServerOpts();
    expect(x.state.hideServerSettings).toBe(true);
  });
});
