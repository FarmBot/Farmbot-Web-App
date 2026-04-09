import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DefaultAxisOrder } from "../default_axis_order";
import { DefaultAxisOrderProps } from "../interfaces";
import * as deviceActions from "../../../devices/actions";
import * as ui from "../../../ui";
import { FBSelectProps } from "../../../ui";

let updateConfigSpy: jest.SpyInstance;
let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn());
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation(((props: FBSelectProps) =>
      <div>
        <span data-testid="selected-label">{props.selectedItem?.label}</span>
        <button onClick={() =>
          props.onChange({ label: "X and Y together", value: "xy,z;high" })}>
          mock-select
        </button>
      </div>) as never);
});

afterEach(() => {
  updateConfigSpy.mockRestore();
  fbSelectSpy.mockRestore();
});

describe("<DefaultAxisOrder />", () => {
  const fakeProps = (): DefaultAxisOrderProps => ({
    sourceFbosConfig: () => ({ value: "safe_z", consistent: true }),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const p = fakeProps();
    render(<DefaultAxisOrder {...p} />);
    expect(screen.getByTestId("selected-label").textContent).toEqual("Safe Z");
    fireEvent.click(screen.getByText("mock-select"));
    expect(deviceActions.updateConfig)
      .toHaveBeenCalledWith({ default_axis_order: "xy,z;high" });
  });
});
