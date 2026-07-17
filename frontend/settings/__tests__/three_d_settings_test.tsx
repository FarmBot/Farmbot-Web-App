import React from "react";
import {
  get3DConfigValueFunction, namespace3D, SCENE_DDIS, TEXTURE_DDIS,
  ThreeDSettings,
} from "../three_d_settings";
import { ThreeDSettingsProps } from "../interfaces";
import { settingsPanelState } from "../../__test_support__/panel_state";
import { changeBlurableInputRTL } from "../../__test_support__/helpers";
import * as crud from "../../api/crud";
import { fakeFarmwareEnv } from "../../__test_support__/fake_state/resources";
import { fireEvent, render, within } from "@testing-library/react";

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
});


describe("<ThreeDSettings />", () => {
  const fakeProps = (): ThreeDSettingsProps => {
    const state = settingsPanelState();
    state.three_d = true;
    return {
      dispatch: jest.fn(),
      settingsPanelState: state,
      farmwareEnvs: [],
      distanceIndicator: "",
      sceneObjectUuids: [],
    };
  };

  it("toggles visual on", () => {
    const p = fakeProps();
    const { container } = render(<ThreeDSettings {...p} />);
    expect(within(container).getByDisplayValue("40")).toBeDefined();
  });

  it("toggles visual off", () => {
    const p = fakeProps();
    p.distanceIndicator = "bedWallThickness";
    const { container } = render(<ThreeDSettings {...p} />);
    expect(within(container).getByDisplayValue("40")).toBeDefined();
  });

  it("toggles distance indicator help", () => {
    const p = fakeProps();
    const { container } = render(<ThreeDSettings {...p} />);
    const help = container.querySelector(".help-icon");
    if (!help) { throw new Error("Missing help icon"); }

    fireEvent.click(help);

    expect(p.dispatch).toHaveBeenCalledWith({
      type: "SET_DISTANCE_INDICATOR",
      payload: "bedWallThickness",
    });
  });

  it("creates env", () => {
    const p = fakeProps();
    const { container } = render(<ThreeDSettings {...p} />);
    const input = within(container).getByDisplayValue("40");
    changeBlurableInputRTL(input, "100");
    expect(crud.initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: namespace3D("bedWallThickness"),
      value: "100",
    });
    expect(crud.edit).not.toHaveBeenCalled();
    expect(crud.save).not.toHaveBeenCalled();
  });

  it("edits env", () => {
    const p = fakeProps();
    const fakeEnv = fakeFarmwareEnv();
    fakeEnv.body.key = namespace3D("bedWallThickness");
    fakeEnv.body.value = "40";
    p.farmwareEnvs = [fakeEnv];
    const { container } = render(<ThreeDSettings {...p} />);
    const input = within(container).getByDisplayValue("40");
    changeBlurableInputRTL(input, "100");
    expect(crud.initSave).not.toHaveBeenCalled();
    expect(crud.edit).toHaveBeenCalledWith(fakeEnv, { value: "100" });
    expect(crud.save).toHaveBeenCalledWith(fakeEnv.uuid);
  });

  it("toggles setting on", () => {
    const { container } = render(<ThreeDSettings {...fakeProps()} />);
    const toggle = within(container).getByRole("button", { name: "no" });
    fireEvent.click(toggle);
    expect(crud.initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: namespace3D("bounds"),
      value: "1",
    });
    expect(crud.edit).not.toHaveBeenCalled();
    expect(crud.save).not.toHaveBeenCalled();
  });

  it("toggles setting off", () => {
    const p = fakeProps();
    const fakeEnv = fakeFarmwareEnv();
    fakeEnv.body.key = namespace3D("grid");
    fakeEnv.body.value = "1";
    p.farmwareEnvs = [fakeEnv];
    const { container } = render(<ThreeDSettings {...p} />);
    const toggle = within(container).getByRole("button", { name: "yes" });
    fireEvent.click(toggle);
    expect(crud.initSave).not.toHaveBeenCalled();
    expect(crud.edit).toHaveBeenCalledWith(fakeEnv, { value: "0" });
    expect(crud.save).toHaveBeenCalledWith(fakeEnv.uuid);
  });
});

describe("get3DConfigValueFunction()", () => {
  it("reads indexed 3D config values and defaults", () => {
    const bedWallThickness = fakeFarmwareEnv();
    bedWallThickness.body.key = namespace3D("bedWallThickness");
    bedWallThickness.body.value = "99.5";
    const unrelated = fakeFarmwareEnv();
    unrelated.body.key = "bedHeight";
    unrelated.body.value = "123";

    const getValue = get3DConfigValueFunction([unrelated, bedWallThickness]);

    expect(getValue("bedWallThickness")).toEqual(99.5);
    expect(getValue("bedHeight")).toEqual(300);
    expect(getValue("cameraFitDebug")).toEqual(0);
    expect(getValue("viewCube")).toEqual(1);
    expect(getValue("groundTexture")).toEqual(0);
  });

  it("reads the prefixed camera-fit debug setting", () => {
    const cameraFitDebug = fakeFarmwareEnv();
    cameraFitDebug.body.key = namespace3D("cameraFitDebug");
    cameraFitDebug.body.value = "1";
    expect(get3DConfigValueFunction([cameraFitDebug])("cameraFitDebug"))
      .toEqual(1);
  });

  it("reads boolean constellation custom settings", () => {
    const constellations = fakeFarmwareEnv();
    constellations.body.key = namespace3D("constellations");
    constellations.body.value = "false";
    const debug = fakeFarmwareEnv();
    debug.body.key = namespace3D("constellationsDebug");
    debug.body.value = "true";
    const getValue = get3DConfigValueFunction([constellations, debug]);

    expect(getValue("constellations")).toEqual(0);
    expect(getValue("constellationsDebug")).toEqual(1);
  });

  it("preserves first matching env behavior", () => {
    const first = fakeFarmwareEnv();
    first.body.key = namespace3D("grid");
    first.body.value = "1";
    const second = fakeFarmwareEnv();
    second.body.key = namespace3D("grid");
    second.body.value = "0";

    const getValue = get3DConfigValueFunction([first, second]);

    expect(getValue("grid")).toEqual(1);
  });
});

describe("TEXTURE_DDIS", () => {
  it("uses display labels and preserves stored values", () => {
    expect(TEXTURE_DDIS).toEqual({
      0: { label: "Grass", value: 0 },
      1: { label: "Bricks", value: 1 },
      2: { label: "Concrete", value: 2 },
      3: { label: "Water", value: 3 },
      4: { label: "Aluminum", value: 4 },
      5: { label: "Soil", value: 5 },
      6: { label: "Sand", value: 6 },
      7: { label: "Wood", value: 7 },
    });
  });
});

describe("SCENE_DDIS", () => {
  it("uses display labels and preserves stored values", () => {
    expect(SCENE_DDIS).toEqual({
      0: { label: "Outdoor", value: 0 },
      1: { label: "Lab", value: 1 },
      2: { label: "Greenhouse", value: 2 },
      3: { label: "Custom", value: 3 },
    });
  });
});
