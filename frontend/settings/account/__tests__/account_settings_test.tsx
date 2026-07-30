let mockDev = false;
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import {
  AccountSettings, ActivityBeepSetting, ActivityBeepSettingProps,
  LandingPageSetting, LandingPageSettingProps,
} from "../account_settings";
import { AccountSettingsProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { fakeUser } from "../../../__test_support__/fake_state/resources";
import * as crud from "../../../api/crud";
import { success } from "../../../toast/toast";
import { Content } from "../../../constants";
import * as configStorageActions from "../../../config_storage/actions";
import { NumericSetting, StringSetting } from "../../../session_keys";
import * as requestAccountExportModule from "../request_account_export";
import * as devSupport from "../../../settings/dev/dev_support";
import * as ui from "../../../ui";
import { BIProps } from "../../../ui/blurable_input";
import { FBSelectProps } from "../../../ui/new_fb_select";

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let setWebAppConfigValueSpy: jest.SpyInstance;
let getWebAppConfigValueSpy: jest.SpyInstance;
let futureFeaturesEnabledSpy: jest.SpyInstance;
let blurableInputSpy: jest.SpyInstance;
let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  mockDev = false;
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
    .mockImplementation(jest.fn());
  getWebAppConfigValueSpy = jest.spyOn(configStorageActions, "getWebAppConfigValue")
    .mockImplementation(() => () => true);
  futureFeaturesEnabledSpy = jest.spyOn(devSupport.DevSettings, "futureFeaturesEnabled")
    .mockImplementation(() => mockDev);
  blurableInputSpy = jest.spyOn(ui, "BlurableInput")
    .mockImplementation(((props: BIProps) =>
      <input
        name={props.name}
        defaultValue={props.value}
        type={props.type}
        onBlur={e => props.onCommit(e)}
        onChange={() => { }} />) as never);
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((({ onChange, selectedItem }: FBSelectProps) =>
      <button className="mock-fb-select"
        onClick={() => onChange({ label: "Map", value: "map" })}>
        {selectedItem?.label}
      </button>) as never);
});

afterEach(() => {
  editSpy.mockRestore();
  saveSpy.mockRestore();
  setWebAppConfigValueSpy.mockRestore();
  getWebAppConfigValueSpy.mockRestore();
  futureFeaturesEnabledSpy.mockRestore();
  blurableInputSpy.mockRestore();
  fbSelectSpy.mockRestore();
});

describe("<AccountSettings />", () => {
  let requestAccountExportSpy: jest.SpyInstance;
  let confirmSpy: jest.SpyInstance;
  beforeEach(() => {
    requestAccountExportSpy = jest.spyOn(
      requestAccountExportModule, "requestAccountExport")
      .mockImplementation(jest.fn());
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    requestAccountExportSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  const fakeProps = (): AccountSettingsProps => ({
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    user: fakeUser(),
    getConfigValue: jest.fn(),
  });

  const commitField = (
    props: AccountSettingsProps, name: string, value: string,
  ) => {
    const { container } = render(<AccountSettings {...props} />);
    const input = container.querySelector(`input[name="${name}"]`);
    if (!input) { throw new Error(`Expected input for ${name}`); }
    fireEvent.blur(input, { currentTarget: { value }, target: { value } });
    return input;
  };

  it("changes name", () => {
    const p = fakeProps();
    p.user.body.name = "";
    p.settingsPanelState.account = true;
    commitField(p, "userName", "new name");
    expect(editSpy).toHaveBeenCalledWith(p.user, { name: "new name" });
    expect(saveSpy).toHaveBeenCalledWith(p.user.uuid);
  });

  it("changes email", async () => {
    const p = fakeProps();
    p.user.body.email = "old@example.com";
    p.settingsPanelState.account = true;
    p.dispatch = jest.fn(action => action);
    saveSpy.mockImplementation(() => Promise.resolve() as never);
    commitField(p, "email", "new@example.com");
    expect(confirmSpy).toHaveBeenCalledWith(
      "Change account email address from 'old@example.com' " +
      "to 'new@example.com'?");
    expect(editSpy).toHaveBeenCalledWith(
      p.user, { email: "new@example.com" });
    expect(saveSpy).toHaveBeenCalledWith(p.user.uuid);
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith(Content.CHECK_EMAIL_TO_CONFIRM));
  });

  it("rejects an invalid email", () => {
    const checkValidity = jest.spyOn(
      HTMLInputElement.prototype, "checkValidity").mockReturnValue(false);
    const reportValidity = jest.spyOn(
      HTMLInputElement.prototype, "reportValidity").mockReturnValue(false);
    const p = fakeProps();
    p.user.body.email = "old@example.com";
    p.settingsPanelState.account = true;
    const input = commitField(p, "email", "invalid");
    expect(input.getAttribute("type")).toEqual("email");
    expect(checkValidity).toHaveBeenCalled();
    expect(reportValidity).toHaveBeenCalled();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    checkValidity.mockRestore();
    reportValidity.mockRestore();
  });

  it("does not change email when confirmation is cancelled", () => {
    confirmSpy.mockReturnValue(false);
    const p = fakeProps();
    p.user.body.email = "old@example.com";
    p.settingsPanelState.account = true;
    commitField(p, "email", "new@example.com");
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("does not change an unchanged email", () => {
    const p = fakeProps();
    p.user.body.email = "same@example.com";
    p.settingsPanelState.account = true;
    commitField(p, "email", "same@example.com");
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("restores the email when saving fails", async () => {
    const p = fakeProps();
    p.user.body.email = "old@example.com";
    p.settingsPanelState.account = true;
    p.dispatch = jest.fn(action => action);
    saveSpy.mockImplementation(
      () => Promise.reject(new Error("save failed")) as never);
    commitField(p, "email", "new@example.com");
    await waitFor(() => {
      expect(editSpy).toHaveBeenLastCalledWith(
        p.user, { email: "old@example.com" });
    });
    expect(editSpy).toHaveBeenCalledTimes(2);
    expect(success).not.toHaveBeenCalled();
  });

  it("changes language", () => {
    const p = fakeProps();
    p.user.body.language = "";
    p.settingsPanelState.account = true;
    commitField(p, "language", "new language");
    expect(editSpy).toHaveBeenCalledWith(p.user, { language: "new language" });
    expect(saveSpy).toHaveBeenCalledWith(p.user.uuid);
  });

  it("requests export", () => {
    const p = fakeProps();
    p.settingsPanelState.account = true;
    const { container } = render(<AccountSettings {...p} />);
    const button = Array.from(container.querySelectorAll("button"))
      .find(el => el.textContent?.toLowerCase() == "export");
    if (!button) { throw new Error("Expected export button"); }
    fireEvent.click(button);
    expect(requestAccountExportModule.requestAccountExport).toHaveBeenCalled();
  });
});

describe("<ActivityBeepSetting />", () => {
  const fakeProps = (): ActivityBeepSettingProps => ({
    getConfigValue: () => 1,
    dispatch: jest.fn(),
  });

  const getActivityBeepChildren = (props: ActivityBeepSettingProps) => {
    const wrapper =
      ActivityBeepSetting(props) as React.ReactElement<{ children?: React.ReactNode }>;
    const row = wrapper.props.children as React.ReactElement<{ children?: React.ReactNode }>;
    return React.Children.toArray(row.props.children) as [
      React.ReactElement,
      React.ReactElement,
      React.ReactElement<{ toggleAction: (e: React.MouseEvent) => void }>,
      React.ReactElement<{ onChange: (value: number) => void }>,
    ];
  };

  it("sets setting: toggles off", () => {
    const children = getActivityBeepChildren(fakeProps());
    children[2]?.props.toggleAction({} as React.MouseEvent);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      NumericSetting.beep_verbosity, 0);
  });

  it("sets setting: toggles on", () => {
    const p = fakeProps();
    p.getConfigValue = () => 0;
    const children = getActivityBeepChildren(p);
    children[2]?.props.toggleAction({} as React.MouseEvent);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      NumericSetting.beep_verbosity, 1);
  });

  it("sets setting: slider", () => {
    const children = getActivityBeepChildren(fakeProps());
    children[3]?.props.onChange(2);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      NumericSetting.beep_verbosity, 2);
  });
});

describe("<LandingPageSetting />", () => {
  const fakeProps = (): LandingPageSettingProps => ({
    getConfigValue: () => "controls",
    dispatch: jest.fn(),
  });

  it("changes value", () => {
    const p = fakeProps();
    const { container } = render(<LandingPageSetting {...p} />);
    const button = container.querySelector(".mock-fb-select");
    if (!button) { throw new Error("Expected landing page select button"); }
    fireEvent.click(button);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      StringSetting.landing_page, "map");
  });

  it("changes value: developer", () => {
    mockDev = true;
    const p = fakeProps();
    const { container } = render(<LandingPageSetting {...p} />);
    const input = container.querySelector("input");
    if (!input) { throw new Error("Expected developer landing page input"); }
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.blur(input);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      StringSetting.landing_page, "x");
  });
});
