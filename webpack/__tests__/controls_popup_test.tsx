import * as React from "react";
import { ControlsPopup } from "../controls_popup";
import { mount } from "enzyme";

describe("<ControlsPopup />", () => {
  const wrapper = mount(<ControlsPopup dispatch={jest.fn()} />);

  it("Has a false initial state", () => {
    expect(wrapper.state("isOpen")).toBeFalsy();
  });

  it("Toggles state", () => {
    const parent = wrapper.find("i").first();
    parent.simulate("click");
    expect(wrapper.state("isOpen")).toBeTruthy();
  });

});
