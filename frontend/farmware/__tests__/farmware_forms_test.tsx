const mockDevice = {
  execScript: jest.fn(() => Promise.resolve({})),
  setUserEnv: jest.fn(() => Promise.resolve({}))
};
jest.mock("../../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  needsFarmwareForm, farmwareHelpText, getConfigEnvName,
  FarmwareForm, FarmwareFormProps, ConfigFields, ConfigFieldsProps,
} from "../farmware_forms";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import { clickButton } from "../../__test_support__/helpers";
import { FarmwareConfig } from "farmbot";

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
    farmware.config = undefined as unknown as FarmwareConfig[];
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
  const fakeProps = (): ConfigFieldsProps => {
    return {
      farmware: fakeFarmware(),
      getValue: jest.fn(),
      dispatch: jest.fn(),
      shouldDisplay: () => false,
      saveFarmwareEnv: jest.fn(),
      userEnv: {},
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

  it("handles change field error", () => {
    mockDevice.setUserEnv = jest.fn(() => Promise.reject());
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

  it("updates to bot value", () => {
    const p = fakeProps();
    p.getValue = () => "0";
    p.farmware.name = "My Farmware";
    p.userEnv = { my_farmware_config_1: "2" };
    const wrapper = shallow(<ConfigFields {...p} />);
    wrapper.find(".fa-refresh").simulate("click");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("my_farmware_config_1", "2");
  });

  it("resets to default value", () => {
    const p = fakeProps();
    p.getValue = () => "0";
    p.farmware.name = "My Farmware";
    p.farmware.config = [{ name: "config_1", label: "Config 1", value: "1" }];
    const wrapper = shallow(<ConfigFields {...p} />);
    wrapper.find(".fa-times-circle").simulate("click");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("my_farmware_config_1", "1");
  });
});

describe("<FarmwareForm />", () => {
  const fakeProps = (): FarmwareFormProps => {
    return {
      farmware: fakeFarmware(),
      env: {},
      userEnv: {},
      dispatch: jest.fn(),
      shouldDisplay: () => false,
      saveFarmwareEnv: jest.fn(),
      botOnline: true,
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
      }]);
  });

  it("handles error while running farmware", () => {
    mockDevice.execScript = jest.fn(() => Promise.reject());
    const wrapper = mount(<FarmwareForm {...fakeProps()} />);
    clickButton(wrapper, 0, "run");
    expect(mockDevice.execScript).toHaveBeenCalledWith(
      "My Fake Farmware", [{
        kind: "pair",
        args: { label: "my_fake_farmware_config_1", value: "4" }
      }]);
  });
});
