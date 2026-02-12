import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { NameInputBox, PinDropdown, ModeDropdown } from "../pin_form_fields";
import { fakeSensor } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import * as crud from "../../api/crud";

let mockFBSelectProps: { onChange: (d: { value: number }) => void } | undefined;
jest.mock("../../ui", () => ({
  FBSelect: (props: { onChange: (d: { value: number }) => void }) => {
    mockFBSelectProps = props;
    return <div data-testid="fb-select" />;
  },
}));

const expectedPayload = (update: Object) =>
  expect.objectContaining({
    payload: expect.objectContaining({
      update
    }),
    type: Actions.EDIT_RESOURCE
  });

beforeEach(() => {
  mockFBSelectProps = undefined;
  jest.spyOn(crud, "edit").mockImplementation((_: unknown, update: unknown) => ({
    type: "EDIT_RESOURCE",
    payload: { update },
  }) as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});
describe("<NameInputBox />", () => {
  const fakeProps = () => ({
    dispatch: jest.fn(),
    value: undefined,
    resource: fakeSensor(),
  });

  it("updates label", () => {
    const p = fakeProps();
    const { container } = render(<NameInputBox {...p} />);
    const input = container.querySelector("input");
    expect(input).toBeTruthy();
    input && fireEvent.change(input, { target: { value: "GPIO 3" } });
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
    render(<PinDropdown {...p} />);
    mockFBSelectProps?.onChange({ value: 3 });
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
    render(<ModeDropdown {...p} />);
    mockFBSelectProps?.onChange({ value: 0 });
    expect(p.dispatch).toHaveBeenCalledWith(
      expectedPayload({ mode: 0 }));
  });
});
