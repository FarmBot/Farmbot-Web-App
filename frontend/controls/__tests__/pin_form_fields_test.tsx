import React from "react";
import { shallow } from "enzyme";
import { NameInputBox, PinDropdown, ModeDropdown } from "../pin_form_fields";
import { fakeSensor } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import { FBSelect } from "../../ui";

const expectedPayload = (update: Object) =>
  expect.objectContaining({
    payload: expect.objectContaining({
      update
    }),
    type: Actions.EDIT_RESOURCE
  });

describe("<NameInputBox />", () => {
  const fakeProps = () => ({
    dispatch: jest.fn(),
    value: undefined,
    resource: fakeSensor(),
  });

  it("updates label", () => {
    const p = fakeProps();
    const wrapper = shallow(<NameInputBox {...p} />);
    wrapper.find("input").simulate("change", {
      currentTarget: { value: "GPIO 3" }
    });
    expect(p.dispatch).toHaveBeenCalledWith(
      expectedPayload({ label: "GPIO 3" }));
  });
});

describe("<PinDropdown />", () => {
  const fakeProps = () => ({
    dispatch: jest.fn(),
    value: undefined,
    resource: fakeSensor(),
  });

  it("updates pin", () => {
    const p = fakeProps();
    const wrapper = shallow(<PinDropdown {...p} />);
    wrapper.find(FBSelect).simulate("change", { value: 3 });
    expect(p.dispatch).toHaveBeenCalledWith(
      expectedPayload({ pin: 3 }));
  });
});

describe("<ModeDropdown />", () => {
  const fakeProps = () => ({
    dispatch: jest.fn(),
    value: 1,
    resource: fakeSensor(),
  });

  it("updates mode", () => {
    const p = fakeProps();
    const wrapper = shallow(<ModeDropdown {...p} />);
    wrapper.find(FBSelect).simulate("change", { value: 0 });
    expect(p.dispatch).toHaveBeenCalledWith(
      expectedPayload({ mode: 0 }));
  });
});
