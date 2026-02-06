jest.unmock("../../../redux/store");
jest.mock("../../../settings/fbos_settings/factory_reset_row", () => ({
  FactoryResetRows: () => <div />,
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  JogButtons, PowerAndResetMenu, PowerAndResetMenuProps,
} from "../jog_buttons";
import * as deviceActions from "../../../devices/actions";
import { JogMovementControlsProps } from "../interfaces";
import { FbosButtonRow } from "../../../settings/fbos_settings/fbos_button_row";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeWebAppConfig } from "../../../__test_support__/fake_state/resources";
import { fakeMovementState } from "../../../__test_support__/fake_bot_data";
import { DeviceSetting } from "../../../constants";

let moveRelativeSpy: jest.SpyInstance;
let restartFirmwareSpy: jest.SpyInstance;

afterAll(() => {
  jest.unmock("../../../settings/fbos_settings/factory_reset_row");
});
describe("<JogButtons />", () => {
  const mockConfig = fakeWebAppConfig();

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig.body.xy_swap = false;
    moveRelativeSpy =
      jest.spyOn(deviceActions, "moveRelative").mockImplementation(jest.fn());
  });

  afterEach(() => {
    moveRelativeSpy.mockRestore();
  });

  const jogButtonProps = (): JogMovementControlsProps => ({
    stepSize: 100,
    botPosition: { x: undefined, y: undefined, z: undefined },
    getConfigValue: key => mockConfig.body[key],
    arduinoBusy: false,
    botOnline: true,
    firmwareSettings: bot.hardware.mcu_params,
    env: {},
    locked: false,
    dispatch: jest.fn(),
    movementState: fakeMovementState(),
    imageJobs: [],
    logs: [],
  });

  it("is disabled", () => {
    const p = jogButtonProps();
    p.arduinoBusy = true;
    const jogButtons = mount(<JogButtons {...p} />);
    jogButtons.find("button").at(7).simulate("click");
    expect(deviceActions.moveRelative).not.toHaveBeenCalled();
  });

  it("has unswapped xy jog buttons", () => {
    const jogButtons = mount(<JogButtons {...jogButtonProps()} />);
    const button = jogButtons.find("button").at(8);
    expect(button.props().title).toBe("move x axis (100)");
    button.simulate("click");
    expect(deviceActions.moveRelative)
      .toHaveBeenCalledWith({ x: 100, y: 0, z: 0 });
  });

  it("has swapped xy jog buttons", () => {
    mockConfig.body.xy_swap = true;
    const p = jogButtonProps();
    (p.stepSize as number | undefined) = undefined;
    const jogButtons = mount(<JogButtons {...p} />);
    const button = jogButtons.find("button").at(8);
    expect(button.props().title).toBe("move y axis (100)");
    button.simulate("click");
    expect(deviceActions.moveRelative)
      .toHaveBeenCalledWith({ x: 0, y: 100, z: 0 });
  });

  it("highlights x axis jog button", () => {
    mockConfig.body.xy_swap = false;
    const p = jogButtonProps();
    p.highlightAxis = "x";
    const wrapper = mount(<JogButtons {...p} />);
    expect(wrapper.find("td").at(13).props().style).toEqual({
      border: "2px solid #fd6"
    });
  });

  it("highlights y axis jog button", () => {
    mockConfig.body.xy_swap = false;
    const p = jogButtonProps();
    p.highlightAxis = "y";
    const wrapper = mount(<JogButtons {...p} />);
    expect(wrapper.find("td").at(4).props().style).toEqual({
      border: "2px solid #fd6"
    });
  });

  it("highlights z axis jog button", () => {
    const p = jogButtonProps();
    p.highlightAxis = "z";
    const wrapper = mount(<JogButtons {...p} />);
    expect(wrapper.find("td").at(15).props().style).toEqual({
      border: "2px solid #fd6"
    });
  });
});

describe("<PowerAndResetMenu />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    restartFirmwareSpy =
      jest.spyOn(deviceActions, "restartFirmware").mockImplementation(jest.fn());
  });

  afterEach(() => {
    restartFirmwareSpy.mockRestore();
  });

  const fakeProps = (): PowerAndResetMenuProps => ({
    botOnline: true,
    showAdvanced: true,
    dispatch: jest.fn(),
  });

  it("restarts firmware", () => {
    const wrapper = shallow(<PowerAndResetMenu {...fakeProps()} />);
    const row = wrapper.find(FbosButtonRow).first();
    expect(row.props().label).toEqual(DeviceSetting.restartFirmware);
    row.props().action?.();
    expect(deviceActions.restartFirmware).toHaveBeenCalled();
  });
});
