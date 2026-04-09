import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  CaptureSizeSelection, PhotoResolutionSettingChanged,
} from "../capture_size_selection";
import { CaptureSizeSelectionProps } from "../interfaces";
import * as ui from "../../../ui";
import { FBSelectProps } from "../../../ui/new_fb_select";

let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation(((props: FBSelectProps) =>
      <div>
        <span data-testid={"selected-size"}>
          {"" + props.selectedItem?.value}
        </span>
        <button onClick={() => props.onChange({ label: "", value: "custom" })}>
          select custom
        </button>
        <button onClick={() => props.onChange({ label: "", value: "320x240" })}>
          select 320x240
        </button>
        <button onClick={() =>
          props.onChange({ label: "", value: "1600x1200" })}>
          select 1600x1200
        </button>
        <button onClick={() => props.onChange({ label: "", value: "maximum" })}>
          select maximum
        </button>
      </div>) as never);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
});

describe("<PhotoResolutionSettingChanged />", () => {
  const fakeProps = (): CaptureSizeSelectionProps => ({
    env: {},
    saveFarmwareEnv: jest.fn(),
    dispatch: jest.fn(),
  });

  it("doesn't display warning: not calibrated", () => {
    const p = fakeProps();
    p.env = {
      take_photo_width: "200",
      take_photo_height: "100",
    };
    const { container } = render(<PhotoResolutionSettingChanged {...p} />);
    expect(container.querySelector("i")).toBeNull();
  });

  it("doesn't display warning: not changed", () => {
    const p = fakeProps();
    p.env = {
      take_photo_width: "200",
      take_photo_height: "100",
      CAMERA_CALIBRATION_center_pixel_location_x: "100",
      CAMERA_CALIBRATION_center_pixel_location_y: "50",
    };
    const { container } = render(<PhotoResolutionSettingChanged {...p} />);
    expect(container.querySelector("i")).toBeNull();
    expect(container.querySelector(".click")).toBeNull();
  });

  it("doesn't display revert option", () => {
    const p = fakeProps();
    p.env = {
      take_photo_width: "200",
      take_photo_height: "100",
      CAMERA_CALIBRATION_center_pixel_location_x: "1",
      CAMERA_CALIBRATION_center_pixel_location_y: "50",
    };
    const { container } = render(<PhotoResolutionSettingChanged {...p} />);
    expect(container.querySelector("i")).toBeTruthy();
    expect(container.querySelector(".click")).toBeNull();
  });

  it("changes value", () => {
    const p = fakeProps();
    p.env = {
      take_photo_width: "200",
      take_photo_height: "100",
      CAMERA_CALIBRATION_center_pixel_location_x: "320",
      CAMERA_CALIBRATION_center_pixel_location_y: "50",
    };
    const { container } = render(<PhotoResolutionSettingChanged {...p} />);
    expect(container.querySelector("i")).toBeTruthy();
    const revert = container.querySelector(".click");
    expect(revert).toBeTruthy();
    fireEvent.click(revert as HTMLElement);
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_width", "640");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_height", "480");
  });
});

describe("<CaptureSizeSelection />", () => {
  const fakeProps = (): CaptureSizeSelectionProps => ({
    env: {},
    saveFarmwareEnv: jest.fn(),
    dispatch: jest.fn(),
  });

  it("changes custom capture size", () => {
    const p = fakeProps();
    p.env = { take_photo_width: "200", take_photo_height: "100" };
    render(<CaptureSizeSelection {...p} />);
    expect(screen.getByTestId("selected-size")).toHaveTextContent("custom");
    fireEvent.click(screen.getByRole("button", { name: /select custom/i }));
    expect(p.saveFarmwareEnv).not.toHaveBeenCalled();
    const sizeInputs = screen.queryAllByRole("spinbutton");
    const [widthInput, heightInput] = sizeInputs.length >= 2
      ? sizeInputs
      : screen.getAllByRole("textbox");
    fireEvent.focus(widthInput);
    fireEvent.change(widthInput, {
      target: { value: "400" },
      currentTarget: { value: "400" }
    });
    fireEvent.blur(widthInput, {
      target: { value: "400" },
      currentTarget: { value: "400" },
    });
    fireEvent.focus(heightInput);
    fireEvent.change(heightInput, {
      target: { value: "300" },
      currentTarget: { value: "300" }
    });
    fireEvent.blur(heightInput, {
      target: { value: "300" },
      currentTarget: { value: "300" },
    });
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_width", "400");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_height", "300");
  });

  it("changes preset capture size", () => {
    const p = fakeProps();
    p.env = {};
    render(<CaptureSizeSelection {...p} />);
    expect(screen.getByTestId("selected-size")).toHaveTextContent("640x480");
    fireEvent.click(screen.getByRole("button", { name: /select 320x240/i }));
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_width", "320");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_height", "240");
  });

  it.each<[string, number, number, number, number]>([
    ["1600x1200", 1600, 1200, 1600, 1200],
    ["maximum", 5001, 5001, 10000, 10000],
  ])("changes preset capture size: %s",
    (selection, width, height, expectedWidth, expectedHeight) => {
      const p = fakeProps();
      p.env = { take_photo_width: "" + width, take_photo_height: "" + height };
      render(<CaptureSizeSelection {...p} />);
      expect(screen.getByTestId("selected-size")).toHaveTextContent(selection);
      fireEvent.click(screen.getByRole("button", {
        name: new RegExp(`select ${selection}`),
      }));
      expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
        "take_photo_width", "" + expectedWidth);
      expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
        "take_photo_height", "" + expectedHeight);
    });
});
