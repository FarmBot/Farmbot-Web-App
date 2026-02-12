import React from "react";
import { render, screen } from "@testing-library/react";
import { CaptureSettings } from "../index";
import { CaptureSettingsProps } from "../interfaces";
import { DropDownItem } from "../../../ui/fb_select";

jest.mock("../../../ui", () => {
  const actual = jest.requireActual("../../../ui");
  return {
    ...actual,
    FBSelect: (props: { selectedItem?: DropDownItem }) =>
      <span data-testid={"fb-select-value"}>
        {"" + props.selectedItem?.value}
      </span>,
  };
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
