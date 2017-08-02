import * as React from "react";
import { ControlsPopup } from "../controls_popup";
import { mount } from "enzyme";

describe("<ControlsPopup />", () => {
  let wrapper = mount(<ControlsPopup dispatch={jest.fn()} />);

  it("Has a false initial state", () => {
    expect(wrapper.state("isOpen")).toBeFalsy();
  });

  it("Toggles state", () => {
    let parent = wrapper.find("div").first();
    parent.simulate("click");
    expect(wrapper.state("isOpen")).toBeTruthy();
  });

});
