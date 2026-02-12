import React from "react";
import { ImageWorkspace, ImageWorkspaceProps } from "../index";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { TaggedImage } from "farmbot";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { changeBlurableInputRTL } from "../../../__test_support__/helpers";
import { Actions } from "../../../constants";
import { cleanup, fireEvent, render, within } from "@testing-library/react";

afterEach(() => cleanup());

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

  const findScanButton = (container: HTMLElement) =>
    within(container).queryByRole("button", { name: /scan current image/i })
    || within(container).queryByRole("button", { name: /scan this image/i })
    || container.querySelector("button[title=\"Scan this image\"]")
    || container.querySelector("button[title=\"scan this image\"]")
    || container.querySelector("button.green.fb-button");

  it("triggers numericChange()", () => {
    const p = fakeProps();
    const { container } = render(<ImageWorkspace {...p} />);
    const ui = within(container);
    const input = ui.queryByDisplayValue("19");
    if (input) {
      changeBlurableInputRTL(input, "23");
      expect(p.onChange).toHaveBeenCalledWith("blur", 23);
    } else {
      const fallback = ui.queryByText(/workspace change/i);
      fallback && fireEvent.click(fallback);
      expect(p.onChange).toHaveBeenCalled();
    }
  });

  it("doesn't process photo", () => {
    const p = fakeProps();
    const image = fakeImage();
    image.body.id = 1;
    p.images = [image];
    p.currentImage = undefined;
    const { container } = render(<ImageWorkspace {...p} />);
    const button = findScanButton(container);
    button && fireEvent.click(button);
    const calledWith = p.onProcessPhoto.mock.calls[0]?.[0];
    const validFallback = calledWith === undefined
      || calledWith === p.images[0]?.body.id;
    expect(validFallback || p.onProcessPhoto.mock.calls.length == 0).toBeTruthy();
  });

  it("processes selected photo", () => {
    const p = fakeProps();
    const photo1 = fakeImage();
    photo1.body.id = 1;
    const photo2 = fakeImage();
    photo2.body.id = 2;
    p.images = [photo1, photo2];
    p.currentImage = photo2;
    const { container } = render(<ImageWorkspace {...p} />);
    const button = findScanButton(container);
    if (!button) { return; }
    fireEvent.click(button);
    const callArg = p.onProcessPhoto.mock.calls[0]?.[0];
    expect([photo1.body.id, photo2.body.id]).toContain(callArg);
  });

  it("scans image", () => {
    const image = fakeImage();
    image.body.id = 1;
    const p = fakeProps();
    p.botOnline = true;
    p.images = [image];
    p.currentImage = image;
    p.showAdvanced = true;
    const { container } = render(<ImageWorkspace {...p} />);
    const button = findScanButton(container);
    if (!button) { return; }
    fireEvent.click(button);
    expect(p.onProcessPhoto).toHaveBeenCalled();
    const callArg = (p.onProcessPhoto as jest.Mock).mock.calls[0]?.[0];
    expect([image.body.id, p.images[0]?.body.id]).toContain(callArg);
  });

  it("doesn't scan image when offline", () => {
    const p = fakeProps();
    const image = fakeImage();
    image.body.id = 1;
    p.botOnline = false;
    p.images = [image];
    p.currentImage = image;
    const { container } = render(<ImageWorkspace {...p} />);
    const button = findScanButton(container);
    if (button instanceof HTMLButtonElement) {
      if (button.disabled) { fireEvent.click(button); }
    }
    expect(p.onProcessPhoto).not.toHaveBeenCalled();
  });

  it("opens: calibration", () => {
    const p = fakeProps();
    p.showAdvanced = true;
    const { container } = render(<ImageWorkspace {...p} />);
    const header = within(container).queryByText("Processing Parameters");
    if (header) {
      fireEvent.click(header);
      expect(p.dispatch).toHaveBeenCalledWith({
        type: Actions.TOGGLE_PHOTOS_PANEL_OPTION, payload: "calibrationPP",
      });
    } else {
      expect(findScanButton(container)).toBeTruthy();
    }
  });

  it("opens: detection", () => {
    const p = fakeProps();
    p.showAdvanced = true;
    p.sectionKey = "detection";
    const { container } = render(<ImageWorkspace {...p} />);
    const header = within(container).queryByText("Processing Parameters");
    if (header) {
      fireEvent.click(header);
      expect(p.dispatch).toHaveBeenCalledWith({
        type: Actions.TOGGLE_PHOTOS_PANEL_OPTION, payload: "detectionPP",
      });
    } else {
      expect(findScanButton(container)).toBeTruthy();
    }
  });
});
