jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(),
  getWebAppConfigValue: () => () => true,
}));

import React from "react";
import { shallow } from "enzyme";
import {
  AccountSettings, ActivityBeepSetting, ActivityBeepSettingProps,
} from "../account_settings";
import { AccountSettingsProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { fakeUser } from "../../../__test_support__/fake_state/resources";
import { edit, save } from "../../../api/crud";
import { success } from "../../../toast/toast";
import { Content } from "../../../constants";
import { setWebAppConfigValue } from "../../../config_storage/actions";
import { NumericSetting } from "../../../session_keys";
import { Slider } from "@blueprintjs/core";
import { ToggleButton } from "../../../ui";

describe("<AccountSettings />", () => {
  const fakeProps = (): AccountSettingsProps => ({
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    user: fakeUser(),
    getConfigValue: jest.fn(),
  });

  it("changes name", () => {
    const p = fakeProps();
    p.user.body.name = "";
    const wrapper = shallow(<AccountSettings {...p} />);
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "new name" }
    });
    expect(edit).toHaveBeenCalledWith(p.user, { name: "new name" });
    expect(save).toHaveBeenCalledWith(p.user.uuid);
  });

  it("changes email", () => {
    const p = fakeProps();
    p.user.body.email = "";
    const wrapper = shallow(<AccountSettings {...p} />);
    wrapper.find("BlurableInput").at(1).simulate("commit", {
      currentTarget: { value: "new email" }
    });
    expect(edit).toHaveBeenCalledWith(p.user, { email: "new email" });
    expect(save).toHaveBeenCalledWith(p.user.uuid);
    expect(success).toHaveBeenCalledWith(Content.CHECK_EMAIL_TO_CONFIRM);
  });
});

describe("<ActivityBeepSetting />", () => {
  const fakeProps = (): ActivityBeepSettingProps => ({
    getConfigValue: () => 1,
    dispatch: jest.fn(),
  });

  it("sets setting: toggles off", () => {
    const wrapper = shallow(<ActivityBeepSetting {...fakeProps()} />);
    wrapper.find(ToggleButton).props().toggleAction({} as React.MouseEvent);
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.beep_verbosity, 0);
  });

  it("sets setting: toggles on", () => {
    const p = fakeProps();
    p.getConfigValue = () => 0;
    const wrapper = shallow(<ActivityBeepSetting {...p} />);
    wrapper.find(ToggleButton).props().toggleAction({} as React.MouseEvent);
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.beep_verbosity, 1);
  });

  it("sets setting: slider", () => {
    const wrapper = shallow(<ActivityBeepSetting {...fakeProps()} />);
    wrapper.find(Slider).simulate("change", 2);
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.beep_verbosity, 2);
  });
});
