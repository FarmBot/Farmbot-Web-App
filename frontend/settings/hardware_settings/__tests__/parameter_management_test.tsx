import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  ParameterManagement, ParameterImport, ParameterImportProps,
} from "../parameter_management";
import { ParameterManagementProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { Content } from "../../../constants";
import * as exportMenu from "../export_menu";
import * as configStorageActions from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";
import * as ui from "../../../ui";
import * as toggleHighlightModified
  from "../../../photos/data_management/toggle_highlight_modified";
import { BIProps } from "../../../ui/blurable_input";
import { ToggleButtonProps } from "../../../ui/toggle_button";

let blurableInputSpy: jest.SpyInstance;
let toggleButtonSpy: jest.SpyInstance;
let toggleHighlightModifiedSpy: jest.SpyInstance;

beforeEach(() => {
  jest.spyOn(exportMenu, "importParameters")
    .mockImplementation(jest.fn());
  jest.spyOn(exportMenu, "resendParameters")
    .mockImplementation(jest.fn());
  jest.spyOn(exportMenu, "FwParamExportMenu")
    .mockImplementation(() => <div />);
  jest.spyOn(configStorageActions, "getWebAppConfigValue")
    .mockImplementation(() => () => false);
  jest.spyOn(configStorageActions, "setWebAppConfigValue")
    .mockImplementation(jest.fn());
  toggleHighlightModifiedSpy =
    jest.spyOn(toggleHighlightModified, "ToggleHighlightModified")
      .mockImplementation(() => <div />);
  blurableInputSpy = jest.spyOn(ui, "BlurableInput")
    .mockImplementation(((props: BIProps) =>
      <input
        value={props.value || ""}
        onChange={e => props.onCommit?.(e)} />) as never);
  toggleButtonSpy = jest.spyOn(ui, "ToggleButton")
    .mockImplementation(((props: ToggleButtonProps) =>
      <button data-testid="toggle-button" onClick={props.toggleAction} />) as never);
});

afterEach(() => {
  blurableInputSpy.mockRestore();
  toggleButtonSpy.mockRestore();
  toggleHighlightModifiedSpy.mockRestore();
});
describe("<ParameterManagement />", () => {
  const fakeProps = (): ParameterManagementProps => ({
    onReset: jest.fn(),
    firmwareConfig: undefined,
    botOnline: true,
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    firmwareHardware: undefined,
    arduinoBusy: false,
    getConfigValue: jest.fn(),
    showAdvanced: true,
  });

  it("renders", () => {
    const p = fakeProps();
    p.settingsPanelState.parameter_management = true;
    const { container } = render(<ParameterManagement {...p} />);
    expect((container.textContent || "").toLowerCase()).toContain("reset");
  });

  it("resends", () => {
    const p = fakeProps();
    p.settingsPanelState.parameter_management = true;
    render(<ParameterManagement {...p} />);
    fireEvent.click(screen.getByTitle("RESEND"));
    expect(exportMenu.resendParameters).toHaveBeenCalled();
  });

  it("imports", () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const p = fakeProps();
    p.settingsPanelState.parameter_management = true;
    render(<ParameterManagement {...p} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } });
    fireEvent.click(screen.getByTitle("IMPORT"));
    expect(confirm).toHaveBeenCalledWith(Content.PARAMETER_IMPORT_CONFIRM);
    expect(exportMenu.importParameters).toHaveBeenCalledWith("");
    confirmSpy.mockRestore();
  });

  it("toggles advanced settings", () => {
    const p = fakeProps();
    p.settingsPanelState.parameter_management = true;
    render(<ParameterManagement {...p} />);
    fireEvent.click(screen.getAllByTestId("toggle-button")[0]);
    expect(configStorageActions.setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.show_advanced_settings, true);
  });
});

describe("<ParameterImport />", () => {
  const fakeProps = (): ParameterImportProps => ({
    dispatch: jest.fn(),
    arduinoBusy: false,
  });

  it("updates", () => {
    render(<ParameterImport {...fakeProps()} />);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toEqual("");
    fireEvent.change(input, { target: { value: "{}" } });
    expect(input.value).toEqual("{}");
  });
});
