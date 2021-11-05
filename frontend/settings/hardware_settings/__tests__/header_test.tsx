import React from "react";
import { Header, HeaderProps } from "../header";
import { mount } from "enzyme";
import { DeviceSetting, Actions } from "../../../constants";

describe("<Header />", () => {
  const fakeProps = (): HeaderProps => ({
    dispatch: jest.fn(),
    panel: "motors",
    title: DeviceSetting.motors,
    expanded: true,
  });

  it("renders", () => {
    const wrapper = mount(<Header {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("motors");
    expect(wrapper.find(".fa-minus").length).toBe(1);
  });

  it("handles click", () => {
    const p = fakeProps();
    const wrapper = mount(<Header {...p} />);
    wrapper.simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_SETTINGS_PANEL_OPTION,
      payload: "motors",
    });
  });
});
