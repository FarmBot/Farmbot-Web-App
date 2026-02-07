import React from "react";
import { mount, shallow } from "enzyme";
import {
  ChangeFirmwarePath, ChangeFirmwarePathProps,
  FirmwarePathRow, FirmwarePathRowProps,
} from "../firmware_path";
import * as deviceActions from "../../../devices/actions";

let updateConfigSpy: jest.SpyInstance;

beforeEach(() => {
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("<FirmwarePathRow />", () => {
  const fakeProps = (): FirmwarePathRowProps => ({
    dispatch: jest.fn(),
    firmwarePath: "tty",
    showAdvanced: true,
  });

  it("renders", () => {
    const wrapper = mount(<FirmwarePathRow {...fakeProps()} />);
    expect(wrapper.text()).toContain("tty");
  });

  it("renders: path not set", () => {
    const p = fakeProps();
    p.firmwarePath = "";
    const wrapper = mount(<FirmwarePathRow {...p} />);
    expect(wrapper.text()).toContain("not set");
  });
});

describe("<ChangeFirmwarePath />", () => {
  const fakeProps = (): ChangeFirmwarePathProps => ({
    dispatch: jest.fn(),
    firmwarePath: "tty",
  });

  it("changes path", () => {
    const wrapper = shallow(<ChangeFirmwarePath {...fakeProps()} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "path" });
    expect(updateConfigSpy).toHaveBeenCalledWith({ firmware_path: "path" });
  });

  it("selects manual input", () => {
    const wrapper = shallow(<ChangeFirmwarePath {...fakeProps()} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "manual" });
    expect(updateConfigSpy).not.toHaveBeenCalled();
    wrapper.find("input").simulate("change", { currentTarget: { value: "path" } });
    wrapper.find("button").last().simulate("click");
    expect(updateConfigSpy).toHaveBeenCalledWith({ firmware_path: "path" });
  });
});
