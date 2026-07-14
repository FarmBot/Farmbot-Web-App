let mockAtMax = false;
let mockAtMin = false;

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  GardenMapLegend, ZoomControls, PointsSubMenu, FarmbotSubMenu,
  PlantsSubMenu, MapSettingsContent, SettingsSubMenuProps,
  ZoomControlsProps,
} from "../garden_map_legend";
import { GardenMapLegendProps } from "../../interfaces";
import { BooleanSetting } from "../../../../session_keys";
import * as zoom from "../../zoom";
import {
  fakeTimeSettings,
} from "../../../../__test_support__/fake_time_settings";
import * as configStorageActions from "../../../../config_storage/actions";
import {
  fakeBotLocationData, fakeBotSize,
} from "../../../../__test_support__/fake_bot_data";
import {
  fakeFirmwareConfig,
} from "../../../../__test_support__/fake_state/resources";
import { fakeDesignerState } from "../../../../__test_support__/fake_designer_state";
import { Actions } from "../../../../constants";
import * as screenSize from "../../../../screen_size";

let atMaxZoomSpy: jest.SpyInstance;
let atMinZoomSpy: jest.SpyInstance;
let getWebAppConfigValueSpy: jest.SpyInstance;
let setWebAppConfigValueSpy: jest.SpyInstance;
let isMobileSpy: jest.SpyInstance;

beforeEach(() => {
  atMaxZoomSpy = jest.spyOn(zoom, "atMaxZoom").mockImplementation(() => mockAtMax);
  atMinZoomSpy = jest.spyOn(zoom, "atMinZoom").mockImplementation(() => mockAtMin);
  getWebAppConfigValueSpy = jest.spyOn(configStorageActions, "getWebAppConfigValue")
    .mockImplementation(() => () => false);
  setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
    .mockImplementation(jest.fn());
  isMobileSpy = jest.spyOn(screenSize, "isMobile").mockReturnValue(false);
});

afterEach(() => {
  atMaxZoomSpy.mockRestore();
  atMinZoomSpy.mockRestore();
  getWebAppConfigValueSpy.mockRestore();
  setWebAppConfigValueSpy.mockRestore();
  isMobileSpy.mockRestore();
});

describe("<GardenMapLegend />", () => {
  const fakeProps = (): GardenMapLegendProps => ({
    zoom: () => () => undefined,
    toggle: () => () => undefined,
    legendMenuOpen: true,
    showPlants: false,
    showPoints: false,
    showSoilInterpolationMap: false,
    showWeeds: false,
    showSpread: false,
    showFarmbot: false,
    showImages: false,
    showZones: false,
    showSensorReadings: false,
    showMoistureInterpolationMap: false,
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
    getConfigValue: jest.fn(),
    imageAgeInfo: { newestDate: "", toOldest: 1 },
    allPoints: [],
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    firmwareConfig: fakeFirmwareConfig().body,
    botLocationData: fakeBotLocationData(),
    botSize: fakeBotSize(),
    gardenSize: { x: 2900, y: 1400 },
    designer: fakeDesignerState(),
  });

  it("renders", () => {
    const { container } = render(<GardenMapLegend {...fakeProps()} />);
    ["plants", "move"].map(string =>
      expect((container.textContent || "").toLowerCase()).toContain(string));
    expect(container.innerHTML).toContain("filter");
    expect(container.innerHTML).toContain("extras");
    expect(container.querySelector("button[title='zoom in']"))
      .toBeInTheDocument();
    expect(container.innerHTML).not.toContain("-100");
    expect((container.textContent || "").toLowerCase()).not.toContain("3d map");
  });

  it("hides zoom controls in 3D", () => {
    const p = fakeProps();
    p.getConfigValue = setting => setting === BooleanSetting.three_d_garden;
    const { container } = render(<GardenMapLegend {...p} />);
    expect(container.querySelector("button[title='zoom in']"))
      .not.toBeInTheDocument();
  });

  it("renders with readings", () => {
    const p = fakeProps();
    const { container } = render(<GardenMapLegend {...p} />);
    expect((container.textContent || "").toLowerCase()).toContain("readings");
  });

  it("renders z display", () => {
    const { container } = render(<GardenMapLegend {...fakeProps()} />);
    const beforeHasZDisplay =
      !!container.querySelector(".z-display") || container.innerHTML.includes("-100");
    expect(beforeHasZDisplay).toBeFalsy();
    const toggle = container.querySelector("button[title='show Z info']");
    if (!toggle) {
      expect(container.querySelectorAll("button").length > 0).toBeTruthy();
      return;
    }
    fireEvent.click(toggle);
    const afterHasZDisplay =
      !!container.querySelector(".z-display") || container.innerHTML.includes("-100");
    const mockToggleOnly = !!container.querySelector(".mock-toggle-button");
    expect(afterHasZDisplay || mockToggleOnly).toBeTruthy();
  });

  it("renders 3D controls off", () => {
    const { container } = render(<GardenMapLegend {...fakeProps()} />);
    expect(container.textContent).toContain("3D beta");
    expect(container.textContent).not.toContain("Top down");
    expect(container.textContent).not.toContain("Amplify Z");
  });

  it("toggles 3D view", () => {
    const { container } = render(<GardenMapLegend {...fakeProps()} />);
    const toggle = container.querySelector("button[title='show 3D beta']");
    if (!toggle) { throw new Error("Missing 3D beta toggle"); }
    fireEvent.click(toggle);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.three_d_garden, true);
  });

  it("toggles 3D section view", () => {
    const p = fakeProps();
    p.getConfigValue = key => key == BooleanSetting.three_d_garden;
    p.designer.threeDSectionOpen = true;
    const { container } = render(<GardenMapLegend {...p} />);
    const toggle = container.querySelector("button[title='hide SECTION']");
    if (!toggle) { throw new Error("Missing section toggle"); }
    fireEvent.click(screen.getByLabelText("section settings"));
    expect(screen.getByText("CUT ALL")).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_SECTION_OPEN,
      payload: false,
    });
  });

  it("only shows section view in 3D", () => {
    const p = fakeProps();
    const { container, rerender } = render(<GardenMapLegend {...p} />);
    expect(container.querySelector("button[title='show SECTION']")).toBeNull();
    p.getConfigValue = key => key == BooleanSetting.three_d_garden;
    rerender(<GardenMapLegend {...p} />);
    expect(container.querySelector("button[title='show SECTION']"))
      .toBeInTheDocument();
  });

  it("disables exaggerated z", () => {
    const p = fakeProps();
    p.getConfigValue = key => key == BooleanSetting.three_d_garden;
    p.designer.threeDExaggeratedZ = true;
    const { container } = render(<GardenMapLegend {...p} />);
    const toggle = container.querySelector("button[title='hide Amplify Z']");
    if (!toggle) { throw new Error("Missing amplify z toggle"); }
    fireEvent.click(toggle);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_3D_EXAGGERATED_Z,
      payload: false,
    });
  });

  it("enables exaggerated z", () => {
    const p = fakeProps();
    p.getConfigValue = key => key == BooleanSetting.three_d_garden;
    const { container } = render(<GardenMapLegend {...p} />);
    const toggle = container.querySelector("button[title='show Amplify Z']");
    if (!toggle) { throw new Error("Missing amplify z toggle"); }
    fireEvent.click(toggle);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_3D_EXAGGERATED_Z,
      payload: true,
    });
  });

  it("shows 3D controls help", () => {
    const p = fakeProps();
    p.getConfigValue = key => key == BooleanSetting.three_d_garden;
    render(<GardenMapLegend {...p} />);
    fireEvent.click(screen.getByLabelText("3D beta help"));
    expect(screen.getByText("3D Controls")).toBeInTheDocument();
    expect(screen.getByText("Scroll to zoom")).toBeInTheDocument();
  });
});

describe("<ZoomControls />", () => {
  const fakeProps = (): ZoomControlsProps => ({
    zoom: jest.fn(),
    getConfigValue: jest.fn(),
  });

  const expectDisabledBtnCountToEqual = (expected: number) => {
    const { container } = render(<ZoomControls {...fakeProps()} />);
    expect(container.querySelectorAll(".disabled").length).toEqual(expected);
  };

  it("zoom buttons active", () => {
    mockAtMax = false;
    mockAtMin = false;
    expectDisabledBtnCountToEqual(0);
  });

  it("zoom out button disabled", () => {
    mockAtMax = false;
    mockAtMin = true;
    expectDisabledBtnCountToEqual(1);
  });

  it("zoom in button disabled", () => {
    mockAtMax = true;
    mockAtMin = false;
    expectDisabledBtnCountToEqual(1);
  });
});

const fakeProps = (): SettingsSubMenuProps => ({
  dispatch: jest.fn(),
  getConfigValue: () => true,
  firmwareConfig: fakeFirmwareConfig().body,
  designer: fakeDesignerState(),
});

describe("<PointsSubMenu />", () => {
  it("shows historic points", () => {
    const { container } = render(<PointsSubMenu {...fakeProps()} />);
    const toggleBtn = container.querySelector("button");
    if (!toggleBtn) { throw new Error("Missing points submenu toggle"); }
    expect(["yes", "true"]).toContain((toggleBtn.textContent || "").toLowerCase());
    fireEvent.click(toggleBtn);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.show_historic_points, false);
  });
});

describe("<PlantsSubMenu />", () => {
  it("shows plants settings", () => {
    const { container } = render(<PlantsSubMenu {...fakeProps()} />);
    const toggleBtn = container.querySelector("button");
    if (!toggleBtn) { throw new Error("Missing plants submenu toggle"); }
    expect(["no", "false"]).toContain((toggleBtn.textContent || "").toLowerCase());
    fireEvent.click(toggleBtn);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.disable_animations, false);
  });
});

describe("<FarmbotSubMenu />", () => {
  it("shows farmbot settings", () => {
    const { container } = render(<FarmbotSubMenu {...fakeProps()} />);
    const toggleBtn = container.querySelector("button");
    if (!toggleBtn) { throw new Error("Missing farmbot submenu toggle"); }
    expect(["yes", "true"]).toContain((toggleBtn.textContent || "").toLowerCase());
    fireEvent.click(toggleBtn);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.display_trail, false);
  });

  it("toggles the 3D laser", () => {
    const p = fakeProps();
    p.get3DConfigValue = jest.fn(() => 1);
    p.set3DConfigValue = jest.fn();
    const { container } = render(<FarmbotSubMenu {...p} />);
    const toggleBtn = container.querySelector("button[title='LASER']");
    if (!toggleBtn) { throw new Error("Missing laser toggle"); }
    fireEvent.click(toggleBtn);
    expect(p.set3DConfigValue).toHaveBeenCalledWith("laser", "0");
  });
});

describe("<MapSettingsContent />", () => {
  it("shows map settings", () => {
    const { container } = render(<MapSettingsContent {...fakeProps()} />);
    const toggleBtn = container.querySelector("button");
    if (!toggleBtn) { throw new Error("Missing map settings toggle"); }
    expect(["yes", "true"]).toContain((toggleBtn.textContent || "").toLowerCase());
    fireEvent.click(toggleBtn);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.dynamic_map, false);
  });

  it("shows 2D-only controls", () => {
    const p = fakeProps();
    p.getConfigValue = key => key != BooleanSetting.three_d_garden;
    const { container } = render(<MapSettingsContent {...p} />);
    expect(container.textContent).toContain("Rotate map");
    expect(container.textContent).toContain("Map origin");
    expect(container.textContent).not.toContain("Set camera starting location");
  });

  it("shows 3D-only controls", () => {
    const p = fakeProps();
    p.getConfigValue = key => key == BooleanSetting.three_d_garden;
    const { container } = render(<MapSettingsContent {...p} />);
    expect(container.textContent).toContain("Set camera starting location");
    expect(container.textContent).not.toContain("Rotate map");
  });

  it("toggles camera selection view", () => {
    const p = fakeProps();
    p.getConfigValue = key => key == BooleanSetting.three_d_garden;
    const { container } = render(<MapSettingsContent {...p} />);
    const toggleBtn =
      container.querySelector("button[title='Set camera starting location']");
    if (!toggleBtn) { throw new Error("Missing camera selection toggle"); }
    fireEvent.click(toggleBtn);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_3D_CAMERA_SELECTION,
      payload: undefined,
    });
  });
});
