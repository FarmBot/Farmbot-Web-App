import * as React from "react";
import { ControlsPopup } from "../controls_popup";
import { render } from "enzyme";

describe("<ControlsPopup />", () => {

  let popup = render(<ControlsPopup />);
  let container = popup.find("controls-popupp");

  it("Has correct amount of children elements", () => {
    let divs = popup.find("div");
    expect(divs.length).toEqual(1);
  });

  it("Has correct classname", () => {
    expect(container).toBeTruthy();
  });

  it("Has public render", () => {
    expect(popup).toHaveProperty("render");
  });

});
