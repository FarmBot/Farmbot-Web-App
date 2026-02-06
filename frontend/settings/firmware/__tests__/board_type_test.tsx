let mockFeatureBoolean = false;

import React from "react";
import { mount } from "enzyme";
import { BoardType } from "../board_type";
import { BoardTypeProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  fakeTimeSettings,
} from "../../../__test_support__/fake_time_settings";
import * as shouldDisplay from "../../../devices/should_display";
import * as deviceActions from "../../../devices/actions";

let shouldDisplayFeatureSpy: jest.SpyInstance;
let updateConfigSpy: jest.SpyInstance;

beforeEach(() => {
  shouldDisplayFeatureSpy = jest.spyOn(shouldDisplay, "shouldDisplayFeature")
    .mockImplementation(() => mockFeatureBoolean);
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn() as never);
});

afterEach(() => {
  mockFeatureBoolean = false;
  shouldDisplayFeatureSpy.mockRestore();
  updateConfigSpy.mockRestore();
});

describe("<BoardType/>", () => {
  const selectProps = (wrapper: ReturnType<typeof mount>) =>
    wrapper.find("FBSelect").props() as {
      selectedItem?: { label: string };
      list: Array<{ label: string; value: string }>;
      onChange: (ddi: { label: string; value: string }) => void;
    };

  const fakeProps = (): BoardTypeProps => ({
    bot,
    alerts: [],
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
    botOnline: true,
    timeSettings: fakeTimeSettings(),
    firmwareHardware: undefined,
  });

  it("renders with valid firmwareHardware", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino";
    const wrapper = mount(<BoardType {...p} />);
    expect(selectProps(wrapper).selectedItem?.label)
      .toEqual("Farmduino (Genesis v1.3)");
    expect(wrapper.html()).not.toContain("dim");
  });

  it("renders with valid firmwareHardware: inconsistent", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino";
    p.sourceFbosConfig = () => ({ value: true, consistent: false });
    const wrapper = mount(<BoardType {...p} />);
    expect(selectProps(wrapper).selectedItem?.label)
      .toEqual("Farmduino (Genesis v1.3)");
    expect(wrapper.html()).toContain("dim");
  });

  it("calls updateConfig", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    const wrapper = mount(<BoardType {...p} />);
    selectProps(wrapper).onChange({
      label: "Farmduino (Genesis v1.3)",
      value: "farmduino",
    });
    expect(updateConfigSpy).toHaveBeenCalledWith({
      firmware_hardware: "farmduino"
    });
    expect(p.dispatch).toHaveBeenCalledWith(updateConfigSpy.mock.results[0].value);
  });

  it("displays boards", () => {
    mockFeatureBoolean = false;
    const wrapper = mount(<BoardType {...fakeProps()} />);
    const labels = selectProps(wrapper).list.map(item => item.label);
    [
      "Farmduino (Genesis v1.7)",
      "Farmduino (Genesis v1.6)",
      "Farmduino (Genesis v1.5)",
      "Farmduino (Genesis v1.4)",
      "Farmduino (Genesis v1.3)",
      "Arduino/RAMPS (Genesis v1.2)",
      "Farmduino (Express v1.1)",
      "Farmduino (Express v1.0)",
      "None",
    ].map(label => {
      expect(labels).toContain(label);
    });
  });

  it("displays more boards", () => {
    mockFeatureBoolean = true;
    const wrapper = mount(<BoardType {...fakeProps()} />);
    const labels = selectProps(wrapper).list.map(item => item.label);
    expect(labels).toContain("Farmduino (Express v1.2)");
    expect(labels).toContain("Farmduino (Genesis v1.8)");
  });
});
