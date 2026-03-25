import React from "react";
import { render, screen } from "@testing-library/react";
import { CaptureSettings } from "../index";
import { CaptureSettingsProps } from "../interfaces";
import * as ui from "../../../ui";
import { FBSelectProps } from "../../../ui/new_fb_select";

let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation(((props: FBSelectProps) =>
      <span data-testid={"fb-select-value"}>
        {"" + props.selectedItem?.value}
      </span>) as never);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
});

describe("<CaptureSettings />", () => {
  const fakeProps = (): CaptureSettingsProps => ({
    env: {},
    saveFarmwareEnv: jest.fn(),
    botOnline: true,
    dispatch: jest.fn(),
    version: "1.0.14",
  });

  it("displays default size", () => {
    render(<CaptureSettings {...fakeProps()} />);
    expect(screen.getByText(/resolution/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("fb-select-value")[1])
      .toHaveTextContent("640x480");
  });
});
