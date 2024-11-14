jest.mock("../../api/crud", () => ({
  initSave: jest.fn(),
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { namespace3D, ThreeDSettings } from "../three_d_settings";
import { ThreeDSettingsProps } from "../interfaces";
import { settingsPanelState } from "../../__test_support__/panel_state";
import { Actions } from "../../constants";
import { changeBlurableInput } from "../../__test_support__/helpers";
import { edit, initSave, save } from "../../api/crud";
import { fakeFarmwareEnv } from "../../__test_support__/fake_state/resources";

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
    const wrapper = mount(<ThreeDSettings {...p} />);
    wrapper.find(".help-icon").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DISTANCE_INDICATOR,
      payload: "bedWallThickness",
    });
  });

  it("toggles visual off", () => {
    const p = fakeProps();
    p.distanceIndicator = "bedWallThickness";
    const wrapper = mount(<ThreeDSettings {...p} />);
    wrapper.find(".help-icon").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DISTANCE_INDICATOR,
      payload: "",
    });
  });

  it("creates env", () => {
    const p = fakeProps();
    const wrapper = mount(<ThreeDSettings {...p} />);
    changeBlurableInput(wrapper, "100", 0);
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
    p.farmwareEnvs = [fakeEnv];
    const wrapper = mount(<ThreeDSettings {...p} />);
    changeBlurableInput(wrapper, "100", 0);
    expect(initSave).not.toHaveBeenCalled();
    expect(edit).toHaveBeenCalledWith(fakeEnv, { value: "100" });
    expect(save).toHaveBeenCalledWith(fakeEnv.uuid);
  });
});
