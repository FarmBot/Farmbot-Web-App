jest.mock("../../map/layers/farmbot/bot_trail", () => ({
  resetVirtualTrail: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import { PlainDesignerSettings } from "../farm_designer_settings";
import { DesignerSettingsPropsBase } from "../interfaces";
import { resetVirtualTrail } from "../../map/layers/farmbot/bot_trail";

describe("<PlainDesignerSettings />", () => {
  const fakeProps = (): DesignerSettingsPropsBase => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<div>{PlainDesignerSettings(fakeProps())}</div>);
    expect(wrapper.text().toLowerCase()).toContain("plant animations");
  });

  it("doesn't call callback", () => {
    const wrapper = mount(<div>{PlainDesignerSettings(fakeProps())}</div>);
    expect(wrapper.find("label").at(0).text()).toContain("animations");
    wrapper.find("button").at(0).simulate("click");
    expect(resetVirtualTrail).not.toHaveBeenCalled();
  });

  it("calls callback", () => {
    const wrapper = mount(<div>{PlainDesignerSettings(fakeProps())}</div>);
    expect(wrapper.find("label").at(1).text()).toContain("trail");
    wrapper.find("button").at(1).simulate("click");
    expect(resetVirtualTrail).toHaveBeenCalled();
  });
});
