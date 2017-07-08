import * as React from "react";
import { ControlsPopup } from "../controls_popup";
import { render } from "enzyme";

describe("<ControlsPopup />", () => {
  it("renders a controls menu", () => {
    let popup = render(<ControlsPopup />);
    let divs = popup.find("div");
    expect(divs.length).toEqual(1);
  });
});
