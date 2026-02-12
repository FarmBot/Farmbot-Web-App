import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { PhotoFilterSettings, FiltersEnabledWarning } from "../index";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";
import {
  fakeImage, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import * as configStorageActions from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";
import * as photoFilterActions from "../actions";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import {
  PhotoFilterSettingsProps, FiltersEnabledWarningProps,
} from "../interfaces";
import { fakeDesignerState } from "../../../__test_support__/fake_designer_state";

let setWebAppConfigValueSpy: jest.SpyInstance;
let setWebAppConfigValuesSpy: jest.SpyInstance;
let toggleAlwaysHighlightImageSpy: jest.SpyInstance;
let toggleSingleImageModeSpy: jest.SpyInstance;

beforeEach(() => {
  setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
    .mockImplementation(jest.fn());
  setWebAppConfigValuesSpy = jest.spyOn(photoFilterActions, "setWebAppConfigValues")
    .mockImplementation(jest.fn());
  toggleAlwaysHighlightImageSpy =
    jest.spyOn(photoFilterActions, "toggleAlwaysHighlightImage")
      .mockImplementation(() => jest.fn(() => jest.fn()));
  toggleSingleImageModeSpy = jest.spyOn(photoFilterActions, "toggleSingleImageMode")
    .mockImplementation(() => jest.fn(() => jest.fn()));
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

describe("<PhotoFilterSettings />", () => {
  const fakeProps = (): PhotoFilterSettingsProps => ({
    dispatch: mockDispatch(),
    images: [],
    currentImage: fakeImage(),
    timeSettings: fakeTimeSettings(),
    flags: fakeImageShowFlags(),
    designer: fakeDesignerState(),
    getConfigValue: jest.fn(),
  });

  const getToggle = (
    container: HTMLElement,
    label: string,
  ): HTMLElement | undefined => {
    const row = within(container).queryByText(new RegExp(`^${label}$`, "i"))?.closest(".row")
      || within(container).queryByText(new RegExp(label, "i"))?.closest(".row");
    if (!row) {
      const byRole = screen.queryByRole("switch", { name: new RegExp(label, "i") })
        || screen.queryByRole("checkbox", { name: new RegExp(label, "i") })
        || screen.queryByRole("button", { name: new RegExp(label, "i") });
      return byRole instanceof HTMLElement ? byRole : undefined;
    }
    const button = row.querySelector("button.fb-toggle-button")
      || row.querySelector("button");
    if (button instanceof HTMLElement) { return button; }
    const checkbox = row.querySelector("input[type=\"checkbox\"]")
      || row.querySelector("[role=\"switch\"]");
    return checkbox instanceof HTMLElement ? checkbox : undefined;
  };

  it("sets resets filter settings", () => {
    render(<PhotoFilterSettings {...fakeProps()} />);
    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(setWebAppConfigValuesSpy).toHaveBeenCalledWith({
      photo_filter_begin: "",
      photo_filter_end: "",
    });
  });

  it("toggles photos", () => {
    const { container } = render(<PhotoFilterSettings {...fakeProps()} />);
    const toggle = getToggle(container, "show photos in map");
    if (!toggle) { throw new Error("Missing photo map toggle"); }
    fireEvent.click(toggle);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.show_images, false);
  });

  it("toggles always highlight mode", () => {
    const p = fakeProps();
    const { container } = render(<PhotoFilterSettings {...p} />);
    const toggle = getToggle(container, "always highlight current photo in map");
    if (!toggle) { throw new Error("Missing always highlight toggle"); }
    fireEvent.click(toggle);
    expect(toggleAlwaysHighlightImageSpy).toHaveBeenCalledWith(
      false, p.currentImage);
  });

  it("displays single image mode", () => {
    const p = fakeProps();
    p.designer.hideUnShownImages = true;
    const { container } = render(<PhotoFilterSettings {...p} />);
    expect(container.querySelector(".filter-controls")?.classList
      .contains("single-image-mode")).toBeTruthy();
  });

  it("toggles single image mode", () => {
    const p = fakeProps();
    const { container } = render(<PhotoFilterSettings {...p} />);
    const toggle = getToggle(container, "only show current photo in map");
    if (!toggle) { throw new Error("Missing single image toggle"); }
    fireEvent.click(toggle);
    expect(toggleSingleImageModeSpy).toHaveBeenCalledWith(p.currentImage);
  });

  it("displays image layer off mode", () => {
    const p = fakeProps();
    p.flags.layerOn = false;
    const { container } = render(<PhotoFilterSettings {...p} />);
    expect(container.querySelector(".filter-controls")?.classList
      .contains("image-layer-disabled")).toBeTruthy();
  });

  it("sets filter settings to current image and earlier", () => {
    const p = fakeProps();
    p.currentImage
      && (p.currentImage.body.created_at = "2001-01-03T05:00:01.000Z");
    const { container } = render(<PhotoFilterSettings {...p} />);
    const olderButton = container
      .querySelector(".newer-older-images-section button[title='older']");
    expect(olderButton).toBeTruthy();
    fireEvent.click(olderButton as HTMLButtonElement);
    expect(setWebAppConfigValuesSpy).toHaveBeenCalledWith({
      photo_filter_begin: "",
      photo_filter_end: "2001-01-03T05:00:02.000Z",
    });
  });

  it("sets filter settings to current image and later", () => {
    const p = fakeProps();
    p.currentImage
      && (p.currentImage.body.created_at = "2001-01-03T05:00:01.000Z");
    const { container } = render(<PhotoFilterSettings {...p} />);
    const newerButton = container
      .querySelector(".newer-older-images-section button[title='newer']");
    expect(newerButton).toBeTruthy();
    fireEvent.click(newerButton as HTMLButtonElement);
    expect(setWebAppConfigValuesSpy).toHaveBeenCalledWith({
      photo_filter_begin: "2001-01-03T05:00:00.000Z",
      photo_filter_end: "",
    });
  });
});

describe("<FiltersEnabledWarning />", () => {
  const config = fakeWebAppConfig();
  config.body.photo_filter_begin = "";
  config.body.photo_filter_end = "";
  config.body.show_images = true;

  const fakeProps = (): FiltersEnabledWarningProps => ({
    designer: fakeDesignerState(),
    getConfigValue: jest.fn(x => config.body[x]),
  });

  it("renders when no filters are enabled", () => {
    render(<FiltersEnabledWarning {...fakeProps()} />);
    expect(screen.queryByTitle("Map filters enabled.")).toBeNull();
  });

  it("renders when filters are enabled", () => {
    const p = fakeProps();
    p.designer.hideUnShownImages = true;
    const onParentClick = jest.fn();
    render(<div onClick={onParentClick}>
      <FiltersEnabledWarning {...p} />
    </div>);
    const warning = screen.getByTitle("Map filters enabled.");
    fireEvent.click(warning);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
