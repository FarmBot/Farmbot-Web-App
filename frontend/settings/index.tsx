import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { DesignerNavTabs, Panel } from "../farm_designer/panel_header";
import { MCUFactoryReset } from "../devices/actions";
import { FarmBotSettings } from "./fbos_settings/farmbot_os_settings";
import { PowerAndReset } from "./fbos_settings/power_and_reset";
import { PinBindings } from "./pin_bindings/pin_bindings";
import { validFirmwareHardware } from "./firmware/firmware_hardware_support";
import {
  AxisSettings, Motors, EncodersOrStallDetection, LimitSwitches,
  ErrorHandling, PinGuard, ParameterManagement, PinReporting, ShowAdvancedToggle,
} from "./hardware_settings";
import { getHighlightName, maybeOpenPanel } from "./maybe_highlight";
import { isBotOnlineFromState } from "../devices/must_be_online";
import { DesignerSettingsProps } from "./interfaces";
import { Designer } from "./farm_designer_settings";
import { SearchField } from "../ui/search_field";
import { mapStateToProps } from "./state_to_props";
import { Actions } from "../constants";
import { ExtraSettings } from "../farm_designer/map/easter_eggs/bugs";
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
import { getUrlQuery, urlFriendly } from "../util";
import { push } from "../history";
import { Popover } from "../ui";
import { Position } from "@blueprintjs/core";

export class RawDesignerSettings
  extends React.Component<DesignerSettingsProps, {}> {

  componentDidMount = () => this.props.dispatch(maybeOpenPanel());

  componentWillUnmount = () => {
    this.props.dispatch({
      type: Actions.SET_SETTINGS_SEARCH_TERM,
      payload: ""
    });
  };

  render() {
    const { getConfigValue, dispatch, firmwareConfig,
      sourceFwConfig, sourceFbosConfig, resources, settingsPanelState,
    } = this.props;
    const showAdvanced = !!getConfigValue(BooleanSetting.show_advanced_settings);
    const commonProps = { dispatch, settingsPanelState, showAdvanced };
    const { value } = this.props.sourceFbosConfig("firmware_hardware");
    const firmwareHardware = validFirmwareHardware(value);
    const botOnline = isBotOnlineFromState(this.props.bot);
    const { busy } = this.props.bot.hardware.informational_settings;
    const urlSearchTerm = (getUrlQuery("search") || "").replace(/_/g, " ");
    urlSearchTerm && this.props.searchTerm != urlSearchTerm && dispatch({
      type: Actions.SET_SETTINGS_SEARCH_TERM,
      payload: urlSearchTerm,
    });
    return <DesignerPanel panelName={"settings"} panel={Panel.Settings}>
      <DesignerNavTabs />
      <DesignerPanelTop panel={Panel.Settings} withButton={true}>
        <SearchField nameKey={"settings"}
          placeholder={t("Search settings...")}
          searchTerm={this.props.searchTerm}
          onChange={searchTerm => {
            getUrlQuery("search") && push(location.pathname);
            dispatch(bulkToggleControlPanel(searchTerm != ""));
            dispatch({
              type: Actions.SET_SETTINGS_SEARCH_TERM,
              payload: searchTerm,
            });
          }} />
        <Popover
          position={Position.BOTTOM}
          popoverClassName={"settings-panel-settings-menu"}
          target={<i className={"fa fa-gear fb-icon-button"} />}
          content={<ShowAdvancedToggle
            dispatch={dispatch}
            getConfigValue={getConfigValue} />} />
        <ToggleSettingsOpen dispatch={dispatch} panels={settingsPanelState} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"settings"}>
        {getUrlQuery("only") && !this.props.searchTerm &&
          <div className={"settings-warning-banner"}>
            <p>{t("showing single setting")}</p>
            <button className={"fb-button red"}
              onClick={() => location.assign(location.pathname)}>
              {t("cancel")}
            </button>
          </div>}
        <FarmBotSettings
          bot={this.props.bot}
          settingsPanelState={settingsPanelState}
          alerts={this.props.alerts}
          dispatch={this.props.dispatch}
          sourceFbosConfig={sourceFbosConfig}
          botOnline={botOnline}
          timeSettings={this.props.timeSettings}
          showAdvanced={showAdvanced}
          device={this.props.deviceAccount} />
        <PowerAndReset {...commonProps}
          botOnline={botOnline} />
        {botOnline && showAdvanced && <ChangeOwnershipForm />}
        <AxisSettings {...commonProps}
          bot={this.props.bot}
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
        {showByEveryTerm("pin reporting", this.props.searchTerm) &&
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
          dispatch={this.props.dispatch}
          farmwareEnvs={this.props.farmwareEnvs} />
        <Designer {...commonProps}
          getConfigValue={getConfigValue} />
        <AccountSettings {...commonProps}
          user={this.props.user}
          getConfigValue={getConfigValue} />
        <OtherSettings {...commonProps}
          searchTerm={this.props.searchTerm}
          getConfigValue={getConfigValue}
          sourceFbosConfig={sourceFbosConfig} />
        {showByTerm("setup", this.props.searchTerm) &&
          <SetupWizardSettings
            dispatch={this.props.dispatch}
            device={this.props.deviceAccount}
            wizardStepResults={this.props.wizardStepResults} />}
        {showByTerm("re-seed", this.props.searchTerm) &&
          <ReSeedAccount />}
        {showByTerm("interpolation", this.props.searchTerm) &&
          <InterpolationSettings
            dispatch={this.props.dispatch}
            farmwareEnvs={this.props.farmwareEnvs}
            saveFarmwareEnv={this.props.saveFarmwareEnv} />}
        {showByTerm("developer", this.props.searchTerm) &&
          <DevSettingsRows />}
        {ExtraSettings(this.props.searchTerm)}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

const showByTerm = (term: string, searchTerm: string) =>
  getUrlQuery("only") == term || searchTerm.toLowerCase() == term.toLowerCase();

export const showByEveryTerm = (term: string, searchTerm: string) =>
  searchTerm == term && getHighlightName() == urlFriendly(term).toLowerCase();

export const DesignerSettings = connect(mapStateToProps)(RawDesignerSettings);
