const mockDevice = {
  execScript: jest.fn((..._) => Promise.resolve({})),
};
jest.mock("../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../api/crud", () => ({ destroy: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  needsFarmwareForm, getConfigEnvName,
  FarmwareForm, FarmwareFormProps, ConfigFields, ConfigFieldsProps,
} from "../farmware_forms";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import { changeBlurableInput, clickButton } from "../../__test_support__/helpers";
import { FarmwareConfig } from "farmbot";
import { ExpandableHeader, FBSelect } from "../../ui";
import { fakeFarmwareEnv } from "../../__test_support__/fake_state/resources";
import { destroy } from "../../api/crud";
import { FarmwareName } from "../../sequences/step_tiles/tile_execute_script";

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

describe("<ConfigFields />", () => {
  const fakeProps = (): ConfigFieldsProps => ({
    farmwareName: fakeFarmware().name,
    farmwareConfigs: fakeFarmware().config,
    getValue: jest.fn(),
    dispatch: jest.fn(),
    saveFarmwareEnv: jest.fn(),
    userEnv: {},
    farmwareEnvs: [],
  });

  it("renders fields", () => {
    const p = fakeProps();
    p.farmwareConfigs.push({ name: "config_2", label: "Config 2", value: "2" });
    const wrapper = mount(<ConfigFields {...fakeProps()} />);
    expect(wrapper.text()).toEqual("Config 1");
  });

  it("changes env var in API", () => {
    const p = fakeProps();
    const wrapper = mount(<ConfigFields {...p} />);
    changeBlurableInput(wrapper, "1");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "my_fake_farmware_config_1", "1");
  });

  it("changes env var via dropdown", () => {
    const p = fakeProps();
    p.farmwareName = FarmwareName.MeasureSoilHeight;
    p.farmwareConfigs[0].name = "verbose";
    const wrapper = shallow(<ConfigFields {...p} />);
    const input = shallow(wrapper.find("FarmwareInputField").getElement());
    input.find(FBSelect).simulate("change", { label: "", value: 1 });
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "measure_soil_height_verbose", "1");
  });

  it("updates to bot value", () => {
    const p = fakeProps();
    p.getValue = () => "0";
    p.farmwareName = "My Farmware";
    p.userEnv = { my_farmware_config_1: "2" };
    const wrapper = shallow(<ConfigFields {...p} />);
    wrapper.find(".fa-refresh").simulate("click");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("my_farmware_config_1", "2");
  });

  it("resets to default value", () => {
    const p = fakeProps();
    p.getValue = () => "0";
    p.farmwareName = "My Farmware";
    p.farmwareConfigs = [{ name: "config_1", label: "Config 1", value: "1" }];
    const wrapper = shallow(<ConfigFields {...p} />);
    wrapper.find(".fa-times-circle").simulate("click");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("my_farmware_config_1", "1");
  });
});

describe("<FarmwareForm />", () => {
  const fakeProps = (): FarmwareFormProps => ({
    farmware: fakeFarmware(),
    env: {},
    userEnv: {},
    farmwareEnvs: [],
    dispatch: jest.fn(),
    saveFarmwareEnv: jest.fn(),
    botOnline: true,
  });

  it("renders form", () => {
    const wrapper = mount(<FarmwareForm {...fakeProps()} />);
    ["Run", "Config 1"].map(string =>
      expect(wrapper.text()).toContain(string));
    expect(wrapper.find("label").last().text()).toContain("Config 1");
    expect(wrapper.find("input").props().value).toEqual("4");
    expect(wrapper.find(".title-help").length).toEqual(0);
  });

  it("has help link", () => {
    const p = fakeProps();
    p.docPage = "farmware";
    const wrapper = mount(<FarmwareForm {...p} />);
    expect(wrapper.find(".title-help").length).toEqual(1);
  });

  it("renders no fields", () => {
    const p = fakeProps();
    p.farmware.config = [];
    const wrapper = mount(<FarmwareForm {...p} />);
    expect(wrapper.text()).toEqual(["Run", "Reset all values"].join(""));
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

  it("renders measure soil height form: input required", () => {
    const p = fakeProps();
    p.farmware.name = FarmwareName.MeasureSoilHeight;
    p.farmware.config = [
      { name: "measured_distance", label: "Measured", value: "0" },
      { name: "calibration_factor", label: "Factor", value: "0" },
    ];
    p.env = {};
    const wrapper = mount(<FarmwareForm {...p} />);
    ["Input required", "Measured", "Advanced"].map(string =>
      expect(wrapper.text()).toContain(string));
    ["Run", "Calibrate", "Factor"].map(string =>
      expect(wrapper.text()).not.toContain(string));
  });

  it("renders measure soil height form: calibrate", () => {
    const p = fakeProps();
    p.farmware.name = FarmwareName.MeasureSoilHeight;
    p.farmware.config = [
      { name: "measured_distance", label: "Measured", value: "0" },
      { name: "calibration_factor", label: "Factor", value: "0" },
    ];
    p.env = { measure_soil_height_measured_distance: "1" };
    const wrapper = mount(<FarmwareForm {...p} />);
    ["Calibrate", "Measured", "Advanced"].map(string =>
      expect(wrapper.text()).toContain(string));
    ["Run", "Input required", "Factor"].map(string =>
      expect(wrapper.text()).not.toContain(string));
  });

  it("renders measure soil height form: measure", () => {
    const p = fakeProps();
    p.farmware.name = FarmwareName.MeasureSoilHeight;
    p.farmware.config = [
      { name: "measured_distance", label: "Measured", value: "0" },
      { name: "calibration_factor", label: "Factor", value: "0" },
    ];
    p.env = {
      measure_soil_height_measured_distance: "1",
      measure_soil_height_calibration_factor: "1",
    };
    const wrapper = mount(<FarmwareForm {...p} />);
    ["Measure", "Advanced"].map(string =>
      expect(wrapper.text()).toContain(string));
    ["Run", "Input required", "Calibrate", "Measured", "Factor"].map(string =>
      expect(wrapper.text()).not.toContain(string));
  });

  it("expands configs", () => {
    const p = fakeProps();
    p.farmware.name = FarmwareName.MeasureSoilHeight;
    p.farmware.config = [
      { name: "measured_distance", label: "Measured", value: "0" },
      { name: "calibration_factor", label: "Factor", value: "0" },
    ];
    p.env = {
      measure_soil_height_measured_distance: "1",
      measure_soil_height_calibration_factor: "1",
    };
    const wrapper = shallow<FarmwareForm>(<FarmwareForm {...p} />);
    expect(wrapper.state().advanced).toEqual(false);
    expect(wrapper.render().text()).not.toContain("Factor");
    wrapper.find(ExpandableHeader).simulate("click");
    expect(wrapper.state().advanced).toEqual(true);
    expect(wrapper.render().text()).toContain("Factor");
  });

  it("resets calibration configs", () => {
    window.confirm = jest.fn(() => true);
    const p = fakeProps();
    p.farmware.name = FarmwareName.MeasureSoilHeight;
    p.farmware.config = [];
    p.env = {
      measure_soil_height_measured_distance: "1",
      measure_soil_height_calibration_factor: "1",
    };
    const farmwareEnv1 = fakeFarmwareEnv();
    farmwareEnv1.body.key = "measure_soil_height_measured_distance";
    const farmwareEnv2 = fakeFarmwareEnv();
    farmwareEnv2.body.key = "measure_soil_height_calibration_factor";
    p.farmwareEnvs = [farmwareEnv1, farmwareEnv2];
    const wrapper = mount(<FarmwareForm {...p} />);
    clickButton(wrapper, 1, "reset calibration values");
    expect(confirm).toHaveBeenCalledWith("Reset 1 values?");
    expect(destroy).toHaveBeenCalledWith(farmwareEnv2.uuid);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it("resets all configs", () => {
    window.confirm = jest.fn(() => true);
    const p = fakeProps();
    p.farmware.name = FarmwareName.MeasureSoilHeight;
    p.farmware.config = [];
    p.env = {
      measure_soil_height_measured_distance: "1",
      measure_soil_height_calibration_factor: "1",
    };
    const farmwareEnv1 = fakeFarmwareEnv();
    farmwareEnv1.body.key = "measure_soil_height_measured_distance";
    const farmwareEnv2 = fakeFarmwareEnv();
    farmwareEnv2.body.key = "measure_soil_height_calibration_factor";
    p.farmwareEnvs = [farmwareEnv1, farmwareEnv2];
    const wrapper = mount(<FarmwareForm {...p} />);
    clickButton(wrapper, 2, "reset all values");
    expect(confirm).toHaveBeenCalledWith("Reset 2 values?");
    expect(destroy).toHaveBeenCalledWith(farmwareEnv1.uuid);
    expect(destroy).toHaveBeenCalledWith(farmwareEnv2.uuid);
    expect(destroy).toHaveBeenCalledTimes(2);
  });

  it("doesn't reset configs", () => {
    window.confirm = jest.fn(() => false);
    const p = fakeProps();
    p.farmware.name = FarmwareName.MeasureSoilHeight;
    p.farmware.config = [];
    p.env = {
      measure_soil_height_measured_distance: "1",
      measure_soil_height_calibration_factor: "1",
    };
    const farmwareEnv1 = fakeFarmwareEnv();
    farmwareEnv1.body.key = "measure_soil_height_measured_distance";
    const farmwareEnv2 = fakeFarmwareEnv();
    farmwareEnv2.body.key = "measure_soil_height_calibration_factor";
    p.farmwareEnvs = [farmwareEnv1, farmwareEnv2];
    const wrapper = mount(<FarmwareForm {...p} />);
    clickButton(wrapper, 2, "reset all values");
    expect(confirm).toHaveBeenCalledWith("Reset 2 values?");
    expect(destroy).not.toHaveBeenCalled();
  });
});
