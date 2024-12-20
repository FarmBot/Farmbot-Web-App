import React from "react";
import { mount } from "enzyme";
import {
  RawDesignerSensors as DesignerSensors,
  DesignerSensorsProps,
  mapStateToProps,
} from "../sensors";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { bot } from "../../__test_support__/fake_state/bot";
import { fakeState } from "../../__test_support__/fake_state";

describe("<DesignerSensors />", () => {
  const fakeProps = (): DesignerSensorsProps => ({
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
    sensors: [],
    bot: bot,
    firmwareHardware: undefined,
    sensorReadings: [],
  });

  it("renders sensors panel", () => {
    const wrapper = mount(<DesignerSensors {...fakeProps()} />);
    ["sensors", "history"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.firmwareHardware).toEqual(undefined);
  });
});
