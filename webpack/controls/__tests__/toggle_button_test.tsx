import * as React from "react";
import { mount } from "enzyme";
import { ToggleButton } from "../toggle_button";

describe("<ToggleButton/>", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls toggle action", () => {
    const toggle = jest.fn();
    let node = mount(<ToggleButton
      toggleValue={0}
      toggleAction={() => toggle()} />);
    node.simulate("click");
    expect(toggle.mock.calls.length).toEqual(1);
  });
});
