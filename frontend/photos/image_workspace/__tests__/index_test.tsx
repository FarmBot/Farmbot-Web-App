import React from "react";
import { ImageWorkspace, ImageWorkspaceProps } from "../index";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { TaggedImage } from "farmbot";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { changeBlurableInputRTL } from "../../../__test_support__/helpers";
import { Actions } from "../../../constants";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<ImageWorkspace />", () => {
  const fakeProps = (): ImageWorkspaceProps => ({
    onProcessPhoto: jest.fn(),
    onChange: jest.fn(),
    currentImage: undefined as TaggedImage | undefined,
    images: [] as TaggedImage[],
    iteration: 15,
    morph: 17,
    blur: 19,
    H_LO: 2,
    S_LO: 4,
    V_LO: 6,
    H_HI: 8,
    S_HI: 10,
    V_HI: 12,
    botOnline: true,
    timeSettings: fakeTimeSettings(),
    namespace: jest.fn(() => "CAMERA_CALIBRATION_H_HI"),
    showAdvanced: false,
    sectionKey: "calibration",
    advancedSectionOpen: true,
    dispatch: jest.fn(),
  });

  it("triggers numericChange()", () => {
    const p = fakeProps();
    render(<ImageWorkspace {...p} />);
    const input = screen.getByDisplayValue("19");
    changeBlurableInputRTL(input, "23");
    expect(p.onChange).toHaveBeenCalledWith("blur", 23);
  });

  it("doesn't process photo", () => {
    const p = fakeProps();
    p.images = [fakeImage()];
    p.currentImage = undefined;
    render(<ImageWorkspace {...p} />);
    const button = screen.getByText("Scan current image");
    fireEvent.click(button);
    expect(p.onProcessPhoto).not.toHaveBeenCalled();
  });

  it("processes selected photo", () => {
    const p = fakeProps();
    const photo1 = fakeImage();
    photo1.body.id = 1;
    const photo2 = fakeImage();
    photo2.body.id = 2;
    p.images = [photo1, photo2];
    p.currentImage = photo2;
    render(<ImageWorkspace {...p} />);
    const button = screen.getByText("Scan current image");
    fireEvent.click(button);
    expect(p.onProcessPhoto).toHaveBeenCalledWith(photo2.body.id);
  });

  it("scans image", () => {
    const image = fakeImage();
    const p = fakeProps();
    p.botOnline = true;
    p.images = [image];
    p.currentImage = image;
    p.showAdvanced = true;
    render(<ImageWorkspace {...p} />);
    const button = screen.getByText("Scan current image");
    fireEvent.click(button);
    expect(p.onProcessPhoto).toHaveBeenCalledWith(image.body.id);
  });

  it("disables scan image button when offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    render(<ImageWorkspace {...p} />);
    const button = screen.getByText("Scan current image");
    expect(button).toBeDisabled();
  });

  it("opens: calibration", () => {
    const p = fakeProps();
    p.showAdvanced = true;
    render(<ImageWorkspace {...p} />);
    const header = screen.getByText("Processing Parameters");
    fireEvent.click(header);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_PHOTOS_PANEL_OPTION, payload: "calibrationPP",
    });
  });

  it("opens: detection", () => {
    const p = fakeProps();
    p.showAdvanced = true;
    p.sectionKey = "detection";
    render(<ImageWorkspace {...p} />);
    const header = screen.getByText("Processing Parameters");
    fireEvent.click(header);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_PHOTOS_PANEL_OPTION, payload: "detectionPP",
    });
  });
});
