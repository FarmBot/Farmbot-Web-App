const mockDevice = {
  execScript: jest.fn(() => Promise.resolve({})),
  setUserEnv: jest.fn(() => Promise.resolve({}))
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  needsFarmwareForm, farmwareHelpText, getConfigEnvName,
  FarmwareForm, FarmwareFormProps, ConfigFields
} from "../farmware_forms";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import { clickButton } from "../../__test_support__/helpers";

describe("getConfigEnvName()", () => {
  it("generates correct name", () => {
    expect(getConfigEnvName("My Farmware", "config_1"))
      .toEqual("my_farmware_config_1");
    expect(getConfigEnvName("My-Farmware", "config_1"))
      .toEqual("my_farmware_config_1");
  });
});

describe("needsFarmwareForm()", () => {
  it("needs form", () => {
    const farmware = fakeFarmware();
    expect(needsFarmwareForm(farmware)).toEqual(true);
  });

  it("doesn't need form", () => {
    const farmware = fakeFarmware();
    farmware.config = [];
    expect(needsFarmwareForm(farmware)).toEqual(false);
  });
});

describe("farmwareHelpText()", () => {
  it("generates string", () => {
    const farmware = fakeFarmware();
    expect(farmwareHelpText(farmware)).toEqual("Does things. (version: 0.0.0)");
  });

  it("generates blank string", () => {
    expect(farmwareHelpText(undefined)).toEqual("");
  });
});

describe("<ConfigFields />", () => {
  const fakeProps = () => {
    return {
      farmware: fakeFarmware(),
      getValue: jest.fn(),
      dispatch: jest.fn(),
      shouldDisplay: () => false,
      saveFarmwareEnv: jest.fn(),
    };
  };

  it("renders fields", () => {
    const p = fakeProps();
    p.farmware.config.push({ name: "config_2", label: "Config 2", value: "2" });
    const wrapper = mount(<ConfigFields {...fakeProps()} />);
    expect(wrapper.text()).toEqual("Config 1");
  });

  it("changes field", () => {
    const p = fakeProps();
    const wrapper = shallow(<ConfigFields {...p} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: 1 } });
    expect(mockDevice.setUserEnv).toHaveBeenCalledWith({
      "my_fake_farmware_config_1": 1
    });
  });

  it("changes env var in API", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = shallow(<ConfigFields {...p} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: 1 } });
    expect(mockDevice.setUserEnv).not.toHaveBeenCalled();
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "my_fake_farmware_config_1", 1);
  });
});

describe("<FarmwareForm />", () => {
  const fakeProps = (): FarmwareFormProps => {
    return {
      farmware: fakeFarmware(),
      user_env: {},
      dispatch: jest.fn(),
      shouldDisplay: () => false,
      saveFarmwareEnv: jest.fn(),
    };
  };

  it("renders form", () => {
    const wrapper = mount(<FarmwareForm {...fakeProps()} />);
    ["Run", "Config 1"].map(string =>
      expect(wrapper.text()).toContain(string));
    expect(wrapper.find("label").last().text()).toContain("Config 1");
    expect(wrapper.find("input").props().value).toEqual("4");
  });

  it("renders no fields", () => {
    const p = fakeProps();
    p.farmware.config = [];
    const wrapper = mount(<FarmwareForm {...p} />);
    expect(wrapper.text()).toEqual("Run");
  });

  it("runs farmware", () => {
    const wrapper = mount(<FarmwareForm {...fakeProps()} />);
    clickButton(wrapper, 0, "run");
    expect(mockDevice.execScript).toHaveBeenCalledWith(
      "My Fake Farmware", [{
        kind: "pair",
        args: { label: "my_fake_farmware_config_1", value: "4" }
      }]
    );
  });
});
