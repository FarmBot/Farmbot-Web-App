import React from "react";
import type { ImageWorkspaceProps } from "../index";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { Actions } from "../../../constants";
import { fireEvent, render, screen } from "@testing-library/react";

const renderImageWorkspace = (props: ImageWorkspaceProps) => {
  const index = jest.requireActual("../index");
  return render(<index.ImageWorkspace {...props} />);
};

describe("<ImageWorkspace />", () => {
  const fakeProps = (): ImageWorkspaceProps => ({
    onProcessPhoto: jest.fn(),
    onChange: jest.fn(),
    currentImage: undefined,
    images: [],
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
    p.showAdvanced = true;
    renderImageWorkspace(p);
    const blurInput = screen.getByText("BLUR")
      .closest(".grid.no-gap")?.querySelector("input");
    expect(blurInput).toBeTruthy();
    fireEvent.focus(blurInput as Element);
    fireEvent.change(blurInput as Element, {
      target: { value: "23" },
      currentTarget: { value: "23" },
    });
    fireEvent.blur(blurInput as Element, {
      target: { value: "23" },
      currentTarget: { value: "23" },
    });
    expect(p.onChange).toHaveBeenCalledWith("blur", 23);
  });

  it("doesn't process photo", async () => {
    const p = fakeProps();
    p.images = [fakeImage()];
    p.currentImage = undefined;
    await renderImageWorkspace(p);
    const button = screen.getAllByText("Scan current image")[0];
    fireEvent.click(button);
    expect(p.onProcessPhoto).not.toHaveBeenCalled();
  });

  it("processes selected photo", async () => {
    const p = fakeProps();
    const photo1 = fakeImage();
    photo1.body.id = 1;
    const photo2 = fakeImage();
    photo2.body.id = 2;
    p.images = [photo1, photo2];
    p.currentImage = photo2;
    await renderImageWorkspace(p);
    const button = screen.getAllByText("Scan current image")[0];
    fireEvent.click(button);
    expect(p.onProcessPhoto).toHaveBeenCalledWith(photo2.body.id);
  });

  it("scans image", async () => {
    const image = fakeImage();
    const p = fakeProps();
    p.botOnline = true;
    p.images = [image];
    p.currentImage = image;
    p.showAdvanced = true;
    await renderImageWorkspace(p);
    const button = screen.getAllByText("Scan current image")[0];
    fireEvent.click(button);
    expect(p.onProcessPhoto).toHaveBeenCalledWith(image.body.id);
  });

  it("disables scan image button when offline", async () => {
    const p = fakeProps();
    p.botOnline = false;
    await renderImageWorkspace(p);
    const button = screen.getAllByText("Scan current image")[0];
    expect(button).toBeDisabled();
  });

  it("opens: calibration", async () => {
    const p = fakeProps();
    p.showAdvanced = true;
    await renderImageWorkspace(p);
    const header = screen.getByText("Processing Parameters");
    fireEvent.click(header);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_PHOTOS_PANEL_OPTION,
      payload: "calibrationPP",
    });
  });

  it("opens: detection", async () => {
    const p = fakeProps();
    p.showAdvanced = true;
    p.sectionKey = "detection";
    await renderImageWorkspace(p);
    const header = screen.getByText("Processing Parameters");
    fireEvent.click(header);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_PHOTOS_PANEL_OPTION,
      payload: "detectionPP",
    });
  });
});
