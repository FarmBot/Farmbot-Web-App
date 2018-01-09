jest.mock("../../actions", () => ({ settingToggle: jest.fn() }));
import * as React from "react";
import { mount } from "enzyme";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToggleButton } from "../../../controls/toggle_button";
import { settingToggle } from "../../actions";
import { initialState } from "../../reducer";

describe("BooleanMCUInputGroup", () => {
  it("triggers callbacks", () => {
    const dispatch = jest.fn();
    const el = mount(<BooleanMCUInputGroup
      bot={initialState()}
      dispatch={dispatch}
      name={"Name"}
      x={"encoder_invert_x"}
      y={"encoder_invert_y"}
      z={"encoder_enabled_z"} />);
    enum Buttons { xAxis, yAxis, zAxis }
    const xEl = el.find(ToggleButton).at(Buttons.xAxis);
    const yEl = el.find(ToggleButton).at(Buttons.yAxis);
    const zEl = el.find(ToggleButton).at(Buttons.zAxis);
    jest.clearAllMocks();
    xEl.simulate("click");
    const q = settingToggle;
    expect(settingToggle)
      .toHaveBeenCalledWith("encoder_invert_x", expect.any(Object), undefined);
    yEl.simulate("click");
    expect(settingToggle)
      .toHaveBeenCalledWith("encoder_invert_y", expect.any(Object), undefined);
    zEl.simulate("click");
    expect(settingToggle)
      .toHaveBeenCalledWith("encoder_enabled_z", expect.any(Object), undefined);
  });
});
