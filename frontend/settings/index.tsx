import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { MCUFactoryReset } from "../devices/actions";
import { FarmBotSettings } from "./fbos_settings/farmbot_os_settings";
import { PowerAndReset } from "./fbos_settings/power_and_reset";
import { PinBindings } from "./pin_bindings/pin_bindings";
import { validFirmwareHardware } from "./firmware/firmware_hardware_support";
import {
  AxisSettings, Motors, EncodersOrStallDetection, LimitSwitches,
  ErrorHandling, PinGuard, ParameterManagement, PinReporting, ShowAdvancedToggle,
} from "./hardware_settings";
import { maybeOpenPanel } from "./maybe_highlight";
import { isBotOnlineFromState } from "../devices/must_be_online";
import { DesignerSettingsProps } from "./interfaces";
import { Designer } from "./farm_designer_settings";
import { SearchField } from "../ui/search_field";
import { mapStateToProps } from "./state_to_props";
import { Actions } from "../constants";
import { BugsSettings } from "../farm_designer/map/easter_eggs/bugs";
import { OtherSettings } from "./other_settings";
import { CustomSettings } from "./custom_settings";
import { AccountSettings } from "./account/account_settings";
import { DevSettingsRows } from "./dev/dev_settings";
import { bulkToggleControlPanel, ToggleSettingsOpen } from "./toggle_section";
import { BooleanSetting } from "../session_keys";
import { ChangeOwnershipForm } from "./transfer_ownership/change_ownership_form";
import { SetupWizardSettings } from "../wizard/settings";
import { ReSeedAccount } from "../messages/cards";
import {
  InterpolationSettings,
} from "../farm_designer/map/layers/points/interpolation_map";
import { getUrlQuery } from "../util";
import { Popover } from "../ui";
import { Position } from "@blueprintjs/core";
import { ThreeDSettings } from "./three_d_settings";
import { useLocation, useNavigate } from "react-router";

export const RawDesignerSettings = (props: DesignerSettingsProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    getConfigValue, dispatch, firmwareConfig,
    sourceFwConfig, sourceFbosConfig, resources, settingsPanelState,
  } = props;

  React.useEffect(() => {
    dispatch(maybeOpenPanel());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const showAdvanced = !!getConfigValue(BooleanSetting.show_advanced_settings);
  const commonProps = { dispatch, settingsPanelState, showAdvanced };
  const { value } = sourceFbosConfig("firmware_hardware");
  const firmwareHardware = validFirmwareHardware(value);
  const botOnline = isBotOnlineFromState(props.bot);
  const { busy } = props.bot.hardware.informational_settings;
  const urlSearchTerm = (getUrlQuery("search") || "").replace(/_/g, " ");
  urlSearchTerm && props.searchTerm != urlSearchTerm && dispatch({
    type: Actions.SET_SETTINGS_SEARCH_TERM,
    payload: urlSearchTerm,
  });
  return <DesignerPanel panelName={"settings"} panel={Panel.Settings}>
    <DesignerPanelTop panel={Panel.Settings} withButton={true}>
      <SearchField nameKey={"settings"}
        placeholder={t("Search settings...")}
        searchTerm={props.searchTerm}
        onChange={searchTerm => {
          getUrlQuery("search") && navigate(location.pathname);
          dispatch(bulkToggleControlPanel(searchTerm != ""));
          dispatch({
            type: Actions.SET_SETTINGS_SEARCH_TERM,
            payload: searchTerm,
          });
        }} />
      <div className="row no-gap">
        <Popover
          position={Position.BOTTOM}
          popoverClassName={"settings-panel-settings-menu"}
          target={<i className={"fa fa-gear fb-icon-button invert"} />}
          content={<ShowAdvancedToggle
            dispatch={dispatch}
            getConfigValue={getConfigValue} />} />
        <ToggleSettingsOpen dispatch={dispatch} panels={settingsPanelState} />
      </div>
    </DesignerPanelTop>
    <DesignerPanelContent panelName={"settings"}>
      {getUrlQuery("only") && !props.searchTerm &&
        <div className={"settings-warning-banner"}>
          <p>{t("showing single setting")}</p>
          <button className={"fb-button red"}
            onClick={() => { navigate(location.pathname); }}>
            {t("cancel")}
          </button>
        </div>}
      <FarmBotSettings
        bot={props.bot}
        settingsPanelState={settingsPanelState}
        alerts={props.alerts}
        dispatch={dispatch}
        sourceFbosConfig={sourceFbosConfig}
        botOnline={botOnline}
        timeSettings={props.timeSettings}
        farmwareEnvs={props.farmwareEnvs}
        showAdvanced={showAdvanced}
        device={props.deviceAccount} />
      <PowerAndReset {...commonProps}
        botOnline={botOnline} />
      {botOnline && showAdvanced && <ChangeOwnershipForm />}
      <AxisSettings {...commonProps}
        bot={props.bot}
        sourceFwConfig={sourceFwConfig}
        sourceFbosConfig={sourceFbosConfig}
        firmwareConfig={firmwareConfig}
        firmwareHardware={firmwareHardware}
        botOnline={botOnline} />
      <Motors {...commonProps}
        arduinoBusy={busy}
        sourceFwConfig={sourceFwConfig}
        firmwareHardware={firmwareHardware} />
      <EncodersOrStallDetection {...commonProps}
        arduinoBusy={busy}
        sourceFwConfig={sourceFwConfig}
        firmwareHardware={firmwareHardware} />
      <LimitSwitches {...commonProps}
        arduinoBusy={busy}
        firmwareHardware={firmwareHardware}
        sourceFwConfig={sourceFwConfig} />
      <ErrorHandling {...commonProps}
        arduinoBusy={busy}
        firmwareHardware={firmwareHardware}
        sourceFwConfig={sourceFwConfig} />
      <PinBindings {...commonProps}
        resources={resources}
        firmwareHardware={firmwareHardware} />
      <PinGuard {...commonProps}
        arduinoBusy={busy}
        resources={resources}
        firmwareHardware={firmwareHardware}
        sourceFwConfig={sourceFwConfig} />
      {showByTerm("pin reporting", props.searchTerm) &&
        <PinReporting {...commonProps}
          arduinoBusy={busy}
          resources={resources}
          firmwareHardware={firmwareHardware}
          sourceFwConfig={sourceFwConfig} />}
      <ParameterManagement {...commonProps}
        arduinoBusy={busy}
        sourceFwConfig={sourceFwConfig}
        firmwareConfig={firmwareConfig}
        firmwareHardware={firmwareHardware}
        getConfigValue={getConfigValue}
        onReset={MCUFactoryReset}
        botOnline={botOnline} />
      <CustomSettings {...commonProps}
        dispatch={dispatch}
        farmwareEnvs={props.farmwareEnvs} />
      <Designer {...commonProps}
        getConfigValue={getConfigValue}
        firmwareConfig={props.firmwareConfig} />
      <ThreeDSettings {...commonProps}
        distanceIndicator={props.distanceIndicator}
        farmwareEnvs={props.farmwareEnvs} />
      <AccountSettings {...commonProps}
        user={props.user}
        getConfigValue={getConfigValue} />
      <OtherSettings {...commonProps}
        searchTerm={props.searchTerm}
        getConfigValue={getConfigValue}
        sourceFbosConfig={sourceFbosConfig} />
      {showByTerm("setup", props.searchTerm) &&
        <SetupWizardSettings
          dispatch={dispatch}
          device={props.deviceAccount}
          wizardStepResults={props.wizardStepResults} />}
      {showByTerm("re-seed", props.searchTerm) &&
        <ReSeedAccount />}
      {showByTerm("interpolation", props.searchTerm) &&
        <InterpolationSettings
          dispatch={dispatch}
          farmwareEnvs={props.farmwareEnvs}
          saveFarmwareEnv={props.saveFarmwareEnv} />}
      {showByTerm("developer", props.searchTerm) &&
        <DevSettingsRows />}
      {showByEveryTerm("surprise", props.searchTerm) &&
        <BugsSettings />}
    </DesignerPanelContent>
  </DesignerPanel>;
};

const searchTermMatch = (term: string, searchTerm: string) =>
  searchTerm.toLowerCase() == term.toLowerCase();
const queryMatch = (term: string) => getUrlQuery("only") == term;

const showByTerm = (term: string, searchTerm: string) =>
  queryMatch(term) || searchTermMatch(term, searchTerm);

const showByEveryTerm = (term: string, searchTerm: string) =>
  queryMatch(term) && searchTermMatch(term, searchTerm);

export const DesignerSettings = connect(mapStateToProps)(RawDesignerSettings);
// eslint-disable-next-line import/no-default-export
export default DesignerSettings;
