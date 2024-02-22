jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

let mockFeatureBoolean = false;
jest.mock("../../../devices/should_display", () => ({
  shouldDisplayFeature: () => mockFeatureBoolean,
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { BoardType } from "../board_type";
import { BoardTypeProps } from "../interfaces";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeFbosConfig,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../api/crud";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  fakeTimeSettings,
} from "../../../__test_support__/fake_time_settings";

describe("<BoardType/>", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): BoardTypeProps => ({
    bot,
    alerts: [],
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
    botOnline: true,
    timeSettings: fakeTimeSettings(),
    firmwareHardware: undefined,
  });

  it("renders with valid firmwareHardware", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino";
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("Farmduino");
    expect(wrapper.html()).not.toContain("dim");
  });

  it("renders with valid firmwareHardware: inconsistent", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino";
    p.sourceFbosConfig = () => ({ value: true, consistent: false });
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("Farmduino");
    expect(wrapper.html()).toContain("dim");
  });

  it("calls updateConfig", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    const wrapper = mount<BoardType>(<BoardType {...p} />);
    const selection =
      shallow(<div>{wrapper.instance().FirmwareSelection()}</div>);
    selection.find("FBSelect").simulate("change",
      { label: "firmware_hardware", value: "farmduino" });
    expect(edit).toHaveBeenCalledWith(fakeConfig, {
      firmware_hardware: "farmduino"
    });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("doesn't call updateConfig", () => {
    const p = fakeProps();
    const wrapper = mount<BoardType>(<BoardType {...p} />);
    const selection =
      shallow(<div>{wrapper.instance().FirmwareSelection()}</div>);
    selection.find("FBSelect").simulate("change",
      { label: "firmware_hardware", value: "unknown" });
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("displays boards", () => {
    mockFeatureBoolean = false;
    const wrapper = mount(<BoardType {...fakeProps()} />);
    const { list } = wrapper.find("FBSelect").props();
    expect(list).toEqual([
      { label: "Farmduino (Genesis v1.7)", value: "farmduino_k17" },
      { label: "Farmduino (Genesis v1.6)", value: "farmduino_k16" },
      { label: "Farmduino (Genesis v1.5)", value: "farmduino_k15" },
      { label: "Farmduino (Genesis v1.4)", value: "farmduino_k14" },
      { label: "Farmduino (Genesis v1.3)", value: "farmduino" },
      { label: "Arduino/RAMPS (Genesis v1.2)", value: "arduino" },
      { label: "Farmduino (Express v1.1)", value: "express_k11" },
      { label: "Farmduino (Express v1.0)", value: "express_k10" },
      { label: "None", value: "none" },
    ]);
    expect(list?.length).toEqual(9);
  });

  it("displays more boards", () => {
    mockFeatureBoolean = true;
    const wrapper = mount(<BoardType {...fakeProps()} />);
    const { list } = wrapper.find("FBSelect").props();
    expect(list?.length).toEqual(10);
  });
});
