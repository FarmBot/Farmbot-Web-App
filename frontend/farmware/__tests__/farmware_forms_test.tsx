const mockDevice = {
  execScript: jest.fn((..._) => Promise.resolve({})),
};

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  needsFarmwareForm, getConfigEnvName,
  FarmwareForm, FarmwareFormProps, ConfigFields, ConfigFieldsProps,
} from "../farmware_forms";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import { FarmwareConfig } from "farmbot";
import { fakeFarmwareEnv } from "../../__test_support__/fake_state/resources";
import { FarmwareName } from "../../sequences/step_tiles/tile_execute_script";
import * as crud from "../../api/crud";
import * as deviceModule from "../../device";

jest.mock("../../ui", () => {
  const React = require("react");
  const actual = jest.requireActual("../../ui");
  return {
    ...actual,
    FBSelect: (props: {
      onChange: (ddi: { label: string; value: number }) => void;
    }) => <button
      data-testid={"fb-select"}
      onClick={() => props.onChange({ label: "", value: 1 })} />,
    ExpandableHeader: (props: { title: string; onClick: () => void }) =>
      <button onClick={props.onClick}>{props.title}</button>,
  };
});

let destroySpy: jest.SpyInstance;
let getDeviceSpy: jest.SpyInstance;

beforeEach(() => {
  mockDevice.execScript = jest.fn((..._) => Promise.resolve({}));
  getDeviceSpy = jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as never);
  destroySpy = jest.spyOn(crud, "destroy")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  getDeviceSpy.mockRestore();
  destroySpy.mockRestore();
});

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
    const { container } = render(<ConfigFields {...p} />);
    expect(container.textContent).toContain("Config 1");
  });

  it("changes env var in API", () => {
    const p = fakeProps();
    const { container } = render(<ConfigFields {...p} />);
    const input = container.querySelector("input") as Element;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "1" } });
    fireEvent.blur(input);
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "my_fake_farmware_config_1", "1");
  });

  it("changes env var via dropdown", () => {
    const p = fakeProps();
    p.farmwareName = FarmwareName.MeasureSoilHeight;
    p.farmwareConfigs[0].name = "verbose";
    const { container } = render(<ConfigFields {...p} />);
    fireEvent.click(container.querySelector("[data-testid=\"fb-select\"]") as Element);
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "measure_soil_height_verbose", "1");
  });

  it("updates to bot value", () => {
    const p = fakeProps();
    p.getValue = () => "0";
    p.farmwareName = "My Farmware";
    p.userEnv = { my_farmware_config_1: "2" };
    const { container } = render(<ConfigFields {...p} />);
    fireEvent.click(container.querySelector(".fa-refresh") as Element);
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("my_farmware_config_1", "2");
  });

  it("resets to default value", () => {
    const p = fakeProps();
    p.getValue = () => "0";
    p.farmwareName = "My Farmware";
    p.farmwareConfigs = [{ name: "config_1", label: "Config 1", value: "1" }];
    const { container } = render(<ConfigFields {...p} />);
    fireEvent.click(container.querySelector(".fa-times-circle") as Element);
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
    const { container } = render(<FarmwareForm {...fakeProps()} />);
    ["Run", "Config 1"].map(string =>
      expect(container.textContent).toContain(string));
    expect(container.querySelector("label:last-of-type")?.textContent)
      .toContain("Config 1");
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("4");
    expect(container.querySelectorAll(".title-help").length).toEqual(0);
  });

  it("has help link", () => {
    const p = fakeProps();
    p.docPage = "farmware";
    const { container } = render(<FarmwareForm {...p} />);
    expect(container.querySelectorAll(".title-help").length).toEqual(1);
  });

  it("renders no fields", () => {
    const p = fakeProps();
    p.farmware.config = [];
    const { container } = render(<FarmwareForm {...p} />);
    const text = container.textContent?.replace(/\s+/g, "");
    expect(text).toContain("RunResetallvalues");
  });

  it("runs farmware", () => {
    const { container } = render(<FarmwareForm {...fakeProps()} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(mockDevice.execScript).toHaveBeenCalledWith(
      "My Fake Farmware", [{
        kind: "pair",
        args: { label: "my_fake_farmware_config_1", value: "4" }
      }]);
  });

  it("handles error while running farmware", () => {
    mockDevice.execScript = jest.fn(() => Promise.reject());
    const { container } = render(<FarmwareForm {...fakeProps()} />);
    fireEvent.click(container.querySelector("button") as Element);
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
    const { container } = render(<FarmwareForm {...p} />);
    ["Input required", "Measured", "Advanced"].map(string =>
      expect(container.textContent).toContain(string));
    ["Run", "Calibrate", "Factor"].map(string =>
      expect(container.textContent).not.toContain(string));
  });

  it("renders measure soil height form: calibrate", () => {
    const p = fakeProps();
    p.farmware.name = FarmwareName.MeasureSoilHeight;
    p.farmware.config = [
      { name: "measured_distance", label: "Measured", value: "0" },
      { name: "calibration_factor", label: "Factor", value: "0" },
    ];
    p.env = { measure_soil_height_measured_distance: "1" };
    const { container } = render(<FarmwareForm {...p} />);
    ["Calibrate", "Measured", "Advanced"].map(string =>
      expect(container.textContent).toContain(string));
    ["Run", "Input required", "Factor"].map(string =>
      expect(container.textContent).not.toContain(string));
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
    const { container } = render(<FarmwareForm {...p} />);
    ["Measure", "Advanced"].map(string =>
      expect(container.textContent).toContain(string));
    ["Run", "Input required", "Calibrate", "Measured", "Factor"].map(string =>
      expect(container.textContent).not.toContain(string));
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
    const { container } = render(<FarmwareForm {...p} />);
    expect(container.textContent).not.toContain("Factor");
    fireEvent.click(Array.from(container.querySelectorAll("button"))
      .find(button => button.textContent == "Advanced") as Element);
    expect(container.textContent).toContain("Factor");
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
    const { container } = render(<FarmwareForm {...p} />);
    const resetCalibration = Array.from(container.querySelectorAll("button"))
      .find(button => button.textContent == "Reset calibration values");
    fireEvent.click(resetCalibration as Element);
    expect(confirm).toHaveBeenCalledWith("Reset 1 values?");
    expect(destroySpy).toHaveBeenCalledWith(farmwareEnv2.uuid);
    expect(destroySpy).toHaveBeenCalledTimes(1);
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
    const { container } = render(<FarmwareForm {...p} />);
    const resetAll = Array.from(container.querySelectorAll("button"))
      .find(button => button.textContent == "Reset all values");
    fireEvent.click(resetAll as Element);
    expect(confirm).toHaveBeenCalledWith("Reset 2 values?");
    expect(destroySpy).toHaveBeenCalledWith(farmwareEnv1.uuid);
    expect(destroySpy).toHaveBeenCalledWith(farmwareEnv2.uuid);
    expect(destroySpy).toHaveBeenCalledTimes(2);
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
    const { container } = render(<FarmwareForm {...p} />);
    const resetAll = Array.from(container.querySelectorAll("button"))
      .find(button => button.textContent == "Reset all values");
    fireEvent.click(resetAll as Element);
    expect(confirm).toHaveBeenCalledWith("Reset 2 values?");
    expect(destroySpy).not.toHaveBeenCalled();
  });
});

afterAll(() => {
  jest.unmock("../../ui");
});
