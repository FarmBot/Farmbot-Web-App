import React from "react";
import { ParameterManagementProps, ShowAdvancedToggleProps } from "./interfaces";
import { Row, BlurableInput, Help, ToggleButton, Popover } from "../../ui";
import { Header } from "./header";
import { Collapse, Position } from "@blueprintjs/core";
import { Content, DeviceSetting, ToolTips } from "../../constants";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { SettingLoadProgress } from "./setting_load_progress";
import {
  FwParamExportMenu, importParameters, resendParameters,
} from "./export_menu";
import {
  ToggleHighlightModified,
} from "../../photos/data_management/toggle_highlight_modified";
import { BooleanSetting } from "../../session_keys";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { getModifiedClassName } from "../default_values";

export const ParameterManagement = (props: ParameterManagementProps) => {
  const {
    dispatch, onReset, botOnline, arduinoBusy, firmwareHardware,
    getConfigValue, showAdvanced,
  } = props;
  const { parameter_management } = props.settingsPanelState;
  return <Highlight className={"section advanced"}
    settingName={DeviceSetting.parameterManagement}
    hidden={!showAdvanced}>
    <Header
      expanded={parameter_management}
      title={DeviceSetting.parameterManagement}
      panel={"parameter_management"}
      dispatch={dispatch} />
    <Collapse isOpen={!!parameter_management}>
      <Highlight settingName={DeviceSetting.paramLoadProgress}>
        <Row>
          <div>
            <label style={{ lineHeight: "1.5rem", display: "inline" }}>
              {t(DeviceSetting.paramLoadProgress)}
            </label>
            <Help text={ToolTips.PARAMETER_LOAD_PROGRESS} />
          </div>
          <SettingLoadProgress botOnline={botOnline}
            firmwareHardware={firmwareHardware}
            firmwareConfig={props.firmwareConfig}
            sourceFwConfig={props.sourceFwConfig} />
        </Row>
      </Highlight>
      <Highlight settingName={DeviceSetting.paramResend}>
        <Row className="grid-exp-1">
          <label style={{ lineHeight: "1.5rem" }}>
            {t(DeviceSetting.paramResend)}
          </label>
          <button
            className="fb-button yellow"
            disabled={arduinoBusy || !botOnline}
            title={t("RESEND")}
            onClick={() => dispatch(resendParameters())}>
            {t("RESEND")}
          </button>
        </Row>
      </Highlight>
      <Highlight settingName={DeviceSetting.exportParameters}>
        <Row className="grid-exp-1">
          <label style={{ lineHeight: "1.5rem" }}>
            {t(DeviceSetting.exportParameters)}
          </label>
          <Popover position={Position.BOTTOM_RIGHT}
            target={<i className="fa fa-download" />}
            content={
              <FwParamExportMenu firmwareConfig={props.firmwareConfig} />} />
        </Row>
      </Highlight>
      <ParameterImport dispatch={dispatch} arduinoBusy={arduinoBusy} />
      <Highlight settingName={DeviceSetting.highlightModifiedSettings}>
        <ToggleHighlightModified
          dispatch={dispatch}
          getConfigValue={getConfigValue} />
      </Highlight>
      <Highlight settingName={DeviceSetting.showAdvancedSettings}>
        <ShowAdvancedToggle dispatch={dispatch} getConfigValue={getConfigValue} />
      </Highlight>
      <Highlight settingName={DeviceSetting.resetHardwareParams}>
        <Row className="grid-exp-1">
          <div>
            <label style={{ lineHeight: "1.5rem" }}>
              {t(DeviceSetting.resetHardwareParams)}
            </label>
            <Help text={Content.RESTORE_DEFAULT_HARDWARE_SETTINGS} />
          </div>
          <button
            className="fb-button red"
            disabled={arduinoBusy || !botOnline}
            title={t("RESET")}
            onClick={onReset}>
            {t("RESET")}
          </button>
        </Row>
      </Highlight>
    </Collapse>
  </Highlight>;
};

export interface ParameterImportProps {
  dispatch: Function;
  arduinoBusy: boolean;
}

interface ParameterImportState {
  input: string;
}

export class ParameterImport
  extends React.Component<ParameterImportProps, ParameterImportState> {
  state: ParameterImportState = { input: "" };
  render() {
    return <Highlight settingName={DeviceSetting.importParameters}>
      <Row className="grid-exp-2">
        <div>
          <label>
            {t(DeviceSetting.importParameters)}
          </label>
          <Help text={ToolTips.PARAMETER_IMPORT} />
        </div>
        <BlurableInput value={this.state.input} onCommit={e =>
          this.setState({ input: e.currentTarget.value })} />
        <button
          className="fb-button yellow"
          disabled={this.props.arduinoBusy}
          title={t("IMPORT")}
          onClick={() => confirm(Content.PARAMETER_IMPORT_CONFIRM) &&
            this.props.dispatch(importParameters(this.state.input))}>
          {t("IMPORT")}
        </button>
      </Row>
    </Highlight>;
  }
}

export const ShowAdvancedToggle = (props: ShowAdvancedToggleProps) => {
  const showAdvanced = !!props.getConfigValue(
    BooleanSetting.show_advanced_settings);
  return <div className={"row grid-exp-1"}>
    <label>{t(DeviceSetting.showAdvancedSettings)}</label>
    <ToggleButton
      className={getModifiedClassName(BooleanSetting.show_advanced_settings)}
      toggleValue={!!showAdvanced}
      toggleAction={() => props.dispatch(setWebAppConfigValue(
        BooleanSetting.show_advanced_settings,
        !showAdvanced))} />
  </div>;
};
