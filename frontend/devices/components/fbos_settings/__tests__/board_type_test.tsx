jest.mock("../../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { BoardType } from "../board_type";
import { BoardTypeProps } from "../interfaces";
import { fakeState } from "../../../../__test_support__/fake_state";
import { fakeFbosConfig } from "../../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../../api/crud";
import { bot } from "../../../../__test_support__/fake_state/bot";

describe("<BoardType/>", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): BoardTypeProps => ({
    bot,
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
    shouldDisplay: () => false,
    botOnline: true,
  });

  it("Farmduino", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "5.0.3.F";
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("Farmduino");
  });

  it("Farmduino k1.4", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "5.0.3.G";
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("1.4");
  });

  it("Arduino/RAMPS", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "5.0.3.R";
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("Arduino/RAMPS");
  });

  it("Undefined", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = undefined;
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("None");
  });

  it("Disconnected", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "Arduino Disconnected!";
    expect(mount(<BoardType {...p} />).text()).toContain("None");
    p.bot.hardware.informational_settings.firmware_version = "disconnected";
    expect(mount(<BoardType {...p} />).text()).toContain("None");
  });

  it("Stubbed", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "STUBFW";
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("None");
  });

  it("Disconnected with valid FirmwareConfig", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "Arduino Disconnected!";
    p.sourceFbosConfig = () => ({ value: "farmduino", consistent: false });
    const wrapper = mount(<BoardType {...p} />);
    expect(wrapper.text()).toContain("Farmduino");
  });

  it("calls updateConfig", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "Arduino Disconnected!";
    const wrapper = shallow(<BoardType {...p} />);
    wrapper.find("FBSelect").simulate("change",
      { label: "firmware_hardware", value: "farmduino" });
    expect(edit).toHaveBeenCalledWith(fakeConfig, { firmware_hardware: "farmduino" });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("displays standard boards", () => {
    const wrapper = shallow(<BoardType {...fakeProps()} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      { label: "Arduino/RAMPS (Genesis v1.2)", value: "arduino" },
      { label: "Farmduino (Genesis v1.3)", value: "farmduino" }]);
  });

  it("displays new board", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = shallow(<BoardType {...p} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      { label: "Arduino/RAMPS (Genesis v1.2)", value: "arduino" },
      { label: "Farmduino (Genesis v1.3)", value: "farmduino" },
      { label: "Farmduino (Genesis v1.4)", value: "farmduino_k14" }]);
  });
});
