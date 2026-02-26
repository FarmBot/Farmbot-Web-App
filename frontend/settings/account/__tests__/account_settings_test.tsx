let mockDev = false;
import React from "react";
import { fireEvent, render } from "@testing-library/react";
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
    .mockImplementation((props: {
      name?: string,
      value?: string | number,
      type?: string,
      onCommit: (event: React.FormEvent<HTMLInputElement>) => void,
    }) =>
      <input
        name={props.name}
        defaultValue={props.value as string | undefined}
        type={props.type}
        onBlur={e => props.onCommit(e)}
        onChange={() => { }} />);
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation(({ onChange, selectedItem }: {
      onChange: (item: { label: string, value: string }) => void,
      selectedItem: { label: string } | undefined,
    }) =>
      <button className="mock-fb-select"
        onClick={() => onChange({ label: "Map", value: "map" })}>
        {selectedItem?.label}
      </button>);
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
  beforeEach(() => {
    requestAccountExportSpy = jest.spyOn(
      requestAccountExportModule, "requestAccountExport")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    requestAccountExportSpy.mockRestore();
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
  };

  it("changes name", () => {
    const p = fakeProps();
    p.user.body.name = "";
    p.settingsPanelState.account = true;
    commitField(p, "userName", "new name");
    expect(editSpy).toHaveBeenCalledWith(p.user, { name: "new name" });
    expect(saveSpy).toHaveBeenCalledWith(p.user.uuid);
  });

  it("changes email", () => {
    const p = fakeProps();
    p.user.body.email = "";
    p.settingsPanelState.account = true;
    commitField(p, "email", "new email");
    expect(editSpy).toHaveBeenCalledWith(p.user, { email: "new email" });
    expect(saveSpy).toHaveBeenCalledWith(p.user.uuid);
    expect(success).toHaveBeenCalledWith(Content.CHECK_EMAIL_TO_CONFIRM);
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
    return React.Children.toArray(row.props.children) as JSX.Element[];
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
