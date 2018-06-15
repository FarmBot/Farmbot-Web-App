jest.mock("farmbot-toastr", () => ({
  error: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { Sensors } from "../index";
import { bot } from "../../../__test_support__/fake_state/bot";
import { SensorsProps } from "../../../devices/interfaces";
import { fakeSensor } from "../../../__test_support__/fake_state/resources";
import { error } from "farmbot-toastr";
import { clickButton } from "../../../__test_support__/helpers";
import { SpecialStatus } from "../../../resources/tagged_resources";

describe("<Sensors />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function fakeProps(): SensorsProps {
    const fakeSensor1 = fakeSensor();
    const fakeSensor2 = fakeSensor();
    fakeSensor1.body.pin = 1;
    fakeSensor2.body.pin = 2;
    return {
      bot,
      sensors: [fakeSensor1, fakeSensor2],
      dispatch: jest.fn(),
      disabled: false
    };
  }

  it("renders", () => {
    const wrapper = mount(<Sensors {...fakeProps()} />);
    ["Sensors", "Edit", "Save", "Fake Pin", "1"].map(string =>
      expect(wrapper.text()).toContain(string));
    const saveButton = wrapper.find("button").at(1);
    expect(saveButton.text()).toContain("Save");
    expect(saveButton.props().hidden).toBeTruthy();
  });

  it("isEditing", () => {
    const wrapper = mount(<Sensors {...fakeProps()} />);
    expect(wrapper.state().isEditing).toBeFalsy();
    clickButton(wrapper, 0, "edit");
    expect(wrapper.state().isEditing).toBeTruthy();
  });

  it("save attempt: pin number too small", () => {
    const p = fakeProps();
    p.sensors[0].body.pin = 1;
    p.sensors[1].body.pin = 1;
    p.sensors[0].specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<Sensors {...p} />);
    clickButton(wrapper, 1, "save", { partial_match: true });
    expect(error).toHaveBeenLastCalledWith("Pin numbers must be unique.");
  });

  it("saves", () => {
    const p = fakeProps();
    p.sensors[0].body.pin = 1;
    p.sensors[0].specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<Sensors {...p} />);
    clickButton(wrapper, 1, "save", { partial_match: true });
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("adds empty sensor", () => {
    const p = fakeProps();
    const wrapper = mount(<Sensors {...p} />);
    wrapper.setState({ isEditing: true });
    clickButton(wrapper, 2, "");
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("adds stock sensors", () => {
    const p = fakeProps();
    const wrapper = mount(<Sensors {...p} />);
    wrapper.setState({ isEditing: true });
    clickButton(wrapper, 3, "stock sensors");
    expect(p.dispatch).toHaveBeenCalledTimes(2);
  });
});
