import * as React from "react";
import { ControlsPopup } from "../controls_popup";
import { mount } from "enzyme";
import { State } from "../controls_popup";
import { DirectionButton } from "../controls/direction_button";

describe("<ControlsPopup />", () => {
  let wrapper = mount(<ControlsPopup dispatch={jest.fn()} />);
  let button = mount(<DirectionButton
    axis="x"
    direction="left"
    isInverted={false}
    steps={1000}
  />);

  it("Has a false initial state", () => {
    expect(wrapper.state("isOpen")).toBeFalsy();
  });

  it("Toggles state", () => {
    let parent = wrapper.find("div").first();
    parent.simulate("click");
    expect(wrapper.state("isOpen")).toBeTruthy();
  });

});
