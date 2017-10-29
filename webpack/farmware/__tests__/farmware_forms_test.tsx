const mockDevice = {
  execScript: jest.fn(),
  setUserEnv: jest.fn()
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { FarmwareForms } from "../farmware_forms";
import { getDevice } from "../../device";
import { fakeFarmwares } from "../../__test_support__/fake_farmwares";

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
    const runFarmware = getDevice().execScript as jest.Mock<{}>;
    const wrapper = mount(<FarmwareForms
      farmwares={fakeFarmwares()}
      user_env={{}} />);
    const run = wrapper.find("button").first();
    run.simulate("click");
    expect(run.text()).toEqual("Run");
    const argsList = runFarmware.mock.calls[0];
    expect(argsList[0]).toEqual("My Farmware");
    const pairs = argsList[1][0];
    expect(pairs.kind).toEqual("pair");
    expect(pairs.args)
      .toEqual({ "label": "my_farmware_config_1", "value": "4" });
  });

  it("sets env", () => {
    const setUserEnv = getDevice().setUserEnv;
    const wrapper = shallow(<FarmwareForms
      farmwares={fakeFarmwares()}
      user_env={{}} />);
    const input = wrapper.find("BlurableInput").first();
    input.simulate("commit", { currentTarget: { value: "changed value" } });
    expect(setUserEnv).toBeCalledWith({
      "my_farmware_config_1": "changed value"
    });
  });
});
