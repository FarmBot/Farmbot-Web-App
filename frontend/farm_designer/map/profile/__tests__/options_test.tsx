import React from "react";
import { mount, shallow } from "enzyme";
import { ProfileOptions } from "../options";
import { ProfileOptionsProps } from "../interfaces";
import { Actions } from "../../../../constants";
import {
  fakeDesignerState,
} from "../../../../__test_support__/fake_designer_state";

describe("<ProfileOptions />", () => {
  const fakeProps = (): ProfileOptionsProps => ({
    dispatch: jest.fn(),
    designer: fakeDesignerState(),
    expanded: false,
    setExpanded: jest.fn(),
  });

  it("changes axis to y", () => {
    const p = fakeProps();
    p.designer.profileAxis = "x";
    const wrapper = mount(<ProfileOptions {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_AXIS,
      payload: "y",
    });
  });

  it("changes axis to x", () => {
    const p = fakeProps();
    p.designer.profileAxis = "y";
    const wrapper = mount(<ProfileOptions {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_AXIS,
      payload: "x",
    });
  });

  it("changes width", () => {
    const p = fakeProps();
    const wrapper = shallow(<ProfileOptions {...p} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { value: "200" }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_WIDTH,
      payload: 200,
    });
  });

  it("expands profile", () => {
    const p = fakeProps();
    const wrapper = mount(<ProfileOptions {...p} />);
    wrapper.find("i").last().simulate("click");
    expect(p.setExpanded).toHaveBeenCalledWith(true);
  });

  it("changes follow bot setting", () => {
    const p = fakeProps();
    const wrapper = mount(<ProfileOptions {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_FOLLOW_BOT,
      payload: true,
    });
  });
});
