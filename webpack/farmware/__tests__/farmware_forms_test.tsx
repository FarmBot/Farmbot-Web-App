const mockDevice = {
  execScript: jest.fn()
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount } from "enzyme";
import { FarmwareForms } from "../farmware_forms";
import { getDevice } from "../../device";
import { FarmwareManifest, Dictionary } from "farmbot";

function fakeFarmwares(): Dictionary<FarmwareManifest | undefined> {
  return {
    "farmware_0": {
      name: "My Farmware",
      uuid: "farmware_0",
      executable: "forth",
      args: ["my_farmware.fth"],
      url: "https://",
      path: "my_farmware",
      config: [{ name: "config_1", label: "Config 1", value: "4" }],
      meta: {
        min_os_version_major: "3",
        description: "Does things.",
        language: "forth",
        version: "0.0.0",
        author: "me",
        zip: "https://"
      }
    }
  };
}

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
    expect(wrapper.text()).toContain("My Farmware");
    expect(wrapper.text()).toContain("version: 0.0.0");
    expect(wrapper.text()).toContain("Does things.");
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
});
