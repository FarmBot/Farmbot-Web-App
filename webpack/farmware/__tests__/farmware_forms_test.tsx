jest.mock("../../device", () => ({
  devices: {
    current: {
      execScript: jest.fn()
    }
  }
}));

import * as React from "react";
import { mount } from "enzyme";
import { FarmwareForms } from "../farmware_forms";
import { devices } from "../../device";
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
      config: [],
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
  it("renders", () => {
    const wrapper = mount(<FarmwareForms farmwares={fakeFarmwares()} />);
    expect(wrapper.text()).toContain("My Farmware");
    expect(wrapper.text()).toContain("version: 0.0.0");
    expect(wrapper.text()).toContain("Does things.");
  });

  it("runs", () => {
    const runFarmware = devices.current.execScript as jest.Mock<{}>;
    const wrapper = mount(<FarmwareForms farmwares={fakeFarmwares()} />);
    const run = wrapper.find("button").first();
    run.simulate("click");
    expect(run.text()).toEqual("Run");
    expect(runFarmware).toHaveBeenCalledWith("My Farmware");
  });
});
