import React from "react";
import { fakeSensor } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import * as crud from "../../api/crud";

const getPinFormFields = () =>
  jest.requireActual("../pin_form_fields");

const expectedPayload = (update: object) =>
  expect.objectContaining({
    payload: expect.objectContaining({
      update
    }),
    type: Actions.EDIT_RESOURCE
  });

beforeEach(() => {
  jest.spyOn(crud, "edit").mockImplementation((_: unknown, update: unknown) => ({
    type: "EDIT_RESOURCE",
    payload: { update },
  }) as never);
});

describe("<NameInputBox />", () => {
  const fakeProps = () => ({
    dispatch: jest.fn(),
    value: undefined,
    resource: fakeSensor(),
  });

  it("updates label", () => {
    const { NameInputBox } = getPinFormFields();
    const p = fakeProps();
    const input = NameInputBox(p);
    input.props.onChange({
      currentTarget: { value: "GPIO 3" },
    } as React.ChangeEvent<HTMLInputElement>);
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
    const { PinDropdown } = getPinFormFields();
    const p = fakeProps();
    const dropdown = PinDropdown(p);
    dropdown.props.onChange({ value: 3 });
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
    const { ModeDropdown } = getPinFormFields();
    const p = fakeProps();
    const dropdown = ModeDropdown(p);
    dropdown.props.onChange({ value: 0 });
    expect(p.dispatch).toHaveBeenCalledWith(
      expectedPayload({ mode: 0 }));
  });
});
