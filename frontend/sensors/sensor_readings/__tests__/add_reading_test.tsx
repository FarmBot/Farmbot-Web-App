import React from "react";
import { mount, shallow } from "enzyme";
import { AddSensorReadingMenu, AddSensorReadingMenuProps } from "../add_reading";
import { clickButton } from "../../../__test_support__/helpers";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { error } from "../../../toast/toast";
import { fakeSensor } from "../../../__test_support__/fake_state/resources";
import { PinMode } from "../../../sequences/step_tiles/pin_support";
import { SensorSelection } from "../sensor_selection";
import { BlurableInput } from "../../../ui";
import { inputEvent } from "../../../__test_support__/fake_html_events";
import { AxisInputBox } from "../../../controls/axis_input_box";

describe("<AddSensorReadingMenu />", () => {
  const fakeProps = (): AddSensorReadingMenuProps => ({
    dispatch: jest.fn(),
    sensors: [fakeSensor()],
    closeMenu: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("changes sensor", () => {
    const wrapper = shallow<AddSensorReadingMenu>(
      <AddSensorReadingMenu {...fakeProps()} />);
    const sensor = fakeSensor();
    wrapper.find(SensorSelection).props().setSensor(sensor);
    expect(wrapper.state().sensor).toEqual(sensor);
  });

  it("changes date", () => {
    const wrapper = shallow<AddSensorReadingMenu>(
      <AddSensorReadingMenu {...fakeProps()} />);
    const e = inputEvent("");
    wrapper.find(BlurableInput).at(1).props().onCommit(e);
    expect(wrapper.state().date).toEqual("");
  });

  it("changes time", () => {
    const wrapper = shallow<AddSensorReadingMenu>(
      <AddSensorReadingMenu {...fakeProps()} />);
    const e = inputEvent("");
    wrapper.find(BlurableInput).at(2).props().onCommit(e);
    expect(wrapper.state().time).toEqual("");
  });

  it("changes x", () => {
    const wrapper = shallow<AddSensorReadingMenu>(
      <AddSensorReadingMenu {...fakeProps()} />);
    wrapper.find(AxisInputBox).at(0).props().onChange("x", 1);
    expect(wrapper.state().x).toEqual(1);
  });

  it("changes y", () => {
    const wrapper = shallow<AddSensorReadingMenu>(
      <AddSensorReadingMenu {...fakeProps()} />);
    wrapper.find(AxisInputBox).at(1).props().onChange("y", 1);
    expect(wrapper.state().y).toEqual(1);
  });

  it("changes z", () => {
    const wrapper = shallow<AddSensorReadingMenu>(
      <AddSensorReadingMenu {...fakeProps()} />);
    wrapper.find(AxisInputBox).at(2).props().onChange("z", 1);
    expect(wrapper.state().z).toEqual(1);
  });

  it("changes value", () => {
    const wrapper = shallow<AddSensorReadingMenu>(
      <AddSensorReadingMenu {...fakeProps()} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: 1 },
    });
    expect(wrapper.state().value).toEqual(1);
  });

  it("doesn't add reading: no sensor", () => {
    const wrapper = mount(<AddSensorReadingMenu {...fakeProps()} />);
    clickButton(wrapper, 1, "save");
    expect(error).toHaveBeenCalledWith(
      "Please select a sensor with a valid pin number.");
  });

  it("doesn't add reading: no sensor pin", () => {
    const wrapper = mount(<AddSensorReadingMenu {...fakeProps()} />);
    const sensor = fakeSensor();
    sensor.body.pin = undefined;
    wrapper.setState({ sensor });
    clickButton(wrapper, 1, "save");
    expect(error).toHaveBeenCalledWith(
      "Please select a sensor with a valid pin number.");
  });

  it("doesn't add reading: no value", () => {
    const wrapper = mount(<AddSensorReadingMenu {...fakeProps()} />);
    wrapper.setState({ sensor: fakeSensor() });
    clickButton(wrapper, 1, "save");
    expect(error).toHaveBeenCalledWith("Please enter a value.");
  });

  it("doesn't add reading: bad analog value", () => {
    const wrapper = mount(<AddSensorReadingMenu {...fakeProps()} />);
    const sensor = fakeSensor();
    sensor.body.mode = PinMode.analog;
    wrapper.setState({ sensor, value: 2000 });
    clickButton(wrapper, 1, "save");
    expect(error).toHaveBeenCalledWith(
      "Please enter a value between 0 and 1023");
  });

  it("doesn't add reading: bad digital value", () => {
    const wrapper = mount(<AddSensorReadingMenu {...fakeProps()} />);
    const sensor = fakeSensor();
    sensor.body.mode = PinMode.digital;
    wrapper.setState({ sensor, value: 2 });
    clickButton(wrapper, 1, "save");
    expect(error).toHaveBeenCalledWith(
      "Please enter a value between 0 and 1");
  });

  it("adds reading", () => {
    const wrapper = mount(<AddSensorReadingMenu {...fakeProps()} />);
    wrapper.setState({ sensor: fakeSensor(), value: 1 });
    clickButton(wrapper, 1, "save");
    expect(error).not.toHaveBeenCalled();
  });
});
