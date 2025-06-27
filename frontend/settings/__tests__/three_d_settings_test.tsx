jest.mock("../../api/crud", () => ({
  initSave: jest.fn(),
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { namespace3D, ThreeDSettings } from "../three_d_settings";
import { ThreeDSettingsProps } from "../interfaces";
import { settingsPanelState } from "../../__test_support__/panel_state";
import { Actions } from "../../constants";
import { changeBlurableInputRTL } from "../../__test_support__/helpers";
import { edit, initSave, save } from "../../api/crud";
import { fakeFarmwareEnv } from "../../__test_support__/fake_state/resources";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<ThreeDSettings />", () => {
  const fakeProps = (): ThreeDSettingsProps => {
    const state = settingsPanelState();
    state.three_d = true;
    return {
      dispatch: jest.fn(),
      settingsPanelState: state,
      farmwareEnvs: [],
      distanceIndicator: "",
    };
  };

  it("toggles visual on", () => {
    const p = fakeProps();
    render(<ThreeDSettings {...p} />);
    const helpIcon = screen.getAllByRole("tooltip")[0];
    fireEvent.click(helpIcon);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DISTANCE_INDICATOR,
      payload: "bedWallThickness",
    });
  });

  it("toggles visual off", () => {
    const p = fakeProps();
    p.distanceIndicator = "bedWallThickness";
    render(<ThreeDSettings {...p} />);
    const helpIcon = screen.getAllByRole("tooltip")[0];
    fireEvent.click(helpIcon);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DISTANCE_INDICATOR,
      payload: "",
    });
  });

  it("creates env", () => {
    const p = fakeProps();
    render(<ThreeDSettings {...p} />);
    const input = screen.getByDisplayValue("40");
    changeBlurableInputRTL(input, "100");
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: namespace3D("bedWallThickness"),
      value: "100",
    });
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("edits env", () => {
    const p = fakeProps();
    const fakeEnv = fakeFarmwareEnv();
    fakeEnv.body.key = namespace3D("bedWallThickness");
    fakeEnv.body.value = "40";
    p.farmwareEnvs = [fakeEnv];
    render(<ThreeDSettings {...p} />);
    const input = screen.getByDisplayValue("40");
    changeBlurableInputRTL(input, "100");
    expect(initSave).not.toHaveBeenCalled();
    expect(edit).toHaveBeenCalledWith(fakeEnv, { value: "100" });
    expect(save).toHaveBeenCalledWith(fakeEnv.uuid);
  });

  it("toggles setting on", () => {
    render(<ThreeDSettings {...fakeProps()} />);
    const toggle = screen.getAllByText("no")[0];
    fireEvent.click(toggle);
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: namespace3D("bounds"),
      value: "1",
    });
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("toggles setting off", () => {
    const p = fakeProps();
    const fakeEnv = fakeFarmwareEnv();
    fakeEnv.body.key = namespace3D("grid");
    fakeEnv.body.value = "1";
    p.farmwareEnvs = [fakeEnv];
    render(<ThreeDSettings {...p} />);
    const toggle = screen.getByText("yes");
    fireEvent.click(toggle);
    expect(initSave).not.toHaveBeenCalled();
    expect(edit).toHaveBeenCalledWith(fakeEnv, { value: "0" });
    expect(save).toHaveBeenCalledWith(fakeEnv.uuid);
  });
});
