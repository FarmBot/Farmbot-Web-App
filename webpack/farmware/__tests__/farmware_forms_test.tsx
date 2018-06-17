const mockDevice = {
  execScript: jest.fn(() => Promise.resolve({})),
  setUserEnv: jest.fn(() => Promise.resolve({}))
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { FarmwareForms } from "../farmware_forms";
import { fakeFarmwares } from "../../__test_support__/fake_farmwares";
import { clickButton } from "../../__test_support__/helpers";

describe("<FarmwareForms/>", () => {
  it("doesn't render", () => {
    const farmwares = fakeFarmwares();
    const farmware = farmwares.farmware_0;
    if (farmware) { farmware.config = []; }
    const wrapper = mount(<FarmwareForms
      farmwares={farmwares}
      user_env={{}} />);
    expect(wrapper.text()).toEqual("");
  });

  it("renders", () => {
    const wrapper = mount(<FarmwareForms
      farmwares={fakeFarmwares()}
      user_env={{}} />);
    ["My Farmware", "version: 0.0.0", "Does things."].map(string =>
      expect(wrapper.text()).toContain(string));
    expect(wrapper.find("label").last().text()).toContain("Config 1");
    expect(wrapper.find("input").props().value).toEqual("4");
  });

  it("runs", () => {
    const wrapper = mount(<FarmwareForms
      farmwares={fakeFarmwares()}
      user_env={{}} />);
    clickButton(wrapper, 0, "run");
    expect(mockDevice.execScript).toHaveBeenCalledWith(
      "My Farmware", [{
        kind: "pair",
        args: { label: "my_farmware_config_1", value: "4" }
      }]
    );
  });

  it("sets env", () => {
    const wrapper = shallow(<FarmwareForms
      farmwares={fakeFarmwares()}
      user_env={{}} />);
    const input = wrapper.find("BlurableInput").first();
    input.simulate("commit", { currentTarget: { value: "changed value" } });
    expect(mockDevice.setUserEnv).toBeCalledWith({
      "my_farmware_config_1": "changed value"
    });
  });
});
